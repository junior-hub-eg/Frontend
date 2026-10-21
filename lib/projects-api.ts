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

export const getMyProjects = () => api.get<MyProjects>("/api/v1/student/projects");
export const getMyProject = (id: string) => api.get<ProjectDetail>(`/api/v1/student/projects/${encodeURIComponent(id)}`);

/* ---------- Display helpers shared by the three pages ---------- */

export const STATUS_LABEL: Record<ProjectStatus, string> = { InProgress: "Active", InReview: "In review", Completed: "Completed" };

export const ROLE_LABEL: Record<string, string> = {
  Frontend: "Front-end Developer",
  Backend: "Back-end Developer",
  UIUX: "UI/UX Designer",
  AI: "AI Engineer",
  Testing: "QA Tester",
  Data: "Data Analyst",
  Mobile: "Mobile Developer",
  Gaming: "Game Developer",
};

export const LINK_LABEL: Record<ProjectLinkKind, { label: string; note: string }> = {
  Figma: { label: "Figma", note: "Design file" },
  GitHub: { label: "GitHub", note: "Repository" },
  LiveSite: { label: "Live site", note: "Live preview" },
  Api: { label: "API", note: "Server" },
  Demo: { label: "Demo", note: "Try it" },
  TestReport: { label: "Test report", note: "Bugs and checks" },
  Standup: { label: "Standup", note: "Daily meeting" },
  Grooming: { label: "Grooming", note: "Backlog meeting" },
  Other: { label: "Other", note: "More work" },
};

const date = (iso: string, withYear = true) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", ...(withYear ? { year: "numeric" } : {}) });

/** "Jul 6, 2026 - Present" or "Mar 2 - Jun 12, 2026". */
export function projectDuration(p: Pick<ProjectSummary, "startedUtc" | "endedUtc">) {
  if (!p.endedUtc) return `${date(p.startedUtc)} - Present`;
  const sameYear = new Date(p.startedUtc).getFullYear() === new Date(p.endedUtc).getFullYear();
  return `${date(p.startedUtc, !sameYear)} - ${date(p.endedUtc)}`;
}

/** "Sep 21 - Sep 27, 2026" from yyyy-mm-dd dates. */
export const sprintDates = (s: Pick<ProjectSprint, "startDate" | "endDate">) =>
  `${date(`${s.startDate}T12:00:00Z`, false)} - ${date(`${s.endDate}T12:00:00Z`)}`;
