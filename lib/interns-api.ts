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

export interface Squad {
  id: string;
  name: string;
  projectTitle: string;
  projectDescription: string;
  members: SquadMember[];
  monitor: SquadMonitor | null;
}

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

export type WorkLinkKind = "Figma" | "GitHub" | "LiveSite" | "Api" | "Demo" | "TestReport" | "Other";

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
  /** Lessons (the level's lessons) or TrackQuiz (a track without lessons at that level). */
  basis: "Lessons" | "TrackQuiz";
}

export interface InternshipAccess {
  inSquad: boolean;
  /** In a squad, or the level is finished. */
  open: boolean;
  level: LevelProgress | null;
}

export const getInternshipAccess = () => api.get<InternshipAccess>("/api/v1/interns/access");
/** Joins a squad of the same level from other tracks (or a new one with a random project). */
export const joinSquad = () => api.post<Squad>("/api/v1/interns/squad/join");
/** Writes a task for yourself; it starts in To Do. */
export const createTask = (title: string, storyPoints = 1) => api.post<SquadTask>("/api/v1/interns/tasks", { title, storyPoints });
