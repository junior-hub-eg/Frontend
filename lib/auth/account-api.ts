/**
 * Account pages without a session: school activation, self sign-up and forgot password
 * (backend AuthController, /api/v1/auth). Errors are thrown as ApiError with the backend's code.
 */
import { api } from "@/lib/api-client";
import type { Gender } from "@/lib/avatars";

/** The code typed by the student or the link from the school: send one of the two. */
export type ActivationKey = { code: string } | { link: string };

export interface ActivationDetails {
  fullName: string;
  email: string;
  school: string;
  grade: number;
  className: string;
}

export const checkActivation = (key: ActivationKey) =>
  api.post<ActivationDetails>("/api/v1/auth/activation/check", key);

export const completeActivation = (key: ActivationKey, password: string, confirmPassword: string, gender: Gender) =>
  api.post<{ email: string }>("/api/v1/auth/activation/complete", { ...key, password, confirmPassword, gender });

/** Who is signing up (23 Oct 2026). Mentor is the monitor; mentors and teachers wait for the admin's approval. */
export type SignupRole = "Student" | "Mentor" | "Teacher";
export type SchoolSubject = "Math" | "Science" | "Physics" | "Language";

export interface RegisterInput {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  gender: Gender;
  role?: SignupRole;
  /** Mentor only. */
  trackCode?: string;
  title?: string;
  yearsOfExperience?: number;
  /** Teacher only. */
  schoolId?: string;
  subjects?: SchoolSubject[];
  grades?: number[];
}

export interface SignupOptions {
  tracks: { code: string; name: string }[];
  schools: { id: string; name: string; city: string | null }[];
  subjects: SchoolSubject[];
  grades: number[];
}

/** Tracks for monitors; schools, subjects and grades for teachers. No sign-in needed. */
export const getSignupOptions = () => api.get<SignupOptions>("/api/v1/auth/signup-options");

export const register = (input: RegisterInput) => api.post<{ email: string }>("/api/v1/auth/register", input);

export const confirmEmail = (email: string, code: string) =>
  api.post<{ email: string }>("/api/v1/auth/register/confirm", { email, code });

export type CodeFlow = "Signup" | "PasswordReset";

export const resendCode = (email: string, flow: CodeFlow) =>
  api.post<{ email: string }>("/api/v1/auth/codes/resend", { email, flow });

export const forgotPassword = (email: string) => api.post<{ email: string }>("/api/v1/auth/password/forgot", { email });

export const verifyResetCode = (email: string, code: string) =>
  api.post<{ resetToken: string }>("/api/v1/auth/password/verify-code", { email, code });

export const resetPassword = (resetToken: string, password: string, confirmPassword: string) =>
  api.post<{ email: string }>("/api/v1/auth/password/reset", { resetToken, password, confirmPassword });
