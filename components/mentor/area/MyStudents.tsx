"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import { AlertTriangle, Star } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { getMyStudents, type SquadStudentRow } from "@/lib/monitor-api";
import { cn } from "@/lib/utils";
import { Card, CardTitle, EmptyState, ErrorState, LevelBadge, MentorAvatar, MentorPage, Pill, RolePill, SelectPill, Skeleton, UnderlineTabs, useRelative } from "../mentor-area-ui";
import { useApi } from "../use-api";

export default function MyStudents() {
  const { t, intl } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const rel = useRelative();
  const { data, error, loading, reload } = useApi(getMyStudents);
  const [tab, setTab] = useState<"squad" | "mentees">("squad");
  const [squad, setSquad] = useState("all");
  const [level, setLevel] = useState("all");
  const [onlyWarnings, setOnlyWarnings] = useState(params.get("warning") === "1");

  const squads = useMemo(() => [...new Map((data?.squadStudents ?? []).map((r) => [r.squadId, r.squadName])).entries()], [data]);
  const rows = (data?.squadStudents ?? []).filter((r) => (squad === "all" || r.squadId === squad) && (level === "all" || r.level === level) && (!onlyWarnings || r.warning));
  const mentees = (data?.mentees ?? []).filter((m) => level === "all" || m.level === level);
  const warned = (data?.squadStudents ?? []).filter((r) => r.warning);
  const scored = (data?.squadStudents ?? []).map((r) => r.lastReview).filter((v): v is number => v != null);

  const warningText = (r: SquadStudentRow) =>
    r.warning === "Inactive" ? t("No task moved for {n} days", { n: r.idleDays }) : t("{n} tasks overdue", { n: r.overdueTasks });
  const open = (id: string) => router.push(`/mentor/students/${id}` as Route);

  if (error) return <MentorPage title={t("My students")}><ErrorState title={t("We could not load your students")} onRetry={reload} error={error} /></MentorPage>;

  return (
    <MentorPage title={t("My students")} subtitle={t("Every student you are responsible for.")}>
      <Card>
        <UnderlineTabs value={tab} onChange={setTab} tabs={[
          { value: "squad", label: t("Squad students"), count: data?.squadStudents.length },
          { value: "mentees", label: t("Mentees"), count: data?.mentees.length },
        ]} />
        <div className="my-[1.2em] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-[0.6em]">
            {tab === "squad" && <SelectPill label={t("Squad")} value={squad} onChange={setSquad} options={[{ value: "all", label: t("All") }, ...squads.map(([id, name]) => ({ value: id, label: name }))]} />}
            <SelectPill label={t("Level")} value={level} onChange={setLevel}
              options={["all", "Beginner", "Intermediate", "Advanced"].map((l) => ({ value: l, label: l === "all" ? t("All") : t(l) }))} />
          </div>
          {tab === "squad" && (
            <label className="flex items-center gap-[0.6em] text-[0.85em] text-[#1b2d54]">
              <button type="button" role="switch" aria-checked={onlyWarnings} onClick={() => setOnlyWarnings(!onlyWarnings)}
                className={cn("relative h-[1.5em] w-[2.7em] rounded-full transition", onlyWarnings ? "bg-[#0f7378]" : "bg-[#d6dde6]")}>
                <span className={cn("absolute top-[0.15em] size-[1.2em] rounded-full bg-white shadow transition-all", onlyWarnings ? "start-[1.35em]" : "start-[0.15em]")} />
              </button>
              {t("Has warning")}
            </label>
          )}
        </div>
        {loading ? (
          <div className="space-y-5">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-7 w-full" />)}</div>
        ) : tab === "squad" ? (
          rows.length === 0 ? <EmptyState title={t("No students here")} text={t("Try another filter.")} /> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[58em] text-[0.85em]">
                <thead>
                  <tr className="text-[0.9em] text-[#475467]">
                    {[t("Student"), t("Squad and role"), t("Level"), t("Tasks done"), t("Last active"), t("Last review"), t("Warning")].map((h) => <th key={h} className="pb-[0.8em] text-start font-medium">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef2f6] border-t border-[#eef2f6]">
                  {rows.map((r) => (
                    <tr key={`${r.squadId}-${r.studentId}`} onClick={() => open(r.studentId)} className="cursor-pointer hover:bg-[#f7fafc]">
                      <td className="py-[0.9em] pe-3"><span className="flex items-center gap-[0.7em] font-semibold text-[#1b2d54]"><MentorAvatar name={r.fullName} photoUrl={r.photoUrl} className="size-[2.4em]" />{r.fullName}</span></td>
                      <td className="pe-3"><span className="flex items-center gap-[0.6em] text-[#475467]">{r.squadName} <RolePill role={r.role} /></span></td>
                      <td className="pe-3"><LevelBadge level={r.level} /></td>
                      <td className="pe-3 text-[#1b2d54]">{r.tasksDone}</td>
                      <td className={cn("pe-3", r.warning === "Inactive" ? "text-[#c81e1e]" : "text-[#475467]")}>{rel.ago(r.lastActiveUtc)}</td>
                      <td className="pe-3">{r.lastReview != null ? <span className="flex items-center gap-1 font-semibold text-[#1b2d54]"><Star className="size-[1em] text-[#f59e0b]" />{r.lastReview}</span> : <span className="text-[#98a2b3]">—</span>}</td>
                      <td>{r.warning ? <Pill tone="orange" icon={<AlertTriangle className="size-[1em]" />}>{warningText(r)}</Pill> : <span className="text-[#98a2b3]">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : mentees.length === 0 ? <EmptyState title={t("No mentees yet")} text={t("Students who choose you as their mentor show up here.")} /> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[52em] text-[0.85em]">
              <thead>
                <tr className="text-[0.9em] text-[#475467]">
                  {[t("Student"), t("Track"), t("Level"), t("Sessions done"), t("Next session"), t("Last active")].map((h) => <th key={h} className="pb-[0.8em] text-start font-medium">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef2f6] border-t border-[#eef2f6]">
                {mentees.map((m) => (
                  <tr key={m.studentId} onClick={() => open(m.studentId)} className="cursor-pointer hover:bg-[#f7fafc]">
                    <td className="py-[0.9em] pe-3"><span className="flex items-center gap-[0.7em] font-semibold text-[#1b2d54]"><MentorAvatar name={m.fullName} photoUrl={m.photoUrl} className="size-[2.4em]" />{m.fullName}</span></td>
                    <td className="pe-3 text-[#475467]">{t(m.trackName)}</td>
                    <td className="pe-3"><LevelBadge level={m.level} /></td>
                    <td className="pe-3 text-[#1b2d54]">{m.sessionsDone}</td>
                    <td className="pe-3 text-[#475467]">{m.nextSessionUtc ? new Date(m.nextSessionUtc).toLocaleString(intl, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "—"}</td>
                    <td className="pe-3 text-[#475467]">{rel.ago(m.lastActiveUtc)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="grid gap-[1.4em] lg:grid-cols-2">
        <Card>
          <CardTitle hint={t("Warnings from the last 7 days")}>{t("Students needing attention")}</CardTitle>
          {warned.length === 0 ? <p className="text-[0.85em] text-[#475467]">{t("No student has a warning.")}</p> : (
            <ul className="divide-y divide-[#eef2f6]">
              {warned.slice(0, 4).map((r) => (
                <li key={`${r.squadId}-${r.studentId}`}>
                  <button type="button" onClick={() => open(r.studentId)} className="flex w-full items-center gap-[0.8em] py-[0.7em] text-start">
                    <MentorAvatar name={r.fullName} photoUrl={r.photoUrl} className="size-[2.3em]" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.88em] font-semibold text-[#1b2d54]">{r.fullName}</span>
                      <span className="block truncate text-[0.75em] text-[#64748b]">{r.squadName} · {warningText(r)}</span>
                    </span>
                    <Pill tone={r.warning === "Inactive" ? "red" : "amber"} dot={false}>{t(r.warning === "Inactive" ? "Inactive" : "Overdue")}</Pill>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-[0.8em] rounded-[0.8em] bg-[#eef6f6] px-[1em] py-[0.6em] text-[0.78em] text-[#475467]">{t("Open a student to message them or write a review.")}</p>
          <div className="mt-[0.8em] grid grid-cols-2 gap-[0.8em]">
            <div className="rounded-[1em] bg-[#fbf3ea] p-[1em]"><p className="text-[1.5em] font-extrabold text-[#1b2d54]">{warned.length}</p><p className="text-[0.78em] text-[#475467]">{t("Students with a warning")}</p></div>
            <div className="rounded-[1em] bg-[#eef7f1] p-[1em]"><p className="text-[1.5em] font-extrabold text-[#1b2d54]">{(data?.squadStudents.length ?? 0) - warned.length}</p><p className="text-[0.78em] text-[#475467]">{t("Students on track")}</p></div>
          </div>
        </Card>
        <Card>
          <CardTitle hint={t("Latest review score of the students listed above")}>{t("Review score spread")}</CardTitle>
          <p className="flex items-end gap-[0.5em]">
            <span className="text-[2.4em] font-extrabold leading-none text-[#1b2d54]">{scored.length ? (scored.reduce((a, b) => a + b, 0) / scored.length).toFixed(1) : "—"}</span>
            <span className="pb-[0.3em] text-[0.82em] text-[#475467]">{t("average of 5")}</span>
          </p>
          <ul className="mt-[1.2em] space-y-[0.9em] text-[0.82em]">
            {[
              { label: "4.5 - 5.0", test: (v: number) => v >= 4.5, cls: "bg-[#16a34a]", bg: "bg-[#dcf2e3]" },
              { label: "4.0 - 4.4", test: (v: number) => v >= 4 && v < 4.5, cls: "bg-[#0f7378]", bg: "bg-[#d5ecea]" },
              { label: "3.5 - 3.9", test: (v: number) => v >= 3.5 && v < 4, cls: "bg-[#b45309]", bg: "bg-[#f6ead9]" },
              { label: t("Below 3.5"), test: (v: number) => v < 3.5, cls: "bg-[#dc2626]", bg: "bg-[#f9dede]" },
            ].map((b) => {
              const n = scored.filter(b.test).length;
              return (
                <li key={b.label} className="flex items-center gap-[0.8em]">
                  <span className="w-[5em] text-[#1b2d54]">{b.label}</span>
                  <span className={cn("h-[0.55em] flex-1 overflow-hidden rounded-full", b.bg)}><span className={cn("block h-full rounded-full", b.cls)} style={{ width: `${scored.length ? (n / scored.length) * 100 : 0}%` }} /></span>
                  <b className="w-[1.5em] text-end text-[#1b2d54]">{n}</b>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </MentorPage>
  );
}
