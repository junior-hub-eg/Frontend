/** A student's classes and teachers (backend StudentClassesController): assignments, questions, class channel, schedule. */
import { api } from "@/lib/api-client";
import type { StudentClass } from "@/lib/class-join";
import type { AssignmentStatus, ChannelThread, SchoolSubject, ThreadMessage } from "@/lib/teacher-api";

export type { StudentClass } from "@/lib/class-join";
export { joinClass } from "@/lib/class-join";

export interface StudentAssignment {
  id: string;
  classId: string;
  className: string;
  subject: SchoolSubject;
  title: string;
  instructions: string | null;
  openUtc: string;
  dueUtc: string;
  maxPoints: number;
  status: AssignmentStatus;
  answer: string | null;
  submittedUtc: string | null;
  score: number | null;
  feedback: string | null;
}

export interface ClassQuestion {
  id: string;
  classId: string;
  className: string;
  text: string;
  createdUtc: string;
  answer: string | null;
  answeredUtc: string | null;
}

export interface StudentCalendarItem {
  id: string;
  kind: string;
  title: string;
  notes: string | null;
  location: string | null;
  className: string;
  startUtc: string;
  endUtc: string;
}

export const getStudentClasses = () => api.get<StudentClass[]>("/api/v1/student/classes");
export const getStudentAssignments = () => api.get<StudentAssignment[]>("/api/v1/student/assignments");
export const submitAssignment = (id: string, answer: string) =>
  api.post<void>(`/api/v1/student/assignments/${id}/submit`, { answer });
export const getMyQuestions = () => api.get<ClassQuestion[]>("/api/v1/student/questions");
export const askQuestion = (classId: string, text: string) => api.post<ClassQuestion>("/api/v1/student/questions", { classId, text });
export const getClassChannel = (classId: string) => api.get<ChannelThread>(`/api/v1/student/classes/${classId}/messages`);
export const postToClassChannel = (classId: string, text: string) =>
  api.post<ThreadMessage>(`/api/v1/student/classes/${classId}/messages`, { text });
export const getStudentCalendar = (from?: string, to?: string) => {
  const q = new URLSearchParams();
  if (from) q.set("from", from);
  if (to) q.set("to", to);
  const s = q.toString();
  return api.get<StudentCalendarItem[]>(`/api/v1/student/calendar${s ? `?${s}` : ""}`);
};
