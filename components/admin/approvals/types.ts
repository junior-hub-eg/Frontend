export type ApprovalKind = "squad" | "session" | "milestone" | "certificate" | "signup";

export type Priority = "urgent" | "medium" | "normal";

export type ApprovalTab = "all" | ApprovalKind;

/** What the "Selected Inspector" card shows for one request. */
export type InspectorInfo = {
  ticket: string;
  idLabel: string;
  chips: string[];
  /** Two-column info cards (e.g. current squad / target squad). */
  cards: { label: string; value: string; accent?: boolean }[];
  progress?: { label: string; pct: number; note: string };
  quote?: { title: string; by: string; text: string };
  approveLabel: string;
};

/** One row of the queue. Sign-ups come from the API, the rest is mock for now. */
export type QueueItem = {
  id: string;
  source: "api" | "mock";
  kind: ApprovalKind;
  priority: Priority;
  name: string;
  /** "Student • Code Crew" */
  subtitle: string;
  /** The short quoted line under the name. */
  note: string;
  typeLabel: string;
  context: string;
  submitted: string;
  sla: string;
  /** Show the SLA line in red (blocked). */
  slaAlert?: boolean;
  /** Label of the main button on the row. */
  primaryLabel: string;
  inspector: InspectorInfo;
};