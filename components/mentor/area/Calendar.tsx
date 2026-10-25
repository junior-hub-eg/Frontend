"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Route } from "next";
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Clock, MessageSquare, Users, X } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { useI18n } from "@/lib/i18n/client";
import {
  addTimeOff, cancelMentorSession, getMentorCalendar, getMonitorAvailability, moveMentorSession, removeTimeOff, saveMonitorAvailability,
  type CalendarSession, type MentorAvailability, type MentorCalendar, type Weekday,
} from "@/lib/monitor-api";
import { cn } from "@/lib/utils";
import {
  Card, Dialog, ErrorState, Field, MentorAvatar, MentorPage, Pill, PrimaryButton, SecondaryButton, SegmentTabs, Skeleton, UnderlineTabs, inputCls,
} from "../mentor-area-ui";
import { useApi } from "../use-api";

const WEEK: Weekday[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
type Selected = { kind: "session"; session: CalendarSession } | { kind: "mark"; mark: MentorCalendar["marks"][number] } | null;

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

export default function Calendar() {
  const { t } = useI18n();
  const params = useSearchParams();
  const [tab, setTab] = useState<"calendar" | "availability">(params.get("tab") === "availability" ? "availability" : "calendar");
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const range = useMemo(() => {
    const from = addDays(month, -month.getDay());
    return { from, to: addDays(from, 42) };
  }, [month]);
  const cal = useApi(() => getMentorCalendar(range.from.toISOString(), range.to.toISOString()), [range.from.getTime()]);
  const avail = useApi(getMonitorAvailability);

  return (
    <MentorPage title={t("Calendar")} subtitle={t("Your sprints, sessions and review due dates.")}>
      {cal.error ? <ErrorState title={t("We could not load your calendar")} onRetry={cal.reload} error={cal.error} /> : tab === "calendar" ? (
        <CalendarView month={month} setMonth={setMonth} data={cal.data} loading={cal.loading} reload={cal.reload} tab={tab} setTab={setTab} avail={avail.data} />
      ) : (
        <AvailabilityView data={avail.data} loading={avail.loading} reload={avail.reload} calendar={cal.data} reloadCalendar={cal.reload} tab={tab} setTab={setTab} />
      )}
    </MentorPage>
  );
}

function Tabs({ tab, setTab }: { tab: "calendar" | "availability"; setTab: (v: "calendar" | "availability") => void }) {
  const { t } = useI18n();
  return <UnderlineTabs value={tab} onChange={setTab} tabs={[{ value: "calendar", label: t("Calendar") }, { value: "availability", label: t("Availability") }]} />;
}

function CalendarView({ month, setMonth, data, loading, reload, tab, setTab, avail }: {
  month: Date; setMonth: (d: Date) => void; data: MentorCalendar | null; loading: boolean; reload: () => void;
  tab: "calendar" | "availability"; setTab: (v: "calendar" | "availability") => void; avail: MentorAvailability | null;
}) {
  const { t, intl } = useI18n();
  const [view, setView] = useState<"month" | "week" | "list">("month");
  const [picked, setSelected] = useState<Selected>(null);
  const [weekStart, setWeekStart] = useState(() => addDays(new Date(), -new Date().getDay()));
  const [today] = useState(() => new Date());
  // The next session is shown until something else is picked.
  const next = data?.sessions.find((s) => new Date(s.startsUtc) >= today);
  const selected: Selected = picked ?? (next ? { kind: "session", session: next } : null);

  const days = Array.from({ length: 42 }, (_, i) => addDays(addDays(month, -month.getDay()), i));
  const eventsOn = (d: Date) => ({
    marks: data?.marks.filter((m) => sameDay(new Date(m.atUtc), d)) ?? [],
    sessions: data?.sessions.filter((s) => sameDay(new Date(s.startsUtc), d)) ?? [],
    off: data?.timeOff.some((o) => { const k = d.toISOString().slice(0, 10); return k >= o.startDate && k <= o.endDate; }) ?? false,
  });
  const time = (iso: string) => new Date(iso).toLocaleTimeString(intl, { hour: "numeric", minute: "2-digit" });
  const markLabel = (m: MentorCalendar["marks"][number]) =>
    m.kind === "ReviewDue" ? `${t("Review due")} · ${m.squadName}` : `${m.sprintName ?? t("Sprint")} ${m.kind === "SprintStarts" ? t("starts") : t("ends")}`;
  const sessionLabel = (s: CalendarSession) =>
    `${time(s.startsUtc)} · ${s.type === "Group" ? t("Group") : `1:1 ${s.students[0]?.fullName.split(" ")[0] ?? ""}`}`;

  const chips = (d: Date, max = 3) => {
    const e = eventsOn(d);
    const all = [
      ...e.marks.map((m) => ({ key: `m${m.atUtc}${m.squadId}`, label: markLabel(m), cls: m.kind === "ReviewDue" ? "bg-[#fff1e3] text-[#c2570c]" : "bg-[#e0f4f2] text-[#0f7378]", sel: { kind: "mark", mark: m } as Selected })),
      ...e.sessions.map((s) => ({ key: s.id, label: sessionLabel(s), cls: s.overlaps ? "bg-[#e6ebf1] text-[#1b2d54] ring-1 ring-[#e5484d]/40" : "bg-[#e6f0ff] text-[#1d5fd1]", sel: { kind: "session", session: s } as Selected })),
    ];
    return (
      <>
        {e.off && <span className="block truncate rounded-[0.4em] bg-[#eef1f5] px-[0.4em] py-[0.15em] text-[0.7em] text-[#475467]">{t("Time off")}</span>}
        {all.slice(0, max).map((c) => (
          <button key={c.key} type="button" onClick={() => setSelected(c.sel)} className={cn("mt-[0.25em] block w-full truncate rounded-[0.4em] px-[0.4em] py-[0.15em] text-start text-[0.7em] font-medium", c.cls)}>{c.label}</button>
        ))}
        {all.length > max && <span className="text-[0.65em] text-[#64748b]">+{all.length - max}</span>}
      </>
    );
  };

  return (
    <div className="grid items-start gap-[1.4em] xl:grid-cols-[1fr_22em]">
      <Card>
        <div className="mb-[1em] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-[0.8em]">
            <SegmentTabs value={view} onChange={setView} tabs={[{ value: "month", label: t("Month") }, { value: "week", label: t("Week") }, { value: "list", label: t("List") }]} />
            <button type="button" aria-label={t("Previous")} onClick={() => view === "week" ? setWeekStart(addDays(weekStart, -7)) : setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
              className="grid size-[2.2em] place-items-center rounded-[0.6em] border border-[#d6dde6]"><ChevronLeft className="size-[1em] rtl:-scale-x-100" /></button>
            <button type="button" aria-label={t("Next")} onClick={() => view === "week" ? setWeekStart(addDays(weekStart, 7)) : setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
              className="grid size-[2.2em] place-items-center rounded-[0.6em] border border-[#d6dde6]"><ChevronRight className="size-[1em] rtl:-scale-x-100" /></button>
            <h2 className="text-[1.3em] font-bold text-[#1b2d54]">{(view === "week" ? weekStart : month).toLocaleDateString(intl, { month: "long", year: "numeric" })}</h2>
          </div>
          <div className="flex gap-[1em] text-[0.75em] text-[#475467]">
            <span className="flex items-center gap-1"><span className="size-[0.55em] rounded-full bg-[#0f7378]" />{t("Sprints")}</span>
            <span className="flex items-center gap-1"><span className="size-[0.55em] rounded-full bg-[#2563eb]" />{t("Sessions")}</span>
            <span className="flex items-center gap-1"><span className="size-[0.55em] rounded-full bg-[#f59e0b]" />{t("Review due")}</span>
          </div>
        </div>
        <Tabs tab={tab} setTab={setTab} />
        <div className="pt-[1em]">
          {loading ? <Skeleton className="h-[28em] w-full rounded-[1em]" /> : view === "month" ? (
            <div className="overflow-hidden rounded-[1em] border border-[#e6ebf1]">
              <div className="grid grid-cols-7 bg-[#f4f7fa] text-center text-[0.8em] font-medium text-[#475467]">
                {WEEK.map((d) => <div key={d} className="py-[0.6em]">{t(d.slice(0, 3))}</div>)}
              </div>
              <div className="grid grid-cols-7">
                {days.map((d) => {
                  const inMonth = d.getMonth() === month.getMonth();
                  const isToday = sameDay(d, today);
                  return (
                    <div key={d.toISOString()} className={cn("min-h-[6.4em] border-t border-e border-[#eef2f6] p-[0.4em] [&:nth-child(7n)]:border-e-0", isToday && "bg-[#eef8f7]")}>
                      <span className={cn("grid size-[1.7em] place-items-center rounded-full text-[0.8em]", isToday ? "bg-[#1b2d54] font-bold text-white" : inMonth ? "text-[#1b2d54]" : "text-[#cbd5e1]")}>{d.getDate()}</span>
                      {inMonth && chips(d)}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : view === "week" ? (
            <div className="grid gap-[0.6em] md:grid-cols-7">
              {Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)).map((d) => (
                <div key={d.toISOString()} className={cn("min-h-[14em] rounded-[0.9em] border border-[#e6ebf1] p-[0.6em]", sameDay(d, today) && "bg-[#eef8f7]")}>
                  <p className="text-[0.75em] font-semibold text-[#475467]">{d.toLocaleDateString(intl, { weekday: "short", day: "numeric" })}</p>
                  {chips(d, 8)}
                </div>
              ))}
            </div>
          ) : (
            <ul className="divide-y divide-[#eef2f6]">
              {[...(data?.marks.map((m) => ({ at: m.atUtc, sel: { kind: "mark", mark: m } as Selected, label: markLabel(m), sub: m.squadName })) ?? []),
                ...(data?.sessions.map((s) => ({ at: s.startsUtc, sel: { kind: "session", session: s } as Selected, label: sessionLabel(s), sub: s.squadName ?? s.students.map((x) => x.fullName).join(", ") })) ?? [])]
                .sort((a, b) => a.at.localeCompare(b.at)).map((e, i) => (
                  <li key={i}>
                    <button type="button" onClick={() => setSelected(e.sel)} className="flex w-full items-center justify-between gap-3 py-[0.7em] text-start text-[0.85em]">
                      <span><b className="text-[#1b2d54]">{e.label}</b> <span className="text-[#64748b]">· {e.sub}</span></span>
                      <span className="text-[#64748b]">{new Date(e.at).toLocaleDateString(intl, { weekday: "short", month: "short", day: "numeric" })}</span>
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </Card>
      <SidePanel selected={selected} avail={avail} calendar={data} onChanged={() => { setSelected(null); reload(); }} />
    </div>
  );
}

function SidePanel({ selected, avail, calendar, onChanged }: { selected: Selected; avail: MentorAvailability | null; calendar: MentorCalendar | null; onChanged: () => void }) {
  const { t, intl } = useI18n();
  const [moving, setMoving] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  if (!selected) return <Card><p className="text-[0.85em] text-[#475467]">{t("Pick a session or a date to see it here.")}</p></Card>;
  if (selected.kind === "mark") {
    const m = selected.mark;
    return (
      <Card>
        <Pill tone={m.kind === "ReviewDue" ? "orange" : "teal"} dot={false}>{m.kind === "ReviewDue" ? t("Review due") : t("Sprint")}</Pill>
        <h3 className="mt-[0.8em] text-[1.3em] font-bold text-[#1b2d54]">{m.squadName}</h3>
        <p className="mt-[0.6em] flex items-center gap-[0.5em] text-[0.85em] text-[#1b2d54]"><CalendarDays className="size-[1.1em]" />{new Date(m.atUtc).toLocaleString(intl, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</p>
        {m.sprintName && <p className="mt-[0.4em] text-[0.85em] text-[#475467]">{m.sprintName}</p>}
        <Link href={(m.kind === "ReviewDue" ? `/mentor/reviews/${m.squadId}` : `/mentor/squads/${m.squadId}`) as Route} className="mt-[1em] flex items-center gap-1 text-[0.85em] font-semibold text-[#0f7378]">
          {m.kind === "ReviewDue" ? t("Start review") : t("Open squad")} <ArrowRight className="size-[1em] rtl:-scale-x-100" />
        </Link>
      </Card>
    );
  }
  const s = selected.session;
  const start = new Date(s.startsUtc);
  const end = new Date(start.getTime() + s.durationMinutes * 60000);
  const other = calendar?.sessions.find((o) => o.id !== s.id && s.overlaps && new Date(o.startsUtc) < end && start < new Date(new Date(o.startsUtc).getTime() + o.durationMinutes * 60000));
  const upcoming = start > new Date();
  return (
    <Card>
      <Pill tone="blue" dot={false} icon={<Users className="size-[1em]" />}>{s.type === "Group" ? t("Group session") : t("One-to-one session")}</Pill>
      <h3 className="mt-[0.8em] text-[1.3em] font-bold text-[#1b2d54]">{s.squadName ?? s.students.map((x) => x.fullName).join(", ")}</h3>
      <ul className="mt-[0.8em] space-y-[0.5em] text-[0.85em] text-[#1b2d54]">
        <li className="flex items-center gap-[0.5em]"><CalendarDays className="size-[1.1em]" />{start.toLocaleDateString(intl, { weekday: "short", month: "short", day: "numeric" })} · {start.toLocaleTimeString(intl, { hour: "numeric", minute: "2-digit" })} – {end.toLocaleTimeString(intl, { hour: "numeric", minute: "2-digit" })}</li>
        <li className="flex items-center gap-[0.5em]"><Users className="size-[1.1em]" />{s.students.map((x) => x.fullName).join(", ")}{s.squadName ? ` · ${s.squadName}` : ""}</li>
        {s.topic && <li className="flex items-center gap-[0.5em]"><MessageSquare className="size-[1.1em]" />{s.topic}</li>}
      </ul>
      {other && <p className="mt-[0.9em] flex gap-[0.5em] rounded-[0.8em] bg-[#fde8e8] px-[0.9em] py-[0.6em] text-[0.8em] text-[#c81e1e]"><span className="mt-[0.4em] size-[0.45em] shrink-0 rounded-full bg-current" />{t("Overlaps with the session with {name} at {time}", { name: other.students[0]?.fullName ?? "", time: new Date(other.startsUtc).toLocaleTimeString(intl, { hour: "numeric", minute: "2-digit" }) })}</p>}
      <div className="mt-[0.9em] flex flex-wrap gap-[1em] text-[0.85em] font-semibold text-[#0f7378]">
        {s.squadId && <Link href={`/mentor/squads/${s.squadId}` as Route} className="flex items-center gap-1">{t("Open squad")} <ArrowRight className="size-[1em] rtl:-scale-x-100" /></Link>}
        <Link href={`/mentor/sessions/${s.id}` as Route} className="flex items-center gap-1">{t("Session notes")} <ArrowRight className="size-[1em] rtl:-scale-x-100" /></Link>
      </div>
      {upcoming && (
        <div className="mt-[1em] flex gap-[0.6em]">
          <SecondaryButton onClick={() => setMoving(true)}>{t("Move session")}</SecondaryButton>
          <SecondaryButton danger onClick={() => setConfirm(true)}>{t("Cancel session")}</SecondaryButton>
        </div>
      )}
      <p className="mt-[0.8em] flex items-center gap-[0.4em] text-[0.75em] text-[#64748b]"><Clock className="size-[1em]" />{t("Students are notified when a session changes.")}</p>
      {err && <p className="mt-[0.5em] text-[0.8em] text-[#c81e1e]">{err}</p>}
      {moving && <MoveDialog session={s} avail={avail} calendar={calendar} onClose={() => setMoving(false)} onDone={() => { setMoving(false); onChanged(); }} />}
      {confirm && (
        <Dialog title={t("Cancel session")} onClose={() => setConfirm(false)}
          footer={<><SecondaryButton onClick={() => setConfirm(false)}>{t("Keep it")}</SecondaryButton>
            <PrimaryButton onClick={() => cancelMentorSession(s.id).then(() => { setConfirm(false); onChanged(); }, (e) => { setErr(errorMessage(e)); setConfirm(false); })}>{t("Cancel session")}</PrimaryButton></>}>
          <p className="text-[0.88em] text-[#475467]">{t("The student is told that the session is cancelled.")}</p>
        </Dialog>
      )}
    </Card>
  );
}

/** The mentor's weekly times in the next two weeks that are free, to move a session to. */
function freeTimes(avail: MentorAvailability | null, calendar: MentorCalendar | null, except: string) {
  if (!avail) return [];
  const out: Date[] = [];
  const now = new Date();
  for (let i = 0; i < 14; i++) {
    const day = addDays(now, i);
    const key = day.toISOString().slice(0, 10);
    if (calendar?.timeOff.some((o) => key >= o.startDate && key <= o.endDate)) continue;
    const slots = avail.days.find((d) => d.label === WEEK[day.getDay()])?.slots ?? [];
    for (const s of slots) {
      const [h, m] = s.time.split(":").map(Number);
      const at = new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m);
      if (at <= now) continue;
      if (calendar?.sessions.some((x) => x.id !== except && Math.abs(new Date(x.startsUtc).getTime() - at.getTime()) < 60000)) continue;
      out.push(at);
    }
  }
  return out;
}

function MoveDialog({ session, avail, calendar, onClose, onDone }: { session: CalendarSession; avail: MentorAvailability | null; calendar: MentorCalendar | null; onClose: () => void; onDone: () => void }) {
  const { t, intl } = useI18n();
  const options = freeTimes(avail, calendar, session.id);
  const [at, setAt] = useState(options[0]?.toISOString() ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <Dialog title={t("Move session")} onClose={onClose}
      footer={<><SecondaryButton onClick={onClose}>{t("Cancel")}</SecondaryButton>
        <PrimaryButton disabled={busy || !at} onClick={() => { setBusy(true); moveMentorSession(session.id, at).then(onDone, (e) => { setErr(errorMessage(e)); setBusy(false); }); }}>{t("Move")}</PrimaryButton></>}>
      <p className="text-[0.85em] text-[#475467]">{t("Sessions only happen inside your availability slots.")}</p>
      {options.length === 0 ? <p className="text-[0.85em] text-[#c2570c]">{t("You have no free time in the next two weeks. Add slots in Availability.")}</p> : (
        <Field label={t("New time")}>
          <select value={at} onChange={(e) => setAt(e.target.value)} className={inputCls}>
            {options.map((o) => <option key={o.toISOString()} value={o.toISOString()}>{o.toLocaleString(intl, { weekday: "long", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</option>)}
          </select>
        </Field>
      )}
      {err && <p className="text-[0.85em] text-[#c81e1e]">{err}</p>}
    </Dialog>
  );
}

// ---------- Availability ----------

type Range = { start: string; end: string };
const toMin = (hhmm: string) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
const toHHMM = (n: number) => `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;

/** Consecutive session starts become one range ("10:00 AM – 1:00 PM"). */
function toRanges(starts: string[], duration: number): Range[] {
  const sorted = [...starts].map(toMin).sort((a, b) => a - b);
  const out: Range[] = [];
  for (const s of sorted) {
    const last = out[out.length - 1];
    if (last && toMin(last.end) === s) last.end = toHHMM(s + duration);
    else out.push({ start: toHHMM(s), end: toHHMM(s + duration) });
  }
  return out;
}

/** A range becomes the session starts that fit in it. */
const toStarts = (ranges: Range[], duration: number) =>
  ranges.flatMap((r) => { const out: string[] = []; for (let m = toMin(r.start); m + duration <= toMin(r.end); m += duration) out.push(toHHMM(m)); return out; });

function AvailabilityView({ data, loading, reload, calendar, reloadCalendar, tab, setTab }: {
  data: MentorAvailability | null; loading: boolean; reload: () => void; calendar: MentorCalendar | null; reloadCalendar: () => void;
  tab: "calendar" | "availability"; setTab: (v: "calendar" | "availability") => void;
}) {
  const { t, intl } = useI18n();
  const duration = data?.durationMinutes ?? 45;
  const initial = useMemo(() => Object.fromEntries(WEEK.map((d) => [d, toRanges(data?.days.find((x) => x.label === d)?.slots.map((s) => s.time) ?? [], duration)])) as Record<Weekday, Range[]>, [data, duration]);
  const [ranges, setRanges] = useState(initial);
  // New data from the server (after a save) replaces the edits.
  const [base, setBase] = useState(initial);
  if (base !== initial) {
    setBase(initial);
    setRanges(initial);
  }
  const [adding, setAdding] = useState<Weekday | null>(null);
  const [draft, setDraft] = useState<Range>({ start: "10:00", end: "13:00" });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [offOpen, setOffOpen] = useState(false);
  const [moving, setMoving] = useState<CalendarSession | null>(null);

  const fmt = (hhmm: string) => new Date(`2000-01-01T${hhmm}:00`).toLocaleTimeString(intl, { hour: "numeric", minute: "2-digit" });
  const hours = (d: Weekday) => (toStarts(ranges[d], duration).length * duration) / 60;
  const weekly = WEEK.reduce((n, d) => n + hours(d), 0);
  const weekStart = addDays(new Date(), -new Date().getDay());
  const thisWeek = (calendar?.sessions ?? []).filter((s) => { const d = new Date(s.startsUtc); return d >= weekStart && d < addDays(weekStart, 7); });
  const offDays = WEEK.filter((d) => ranges[d].length === 0);
  const totalSlots = WEEK.reduce((n, d) => n + toStarts(ranges[d], duration).length, 0);
  const overlapDay = thisWeek.find((s) => s.overlaps);

  const save = () => {
    setBusy(true);
    const slots = WEEK.flatMap((d) => toStarts(ranges[d], duration).map((startTime) => ({ dayOfWeek: d, startTime })));
    saveMonitorAvailability(data?.bookingWindowWeeks ?? 2, slots).then(
      () => { setBusy(false); setNotice({ ok: true, text: t("Availability saved.") }); reload(); },
      (e) => { setBusy(false); setNotice({ ok: false, text: errorMessage(e) }); },
    );
  };
  const addRange = (d: Weekday) => {
    if (toMin(draft.end) - toMin(draft.start) < duration) return setNotice({ ok: false, text: t("A slot must fit at least one {n}-minute session.", { n: duration }) });
    setRanges({ ...ranges, [d]: [...ranges[d], draft].sort((a, b) => a.start.localeCompare(b.start)) });
    setAdding(null);
  };

  return (
    <>
      <div className="grid items-start gap-[1.4em] xl:grid-cols-[1fr_22em]">
        <Card>
          <Tabs tab={tab} setTab={setTab} />
          <div className="mt-[1.2em] flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-[1.1em] font-bold text-[#1b2d54]">{t("Weekly availability")}</h2>
              <p className="text-[0.8em] text-[#64748b]">{t("Students and the Admin can book one-to-one sessions only inside these slots.")}</p>
            </div>
            <span className="rounded-full bg-[#eef1f5] px-[0.9em] py-[0.35em] text-[0.75em] text-[#475467]">Africa/Cairo · UTC+3</span>
          </div>
          {loading ? <Skeleton className="mt-4 h-[20em] w-full" /> : (
            <ul className="mt-[1em] divide-y divide-[#eef2f6]">
              {WEEK.map((d) => {
                const on = ranges[d].length > 0;
                return (
                  <li key={d} className="flex flex-wrap items-center gap-[0.8em] py-[0.9em]">
                    <button type="button" role="switch" aria-checked={on} aria-label={t(d)}
                      onClick={() => setRanges({ ...ranges, [d]: on ? [] : [{ start: "10:00", end: "13:00" }] })}
                      className={cn("relative h-[1.6em] w-[3em] shrink-0 rounded-full transition", on ? "bg-[#0f7378]" : "bg-[#d6dde6]")}>
                      <span className={cn("absolute top-[0.2em] size-[1.2em] rounded-full bg-white shadow transition-all", on ? "start-[1.6em]" : "start-[0.2em]")} />
                    </button>
                    <span className="w-[7em] font-semibold text-[#1b2d54]">{t(d)}</span>
                    <span className="flex flex-1 flex-wrap items-center gap-[0.5em]">
                      {!on && <span className="text-[0.85em] text-[#64748b]">{t("Unavailable")}</span>}
                      {ranges[d].map((r, i) => (
                        <span key={i} className="inline-flex items-center gap-[0.5em] rounded-[0.6em] border border-[#d6dde6] px-[0.7em] py-[0.35em] text-[0.82em] text-[#1b2d54]">
                          {fmt(r.start)} – {fmt(r.end)}
                          <button type="button" aria-label={t("Remove slot")} onClick={() => setRanges({ ...ranges, [d]: ranges[d].filter((_, j) => j !== i) })}><X className="size-[0.9em]" /></button>
                        </span>
                      ))}
                      {on && (adding === d ? (
                        <span className="inline-flex items-center gap-[0.4em] text-[0.82em]">
                          <input type="time" value={draft.start} onChange={(e) => setDraft({ ...draft, start: e.target.value })} className="rounded-[0.5em] border border-[#d6dde6] px-[0.4em] py-[0.2em]" aria-label={t("From")} />
                          –
                          <input type="time" value={draft.end} onChange={(e) => setDraft({ ...draft, end: e.target.value })} className="rounded-[0.5em] border border-[#d6dde6] px-[0.4em] py-[0.2em]" aria-label={t("To")} />
                          <button type="button" onClick={() => addRange(d)} className="font-semibold text-[#0f7378]">{t("Add")}</button>
                          <button type="button" onClick={() => setAdding(null)} className="text-[#64748b]">{t("Cancel")}</button>
                        </span>
                      ) : (
                        <button type="button" onClick={() => setAdding(d)} className="text-[0.82em] font-medium text-[#0f7378]">+ {t("Add slot")}</button>
                      ))}
                    </span>
                    <span className="w-[3em] text-end text-[0.85em] font-semibold text-[#1b2d54]">{on ? t("{n} h", { n: +hours(d).toFixed(2) }) : "—"}</span>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="mt-[1em] flex flex-wrap items-center justify-between gap-3 border-t border-[#eef2f6] pt-[1em]">
            <p className="text-[0.8em] text-[#475467]">{t("Changes apply to new bookings only. Existing sessions stay as they are.")}</p>
            <div className="flex gap-[0.6em]">
              <SecondaryButton onClick={() => setRanges(initial)}>{t("Reset")}</SecondaryButton>
              <PrimaryButton onClick={save} disabled={busy}>{t("Save availability")}</PrimaryButton>
            </div>
          </div>
          {notice && <p className={cn("mt-[0.6em] text-[0.82em]", notice.ok ? "text-[#167a3e]" : "text-[#c81e1e]")}>{notice.text}</p>}
        </Card>

        <Card>
          <Pill tone="teal">{t("This week")}</Pill>
          <h3 className="mt-[0.7em] text-[1.3em] font-bold text-[#1b2d54]">{t("Availability summary")}</h3>
          <dl className="mt-[0.8em] space-y-[0.7em] text-[0.85em]">
            {[[t("Weekly hours"), t("{n} h", { n: +weekly.toFixed(1) })], [t("Booked sessions"), String(thisWeek.length)],
              [t("Free slots"), String(Math.max(0, totalSlots - thisWeek.length))], [t("Days off"), offDays.length ? offDays.map((d) => t(d.slice(0, 3))).join(", ") : "—"]].map(([k, v]) => (
              <div key={k} className="flex justify-between"><dt className="text-[#475467]">{k}</dt><dd className="font-semibold text-[#1b2d54]">{v}</dd></div>
            ))}
          </dl>
          <h4 className="mt-[1.2em] border-t border-[#eef2f6] pt-[1em] font-semibold text-[#1b2d54]">{t("Time off")}</h4>
          <ul className="mt-[0.6em] space-y-[0.5em]">
            {(calendar?.timeOff ?? []).map((o) => (
              <li key={o.id} className="flex items-start justify-between rounded-[0.9em] border border-[#e6ebf1] bg-[#f7fafc] px-[0.9em] py-[0.7em] text-[0.82em]">
                <span><b className="block text-[#1b2d54]">{new Date(o.startDate).toLocaleDateString(intl, { month: "short", day: "numeric" })} – {new Date(o.endDate).toLocaleDateString(intl, { month: "short", day: "numeric" })}</b><span className="text-[#64748b]">{o.reason ?? t("Away")}</span></span>
                <button type="button" aria-label={t("Remove time off")} onClick={() => removeTimeOff(o.id).then(reloadCalendar, () => undefined)} className="text-[#64748b]"><X className="size-[1em]" /></button>
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => setOffOpen(true)} className="mt-[0.6em] w-full rounded-[0.8em] border border-[#d6dde6] py-[0.55em] text-[0.85em] font-medium text-[#0f7378] hover:bg-[#f7f9fc]">+ {t("Add time off")}</button>
          {overlapDay && <p className="mt-[0.8em] flex gap-[0.5em] rounded-[0.8em] bg-[#fff5e6] px-[0.9em] py-[0.6em] text-[0.8em] text-[#b45309]"><span className="mt-[0.4em] size-[0.45em] shrink-0 rounded-full bg-current" />{t("{day} has overlapping sessions. Move one before you change that day.", { day: new Date(overlapDay.startsUtc).toLocaleDateString(intl, { weekday: "short", month: "short", day: "numeric" }) })}</p>}
          <p className="mt-[0.8em] text-[0.75em] text-[#64748b]">{t("Students are notified when a session moves.")}</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-[1.15em] font-bold text-[#1b2d54]">{t("Booked sessions this week")}</h2>
        <p className="text-[0.82em] text-[#64748b]">{t("{n} sessions inside your availability", { n: thisWeek.length })}</p>
        {thisWeek.length === 0 ? <p className="mt-[0.8em] text-[0.85em] text-[#475467]">{t("No sessions booked this week.")}</p> : (
          <ul className="mt-[0.8em] divide-y divide-[#eef2f6]">
            {thisWeek.map((s) => {
              const d = new Date(s.startsUtc);
              const end = new Date(d.getTime() + s.durationMinutes * 60000);
              return (
                <li key={s.id} className="flex flex-wrap items-center gap-[0.8em] py-[0.8em]">
                  <span className="grid w-[3em] place-items-center rounded-[0.7em] border border-[#dfe5ec] bg-[#f4f7fa] py-[0.35em] leading-none">
                    <span className="text-[0.6em] font-semibold uppercase text-[#1d5fd1]">{d.toLocaleDateString(intl, { month: "short" })}</span>
                    <span className="mt-[0.2em] text-[1.25em] font-bold text-[#1b2d54]">{d.getDate()}</span>
                  </span>
                  <MentorAvatar name={s.students[0]?.fullName ?? ""} photoUrl={s.students[0]?.photoUrl} className="size-[2em]" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.88em] font-semibold text-[#1b2d54]">{s.students.map((x) => x.fullName).join(", ")}{s.topic ? ` · ${s.topic}` : ""}</span>
                    <span className="text-[0.75em] text-[#64748b]">{d.toLocaleDateString(intl, { weekday: "short" })} · {d.toLocaleTimeString(intl, { hour: "numeric", minute: "2-digit" })} – {end.toLocaleTimeString(intl, { hour: "numeric", minute: "2-digit" })}{s.squadName ? ` · ${s.squadName}` : ""}</span>
                  </span>
                  <Pill tone={s.overlaps ? "red" : "green"} dot={false}>{s.overlaps ? t("Overlaps") : t("Confirmed")}</Pill>
                  {d > new Date() && <SecondaryButton onClick={() => setMoving(s)}>{t("Move")}</SecondaryButton>}
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {offOpen && <TimeOffDialog onClose={() => setOffOpen(false)} onDone={() => { setOffOpen(false); reloadCalendar(); }} />}
      {moving && <MoveDialog session={moving} avail={data} calendar={calendar} onClose={() => setMoving(null)} onDone={() => { setMoving(null); reloadCalendar(); }} />}
    </>
  );
}

function TimeOffDialog({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const { t } = useI18n();
  const today = new Date().toISOString().slice(0, 10);
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(today);
  const [reason, setReason] = useState("");
  const [err, setErr] = useState<string | null>(null);
  return (
    <Dialog title={t("Add time off")} onClose={onClose}
      footer={<><SecondaryButton onClick={onClose}>{t("Cancel")}</SecondaryButton>
        <PrimaryButton disabled={end < start} onClick={() => addTimeOff(start, end, reason).then(onDone, (e) => setErr(errorMessage(e)))}>{t("Add")}</PrimaryButton></>}>
      <p className="text-[0.85em] text-[#475467]">{t("No session can be booked on these days.")}</p>
      <div className="grid grid-cols-2 gap-[0.8em]">
        <Field label={t("First day")}><input type="date" value={start} min={today} onChange={(e) => setStart(e.target.value)} className={inputCls} /></Field>
        <Field label={t("Last day")}><input type="date" value={end} min={start} onChange={(e) => setEnd(e.target.value)} className={inputCls} /></Field>
      </div>
      <Field label={t("Reason (optional)")}><input value={reason} maxLength={120} onChange={(e) => setReason(e.target.value)} className={inputCls} placeholder={t("Away · conference")} /></Field>
      {err && <p className="text-[0.85em] text-[#c81e1e]">{err}</p>}
    </Dialog>
  );
}
