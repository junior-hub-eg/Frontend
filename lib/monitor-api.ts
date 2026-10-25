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

// ---------- The mentor area (design "Junior Hub · Mentor", backend MentorAreaController, 26 Oct 2026) ----------

export interface PersonRef {
  id: string;
  name: string;
  photoUrl: string | null;
}

export type SquadState = "Working" | "WaitingForReview" | "Late" | "Completed" | "ChangesRequested";
export type SquadLevel = "Beginner" | "Intermediate" | "Advanced";

export interface SquadRow {
  id: string;
  name: string;
  projectTitle: string;
  level: SquadLevel;
  state: SquadState;
  isCurrent: boolean;
  sprintName: string | null;
  sprintStartDate: string | null;
  sprintEndDate: string | null;
  daysLeft: number | null;
  progress: number;
  submittedUtc: string | null;
  reviewDueUtc: string | null;
  completedUtc: string | null;
  memberCount: number;
  submittedCount: number;
  warnings: number;
  members: PersonRef[];
}

export interface OverviewStats {
  squads: number;
  lateSquads: number;
  waitingSquads: number;
  students: number;
  studentSquads: number;
  waiting: number;
  overdue: number;
  dueSoon: number;
  dueSoonSquad: string | null;
  dueSoonUtc: string | null;
  warnings: number;
  warningSquads: number;
  sessionsThisWeek: number;
  nextSessionUtc: string | null;
}

export type NeedsActionKind = "Submitted" | "Inactive" | "Unanswered" | "AdminReplied";

export interface NeedsAction {
  kind: NeedsActionKind;
  squadId: string | null;
  squadName: string | null;
  projectTitle: string | null;
  studentId: string | null;
  studentName: string | null;
  role: string | null;
  count: number;
  total: number;
  dueUtc: string | null;
  atUtc: string | null;
  reportId: string | null;
}

export interface WeekEvent {
  kind: "ReviewDue" | "SprintEnds" | "GroupSession" | "OneToOne";
  atUtc: string;
  title: string;
  squadId: string | null;
  sessionId: string | null;
  sprintName: string | null;
}

export interface SquadActivity {
  kind: "TaskMoved" | "Submitted";
  studentId: string | null;
  studentName: string | null;
  photoUrl: string | null;
  squadId: string;
  squadName: string;
  taskTitle: string | null;
  toStatus: string | null;
  atUtc: string;
}

export interface MentorOverview {
  stats: OverviewStats;
  needsAction: NeedsAction[];
  thisWeek: WeekEvent[];
  squads: SquadRow[];
  recentActivity: SquadActivity[];
}

export interface MentorAreaSearch {
  squads: { id: string; name: string; projectTitle: string }[];
  students: { id: string; fullName: string; photoUrl: string | null; squadName: string | null }[];
}

export interface MemberRow {
  studentId: string;
  fullName: string;
  photoUrl: string | null;
  role: string;
  joinedUtc: string;
  tasksDone: number;
  points: number;
  submitted: boolean;
  lastActiveUtc: string | null;
  warning: "Inactive" | "Overdue" | null;
  idleDays: number;
  overdueTasks: number;
}

export interface SprintRow {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "Planned" | "Active" | "Closed";
  progress: number;
  tasksDone: number;
  tasksTotal: number;
}

export interface BoardTask {
  id: string;
  sprintId: string;
  title: string;
  status: "ToDo" | "InProgress" | "Review" | "Done";
  storyPoints: number;
  assigneeId: string | null;
  assigneeName: string | null;
  assigneePhotoUrl: string | null;
  role: string | null;
}

export type LinkStatus = "Unknown" | "Reachable" | "Expired" | "NotReachable";

export interface LinkRow {
  id: string;
  kind: string;
  url: string;
  studentId: string;
  studentName: string;
  photoUrl: string | null;
  updatedUtc: string;
  status: LinkStatus;
  checkedUtc: string | null;
}

export interface ReviewRound {
  round: number;
  periodStart: string | null;
  periodEnd: string | null;
  status: "Waiting" | "ChangesRequested" | "Approved";
  submittedUtc: string | null;
  dueUtc: string | null;
  reviewedUtc: string | null;
  averageScore: number | null;
  decision: string | null;
  feedback: string | null;
}

export interface SquadDetail {
  squad: SquadRow;
  projectDescription: string;
  goals: string[];
  techStack: string[];
  deliverables: { title: string; status: "ToDo" | "InProgress" | "Review" | "Done" }[];
  info: { level: SquadLevel; track: string; students: number; starts: string | null; finalReview: string | null; monitorName: string | null };
  members: MemberRow[];
  sprints: SprintRow[];
  board: BoardTask[];
  links: LinkRow[];
  reviews: { averageScore: number | null; averageRound: number | null; rounds: number; nextDeadlineUtc: string | null; items: ReviewRound[] };
  participants: { id: string; name: string; photoUrl: string | null; role: string; isMonitor: boolean; online: boolean }[];
  pendingDateChange: { id: string; currentEndDate: string; proposedEndDate: string; reason: string; status: string; createdUtc: string } | null;
  delays: { id: string; sprintId: string | null; sprintName: string | null; reason: DelayReason; note: string | null; createdUtc: string }[];
}

export type DelayReason = "TechnicalBlock" | "MissingMember" | "ScopeTooBig" | "Other";
export type ReportCategory = "InactiveMember" | "Behaviour" | "BrokenLink" | "ProjectProblem" | "Other";

export interface SquadChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderPhotoUrl: string | null;
  with: string | null;
  body: string;
  sentUtc: string;
  isMine: boolean;
}

export interface StudentReview {
  studentId: string;
  fullName: string;
  photoUrl: string | null;
  role: string;
  status: "NotStarted" | "InProgress" | "Done";
  qualityOfWork: number | null;
  deliveredOnTime: number | null;
  teamwork: number | null;
  communication: number | null;
  roleSkills: number | null;
  overall: number | null;
  strengths: string | null;
  toImprove: string | null;
  shareWithStudent: boolean;
}

export interface ReviewSheet {
  squadId: string;
  squadName: string;
  projectTitle: string;
  projectDescription: string;
  level: SquadLevel;
  round: number;
  readOnly: boolean;
  submittedUtc: string | null;
  dueUtc: string | null;
  tasksDone: number;
  tasksTotal: number;
  pointsDone: number;
  pointsTotal: number;
  work: { studentId: string; fullName: string; photoUrl: string | null; role: string; tasksDone: number; links: { kind: string; url: string }[] }[];
  students: StudentReview[];
  decision: "Approved" | "ChangesRequested" | null;
  feedback: string | null;
}

export type StudentReviewInput = Pick<StudentReview, "qualityOfWork" | "deliveredOnTime" | "teamwork" | "communication" | "roleSkills" | "strengths" | "toImprove" | "shareWithStudent"> & {
  done: boolean;
};

export interface ReviewsPage {
  waiting: { squadId: string; squadName: string; projectTitle: string; level: SquadLevel; submitted: number; members: number; submittedUtc: string; dueUtc: string }[];
  drafts: { squadId: string; squadName: string; projectTitle: string; round: number; done: number; total: number; updatedUtc: string }[];
  studentReviews: { squadId: string; squadName: string; round: number; studentId: string; studentName: string; photoUrl: string | null; role: string; overall: number | null; shared: boolean; submittedUtc: string }[];
  history: { squadId: string; squadName: string; projectTitle: string; round: number; decision: string; averageScore: number | null; reviewedUtc: string; daysToReview: number | null }[];
  turnaround: { averageDays: number | null; thisMonth: number; onTimePercent: number | null; months: { month: string; averageDays: number | null; reviews: number }[] };
}

export interface MentorReport {
  id: string;
  squadId: string | null;
  squadName: string | null;
  studentId: string | null;
  studentName: string | null;
  category: ReportCategory;
  message: string;
  createdUtc: string;
  status: "Open" | "Answered";
  adminReply: string | null;
  repliedUtc: string | null;
}

export const getMentorOverview = () => api.get<MentorOverview>("/api/v1/monitor/overview");
export const getMentorAreaBadges = () => api.get<{ waitingReviews: number }>("/api/v1/monitor/badges");
export const searchMentorArea = (q: string) => api.get<MentorAreaSearch>(`/api/v1/monitor/search?q=${encodeURIComponent(q)}`);
export const getMentorSquads = () => api.get<SquadRow[]>("/api/v1/monitor/squad-list");
export const getMentorSquadDetail = (id: string) => api.get<SquadDetail>(`/api/v1/monitor/squads/${id}/detail`);
export const checkSquadLinks = (id: string) => api.post<LinkRow[]>(`/api/v1/monitor/squads/${id}/links/check`);
export const markSquadLate = (id: string, reason: DelayReason, note: string) => api.post(`/api/v1/monitor/squads/${id}/late`, { reason, note });
export const proposeDateChange = (id: string, proposedEndDate: string, reason: string) =>
  api.post(`/api/v1/monitor/squads/${id}/date-change`, { proposedEndDate, reason });
export const sendMentorReport = (report: { squadId?: string | null; studentId?: string | null; category: ReportCategory; message: string }) =>
  api.post<MentorReport>("/api/v1/monitor/reports", report);
export const getMyMentorReports = () => api.get<MentorReport[]>("/api/v1/monitor/reports");
export const getMentorReviews = () => api.get<ReviewsPage>("/api/v1/monitor/reviews");
export const getReviewSheet = (squadId: string, round?: number) =>
  api.get<ReviewSheet>(`/api/v1/monitor/squads/${squadId}/review-sheet${round ? `?round=${round}` : ""}`);
export const saveStudentReview = (squadId: string, studentId: string, review: StudentReviewInput) =>
  api.put<StudentReview>(`/api/v1/monitor/squads/${squadId}/review-sheet/students/${studentId}`, review);
export const saveReviewDraft = (squadId: string, decision: "Approved" | "ChangesRequested" | null, feedback: string) =>
  api.put<void>(`/api/v1/monitor/squads/${squadId}/review-sheet/draft`, { decision, feedback });
export const submitReviewSheet = (squadId: string, decision: "Approved" | "ChangesRequested", feedback: string) =>
  api.post<ProjectStatus>(`/api/v1/monitor/squads/${squadId}/review-sheet/submit`, { decision, feedback });
export const getSquadChat = (squadId: string, before?: string) =>
  api.get<{ messages: SquadChatMessage[]; hasMore: boolean }>(`/api/v1/monitor/squads/${squadId}/chat${before ? `?before=${encodeURIComponent(before)}` : ""}`);
export const sendSquadChat = (squadId: string, body: string) => api.post<SquadChatMessage>(`/api/v1/monitor/squads/${squadId}/chat`, { body });
export const markSquadChatRead = (squadId: string) => api.post<void>(`/api/v1/monitor/squads/${squadId}/chat/read`);

// ---------- The mentor area, phase 2 (M5–M9) ----------

export interface SquadStudentRow {
  studentId: string;
  fullName: string;
  photoUrl: string | null;
  squadId: string;
  squadName: string;
  role: string;
  level: SquadLevel;
  tasksDone: number;
  lastActiveUtc: string | null;
  lastReview: number | null;
  warning: "Inactive" | "Overdue" | null;
  idleDays: number;
  overdueTasks: number;
}

export interface MenteeRow {
  studentId: string;
  fullName: string;
  photoUrl: string | null;
  trackCode: string;
  trackName: string;
  level: SquadLevel;
  sessionsDone: number;
  nextSessionUtc: string | null;
  lastActiveUtc: string | null;
}

export interface StudentReviewHistory {
  squadId: string;
  squadName: string;
  round: number;
  mentorId: string;
  overall: number | null;
  strengths: string | null;
  toImprove: string | null;
  shared: boolean;
  submittedUtc: string | null;
  updatedUtc: string;
}

export interface StudentPage {
  id: string;
  fullName: string;
  photoUrl: string | null;
  totalXp: number;
  trackCode: string | null;
  trackName: string | null;
  level: SquadLevel | null;
  isMentee: boolean;
  currentSquad: { squadId: string; squadName: string; projectTitle: string; role: string; tasksDone: number; points: number; submitted: boolean; lastActiveUtc: string | null; warning: string | null } | null;
  trackProgress: { title: string; lessons: number; done: number; percent: number }[];
  reviews: StudentReviewHistory[];
  squads: { squadId: string; squadName: string; projectTitle: string; role: string; joinedUtc: string; leftUtc: string | null; status: "Current" | "Completed"; monitorId: string | null }[];
  notes: { id: string; text: string; shared: boolean; createdUtc: string }[];
  sessions: { id: string; type: string; startsUtc: string; durationMinutes: number; status: MentorSessionStatus; topic: string | null }[];
  lastActiveUtc: string | null;
}

export interface CalendarSession {
  id: string;
  type: "OneToOne" | "Group";
  startsUtc: string;
  durationMinutes: number;
  topic: string | null;
  students: { id: string; fullName: string; photoUrl: string | null }[];
  squadName: string | null;
  squadId: string | null;
  overlaps: boolean;
}

export interface MentorCalendar {
  marks: { kind: "SprintStarts" | "SprintEnds" | "ReviewDue"; atUtc: string; squadId: string; squadName: string; sprintName: string | null }[];
  sessions: CalendarSession[];
  timeOff: { id: string; startDate: string; endDate: string; reason: string | null }[];
}

export interface MentorAnnouncement {
  id: string;
  title: string;
  body: string;
  link: string | null;
  language: "en" | "ar";
  squadIds: string[];
  squadNames: string[];
  includeMentees: boolean;
  status: "Draft" | "Scheduled" | "Sent";
  sendAtUtc: string | null;
  sentUtc: string | null;
  recipients: number;
  readPercent: number | null;
  updatedUtc: string;
}

export interface MentorAnnouncementsPage {
  squads: { squadId: string; squadName: string; students: number }[];
  mentees: number;
  announcements: MentorAnnouncement[];
}

export interface SquadReport {
  squadId: string;
  squadName: string;
  progress: number;
  tasksDone: number;
  tasksTotal: number;
  pointsDone: number;
  pointsTotal: number;
  delays: number;
  sprints: { name: string; startDate: string; endDate: string; percent: number }[];
  members: { studentId: string; fullName: string; photoUrl: string | null; tasks: number; points: number }[];
  delayRows: { sprintName: string | null; reason: DelayReason; note: string | null; createdUtc: string }[];
  review: { state: SquadState; firstRound: number | null; firstDecision: string | null; firstAverage: number | null; studentReviewsDone: number; students: number; exports: number };
}

export interface StudentReport {
  studentId: string;
  fullName: string;
  photoUrl: string | null;
  tasksDone: number;
  points: number;
  averageScore: number | null;
  sessions: number;
  delays: number;
  sprints: { squadName: string; sprintName: string; tasks: number; points: number }[];
  reviews: StudentReviewHistory[];
  exports: number;
}

export interface NotificationSettings {
  newSquad: boolean;
  submission: boolean;
  warning: boolean;
  chatMessage: boolean;
  adminReply: boolean;
}

export interface MentorSettings {
  stats: { squadsCompleted: number; averageReviewDays: number | null; averageStudentScore: number | null };
  capacity: { maxStudents: number; maxSquads: number; squadsNow: number; studentsNow: number };
  notifications: NotificationSettings;
  passwordChangedUtc: string | null;
  trackRequests: { id: string; trackCode: string; trackName: string; status: "Pending" | "Approved" | "Rejected"; createdUtc: string }[];
}

export const getMyStudents = () => api.get<{ squadStudents: SquadStudentRow[]; mentees: MenteeRow[] }>("/api/v1/monitor/my-students");
export const getMyStudent = (id: string) => api.get<StudentPage>(`/api/v1/monitor/my-students/${id}`);
export const addStudentNote = (id: string, text: string, share: boolean) => api.post<StudentPage["notes"][number]>(`/api/v1/monitor/my-students/${id}/notes`, { text, share });
export const getMentorCalendar = (fromIso: string, toIso: string) =>
  api.get<MentorCalendar>(`/api/v1/monitor/calendar?from=${encodeURIComponent(fromIso)}&to=${encodeURIComponent(toIso)}`);
export const moveMentorSession = (id: string, startsUtc: string) => api.post<void>(`/api/v1/monitor/sessions/${id}/move`, { startsUtc });
export const cancelMentorSession = (id: string) => api.post<void>(`/api/v1/monitor/sessions/${id}/cancel`);
export const addTimeOff = (startDate: string, endDate: string, reason: string) =>
  api.post<MentorCalendar["timeOff"][number]>("/api/v1/monitor/time-off", { startDate, endDate, reason });
export const removeTimeOff = (id: string) => api.post<void>(`/api/v1/monitor/time-off/${id}/remove`);
export const getMentorAnnouncements = () => api.get<MentorAnnouncementsPage>("/api/v1/monitor/announcements");
export const saveMentorAnnouncement = (a: {
  id?: string | null; title: string; body: string; link: string; language: "en" | "ar"; squadIds: string[]; includeMentees: boolean;
  mode: "Now" | "Schedule" | "Draft"; sendAtUtc?: string | null;
}) => api.post<MentorAnnouncement>("/api/v1/monitor/announcements", a);
export const getSquadReport = (id: string, from?: string, to?: string) =>
  api.get<SquadReport>(`/api/v1/monitor/reports/squads/${id}${from ? `?from=${from}&to=${to ?? ""}` : ""}`);
export const getStudentReport = (id: string) => api.get<StudentReport>(`/api/v1/monitor/reports/students/${id}`);
export const recordReportExport = (r: { squadId?: string; studentId?: string; language: "en" | "ar" }) => api.post<void>("/api/v1/monitor/reports/exports", r);
export const getMentorSettings = () => api.get<MentorSettings>("/api/v1/monitor/settings");
export const saveNotificationSettings = (s: NotificationSettings) => api.put<NotificationSettings>("/api/v1/monitor/settings/notifications", s);
export const changeMentorPassword = (currentPassword: string, newPassword: string, confirmPassword: string) =>
  api.put<void>("/api/v1/monitor/me/password", { currentPassword, newPassword, confirmPassword });
export const getMyTrackRequests = () => api.get<{ id: string; trackCode: string; status: string }[]>("/api/v1/monitor/track-requests");
export const sendTrackRequest = (trackCode: string, note: string) => api.post("/api/v1/monitor/track-requests", { trackCode, note });
