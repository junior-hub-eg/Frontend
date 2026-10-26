import { dateLocale, tk, tNow } from "@/lib/i18n/translate";
/** My Projects (backend ProjectsController): the student's current and past squad projects. */
import { api } from "@/lib/api-client";

export type ProjectStatus = "InProgress" | "InReview" | "Completed";
export type ProjectLinkKind = "Figma" | "GitHub" | "LiveSite" | "Api" | "Demo" | "TestReport" | "Standup" | "Grooming" | "Other";

/** The mentor who supervises the project (not the student's own mentor). */
export interface ProjectMonitor {
  id: string;
  fullName: string;
  title: string;
  trackCode: string;
  photoUrl: string;
  skills: string[];
}

export interface ProjectSummary {
  /** The squad's id: one project per squad. */
  id: string;
  title: string;
  description: string;
  squadName: string;
  status: ProjectStatus;
  role: string;
  level: string;
  startedUtc: string;
  /** Null while the project is not completed. */
  endedUtc: string | null;
  isCurrent: boolean;
  progressPercent: number;
  /** Done tasks of the whole squad. */
  tasksDone: number;
  tasksTotal: number;
  /** Done tasks assigned to the student. */
  myTasksDone: number;
  links: { kind: ProjectLinkKind; url: string }[];
  monitor: ProjectMonitor | null;
  /** The catalog project's logo, or null (27 Oct 2026). */
  logoUrl?: string | null;
  /** The project time; null for squads formed before the catalog. */
  durationWeeks?: number | null;
  /** The links the admin prepared with the project: chat, meeting, Figma, ... */
  projectLinks?: CatalogLink[];
}

export type CatalogLinkKind = "Chat" | "Meeting" | "Figma" | "GitHub" | "Drive" | "Docs" | "Other";

/** A link the admin prepared with the project; an empty label shows the kind. */
export interface CatalogLink {
  kind: CatalogLinkKind;
  label: string;
  url: string;
}

export interface MyProjects {
  current: ProjectSummary | null;
  projects: ProjectSummary[];
}

export interface ProjectSprint {
  name: string;
  /** yyyy-mm-dd */
  startDate: string;
  endDate: string;
  daysLeft: number;
  tasksDone: number;
  tasksTotal: number;
  storyPointsDone: number;
  storyPointsTotal: number;
}

export interface ProjectTask {
  id: string;
  title: string;
  /** ToDo, InProgress, Review or Done. */
  status: string;
  storyPoints: number;
  sprintName: string;
}

export interface ProjectDetail {
  project: ProjectSummary;
  /** The active sprint, or the last one. */
  sprint: ProjectSprint | null;
  myTasks: ProjectTask[];
}

/** The project as a PRD, with the links each teammate submits (GET student/projects/{id}/brief). */
export interface ProjectBrief {
  squadId: string;
  squadName: string;
  title: string;
  description: string;
  logoUrl: string | null;
  level: string;
  status: ProjectStatus;
  durationWeeks: number | null;
  teamSize: number;
  startedUtc: string | null;
  /** The reveal plus the project time. */
  dueUtc: string | null;
  problem: string;
  goals: string[];
  targetUsers: string[];
  useCases: string[];
  requirements: string[];
  deliverables: string[];
  acceptanceCriteria: string[];
  techStack: string[];
  links: CatalogLink[];
  detailedUseCases: BriefUseCase[];
  members: BriefMember[];
}

/** A use case the admin wrote in full for the squad. */
export interface BriefUseCase {
  id: string;
  title: string;
  actor: string;
  description: string;
  preconditions: string;
  /** One step per line. */
  mainFlow: string;
  /** One point per line. */
  acceptanceCriteria: string;
  role: string | null;
}

export interface BriefMember {
  studentId: string;
  fullName: string;
  photoUrl: string | null;
  role: string;
  isMe: boolean;
  /** The links the role submits (required), then others the member shared; url null while missing. */
  links: { kind: ProjectLinkKind; url: string | null; required: boolean }[];
  /** When they handed in their work; null while they have not. */
  submittedUtc: string | null;
}

export const getProjectBrief = (id: string) =>
  api.get<ProjectBrief>(`/api/v1/student/projects/${encodeURIComponent(id)}/brief`);

export const getMyProjects = () => api.get<MyProjects>("/api/v1/student/projects");
export const getMyProject = (id: string) => api.get<ProjectDetail>(`/api/v1/student/projects/${encodeURIComponent(id)}`);

/* ---------- Display helpers shared by the three pages ---------- */

export const STATUS_LABEL: Record<ProjectStatus, string> = { InProgress: tk("Active"), InReview: tk("In review"), Completed: tk("Completed") };

export const ROLE_LABEL: Record<string, string> = {
  Frontend: tk("Front-end Developer"),
  Backend: tk("Back-end Developer"),
  UIUX: tk("UI/UX Designer"),
  AI: tk("AI Engineer"),
  Testing: tk("QA Tester"),
  Data: tk("Data Analyst"),
  Mobile: tk("Mobile Developer"),
  Gaming: tk("Game Developer"),
};

export const LINK_LABEL: Record<ProjectLinkKind, { label: string; note: string }> = {
  Figma: { label: tk("Figma"), note: tk("Design file") },
  GitHub: { label: tk("GitHub"), note: tk("Repository") },
  LiveSite: { label: tk("Live site"), note: tk("Live preview") },
  Api: { label: tk("API"), note: tk("Server") },
  Demo: { label: tk("Demo"), note: tk("Try it") },
  TestReport: { label: tk("Test report"), note: tk("Bugs and checks") },
  Standup: { label: tk("Standup"), note: tk("Daily meeting") },
  Grooming: { label: tk("Grooming"), note: tk("Backlog meeting") },
  Other: { label: tk("Other"), note: tk("More work") },
};

const date = (iso: string, withYear = true) =>
  new Date(iso).toLocaleDateString(dateLocale("en-US"), { month: "short", day: "numeric", ...(withYear ? { year: "numeric" } : {}) });

/** "Jul 6, 2026 - Present" or "Mar 2 - Jun 12, 2026". */
export function projectDuration(p: Pick<ProjectSummary, "startedUtc" | "endedUtc">) {
  if (!p.endedUtc) return `${date(p.startedUtc)} - ${tNow("Present")}`;
  const sameYear = new Date(p.startedUtc).getFullYear() === new Date(p.endedUtc).getFullYear();
  return `${date(p.startedUtc, !sameYear)} - ${date(p.endedUtc)}`;
}

/** "Sep 21 - Sep 27, 2026" from yyyy-mm-dd dates. */
export const sprintDates = (s: Pick<ProjectSprint, "startDate" | "endDate">) =>
  `${date(`${s.startDate}T12:00:00Z`, false)} - ${date(`${s.endDate}T12:00:00Z`)}`;
