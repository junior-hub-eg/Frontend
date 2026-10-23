/** School teachers (backend TeacherController and StudentClassesController, 23 Oct 2026). */
import { api } from "@/lib/api-client";

export type SchoolSubject = "Math" | "Science" | "Physics" | "Language";
export type Gender = "Male" | "Female";

export interface TeacherClass {
  id: string;
  grade: number;
  name: string;
  students: number;
  /** Students active in the last 7 days, 0-100. */
  activeRate: number;
  /** Average graded score, 0-100; null before any grade. */
  averageScore: number | null;
  joinCode: string;
  autoAccept: boolean;
  pendingRequests: number;
  openAssignments: number;
  currentPlan: string | null;
}

export type ClassStudentStatus = "TopQuartile" | "OnTrack" | "NeedsAssistance";

export interface ClassStudent {
  id: string;
  fullName: string;
  email: string;
  photoUrl: string | null;
  gender: Gender | null;
  joinedVia: "School" | "Code";
  /** Days with activity out of the last 14, 0-100. */
  attendance: number;
  mastery: number | null;
  status: ClassStudentStatus;
  lastActiveUtc: string | null;
}

export interface JoinRequest {
  studentId: string;
  fullName: string;
  photoUrl: string | null;
  gender: Gender | null;
  requestedUtc: string;
}

export interface PlanItem {
  id: string;
  classId: string;
  subject: SchoolSubject;
  /** yyyy-MM-dd, the first day of the week. */
  weekStart: string;
  title: string;
  notes: string | null;
}

export interface Assignment {
  id: string;
  classId: string;
  className: string;
  subject: SchoolSubject;
  title: string;
  instructions: string | null;
  openUtc: string;
  dueUtc: string;
  maxPoints: number;
  enrolled: number;
  submitted: number;
  graded: number;
  averagePercent: number | null;
}

export interface TeacherClassDetail {
  id: string;
  grade: number;
  name: string;
  joinCode: string;
  autoAccept: boolean;
  subjects: SchoolSubject[];
  students: ClassStudent[];
  requests: JoinRequest[];
  plan: PlanItem[];
  assignments: Assignment[];
}

export type AssignmentStatus = "NotStarted" | "Submitted" | "Late" | "Graded" | "Missing";

export interface AssignmentDetail {
  id: string;
  classId: string;
  className: string;
  subject: SchoolSubject;
  title: string;
  instructions: string | null;
  openUtc: string;
  dueUtc: string;
  maxPoints: number;
  submitted: number;
  graded: number;
  averagePercent: number | null;
  students: {
    studentId: string;
    fullName: string;
    photoUrl: string | null;
    gender: Gender | null;
    status: AssignmentStatus;
    answer: string | null;
    submittedUtc: string | null;
    score: number | null;
    feedback: string | null;
  }[];
}

export interface ClassQuestion {
  id: string;
  classId: string;
  className: string;
  studentId: string;
  studentName: string;
  text: string;
  createdUtc: string;
  answer: string | null;
  answeredUtc: string | null;
}

export type AlertKind = "MissedDeadline" | "LowScore" | "Inactive" | "JoinRequest";

export interface TeacherAlert {
  kind: AlertKind;
  studentId: string;
  fullName: string;
  photoUrl: string | null;
  gender: Gender | null;
  classId: string;
  className: string;
  /** The assignment title, "title (45%)", or the last active date (yyyy-MM-dd), depending on the kind. */
  detail: string | null;
  atUtc: string | null;
  assignmentId: string | null;
}

export interface TeacherDashboard {
  teacher: { firstName: string; fullName: string; subjects: SchoolSubject[] };
  classes: { id: string; name: string; students: number }[];
  stats: {
    totalEnrolled: number;
    weeklyActive: number;
    dueThisWeek: number;
    averageScore: number | null;
    plannedLessons: number;
    needsFocus: number;
  };
  alerts: TeacherAlert[];
  questions: ClassQuestion[];
  classProgress: {
    classId: string;
    grade: number;
    name: string;
    students: number;
    onTrack: number;
    percent: number;
    nextAssignment: string | null;
    nextDueUtc: string | null;
    currentPlan: string | null;
  }[];
  hardest: { assignmentId: string; title: string; className: string; averagePercent: number; graded: number; submitted: number }[];
  schedule: { dateUtc: string; kind: "Due" | "Plan"; title: string; className: string; classId: string }[];
}

export interface NewAssignment {
  classId: string;
  subject: SchoolSubject;
  title: string;
  instructions?: string;
  openUtc?: string;
  dueUtc: string;
  maxPoints: number;
}

export const getTeacherDashboard = (classId?: string) =>
  api.get<TeacherDashboard>(`/api/v1/teacher/dashboard${classId ? `?classId=${classId}` : ""}`);
export const getTeacherClasses = () => api.get<TeacherClass[]>("/api/v1/teacher/classes");
export const getTeacherClass = (id: string) => api.get<TeacherClassDetail>(`/api/v1/teacher/classes/${id}`);
export const setAutoAccept = (id: string, autoAccept: boolean) =>
  api.patch<TeacherClassDetail>(`/api/v1/teacher/classes/${id}`, { autoAccept });
export const renewClassCode = (id: string) => api.post<TeacherClassDetail>(`/api/v1/teacher/classes/${id}/code`);
export const decideJoinRequest = (classId: string, studentId: string, accept: boolean) =>
  api.post<TeacherClassDetail>(`/api/v1/teacher/classes/${classId}/requests/${studentId}/${accept ? "accept" : "decline"}`);
export const removeClassStudent = (classId: string, studentId: string) =>
  api.delete<void>(`/api/v1/teacher/classes/${classId}/students/${studentId}`);
export const addPlanItem = (classId: string, item: { weekStart: string; subject: SchoolSubject; title: string; notes?: string }) =>
  api.post<PlanItem>(`/api/v1/teacher/classes/${classId}/plan`, item);
export const deletePlanItem = (itemId: string) => api.delete<void>(`/api/v1/teacher/plan/${itemId}`);
export const createAssignment = (assignment: NewAssignment) => api.post<Assignment>("/api/v1/teacher/assignments", assignment);
export const getAssignment = (id: string) => api.get<AssignmentDetail>(`/api/v1/teacher/assignments/${id}`);
export const changeDue = (id: string, dueUtc: string) => api.patch<AssignmentDetail>(`/api/v1/teacher/assignments/${id}`, { dueUtc });
export const gradeSubmission = (id: string, studentId: string, score: number, feedback: string) =>
  api.post<AssignmentDetail>(`/api/v1/teacher/assignments/${id}/students/${studentId}/grade`, { score, feedback });
export const answerQuestion = (id: string, answer: string) => api.post<void>(`/api/v1/teacher/questions/${id}/answer`, { answer });
