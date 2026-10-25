"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { CheckCircle2, PencilLine, Star, Users } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { getMentorReviews } from "@/lib/monitor-api";
import { cn } from "@/lib/utils";
import { Card, CardTitle, EmptyState, ErrorState, FootNote, LevelBadge, LinkButton, MentorAvatar, MentorPage, Pill, RolePill, Skeleton, UnderlineTabs, useRelative } from "../mentor-area-ui";
import { useApi } from "../use-api";
import { SquadIcon } from "./squad-parts";

type Tab = "waiting" | "drafts" | "students" | "history";

export default function Reviews() {
  const { t, intl } = useI18n();
  const rel = useRelative();
  const { data, error, loading, reload } = useApi(getMentorReviews);
  const [tab, setTab] = useState<Tab>("waiting");
  const stamp = (iso: string) => new Date(iso).toLocaleString(intl, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

  if (error) return <MentorPage title={t("Reviews")}><ErrorState title={t("We could not load your reviews")} onRetry={reload} error={error} /></MentorPage>;

  const tabs = [
    { value: "waiting" as const, label: t("Waiting"), count: data?.waiting.length },
    { value: "drafts" as const, label: t("Drafts"), count: data?.drafts.length },
    { value: "students" as const, label: t("My student reviews") },
    { value: "history" as const, label: t("History") },
  ];
  const head = (cols: string[]) => (
    <thead>
      <tr className="text-[0.9em] text-[#475467]">{cols.map((h, i) => <th key={i} className="pb-[0.8em] text-start font-medium">{h}</th>)}</tr>
    </thead>
  );
  const startBtn = (squadId: string, label = t("Start review")) => (
    <Link href={`/mentor/reviews/${squadId}` as Route}
      className="inline-flex rounded-[0.7em] bg-gradient-to-r from-[#0f6b70] to-[#1b2d54] px-[1.1em] py-[0.55em] text-[0.9em] font-semibold text-white shadow-[0_6px_16px_rgba(15,107,112,0.3)] rtl:bg-gradient-to-l">
      {label}
    </Link>
  );
  const squadCell = (id: string, name: string) => (
    <span className="flex items-center gap-[0.7em] font-semibold text-[#1b2d54]"><SquadIcon id={id} className="size-[2.2em]" /> {name}</span>
  );

  return (
    <MentorPage title={t("Reviews")} subtitle={t("Review squad submissions and write a review for each student.")}>
      <Card>
        <UnderlineTabs value={tab} onChange={setTab} tabs={tabs} />
        <div className="pt-[0.6em]">
          {loading || !data ? (
            <div className="space-y-5 py-4">{Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-6 w-full" />)}</div>
          ) : tab === "waiting" ? (
            data.waiting.length === 0 ? (
              <EmptyState title={t("You are all caught up")}
                text={t("No squads are waiting for your review right now. When a squad submits a sprint, it shows up here and you get an email.")}>
                <LinkButton href="/mentor/squads" primary>{t("Open My squads")}</LinkButton>
                <button type="button" onClick={() => setTab("history")} className="rounded-[0.7em] border border-[#d6dde6] bg-white px-[1em] py-[0.55em] text-[0.85em] font-medium text-[#1b2d54]">{t("View History")}</button>
              </EmptyState>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[52em] text-[0.85em]">
                  {head([t("Squad"), t("Project"), t("Level"), t("Submitted"), t("Submitted date"), t("Countdown"), ""])}
                  <tbody className="divide-y divide-[#eef2f6]">
                    {data.waiting.map((w) => {
                      const c = rel.countdown(w.dueUtc);
                      return (
                        <tr key={w.squadId}>
                          <td className="py-[1em] pe-3">{squadCell(w.squadId, w.squadName)}</td>
                          <td className="pe-3 text-[#475467]">{w.projectTitle}</td>
                          <td className="pe-3"><LevelBadge level={w.level} /></td>
                          <td className="pe-3 text-[#1b2d54]">{t("{a} of {b}", { a: w.submitted, b: w.members })}</td>
                          <td className="pe-3 text-[#475467]">{stamp(w.submittedUtc)}</td>
                          <td className="pe-3"><Pill tone={c.overdue ? "red" : "amber"} dot={false}>{c.label}</Pill></td>
                          <td className="text-end">{startBtn(w.squadId)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : tab === "drafts" ? (
            data.drafts.length === 0 ? (
              <EmptyState title={t("No drafts")} text={t("Reviews you start and save show up here until you submit them.")} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[46em] text-[0.85em]">
                  {head([t("Squad"), t("Project"), t("Round"), t("Student reviews done"), t("Last saved"), ""])}
                  <tbody className="divide-y divide-[#eef2f6]">
                    {data.drafts.map((d) => (
                      <tr key={d.squadId}>
                        <td className="py-[1em] pe-3">{squadCell(d.squadId, d.squadName)}</td>
                        <td className="pe-3 text-[#475467]">{d.projectTitle}</td>
                        <td className="pe-3 text-[#1b2d54]">{d.round}</td>
                        <td className="pe-3 text-[#1b2d54]">{t("{a} of {b}", { a: d.done, b: d.total })}</td>
                        <td className="pe-3 text-[#475467]">{rel.ago(d.updatedUtc)}</td>
                        <td className="text-end">{startBtn(d.squadId, t("Continue review"))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : tab === "students" ? (
            data.studentReviews.length === 0 ? (
              <EmptyState title={t("No student reviews yet")} text={t("When you submit a squad review, the review of each student is kept here.")} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[50em] text-[0.85em]">
                  {head([t("Student"), t("Squad and role"), t("Round"), t("Score"), t("Shared"), t("Submitted"), ""])}
                  <tbody className="divide-y divide-[#eef2f6]">
                    {data.studentReviews.map((r) => (
                      <tr key={`${r.squadId}-${r.round}-${r.studentId}`}>
                        <td className="py-[0.9em] pe-3"><span className="flex items-center gap-[0.6em] font-semibold text-[#1b2d54]"><MentorAvatar name={r.studentName} photoUrl={r.photoUrl} className="size-[2.1em]" />{r.studentName}</span></td>
                        <td className="pe-3"><span className="flex items-center gap-[0.5em] text-[#475467]">{r.squadName} {r.role && <RolePill role={r.role} />}</span></td>
                        <td className="pe-3 text-[#1b2d54]">{r.round}</td>
                        <td className="pe-3"><span className="flex items-center gap-1 font-semibold text-[#1b2d54]"><Star className="size-[1em] text-[#f59e0b]" />{r.overall ?? "—"}</span></td>
                        <td className="pe-3 text-[#475467]">{r.shared ? t("Yes") : t("No")}</td>
                        <td className="pe-3 text-[#475467]">{stamp(r.submittedUtc)}</td>
                        <td className="text-end"><LinkButton href={`/mentor/reviews/${r.squadId}?round=${r.round}`}>{t("View review")}</LinkButton></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : data.history.length === 0 ? (
            <EmptyState title={t("No reviews yet")} text={t("Your submitted reviews will be listed here.")} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[50em] text-[0.85em]">
                {head([t("Squad"), t("Project"), t("Round"), t("Decision"), t("Avg score"), t("Reviewed"), t("Time to review"), ""])}
                <tbody className="divide-y divide-[#eef2f6]">
                  {data.history.map((h) => (
                    <tr key={`${h.squadId}-${h.round}`}>
                      <td className="py-[1em] pe-3">{squadCell(h.squadId, h.squadName)}</td>
                      <td className="pe-3 text-[#475467]">{h.projectTitle}</td>
                      <td className="pe-3 text-[#1b2d54]">{h.round}</td>
                      <td className="pe-3">{h.decision === "Approved" ? <Pill tone="green">{t("Approved")}</Pill> : <Pill tone="orange">{t("Changes requested")}</Pill>}</td>
                      <td className="pe-3 font-semibold text-[#1b2d54]">{h.averageScore ?? "—"}</td>
                      <td className="pe-3 text-[#475467]">{stamp(h.reviewedUtc)}</td>
                      <td className="pe-3 text-[#475467]">{h.daysToReview != null ? t("{n} d", { n: h.daysToReview }) : "—"}</td>
                      <td className="text-end"><LinkButton href={`/mentor/reviews/${h.squadId}?round=${h.round}`}>{t("View review")}</LinkButton></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      <FootNote>{t("Squads are listed oldest first. You have 3 days to review a submission; after that the Admin is reminded.")}</FootNote>

      {data && data.waiting.length === 0 && tab === "waiting" ? (
        <>
          <h3 className="text-[1.1em] font-bold text-[#1b2d54]">{t("While you wait")}</h3>
          <div className="grid gap-[1.2em] md:grid-cols-3">
            <WaitCard icon={<Users className="size-[1.2em] text-[#0f7378]" />} tint="bg-[#e0f4f2]" title={t("Check My squads")}
              text={t("See each squad's sprint progress and who has not submitted yet.")} link={{ label: t("Open My squads"), href: "/mentor/squads" }} />
            <WaitCard icon={<PencilLine className="size-[1.2em] text-[#c2570c]" />} tint="bg-[#fff1e3]" title={t("Finish your draft")}
              text={data.drafts.length > 0 ? t("You have {n} saved draft review. Pick it up where you left off.", { n: data.drafts.length }) : t("You have no saved drafts.")}
              onClick={() => setTab("drafts")} linkLabel={t("Open drafts")} />
            <WaitCard icon={<Star className="size-[1.2em] text-[#1d5fd1]" />} tint="bg-[#e6f0ff]" title={t("Review a student")}
              text={t("Give a student feedback outside of a sprint review.")} onClick={() => setTab("students")} linkLabel={t("My student reviews")} />
          </div>
        </>
      ) : (
        <div className="grid gap-[1.4em] lg:grid-cols-[1fr_26em]">
          <Card>
            <CardTitle hint={t("How fast you review submissions")}>{t("Review turnaround")}</CardTitle>
            {data && <Turnaround data={data.turnaround} />}
          </Card>
          <Card>
            <CardTitle hint={t("A quick check for every review")}>{t("Before you submit")}</CardTitle>
            <div className="mb-[1em] grid size-[5.5em] place-items-center rounded-[1.2em] bg-[#e3f4f1]">
              <svg viewBox="0 0 60 60" className="size-[3.4em]" aria-hidden>
                <rect x="14" y="8" width="32" height="46" rx="5" fill="#fff" stroke="#1b2d54" strokeWidth="3" />
                <rect x="23" y="5" width="14" height="7" rx="2" fill="#0f7378" />
                <path d="M20 24l3 3 6-6M20 34l3 3 6-6" fill="none" stroke="#0f7378" strokeWidth="3" strokeLinecap="round" />
                <circle cx="23" cy="45" r="3" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
                <path d="M33 25h7M33 35h7M33 45h7" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
            <ul className="space-y-[0.6em] text-[0.85em] text-[#1b2d54]">
              {[t("Score every student on all 5 criteria"), t("Write at least one strength"), t("Decide: Approve or Request changes")].map((x) => (
                <li key={x} className="flex items-center gap-[0.6em]"><CheckCircle2 className="size-[1.1em] text-[#0f7378]" />{x}</li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </MentorPage>
  );
}

function Turnaround({ data }: { data: { averageDays: number | null; thisMonth: number; onTimePercent: number | null; months: { month: string; averageDays: number | null; reviews: number }[] } }) {
  const { t, intl } = useI18n();
  const max = Math.max(1, ...data.months.map((m) => m.averageDays ?? 0));
  return (
    <>
      <div className="grid gap-[0.8em] sm:grid-cols-3">
        <Metric tint="bg-[#e9f6f4]" value={data.averageDays != null ? t("{n} days", { n: data.averageDays }) : "—"} label={t("Average time to review")} />
        <Metric tint="bg-[#eef4fb]" value={String(data.thisMonth)} label={t("Reviews this month")} />
        <Metric tint="bg-[#eef7ee]" value={data.onTimePercent != null ? `${data.onTimePercent}%` : "—"} label={t("Reviewed on time")} />
      </div>
      <div className="mt-[1.4em] flex h-[9em] items-end justify-around gap-[1em]">
        {data.months.map((m, i) => {
          const h = m.averageDays ? Math.max(12, (m.averageDays / max) * 100) : 4;
          const last = i === data.months.length - 1;
          return (
            <div key={m.month} className="flex h-full flex-1 flex-col items-center justify-end">
              <span className="mb-[0.3em] text-[0.75em] font-semibold text-[#1b2d54]">{m.averageDays != null ? t("{n} d", { n: m.averageDays }) : ""}</span>
              <span className={cn("w-[2.6em] rounded-[0.5em]", last ? "bg-[#0f7378]" : "bg-[#a9d6d3]")} style={{ height: `${h}%` }} />
              <span className="mt-[0.4em] text-[0.72em] text-[#64748b]">{new Date(`${m.month}-01T00:00:00`).toLocaleDateString(intl, { month: "short" })}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}

function Metric({ value, label, tint }: { value: string; label: string; tint: string }) {
  return (
    <div className={cn("rounded-[1em] p-[1em]", tint)}>
      <p className="text-[1.5em] font-extrabold text-[#1b2d54]">{value}</p>
      <p className="text-[0.75em] text-[#475467]">{label}</p>
    </div>
  );
}

function WaitCard({ icon, tint, title, text, link, onClick, linkLabel }: {
  icon: React.ReactNode; tint: string; title: string; text: string; link?: { label: string; href: string }; onClick?: () => void; linkLabel?: string;
}) {
  return (
    <Card>
      <div className="flex items-center gap-[0.8em]">
        <span className={cn("grid size-[2.6em] place-items-center rounded-[0.8em]", tint)}>{icon}</span>
        <h4 className="text-[1.05em] font-bold text-[#1b2d54]">{title}</h4>
      </div>
      <p className="mt-[0.8em] text-[0.82em] text-[#475467]">{text}</p>
      {link ? (
        <Link href={link.href as Route} className="mt-[0.5em] inline-block text-[0.82em] font-semibold text-[#0f7378]">{link.label} →</Link>
      ) : (
        <button type="button" onClick={onClick} className="mt-[0.5em] text-[0.82em] font-semibold text-[#0f7378]">{linkLabel} →</button>
      )}
    </Card>
  );
}
