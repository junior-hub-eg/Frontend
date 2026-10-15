/**
 * Real auth — talks to the live .NET backend (NEXT_PUBLIC_API_URL).
 * The backend only has a Student role (demo pivot, see JH-SRS), so every
 * logged-in user maps to role "learner" here.
 *
 * Register / OTP / guardian-consent still run on lib/auth/mock-auth.ts — the
 * backend doesn't expose those endpoints yet. Only sign-in goes through here.
 */
import { api } from "@/lib/api-client";
import { getToken, setToken } from "@/lib/auth/token";
import type { User } from "@/lib/types";

const CURRENT_USER_KEY = "jh_api_user";

type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emitChange() {
  listeners.forEach((listener) => listener());
}

interface LoginResponse {
  token?: string;
  accessToken?: string;
  jwt?: string;
  user?: Record<string, unknown>;
  student?: Record<string, unknown>;
  [key: string]: unknown;
}

function mapToUser(raw: Record<string, unknown>): User {
  return {
    id: String(raw.id ?? raw.studentId ?? raw.userId ?? ""),
    role: "learner",
    firstName: String(raw.firstName ?? raw.name ?? raw.fullName ?? "Student"),
    lastName: raw.lastName ? String(raw.lastName) : undefined,
    email: String(raw.email ?? ""),
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
  };
}

/** Signs in against the real backend, stores the JWT, and caches the profile for useAuth(). */
export async function login(email: string, password: string, rememberMe = false): Promise<User> {
  const res = await api.post<LoginResponse>("/api/auth/login", { email, password, rememberMe });
  const token = res.token ?? res.accessToken ?? res.jwt;
  if (!token) {
    throw new Error("Login succeeded but the server did not return a token.");
  }
  setToken(token);

  let profile: Record<string, unknown> = (res.user ?? res.student ?? res) as Record<string, unknown>;
  try {
    profile = (await api.get<Record<string, unknown>>("/api/auth/me")) ?? profile;
  } catch {
    // /me failed — fall back to whatever the login response carried.
  }

  const user = mapToUser(profile);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }
  emitChange();
  return user;
}

export function logout() {
  setToken(null);
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(CURRENT_USER_KEY);
  }
  emitChange();
}

let cachedRaw: string | null = null;
let cachedUser: User | null = null;

/** Stable-reference snapshot getter for useSyncExternalStore. */
export function getCurrentUserSnapshot(): User | null {
  if (typeof window === "undefined") return null;
  // No token (never logged in, or logged out) means no session, even if a
  // stale cached profile is still sitting in localStorage.
  if (!getToken()) return null;
  const raw = window.localStorage.getItem(CURRENT_USER_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedUser = raw ? (JSON.parse(raw) as User) : null;
  }
  return cachedUser;
}

export function getServerUserSnapshot(): User | null {
  return null;
}
