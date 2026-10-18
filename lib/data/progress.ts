/**
 * MOCK lesson progress — localStorage-backed, client-side only (same approach as lib/auth/mock-auth.ts).
 * Replace with the Progress API when the backend ships.
 */
const KEY_PREFIX = "jh_mock_progress:";
const ACTIVE_TRACK_KEY = "jh_mock_active_track";
const EMPTY: string[] = [];

type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeProgress(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit() {
  listeners.forEach((l) => l());
}

const cache = new Map<string, { raw: string | null; value: string[] }>();

/** Stable-reference snapshot getter for useSyncExternalStore. */
export function getCompletedLessons(trackSlug: string): string[] {
  if (typeof window === "undefined") return EMPTY;
  const raw = window.localStorage.getItem(KEY_PREFIX + trackSlug);
  const hit = cache.get(trackSlug);
  if (hit && hit.raw === raw) return hit.value;
  let value = EMPTY;
  try {
    value = raw ? (JSON.parse(raw) as string[]) : EMPTY;
  } catch {
    value = EMPTY;
  }
  cache.set(trackSlug, { raw, value });
  return value;
}

export function getServerCompletedLessons(): string[] {
  return EMPTY;
}

export function markLessonComplete(trackSlug: string, lessonId: string) {
  const current = getCompletedLessons(trackSlug);
  if (current.includes(lessonId)) return;
  window.localStorage.setItem(KEY_PREFIX + trackSlug, JSON.stringify([...current, lessonId]));
  emit();
}

export function setActiveTrack(trackSlug: string) {
  window.localStorage.setItem(ACTIVE_TRACK_KEY, trackSlug);
  emit();
}
