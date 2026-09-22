/**
 * MOCK auth layer — localStorage-backed, client-side only.
 *
 * The real thing (JWT + Roles, per PRD Section 9 / Sprint 1 backend
 * deliverable "Auth API Endpoints") isn't live yet, so this stands in for it
 * so the Auth screens (Sprint 1 frontend deliverable) are actually usable
 * end-to-end. Everything in this file should be deleted and replaced by
 * calls to lib/api-client.ts once the backend Auth contract ships — nothing
 * here is secure and none of it should reach production.
 */
import type { GuardianConsent, User, UserRole } from "@/lib/types";

const USERS_KEY = "jh_mock_users";
const CONSENTS_KEY = "jh_mock_consents";
const SESSION_COOKIE = "jh_session";

interface StoredUser extends User {
  // mock-only, never store real passwords like this
  password: string;
}

function readStore<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(key) ?? "[]") as T[];
  } catch {
    return [];
  }
}

function writeStore<T>(key: string, value: T[]) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

type Listener = () => void;
const listeners = new Set<Listener>();

/** For useSyncExternalStore — call after any mutation consumers should react to. */
export function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emitChange() {
  listeners.forEach((listener) => listener());
}

function setSessionCookie(user: Pick<User, "id" | "role"> | null) {
  if (typeof document === "undefined") return;
  if (!user) {
    document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`;
    return;
  }
  const value = encodeURIComponent(JSON.stringify({ id: user.id, role: user.role }));
  // Not httpOnly / not signed — mock only. Real auth must use a secure,
  // server-set httpOnly cookie or bearer token from the backend.
  document.cookie = `${SESSION_COOKIE}=${value}; path=/; max-age=${60 * 60 * 24 * 7}`;
}

export interface RegisterLearnerInput {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  age: number;
  guardianEmail: string;
}

/** Creates the learner account (inactive) + a pending guardian consent request. */
export function registerLearner(input: RegisterLearnerInput): { userId: string; consentId: string } {
  const users = readStore<StoredUser>(USERS_KEY);
  if (users.some((u) => u.email === input.email)) {
    throw new Error("في حساب مسجل بالفعل بنفس الإيميل ده.");
  }

  const learnerId = crypto.randomUUID();
  const guardianId = crypto.randomUUID();

  const learner: StoredUser = {
    id: learnerId,
    role: "learner",
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    password: input.password,
    age: input.age,
    guardianId,
    createdAt: new Date().toISOString(),
  };

  const guardian: StoredUser = {
    id: guardianId,
    role: "guardian",
    firstName: "Guardian of " + input.firstName,
    email: input.guardianEmail,
    password: "",
    createdAt: new Date().toISOString(),
  };

  writeStore(USERS_KEY, [...users, learner, guardian]);

  const consents = readStore<GuardianConsent>(CONSENTS_KEY);
  const consent: GuardianConsent = {
    id: crypto.randomUUID(),
    guardianId,
    learnerId,
    consentType: "account",
    status: "pending",
    timestamp: new Date().toISOString(),
  };
  writeStore(CONSENTS_KEY, [...consents, consent]);
  emitChange();

  return { userId: learnerId, consentId: consent.id };
}

export function getPendingConsentsForGuardianEmail(guardianEmail: string) {
  const users = readStore<StoredUser>(USERS_KEY);
  const guardian = users.find((u) => u.role === "guardian" && u.email === guardianEmail);
  if (!guardian) return [];

  const consents = readStore<GuardianConsent>(CONSENTS_KEY);
  return consents
    .filter((c) => c.guardianId === guardian.id && c.status === "pending")
    .map((c) => ({
      consent: c,
      learner: users.find((u) => u.id === c.learnerId),
    }));
}

export function decideConsent(consentId: string, decision: "granted" | "revoked") {
  const consents = readStore<GuardianConsent>(CONSENTS_KEY);
  const updated = consents.map((c) => (c.id === consentId ? { ...c, status: decision, timestamp: new Date().toISOString() } : c));
  writeStore(CONSENTS_KEY, updated);
  emitChange();
}

/** Real auth will check a password hash server-side; this mock only looks up by email. */
export function login(email: string, password: string): User {
  void password;
  const users = readStore<StoredUser>(USERS_KEY);
  const user = users.find((u) => u.email === email);
  if (!user) {
    throw new Error("الإيميل أو الباسورد غلط.");
  }
  const { password: userPassword, ...publicUser } = user;
  void userPassword;
  setSessionCookie(publicUser);
  if (typeof window !== "undefined") {
    window.localStorage.setItem("jh_current_user", JSON.stringify(publicUser));
  }
  emitChange();
  return publicUser;
}

export function logout() {
  setSessionCookie(null);
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("jh_current_user");
  }
  emitChange();
}

const CURRENT_USER_KEY = "jh_current_user";
let cachedUserRaw: string | null = null;
let cachedUser: User | null = null;

/** Stable-reference snapshot getter for useSyncExternalStore — only re-parses when the stored value actually changed. */
export function getCurrentUserSnapshot(): User | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(CURRENT_USER_KEY);
  if (raw !== cachedUserRaw) {
    cachedUserRaw = raw;
    cachedUser = raw ? (JSON.parse(raw) as User) : null;
  }
  return cachedUser;
}

export function getServerUserSnapshot(): User | null {
  return null;
}

/** Seeds one demo account per role so every dashboard is reachable without registering first. */
export function seedDemoUsers() {
  const users = readStore<StoredUser>(USERS_KEY);
  if (users.length > 0) return;

  const demoRoles: UserRole[] = ["learner", "guardian", "mentor", "admin"];
  const seeded: StoredUser[] = demoRoles.map((role) => ({
    id: crypto.randomUUID(),
    role,
    firstName: role.charAt(0).toUpperCase() + role.slice(1),
    email: `demo-${role}@juniorhub.dev`,
    password: "demo",
    createdAt: new Date().toISOString(),
  }));
  writeStore(USERS_KEY, seeded);
  emitChange();
}

export interface DemoCredential {
  role: UserRole;
  email: string;
  password: string;
}

const EMPTY_CREDENTIALS: DemoCredential[] = [];
let cachedUsersRaw: string | null = null;
let cachedCredentials: DemoCredential[] = EMPTY_CREDENTIALS;

/** Stable-reference snapshot getter for useSyncExternalStore. */
export function getDemoCredentialsSnapshot(): DemoCredential[] {
  if (typeof window === "undefined") return EMPTY_CREDENTIALS;
  const raw = window.localStorage.getItem(USERS_KEY);
  if (raw !== cachedUsersRaw) {
    cachedUsersRaw = raw;
    const users = raw ? (JSON.parse(raw) as StoredUser[]) : [];
    cachedCredentials = users.map((u) => ({ role: u.role, email: u.email, password: u.password }));
  }
  return cachedCredentials;
}

export function getServerCredentialsSnapshot(): DemoCredential[] {
  return EMPTY_CREDENTIALS;
}
