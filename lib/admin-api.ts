/** The admin pages (backend AdminController, 23 Oct 2026). Only the admin account can call these. */
import { api } from "@/lib/api-client";

export type TrackLevel = "Beginner" | "Intermediate" | "Advanced";

export interface AdminOverview {
  totalStudents: number;
  /** Students with activity in the last 7 days. */
  activeStudents: number;
  activeStudentsLastWeek: number;
  /** Change against last week; null when last week had nobody. */
  activeStudentsChangePercent: number | null;
  pendingReviews: number;
  totalSquads: number;
  squadsWithoutMonitor: number;
  averageSquadSize: number;
  /** The last 7 days, oldest first. */
  activity: { date: string; lessonsPassed: number; tasksDone: number }[];
  levels: { beginner: number; intermediate: number; advanced: number };
  /** Monitors and teachers who signed up and wait for approval. */
  pendingApprovals: number;
}

export interface AdminPerson {
  id: string;
  fullName: string;
  photoUrl: string | null;
}

export type AdminStudentStatus = "Active" | "Inactive" | "Pending";

export interface AdminStudent {
  id: string;
  fullName: string;
  photoUrl: string | null;
  gender: "Male" | "Female" | null;
  trackCode: string | null;
  trackName: string | null;
  squadName: string | null;
  status: AdminStudentStatus;
  totalXp: number;
}

export interface AdminStudentDetail {
  id: string;
  fullName: string;
  email: string;
  photoUrl: string | null;
  gender: "Male" | "Female" | null;
  schoolName: string | null;
  grade: number | null;
  className: string | null;
  status: AdminStudentStatus;
  totalXp: number;
  streakDays: number;
  lastActiveDate: string | null;
  lastLoginUtc: string | null;
  squadName: string | null;
  tracks: { trackId: string; trackCode: string; trackName: string; level: TrackLevel; mentor: AdminPerson | null }[];
}

export type AdminSquadStatus = "Waiting" | "Active" | "InReview" | "Completed";

export interface AdminSquad {
  id: string;
  name: string;
  projectTitle: string;
  level: TrackLevel;
  status: AdminSquadStatus;
  monitor: AdminPerson | null;
  /** 0-100 */
  progress: number;
  students: number;
  capacity: number;
}

export interface AdminMentor {
  id: string;
  fullName: string;
  title: string;
  photoUrl: string;
  email: string | null;
  trackCode: string;
  trackName: string;
  students: number;
  monitoredSquads: number;
  squadNames: string[];
  rating: number;
  yearsOfExperience: number;
  isActive: boolean;
}

export interface AdminMentorsPage {
  stats: { totalMentors: number; activeMentors: number; upcomingSessions: number; averageRating: number };
  mentors: AdminMentor[];
}

export interface AdminTrack {
  id: string;
  code: string;
  name: string;
  students: number;
  squads: number;
  /** 0-100 */
  progress: number;
}

export interface AdminTracksPage {
  stats: { totalTracks: number; activeSprints: number; averageCompletion: number; topTrack: string | null };
  tracks: AdminTrack[];
}

export interface NewMentor {
  fullName: string;
  email: string;
  password: string;
  title: string;
  trackCode: string;
  photoUrl?: string;
}

export const getAdminOverview = () => api.get<AdminOverview>("/api/v1/admin/overview");
export const getAdminStudents = () => api.get<AdminStudent[]>("/api/v1/admin/students");
export const getAdminStudent = (id: string) => api.get<AdminStudentDetail>(`/api/v1/admin/students/${id}`);
/** Gives the student another mentor in the mentor's track. */
export const changeStudentMentor = (id: string, mentorId: string) =>
  api.put<AdminStudentDetail>(`/api/v1/admin/students/${id}/mentor`, { mentorId });
export const getAdminSquads = () => api.get<AdminSquad[]>("/api/v1/admin/squads");
export const setSquadMonitor = (id: string, mentorId: string) =>
  api.put<AdminSquad>(`/api/v1/admin/squads/${id}/monitor`, { mentorId });
export const getAdminMentors = () => api.get<AdminMentorsPage>("/api/v1/admin/mentors");
export const getAdminMentor = (id: string) => api.get<AdminMentor>(`/api/v1/admin/mentors/${id}`);
export const createMentor = (mentor: NewMentor) => api.post<AdminMentor>("/api/v1/admin/mentors", mentor);
export const setMentorActive = (id: string, isActive: boolean) => api.patch<AdminMentor>(`/api/v1/admin/mentors/${id}`, { isActive });
export const getAdminTracks = () => api.get<AdminTracksPage>("/api/v1/admin/tracks");

export interface AdminAccount {
  id: string;
  fullName: string;
  email: string;
  /** The main admin, who adds the other admins. */
  isOwner: boolean;
  createdUtc: string;
  lastLoginUtc: string | null;
}

/** Only the main admin can list and add admins (NOT_THE_OWNER otherwise). */
export const getAdmins = () => api.get<AdminAccount[]>("/api/v1/admin/admins");
export const createAdmin = (admin: { fullName: string; email: string; password: string }) =>
  api.post<AdminAccount>("/api/v1/admin/admins", admin);

/** A monitor (Mentor role) or teacher who signed up and waits for approval (23 Oct 2026). */
export interface AdminApproval {
  id: string;
  role: "Mentor" | "Teacher";
  fullName: string;
  email: string;
  phone: string | null;
  createdUtc: string;
  trackCode: string | null;
  trackName: string | null;
  title: string | null;
  yearsOfExperience: number | null;
  schoolId: string | null;
  schoolName: string | null;
  subjects: ("Math" | "Science" | "Physics" | "Language")[];
  grades: number[];
}

export const getApprovals = () => api.get<AdminApproval[]>("/api/v1/admin/approvals");
/** The account becomes active (a monitor is shown to students); the person is emailed. */
export const approveSignup = (id: string) => api.post<void>(`/api/v1/admin/approvals/${id}/approve`);
/** The account cannot sign in; the person is emailed with the reason. */
export const rejectSignup = (id: string, reason: string) => api.post<void>(`/api/v1/admin/approvals/${id}/reject`, { reason });

/** Window event: the waiting sign-ups changed, so the admin sidebar counts them again. */
export const APPROVALS_CHANGED = "jh:approvals-changed";
