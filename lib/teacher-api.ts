/** School teachers (backend TeacherController and StudentClassesController, 23 Oct 2026). */
import { api, API_BASE_URL, ApiError } from "@/lib/api-client";
import { getToken } from "@/lib/auth/token";

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

// ---------- Teacher design pages (26 Oct 2026): messages, calendar, progress, nudges, settings ----------

export type StudentStatus = ClassStudentStatus;

export interface TeacherMessages {
  stats: {
    unreadDirect: number;
    openQuestions: number;
    eventsToday: number;
    nextEventUtc: string | null;
    nextEventTitle: string | null;
    averageReplyMinutes: number | null;
  };
  channels: {
    classId: string;
    name: string;
    grade: number;
    students: number;
    lastText: string | null;
    lastSender: string | null;
    lastUtc: string | null;
    messages: number;
  }[];
  direct: {
    studentId: string;
    fullName: string;
    photoUrl: string | null;
    gender: Gender | null;
    classId: string;
    className: string;
    mastery: number | null;
    status: ClassStudentStatus;
    lastText: string | null;
    lastUtc: string | null;
    unread: number;
  }[];
}

export interface ThreadMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "Teacher" | "Student";
  mine: boolean;
  text: string;
  createdUtc: string;
  broadcast: boolean;
}

export interface Competency {
  title: string;
  percent: number;
}

export interface StudentThread {
  studentId: string;
  fullName: string;
  photoUrl: string | null;
  gender: Gender | null;
  classId: string;
  className: string;
  email: string;
  mastery: number | null;
  status: ClassStudentStatus;
  attendance: number;
  competencies: Competency[];
  deliverables: { assignmentId: string; title: string; status: AssignmentStatus; score: number | null; maxPoints: number; dueUtc: string }[];
  messages: ThreadMessage[];
}

export interface ChannelThread {
  classId: string;
  name: string;
  students: number;
  messages: ThreadMessage[];
}

export type EventKind = "Lesson" | "OfficeHour" | "OneOnOne" | "Review" | "Meeting";
export type CalendarKind = EventKind | "Deadline" | "Plan";

export interface CalendarItem {
  id: string;
  /** "Event" can be edited; "Due" and "Plan" come from assignments and the weekly plan. */
  source: "Event" | "Due" | "Plan";
  kind: CalendarKind;
  title: string;
  notes: string | null;
  location: string | null;
  classId: string | null;
  className: string | null;
  studentId: string | null;
  studentName: string | null;
  startUtc: string;
  endUtc: string;
}

export interface TeacherCalendar {
  from: string;
  to: string;
  items: CalendarItem[];
  channels: { kind: CalendarKind; count: number; hours: number }[];
  bookingSlug: string;
}

export interface SaveEvent {
  kind: EventKind;
  title: string;
  notes?: string | null;
  location?: string | null;
  classId?: string | null;
  studentId?: string | null;
  startUtc: string;
  endUtc: string;
}

export interface Spotlight {
  studentId: string;
  fullName: string;
  photoUrl: string | null;
  gender: Gender | null;
  className: string;
  mastery: number | null;
  strong: Competency[];
  weak: Competency[];
  timeSpentMinutes: number;
}

export interface TeacherProgress {
  basis: "Grammar" | "Subjects";
  columns: { key: string; title: string }[];
  rows: {
    studentId: string;
    fullName: string;
    photoUrl: string | null;
    gender: Gender | null;
    classId: string;
    className: string;
    scores: (number | null)[];
    mastery: number | null;
    status: ClassStudentStatus;
    timeSpentMinutes: number;
  }[];
  stats: { mastery: number | null; ready: number; total: number; needsFocus: number; weeklyHoursPerStudent: number };
  skillGaps: Competency[];
  top: Spotlight | null;
  needsHelp: Spotlight | null;
}

export type NudgeKind = "Reminder" | "Hint" | "Parent" | "Certificate";

export interface TeacherSettings {
  fullName: string;
  email: string;
  school: string;
  subjects: SchoolSubject[];
  grades: number[];
  bookingSlug: string;
  officeLocation: string | null;
  notifyMessages: boolean;
  notifySubmissions: boolean;
  notifyQuestions: boolean;
  weeklyDigest: boolean;
}

export interface TeacherStudentsPage {
  stats: { total: number; needsAssistance: number; onTrack: number; topQuartile: number; averageMastery: number | null };
  students: {
    studentId: string;
    fullName: string;
    email: string;
    photoUrl: string | null;
    gender: Gender | null;
    classId: string;
    className: string;
    grade: number;
  }[];
}

export const getTeacherAssignments = (classId?: string) =>
  api.get<Assignment[]>(`/api/v1/teacher/assignments${classId ? `?classId=${classId}` : ""}`);
export const getTeacherProfile = () =>
  api.get<{ id: string; fullName: string; firstName: string; email: string; school: { id: string; name: string }; subjects: SchoolSubject[]; grades: number[] }>(
    "/api/v1/teacher/me",
  );
export const getTeacherStudentsList = (classId?: string) =>
  api.get<TeacherStudentsPage>(`/api/v1/teacher/students${classId ? `?classId=${classId}` : ""}`);

export const getTeacherMessages = () => api.get<TeacherMessages>("/api/v1/teacher/messages");
export const getStudentThread = (studentId: string) => api.get<StudentThread>(`/api/v1/teacher/messages/students/${studentId}`);
export const sendStudentMessage = (studentId: string, text: string) =>
  api.post<ThreadMessage>(`/api/v1/teacher/messages/students/${studentId}`, { text });
export const getChannel = (classId: string) => api.get<ChannelThread>(`/api/v1/teacher/messages/classes/${classId}`);
export const postToChannel = (classId: string, text: string) => api.post<ThreadMessage>(`/api/v1/teacher/messages/classes/${classId}`, { text });
export const broadcast = (classId: string | null, text: string) =>
  api.post<{ classes: number; students: number }>("/api/v1/teacher/broadcast", { classId, text });

export const getTeacherCalendar = (from?: string, to?: string) => {
  const q = new URLSearchParams();
  if (from) q.set("from", from);
  if (to) q.set("to", to);
  const qs = q.toString();
  return api.get<TeacherCalendar>(`/api/v1/teacher/calendar${qs ? `?${qs}` : ""}`);
};
export const createEvent = (event: SaveEvent) => api.post<CalendarItem>("/api/v1/teacher/calendar/events", event);
export const updateEvent = (id: string, event: SaveEvent) => api.put<CalendarItem>(`/api/v1/teacher/calendar/events/${id}`, event);
export const deleteEvent = (id: string) => api.delete<void>(`/api/v1/teacher/calendar/events/${id}`);

export const getTeacherProgress = (classId?: string, basis?: "Grammar" | "Subjects") => {
  const q = new URLSearchParams();
  if (classId) q.set("classId", classId);
  if (basis) q.set("basis", basis);
  const qs = q.toString();
  return api.get<TeacherProgress>(`/api/v1/teacher/progress${qs ? `?${qs}` : ""}`);
};

export const nudgeStudent = (studentId: string, kind: NudgeKind, assignmentId?: string | null, text?: string) =>
  api.post<{ id: string; kind: NudgeKind; studentName: string; parent: string | null; createdUtc: string }>(
    `/api/v1/teacher/students/${studentId}/nudge`,
    { kind, assignmentId: assignmentId ?? null, text: text ?? null },
  );

export const getTeacherSettings = () => api.get<TeacherSettings>("/api/v1/teacher/settings");
export const updateTeacherSettings = (changes: Partial<Omit<TeacherSettings, "fullName" | "email" | "school" | "subjects" | "grades">>) =>
  api.put<TeacherSettings>("/api/v1/teacher/settings", changes);

/** Downloads a file from the API with the signed-in token (the .ics calendar). */
export async function downloadFromApi(path: string, filename: string) {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, { credentials: "include", headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!res.ok) throw new ApiError(`Request to ${path} failed with ${res.status}`, res.status);
  const url = URL.createObjectURL(await res.blob());
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
}
export const changeTeacherPassword = (currentPassword: string, newPassword: string, confirmPassword: string) =>
  api.put<void>("/api/v1/teacher/password", { currentPassword, newPassword, confirmPassword });
export const addClass = (grade: number, name: string, autoAccept: boolean) =>
  api.post<TeacherClassDetail>("/api/v1/teacher/classes", { grade, name, autoAccept });
export const removeClass = (id: string) => api.delete<void>(`/api/v1/teacher/classes/${id}`);
export const addClassStudent = (classId: string, email: string) =>
  api.post<TeacherClassDetail>(`/api/v1/teacher/classes/${classId}/students`, { email });
export const sendClassInvite = (classId: string, email: string) =>
  api.post<{ link: string; email: string; hasAccount: boolean }>(`/api/v1/teacher/classes/${classId}/invite`, { email });
/** The link a student opens to join the class (the site's /join/{code}). */
export const classInviteLink = (code: string) => `${typeof window === "undefined" ? "" : window.location.origin}/join/${code}`;
