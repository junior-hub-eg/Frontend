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
  current: MentorAssignment | null;
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
