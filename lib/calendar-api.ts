/**
 * Task calendar: the student's own squad tasks placed on their due dates.
 *
 * The backend task (GET /api/v1/interns/tasks) has no due date yet. When it starts sending `dueDate`
 * (yyyy-mm-dd or an ISO string) it is used as is; until then a task falls back to the end date of the
 * active sprint, so every task already lands on a day. Reminder settings live in this browser only
 * (localStorage) until there is an endpoint for them.
 */
import { getSprint, getTasks, type SquadTask, type TaskStatus } from "@/lib/interns-api";

type TaskWithDue = SquadTask & { dueDate?: string | null };

export interface CalendarTask {
  id: string;
  title: string;
  status: TaskStatus;
  storyPoints: number;
  /** yyyy-mm-dd */
  dueDate: string;
  /** True while the date is the sprint's end date, not a date set for the task. */
  dueFromSprint: boolean;
}

/** My tasks of the active sprint, each with its due date. */
export async function getCalendarTasks(): Promise<CalendarTask[]> {
  const [board, sprint] = await Promise.all([getTasks(), getSprint().catch(() => null)]);
  const sprintEnd = sprint?.endDate ? sprint.endDate.slice(0, 10) : null;

  const tasks: CalendarTask[] = [];
  for (const column of board.columns) {
    for (const task of column.tasks as TaskWithDue[]) {
      if (!task.isMine) continue;
      const own = task.dueDate ? task.dueDate.slice(0, 10) : null;
      const dueDate = own ?? sprintEnd;
      if (!dueDate) continue;
      tasks.push({
        id: task.id,
        title: task.title,
        status: task.status,
        storyPoints: task.storyPoints,
        dueDate,
        dueFromSprint: own === null,
      });
    }
  }
  return tasks.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

/* ---------- Dates ---------- */

/** Local date as yyyy-mm-dd. */
export function toDateKey(d: Date) {
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

export function fromDateKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Whole days from today to the date: 0 is today, negative is overdue. */
export function daysUntil(key: string, today: Date) {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  return Math.round((fromDateKey(key).getTime() - start) / 86_400_000);
}

/* ---------- Reminder settings and "already seen" tasks (this browser only) ---------- */

export interface CalendarPrefs {
  /** Remind me about tasks that are due soon, and tell me when a new task arrives. */
  remind: boolean;
  /** How many days before the due date the reminder starts. */
  daysBefore: number;
}

const PREFS_KEY = "jh_task_calendar_prefs";
const SEEN_KEY = "jh_task_calendar_seen";
export const DEFAULT_PREFS: CalendarPrefs = { remind: true, daysBefore: 1 };

export function loadPrefs(): CalendarPrefs {
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<CalendarPrefs>;
    return {
      remind: typeof parsed.remind === "boolean" ? parsed.remind : DEFAULT_PREFS.remind,
      daysBefore: typeof parsed.daysBefore === "number" ? parsed.daysBefore : DEFAULT_PREFS.daysBefore,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePrefs(prefs: CalendarPrefs) {
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // storage blocked: the setting lasts until the page closes
  }
}

/** Ids of tasks the student was already told about. Null the first time, so old tasks don't all count as new. */
export function loadSeenIds(): Set<string> | null {
  try {
    const raw = window.localStorage.getItem(SEEN_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : null;
  } catch {
    return null;
  }
}

export function saveSeenIds(ids: Set<string>) {
  try {
    window.localStorage.setItem(SEEN_KEY, JSON.stringify([...ids]));
  } catch {
    // storage blocked
  }
}
