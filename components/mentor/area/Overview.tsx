"use client";

import Link from "next/link";
import type { Route } from "next";
import { AlertTriangle, ArrowRight, ArrowUpRight, Code2, FileText, MessageSquare, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useI18n } from "@/lib/i18n/client";
import { getMentorOverview, type MentorOverview, type NeedsAction, type WeekEvent } from "@/lib/monitor-api";
import { cn } from "@/lib/utils";
import { Card, CardTitle, ErrorState, MentorAvatar, MentorPage, Pill, Skeleton, useRelative } from "../mentor-area-ui";
import { useApi } from "../use-api";
import { SquadCard } from "./squad-parts";

const STAT_STYLES = {
  teal: { bar: "bg-[#0f7378]", tint: "bg-white", arrow: "bg-[#e0f4f2] text-[#0f7378]", value: "text-[#1b2d54]" },
  blue: { bar: "bg-[#1d5fd1]", tint: "bg-[#f4f8ff]", arrow: "bg-[#e6f0ff] text-[#1d5fd1]", value: "text-[#1b2d54]" },
  orange: { bar: "bg-[#f59e0b]", tint: "bg-[#fffaf1]", arrow: "bg-[#fff1e3] text-[#c2570c]", value: "text-[#7a3d06]" },
  purple: { bar: "bg-[#7c3aed]", tint: "bg-[#f8f5ff]", arrow: "bg-[#efe9ff] text-[#6b3fd6]", value: "text-[#2e1065]" },
  red: { bar: "bg-[#e5484d]", tint: "bg-[#fff5f5]", arrow: "bg-[#fde8e8] text-[#c81e1e]", value: "text-[#7f1d1d]" },
  green: { bar: "bg-[#16a34a]", tint: "bg-[#f3fbf6]", arrow: "bg-[#e3f6ea] text-[#167a3e]", value: "text-[#14532d]" },
} as const;

function Stat({ label, value, hint, href, tone, hintTone }: { label: string; value: number; hint: string; href: string; tone: keyof typeof STAT_STYLES; hintTone?: string }) {
  const s = STAT_STYLES[tone];
  return (
    <Link href={href as Route} className={cn("group relative block rounded-[1.3em] p-[1.1em] shadow-[0_10px_40px_rgba(20,54,90,0.08)] transition hover:-translate-y-0.5", s.tint)}>
      <div className="flex items-start justify-between gap-2">
        <span className="flex items-center gap-[0.55em] text-[0.85em] font-medium text-[#1b2d54]">
          <span className={cn("h-[1.2em] w-[3px] rounded-full", s.bar)} /> {label}
        </span>
        <span className={cn("grid size-[1.9em] shrink-0 place-items-center rounded-full", s.arrow)}>
          <ArrowUpRight className="size-[1em] rtl:-scale-x-100" />
        </span>
      </div>
      <p className={cn("mt-[0.6em] text-[2.6em] font-extrabold leading-none", s.value)}>{value}</p>
      <p className={cn("mt-[0.6em] truncate text-[0.75em] text-[#475467]", hintTone)}>{hint}</p>
    </Link>
  );
}

export default function Overview() {
  const { t, intl } = useI18n();
  const { user } = useAuth();
  const rel = useRelative();
  const { data, error, loading, reload } = useApi(getMentorOverview);

  if (error) {
    return (
      <MentorPage title={t("Overview")}>
        <ErrorState title={t("We could not load your overview")} onRetry={reload} error={error} />
      </MentorPage>
    );
  }

  const s = data?.stats;
  const time = (iso: string) => new Date(iso).toLocaleString(intl, { weekday: "short", hour: "numeric", minute: "2-digit" });
  return (
    <MentorPage title={t("Overview")} subtitle={t("Everything that needs your attention today, {name}.", { name: user?.firstName ?? "" })}>
      {loading || !s || !data ? (
        <OverviewSkeleton />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-[1em] md:grid-cols-3 xl:grid-cols-6">
            <Stat tone="teal" label={t("My squads")} value={s.squads} href="/mentor/squads"
              hint={t("{late} late · {waiting} waiting for review", { late: s.lateSquads, waiting: s.waitingSquads })} />
            <Stat tone="blue" label={t("My students")} value={s.students} href="/mentor/students" hint={t("Across your {n} squads", { n: s.studentSquads })} />
            <Stat tone="orange" label={t("Waiting for my review")} value={s.waiting} href="/mentor/reviews" hint={t("{n} overdue", { n: s.overdue })} hintTone="text-[#c2570c]" />
            <Stat tone="purple" label={t("Due in 24 hours")} value={s.dueSoon} href="/mentor/reviews"
              hint={s.dueSoonSquad && s.dueSoonUtc ? `${s.dueSoonSquad} · ${rel.countdown(s.dueSoonUtc).label}` : t("Nothing due soon")} />
            <Stat tone="red" label={t("Warnings")} value={s.warnings} href="/mentor/students?warning=1" hint={t("Spread over {n} squads", { n: s.warningSquads })} hintTone="text-[#c81e1e]" />
            <Stat tone="green" label={t("Sessions this week")} value={s.sessionsThisWeek} href="/mentor/calendar"
              hint={s.nextSessionUtc ? t("Next: {time}", { time: time(s.nextSessionUtc) }) : t("No sessions booked")} />
          </div>

          <div className="grid gap-[1.4em] xl:grid-cols-[1fr_24em]">
            <Card>
              <CardTitle action={null}>
                <span className="flex items-center gap-[0.6em]">
                  {t("Needs action")}
                  {data.needsAction.length > 0 && <Pill tone="red" dot={false}>{t("{n} items", { n: data.needsAction.length })}</Pill>}
                </span>
              </CardTitle>
              {data.needsAction.length === 0 ? (
                <p className="flex items-center gap-2 py-[1em] text-[0.88em] text-[#475467]">
                  <CheckCircle2 className="size-[1.2em] text-[#16a34a]" /> {t("Nothing needs you right now.")}
                </p>
              ) : (
                <ul className="divide-y divide-[#eef2f6]">
                  {data.needsAction.map((a, i) => (
                    <ActionRow key={i} action={a} />
                  ))}
                </ul>
              )}
            </Card>

            <Card className="flex flex-col">
              <CardTitle>{t("This week")}</CardTitle>
              {data.thisWeek.length === 0 ? (
                <p className="text-[0.88em] text-[#475467]">{t("Nothing planned this week.")}</p>
              ) : (
                <ul className="space-y-[1em]">
                  {data.thisWeek.slice(0, 5).map((e, i) => (
                    <WeekRow key={i} event={e} />
                  ))}
                </ul>
              )}
              <Link href={"/mentor/calendar" as Route} className="mt-auto flex items-center gap-[0.4em] pt-[1.2em] text-[0.85em] font-semibold text-[#0f7378]">
                {t("Open calendar")} <ArrowRight className="size-[1em] rtl:-scale-x-100" />
              </Link>
            </Card>
          </div>

          <div>
            <div className="mb-[1em] flex items-center justify-between">
              <h2 className="text-[1.15em] font-bold text-[#1b2d54]">{t("My squads")}</h2>
              <Link href={"/mentor/squads" as Route} className="flex items-center gap-[0.4em] text-[0.85em] font-semibold text-[#0f7378]">
                {t("View all squads")} <ArrowRight className="size-[1em] rtl:-scale-x-100" />
              </Link>
            </div>
            {data.squads.length === 0 ? (
              <Card>
                <p className="text-[0.88em] text-[#475467]">{t("You don't monitor a squad yet. The Admin assigns squads to monitors.")}</p>
              </Card>
            ) : (
              <div className="grid gap-[1.2em] lg:grid-cols-2">
                {data.squads.slice(0, 4).map((row) => (
                  <SquadCard key={row.id} row={row} />
                ))}
              </div>
            )}
          </div>

          <Card>
            <CardTitle>{t("Recent activity")}</CardTitle>
            {data.recentActivity.length === 0 ? (
              <p className="text-[0.88em] text-[#475467]">{t("No activity yet.")}</p>
            ) : (
              <ul className="divide-y divide-[#eef2f6]">
                {data.recentActivity.map((a, i) => (
                  <li key={i} className="flex items-center gap-[0.9em] py-[0.7em]">
                    {a.kind === "TaskMoved" ? (
                      <span className="relative">
                        <MentorAvatar name={a.studentName ?? ""} photoUrl={a.photoUrl} className="size-[2.3em]" />
                        <span className={cn("absolute -bottom-0.5 -end-0.5 grid size-[1em] place-items-center rounded-full text-[0.6em] text-white ring-2 ring-white",
                          a.toStatus === "Done" ? "bg-[#16a34a]" : "bg-[#1d5fd1]")}>✓</span>
                      </span>
                    ) : (
                      <span className="grid size-[2.3em] place-items-center rounded-full bg-gradient-to-br from-[#ff9f1c] to-[#ff6b00] text-white">
                        <Code2 className="size-[1.1em]" />
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-[0.88em] font-medium text-[#1b2d54]">
                        {a.kind === "TaskMoved"
                          ? t("{name} moved “{task}” to {status}", { name: a.studentName, task: a.taskTitle, status: t(statusLabel(a.toStatus)) })
                          : t("{squad} submitted their final work", { squad: a.squadName })}
                      </p>
                      <p className="text-[0.75em] text-[#64748b]">
                        {a.squadName} · {rel.ago(a.atUtc)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}
    </MentorPage>
  );
}

const statusLabel = (s: string | null) => ({ ToDo: "To do", InProgress: "In progress", Review: "Review", Done: "Done" })[s ?? ""] ?? s ?? "";

function ActionRow({ action: a }: { action: NeedsAction }) {
  const { t } = useI18n();
  const rel = useRelative();
  const squadHref = `/mentor/squads/${a.squadId}`;
  const icon = {
    Submitted: { Icon: FileText, cls: "from-[#ffb020] to-[#f97316]" },
    Inactive: { Icon: AlertTriangle, cls: "from-[#f87171] to-[#dc2626]" },
    Unanswered: { Icon: MessageSquare, cls: "from-[#60a5fa] to-[#2563eb]" },
    AdminReplied: { Icon: ShieldCheck, cls: "from-[#a78bfa] to-[#7c3aed]" },
  }[a.kind];
  let title = "";
  let sub = "";
  let right: React.ReactNode = null;
  switch (a.kind) {
    case "Submitted": {
      const c = a.dueUtc ? rel.countdown(a.dueUtc) : null;
      title = t("{squad} submitted their work", { squad: a.squadName });
      sub = t("{project} · {a} of {b} submitted", { project: a.projectTitle, a: a.count, b: a.total });
      right = (
        <>
          {c && <Pill tone={c.overdue ? "red" : "amber"} dot={false}>{c.label}</Pill>}
          <Link href={`/mentor/reviews/${a.squadId}` as Route} className="rounded-[0.7em] bg-gradient-to-r from-[#0f6b70] to-[#1b2d54] px-[1.2em] py-[0.55em] text-[0.82em] font-semibold text-white shadow-[0_6px_16px_rgba(15,107,112,0.3)] rtl:bg-gradient-to-l">
            {t("Review")}
          </Link>
        </>
      );
      break;
    }
    case "Inactive":
      title = t("No task moved for {n} days", { n: a.count });
      sub = `${a.studentName} · ${t(a.role ?? "")} · ${a.squadName}`;
      right = <OutlineLink href={squadHref}>{t("Open squad")}</OutlineLink>;
      break;
    case "Unanswered":
      title = t("{n} unanswered messages in squad chat", { n: a.count });
      sub = `${a.squadName} · ${t("last message {ago}", { ago: rel.ago(a.atUtc) })}`;
      right = <OutlineLink href={`${squadHref}?tab=chat`}>{t("Message")}</OutlineLink>;
      break;
    case "AdminReplied":
      title = t("Admin replied to your report");
      sub = [a.studentName ?? a.squadName, rel.ago(a.atUtc)].filter(Boolean).join(" · ");
      right = <OutlineLink href={`/mentor/reports?report=${a.reportId}`}>{t("View reply")}</OutlineLink>;
      break;
  }
  return (
    <li className="flex flex-wrap items-center gap-[0.9em] py-[0.85em]">
      <span className={cn("grid size-[2.6em] shrink-0 place-items-center rounded-[0.8em] bg-gradient-to-br text-white shadow-sm", icon.cls)}>
        <icon.Icon className="size-[1.2em]" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.9em] font-semibold text-[#1b2d54]">{title}</p>
        <p className="truncate text-[0.78em] text-[#64748b]">{sub}</p>
      </div>
      <div className="flex items-center gap-[0.6em]">{right}</div>
    </li>
  );
}

function OutlineLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href as Route} className="rounded-[0.7em] border border-[#d6dde6] bg-white px-[1.1em] py-[0.5em] text-[0.82em] font-medium text-[#1b2d54] hover:bg-[#f7f9fc]">
      {children}
    </Link>
  );
}

function WeekRow({ event: e }: { event: WeekEvent }) {
  const { t, intl } = useI18n();
  const d = new Date(e.atUtc);
  const when = d.toLocaleString(intl, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  const today = new Date().toDateString() === d.toDateString();
  const label = { ReviewDue: t("Review due"), SprintEnds: t("{sprint} ends", { sprint: e.sprintName ?? t("Sprint") }), GroupSession: t("Group session"), OneToOne: t("One-to-one session") }[e.kind];
  const href = e.squadId ? `/mentor/squads/${e.squadId}` : e.sessionId ? `/mentor/sessions/${e.sessionId}` : "/mentor/calendar";
  return (
    <li>
      <Link href={href as Route} className="flex items-center gap-[0.9em]">
        <span className="grid w-[3em] shrink-0 place-items-center rounded-[0.7em] border border-[#cfe0f5] bg-[#eef5ff] py-[0.35em] leading-none">
          <span className="text-[0.6em] font-semibold uppercase text-[#1d5fd1]">{d.toLocaleDateString(intl, { weekday: "short" })}</span>
          <span className="mt-[0.2em] text-[1.25em] font-bold text-[#1b2d54]">{d.getDate()}</span>
        </span>
        <span className="min-w-0">
          <span className="block text-[0.88em] font-semibold text-[#1b2d54]">{label}</span>
          <span className="block truncate text-[0.75em] text-[#64748b]">
            {today ? `${t("Today")} · ${d.toLocaleTimeString(intl, { hour: "numeric", minute: "2-digit" })}` : when} · {e.title}
          </span>
        </span>
      </Link>
    </li>
  );
}

function OverviewSkeleton() {
  return (
    <>
      <div className="grid grid-cols-2 gap-[1em] md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <Card key={i} className="space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-9 w-12" />
            <Skeleton className="h-2.5 w-28" />
          </Card>
        ))}
      </div>
      <div className="grid gap-[1.4em] xl:grid-cols-[1fr_24em]">
        <Card className="space-y-5">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="size-10 rounded-[0.8em]" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-2.5 w-1/3" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </Card>
        <Card className="space-y-5">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-11 rounded-[0.7em]" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </Card>
      </div>
    </>
  );
}

export type { MentorOverview };
