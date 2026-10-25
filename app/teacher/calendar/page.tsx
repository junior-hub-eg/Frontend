"use client";

import { Suspense, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Copy, FileText, Link2, LoaderCircle, MapPin, MessageSquare, Plus, RefreshCw, Users } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { useI18n } from "@/lib/i18n/client";
import { dateLocale, tk, type TFunction } from "@/lib/i18n/translate";
import {
  downloadFromApi,
  getTeacherCalendar,
  getTeacherProfile,
  type CalendarItem,
  type CalendarKind,
  type EventKind,
  type TeacherCalendar,
} from "@/lib/teacher-api";
import { cn } from "@/lib/utils";
import { Card, LoadBlock, SUBJECT_LABEL, useTeacherData, weekStartOf } from "@/components/teacher/teacher-ui";
import { EVENT_KIND_LABEL, EventDialog, useToast } from "@/components/teacher/teacher-dialogs";

type View = "day" | "week" | "month" | "agenda";

type DialogState = { event?: CalendarItem; defaults?: { kind?: EventKind; start?: Date } };

const VIEWS: { key: View; label: string }[] = [
  { key: "day", label: tk("Day") },
  { key: "week", label: tk("Week") },
  { key: "month", label: tk("Month") },
  { key: "agenda", label: tk("Agenda") },
];

const KIND_LABEL: Record<CalendarKind, string> = {
  ...EVENT_KIND_LABEL,
  Deadline: tk("Deadline"),
  Plan: tk("Weekly plan"),
};

const KIND_COLOR: Record<CalendarKind, string> = {
  Lesson: "#14757d",
  OfficeHour: "#3fbfae",
  OneOnOne: "#f29a0e",
  Review: "#5b4ce6",
  Meeting: "#1B2D54",
  Deadline: "#c81e1e",
  Plan: "#8a94a6",
};

/** The "Channels" card: one row per kind, in the design's order. */
const CHANNELS: { kind: CalendarKind; label: string }[] = [
  { kind: "Lesson", label: tk("Lessons") },
  { kind: "OfficeHour", label: tk("Office hours") },
  { kind: "OneOnOne", label: tk("1-on-1") },
  { kind: "Review", label: tk("Reviews") },
  { kind: "Meeting", label: tk("Meetings") },
  { kind: "Deadline", label: tk("Deadlines") },
];

// ---------- dates (local time) ----------

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
function parseYmd(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
/** The local day an item belongs to (a deadline sits on its due day). */
const dayOf = (item: CalendarItem) => ymd(new Date(item.source === "Due" ? item.endUtc : item.startUtc));
const clock = (iso: string) => new Date(iso).toLocaleTimeString(dateLocale("en-GB"), { hour: "2-digit", minute: "2-digit" });

function timeLabel(item: CalendarItem, t: TFunction) {
  if (item.source === "Due") return t("Due {time}", { time: clock(item.endUtc) });
  if (item.source === "Plan") return t("This week");
  return `${clock(item.startUtc)} – ${clock(item.endUtc)}`;
}

/** The range the API is asked for, per view (`to` is exclusive). */
function rangeOf(view: View, selected: string, month: string) {
  if (view === "month") {
    const first = parseYmd(`${month}-01`);
    const start = parseYmd(weekStartOf(first));
    return { from: ymd(start), to: ymd(addDays(start, 42)) };
  }
  const start = parseYmd(weekStartOf(parseYmd(selected)));
  return { from: ymd(start), to: ymd(addDays(start, view === "agenda" ? 28 : 7)) };
}

function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export default function TeacherCalendarPage() {
  return (
    <Suspense fallback={null}>
      <CalendarPage />
    </Suspense>
  );
}

function CalendarPage() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const now = useNow();
  const today = ymd(new Date(now));

  const [view, setView] = useState<View>("week");
  const [selected, setSelected] = useState(today);
  const [month, setMonth] = useState(today.slice(0, 7));
  const [syncing, setSyncing] = useState(false);
  const [dialog, setDialog] = useState<DialogState | null>(() =>
    params.get("new") === "office-hour" ? { defaults: { kind: "OfficeHour" } } : null,
  );

  const { from, to } = rangeOf(view, selected, month);
  const load = useCallback(() => getTeacherCalendar(from, to), [from, to]);
  const calendar = useTeacherData(load, tk("We couldn't load your calendar. Please try again."));

  // The next seven days from today, for the "where" card and the active session, whatever range is on screen.
  const upcomingFrom = today;
  const upcomingTo = ymd(addDays(parseYmd(today), 7));
  const loadUpcoming = useCallback(() => getTeacherCalendar(upcomingFrom, upcomingTo), [upcomingFrom, upcomingTo]);
  const upcoming = useTeacherData(loadUpcoming, tk("We couldn't load your calendar. Please try again."));

  const profile = useTeacherData(getTeacherProfile, tk("We couldn't load your profile."));

  function selectDay(day: string) {
    setSelected(day);
    setMonth(day.slice(0, 7));
  }

  function closeDialog() {
    setDialog(null);
    if (params.get("new")) router.replace("/teacher/calendar" as Route);
  }

  function saved(item: CalendarItem | null) {
    closeDialog();
    toast.show(item ? t("Event saved") : t("Event deleted"));
    calendar.reload();
    upcoming.reload();
  }

  async function sync() {
    setSyncing(true);
    try {
      await downloadFromApi("/api/v1/teacher/calendar.ics", "junior-hub-teacher.ics");
      toast.show(t("Calendar file downloaded"));
    } catch (e) {
      toast.show(errorMessage(e, "We couldn't download your calendar."));
    } finally {
      setSyncing(false);
    }
  }

  const openItem = (item: CalendarItem) => setDialog({ event: item });

  const events = (upcoming.data?.items ?? []).filter((i) => i.source === "Event" && Date.parse(i.endUtc) > now);
  const ongoing = events.find((i) => Date.parse(i.startUtc) <= now);
  const nextToday = events.find((i) => Date.parse(i.startUtc) > now && dayOf(i) === today);
  const active = ongoing ?? nextToday ?? null;
  const where = ongoing ?? events[0] ?? null;

  const subjects = profile.data?.subjects.map((s) => t(SUBJECT_LABEL[s])).join(" & ");

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 pb-6 pt-4 font-[family-name:var(--font-poppins)] text-[#1B2D54]">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="flex flex-wrap items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wide text-[#14757d]">
            <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-[#14757d]" />
            {subjects ? t("{subjects} Department", { subjects }) : t("Teacher workspace")}
            {profile.data?.school.name && <span>• {profile.data.school.name}</span>}
          </p>
          <h1 className="mt-1 text-2xl font-bold leading-tight">{t("Academic Timetable")}</h1>
          <p className="mt-0.5 text-[11px] text-[#1B2D54]/70">{t("Lessons, office hours, 1-on-1s and deadlines across your classes")}</p>
        </div>

        <div className="flex flex-col gap-2 lg:items-end">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={sync}
              disabled={syncing}
              className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-[11px] font-semibold text-[#1B2D54] shadow-sm ring-1 ring-[#e3ece9] transition-colors hover:bg-[#f6f9f8] disabled:opacity-60"
            >
              {syncing ? <LoaderCircle className="size-3.5 animate-spin" /> : <RefreshCw aria-hidden className="size-3.5 text-[#14757d]" />}
              {t("Sync External Calendar")}
            </button>
            <button
              type="button"
              onClick={() => setDialog({ defaults: { kind: "Lesson" } })}
              className="flex items-center gap-1.5 rounded-lg bg-[#14757d] px-3 py-2 text-[11px] font-semibold text-white shadow-sm transition-colors hover:bg-[#0f6169]"
            >
              <Plus aria-hidden className="size-3.5" />
              {t("Schedule Event")}
            </button>
          </div>
          <div role="group" aria-label={t("Calendar view")} className="flex w-full items-center gap-1 rounded-lg bg-white/80 p-1 shadow-sm ring-1 ring-[#e3ece9] lg:w-auto">
            {VIEWS.map((v) => (
              <button
                key={v.key}
                type="button"
                aria-pressed={view === v.key}
                onClick={() => setView(v.key)}
                className={cn(
                  "flex-1 rounded-md px-4 py-1 text-[10px] font-semibold transition-colors lg:flex-none",
                  view === v.key ? "bg-[#14757d] text-white" : "text-[#1B2D54] hover:bg-[#14757d]/10",
                )}
              >
                {t(v.label)}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(240px,300px)_minmax(0,1fr)]">
        <aside className="flex min-w-0 flex-col gap-4">
          <MiniCalendar month={month} selected={selected} today={today} onMonth={setMonth} onSelect={selectDay} />
          <ChannelsCard calendar={calendar.data} />
          <BookingCard slug={calendar.data?.bookingSlug ?? upcoming.data?.bookingSlug ?? null} onCopied={() => toast.show(t("Copied"))} />
          <WhereCard item={where} now={now} />
        </aside>

        <div className="flex min-w-0 flex-col gap-4">
          <Card className="min-w-0 p-3 sm:p-4">
            {!calendar.data ? (
              <LoadBlock error={calendar.error} onRetry={calendar.reload} />
            ) : view === "month" ? (
              <MonthView items={calendar.data.items} month={month} today={today} onPick={(d) => (selectDay(d), setView("day"))} />
            ) : view === "agenda" ? (
              <AgendaView items={calendar.data.items} today={today} now={now} onOpen={openItem} />
            ) : (
              <WeekView
                items={calendar.data.items}
                days={view === "day" ? [selected] : weekDays(selected, calendar.data.items)}
                today={today}
                now={now}
                onOpen={openItem}
              />
            )}
          </Card>

          <ActiveBanner item={active} now={now} onNotes={(item) => setDialog({ event: item })} />
        </div>
      </div>

      {dialog && <EventDialog onClose={closeDialog} onSaved={saved} event={dialog.event} defaults={dialog.defaults} />}
      {toast.node}
    </div>
  );
}

/** Monday to Friday of the selected week, plus Saturday or Sunday when something is on them (or one is selected). */
function weekDays(selected: string, items: CalendarItem[]) {
  const monday = parseYmd(weekStartOf(parseYmd(selected)));
  const days = Array.from({ length: 7 }, (_, i) => ymd(addDays(monday, i)));
  const busy = new Set(items.map(dayOf));
  return days.filter((d, i) => i < 5 || d === selected || busy.has(d));
}

// ---------- left column ----------

function MiniCalendar({
  month,
  selected,
  today,
  onMonth,
  onSelect,
}: {
  month: string;
  selected: string;
  today: string;
  onMonth: (month: string) => void;
  onSelect: (day: string) => void;
}) {
  const { t } = useI18n();
  const first = parseYmd(`${month}-01`);
  const start = addDays(first, -first.getDay()); // Sunday first, like the design
  const cells = Array.from({ length: 42 }, (_, i) => addDays(start, i));
  const rows = cells[35].getMonth() === first.getMonth() ? 6 : 5;
  const weekFrom = weekStartOf(parseYmd(selected));
  const weekTo = ymd(addDays(parseYmd(weekFrom), 4));
  const shift = (n: number) => onMonth(ymd(new Date(first.getFullYear(), first.getMonth() + n, 1)).slice(0, 7));

  return (
    <Card>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">{first.toLocaleDateString(dateLocale(), { month: "long", year: "numeric" })}</h2>
        <div className="flex gap-1">
          <button type="button" onClick={() => shift(-1)} aria-label={t("Previous month")} className="grid size-6 place-items-center rounded-full hover:bg-[#eef2f1]">
            <ChevronLeft className="size-3.5 rtl:rotate-180" />
          </button>
          <button type="button" onClick={() => shift(1)} aria-label={t("Next month")} className="grid size-6 place-items-center rounded-full hover:bg-[#eef2f1]">
            <ChevronRight className="size-3.5 rtl:rotate-180" />
          </button>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-y-1 text-center">
        {cells.slice(0, 7).map((d) => (
          <span key={`h${d.getDay()}`} className="pb-1 text-[9px] font-semibold text-[#1B2D54]/70">
            {d.toLocaleDateString(dateLocale(), { weekday: "short" })}
          </span>
        ))}
        {cells.slice(0, rows * 7).map((d) => {
          const key = ymd(d);
          const inMonth = d.getMonth() === first.getMonth();
          const inWeek = key >= weekFrom && key <= weekTo;
          const isSelected = key === selected;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              aria-pressed={isSelected}
              aria-label={d.toLocaleDateString(dateLocale(), { weekday: "long", day: "numeric", month: "long" })}
              className={cn(
                "relative mx-auto grid h-7 w-full place-items-center text-[11px] transition-colors",
                inWeek ? "bg-[#c9f1f0]/70 font-semibold text-[#14757d]" : "rounded-md hover:bg-[#eef2f1]",
                !inMonth && "text-[#1B2D54]/30",
                isSelected && "rounded-md ring-2 ring-inset ring-[#14757d]",
                key === weekFrom && "rounded-s-md",
                key === weekTo && "rounded-e-md",
              )}
            >
              {d.getDate()}
              {key === today && <span aria-hidden className="absolute bottom-0.5 size-1 rounded-full bg-[#c81e1e]" />}
            </button>
          );
        })}
      </div>
    </Card>
  );
}

function ChannelsCard({ calendar }: { calendar: TeacherCalendar | null }) {
  const { t } = useI18n();
  const of = (kind: CalendarKind) => calendar?.channels.find((c) => c.kind === kind);
  const activeCount = CHANNELS.filter((c) => (of(c.kind)?.count ?? 0) > 0).length;
  return (
    <Card>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">{t("Channels")}</h2>
        {calendar && <span className="text-[9px] font-semibold uppercase tracking-wide text-[#14757d]">{t("{count} active", { count: activeCount })}</span>}
      </div>
      <ul className="mt-3 grid gap-2.5">
        {CHANNELS.map((c) => {
          const row = of(c.kind);
          const count = row?.count ?? 0;
          return (
            <li key={c.kind} className="flex items-center gap-2.5 text-[11px]">
              <span aria-hidden className="size-3.5 shrink-0 rounded-[3px]" style={{ backgroundColor: KIND_COLOR[c.kind] }} />
              <span className="min-w-0 flex-1 truncate">{t(c.label)}</span>
              {row && row.hours > 0 && <span className="text-[9px] text-[#1B2D54]/60">{t("{hours} h", { hours: row.hours })}</span>}
              <span
                className={cn(
                  "min-w-6 rounded-full px-2 py-0.5 text-center text-[9px] font-semibold",
                  count === 0 ? "bg-[#eef2f1] text-[#1B2D54]/60" : c.kind === "Deadline" ? "bg-[#fde8e8] text-[#c81e1e]" : "bg-[#c9f1f0] text-[#14757d]",
                )}
              >
                {calendar ? count : "–"}
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function BookingCard({ slug, onCopied }: { slug: string | null; onCopied: () => void }) {
  const { t } = useI18n();
  const url = slug ? `${window.location.origin}/book/${slug}` : null;
  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      onCopied();
    } catch {
      // The clipboard can be blocked (an insecure page); the link stays on screen to copy by hand.
    }
  }
  return (
    <Card>
      <div className="flex items-start gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#c9f1f0] text-[#14757d]">
          <Link2 aria-hidden className="size-4" />
        </span>
        <div className="min-w-0 leading-tight">
          <h2 className="text-sm font-semibold">{t("1-on-1 Booking Link")}</h2>
          <p className="mt-0.5 text-[9px] text-[#1B2D54]/60">{t("Students and parents book office-hour slots here")}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#f2f5f4] px-3 py-2">
        <code dir="ltr" className="min-w-0 flex-1 truncate text-[10px]">
          {url ? url.replace(/^https?:\/\//, "") : "…"}
        </code>
        <button type="button" onClick={copy} disabled={!url} className="flex shrink-0 items-center gap-1 text-[10px] font-semibold text-[#14757d] disabled:opacity-50">
          <Copy aria-hidden className="size-3" /> {t("Copy")}
        </button>
      </div>
    </Card>
  );
}

function WhereCard({ item, now }: { item: CalendarItem | null; now: number }) {
  const { t } = useI18n();
  const live = item && Date.parse(item.startUtc) <= now;
  return (
    <section className="rounded-2xl bg-[#0f6b70] p-4 text-white shadow-sm">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-white/70">{live ? t("Where you are now") : t("Next location")}</p>
      {item ? (
        <>
          <p className="mt-1.5 text-sm font-semibold leading-snug" dir="auto">
            {item.location ?? t("No room or link set")}
          </p>
          <p className="mt-1.5 text-[10px] leading-relaxed text-white/75" dir="auto">
            {item.title} • {new Date(item.startUtc).toLocaleDateString(dateLocale(), { weekday: "short" })} <span dir="ltr">{timeLabel(item, t)}</span>
          </p>
        </>
      ) : (
        <p className="mt-1.5 text-[11px] text-white/80">{t("Nothing scheduled in the next 7 days.")}</p>
      )}
    </section>
  );
}

// ---------- main views ----------

function ItemShell({
  item,
  onOpen,
  className,
  children,
}: {
  item: CalendarItem;
  onOpen: (item: CalendarItem) => void;
  className: string;
  children: ReactNode;
}) {
  const style = { borderInlineStartColor: KIND_COLOR[item.kind] };
  if (item.source === "Event") {
    return (
      <button type="button" onClick={() => onOpen(item)} style={style} className={cn("block w-full text-start", className)}>
        {children}
      </button>
    );
  }
  if (item.source === "Due") {
    return (
      <Link href={`/teacher/assignments?assignment=${item.id}` as Route} style={style} className={cn("block", className)}>
        {children}
      </Link>
    );
  }
  return (
    <div style={style} className={className}>
      {children}
    </div>
  );
}

function EventCard({ item, now, onOpen, wide }: { item: CalendarItem; now: number; onOpen: (item: CalendarItem) => void; wide?: boolean }) {
  const { t } = useI18n();
  const start = Date.parse(item.startUtc);
  const end = Date.parse(item.endUtc);
  const live = item.source === "Event" && start <= now && now < end;
  const progress = live ? Math.round(((now - start) / (end - start)) * 100) : 0;
  const color = KIND_COLOR[item.kind];
  const who = item.studentName ?? item.className;
  return (
    <ItemShell
      item={item}
      onOpen={onOpen}
      className={cn(
        "rounded-xl border-s-[3px] bg-white p-2.5 shadow-sm ring-1 ring-[#e3ece9] transition-shadow hover:shadow-md",
        live && "ring-2 ring-[#14757d]/50",
        item.source === "Plan" && "bg-[#f6f9f8] shadow-none",
      )}
    >
      {live && (
        <span className="mb-1.5 inline-flex items-center gap-1 rounded bg-[#fde8e8] px-1.5 py-0.5 text-[8px] font-bold uppercase text-[#c81e1e]">
          <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-[#c81e1e]" />
          {t("Live now")}
        </span>
      )}
      <span className="flex items-center justify-between gap-1">
        <span dir="ltr" className="text-[10px] font-semibold" style={{ color }}>
          {timeLabel(item, t)}
        </span>
        <span className="truncate text-[8px] font-semibold uppercase text-[#1B2D54]/50">{t(KIND_LABEL[item.kind])}</span>
      </span>
      <span dir="auto" className={cn("mt-1 block font-bold leading-tight", wide ? "text-sm" : "text-[13px]")}>
        {item.title}
      </span>
      {item.notes && (
        <span dir="auto" className={cn("mt-1 block text-[10px] leading-snug text-[#1B2D54]/70", wide ? "line-clamp-3" : "line-clamp-4")}>
          {item.notes}
        </span>
      )}
      {(item.location || who) && (
        <span className="mt-2 flex flex-wrap items-center gap-1.5 text-[9px] font-semibold">
          {item.location && (
            <span dir="auto" className="inline-flex min-w-0 items-center gap-0.5">
              <MapPin aria-hidden className="size-2.5 shrink-0" /> <span className="truncate">{item.location}</span>
            </span>
          )}
          {who && (
            <span dir="auto" className="rounded bg-[#eef2f1] px-1.5 py-0.5">
              {item.studentName ?? t("Class {name}", { name: item.className })}
            </span>
          )}
        </span>
      )}
      {live && (
        <span className="mt-2 block h-1 overflow-hidden rounded-full bg-[#e3ece9]" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <span className="block h-full rounded-full bg-[#14757d]" style={{ width: `${progress}%` }} />
        </span>
      )}
    </ItemShell>
  );
}

function WeekView({
  items,
  days,
  today,
  now,
  onOpen,
}: {
  items: CalendarItem[];
  days: string[];
  today: string;
  now: number;
  onOpen: (item: CalendarItem) => void;
}) {
  const { t } = useI18n();
  const single = days.length === 1;
  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-1">
      <div
        className={cn("grid gap-2", !single && "min-w-[640px]")}
        style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}
      >
        {days.map((day) => {
          const date = parseYmd(day);
          const isToday = day === today;
          const list = items.filter((i) => dayOf(i) === day);
          return (
            <div key={day} className={cn("flex min-w-0 flex-col rounded-xl pb-2", isToday && "bg-[#e3f7f8]")}>
              <div className={cn("mb-2 border-b border-[#e3ece9] py-2 text-center", isToday && "border-transparent")}>
                <p className={cn("text-[9px] font-semibold uppercase", isToday ? "text-[#14757d]" : "text-[#1B2D54]/70")}>
                  {date.toLocaleDateString(dateLocale(), { weekday: single ? "long" : "short" })}
                </p>
                <p className={cn("text-lg font-bold leading-tight", isToday && "text-[#14757d]")}>
                  {single ? date.toLocaleDateString(dateLocale(), { day: "numeric", month: "long" }) : date.getDate()}
                </p>
              </div>
              <div className={cn("flex flex-col gap-2 px-1", single && "sm:grid sm:grid-cols-2 xl:grid-cols-3")}>
                {list.length === 0 ? (
                  <p className="py-6 text-center text-[10px] text-[#1B2D54]/40">{t("Nothing scheduled")}</p>
                ) : (
                  list.map((item) => <EventCard key={`${item.source}-${item.id}`} item={item} now={now} onOpen={onOpen} wide={single} />)
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MonthView({ items, month, today, onPick }: { items: CalendarItem[]; month: string; today: string; onPick: (day: string) => void }) {
  const { t } = useI18n();
  const first = parseYmd(`${month}-01`);
  const start = parseYmd(weekStartOf(first));
  const cells = Array.from({ length: 42 }, (_, i) => addDays(start, i));
  const rows = cells[35].getMonth() === first.getMonth() ? 6 : 5;
  const byDay = useMemo(() => {
    const map = new Map<string, CalendarItem[]>();
    for (const i of items) map.set(dayOf(i), [...(map.get(dayOf(i)) ?? []), i]);
    return map;
  }, [items]);

  return (
    <div className="-mx-1 overflow-x-auto px-1">
      <h2 className="mb-2 text-sm font-semibold">{first.toLocaleDateString(dateLocale(), { month: "long", year: "numeric" })}</h2>
      <div className="grid min-w-[560px] grid-cols-7 overflow-hidden rounded-xl border border-[#e3ece9]">
        {cells.slice(0, 7).map((d) => (
          <span key={`h${d.getDay()}`} className="bg-[#f6f9f8] py-1.5 text-center text-[9px] font-semibold uppercase text-[#1B2D54]/70">
            {d.toLocaleDateString(dateLocale(), { weekday: "short" })}
          </span>
        ))}
        {cells.slice(0, rows * 7).map((d) => {
          const key = ymd(d);
          const list = byDay.get(key) ?? [];
          return (
            <button
              key={key}
              type="button"
              onClick={() => onPick(key)}
              aria-label={d.toLocaleDateString(dateLocale(), { weekday: "long", day: "numeric", month: "long" })}
              className={cn(
                "flex min-h-20 flex-col gap-0.5 border-t border-s border-[#e3ece9] p-1.5 text-start transition-colors hover:bg-[#f6f9f8]",
                d.getMonth() !== first.getMonth() && "bg-[#fafcfb] text-[#1B2D54]/35",
                key === today && "bg-[#e3f7f8]",
              )}
            >
              <span className={cn("text-[10px] font-semibold", key === today && "text-[#14757d]")}>{d.getDate()}</span>
              {list.slice(0, 3).map((i) => (
                <span key={`${i.source}-${i.id}`} className="flex min-w-0 items-center gap-1 text-[9px] leading-tight">
                  <span aria-hidden className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: KIND_COLOR[i.kind] }} />
                  <span dir="auto" className="truncate">
                    {i.title}
                  </span>
                </span>
              ))}
              {list.length > 3 && <span className="text-[8px] font-semibold text-[#14757d]">{t("+{count} more", { count: list.length - 3 })}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AgendaView({ items, today, now, onOpen }: { items: CalendarItem[]; today: string; now: number; onOpen: (item: CalendarItem) => void }) {
  const { t } = useI18n();
  const groups: [string, CalendarItem[]][] = [];
  for (const item of items) {
    const day = dayOf(item);
    const last = groups.at(-1);
    if (last && last[0] === day) last[1].push(item);
    else groups.push([day, [item]]);
  }
  groups.sort((a, b) => a[0].localeCompare(b[0]));

  if (groups.length === 0) return <p className="py-10 text-center text-[11px] text-[#1B2D54]/50">{t("Nothing scheduled in these four weeks.")}</p>;

  return (
    <div className="flex flex-col gap-4">
      {groups.map(([day, list]) => (
        <section key={day}>
          <h3 className={cn("mb-1.5 text-[10px] font-semibold uppercase", day === today ? "text-[#14757d]" : "text-[#1B2D54]/70")}>
            {parseYmd(day).toLocaleDateString(dateLocale(), { weekday: "long", day: "numeric", month: "long" })}
            {day === today && ` • ${t("Today")}`}
          </h3>
          <ul className="flex flex-col gap-1.5">
            {list.map((item) => {
              const live = item.source === "Event" && Date.parse(item.startUtc) <= now && now < Date.parse(item.endUtc);
              return (
                <li key={`${item.source}-${item.id}`}>
                  <ItemShell
                    item={item}
                    onOpen={onOpen}
                    className="flex items-center gap-3 rounded-xl border-s-[3px] bg-white px-3 py-2 ring-1 ring-[#e3ece9] transition-colors hover:bg-[#f6f9f8]"
                  >
                    <span dir="ltr" className="w-24 shrink-0 text-[10px] font-semibold" style={{ color: KIND_COLOR[item.kind] }}>
                      {timeLabel(item, t)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span dir="auto" className="block truncate text-[12px] font-semibold">
                        {item.title}
                      </span>
                      <span className="block truncate text-[9px] text-[#1B2D54]/60">
                        {[t(KIND_LABEL[item.kind]), item.studentName ?? (item.className && t("Class {name}", { name: item.className })), item.location]
                          .filter(Boolean)
                          .join(" • ")}
                      </span>
                    </span>
                    {live && <span className="shrink-0 rounded bg-[#fde8e8] px-1.5 py-0.5 text-[8px] font-bold uppercase text-[#c81e1e]">{t("Live now")}</span>}
                  </ItemShell>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

// ---------- the active session banner ----------

function ActiveBanner({ item, now, onNotes }: { item: CalendarItem | null; now: number; onNotes: (item: CalendarItem) => void }) {
  const { t } = useI18n();
  if (!item) {
    return (
      <section className="rounded-2xl border-s-4 border-[#14757d] bg-white p-4 text-[11px] text-[#1B2D54]/70 shadow-sm ring-1 ring-[#e3ece9]">
        {t("No more sessions today. Enjoy the break!")}
      </section>
    );
  }
  const live = Date.parse(item.startUtc) <= now;
  return (
    <section className="flex flex-col gap-4 rounded-2xl border-s-4 border-[#14757d] bg-white p-4 shadow-sm ring-1 ring-[#e3ece9] sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#c9f1f0] px-2.5 py-1 text-[9px] font-semibold uppercase text-[#14757d]">
            <span aria-hidden className={cn("size-1.5 rounded-full bg-[#14757d]", live && "animate-pulse")} />
            {live ? t("Active session") : t("Next session")} • {t(KIND_LABEL[item.kind])}
            {(item.className || item.studentName) && ` • ${item.studentName ?? t("Class {name}", { name: item.className })}`}
          </span>
          {item.location && (
            <span dir="auto" className="inline-flex items-center gap-1 text-[10px] font-semibold">
              <MapPin aria-hidden className="size-3 text-[#14757d]" /> {item.location}
            </span>
          )}
        </div>
        <h2 dir="auto" className="mt-2 text-lg font-bold leading-snug">
          {item.title}
        </h2>
        <p className="mt-1 flex items-center gap-1.5 text-[11px] text-[#14757d]">
          <Users aria-hidden className="size-3.5" />
          <span dir="ltr">{timeLabel(item, t)}</span>
        </p>
      </div>
      <div className="flex shrink-0 flex-col gap-2 sm:items-stretch">
        <button
          type="button"
          onClick={() => onNotes(item)}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-[#eef2f1] px-4 py-2 text-[11px] font-semibold transition-colors hover:bg-[#dfe9e7]"
        >
          <FileText aria-hidden className="size-3.5" /> {t("Open notes")}
        </button>
        {item.classId && (
          <Link
            href={`/teacher/messages?class=${item.classId}` as Route}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-[#14757d] px-4 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-[#0f6169]"
          >
            <MessageSquare aria-hidden className="size-3.5" /> {t("Message the class")}
          </Link>
        )}
      </div>
    </section>
  );
}
