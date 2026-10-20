/** Mentorship (backend MentorsController). Errors are thrown as ApiError with the backend's code. */
import { api } from "@/lib/api-client";

export interface Mentor {
  id: string;
  fullName: string;
  title: string;
  trackCode: string;
  photoUrl: string;
  yearsOfExperience: number;
  rating: number;
  languages: string[];
  availability: string;
  bio: string;
  skills: string[];
  isMyMentor: boolean;
}

export interface MentorAssignment {
  mentor: Mentor;
  startedUtc: string;
  endedUtc: string | null;
}

export interface MyMentor {
  /** The mentor of the track in focus. */
  current: MentorAssignment | null;
  /** The student's mentor in each track they learn (a mentor per track). */
  currents: MentorAssignment[];
  history: MentorAssignment[];
}

export const getMentors = (options: { track?: string; all?: boolean } = {}) => {
  const query = new URLSearchParams();
  if (options.track) query.set("track", options.track);
  if (options.all) query.set("all", "true");
  return api.get<Mentor[]>(`/api/v1/mentors${query.size ? `?${query}` : ""}`);
};
export const getMyMentor = () => api.get<MyMentor>("/api/v1/student/mentor");
export const chooseMentor = (mentorId: string) => api.put<MyMentor>("/api/v1/student/mentor", { mentorId });

export interface MentorProfile {
  mentor: Mentor;
  /** How many students they mentor now. */
  currentStudents: number;
}

export const getMentor = (id: string) => api.get<MentorProfile>(`/api/v1/mentors/${id}`);

/* ---------- Sessions with a mentor ---------- */

export type SessionType = "OneToOne" | "Group";

export interface MentorSlot {
  startsUtc: string;
  /** Nobody booked this time. */
  oneToOneAvailable: boolean;
  /** Places left in a group session (0 when a 1:1 session took the time). */
  groupSpotsLeft: number;
  /** Set when the student booked this time. */
  bookedByMe: SessionType | null;
}

export interface MentorSlots {
  mentorId: string;
  durationMinutes: number;
  groupCapacity: number;
  /** From tomorrow for two weeks. */
  slots: MentorSlot[];
}

export interface MentorSession {
  id: string;
  mentor: { id: string; fullName: string; title: string; trackCode: string; photoUrl: string };
  type: SessionType;
  startsUtc: string;
  durationMinutes: number;
}

export const getMentorSlots = (mentorId: string) => api.get<MentorSlots>(`/api/v1/mentors/${mentorId}/slots`);
export const bookSession = (mentorId: string, startsUtc: string, type: SessionType) =>
  api.post<MentorSession>("/api/v1/student/sessions", { mentorId, startsUtc, type });
export const getMySessions = () => api.get<MentorSession[]>("/api/v1/student/sessions");
export const cancelSession = (id: string) => api.delete<MentorSession>(`/api/v1/student/sessions/${id}`);

/** "Tue 23 Oct, 7:00 PM" in school time (Cairo). */
export function sessionTime(startsUtc: string) {
  return new Date(startsUtc).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Africa/Cairo",
  });
}
