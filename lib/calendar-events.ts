/**
 * The student's own calendar events (any day, like the phone calendar).
 * Kept in this browser (localStorage) until there is an endpoint for them.
 */
export interface CalendarEvent {
  id: string;
  title: string;
  /** yyyy-mm-dd */
  date: string;
  /** HH:mm, or empty for an all-day event */
  time: string;
}

const EVENTS_KEY = "jh_calendar_events";

export function loadEvents(): CalendarEvent[] {
  try {
    const raw = window.localStorage.getItem(EVENTS_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is CalendarEvent =>
        !!e && typeof e.id === "string" && typeof e.title === "string" && typeof e.date === "string" && typeof e.time === "string",
    );
  } catch {
    return [];
  }
}

export function saveEvents(list: CalendarEvent[]) {
  try {
    window.localStorage.setItem(EVENTS_KEY, JSON.stringify(list));
  } catch {
    // storage blocked: the events last until the page closes
  }
}

export function newEventId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/** All-day events first, then by time. */
export function sortEvents(list: CalendarEvent[]) {
  return [...list].sort((a, b) => a.time.localeCompare(b.time));
}
