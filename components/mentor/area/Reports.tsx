"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Activity, CheckCircle2, ClipboardCheck, Clock, MessageSquare, Star, TrendingUp, UsersRound, Video } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { useI18n } from "@/lib/i18n/client";
import { makeT, tk } from "@/lib/i18n/translate";
import {
  getMentorSquads, getMyMentorReports, getMyStudents, getSquadReport, getStudentReport, recordReportExport, sendMentorReport,
  type ReportCategory, type SquadReport, type StudentReport,
} from "@/lib/monitor-api";
import { MENTOR_TREND_KEYS, exportMentorExcel, getMentorTrends, type MentorTrendKey, type MentorTrends } from "@/lib/reports-api";
import { cn } from "@/lib/utils";
import {
  BarList, DataTable, DonutChart, ExportMenu, FilterSelect, KitError, KitSkeleton, KpiCard, KpiGrid, PrintReport, PrintSection, ReportCard,
  ReportHeader, ScheduleCard, TrendChart, defaultRange, formatDay, usePrintReport, weeklyPoints, type DateRange,
} from "@/components/report-kit";
import {
  Card, CardTitle, Dialog, EmptyState, ErrorState, Field, MentorAvatar, MentorPage, Pill, PrimaryButton, SecondaryButton, SelectPill,
  Skeleton, SquadStatePill, UnderlineTabs, inputCls,
} from "../mentor-area-ui";
import { useApi } from "../use-api";
import { categoryLabel, delayLabel } from "./SquadDetail";

type Tab = "squad" | "student";

const KPI_META: Record<MentorTrendKey, { label: string; icon: React.ReactNode; tint: string }> = {
  tasksDone: { label: tk("Tasks done"), icon: <ClipboardCheck className="size-[1.1em]" />, tint: "bg-[#e6f0ff] text-[#1d5fd1]" },
  storyPoints: { label: tk("Story points"), icon: <Star className="size-[1.1em]" />, tint: "bg-[#fff1e3] text-[#c2570c]" },
  activeMembers: { label: tk("Active members"), icon: <UsersRound className="size-[1.1em]" />, tint: "bg-[#e0f4f2] text-[#0f7378]" },
  reviews: { label: tk("Reviews"), icon: <CheckCircle2 className="size-[1.1em]" />, tint: "bg-[#efe9ff] text-[#6b3fd6]" },
  sessionsCompleted: { label: tk("Sessions completed"), icon: <Video className="size-[1.1em]" />, tint: "bg-[#e3f6ea] text-[#167a3e]" },
  chatMessages: { label: tk("Chat messages"), icon: <MessageSquare className="size-[1.1em]" />, tint: "bg-[#fde8f1] text-[#b4236a]" },
};

export default function Reports() {
  const { t, intl } = useI18n();
  const params = useSearchParams();
  const [tab, setTab] = useState<Tab>("squad");
  const squads = useApi(getMentorSquads);
  const students = useApi(getMyStudents);
  const [range, setRange] = useState<DateRange>(defaultRange);
  /** "" = all squads (the trends); the squad report then shows the picked or the current squad. */
  const [squadFilter, setSquadFilter] = useState("");
  const [pickedSquad, setPickedSquad] = useState("");
  const [pickedStudent, setStudentId] = useState("");
  const [period, setPeriod] = useState("all");
  const [reporting, setReporting] = useState(params.get("report") === "1");
  const mine = useApi(getMyMentorReports);
  const focus = params.get("report");

  const squadId = squadFilter || pickedSquad || (squads.data?.find((s) => s.isCurrent) ?? squads.data?.[0])?.id || "";
  const people = useMemo(() => {
    const all = [...(students.data?.squadStudents ?? []).map((s) => ({ id: s.studentId, name: s.fullName })), ...(students.data?.mentees ?? []).map((m) => ({ id: m.studentId, name: m.fullName }))];
    return [...new Map(all.map((p) => [p.id, p])).values()];
  }, [students.data]);
  const studentId = pickedStudent || people[0]?.id || "";

  const trends = useApi(() => getMentorTrends(squadFilter || undefined, range.from, range.to), [squadFilter, range.from, range.to]);
  const squadReport = useApi(() => (squadId ? getSquadReport(squadId) : Promise.resolve(null)), [squadId]);
  const studentReport = useApi(() => (studentId && tab === "student" ? getStudentReport(studentId) : Promise.resolve(null)), [studentId, tab]);

  const shownSquad = squadReport.data && (period === "all" ? squadReport.data : filterSprint(squadReport.data, period));

  const { printing, print } = usePrintReport((lang) => {
    const r = tab === "squad" ? (squadId ? { squadId } : null) : studentId ? { studentId } : null;
    if (r) recordReportExport({ ...r, language: lang }).then(() => tab === "squad" && squadReport.reload(), () => undefined);
  });

  const squadOptions = [{ value: "", label: t("All squads") }, ...(squads.data ?? []).map((s) => ({ value: s.id, label: s.name }))];
  const filterName = squadOptions.find((o) => o.value === squadFilter)?.label;

  const pickSquad = (id: string) => {
    setPickedSquad(id);
    if (squadFilter) setSquadFilter(id);
    setPeriod("all");
  };

  return (
    <MentorPage title={t("Reports")} subtitle={t("Progress, scores and delays of your own squads and students.")}>
      {squads.error ? <ErrorState title={t("We could not load your reports")} onRetry={squads.reload} error={squads.error} /> : (
        <>
          <ReportHeader
            range={range}
            onRangeChange={setRange}
            filters={<FilterSelect label={t("Squad")} value={squadFilter} options={squadOptions} onChange={(v) => { setSquadFilter(v); if (v) setPickedSquad(v); setPeriod("all"); }} />}
            actions={
              <ExportMenu
                onExcel={(lang) => exportMentorExcel(squadFilter || undefined, range.from, range.to, lang)}
                onPdf={print}
              />
            }
          />

          <TrendsSection trends={trends.data} loading={trends.loading} error={trends.error ? t("We could not load the activity for this period.") : null} onRetry={trends.reload} squadName={squadFilter ? filterName : undefined} />

          <Card>
            <UnderlineTabs value={tab} onChange={setTab} tabs={[{ value: "squad", label: t("Squad report") }, { value: "student", label: t("Student report") }]} />
            <div className="mt-[1.2em] flex flex-wrap gap-[0.6em]">
              {tab === "squad" ? (
                <>
                  <SelectPill label={t("Squad")} value={squadId} onChange={pickSquad} options={(squads.data ?? []).map((s) => ({ value: s.id, label: s.name }))} />
                  <SelectPill label={t("Period")} value={period} onChange={setPeriod} options={sprintOptions(squadReport.data, t, intl)} />
                </>
              ) : (
                <SelectPill label={t("Student")} value={studentId} onChange={setStudentId} options={people.map((p) => ({ value: p.id, label: p.name }))} />
              )}
            </div>
          </Card>

          {tab === "squad" ? (
            (squads.data?.length ?? 1) === 0 ? <Card><EmptyState title={t("No squads yet")} text={t("Reports show up once you monitor a squad.")} /></Card>
              : squadReport.error ? <ErrorState title={t("We could not load this report")} onRetry={squadReport.reload} error={squadReport.error} />
              : !shownSquad ? <Card><Skeleton className="h-[16em] w-full" /></Card> : <SquadReportBody data={shownSquad} />
          ) : (
            people.length === 0 && !students.loading ? <Card><EmptyState title={t("No students yet")} text={t("Reports show up once you monitor a squad.")} /></Card>
              : studentReport.error ? <ErrorState title={t("We could not load this report")} onRetry={studentReport.reload} error={studentReport.error} />
              : !studentReport.data ? <Card><Skeleton className="h-[16em] w-full" /></Card> : <StudentReportBody data={studentReport.data} />
          )}

          <ScheduleCard />

          <p className="text-[0.82em] text-[#475467]">
            {t("Something wrong with a squad or a student?")}{" "}
            <button type="button" onClick={() => setReporting(true)} className="font-semibold text-[#0f7378]">{t("Report it to the Admin")} →</button>
          </p>
          {mine.data && mine.data.length > 0 && (
            <Card>
              <CardTitle hint={t("What you sent to the Admin and their replies")}>{t("Your reports")}</CardTitle>
              <ul className="space-y-[0.8em]">
                {mine.data.map((r) => (
                  <li key={r.id} className={cn("rounded-[1em] border p-[1em] text-[0.85em]", focus === r.id ? "border-[#0f7378] ring-1 ring-[#0f7378]" : "border-[#e6ebf1]")}>
                    <p className="flex flex-wrap items-center justify-between gap-2">
                      <b className="text-[#1b2d54]">{t(categoryLabel(r.category))}{r.squadName ? ` · ${r.squadName}` : ""}{r.studentName ? ` · ${r.studentName}` : ""}</b>
                      <Pill tone={r.status === "Answered" ? "green" : "amber"} dot={false}>{t(r.status === "Answered" ? "Answered" : "Waiting for the Admin")}</Pill>
                    </p>
                    <p className="mt-[0.4em] whitespace-pre-wrap text-[#475467]">{r.message}</p>
                    {r.adminReply && <p className="mt-[0.6em] rounded-[0.8em] bg-[#eef6f6] px-[0.9em] py-[0.6em] text-[#1b2d54]"><b>{t("Admin reply")}:</b> {r.adminReply}</p>}
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {reporting && <GeneralReportDialog onClose={() => { setReporting(false); mine.reload(); }} />}

          {printing && (
            <PrintReport
              lang={printing}
              title={makeT(printing)(tab === "squad" ? tk("Mentor report") : tk("Student report"))}
              subtitle={tab === "squad" ? shownSquad?.squadName ?? filterName : studentReport.data?.fullName}
              from={range.from}
              to={range.to}
            >
              <PrintSection>
                <TrendsSection trends={trends.data} loading={false} error={null} squadName={squadFilter ? filterName : undefined} />
              </PrintSection>
              <PrintSection breakBefore>
                {tab === "squad" ? shownSquad && <SquadReportBody data={shownSquad} print /> : studentReport.data && <StudentReportBody data={studentReport.data} print />}
              </PrintSection>
            </PrintReport>
          )}
        </>
      )}
    </MentorPage>
  );
}

/** KPI row (this period vs the one before) and the weekly trend chart. */
function TrendsSection({ trends, loading, error, onRetry, squadName }: { trends: MentorTrends | null; loading: boolean; error: string | null; onRetry?: () => void; squadName?: string }) {
  const { t, intl } = useI18n();
  if (error) return <ReportCard><KitError text={error} onRetry={onRetry} retryLabel={t("Try again")} /></ReportCard>;
  const series = MENTOR_TREND_KEYS.map((k) => ({ key: k, label: t(KPI_META[k].label) }));
  return (
    <>
      <KpiGrid>
        {MENTOR_TREND_KEYS.map((k) => (
          <KpiCard
            key={k}
            label={t(KPI_META[k].label)}
            icon={KPI_META[k].icon}
            tint={KPI_META[k].tint}
            value={trends?.current[k] ?? null}
            previous={trends?.previous[k] ?? null}
            loading={loading && !trends}
          />
        ))}
      </KpiGrid>
      <ReportCard
        title={<span className="flex items-center gap-[0.5em]"><Activity aria-hidden className="size-[1em] text-[#0f7378]" />{t("Weekly activity")}</span>}
        hint={squadName ? t("{name} · per week", { name: squadName }) : t("Per week, for the chosen period")}
      >
        {!trends ? (
          <KitSkeleton className="h-[15em] w-full" />
        ) : (
          <TrendChart
            ariaLabel={t("Weekly activity")}
            points={weeklyPoints(trends.series, intl, t)}
            series={series}
            defaultHidden={["chatMessages"]}
            empty={t("No activity in this period yet.")}
          />
        )}
      </ReportCard>
    </>
  );
}

function sprintOptions(data: SquadReport | null, t: (s: string) => string, intl: string) {
  const sprints = data?.sprints ?? [];
  return [{ value: "all", label: t("All sprints") }, ...sprints.map((s) => ({ value: s.name, label: `${s.name} · ${sprintDates(s, intl)}` }))];
}

function filterSprint(data: SquadReport, name: string): SquadReport {
  const s = data.sprints.find((x) => x.name === name);
  return { ...data, sprints: s ? [s] : [], delayRows: data.delayRows.filter((d) => d.sprintName === name), delays: data.delayRows.filter((d) => d.sprintName === name).length };
}

const sprintDates = (s: { startDate: string; endDate: string }, intl: string) => `${formatDay(s.startDate, intl)} – ${formatDay(s.endDate, intl)}`;

function SquadReportBody({ data, print = false }: { data: SquadReport; print?: boolean }) {
  const { t, intl } = useI18n();
  type DelayRow = SquadReport["delayRows"][number];
  return (
    <div className="space-y-[1.4em]">
      {print && <h2 className="text-[1.3em] font-extrabold text-[#1b2d54]">{t("Squad report")} · {data.squadName}</h2>}
      <KpiGrid className="md:grid-cols-4 xl:grid-cols-4">
        <KpiCard icon={<TrendingUp className="size-[1.1em]" />} label={t("Overall progress")} value={`${data.progress}%`} />
        <KpiCard icon={<ClipboardCheck className="size-[1.1em]" />} tint="bg-[#e6f0ff] text-[#1d5fd1]" label={t("Tasks done")} value={`${data.tasksDone} / ${data.tasksTotal}`} />
        <KpiCard icon={<Star className="size-[1.1em]" />} tint="bg-[#fff1e3] text-[#c2570c]" label={t("Story points")} value={`${data.pointsDone} / ${data.pointsTotal}`} />
        <KpiCard icon={<Clock className="size-[1.1em]" />} tint="bg-[#fde8e8] text-[#c81e1e]" label={t("Delays")} value={data.delays} />
      </KpiGrid>
      <div className="grid gap-[1.4em] lg:grid-cols-2">
        <ReportCard title={t("Progress per sprint")}>
          <BarList
            max={100}
            suffix="%"
            valueWidth="4em"
            empty={t("No sprints yet.")}
            items={data.sprints.map((s) => ({ key: s.name, label: <span title={sprintDates(s, intl)}>{s.name} <span className="text-[#94a3b8]">· {sprintDates(s, intl)}</span></span>, value: s.percent }))}
          />
        </ReportCard>
        <ReportCard title={t("Tasks and story points per member")}>
          <BarList
            empty={t("No members yet.")}
            items={data.members.map((m) => ({
              key: m.studentId,
              leading: <MentorAvatar name={m.fullName} photoUrl={m.photoUrl} className="size-[2em] shrink-0" />,
              label: m.fullName,
              value: m.points,
              display: t("{t} tasks · {p} pts", { t: m.tasks, p: m.points }),
              color: "#2a78d6",
            }))}
          />
        </ReportCard>
      </div>
      <ReportCard title={t("Delays and reasons")}>
        <DataTable<DelayRow>
          rows={data.delayRows}
          rowKey={(_, i) => String(i)}
          empty={t("No delays. The squad is on time.")}
          initialSort={{ key: "date", desc: true }}
          columns={[
            { key: "sprint", header: t("Sprint"), render: (d) => <b>{d.sprintName ?? t("Sprint")}</b>, sortValue: (d) => d.sprintName },
            { key: "reason", header: t("Reason"), render: (d) => <Pill tone="orange" dot={false}>{t(delayLabel(d.reason))}</Pill>, sortValue: (d) => t(delayLabel(d.reason)) },
            { key: "note", header: t("Note"), render: (d) => <span className="text-[#475467]" dir="auto">{d.note || "—"}</span> },
            { key: "date", header: t("Marked late on"), render: (d) => new Date(d.createdUtc).toLocaleDateString(intl, { day: "numeric", month: "short", year: "numeric" }), sortValue: (d) => d.createdUtc, align: "end" },
          ]}
        />
      </ReportCard>
      <div className="grid gap-[1.4em] lg:grid-cols-2">
        <ReportCard title={t("Task completion")}>
          <DonutChart
            centerLabel={t("tasks")}
            empty={t("No tasks yet.")}
            segments={[
              { key: "done", label: t("Done"), value: data.tasksDone, color: "#00949a" },
              { key: "open", label: t("Not done yet"), value: Math.max(0, data.tasksTotal - data.tasksDone), color: "#cbd5e1" },
            ]}
          />
        </ReportCard>
        <ReportCard title={t("Review result")} action={<SquadStatePill state={data.review.state} />}>
          <dl className="divide-y divide-[#eef2f6] text-[0.85em]">
            <div className="flex justify-between gap-3 py-[0.8em]"><dt className="text-[#475467]">{t("First review round")}</dt>
              <dd className="font-medium text-[#1b2d54]">{data.review.firstDecision ? `${t(data.review.firstDecision === "Approved" ? "Approved" : "Changes requested")}${data.review.firstAverage != null ? ` · ${t("average {n}", { n: data.review.firstAverage })}` : ""}` : "—"}</dd></div>
            <div className="flex justify-between gap-3 py-[0.8em]"><dt className="text-[#475467]">{t("Student reviews done")}</dt><dd className="font-medium text-[#1b2d54]">{t("{a} of {b}", { a: data.review.studentReviewsDone, b: data.review.students })}</dd></div>
            <div className="flex justify-between gap-3 py-[0.8em]"><dt className="text-[#475467]">{t("Reports exported")}</dt><dd className="font-medium text-[#1b2d54]">{t("{n} PDF files", { n: data.review.exports })}</dd></div>
          </dl>
        </ReportCard>
      </div>
    </div>
  );
}

function StudentReportBody({ data, print = false }: { data: StudentReport; print?: boolean }) {
  const { t, intl } = useI18n();
  const scored = data.reviews.filter((r) => r.overall != null);
  return (
    <div className="space-y-[1.4em]">
      {print && <h2 className="text-[1.3em] font-extrabold text-[#1b2d54]">{t("Student report")} · {data.fullName}</h2>}
      <KpiGrid className="md:grid-cols-4 xl:grid-cols-4">
        <KpiCard icon={<ClipboardCheck className="size-[1.1em]" />} tint="bg-[#e6f0ff] text-[#1d5fd1]" label={t("Tasks done")} value={data.tasksDone} />
        <KpiCard icon={<Star className="size-[1.1em]" />} tint="bg-[#fff1e3] text-[#c2570c]" label={t("Story points")} value={data.points} />
        <KpiCard icon={<TrendingUp className="size-[1.1em]" />} label={t("Average review score")} value={data.averageScore != null ? `${data.averageScore} / 5` : "—"} />
        <KpiCard icon={<Clock className="size-[1.1em]" />} tint="bg-[#fde8e8] text-[#c81e1e]" label={t("Sessions done")} value={data.sessions} />
      </KpiGrid>
      <div className="grid gap-[1.4em] lg:grid-cols-2">
        <ReportCard title={t("Tasks and story points per sprint")}>
          <BarList
            empty={t("No sprints yet.")}
            items={data.sprints.map((s, i) => ({ key: String(i), label: `${s.squadName} · ${s.sprintName}`, value: s.points, display: t("{t} tasks · {p} pts", { t: s.tasks, p: s.points }) }))}
          />
        </ReportCard>
        <ReportCard title={t("Review score trend")}>
          <TrendChart
            height={200}
            ariaLabel={t("Review score trend")}
            empty={t("No reviews yet.")}
            series={[{ key: "score", label: t("Review score") }]}
            points={scored.map((r, i) => {
              const label = r.submittedUtc ? new Date(r.submittedUtc).toLocaleDateString(intl, { month: "short", day: "numeric" }) : `R${i + 1}`;
              return { key: String(i), label, values: { score: r.overall } };
            })}
          />
        </ReportCard>
      </div>
    </div>
  );
}

const CATEGORIES: ReportCategory[] = ["InactiveMember", "Behaviour", "BrokenLink", "ProjectProblem", "Other"];

function GeneralReportDialog({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const [category, setCategory] = useState<ReportCategory>("Other");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "sent">("idle");
  const [err, setErr] = useState<string | null>(null);
  return (
    <Dialog title={t("Report to Admin")} onClose={onClose}
      footer={state === "sent" ? <PrimaryButton onClick={onClose}>{t("Close")}</PrimaryButton> : (
        <><SecondaryButton onClick={onClose}>{t("Cancel")}</SecondaryButton>
          <PrimaryButton disabled={state === "busy" || !message.trim()} onClick={() => { setState("busy"); sendMentorReport({ category, message }).then(() => setState("sent"), (e) => { setErr(errorMessage(e)); setState("idle"); }); }}>{t("Send report")}</PrimaryButton></>
      )}>
      {state === "sent" ? <p className="text-[0.88em] text-[#167a3e]">{t("Your report was sent to the Admin. You will see the reply on your Overview.")}</p> : (
        <>
          <Field label={t("About")}>
            <select value={category} onChange={(e) => setCategory(e.target.value as ReportCategory)} className={inputCls}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{t(categoryLabel(c))}</option>)}
            </select>
          </Field>
          <Field label={t("What happened?")} hint={`${message.length}/2000`}>
            <textarea value={message} maxLength={2000} rows={4} onChange={(e) => setMessage(e.target.value)} className={inputCls} />
          </Field>
          {err && <p className="text-[0.85em] text-[#c81e1e]">{err}</p>}
        </>
      )}
    </Dialog>
  );
}
