/**
 * Interns: the student's squad, active sprint, task board and the school leaderboard
 * (backend InternsController, /api/v1/interns). Errors are thrown as ApiError with the backend's code,
 * for example NO_SQUAD, NOT_TASK_OWNER or INVALID_TRANSITION.
 */
import { api } from "@/lib/api-client";

export type SquadRole = "Frontend" | "Backend" | "UIUX" | "AI" | "Testing" | "Data" | "Mobile" | "Gaming";
export type TaskStatus = "ToDo" | "InProgress" | "Review" | "Done";

export const TASK_STATUSES: TaskStatus[] = ["ToDo", "InProgress", "Review", "Done"];

export interface SquadMember {
  studentId: string;
  firstName: string;
  fullName: string;
  photoUrl: string | null;
  role: SquadRole;
  isMe: boolean;
}

/** The mentor who supervises the squad's project (picked at random), not the student's own mentor. */
export interface SquadMonitor {
  id: string;
  fullName: string;
  title: string;
  trackCode: string;
  photoUrl: string;
}

/** One role the project needs: how many seats and how many are taken. */
export interface SquadSeat {
  role: SquadRole;
  needed: number;
  filled: number;
}

export interface Squad {
  id: string;
  name: string;
  /** Null until every seat is taken and the project is revealed (the cube). */
  projectTitle: string | null;
  projectDescription: string | null;
  members: SquadMember[];
  monitor: SquadMonitor | null;
  level: "Beginner" | "Intermediate" | "Advanced";
  projectRevealed: boolean;
  projectRevealedUtc: string | null;
  /** The seats the project needs by role; empty for squads formed before seats. */
  seats: SquadSeat[];
  seatsTotal: number;
}

/** The dashboard endpoints answer 409 with this code until the squad's project is revealed. */
export const PROJECT_NOT_READY = "PROJECT_NOT_READY";

export interface Sprint {
  id: string;
  name: string;
  /** yyyy-mm-dd */
  startDate: string;
  endDate: string;
  daysLeft: number;
  progressPercent: number;
  tasksDone: number;
  tasksTotal: number;
  storyPointsDone: number;
  storyPointsTotal: number;
}

export interface SquadTask {
  id: string;
  title: string;
  status: TaskStatus;
  storyPoints: number;
  assignee: { studentId: string; firstName: string; photoUrl: string | null; role: SquadRole } | null;
  isMine: boolean;
}

export interface TaskBoard {
  sprintId: string;
  columns: { status: TaskStatus; tasks: SquadTask[] }[];
}

export interface LeaderboardEntry {
  rank: number;
  squadId: string;
  name: string;
  progressPercent: number;
  xp: number;
  isMine: boolean;
}

export interface Leaderboard {
  top: LeaderboardEntry[];
  /** The student's squad when it is not in the top 5. */
  mine: LeaderboardEntry | null;
}

export interface MoveTaskResult {
  taskId: string;
  status: TaskStatus;
  xpAwarded: number;
  sprint: { progressPercent: number; tasksDone: number; tasksTotal: number };
}

export const getSquad = () => api.get<Squad>("/api/v1/interns/squad");
export const getSprint = () => api.get<Sprint>("/api/v1/interns/sprint");
export const getTasks = () => api.get<TaskBoard>("/api/v1/interns/tasks");
export const getLeaderboard = () => api.get<Leaderboard>("/api/v1/interns/leaderboard");

/** Moves an own task one step forward or back. */
export const moveTask = (taskId: string, status: TaskStatus) =>
  api.patch<MoveTaskResult>(`/api/v1/interns/tasks/${taskId}`, { status });

/* ---------- Session page: links to each member's work ---------- */

export type WorkLinkKind = "Figma" | "GitHub" | "LiveSite" | "Api" | "Demo" | "TestReport" | "Standup" | "Grooming" | "Other";

export interface SquadMemberLinks {
  studentId: string;
  firstName: string;
  fullName: string;
  photoUrl: string | null;
  role: SquadRole;
  isMe: boolean;
  totalXp: number;
  /** The kinds of link this member's role usually shares (suggested first). */
  kinds: WorkLinkKind[];
  links: { kind: WorkLinkKind; url: string }[];
  /** The member shared at least one link. */
  ready: boolean;
}

export interface SquadLinks {
  squadId: string;
  squadName: string;
  monitor: SquadMonitor | null;
  members: SquadMemberLinks[];
}

export const getSquadLinks = () => api.get<SquadLinks>("/api/v1/interns/squad/links");
/** Replaces the student's own links (any number up to 10, any kind); an empty list removes them all. */
export const saveMyLinks = (links: { kind: WorkLinkKind; url: string }[]) => api.put<SquadLinks>("/api/v1/interns/squad/links", { links });

/* ---------- Internship access, matchmaking and own tasks ---------- */

export interface LevelProgress {
  trackCode: string;
  trackName: string;
  level: string;
  done: number;
  total: number;
  percent: number;
  complete: boolean;
  /** Course: the levels of the track's first course (21 Oct 2026). TrackQuiz: a track with no course yet. */
  basis: "Course" | "TrackQuiz";
  /** The first course, for example HTML, when basis is Course. */
  courseTitle?: string | null;
}

export interface InternshipAccess {
  inSquad: boolean;
  /** In a squad, or the level is finished. */
  open: boolean;
  /** The squad's project is revealed, so the Internship dashboard is open. */
  projectRevealed?: boolean;
  level: LevelProgress | null;
  /** The last project the monitor approved, with the review. */
  lastProject?: {
    squadName: string;
    projectTitle: string;
    level: string;
    feedback: string | null;
    monitorName: string | null;
    approvedUtc: string | null;
  } | null;
}

export const getInternshipAccess = () => api.get<InternshipAccess>("/api/v1/interns/access");
/** Takes a free seat for the student's role in a squad of the same level (or starts a new squad with a hidden project). */
export const joinSquad = () => api.post<Squad>("/api/v1/interns/squad/join");
/** Writes a task for yourself; it starts in To Do. */
export const createTask = (title: string, storyPoints = 1) => api.post<SquadTask>("/api/v1/interns/tasks", { title, storyPoints });

/* ---------- Submitting the project for the monitor's review ---------- */

export type ProjectState = "InProgress" | "InReview" | "Completed";

export interface ProjectReview {
  decision: "Approved" | "ChangesRequested";
  feedback: string;
  monitorName: string;
  createdUtc: string;
}

export interface ProjectStatus {
  squadId: string;
  squadName: string;
  projectTitle: string;
  level: string;
  status: ProjectState;
  /** Members who submitted their work, of all members. */
  submitted: number;
  members: number;
  mySubmittedUtc: string | null;
  /** Newest first. */
  reviews: ProjectReview[];
}

export const getProjectStatus = () => api.get<ProjectStatus>("/api/v1/interns/project");
/** "I submitted my work": needs a link shared and every own task Done. */
export const submitWork = () => api.post<ProjectStatus>("/api/v1/interns/project/submit");
export const withdrawSubmission = () => api.delete<ProjectStatus>("/api/v1/interns/project/submit");

/* ---------- Team chat: the squad group (with the monitor) and private chats ---------- */

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderPhotoUrl: string | null;
  /** The other person of a private chat (from my side); null for the group chat. */
  with: string | null;
  body: string;
  sentUtc: string;
  isMine: boolean;
}

export interface ChatThread {
  /** Null for the group chat, else the monitor's or teammate's id. */
  with: string | null;
  kind: "Group" | "Monitor" | "Teammate";
  name: string;
  photoUrl: string | null;
  /** The teammate's role, or the monitor's title. */
  role: string | null;
  unread: number;
  lastMessage: ChatMessage | null;
}

/** Pushed on /hubs/live as "ChatMessage": group messages to the squad, private ones to the two people. */
export interface ChatMessageEvent {
  id: string;
  squadId: string;
  senderId: string;
  senderName: string;
  senderPhotoUrl: string | null;
  /** Null for the group chat. */
  recipientId: string | null;
  body: string;
  sentUtc: string;
}

export const CHAT_MAX_LENGTH = 1000;

const withQuery = (w: string | null, before?: string) => {
  const q = new URLSearchParams();
  if (w) q.set("with", w);
  if (before) q.set("before", before);
  const s = q.toString();
  return s ? `?${s}` : "";
};

/** A chat request that hangs (the API restarting, a slow network) fails after this long instead of loading forever. */
export const CHAT_TIMEOUT_MS = 15000;
const timeout = () => ({ signal: AbortSignal.timeout(CHAT_TIMEOUT_MS) });

export const getChatThreads = () => api.get<{ threads: ChatThread[] }>("/api/v1/interns/chat/threads", timeout());
/** The last 50 messages, oldest first; with before (the first message's sentUtc), the 50 before it. */
export const getChatMessages = (w: string | null, before?: string) =>
  api.get<{ messages: ChatMessage[]; hasMore: boolean }>(`/api/v1/interns/chat/messages${withQuery(w, before)}`, timeout());
export const sendChatMessage = (w: string | null, body: string) =>
  api.post<ChatMessage>("/api/v1/interns/chat/messages", { with: w, body }, timeout());
export const markChatRead = (w: string | null) => api.post<void>("/api/v1/interns/chat/read", { with: w }, timeout());
