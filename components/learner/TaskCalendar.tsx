"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, BellRing, CalendarPlus, ChevronLeft, ChevronRight, Clock, LoaderCircle, Pencil, Trash2 } from "lucide-react";
import { ApiError, errorMessage } from "@/lib/api-client";
import {
  daysUntil,
  fromDateKey,
  getCalendarTasks,
  loadPrefs,
  loadSeenIds,
  saveSeenIds,
  savePrefs,
  toDateKey,
  type CalendarPrefs,
  type CalendarTask,
} from "@/lib/calendar-api";
import { loadEvents, newEventId, saveEvents, sortEvents, type CalendarEvent } from "@/lib/calendar-events";
import type { TaskStatus } from "@/lib/interns-api";
import { useLiveChannel } from "@/lib/live-channel";
import { useI18n } from "@/lib/i18n/client";
import { tk, tNow } from "@/lib/i18n/translate";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const REMINDER_DAYS = [0, 1, 2, 3];

const STATUS_STYLE: Record<TaskStatus, { label: string; color: string }> = {
  ToDo: { label: tk("To Do"), color: "#8aa0b8" },
  InProgress: { label: tk("In Progress"), color: "#2f6fc4" },
  Review: { label: tk("In review"), color: "#a86a00" },
  Done: { label: tk("Done"), color: "#1f7a43" },
};

/** The squad has no tasks for this student yet: the calendar waits for them instead of showing an error. */
const EMPTY_CODES = ["NO_SQUAD", "PROJECT_NOT_READY"];

function dueLabel(days: number) {
  if (days === -1) return tNow("Overdue by 1 day");
  if (days < 0) return tNow("Overdue by {n} days", { n: -days });
  if (days === 0) return tNow("Due today");
  if (days === 1) return tNow("Due tomorrow");
  return tNow("Due in {n} days", { n: days });
}

function notify(title: string, body: string) {
  if (typeof Notification !== "undefined" && Notification.permission === "granted") new Notification(title, { body });
}

/**
 * Placeholder design: a month grid with the student's tasks on their due dates, a "due soon" list and the reminder settings.
 * Like the phone calendar, the student can open any day, add their own events there and jump to any month or year.
 * Tells the student when a new task arrives (live, or within a minute when the live channel is not connected).
 */
export default function TaskCalendar() {
  const { t, intl } = useI18n();
  const [today] = useState(() => new Date());
  const [cursor, setCursor] = useState(() => ({ year: today.getFullYear(), month: today.getMonth() }));
  const [selected, setSelected] = useState<string>(() => toDateKey(today));
  const [tasks, setTasks] = useState<CalendarTask[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [empty, setEmpty] = useState(false);
  const [newTasks, setNewTasks] = useState<CalendarTask[]>([]);
  const [prefs, setPrefs] = useState<CalendarPrefs>(() => loadPrefs());
  const [events, setEvents] = useState<CalendarEvent[]>(() => loadEvents());
  /** The add / edit form: id is null while adding. */
  const [draft, setDraft] = useState<{ id: string | null; title: string; time: string } | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const reload = useCallback(async () => {
    try {
      const list = await getCalendarTasks();
      setTasks(list);
      setError(null);
      setEmpty(false);

      const seen = loadSeenIds();
      const fresh = seen ? list.filter((t) => !seen.has(t.id)) : [];
      if (fresh.length > 0) {
        setNewTasks((prev) => [...fresh, ...prev.filter((p) => !fresh.some((f) => f.id === p.id))]);
        if (loadPrefs().remind) fresh.forEach((t) => notify(tNow("New task"), `${t.title} · ${dueLabel(daysUntil(t.dueDate, new Date()))}`));
      }
      saveSeenIds(new Set([...(seen ?? []), ...list.map((t) => t.id)]));
    } catch (e) {
      if (e instanceof ApiError && e.code && EMPTY_CODES.includes(e.code)) {
        setTasks([]);
        setEmpty(true);
        setError(null);
      } else {
        setError(errorMessage(e, "We couldn't load your calendar. Please try again."));
      }
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const live = useLiveChannel({
    TaskUpdated: () => {
      void reload();
    },
  });

  useEffect(() => {
    if (live) return;
    const timer = setInterval(() => void reload(), 60_000);
    return () => clearInterval(timer);
  }, [live, reload]);

  function update(next: CalendarPrefs) {
    setPrefs(next);
    savePrefs(next);
  }

  async function toggleReminders() {
    const remind = !prefs.remind;
    update({ ...prefs, remind });
    if (remind && typeof Notification !== "undefined" && Notification.permission === "default") await Notification.requestPermission();
  }

  const byDay = useMemo(() => {
    const map = new Map<string, CalendarTask[]>();
    for (const t of tasks ?? []) map.set(t.dueDate, [...(map.get(t.dueDate) ?? []), t]);
    return map;
  }, [tasks]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of events) map.set(e.date, [...(map.get(e.date) ?? []), e]);
    for (const [key, list] of map) map.set(key, sortEvents(list));
    return map;
  }, [events]);

  /** Tasks that are due soon (or overdue) and my own events from today up to the reminder window. */
  const reminders = useMemo(() => {
    const fromTasks = (tasks ?? [])
      .filter((x) => x.status !== "Done" && daysUntil(x.dueDate, today) <= prefs.daysBefore)
      .map((x) => ({ id: `task-${x.id}`, title: x.title, days: daysUntil(x.dueDate, today), isEvent: false }));
    const fromEvents = events
      .filter((e) => {
        const days = daysUntil(e.date, today);
        return days >= 0 && days <= prefs.daysBefore;
      })
      .map((e) => ({ id: `event-${e.id}`, title: e.time ? `${e.time} · ${e.title}` : e.title, days: daysUntil(e.date, today), isEvent: true }));
    return [...fromTasks, ...fromEvents].sort((x, y) => x.days - y.days);
  }, [tasks, events, today, prefs.daysBefore]);

  const first = new Date(cursor.year, cursor.month, 1);
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
  const lead = first.getDay();
  const cells: (Date | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(cursor.year, cursor.month, i + 1)),
  ];
  const todayKey = toDateKey(today);
  const dayTasks = byDay.get(selected) ?? [];
  const dayEvents = eventsByDay.get(selected) ?? [];

  /** Shows another month. The selected day moves with it (today if it is that month, otherwise the 1st), like the phone calendar. */
  function goTo(year: number, month: number) {
    const first = new Date(year, month, 1);
    setCursor({ year: first.getFullYear(), month: first.getMonth() });
    const isThisMonth = first.getFullYear() === today.getFullYear() && first.getMonth() === today.getMonth();
    setSelected(toDateKey(isThisMonth ? today : first));
    setDraft(null);
  }

  function shift(delta: number) {
    goTo(cursor.year, cursor.month + delta);
  }

  function selectDay(key: string) {
    setSelected(key);
    setDraft(null);
  }

  function persistEvents(next: CalendarEvent[]) {
    setEvents(next);
    saveEvents(next);
  }

  function submitEvent() {
    if (!draft) return;
    const title = draft.title.trim();
    if (!title) return;
    if (draft.id) persistEvents(events.map((e) => (e.id === draft.id ? { ...e, title, time: draft.time } : e)));
    else persistEvents([...events, { id: newEventId(), title, date: selected, time: draft.time }]);
    setDraft(null);
  }

  const monthNames = Array.from({ length: 12 }, (_, m) => new Date(2000, m, 1).toLocaleDateString(intl, { month: "long" }));
  const years = Array.from({ length: 21 }, (_, i) => today.getFullYear() - 10 + i);

  if (!tasks && !error) return <LoaderCircle className="mx-auto my-[1.5em] h-[1.6em] w-[1.6em] animate-spin text-[#12939b]" aria-label={t("Loading calendar")} />;

  return (
    <div className="grid gap-[0.9em]">
      {error && (
        <p role="alert" className="rounded-[0.8em] bg-[#fdecec] px-[0.9em] py-[0.5em] text-[0.8em] font-semibold text-[#b83232]">
          {error}
        </p>
      )}
      {empty && <p className="text-[0.8em] text-[#14365a]/70">{t("Your task calendar fills in when you join an internship squad and get tasks.")}</p>}

      {newTasks.length > 0 && (
        <div role="status" className="rounded-[0.8em] bg-[#e4f7f4] px-[0.9em] py-[0.6em] text-[0.8em] text-[#0f7a81]">
          <div className="flex items-center gap-[0.5em]">
            <BellRing className="h-[1.1em] w-[1.1em] shrink-0" />
            <span className="flex-1 font-bold">
              {newTasks.length === 1 ? t("You have a new task") : t("You have {n} new tasks", { n: newTasks.length })}
            </span>
            <button type="button" onClick={() => setNewTasks([])} className="font-semibold underline">
              {t("Dismiss")}
            </button>
          </div>
          <ul className="mt-[0.3em] grid gap-[0.2em]">
            {newTasks.map((t) => (
              <li key={t.id}>
                {t.title} · {dueLabel(daysUntil(t.dueDate, today))}
              </li>
            ))}
          </ul>
        </div>
      )}

      {reminders.length > 0 && prefs.remind && (
        <ul className="grid gap-[0.4em]">
          {reminders.map((r) => (
            <li
              key={r.id}
              className={`flex items-center gap-[0.6em] rounded-[0.8em] px-[0.9em] py-[0.5em] text-[0.8em] font-semibold ${
                r.days < 0 ? "bg-[#fdecec] text-[#b83232]" : "bg-[#fff1d6] text-[#a86a00]"
              }`}
            >
              <Bell className="h-[1.1em] w-[1.1em] shrink-0" />
              <span className="min-w-0 flex-1 truncate">{r.title}</span>
              <span className="shrink-0">{dueLabel(r.days)}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-[1em] bg-[#f6f9fc] p-[0.9em]">
        <div className="mb-[0.6em] flex items-center gap-[0.5em]">
          <button
            type="button"
            onClick={() => setPickerOpen((o) => !o)}
            aria-expanded={pickerOpen}
            aria-label={t("Choose month and year")}
            className="flex-1 rounded-[0.6em] px-[0.3em] py-[0.2em] text-start text-[0.95em] font-bold text-[#14365a] hover:bg-white"
          >
            {first.toLocaleDateString(intl, { month: "long", year: "numeric" })}
          </button>
          <button
            type="button"
            onClick={() => goTo(today.getFullYear(), today.getMonth())}
            className="rounded-full bg-white px-[0.8em] py-[0.35em] text-[0.75em] font-semibold text-[#0f7a81] shadow-sm hover:bg-[#e4f7f4]"
          >
            {t("Today")}
          </button>
          <button
            type="button"
            onClick={() => shift(-1)}
            aria-label={t("Previous month")}
            className="grid h-[2em] w-[2em] place-items-center rounded-full bg-white text-[#14365a] shadow-sm hover:bg-[#e4f7f4]"
          >
            <ChevronLeft className="h-[1em] w-[1em]" />
          </button>
          <button
            type="button"
            onClick={() => shift(1)}
            aria-label={t("Next month")}
            className="grid h-[2em] w-[2em] place-items-center rounded-full bg-white text-[#14365a] shadow-sm hover:bg-[#e4f7f4]"
          >
            <ChevronRight className="h-[1em] w-[1em]" />
          </button>
        </div>

        {pickerOpen && (
          <div className="mb-[0.6em] flex flex-wrap items-center gap-[0.6em] rounded-[0.8em] bg-white p-[0.6em] text-[0.8em] text-[#14365a]">
            <label className="flex items-center gap-[0.4em]">
              {t("Month")}
              <select
                value={cursor.month}
                onChange={(e) => goTo(cursor.year, Number(e.target.value))}
                className="rounded-[0.6em] border border-[#e1e8f0] bg-white px-[0.5em] py-[0.25em]"
              >
                {monthNames.map((name, m) => (
                  <option key={m} value={m}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-[0.4em]">
              {t("Year")}
              <select
                value={cursor.year}
                onChange={(e) => goTo(Number(e.target.value), cursor.month)}
                className="rounded-[0.6em] border border-[#e1e8f0] bg-white px-[0.5em] py-[0.25em]"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        <div dir="ltr" className="grid grid-cols-7 gap-[0.2em] text-center">
          {WEEKDAYS.map((d) => (
            <span key={d} className="py-[0.3em] text-[0.7em] font-semibold text-[#14365a]/55">
              {t(d)}
            </span>
          ))}
          {cells.map((date, i) => {
            if (!date) return <span key={`blank-${i}`} />;
            const key = toDateKey(date);
            const list = byDay.get(key) ?? [];
            const dayEv = eventsByDay.get(key) ?? [];
            const isSelected = key === selected;
            const count = list.length + dayEv.length;
            const dots = [...list.map((x) => STATUS_STYLE[x.status].color), ...dayEv.map(() => "#12939b")].slice(0, 3);
            return (
              <button
                key={key}
                type="button"
                onClick={() => selectDay(key)}
                aria-label={`${date.toLocaleDateString(intl, { month: "long", day: "numeric" })}${count ? `، ${count === 1 ? t("1 item") : t("{n} items", { n: count })}` : ""}`}
                aria-pressed={isSelected}
                className={`grid aspect-square place-items-center rounded-[0.7em] text-[0.8em] font-semibold transition ${
                  isSelected ? "bg-[#14365a] text-white" : "bg-white text-[#14365a] hover:bg-[#e4f7f4]"
                } ${key === todayKey && !isSelected ? "ring-2 ring-[#12939b]" : ""}`}
              >
                <span className="flex flex-col items-center leading-none">
                  {date.getDate()}
                  <span className="mt-[0.25em] flex h-[0.4em] gap-[0.15em]">
                    {dots.map((color, n) => (
                      <span key={n} className="h-[0.4em] w-[0.4em] rounded-full" style={{ backgroundColor: isSelected ? "#ffffff" : color }} />
                    ))}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-[0.4em] flex items-center gap-[0.6em]">
          <p className="flex-1 text-[0.8em] font-bold text-[#14365a]">
            {fromDateKey(selected).toLocaleDateString(intl, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
          {!draft && (
            <button
              type="button"
              onClick={() => setDraft({ id: null, title: "", time: "" })}
              className="inline-flex items-center gap-[0.4em] rounded-full bg-[#14365a] px-[0.9em] py-[0.4em] text-[0.75em] font-semibold text-white hover:bg-[#0f2a47]"
            >
              <CalendarPlus className="h-[1.1em] w-[1.1em]" />
              {t("Add event")}
            </button>
          )}
        </div>

        {draft && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitEvent();
            }}
            className="mb-[0.5em] grid gap-[0.5em] rounded-[0.8em] border border-[#e1e8f0] bg-white p-[0.7em] text-[0.8em]"
          >
            <input
              autoFocus
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              maxLength={80}
              placeholder={t("Event title")}
              aria-label={t("Event title")}
              className="rounded-[0.6em] border border-[#e1e8f0] px-[0.7em] py-[0.5em] text-[#14365a] outline-none focus:border-[#12939b]"
            />
            <label className="flex items-center gap-[0.5em] text-[#14365a]">
              <Clock className="h-[1.1em] w-[1.1em] shrink-0" />
              {t("Time (optional)")}
              <input
                type="time"
                value={draft.time}
                onChange={(e) => setDraft({ ...draft, time: e.target.value })}
                className="rounded-[0.6em] border border-[#e1e8f0] px-[0.5em] py-[0.25em] text-[#14365a]"
              />
            </label>
            <div className="flex justify-end gap-[0.5em]">
              <button type="button" onClick={() => setDraft(null)} className="rounded-full px-[0.9em] py-[0.4em] font-semibold text-[#14365a]/70 hover:bg-[#eef2f6]">
                {t("Cancel")}
              </button>
              <button
                type="submit"
                disabled={!draft.title.trim()}
                className="rounded-full bg-[#12939b] px-[1em] py-[0.4em] font-semibold text-white hover:bg-[#0f7a81] disabled:opacity-50"
              >
                {t("Save")}
              </button>
            </div>
          </form>
        )}

        {dayTasks.length === 0 && dayEvents.length === 0 ? (
          <p className="text-[0.8em] text-[#14365a]/60">{t("Nothing planned for this day.")}</p>
        ) : (
          <ul className="grid gap-[0.4em]">
            {dayEvents.map((ev) => (
              <li key={ev.id} className="flex items-center gap-[0.6em] rounded-[0.8em] border border-[#e8eef5] bg-[#f3fbfa] px-[0.9em] py-[0.5em]">
                <span className="h-[0.7em] w-[0.7em] shrink-0 rounded-full bg-[#12939b]" />
                <span className="min-w-0 flex-1 truncate text-[0.85em] font-semibold text-[#14365a]">
                  {ev.time && (
                    <span dir="ltr" className="me-[0.5em] font-normal text-[#14365a]/65">
                      {ev.time}
                    </span>
                  )}
                  {ev.title}
                </span>
                <button
                  type="button"
                  onClick={() => setDraft({ id: ev.id, title: ev.title, time: ev.time })}
                  aria-label={t("Edit event")}
                  className="grid h-[1.9em] w-[1.9em] place-items-center rounded-full text-[#14365a]/70 hover:bg-white"
                >
                  <Pencil className="h-[1em] w-[1em]" />
                </button>
                <button
                  type="button"
                  onClick={() => persistEvents(events.filter((x) => x.id !== ev.id))}
                  aria-label={t("Delete event")}
                  className="grid h-[1.9em] w-[1.9em] place-items-center rounded-full text-[#b83232] hover:bg-white"
                >
                  <Trash2 className="h-[1em] w-[1em]" />
                </button>
              </li>
            ))}
            {dayTasks.map((x) => (
              <li key={x.id} className="flex items-center gap-[0.6em] rounded-[0.8em] border border-[#e8eef5] px-[0.9em] py-[0.5em]">
                <span className="h-[0.7em] w-[0.7em] shrink-0 rounded-full" style={{ backgroundColor: STATUS_STYLE[x.status].color }} />
                <span className={`min-w-0 flex-1 truncate text-[0.85em] font-semibold text-[#14365a] ${x.status === "Done" ? "line-through opacity-60" : ""}`}>{x.title}</span>
                <span className="shrink-0 text-[0.75em] text-[#14365a]/65">
                  {t(STATUS_STYLE[x.status].label)}
                  {x.dueFromSprint ? ` · ${t("sprint end")}` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-[0.8em] border-t border-[#e8eef5] pt-[0.8em] text-[0.8em] text-[#14365a]">
        <button
          type="button"
          role="switch"
          aria-checked={prefs.remind}
          onClick={() => void toggleReminders()}
          className={`inline-flex items-center gap-[0.4em] rounded-full px-[0.9em] py-[0.4em] font-semibold transition ${
            prefs.remind ? "bg-[#e4f7f4] text-[#0f7a81]" : "bg-[#eef2f6] text-[#14365a]/70"
          }`}
        >
          {prefs.remind ? <BellRing className="h-[1.1em] w-[1.1em]" /> : <Bell className="h-[1.1em] w-[1.1em]" />}
          {prefs.remind ? t("Reminders on") : t("Reminders off")}
        </button>
        <label className="flex items-center gap-[0.4em]">
          {t("Remind me")}
          <select
            value={prefs.daysBefore}
            onChange={(e) => update({ ...prefs, daysBefore: Number(e.target.value) })}
            disabled={!prefs.remind}
            className="rounded-[0.6em] border border-[#e1e8f0] bg-white px-[0.5em] py-[0.25em] text-[#14365a] disabled:opacity-50"
          >
            {REMINDER_DAYS.map((d) => (
              <option key={d} value={d}>
                {d === 0 ? t("on the day") : d === 1 ? t("1 day before") : t("{n} days before", { n: d })}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
