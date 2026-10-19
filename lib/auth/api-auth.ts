/**
 * Real auth — the .NET backend's /api/v1/auth and /api/v1/me (JH-SRS §5.2).
 * The backend only has a Student role, so every signed-in user maps to role "learner" here.
 */
import { api, refreshAccessToken } from "@/lib/api-client";
import { getToken, setToken, TOKEN_CHANGE_EVENT } from "@/lib/auth/token";
import type { User } from "@/lib/types";

const CURRENT_USER_KEY = "jh_api_user";

type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribe(listener: Listener) {
  listeners.add(listener);
  window.addEventListener(TOKEN_CHANGE_EVENT, listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener(TOKEN_CHANGE_EVENT, listener);
  };
}

function emitChange() {
  listeners.forEach((listener) => listener());
}

/** POST /api/v1/auth/login (JH-SRS §5.3). */
interface LoginResponse {
  accessToken: string;
  expiresIn: number;
  student: { id: string; firstName: string; grade: number | null; className: string | null };
}

/** GET /api/v1/me. School, grade and class are empty for a student who registered alone. */
interface MeResponse {
  id: string;
  fullName: string;
  firstName: string;
  email: string;
  school: { id: string; name: string } | null;
  grade: number | null;
  className: string | null;
  photoUrl: string | null;
  totalXp: number;
  streakDays: number;
}

function toUser(me: MeResponse): User {
  const lastName = me.fullName.split(/\s+/).slice(1).join(" ");
  return {
    id: me.id,
    role: "learner",
    firstName: me.firstName,
    lastName: lastName || undefined,
    email: me.email,
    photoUrl: me.photoUrl,
    createdAt: new Date().toISOString(),
  };
}

function storeUser(user: User) {
  window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  emitChange();
}

async function loadProfile(): Promise<User> {
  const user = toUser(await api.get<MeResponse>("/api/v1/me"));
  storeUser(user);
  return user;
}

/** Reloads the profile (for example the avatar) for a session that is already signed in. */
export async function refreshProfile(): Promise<User | null> {
  if (typeof window === "undefined" || !getToken()) return null;
  try {
    return await loadProfile();
  } catch {
    return null;
  }
}

/** Saves one of the catalogue avatars (lib/avatars.ts) and updates the cached profile. */
export async function changeAvatar(avatarKey: string): Promise<User> {
  const user = toUser(await api.put<MeResponse>("/api/v1/me/avatar", { avatar: avatarKey }));
  storeUser(user);
  return user;
}

/** Signs in, stores the JWT, and caches the profile for useAuth(). With rememberMe the backend also sets the refresh cookie. */
export async function login(email: string, password: string, rememberMe = false): Promise<User> {
  const res = await api.post<LoginResponse>("/api/v1/auth/login", { email, password, rememberMe });
  setToken(res.accessToken);
  try {
    return await loadProfile();
  } catch {
    // /me failed — fall back to what the login response carried.
    const user: User = {
      id: res.student.id,
      role: "learner",
      firstName: res.student.firstName,
      email: email.trim().toLowerCase(),
      createdAt: new Date().toISOString(),
    };
    window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    emitChange();
    return user;
  }
}

/**
 * On page load without an access token: a "Remember me" refresh cookie may still sign the student in.
 * Returns the user, or null when there is no session to restore.
 */
export async function restoreSession(): Promise<User | null> {
  if (typeof window === "undefined" || getToken()) return null;
  if (!(await refreshAccessToken())) return null;
  try {
    return await loadProfile();
  } catch {
    return null;
  }
}

/** Revokes the refresh cookie on the server (best effort) and clears the local session. */
export function logout() {
  void api.post("/api/v1/auth/logout").catch(() => {});
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
  // No token (never logged in, logged out, or expired) means no session, even if a
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
