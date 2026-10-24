"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { CalendarDays, CheckCircle2, Clock, Search, UserX } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { errorMessage } from "@/lib/api-client";
import { tk } from "@/lib/i18n/translate";
import { getMonitorSessions, setSessionNoShow, type MonitorSession } from "@/lib/monitor-api";
import { Avatar, Card, EmptyState, PageHeading, Pill, ghostBtn } from "./mentor-ui";
import { LoadState, initialsOf, sessionDate, sessionTime, useMentorData } from "./mentor-data";
import { cn } from "@/lib/utils";

type SessionStatus = "Upcoming" | "Completed" | "NoShow";
const loadSessions = () => getMonitorSessions();
const SESSION_TYPE: Record<string, string> = { OneToOne: tk("1:1 session"), Group: tk("Group session") };

const TABS: { key: SessionStatus; label: string; empty: { title: string; hint: string } }[] = [
  { key: "Upcoming", label: tk("Upcoming"), empty: { title: tk("No upcoming sessions"), hint: tk("Confirmed student sessions will appear here.") } },
  { key: "Completed", label: tk("Completed"), empty: { title: tk("No completed sessions"), hint: tk("Try a different student or search term.") } },
  { key: "NoShow", label: tk("Student no-show"), empty: { title: tk("No student no-show sessions"), hint: tk("Try a different student or search term.") } },
];

/** Sessions list with its three tabs (Upcoming, Completed, Student no-show) and their empty states. */
export default function SessionsList() {
  const t = useT();
  const [tab, setTab] = useState<SessionStatus>("Upcoming");
  const [q, setQ] = useState("");
  const { data, error, reload, setData } = useMentorData(loadSessions, tk("Could not load your sessions."));
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const items: MonitorSession[] = data ?? [];
  const current = TABS.find((x) => x.key === tab)!;
  const query = q.trim().toLowerCase();
  const rows = items
    .filter((s) => s.status === tab && (!query || s.studentName.toLowerCase().includes(query) || (s.topic ?? "").toLowerCase().includes(query)))
    .sort((a, b) => (tab === "Upcoming" ? a.startsUtc.localeCompare(b.startsUtc) : b.startsUtc.localeCompare(a.startsUtc)));
  const count = (k: SessionStatus) => items.filter((s) => s.status === k).length;
  const EmptyIcon = tab === "Upcoming" ? CalendarDays : tab === "Completed" ? CheckCircle2 : UserX;

  async function undoNoShow(s: MonitorSession) {
    setBusy(s.id);
    setActionError(null);
    try {
      const { topic, agenda, meetingLink, mentorNotes, followUpPoints, learningGoals } = s;
      const saved = await setSessionNoShow(s.id, { topic, agenda, meetingLink, mentorNotes, followUpPoints, learningGoals }, false);
      setData((all) => (all ?? []).map((x) => (x.id === s.id ? saved : x)));
    } catch (e) {
      setActionError(errorMessage(e, t("Could not update the session.")));
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <PageHeading eyebrow={t("Sessions")} title={t("Manage your sessions")} subtitle={t("Review upcoming mentorship sessions and keep completed session records organized.")} />
      <Card className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div role="tablist" aria-label={t("Sessions")} className="flex gap-1 rounded-xl bg-[#eef6f4] p-1">
            {TABS.map((x) => (
              <button
                key={x.key}
                role="tab"
                type="button"
                aria-selected={tab === x.key}
                onClick={() => setTab(x.key)}
                className={cn("flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors", tab === x.key ? "bg-[#0f8f8c] text-white" : "text-[#14305a]/70 hover:bg-white")}
              >
                {t(x.label)}
                <span className={cn("grid min-w-4 place-items-center rounded-full px-1 text-[0.6rem]", tab === x.key ? "bg-white/25" : "bg-white")}>{count(x.key)}</span>
              </button>
            ))}
          </div>
          <label className="relative block">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-3.5 -translate-y-1/2 text-[#14305a]/50" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("Search student or track")}
              aria-label={t("Search student or track")}
              className="w-56 max-w-full rounded-xl border border-[#cfe0dd] bg-white py-2 pe-3 ps-9 text-xs outline-none focus:border-[#0f8f8c] focus:ring-2 focus:ring-[#0f8f8c]/20"
            />
          </label>
        </div>

        <div className="hidden grid-cols-[1.3fr_1.2fr_0.8fr_0.8fr] gap-4 border-y border-[#e6efed] px-5 py-2 text-[0.65rem] font-bold uppercase tracking-wider text-[#14305a]/50 sm:grid">
          <span>{t("Student")}</span><span>{t("Date and time")}</span><span>{t("Status")}</span><span className="text-end">{t("Action")}</span>
        </div>

        {actionError && <p role="alert" className="mx-5 mb-3 rounded-xl bg-[#fdecec] px-4 py-2 text-xs font-semibold text-[#b83232]">{actionError}</p>}
        {!data ? (
          <LoadState error={error} onRetry={reload} />
        ) : rows.length === 0 ? (
          <EmptyState icon={<EmptyIcon className="size-5" />} title={t(current.empty.title)} hint={t(current.empty.hint)} />
        ) : (
          <ul className="divide-y divide-[#e6efed]">
            {rows.map((s) => (
              <li key={s.id} className="grid items-center gap-3 px-5 py-3 sm:grid-cols-[1.3fr_1.2fr_0.8fr_0.8fr] sm:gap-4">
                <div className="flex items-center gap-3">
                  <Avatar initials={initialsOf(s.studentName)} />
                  <div>
                    <p className="text-sm font-semibold">{s.studentName}</p>
                    <p className="text-xs text-[#14305a]/60">{t(SESSION_TYPE[s.type] ?? s.type)}</p>
                  </div>
                </div>
                <div className="text-xs text-[#14305a]/70">
                  <p className="flex items-center gap-1.5"><CalendarDays className="size-3.5 text-[#0f8f8c]" /> {sessionDate(s.startsUtc)}</p>
                  <p className="mt-1 flex items-center gap-1.5"><Clock className="size-3.5 text-[#0f8f8c]" /> {sessionTime(s.startsUtc, s.durationMinutes)}</p>
                </div>
                <div>
                  <Pill tone={s.status === "NoShow" ? "amber" : "teal"}>
                    {s.status === "NoShow" ? t("No-show") : t(s.status)}
                  </Pill>
                </div>
                <div className="flex justify-end gap-2">
                  {s.status === "NoShow" && <button type="button" disabled={busy === s.id} onClick={() => undoNoShow(s)} className={`${ghostBtn} !px-3 !py-1.5 text-xs`}>{t("Undo no-show")}</button>}
                  <Link href={`/mentor/sessions/${s.id}` as Route} className={`${ghostBtn} !px-3 !py-1.5 text-xs`}>{t("View Details")}</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
