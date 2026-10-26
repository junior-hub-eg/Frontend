/** Joining a class from a teacher's invite link (/join/{code}, 26 Oct 2026). */
import { api } from "@/lib/api-client";

export interface StudentClass {
  id: string;
  grade: number;
  name: string;
  schoolName: string;
  status: "Pending" | "Active" | "Removed";
}

export const joinClass = (code: string) => api.post<StudentClass>("/api/v1/student/classes/join", { code });

const KEY = "jh_pending_join";

/** Kept while the student signs in or creates an account, so they come back to the invite. */
export function rememberJoin(code: string) {
  try {
    localStorage.setItem(KEY, code);
  } catch {
    // private mode: the student opens the link again after signing in
  }
}

/** The invite waiting after sign-in, once. */
export function takePendingJoin(): string | null {
  try {
    const code = localStorage.getItem(KEY);
    localStorage.removeItem(KEY);
    return code && /^[A-Z0-9]{4,10}$/i.test(code) ? code : null;
  } catch {
    return null;
  }
}
