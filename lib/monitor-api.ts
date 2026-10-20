/** Mentor accounts monitoring their squads (backend MonitorController, decision of 21 Oct 2026). */
import { api } from "@/lib/api-client";
import type { ProjectStatus, WorkLinkKind } from "@/lib/interns-api";

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
