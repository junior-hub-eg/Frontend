"use client";
import { useState, type ReactNode } from "react";
import Image from "next/image";
import {
  AlarmClock,
  ArrowRight,
  ArrowUpRight,
  Bold,
  Bookmark,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  ClipboardCheck,
  Clock,
  Code,
  FileText,
  Gauge,
  Italic,
  Lightbulb,
  List,
  ListChecks,
  Medal,
  Monitor,
  PlusCircle,
  RefreshCw,
  Send,
  SlidersHorizontal,
  Tag,
  TrendingUp,
  TriangleAlert,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/client";

function useTr() {
  const { t } = useI18n();
  return (s: string) => (/[A-Za-z]/.test(s) ? t(s) : s);
}

/** Keeps numbers / English snippets in the right order inside Arabic text. */
function Ltr({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span dir="ltr" className={cn("inline-block", className)}>
      {children}
    </span>
  );
}

const BREADCRUMB = ["CurriculumConsole", "Design Sprints & Usability Testing", "UI/UX Evaluation Pipeline"];

type StatTone = "red" | "teal";
type NoteIcon = "alert" | "trend" | "check" | "dot";

const STATS: {
  label: string;
  value: string;
  suffix?: string;
  text: string;
  note: string;
  tone: StatTone;
  noteIcon: NoteIcon;
  iconBox: string;
  icon: ReactNode;
}[] = [
  { label: "Submissions in Review", value: "4", text: "Submissions pending review", note: "2 require urgent mentor feedback", tone: "red", noteIcon: "alert", iconBox: "bg-[#eef0f2] text-[#14243f]", icon: <ClipboardCheck aria-hidden className="size-4" /> },
  { label: "On-time Velocity", value: "88.5%", text: "Cohort completion rate", note: "+3.5% vs Sprint 03 benchmark", tone: "teal", noteIcon: "trend", iconBox: "bg-[#eef0f2] text-[#14243f]", icon: <Gauge aria-hidden className="size-4" /> },
  { label: "Cohort Average Score", value: "87.2", suffix: "/ 100", text: "Aggregated rubric grading", note: "Meets Portfolio Standard", tone: "teal", noteIcon: "check", iconBox: "bg-[#eef0f2] text-[#14243f]", icon: <Medal aria-hidden className="size-4" /> },
  { label: "Urgent Deadlines", value: "Sprint 04: Mobile", text: "KYC & Auth flows due today", note: "4 late submissions in Cohort 9A", tone: "red", noteIcon: "dot", iconBox: "bg-[#fde8e8] text-[#c81e1e]", icon: <AlarmClock aria-hidden className="size-4" /> },
];


type BadgeTone = "teal" | "red";

type RubricScore = { score: number; badge: string; tone: BadgeTone };

const CRITERIA = [
  { title: "Auto Layout Architecture & Constraints", max: 25, text: "Accurate nested container hierarchy; minor horizontal clipping on tablet pill badges when resizing viewport width below 360px." },
  { title: "Semantic Token & Variable Consistency", max: 20, text: "Flawless semantic color tokens mapped directly to Junior Hub UI Kit. Proper naming syntax applied across primary and surface variants." },
  { title: "WCAG AA Color Contrast & Accessibility", max: 20, text: "Placeholder text inside disabled input field evaluates to 3.2:1 (requires 4.5:1 minimum threshold for accessible standard readability)." },
  { title: "Interactive State Wiring & Micro-interactions", max: 20, text: "Smooth Smart Animate easing curves and consistent 150ms transitions. Needs visible focus ring indicator on keyboard hover." },
];

const CANDIDATES: {
  id: string;
  number: number;
  name: string;
  initials: string;
  avatar: string;
  photo?: string;
  cohort: string;
  submitted: [string, string];
  file: string;
  size: string;
  total: number;
  rubric: RubricScore[];
  feedback: string;
}[] = [
  {
    id: "youssef",
    number: 47,
    name: "Youssef Ahmed",
    initials: "YA",
    avatar: "bg-[#f5a524]",
    photo: "/images/teacher/students/youssef.png",
    cohort: "Cohort 9B",
    submitted: ["Submitted yesterday at 8:42 AM", "(Attempt 1) • On Time"],
    file: "figma-design-audit_yc...",
    size: "2.4 MB • Verified checksum",
    total: 75,
    rubric: [
      { score: 22, badge: "Excellent", tone: "teal" },
      { score: 20, badge: "Full Score", tone: "teal" },
      { score: 15, badge: "Accessibility Note", tone: "red" },
      { score: 18, badge: "Very Good", tone: "teal" },
    ],
    feedback:
      "Great architectural work, Youssef! The Auto Layout structure is resilient across responsive viewports. Please adjust the input placeholder contrast token (#A0AEC0 → #4A5568) to meet WCAG AA standards. Keep up the great work!",
  },
  {
    id: "sara",
    number: 48,
    name: "Sara Hassan",
    initials: "SH",
    avatar: "bg-[#12939b]",
    photo: "/images/teacher/students/sara.png",
    cohort: "Cohort 9A",
    submitted: ["Submitted today at 9:10 AM", "(Attempt 1) • On Time"],
    file: "mobile-onboarding_sh...",
    size: "3.1 MB • Verified checksum",
    total: 95,
    rubric: [
      { score: 24, badge: "Excellent", tone: "teal" },
      { score: 20, badge: "Full Score", tone: "teal" },
      { score: 19, badge: "Excellent", tone: "teal" },
      { score: 19, badge: "Excellent", tone: "teal" },
    ],
    feedback: "Excellent systems thinking, Sara! Your token naming is consistent and the focus states are clear. Keep it up.",
  },
  {
    id: "omar",
    number: 49,
    name: "Omar Ali",
    initials: "OA",
    avatar: "bg-[#7c5cff]",
    photo: "/images/teacher/students/omar.png",
    cohort: "Cohort 9A",
    submitted: ["Submitted today at 7:55 AM", "(Attempt 2) • On Time"],
    file: "kyc-flow-audit_oa...",
    size: "2.8 MB • Verified checksum",
    total: 98,
    rubric: [
      { score: 25, badge: "Full Score", tone: "teal" },
      { score: 20, badge: "Full Score", tone: "teal" },
      { score: 19, badge: "Excellent", tone: "teal" },
      { score: 20, badge: "Full Score", tone: "teal" },
    ],
    feedback: "Outstanding work, Omar! Every state is wired and the contrast ratios pass. A great example for the cohort.",
  },
];

const BRIEF =
  "Construct an accessible interactive modal using Auto Layout and adaptive constraints. Ensure color contrast tokens comply with WCAG AA light & dark mode specifications. Implement standard Junior Hub token syntax across all component instances.";

type PipelineTab = "active" | "pending" | "past" | "drafts";

const PIPELINE_TABS: { key: PipelineTab; label: string; count?: number }[] = [
  { key: "active", label: "Active", count: 4 },
  { key: "pending", label: "Pending", count: 2 },
  { key: "past", label: "Past", count: 14 },
  { key: "drafts", label: "Drafts" },
];

const PIPELINE: {
  id: string;
  tab: PipelineTab;
  cohort: string;
  badge: string;
  badgeTone: "red" | "green" | "navy";
  title: string;
  percent: number;
  percentLabel: string;
  count: string;
  barTone: string;
  highlight?: boolean;
  notice?: string;
  waiting?: string;
  team?: { initials: string; tone: string }[];
  more?: number;
  action: string;
  actionIcon: "arrow" | "monitor" | "sliders";
}[] = [
  {
    id: "p1",
    tab: "active",
    cohort: "COHORT 9A • SPRINT 04",
    badge: "Priority",
    badgeTone: "red",
    title: "Mobile Banking Onboarding Flow & KYC Verification",
    percent: 85,
    percentLabel: "Submitted",
    count: "24 of 28 students",
    barTone: "bg-[#0b6b70]",
    highlight: true,
    notice: "Notice: 4 students have not shared Figma prototype links yet. Due tomorrow at 11:59 PM.",
    action: "Inspect Submissions",
    actionIcon: "arrow",
  },
  {
    id: "p2",
    tab: "active",
    cohort: "COHORTS 9A & 9B • LIVE SESSION",
    badge: "In Progress",
    badgeTone: "green",
    title: "Design System Component Library & Documentation...",
    percent: 92,
    percentLabel: "Graded",
    count: "46 of 50 graded",
    barTone: "bg-[#0b6b70]",
    waiting: "4 awaiting review",
    team: [
      { initials: "MK", tone: "bg-[#14243f] text-white" },
      { initials: "NI", tone: "bg-[#0b6b70] text-white" },
      { initials: "TF", tone: "bg-[#d9dee2] text-[#14243f]" },
    ],
    more: 4,
    action: "Open Critique Workspace",
    actionIcon: "monitor",
  },
  {
    id: "p3",
    tab: "active",
    cohort: "COHORT 9B • SPRINT 03",
    badge: "Usability Sync",
    badgeTone: "navy",
    title: "E-commerce Checkout Usability Test & Insights...",
    percent: 54,
    percentLabel: "Processed",
    count: "14 of 26 drafts synced",
    barTone: "bg-[#14243f]",
    action: "Continue Audit",
    actionIcon: "sliders",
  },
];

const VELOCITY_LABELS = ["08:00", "10:00", "12:00", "14:00", "16:00 (Peak 1)", "18:00", "20:00 (Peak 2)", "22:00", "00:00"];
const VELOCITY_9A = [8, 25, 35, 70, 80, 55, 62, 48, 12];
const VELOCITY_9B = [12, 20, 38, 34, 58, 50, 85, 44, 10];


function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <section className={cn("rounded-2xl border border-[#e3ece9] bg-white p-4 shadow-sm", className)}>{children}</section>
  );
}

function SmallButton({ tone, children, onClick }: { tone: "white" | "teal" | "gray"; children: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12939b]/40",
        tone === "white" && "bg-white text-[#14243f] shadow-sm ring-1 ring-[#e3ece9] hover:bg-[#f6f9f8]",
        tone === "teal" && "bg-[#0b6b70] text-white hover:bg-[#095a5e]",
        tone === "gray" && "bg-[#eef0f2] text-[#14243f] hover:bg-[#e1e5e8]"
      )}
    >
      {children}
    </button>
  );
}

function smoothPath(pts: [number, number][]) {
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
  }
  return d;
}

function VelocityChart() {
  const tr = useTr();
  const n = VELOCITY_LABELS.length;
  const W = 900;
  const H = 150;
  const x = (i: number) => ((i + 0.5) * W) / n; // each point sits above its own label
  const y = (v: number) => H - (v / 100) * H;
  const toPts = (data: number[]) => data.map((v, i) => [x(i), y(v)] as [number, number]);

  const pts9A = toPts(VELOCITY_9A);
  const pts9B = toPts(VELOCITY_9B);
  const line9A = smoothPath(pts9A);
  const line9B = smoothPath(pts9B);
  const area = (line: string, pts: [number, number][]) =>
    `${line} L${pts[pts.length - 1][0]},${H} L${pts[0][0]},${H} Z`;

  const dot = (i: number, v: number, color: string) => (
    <span
      key={`${color}-${i}`}
      aria-hidden
      className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white"
      style={{ left: `${((i + 0.5) / n) * 100}%`, top: `${(y(v) / H) * 100}%`, backgroundColor: color }}
    />
  );

  return (
    <div dir="ltr">
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-36 w-full overflow-visible"
          role="img"
          aria-label={tr("24-Hour Submission Velocity & Turnaround")}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="velocity-fill-a" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0b6b70" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0b6b70" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="velocity-fill-b" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#14243f" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#14243f" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3].map((i) => (
            <line
              key={i}
              x1="0"
              x2={W}
              y1={(i * H) / 3}
              y2={(i * H) / 3}
              stroke="#e3ece9"
              strokeDasharray="3 4"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <path d={area(line9B, pts9B)} fill="url(#velocity-fill-b)" />
          <path d={area(line9A, pts9A)} fill="url(#velocity-fill-a)" />
          <path d={line9B} fill="none" stroke="#14243f" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
          <path d={line9A} fill="none" stroke="#0b6b70" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
        </svg>
        {dot(4, VELOCITY_9A[4], "#0b6b70")}
        {dot(6, VELOCITY_9B[6], "#14243f")}
      </div>

      <div className="mt-2 grid grid-cols-9 text-center text-[9px] text-[#1B2D54]/60">
        {VELOCITY_LABELS.map((l) => (
          <span key={l} className={cn(l.includes("Peak") && "font-bold text-[#14243f]")}>
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}


export default function AssignmentsPage() {
  const { t } = useI18n();
  const tr = useTr();
  const [candidateId, setCandidateId] = useState("youssef");
  const [briefOpen, setBriefOpen] = useState(true);
  const [pipelineTab, setPipelineTab] = useState<PipelineTab>("active");
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const candidate = CANDIDATES.find((c) => c.id === candidateId) ?? CANDIDATES[0];
  const feedback = drafts[candidate.id] ?? candidate.feedback;
  const pipeline = PIPELINE.filter((p) => p.tab === pipelineTab);

  function nextCandidate() {
    const i = CANDIDATES.findIndex((c) => c.id === candidateId);
    setCandidateId(CANDIDATES[(i + 1) % CANDIDATES.length].id);
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 pb-6 pt-4 font-[family-name:var(--font-poppins)] text-[#1B2D54]">
      {/* Sky background: only the top part, fading into white */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[453px] [mask-image:linear-gradient(to_bottom,black_60%,transparent)]"
      >
        <Image
          src="/images/learner/projects/background.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-top"
        />
      </div>

      {/* ---------------- Hero ---------------- */}
      <header className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 flex-1">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-[#14243f]">
            {BREADCRUMB.map((b, i) => (
              <span key={b} className="flex items-center gap-1.5">
                {tr(b)}
                {i < BREADCRUMB.length - 1 && <ChevronRight aria-hidden className="size-3 rtl:rotate-180" />}
              </span>
            ))}
          </nav>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-2 rounded-full bg-[#bff3f3]/80 px-3 py-1.5 text-[11px] font-semibold text-[#0b6b70] shadow-sm">
              <span aria-hidden className="size-2 rounded-full bg-[#0b6b70]" />
              {tr("Sprint 04 Live Pipeline")}
            </span>
            <span className="flex items-center gap-2 rounded-full bg-[#E6E8EA] px-3 py-1.5 text-[11px] font-semibold text-[#14243f] shadow-sm">
              <Users aria-hidden className="size-3.5" />
              {tr("Live Review Queue (Cohorts 9A & 9B)")}
            </span>
          </div>

          <h1 className="mt-3 text-[28px] font-bold leading-tight text-[#0f1f3d]">{tr("Design Critique & Sprint Grading")}</h1>
          <p className="mt-1.5 max-w-[34rem] text-[13px] leading-snug text-[#1B2D54]/75">
            {tr("Conduct synchronous rubric scoring, verify tokenized component architectures, and synthesize actionable feedback for emerging UI/UX designers.")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SmallButton tone="white">
            <SlidersHorizontal aria-hidden className="size-3.5" />
            {tr("Bulk Grading Settings")}
          </SmallButton>
          <SmallButton tone="teal">
            <PlusCircle aria-hidden className="size-3.5" />
            {tr("+ Create Design Brief")}
          </SmallButton>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {STATS.map((s) => (
          <Card
            key={s.label}
            className="flex min-h-[12.5rem] flex-col gap-3 rounded-2xl border-0 p-6 shadow-[0_6px_24px_rgba(20,54,90,0.08)]"
          >
            <div dir="ltr" className="flex items-center justify-start gap-3">
              <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl [&_svg]:size-5", s.iconBox)}>{s.icon}</span>
              <p dir="auto" className="max-w-[9rem] text-start text-[11px] font-semibold uppercase leading-tight tracking-wide text-[#1B2D54]/60 rtl:normal-case rtl:tracking-normal">
                {tr(s.label)}
              </p>
            </div>
            <p className="mt-1 flex items-baseline gap-2">
              {s.label === "Urgent Deadlines" ? (
                <span
                  dir="auto"
                  className={cn(
                    "block w-full text-start font-bold leading-none text-[#14243f]",
                    s.value.length > 6 ? "text-[1.65rem]" : "text-5xl"
                  )}
                >
                  {tr(s.value)}
                </span>
              ) : (
                <Ltr
                  className={cn(
                    "font-bold leading-none text-[#14243f]",
                    s.value.length > 6 ? "text-2xl" : "text-4xl"
                  )}
                >
                  {s.value}
                </Ltr>
              )}
              {s.suffix && <Ltr className="text-sm text-[#1B2D54]/60">{s.suffix}</Ltr>}
            </p>
            <p
              dir={s.label === "Urgent Deadlines" ? "auto" : undefined}
              className={cn(
                "text-[14px] text-[#1B2D54]/75",
                s.label === "Urgent Deadlines" && "block w-full text-start"
              )}
            >
              {tr(s.text)}
            </p>
            <p
              className={cn(
                "mt-auto flex items-center gap-1.5 text-[11px] font-semibold",
                s.tone === "red" ? "text-[#c81e1e]" : "text-[#0b6b70]"
              )}
            >
              {s.noteIcon === "alert" && <CircleAlert aria-hidden className="size-4 shrink-0" />}
              {s.noteIcon === "trend" && <TrendingUp aria-hidden className="size-4 shrink-0" />}
              {s.noteIcon === "check" && <CircleCheck aria-hidden className="size-4 shrink-0" />}
              {s.noteIcon === "dot" && <span aria-hidden className="mx-1 size-1.5 shrink-0 rounded-full bg-[#c81e1e]" />}
              {tr(s.note)}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid min-w-0 items-start gap-6 xl:grid-cols-12">
        <div className="flex min-w-0 flex-col gap-4 xl:col-span-8">
          {/* Candidate bar */}
          <Card className="flex flex-wrap items-center justify-between gap-3 border-0 bg-[#f1f4f7] px-5 py-3 shadow-none">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-full bg-[#bff3f3] text-xs font-bold text-[#0b6b70]">
                <Ltr>{candidate.number}</Ltr>
              </span>
              <div className="leading-tight">
                <p className="text-[13px] font-semibold">{t("Candidate {n} of {total}", { n: candidate.number, total: 50 })}</p>
                <p className="mt-0.5 text-[10px] text-[#1B2D54]/60">{t("{pct}% of Cohort Evaluated", { pct: 94 })}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {CANDIDATES.map((c) => {
                const selected = c.id === candidateId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCandidateId(c.id)}
                    aria-pressed={selected}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[10px] font-semibold transition-colors",
                      selected ? "bg-[#14243f] text-white" : "bg-white text-[#14243f] ring-1 ring-[#e3ece9] hover:bg-[#f6f9f8]"
                    )}
                  >
                    {selected ? (
                      <span aria-hidden className="size-1.5 rounded-full bg-[#4da3ff]" />
                    ) : (
                      <CircleCheck aria-hidden className="size-3.5 text-[#0b6b70]" />
                    )}
                    {tr(c.name)}
                    {selected ? <span className="font-normal">({tr("Grading")})</span> : <Ltr className="text-[#1B2D54]/60">{c.total}</Ltr>}
                  </button>
                );
              })}
              <button
                type="button"
                aria-label={tr("Next candidate")}
                onClick={nextCandidate}
                className="grid size-7 place-items-center rounded-full bg-white ring-1 ring-[#e3ece9] hover:bg-[#f6f9f8]"
              >
                <ChevronRight aria-hidden className="size-3.5 rtl:rotate-180" />
              </button>
            </div>
          </Card>

          <Card className="flex flex-col gap-5 p-6">
            <div dir="ltr" className="flex flex-wrap items-center justify-between gap-3">
              {/* Student info */}
              <div className="flex min-w-0 items-center gap-3">
                {candidate.photo ? (
                  <Image
                    src={candidate.photo}
                    alt={tr(candidate.name)}
                    width={48}
                    height={48}
                    className="size-12 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span
                    className={cn(
                      "grid size-12 shrink-0 place-items-center rounded-full text-xs font-bold text-white",
                      candidate.avatar
                    )}
                  >
                    {candidate.initials}
                  </span>
                )}

                <div className="min-w-0 leading-tight">
                  <h2 dir="auto" className="text-left text-lg font-bold">
                    {tr(candidate.name)}
                  </h2>

                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex items-start gap-1.5">
                      <Clock aria-hidden className="mt-0.5 size-3 shrink-0 text-[#0b6b70]" />
                      <div className="text-[11px] leading-snug text-[#1B2D54]/70">
                        <p dir="auto" className="text-left">
                          {tr(candidate.submitted[0])}
                        </p>
                        <p dir="auto" className="text-left">
                          {tr(candidate.submitted[1])}
                        </p>
                      </div>
                    </div>

                    <span
                      dir="auto"
                      className="shrink-0 whitespace-nowrap rounded-md bg-[#bff3f3] px-2 py-0.5 text-[9px] font-semibold text-[#0b6b70]"
                    >
                      {tr(candidate.cohort)}
                    </span>
                  </div>
                </div>
              </div>

              {/* File card */}
              <div className="flex min-w-0 items-center gap-2 rounded-xl bg-[#f1f4f4] px-4 py-3">
                <FileText aria-hidden className="size-5 shrink-0 text-[#1B2D54]/70" />

                <div className="min-w-0 leading-tight">
                  <p dir="ltr" className="truncate text-left text-[10px] font-semibold">
                    {candidate.file}
                  </p>
                  <p dir="auto" className="mt-0.5 text-left text-[9px] text-[#1B2D54]/60">
                    {tr(candidate.size)}
                  </p>
                </div>

                <button
                  type="button"
                  className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md bg-white px-3 py-1.5 text-[11px] font-semibold shadow-sm ring-1 ring-[#e3ece9] hover:bg-[#f6f9f8]"
                >
                  <span dir="auto">{tr("Open in Figma")}</span>
                  <ArrowUpRight aria-hidden className="size-3.5" />
                </button>
              </div>
            </div>

            <div className="rounded-xl bg-[#f1f4f4] p-4">
              <button
                type="button"
                onClick={() => setBriefOpen((o) => !o)}
                aria-expanded={briefOpen}
                className="flex w-full items-center justify-between gap-2 text-start"
              >
                <span className="flex items-center gap-2 text-[11px] font-bold text-[#14243f]">
                  <ListChecks aria-hidden className="size-4 text-[#0b6b70]" />
                  {tr("Design Brief Requirements")}
                </span>
                <ChevronDown aria-hidden className={cn("size-4 transition-transform", briefOpen && "rotate-180")} />
              </button>
              {briefOpen && <p className="mt-2 ps-6 text-[12px] leading-relaxed text-[#1B2D54]/75">{tr(BRIEF)}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 text-sm font-bold">
                  <ListChecks aria-hidden className="size-5 text-[#0b6b70]" />
                  {tr("Curriculum Evaluation Rubric")}
                </h3>
                <span className="text-[10px] text-[#1B2D54]/60">{t("{n} CRITERIA • {pts} PTS TOTAL", { n: 4, pts: 100 })}</span>
              </div>

              <ul className="mt-4 flex flex-col gap-4">
                {CRITERIA.map((c, i) => {
                  const r = candidate.rubric[i];
                  return (
                    <li key={c.title} className="flex items-start gap-3 border-b border-[#e3ece9] pb-4 last:border-0 last:pb-0">
                      <span
                        className={cn(
                          "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-bold",
                          r.tone === "red" ? "bg-[#fde8e8] text-[#c81e1e]" : "bg-[#bff3f3] text-[#0b6b70]"
                        )}
                      >
                        <Ltr>{i + 1}</Ltr>
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-xs font-bold">{tr(c.title)}</p>
                          <span
                            className={cn(
                              "rounded px-2 py-0.5 text-[9px] font-semibold",
                              r.tone === "red" ? "bg-[#fde8e8] text-[#c81e1e]" : "bg-[#d4f5f5] text-[#0b6b70]"
                            )}
                          >
                            {tr(r.badge)}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] leading-snug text-[#1B2D54]/70">{tr(c.text)}</p>
                      </div>
                      <p className="shrink-0 text-end">
                        <Ltr className="text-base font-bold">{r.score}</Ltr> <Ltr className="text-[10px] text-[#1B2D54]/60">/ {c.max} pts</Ltr>
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#0b6b70] px-5 py-4 text-white">
              <div className="flex items-center gap-3">
                <div className="grid size-14 place-items-center rounded-lg bg-white text-center leading-none text-[#0b6b70]">
                  <Ltr className="text-xl font-bold">{candidate.total}</Ltr>
                  <Ltr className="text-[8px]">/ 100</Ltr>
                </div>
                <div className="leading-tight">
                  <p className="flex items-center gap-2 text-sm font-bold">
                    {tr("Calculated Score")}
                    <span className="rounded bg-white/20 px-1.5 py-0.5 text-[9px] font-semibold">{tr("Proficient")}</span>
                  </p>
                  <p className="mt-1 text-[11px] text-white/80">{tr("Eligible for portfolio showroom after contrast adjustments.")}</p>
                </div>
              </div>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-lg bg-white/15 px-3.5 py-2 text-[11px] font-semibold ring-1 ring-white/40 hover:bg-white/25"
              >
                <RefreshCw aria-hidden className="size-3.5" />
                {tr("Recalculate Rubric")}
              </button>
            </div>
            <div>
              <div className="flex items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 text-sm font-bold">
                  <Lightbulb aria-hidden className="size-5 text-[#0b6b70]" />
                  {tr("Pedagogical Feedback & Mentor Notes")}
                </h3>
                <span className="text-[10px] text-[#1B2D54]/60">{tr("Auto-saved 2 mins ago")}</span>
              </div>

              <div className="mt-3 overflow-hidden rounded-xl border border-[#e3ece9]">
                <div className="flex flex-wrap items-center gap-1 bg-[#f1f4f4] px-3 py-2">
                  {[Bold, Italic, Code, List].map((Icon, i) => (
                    <button key={i} type="button" aria-hidden tabIndex={-1} className="grid size-7 place-items-center rounded hover:bg-white">
                      <Icon className="size-3.5" />
                    </button>
                  ))}
                  <span aria-hidden className="mx-1 h-4 w-px bg-[#1B2D54]/15" />
                  <button
                    type="button"
                    className="flex items-center gap-1 rounded bg-[#e6ebec] px-2.5 py-1.5 text-[10px] font-semibold text-[#0b6b70]"
                  >
                    <Tag aria-hidden className="size-3" />
                    {tr("+ Insert Token Ref")}
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-1 rounded bg-[#e6ebec] px-2.5 py-1.5 text-[10px] font-semibold text-[#14243f]"
                  >
                    <Bookmark aria-hidden className="size-3" />
                    {tr("Preset Snips")}
                  </button>
                </div>
                <textarea
                  value={feedback}
                  onChange={(e) => setDrafts((d) => ({ ...d, [candidate.id]: e.target.value }))}
                  rows={5}
                  dir="auto"
                  className="w-full resize-none bg-white p-4 text-xs leading-relaxed text-[#1B2D54] outline-none focus:ring-2 focus:ring-inset focus:ring-[#12939b]/40"
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#e3ece9] pt-4">
                <SmallButton tone="gray">{tr("Save as Draft")}</SmallButton>
                <div className="flex items-center gap-2">
                  <SmallButton tone="teal">
                    <Send aria-hidden className="size-3.5 rtl:-scale-x-100" />
                    {tr("Submit Feedback & Notify Student")}
                  </SmallButton>
                  <button
                    type="button"
                    aria-label={tr("Next candidate")}
                    onClick={nextCandidate}
                    className="grid size-8 place-items-center rounded-lg bg-[#eef0f2] hover:bg-[#e1e5e8]"
                  >
                    <ArrowRight aria-hidden className="size-4 rtl:rotate-180" />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* ================= Right: review pipeline (aside, 4 columns) ================= */}
        <div className="flex min-w-0 flex-col gap-6 xl:col-span-4">
          <Card className="p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-bold">{tr("Review Pipeline")}</h2>
              <span className="rounded-full bg-[#bff3f3] px-2.5 py-1 text-[10px] font-semibold text-[#0b6b70]">
                <bdi>{t("{n} Sprints Active", { n: 4 })}</bdi>
              </span>
            </div>

            <div role="tablist" className="mt-4 flex items-center gap-0.5 rounded-lg bg-[#f1f4f4] p-0.5">
              {PIPELINE_TABS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  role="tab"
                  aria-selected={pipelineTab === p.key}
                  onClick={() => setPipelineTab(p.key)}
                  className={cn(
                    "flex-1 rounded-md px-2 py-1.5 text-[10px] font-semibold transition-colors",
                    pipelineTab === p.key ? "bg-white text-[#14243f] shadow-sm" : "text-[#1B2D54]/60 hover:text-[#1B2D54]"
                  )}
                >
                  {tr(p.label)}
                  {p.count !== undefined && <bdi>{` (${p.count})`}</bdi>}
                </button>
              ))}
            </div>

            <ul className="mt-4 flex flex-col gap-5">
              {pipeline.length === 0 && (
                <li className="rounded-xl bg-[#f1f4f4] p-6 text-center text-[11px] text-[#1B2D54]/60">{tr("Nothing here yet.")}</li>
              )}

              {pipeline.map((p) => (
                <li
                  key={p.id}
                  className={cn(
                    "rounded-xl p-4",
                    p.highlight ? "border border-[#e3ece9] border-s-4 border-s-[#0b6b70] bg-white shadow-sm" : "bg-white"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] font-semibold text-[#1B2D54]/60">{tr(p.cohort)}</span>
                    <span
                      className={cn(
                        "shrink-0 rounded px-2 py-0.5 text-[9px] font-semibold",
                        p.badgeTone === "red" && "bg-[#fde8e8] text-[#c81e1e]",
                        p.badgeTone === "green" && "bg-[#d4f5f5] text-[#0b6b70]",
                        p.badgeTone === "navy" && "bg-[#eef0f2] text-[#14243f]"
                      )}
                    >
                      {tr(p.badge)}
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-bold leading-snug">{tr(p.title)}</p>

                  <div className="mt-3 flex items-center justify-between text-[10px]">
                    <span className="text-[#1B2D54]/70">
                      <Ltr>{p.percent}%</Ltr> {tr(p.percentLabel)}
                    </span>
                    <span className="font-bold">{tr(p.count)}</span>
                  </div>
                  <div
                    className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#e3ece9]"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={p.percent}
                  >
                    <div className={cn("h-full rounded-full", p.barTone)} style={{ width: `${p.percent}%` }} />
                  </div>

                  {p.waiting && (
                    <div className="mt-3 flex items-center justify-between text-[10px]">
                      <span className="flex items-center" dir="ltr">
                        <span className="flex -space-x-2">
                          {p.team?.map((m) => (
                            <span
                              key={m.initials}
                              className={cn(
                                "grid size-6 place-items-center rounded-full text-[8px] font-bold ring-2 ring-white",
                                m.tone
                              )}
                            >
                              {m.initials}
                            </span>
                          ))}
                        </span>
                        {p.more !== undefined && <span className="ms-2 text-[10px] text-[#1B2D54]/70">+{p.more}</span>}
                      </span>
                      <span className="font-semibold text-[#0b6b70]">{tr(p.waiting)}</span>
                    </div>
                  )}

                  {p.notice && (
                    <p className="mt-3 flex items-start gap-2 rounded-lg border border-[#f7caca] bg-[#fdecec] p-3 text-[10px] font-semibold leading-snug text-[#c81e1e]">
                      <TriangleAlert aria-hidden className="mt-0.5 size-3.5 shrink-0" />
                      {tr(p.notice)}
                    </p>
                  )}

                  <button
                    type="button"
                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#eef0f2] px-3 py-2.5 text-[11px] font-semibold text-[#14243f] hover:bg-[#e1e5e8]"
                  >
                    {tr(p.action)}
                    {p.actionIcon === "arrow" && <ArrowRight aria-hidden className="size-3.5 rtl:rotate-180" />}
                    {p.actionIcon === "monitor" && <Monitor aria-hidden className="size-3.5" />}
                    {p.actionIcon === "sliders" && <SlidersHorizontal aria-hidden className="size-3.5" />}
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="border-0 bg-[#f1f4f4] p-5 shadow-none">
            <h3 className="flex items-center gap-1.5 text-xs font-bold">
              <Lightbulb aria-hidden className="size-4 text-[#0b6b70]" />
              {tr("Critique Benchmark Advice")}
            </h3>
            <p className="mt-2 text-[11px] leading-relaxed text-[#1B2D54]/75">
              {tr("Ensure candidates cite color tokens rather than hardcoded hex values in inspection notes. Highlight auto-layout flexible resilience during tomorrow's synchronous standup.")}
            </p>
          </Card>
        </div>
      </div>
      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="leading-tight">
            <h3 className="text-sm font-bold">{tr("24-Hour Submission Velocity & Turnaround")}</h3>
            <p className="mt-1 max-w-[26rem] text-[10px] text-[#1B2D54]/80">
              {tr("Live comparison: Cohort 9A (UI Foundation) vs Cohort 9B (Design System Component Integration)")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold text-[#14243f]">
            <span className="flex items-center gap-1.5">
              <span aria-hidden className="size-2 rounded-full bg-[#0b6b70]" />
              {tr("Cohort 9A")}
            </span>
            <span className="flex items-center gap-1.5">
              <span aria-hidden className="size-2 rounded-full bg-[#14243f]" />
              {tr("Cohort 9B")}
            </span>
            <span className="flex items-center gap-1 rounded bg-[#dfe3e7] px-2 py-1 text-[9px] font-semibold text-[#14243f]">
              <Clock aria-hidden className="size-3" />
              {tr("Real-time Sync")}
            </span>
          </div>
        </div>
        <div className="mt-4">
          <VelocityChart />
        </div>
      </Card>
    </div>
  );
}