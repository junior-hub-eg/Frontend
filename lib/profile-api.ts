import { api } from "@/lib/api-client";
import type { Gender } from "@/lib/avatars";

/** GET /api/v1/me: the student's profile from the school and their progress. */
export interface Me {
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
  gender: Gender | null;
}

export const getMe = () => api.get<Me>("/api/v1/me");

/** Other devices are signed out; this one stays signed in. 400 CURRENT_PASSWORD_WRONG or SAME_PASSWORD. */
export const changePassword = (currentPassword: string, newPassword: string, confirmPassword: string) =>
  api.put<void>("/api/v1/me/password", { currentPassword, newPassword, confirmPassword });
