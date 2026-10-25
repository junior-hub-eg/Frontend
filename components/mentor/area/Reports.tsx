"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, ClipboardCheck, Clock, Download, Star, TrendingUp } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { useI18n } from "@/lib/i18n/client";
import { makeT, type TFunction } from "@/lib/i18n/translate";
import {
  getMentorSquads, getMyMentorReports, getMyStudents, getSquadReport, getStudentReport, recordReportExport, sendMentorReport,
  type ReportCategory, type SquadReport, type StudentReport,
} from "@/lib/monitor-api";
import { cn } from "@/lib/utils";
import {
  Card, CardTitle, Dialog, EmptyState, ErrorState, Field, MentorAvatar, MentorPage, Pill, PrimaryButton, ProgressBar, SecondaryButton, SelectPill,
  Skeleton, SquadStatePill, UnderlineTabs, inputCls,
} from "../mentor-area-ui";
import { useApi } from "../use-api";
import { categoryLabel, delayLabel } from "./SquadDetail";

export default function Reports() {
  const { t } = useI18n();
  const params = useSearchParams();
  const [tab, setTab] = useState<"squad" | "student">("squad");
  const squads = useApi(getMentorSquads);
  const students = useApi(getMyStudents);
  const [pickedSquad, setSquadId] = useState("");
  const [pickedStudent, setStudentId] = useState("");
  const [reporting, setReporting] = useState(params.get("report") === "1");
  const mine = useApi(getMyMentorReports);
  const focus = params.get("report");

  const squadId = pickedSquad || (squads.data?.find((s) => s.isCurrent) ?? squads.data?.[0])?.id || "";
  const people = useMemo(() => {
    const all = [...(students.data?.squadStudents ?? []).map((s) => ({ id: s.studentId, name: s.fullName })), ...(students.data?.mentees ?? []).map((m) => ({ id: m.studentId, name: m.fullName }))];
    return [...new Map(all.map((p) => [p.id, p])).values()];
  }, [students.data]);
  const studentId = pickedStudent || people[0]?.id || "";

  return (
    <MentorPage title={t("Reports")} subtitle={t("Progress, scores and delays of your own squads and students.")}>
      {squads.error ? <ErrorState title={t("We could not load your reports")} onRetry={squads.reload} error={squads.error} /> : (
        <>
          {tab === "squad"
            ? <SquadReportView squadId={squadId} setSquadId={setSquadId} squads={squads.data ?? []} tab={tab} setTab={setTab} />
            : <StudentReportView studentId={studentId} setStudentId={setStudentId} people={people} tab={tab} setTab={setTab} />}
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
        </>
      )}
    </MentorPage>
  );
}

function Header({ tab, setTab, children, onExport }: { tab: "squad" | "student"; setTab: (v: "squad" | "student") => void; children: React.ReactNode; onExport: (lang: "ar" | "en") => void }) {
  const { t } = useI18n();
  return (
    <Card>
      <UnderlineTabs value={tab} onChange={setTab} tabs={[{ value: "squad", label: t("Squad report") }, { value: "student", label: t("Student report") }]} />
      <div className="mt-[1.2em] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-[0.6em]">{children}</div>
        <div className="flex gap-[0.6em]">
          <SecondaryButton onClick={() => onExport("ar")}><Download className="size-[1em]" /> {t("Export PDF · AR")}</SecondaryButton>
          <PrimaryButton onClick={() => onExport("en")}><Download className="size-[1em]" /> {t("Export PDF · EN")}</PrimaryButton>
        </div>
      </div>
    </Card>
  );
}

function SquadReportView({ squadId, setSquadId, squads, tab, setTab }: {
  squadId: string; setSquadId: (v: string) => void; squads: { id: string; name: string; sprintStartDate: string | null; sprintEndDate: string | null }[];
  tab: "squad" | "student"; setTab: (v: "squad" | "student") => void;
}) {
  const { t, intl } = useI18n();
  const [period, setPeriod] = useState("all");
  const report = useApi(() => (squadId ? getSquadReport(squadId) : Promise.resolve(null)), [squadId]);
  const [printing, setPrinting] = useState<"ar" | "en" | null>(null);
  const data = report.data;
  const sprints = data?.sprints ?? [];
  const periods = [{ value: "all", label: sprints.length ? `${day(sprints[0].startDate, intl)} – ${day(sprints[sprints.length - 1].endDate, intl, true)}` : t("All sprints") },
    ...sprints.map((s) => ({ value: s.name, label: `${s.name} · ${day(s.startDate, intl)} – ${day(s.endDate, intl)}` }))];
  const shown = period === "all" ? data : data && filterSprint(data, period);

  const exportPdf = (lang: "ar" | "en") => {
    if (!data) return;
    recordReportExport({ squadId, language: lang }).catch(() => undefined);
    setPrinting(lang);
    setTimeout(() => { window.print(); setPrinting(null); report.reload(); }, 300);
  };

  return (
    <>
      <Header tab={tab} setTab={setTab} onExport={exportPdf}>
        <SelectPill label={t("Squad")} value={squadId} onChange={(v) => { setSquadId(v); setPeriod("all"); }} options={squads.map((s) => ({ value: s.id, label: s.name }))} />
        <SelectPill label={t("Period")} value={period} onChange={setPeriod} options={periods} />
      </Header>
      {squads.length === 0 ? <Card><EmptyState title={t("No squads yet")} text={t("Reports show up once you monitor a squad.")} /></Card>
        : report.error ? <ErrorState title={t("We could not load this report")} onRetry={report.reload} error={report.error} />
        : !shown ? <Card><Skeleton className="h-[16em] w-full" /></Card> : <SquadReportBody data={shown} t={t} intl={intl} />}
      {printing && shown && createPortal(<PrintFrame lang={printing}><SquadReportBody data={shown} t={makeT(printing)} intl={printing === "ar" ? "ar-EG" : "en-GB"} print /></PrintFrame>, document.body)}
    </>
  );
}

function filterSprint(data: SquadReport, name: string): SquadReport {
  const s = data.sprints.find((x) => x.name === name);
  return { ...data, sprints: s ? [s] : [], delayRows: data.delayRows.filter((d) => d.sprintName === name), delays: data.delayRows.filter((d) => d.sprintName === name).length };
}

const day = (iso: string, intl: string, year = false) => new Date(iso).toLocaleDateString(intl, { month: "short", day: "numeric", ...(year ? { year: "numeric" } : {}) });

function SquadReportBody({ data, t, intl, print = false }: { data: SquadReport; t: TFunction; intl: string; print?: boolean }) {
  const maxPoints = Math.max(1, ...data.members.map((m) => m.points));
  return (
    <>
      {print && <h1 className="text-[1.6em] font-extrabold text-[#1b2d54]">{t("Squad report")} · {data.squadName}</h1>}
      <div className="grid grid-cols-2 gap-[1em] lg:grid-cols-4">
        <Stat icon={<TrendingUp className="size-[1.1em] text-[#0f7378]" />} tint="bg-[#e0f4f2]" value={`${data.progress}%`} label={t("Overall progress")} />
        <Stat icon={<ClipboardCheck className="size-[1.1em] text-[#1d5fd1]" />} tint="bg-[#e6f0ff]" value={`${data.tasksDone} / ${data.tasksTotal}`} label={t("Tasks done")} />
        <Stat icon={<Star className="size-[1.1em] text-[#c2570c]" />} tint="bg-[#fff1e3]" value={`${data.pointsDone} / ${data.pointsTotal}`} label={t("Story points")} />
        <Stat icon={<Clock className="size-[1.1em] text-[#c81e1e]" />} tint="bg-[#fde8e8]" value={String(data.delays)} label={t("Delays")} />
      </div>
      <div className="grid gap-[1.4em] lg:grid-cols-[1fr_30em]">
        <Card>
          <CardTitle>{t("Progress per sprint")}</CardTitle>
          <div className="flex h-[14em] items-end justify-around gap-[1em]">
            {data.sprints.map((s) => (
              <div key={s.name} className="flex h-full flex-1 flex-col items-center justify-end">
                <span className="mb-[0.3em] text-[0.8em] font-semibold text-[#1b2d54]">{s.percent}%</span>
                <span className="w-[3.8em] rounded-[0.6em] bg-gradient-to-b from-[#2bb3ad] to-[#0f7378]" style={{ height: `${Math.max(3, s.percent)}%` }} />
                <span className="mt-[0.5em] text-[0.75em] text-[#64748b]">{s.name}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardTitle>{t("Tasks and story points per member")}</CardTitle>
          <ul className="space-y-[0.8em]">
            {data.members.map((m) => (
              <li key={m.studentId} className="flex items-center gap-[0.7em] text-[0.82em]">
                <MentorAvatar name={m.fullName} photoUrl={m.photoUrl} className="size-[2em]" />
                <span className="w-[8.5em] truncate text-[#1b2d54]">{m.fullName}</span>
                <ProgressBar value={(m.points / maxPoints) * 100} className="flex-1" />
                <span className="w-[7em] text-[0.9em] text-[#64748b]">{t("{t} tasks · {p} pts", { t: m.tasks, p: m.points })}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <div className="grid gap-[1.4em] lg:grid-cols-2">
        <Card>
          <CardTitle>{t("Delays and reasons")}</CardTitle>
          {data.delayRows.length === 0 ? <p className="text-[0.85em] text-[#475467]">{t("No delays. The squad is on time.")}</p> : (
            <ul className="divide-y divide-[#eef2f6]">
              {data.delayRows.map((d, i) => (
                <li key={i} className="flex items-center gap-[0.8em] py-[0.8em]">
                  <span className="grid size-[2.4em] place-items-center rounded-[0.7em] bg-[#fdf0e6]"><AlertTriangle className="size-[1.1em] text-[#c2570c]" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.88em] font-semibold text-[#1b2d54]">{d.sprintName ?? t("Sprint")}{d.note ? ` · ${d.note}` : ""}</span>
                    <span className="text-[0.75em] text-[#64748b]">{t("Marked late on {date}", { date: day(d.createdUtc, intl) })}</span>
                  </span>
                  <Pill tone="orange" dot={false}>{t(delayLabel(d.reason))}</Pill>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <CardTitle>{t("Review result")}</CardTitle>
          <SquadStatePill state={data.review.state} />
          <dl className="mt-[1em] divide-y divide-[#eef2f6] text-[0.85em]">
            <div className="flex justify-between py-[0.8em]"><dt className="text-[#475467]">{t("First review round")}</dt>
              <dd className="font-medium text-[#1b2d54]">{data.review.firstDecision ? `${t(data.review.firstDecision === "Approved" ? "Approved" : "Changes requested")}${data.review.firstAverage != null ? ` · ${t("average {n}", { n: data.review.firstAverage })}` : ""}` : "—"}</dd></div>
            <div className="flex justify-between py-[0.8em]"><dt className="text-[#475467]">{t("Student reviews done")}</dt><dd className="font-medium text-[#1b2d54]">{t("{a} of {b}", { a: data.review.studentReviewsDone, b: data.review.students })}</dd></div>
            <div className="flex justify-between py-[0.8em]"><dt className="text-[#475467]">{t("Reports exported")}</dt><dd className="font-medium text-[#1b2d54]">{t("{n} PDF files", { n: data.review.exports })}</dd></div>
          </dl>
        </Card>
      </div>
    </>
  );
}

function StudentReportView({ studentId, setStudentId, people, tab, setTab }: {
  studentId: string; setStudentId: (v: string) => void; people: { id: string; name: string }[]; tab: "squad" | "student"; setTab: (v: "squad" | "student") => void;
}) {
  const { t, intl } = useI18n();
  const report = useApi(() => (studentId ? getStudentReport(studentId) : Promise.resolve(null)), [studentId]);
  const [printing, setPrinting] = useState<"ar" | "en" | null>(null);
  const exportPdf = (lang: "ar" | "en") => {
    if (!report.data) return;
    recordReportExport({ studentId, language: lang }).catch(() => undefined);
    setPrinting(lang);
    setTimeout(() => { window.print(); setPrinting(null); }, 300);
  };
  return (
    <>
      <Header tab={tab} setTab={setTab} onExport={exportPdf}>
        <SelectPill label={t("Student")} value={studentId} onChange={setStudentId} options={people.map((p) => ({ value: p.id, label: p.name }))} />
      </Header>
      {people.length === 0 ? <Card><EmptyState title={t("No students yet")} text={t("Reports show up once you monitor a squad.")} /></Card>
        : report.error ? <ErrorState title={t("We could not load this report")} onRetry={report.reload} error={report.error} />
        : !report.data ? <Card><Skeleton className="h-[16em] w-full" /></Card> : <StudentReportBody data={report.data} t={t} intl={intl} />}
      {printing && report.data && createPortal(<PrintFrame lang={printing}><StudentReportBody data={report.data} t={makeT(printing)} intl={printing === "ar" ? "ar-EG" : "en-GB"} print /></PrintFrame>, document.body)}
    </>
  );
}

function StudentReportBody({ data, t, intl, print = false }: { data: StudentReport; t: TFunction; intl: string; print?: boolean }) {
  const maxPoints = Math.max(1, ...data.sprints.map((s) => s.points));
  const scored = data.reviews.filter((r) => r.overall != null);
  return (
    <>
      {print && <h1 className="text-[1.6em] font-extrabold text-[#1b2d54]">{t("Student report")} · {data.fullName}</h1>}
      <div className="grid grid-cols-2 gap-[1em] lg:grid-cols-4">
        <Stat icon={<ClipboardCheck className="size-[1.1em] text-[#1d5fd1]" />} tint="bg-[#e6f0ff]" value={String(data.tasksDone)} label={t("Tasks done")} />
        <Stat icon={<Star className="size-[1.1em] text-[#c2570c]" />} tint="bg-[#fff1e3]" value={String(data.points)} label={t("Story points")} />
        <Stat icon={<TrendingUp className="size-[1.1em] text-[#0f7378]" />} tint="bg-[#e0f4f2]" value={data.averageScore != null ? `${data.averageScore} / 5` : "—"} label={t("Average review score")} />
        <Stat icon={<Clock className="size-[1.1em] text-[#c81e1e]" />} tint="bg-[#fde8e8]" value={String(data.sessions)} label={t("Sessions done")} />
      </div>
      <div className="grid gap-[1.4em] lg:grid-cols-2">
        <Card>
          <CardTitle>{t("Tasks and story points per sprint")}</CardTitle>
          <ul className="space-y-[0.8em]">
            {data.sprints.map((s, i) => (
              <li key={i} className="flex items-center gap-[0.7em] text-[0.82em]">
                <span className="w-[11em] truncate text-[#1b2d54]">{s.squadName} · {s.sprintName}</span>
                <ProgressBar value={(s.points / maxPoints) * 100} className="flex-1" />
                <span className="w-[7em] text-[0.9em] text-[#64748b]">{t("{t} tasks · {p} pts", { t: s.tasks, p: s.points })}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardTitle>{t("Review score trend")}</CardTitle>
          {scored.length === 0 ? <p className="text-[0.85em] text-[#475467]">{t("No reviews yet.")}</p> : (
            <div className="flex h-[12em] items-end justify-around gap-[0.8em]">
              {scored.map((r, i) => (
                <div key={i} className="flex h-full flex-1 flex-col items-center justify-end">
                  <span className="mb-[0.3em] text-[0.75em] font-semibold text-[#1b2d54]">{r.overall}</span>
                  <span className="w-[2.4em] rounded-[0.5em] bg-gradient-to-b from-[#2bb3ad] to-[#0f6b70]" style={{ height: `${((r.overall ?? 0) / 5) * 100}%` }} />
                  <span className="mt-[0.4em] text-[0.7em] text-[#64748b]">{r.submittedUtc ? new Date(r.submittedUtc).toLocaleDateString(intl, { month: "short", day: "numeric" }) : `R${i + 1}`}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

function Stat({ icon, tint, value, label }: { icon: React.ReactNode; tint: string; value: string; label: string }) {
  return (
    <Card>
      <span className={cn("grid size-[2.4em] place-items-center rounded-[0.7em]", tint)}>{icon}</span>
      <p className="mt-[0.7em] text-[1.9em] font-extrabold text-[#1b2d54]">{value}</p>
      <p className="text-[0.8em] text-[#475467]">{label}</p>
    </Card>
  );
}

/** Only this is printed ("Export PDF"): the report in the chosen language and direction. */
function PrintFrame({ lang, children }: { lang: "ar" | "en"; children: React.ReactNode }) {
  return (
    <>
      <style>{`@media screen { #mentor-print { display: none } } @media print { body > *:not(#mentor-print) { display: none !important } #mentor-print { display: block } @page { margin: 14mm } }`}</style>
      <div id="mentor-print" dir={lang === "ar" ? "rtl" : "ltr"} lang={lang} className="space-y-[1.2em] bg-white p-[1em] font-[family-name:var(--font-poppins)] text-[12px]" style={lang === "ar" ? { fontFamily: "var(--font-cairo), Tahoma, sans-serif" } : undefined}>
        {children}
      </div>
    </>
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
