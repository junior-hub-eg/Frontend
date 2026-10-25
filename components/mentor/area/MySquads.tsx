"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { LayoutGrid, List } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { getMentorSquads, type SquadRow, type SquadState } from "@/lib/monitor-api";
import { cn } from "@/lib/utils";
import {
  Card, CardTitle, EmptyState, ErrorState, FootNote, LevelBadge, MentorPage, Pill, ProgressBar, SegmentTabs, SelectPill, Skeleton,
  SquadStatePill, WarningCount, useRelative,
} from "../mentor-area-ui";
import { useApi } from "../use-api";
import { SquadCard, SquadFaces, SquadIcon, useSquadText } from "./squad-parts";

type Sort = "daysLeft" | "name" | "progress" | "warnings";
const STATES: (SquadState | "all")[] = ["all", "WaitingForReview", "Late", "Working", "ChangesRequested", "Completed"];

export default function MySquads() {
  const { t } = useI18n();
  const router = useRouter();
  const text = useSquadText();
  const rel = useRelative();
  const { data, error, loading, reload } = useApi(getMentorSquads);
  const [tab, setTab] = useState<"current" | "history">("current");
  const [status, setStatus] = useState<SquadState | "all">("all");
  const [level, setLevel] = useState<"all" | "Beginner" | "Intermediate" | "Advanced">("all");
  const [sort, setSort] = useState<Sort>("daysLeft");
  const [view, setView] = useState<"list" | "cards">("list");

  const current = useMemo(() => data?.filter((r) => r.isCurrent) ?? [], [data]);
  const history = useMemo(() => data?.filter((r) => !r.isCurrent) ?? [], [data]);
  const shown = useMemo(() => {
    const rows = (tab === "current" ? current : history).filter((r) => (status === "all" || r.state === status) && (level === "all" || r.level === level));
    const key = (r: SquadRow) =>
      sort === "name" ? r.name : sort === "progress" ? -r.progress : sort === "warnings" ? -r.warnings : r.reviewDueUtc ? new Date(r.reviewDueUtc).getTime() / 86400000 - 1e6 : (r.daysLeft ?? 999);
    return [...rows].sort((a, b) => {
      const ka = key(a);
      const kb = key(b);
      return typeof ka === "string" ? ka.localeCompare(kb as string) : (ka as number) - (kb as number);
    });
  }, [current, history, tab, status, level, sort]);

  const stateLabel = (s: SquadState | "all") =>
    s === "all" ? t("All") : ({ WaitingForReview: t("Waiting for your review"), Late: t("Late"), Working: t("Squad is working"), ChangesRequested: t("Changes requested"), Completed: t("Completed") } as const)[s];

  return (
    <MentorPage title={t("My squads")} subtitle={t("All the squads you monitor, now and before.")}>
      {error ? (
        <ErrorState title={t("We could not load your squads")} onRetry={reload} error={error} />
      ) : (
        <>
          <Card>
            <div className="mb-[1.2em] flex flex-wrap items-center justify-between gap-3">
              <SegmentTabs
                value={tab}
                onChange={setTab}
                tabs={[
                  { value: "current", label: t("Current"), count: data ? current.length : undefined },
                  { value: "history", label: t("History"), count: data ? history.length : undefined },
                ]}
              />
              <div className="flex flex-wrap items-center gap-[0.6em]">
                <SelectPill label={t("Status")} value={status} onChange={setStatus} options={STATES.map((s) => ({ value: s, label: stateLabel(s) }))} />
                <SelectPill label={t("Level")} value={level} onChange={setLevel}
                  options={(["all", "Beginner", "Intermediate", "Advanced"] as const).map((l) => ({ value: l, label: l === "all" ? t("All") : t(l) }))} />
                <SelectPill label={t("Sort")} value={sort} onChange={setSort}
                  options={[{ value: "daysLeft", label: t("Days left") }, { value: "name", label: t("Name") }, { value: "progress", label: t("Progress") }, { value: "warnings", label: t("Warnings") }]} />
                <div className="flex rounded-[0.7em] border border-[#d6dde6] bg-white p-[0.2em]">
                  {(["cards", "list"] as const).map((v) => (
                    <button key={v} type="button" onClick={() => setView(v)} aria-label={t(v === "cards" ? "Cards view" : "List view")} aria-pressed={view === v}
                      className={cn("grid size-[2.1em] place-items-center rounded-[0.5em]", view === v ? "bg-[#e0f4f2] text-[#0f7378]" : "text-[#64748b]")}>
                      {v === "cards" ? <LayoutGrid className="size-[1.1em]" /> : <List className="size-[1.1em]" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {loading ? (
              <TableSkeleton />
            ) : shown.length === 0 ? (
              <EmptyState
                title={tab === "current" ? t("No squads here") : t("No completed squads yet")}
                text={tab === "current" && current.length === 0 ? t("You don't monitor a squad yet. The Admin assigns squads to monitors.") : t("Try another filter.")}
              />
            ) : view === "cards" ? (
              <div className="grid gap-[1.2em] lg:grid-cols-2">
                {shown.map((r) => (
                  <div key={r.id} className="[&>a]:bg-[#f7fafc] [&>a]:shadow-none [&>a]:ring-1 [&>a]:ring-[#e6ebf1]">
                    <SquadCard row={r} compact />
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[60em] text-start text-[0.85em]">
                  <thead>
                    <tr className="text-start text-[0.9em] text-[#475467]">
                      {[t("Squad"), t("Project"), t("Level"), t("Status"), t("Sprint"), t("Progress"), t("Members"), t("Submitted"), t("Warnings")].map((h) => (
                        <th key={h} className="pb-[0.8em] text-start font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef2f6] border-t border-[#eef2f6]">
                    {shown.map((r) => (
                      <tr key={r.id} onClick={() => router.push(`/mentor/squads/${r.id}` as Route)} className="cursor-pointer hover:bg-[#f7fafc]">
                        <td className="py-[1em] pe-3">
                          <Link href={`/mentor/squads/${r.id}` as Route} className="flex items-center gap-[0.7em] font-semibold text-[#1b2d54]" onClick={(e) => e.stopPropagation()}>
                            <SquadIcon id={r.id} className="size-[2.2em]" /> {r.name}
                          </Link>
                        </td>
                        <td className="pe-3 text-[#475467]">{r.projectTitle}</td>
                        <td className="pe-3"><LevelBadge level={r.level} /></td>
                        <td className="pe-3"><SquadStatePill state={r.state} /></td>
                        <td className="pe-3">
                          <p className="font-semibold text-[#1b2d54]">{r.sprintName ?? "—"}</p>
                          <p className="text-[0.85em] text-[#64748b]">{text.sprintNote(r)}</p>
                        </td>
                        <td className="pe-3">
                          <span className="flex items-center gap-[0.6em]">
                            <ProgressBar value={r.progress} className="w-[4.5em]" />
                            <b className="text-[#1b2d54]">{r.progress}%</b>
                          </span>
                        </td>
                        <td className="pe-3"><SquadFaces row={r} /></td>
                        <td className="pe-3 text-[#1b2d54]">{t("{a} of {b}", { a: r.submittedCount, b: r.memberCount })}</td>
                        <td><WarningCount n={r.warnings} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <FootNote>{loading ? t("Loading your squads...") : t("Completed squads move to the History tab. Click a squad to open its detail page.")}</FootNote>

          {view === "cards" ? (
            <Card>
              <CardTitle hint={t("Next sprint end dates across your squads")}>{t("Upcoming deadlines")}</CardTitle>
              <div className="grid gap-[1em] md:grid-cols-2 xl:grid-cols-4 xl:divide-x xl:divide-[#eef2f6] rtl:xl:divide-x-reverse">
                {deadlines(current).map((d) => (
                  <DeadlineItem key={d.row.id} row={d.row} at={d.at} kind={d.kind} inline />
                ))}
              </div>
            </Card>
          ) : (
            <div className="grid gap-[1.4em] lg:grid-cols-3">
              <Card>
                <CardTitle hint={t("Sprint end dates for the squads you monitor")}>{t("Upcoming deadlines")}</CardTitle>
                {loading ? <ListSkeleton /> : (
                  <ul className="divide-y divide-[#eef2f6]">
                    {deadlines(current).map((d) => (
                      <li key={d.row.id} className="py-[0.8em]">
                        <DeadlineItem row={d.row} at={d.at} kind={d.kind} />
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
              <Card>
                <CardTitle hint={t("How your {n} current squads are doing", { n: current.length })}>{t("Status overview")}</CardTitle>
                {loading ? <ListSkeleton /> : <StatusOverview rows={current} />}
              </Card>
              <Card>
                <CardTitle hint={t("Open these first")}>{t("Needs your attention")}</CardTitle>
                {loading ? <ListSkeleton /> : (
                  <>
                    <ul className="divide-y divide-[#eef2f6]">
                      {attention(current).map(({ row, kind }) => {
                        const c = row.reviewDueUtc ? rel.countdown(row.reviewDueUtc) : null;
                        return (
                          <li key={row.id}>
                            <Link href={`/mentor/squads/${row.id}` as Route} className="flex items-center gap-[0.8em] py-[0.8em]">
                              <span className={cn("grid size-[2.4em] place-items-center rounded-[0.7em]", kind === "Overdue" ? "bg-[#fde8e8]" : "bg-[#fff1e3]")}>
                                <span className={cn("size-[0.7em] rounded-full", kind === "Overdue" ? "bg-[#e5484d]" : "bg-[#d97706]")} />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-[0.88em] font-semibold text-[#1b2d54]">{row.name}</span>
                                <span className="block truncate text-[0.75em] text-[#64748b]">
                                  {kind === "Overdue" && c ? t("Review overdue by {n} days", { n: Math.max(1, Math.round(-(new Date(row.reviewDueUtc!).getTime() - Date.now()) / 86400000)) })
                                    : kind === "Review" && c ? `${t("Review due {when}", { when: c.label.toLowerCase() })} · ${t("{a} of {b} submitted", { a: row.submittedCount, b: row.memberCount })}`
                                    : `${t("Behind schedule")} · ${t("{n} members have a warning", { n: row.warnings })}`}
                                </span>
                              </span>
                              <Pill tone={kind === "Overdue" ? "red" : "amber"} dot={false}>{t(kind)}</Pill>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                    {attention(current).length === 0 && <p className="text-[0.85em] text-[#475467]">{t("Nothing needs you right now.")}</p>}
                    <p className="mt-[0.8em] rounded-[0.8em] bg-[#eef6f6] px-[1em] py-[0.7em] text-[0.78em] text-[#475467]">{t("Late squads notify the Admin and all students.")}</p>
                  </>
                )}
              </Card>
            </div>
          )}
        </>
      )}
    </MentorPage>
  );
}

function deadlines(rows: SquadRow[]) {
  return rows
    .map((row) => ({
      row,
      at: row.reviewDueUtc ?? (row.sprintEndDate ? `${row.sprintEndDate}T21:00:00Z` : null),
      kind: row.reviewDueUtc ? ("review" as const) : ("sprint" as const),
    }))
    .filter((d): d is { row: SquadRow; at: string; kind: "review" | "sprint" } => d.at !== null)
    .sort((a, b) => a.at.localeCompare(b.at))
    .slice(0, 4);
}

function DeadlineItem({ row, at, kind, inline = false }: { row: SquadRow; at: string; kind: "review" | "sprint"; inline?: boolean }) {
  const { t, intl } = useI18n();
  const rel = useRelative();
  const d = new Date(at);
  const c = rel.countdown(at);
  const chip = (
    <span className="grid w-[3em] shrink-0 place-items-center rounded-[0.7em] border border-[#dfe5ec] bg-[#f4f7fa] py-[0.35em] leading-none">
      <span className="text-[0.6em] font-semibold uppercase text-[#1d5fd1]">{d.toLocaleDateString(intl, { month: "short" })}</span>
      <span className="mt-[0.2em] text-[1.25em] font-bold text-[#1b2d54]">{d.getDate()}</span>
    </span>
  );
  const sub = kind === "review" ? t("Review due") : t("{sprint} ends", { sprint: row.sprintName ?? t("Sprint") });
  const pill = <Pill tone={c.overdue ? "red" : c.tone === "orange" ? "amber" : "blue"} dot={false}>{c.overdue ? c.label : kind === "review" && !c.overdue && c.tone === "orange" ? t("In {n} hours", { n: Math.max(1, Math.round((d.getTime() - Date.now()) / 3600000)) }) : c.label}</Pill>;
  if (inline)
    return (
      <Link href={`/mentor/squads/${row.id}` as Route} className="block xl:px-[1em] xl:first:ps-0">
        <span className="flex items-center gap-[0.8em]">
          {chip}
          <span className="min-w-0">
            <span className="block truncate text-[0.88em] font-semibold text-[#1b2d54]">{row.name}</span>
            <span className="block text-[0.75em] text-[#64748b]">{sub}</span>
          </span>
        </span>
        <span className="mt-[0.7em] flex items-center gap-[0.6em] text-[0.75em] text-[#475467]">
          {pill} {t("{a} of {b} submitted", { a: row.submittedCount, b: row.memberCount })}
        </span>
      </Link>
    );
  return (
    <Link href={`/mentor/squads/${row.id}` as Route} className="flex items-center gap-[0.8em]">
      {chip}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.88em] font-semibold text-[#1b2d54]">{row.name}</span>
        <span className="block truncate text-[0.75em] text-[#64748b]">{sub} · {t("{a} of {b} submitted", { a: row.submittedCount, b: row.memberCount })}</span>
      </span>
      {pill}
    </Link>
  );
}

function StatusOverview({ rows }: { rows: SquadRow[] }) {
  const { t } = useI18n();
  const avg = rows.length ? Math.round(rows.reduce((n, r) => n + r.progress, 0) / rows.length) : 0;
  const parts = [
    { label: t("Squad is working"), n: rows.filter((r) => r.state === "Working" || r.state === "ChangesRequested").length, cls: "bg-[#2563eb]" },
    { label: t("Waiting for your review"), n: rows.filter((r) => r.state === "WaitingForReview").length, cls: "bg-[#f59e0b]" },
    { label: t("Late"), n: rows.filter((r) => r.state === "Late").length, cls: "bg-[#e5484d]" },
    { label: t("Completed this sprint"), n: rows.filter((r) => r.progress >= 100 && r.state !== "WaitingForReview").length, cls: "bg-[#16a34a]" },
  ];
  const total = parts.reduce((n, p) => n + p.n, 0) || 1;
  return (
    <>
      <p className="flex items-end gap-[0.5em]">
        <span className="text-[2.4em] font-extrabold leading-none text-[#1b2d54]">{avg}%</span>
        <span className="pb-[0.3em] text-[0.82em] text-[#475467]">{t("average progress")}</span>
      </p>
      <div className="mt-[1em] flex h-[0.6em] gap-[0.3em]">
        {parts.filter((p) => p.n > 0).map((p) => (
          <span key={p.label} className={cn("rounded-full", p.cls)} style={{ flex: p.n / total }} />
        ))}
      </div>
      <ul className="mt-[1em] space-y-[0.6em] text-[0.85em]">
        {parts.map((p) => (
          <li key={p.label} className="flex items-center justify-between">
            <span className="flex items-center gap-[0.6em] text-[#1b2d54]"><span className={cn("size-[0.6em] rounded-full", p.cls)} />{p.label}</span>
            <b className="text-[#1b2d54]">{p.n}</b>
          </li>
        ))}
      </ul>
    </>
  );
}

function attention(rows: SquadRow[]) {
  const now = Date.now();
  return rows
    .map((row) => ({
      row,
      kind: row.reviewDueUtc && new Date(row.reviewDueUtc).getTime() < now ? ("Overdue" as const) : row.reviewDueUtc ? ("Review" as const) : row.state === "Late" || row.warnings > 0 ? ("Warning" as const) : null,
    }))
    .filter((x): x is { row: SquadRow; kind: "Overdue" | "Review" | "Warning" } => x.kind !== null)
    .slice(0, 4);
}

function TableSkeleton() {
  return (
    <div className="space-y-[1.4em] pt-[0.6em]">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="flex items-center gap-[2em]">
          <Skeleton className="size-[2.2em]" />
          <Skeleton className="h-3 w-[10em]" />
          <Skeleton className="h-3 w-[9em]" />
          <Skeleton className="h-6 w-[4.5em]" />
          <Skeleton className="h-6 w-[8em]" />
          <Skeleton className="h-3 w-[6em]" />
          <Skeleton className="h-3 w-[7em]" />
        </div>
      ))}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-[1.2em]">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="size-[2.6em] rounded-[0.7em]" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-2.5 w-1/2" />
          </div>
          <Skeleton className="h-6 w-14" />
        </div>
      ))}
    </div>
  );
}

