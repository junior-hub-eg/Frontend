/** Mentor accounts monitoring their squads (backend MonitorController, decision of 21 Oct 2026). */
import { api } from "@/lib/api-client";
import type { ProjectStatus, WorkLinkKind } from "@/lib/interns-api";
import type { MentorProfile } from "@/lib/mentorship-api";

export interface MonitoredMember {
  studentId: string;
  fullName: string;
  photoUrl: string | null;
  role: string;
  submittedUtc: string | null;
  links: { kind: WorkLinkKind; url: string }[];
  tasks: { title: string; status: string; storyPoints: number }[];
}

export interface MonitoredSquad {
  project: ProjectStatus;
  projectDescription: string;
  members: MonitoredMember[];
}

export const getMonitoredSquads = () => api.get<ProjectStatus[]>("/api/v1/monitor/squads");
export const getMonitoredSquad = (id: string) => api.get<MonitoredSquad>(`/api/v1/monitor/squads/${id}`);
/** Approved completes the project (students move up a level); ChangesRequested sends it back with the feedback. */
export const reviewProject = (id: string, decision: "Approved" | "ChangesRequested", feedback: string) =>
  api.post<ProjectStatus>(`/api/v1/monitor/squads/${id}/review`, { decision, feedback });

// ---------- Mentor workspace (backend MonitorController, 24 Oct 2026) ----------

export type MentorSessionStatus = "Upcoming" | "Completed" | "NoShow" | "Cancelled";

export interface MonitorHome {
  totalStudents: number;
  upcomingSessionsToday: number;
  upcomingSessionsWeek: number;
  pendingReviews: number;
  overallRating: number;
  unreadMessages: number;
  nextSessions: { id: string; studentId: string; studentName: string; type: string; startsUtc: string; durationMinutes: number; topic: string | null; meetingLink: string | null }[];
  recentActivity: { studentId: string; studentName: string; eventType: string; occurredUtc: string; detail: string | null }[];
}

export interface MonitorSession {
  id: string;
  studentId: string;
  studentName: string;
  type: string;
  status: MentorSessionStatus;
  startsUtc: string;
  durationMinutes: number;
  topic: string | null;
  agenda: string | null;
  meetingLink: string | null;
  mentorNotes: string | null;
  followUpPoints: string | null;
  learningGoals: string | null;
}

/** Every field is saved: send the current value of the ones you do not change. */
export type SessionDetails = Pick<MonitorSession, "topic" | "agenda" | "meetingLink" | "mentorNotes" | "followUpPoints" | "learningGoals">;

export interface MonitorStudent {
  id: string;
  name: string;
  initials: string;
  track: string;
  progressTitle: string;
  progress: number;
  completedLessons: number;
  pendingTasks: number;
  recent: { title: string; when: string; done: boolean }[];
  nextSteps: string[];
  badges: string[];
}

export interface MonitorFeedback {
  overallRating: number;
  totalReviews: number;
  items: { id: string; sessionId: string; student: string; initials: string; track: string; rating: number; comment: string; createdUtc: string }[];
}

export interface ConversationSummary {
  id: string;
  partnerId: string;
  partnerName: string;
  initials: string;
  track: string;
  preview: string;
  time: string;
  unread: number;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  recipientId: string;
  /** "mentor" or "student" */
  from: string;
  text: string;
  createdUtc: string;
  time: string;
}

export type Weekday = "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";

export interface MentorAvailability {
  durationMinutes: number;
  bookingWindowWeeks: number;
  days: { key: string; label: Weekday; short: string; slots: { time: string; booked: boolean }[] }[];
}

export type MentoringLevel = "Beginner" | "Intermediate" | "All";

/** GET /monitor/me: the public profile plus the fields only the mentor sees. */
export interface MonitorProfile extends MentorProfile {
  meetingLink: string | null;
  mentoringLevel: MentoringLevel | null;
  bookingWindowWeeks: number | null;
}
export const getMonitorProfile = () => api.get<MonitorProfile>("/api/v1/monitor/me");

export const getMonitorHome = () => api.get<MonitorHome>("/api/v1/monitor/home");
export const getMonitorSessions = (status?: MentorSessionStatus) =>
  api.get<MonitorSession[]>(`/api/v1/monitor/sessions${status ? `?status=${status}` : ""}`);
export const getMonitorSession = (id: string) => api.get<MonitorSession>(`/api/v1/monitor/sessions/${id}`);
export const saveSessionNotes = (id: string, details: SessionDetails) => api.put<MonitorSession>(`/api/v1/monitor/sessions/${id}/notes`, details);
/** noShow=true: the student did not come; false: undo it, the session counts as completed. */
export const setSessionNoShow = (id: string, details: SessionDetails, noShow: boolean) =>
  api.post<MonitorSession>(`/api/v1/monitor/sessions/${id}/status?noShow=${noShow}`, details);
export const getMonitorStudents = () => api.get<MonitorStudent[]>("/api/v1/monitor/students");
export const getMonitorStudent = (id: string) => api.get<MonitorStudent>(`/api/v1/monitor/students/${id}`);
export const getMonitorFeedback = () => api.get<MonitorFeedback>("/api/v1/monitor/feedback");
export const getMonitorConversations = () => api.get<ConversationSummary[]>("/api/v1/monitor/conversations");
export const getMonitorMessages = (studentId: string) => api.get<DirectMessage[]>(`/api/v1/monitor/conversations/${studentId}/messages`);
export const sendMonitorMessage = (studentId: string, text: string) =>
  api.post<DirectMessage>(`/api/v1/monitor/conversations/${studentId}/messages`, { text });
export const markMonitorMessagesRead = (studentId: string) => api.post<void>(`/api/v1/monitor/conversations/${studentId}/read`);
export const getMonitorAvailability = () => api.get<MentorAvailability>("/api/v1/monitor/availability");
export const saveMonitorAvailability = (bookingWindowWeeks: number, slots: { dayOfWeek: Weekday; startTime: string }[]) =>
  api.put<MentorAvailability>("/api/v1/monitor/availability", { bookingWindowWeeks, slots });
export const updateMentorProfile = (profile: {
  meetingLink?: string | null;
  mentoringLevel?: MentoringLevel | null;
  bio?: string | null;
  skills?: string | null;
  languages?: string | null;
}) => api.put<MonitorProfile>("/api/v1/monitor/me", profile);
