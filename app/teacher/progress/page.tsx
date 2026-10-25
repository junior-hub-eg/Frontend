"use client";
import { useState, type ReactNode } from "react";
import Image from "next/image";
import {
  ArrowRight,
  Award,
  Bell,
  BadgeCheck,
  Briefcase,
  CalendarCheck,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  ClipboardList,
  Clock,
  ExternalLink,
  EyeOff,
  FileText,
  LayoutTemplate,
  MonitorCheck,
  Rocket,
  Search,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  TriangleAlert,
  CircleAlert,
  Table,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/client";

function useTr() {
  const { t } = useI18n();
  return (s: string) => (/[A-Za-z]/.test(s) ? t(s) : s);
}

function Ltr({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span dir="ltr" className={cn("inline-block", className)}>
      {children}
    </span>
  );
}


const COHORT_CHIPS = [
  { id: "9a", label: "Cohort 9A: Design Systems & Interaction" },
  { id: "9b", label: "Cohort 9B: User Research & Usability" },
];

const LEVEL_OPTIONS = ["All Levels", "Advanced", "Proficient", "Developing"];
const SPRINT_OPTIONS = ["Sprint 06: WCAG & Accessibility Tests", "Sprint 05: Interactive Prototyping"];

const SKILL_COLUMNS = ["User Research", "Wireframes & IA", "Design Systems", "Interactive Prototype", "WCAG AA Acc."];

type MetaTone = "teal" | "gray" | "red";

const STUDENTS: {
  id: string;
  name: string;
  meta: string;
  metaTone: MetaTone;
  alert?: boolean;
  initials: string;
  avatar: string;
  photo?: string;
  scores: number[];
}[] = [
  { id: "sara", name: "Sara Hassan", meta: "Cohort 9A • Top of Cohort", metaTone: "teal", initials: "SH", avatar: "bg-[#12939b]", photo: "/images/teacher/students/sara.png", scores: [96, 94, 98, 92, 91] },
  { id: "omar", name: "Omar Ali", meta: "Cohort 9A • Interaction Specialist", metaTone: "gray", initials: "OA", avatar: "bg-[#7c5cff]", photo: "/images/teacher/students/omar.png", scores: [88, 90, 91, 94, 87] },
  { id: "zainab", name: "Zeinab Ezzat", meta: "Cohort 9B • UX Researcher", metaTone: "gray", initials: "ZE", avatar: "bg-[#f5a524]", photo: "/images/teacher/students/zainab.png", scores: [95, 91, 84, 78, 82] },
  { id: "youssef", name: "Youssef Ahmed", meta: "Needs Support", metaTone: "red", alert: true, initials: "YA", avatar: "bg-[#e5484d]", photo: "/images/teacher/students/youssef.png", scores: [74, 68, 63, 59, 54] },
  { id: "lina", name: "Lina Hamdy", meta: "Cohort 9B • Product Designer", metaTone: "gray", initials: "LH", avatar: "bg-[#0f9d6b]", photo: "/images/teacher/students/lina.png", scores: [92, 90, 86, 91, 85] },
  { id: "karim", name: "Kareem Tarek", meta: "Cohort 9A • UI Systems", metaTone: "gray", initials: "KT", avatar: "bg-[#14243f]", photo: "/images/teacher/students/karim.png", scores: [84, 87, 95, 83, 76] },
];

const LEGEND = [
  { label: "Advanced (90–100%)", dot: "bg-[#0b6b70]" },
  { label: "Proficient (75–89%)", dot: "bg-[#8fe9ea]" },
  { label: "Developing (<70%)", dot: "bg-[#f9c9c9]" },
];

const SKILL_GAPS = [
  { label: "Auto Layout & Architecture", value: 91, bar: "bg-[#0b6b70]" },
  { label: "User Scenarios & IA", value: 88, bar: "bg-[#0b6b70]" },
  { label: "Smart Animate Prototyping", value: 79, bar: "bg-[#7fdfe0]" },
];

const SPOTLIGHT: {
  id: string;
  tone: "good" | "bad";
  name: string;
  initials: string;
  badge: string;
  mastery: number;
  note: string;
  chips: { text: string; icon: ReactNode; bad?: boolean }[];
  title: string;
  message?: string;
  plan?: string[];
  primary: { label: string; icon: ReactNode };
  secondary: { label: string; icon: ReactNode };
}[] = [
  {
    id: "sara",
    tone: "good",
    name: "Sara Hassan",
    initials: "SH",
    badge: "Outstanding Candidate",
    mastery: 96,
    note: "Active Contributor",
    chips: [
      { text: "4 Figma Community Templates", icon: <LayoutTemplate aria-hidden className="size-3.5" /> },
      { text: "98/100 Design Tokens Score", icon: <BadgeCheck aria-hidden className="size-3.5" /> },
      { text: "3 Complete Case Studies", icon: <MonitorCheck aria-hidden className="size-3.5" /> },
    ],
    title: "Lead Mentor Feedback",
    message:
      "Sara shows exceptional mastery of Auto Layout systems and component architecture. Recommended as Peer Mentor for Figma Variables sprint.",
    primary: { label: "Issue Certificate of Excellence", icon: <Award aria-hidden className="size-3.5" /> },
    secondary: { label: "Open Figma Workspace", icon: <ExternalLink aria-hidden className="size-3.5" /> },
  },
  {
    id: "youssef",
    tone: "bad",
    name: "Youssef Ahmed",
    initials: "YA",
    badge: "Intervention Required",
    mastery: 58,
    note: "Lagging behind Sprint 06",
    chips: [
      { text: "54% WCAG Accessibility", icon: <EyeOff aria-hidden className="size-3.5" />, bad: true },
      { text: "59% Smart Animate", icon: <Sparkles aria-hidden className="size-3.5" />, bad: true },
      { text: "6.2 hrs weekly Figma time", icon: <Clock aria-hidden className="size-3.5" /> },
    ],
    title: "Urgent Action Plan (Next 48 Hours)",
    plan: ["Focus on Relative vs Absolute constraints in Figma", "Re-submit checkout modal adhering to 4.5:1 text contrast ratios"],
    primary: { label: "Schedule 1-on-1 Session", icon: <CalendarCheck aria-hidden className="size-3.5" /> },
    secondary: { label: "Review Draft Submissions", icon: <ClipboardList aria-hidden className="size-3.5" /> },
  },
];

const TOTAL_CANDIDATES = 54;


function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <section className={cn("rounded-2xl border border-[#e3ece9] bg-white p-4 shadow-sm", className)}>{children}</section>
  );
}

type ButtonTone = "teal" | "navy" | "red" | "gray" | "white";

const BUTTON_TONE: Record<ButtonTone, string> = {
  teal: "bg-[#0b6b70] text-white hover:bg-[#095a5e]",
  navy: "bg-[#14243f] text-white hover:bg-[#0e1a2e]",
  red: "bg-[#c81e1e] text-white hover:bg-[#a51919]",
  gray: "bg-[#eef0f2] text-[#14243f] hover:bg-[#e1e5e8]",
  white: "bg-white text-[#14243f] shadow-sm ring-1 ring-[#e3ece9] hover:bg-[#f6f9f8]",
};

function Btn({ tone, icon, children, full }: { tone: ButtonTone; icon?: ReactNode; children: ReactNode; full?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12939b]/40",
        BUTTON_TONE[tone],
        full && "w-full"
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function Avatar({ name, initials, avatar, photo, size = "size-9" }: { name: string; initials: string; avatar: string; photo?: string; size?: string }) {
  const [failed, setFailed] = useState(false);
  if (photo && !failed) {
    return (
      <Image
        src={photo}
        alt={name}
        width={40}
        height={40}
        onError={() => setFailed(true)}
        className={cn("shrink-0 rounded-full object-cover", size)}
      />
    );
  }
  return (
    <span className={cn("grid shrink-0 place-items-center rounded-full text-[10px] font-bold text-white", avatar, size)}>
      {initials}
    </span>
  );
}

function HeatCell({ value }: { value: number }) {
  const tone =
    value >= 90
      ? "bg-[#0b6b70] text-white"
      : value >= 70
        ? "bg-[#9aeaea] text-[#0b6b70]"
        : "bg-[#fbd5d5] text-[#c81e1e]";
  return (
    <span dir="ltr" className={cn("inline-grid h-8 w-full min-w-[3rem] place-items-center rounded-md text-[11px] font-bold", tone)}>
      {value}%
    </span>
  );
}

function smoothPath(pts: [number, number][]) {
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
  }
  return d;
}

function Sparkline() {
  const pts: [number, number][] = [
    [0, 26],
    [18, 22],
    [36, 24],
    [54, 14],
    [72, 16],
    [100, 6],
  ];
  const line = smoothPath(pts);
  return (
    // dir is not allowed on <svg>, so the direction is set on the wrapper
    <div dir="ltr">
      <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-8 w-full" aria-hidden>
        <defs>
          <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0b6b70" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0b6b70" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${line} L100,30 L0,30 Z`} fill="url(#spark-fill)" />
        <path d={line} fill="none" stroke="#0b6b70" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

function Donut({ percent }: { percent: number }) {
  const r = 28;
  const c = 2 * Math.PI * r;
  return (
    <div dir="ltr" className="relative grid size-[4.25rem] shrink-0 place-items-center">
      <svg viewBox="0 0 72 72" className="size-full -rotate-90" role="img" aria-label={`${percent}%`}>
        <circle cx="36" cy="36" r={r} fill="none" stroke="#dfe9e7" strokeWidth="7" />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke="#0b6b70"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${(percent / 100) * c} ${c}`}
        />
      </svg>
      <span className="absolute text-[13px] font-bold">{percent}%</span>
    </div>
  );
}

export default function ProgressPage() {
  const { t, dir } = useI18n();
  const isAr = dir === "rtl";
  const tr = useTr();
  const [cohort, setCohort] = useState("9a");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const rows = STUDENTS.filter((s) => {
    const q = query.toLowerCase();
    return !q || s.name.toLowerCase().includes(q) || tr(s.name).toLowerCase().includes(q);
  });

  const caps = isAr ? "normal-case tracking-normal" : "uppercase tracking-wide";

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 pb-6 pt-4 font-[family-name:var(--font-poppins)] text-[#1B2D54]">
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

      <header className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 ps-3">
          <h1 dir="auto" className="max-w-md text-2xl font-bold leading-tight text-[#0f1f3d]">{tr("Competency Matrix & Student Progress")}</h1>
          <p dir="auto" className="mt-1.5 max-w-sm text-[11px] leading-snug text-[#1B2D54]/75">
            {tr("Real-time evaluation across Figma Plugin telemetry & GitHub API integration")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:pt-1">
          <Btn tone="white" icon={<FileText aria-hidden className="size-3.5" />}>
            {tr("Export Certified Report (PDF)")}
          </Btn>
          <Btn tone="white" icon={<Table aria-hidden className="size-3.5" />}>
            {tr("Export CSV")}
          </Btn>
          <Btn tone="teal" icon={<CalendarDays aria-hidden className="size-3.5" />}>
            {tr("Schedule Portfolio Review")}
          </Btn>
        </div>
      </header>

      {/* ---------------- Filters ---------------- */}
      <Card className="flex flex-wrap items-center gap-2 p-3">
        {COHORT_CHIPS.map((c) => {
          const selected = cohort === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCohort(c.id)}
              aria-pressed={selected}
              className={cn(
                "rounded-md px-3 py-2 text-[10px] font-semibold transition-colors",
                selected ? "bg-[#0b6b70] text-white" : "bg-[#f1f4f4] text-[#14243f] hover:bg-[#e6ebec]"
              )}
            >
              {tr(c.label)}
            </button>
          );
        })}

        <div className="relative min-w-[8rem] flex-1">
          <select className="h-8 w-full appearance-none rounded-md bg-[#f1f4f4] ps-3 pe-8 text-[10px] font-semibold text-[#14243f] outline-none">
            {LEVEL_OPTIONS.map((o) => (
              <option key={o}>{tr(o)}</option>
            ))}
          </select>
          <ChevronDown aria-hidden className="pointer-events-none absolute end-2.5 top-1/2 size-3.5 -translate-y-1/2" />
        </div>

        <div className="relative min-w-[10rem] flex-1">
          <select className="h-8 w-full appearance-none rounded-md bg-[#f1f4f4] ps-3 pe-8 text-[10px] font-semibold text-[#14243f] outline-none">
            {SPRINT_OPTIONS.map((o) => (
              <option key={o}>{tr(o)}</option>
            ))}
          </select>
          <ChevronDown aria-hidden className="pointer-events-none absolute end-2.5 top-1/2 size-3.5 -translate-y-1/2" />
        </div>

        <label className="relative w-full max-w-[8rem]">
          <Search aria-hidden className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#1B2D54]/50" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tr("Search")}
            className="h-8 w-full rounded-md bg-[#f1f4f4] ps-8 pe-2 text-[10px] outline-none placeholder:text-[#1B2D54]/50 focus:ring-2 focus:ring-[#12939b]/40"
          />
        </label>
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {/* 1 */}
        <Card className="flex flex-col gap-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <p dir="auto" className={cn("text-[9px] font-semibold leading-tight text-[#1B2D54]/60", caps)}>{tr("Cumulative Cohort Mastery")}</p>
            <TrendingUp aria-hidden className="size-4 shrink-0 text-[#0b6b70] rtl:-scale-x-100" />
          </div>
          <p dir="auto" className="flex flex-wrap items-center gap-2">
            <Ltr className="text-3xl font-bold leading-none text-[#14243f]">84.6%</Ltr>
            <span dir="ltr" className="rounded bg-[#9aeaea] px-1.5 py-0.5 text-[9px] font-semibold text-[#0b6b70]">
              ↑ +4.2%
            </span>
          </p>
          <p dir="auto" className="text-[11px] leading-snug text-[#1B2D54]/75">{tr("Surpassing 80% benchmark target across 8 core UI/UX skills.")}</p>
          <div className="mt-auto pt-1">
            <Sparkline />
          </div>
        </Card>

        {/* 2 */}
        <Card className="flex flex-col gap-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <p dir="auto" className={cn("text-[9px] font-semibold leading-tight text-[#1B2D54]/60", caps)}>{tr("Client Simulation Ready")}</p>
            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-[#eef0f2] text-[#0b6b70]">
              <Briefcase aria-hidden className="size-3.5" />
            </span>
          </div>
          <p dir="auto" className="flex flex-wrap items-center gap-2">
            <Ltr className="text-3xl font-bold leading-none text-[#14243f]">38</Ltr>
            <Ltr className="text-[11px] text-[#1B2D54]/60">/ 54</Ltr>
            <span className="rounded bg-[#9aeaea] px-1.5 py-0.5 text-[9px] font-semibold text-[#0b6b70]">
              <bdi>{tr("70.3% rate")}</bdi>
            </span>
          </p>
          <p dir="auto" className="text-[11px] leading-snug text-[#1B2D54]/75">{tr("Completed 3 verified case studies with tokenized design systems.")}</p>
          <div
            dir="ltr"
            className="mt-auto h-1.5 w-full overflow-hidden rounded-full bg-[#dfe9e7]"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={70}
          >
            <div className="h-full w-[70%] rounded-full bg-[#0b6b70]" />
          </div>
        </Card>

        {/* 3 */}
        <Card className="flex flex-col gap-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <p dir="auto" className={cn("text-[9px] font-semibold leading-tight text-[#1B2D54]/60", caps)}>{tr("Needs Focused Mentorship")}</p>
            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-[#fde8e8] text-[#c81e1e]">
              <TriangleAlert aria-hidden className="size-3.5" />
            </span>
          </div>
          <p dir="auto" className="flex flex-wrap items-baseline gap-2">
            <Ltr className="text-3xl font-bold leading-none text-[#c81e1e]">4</Ltr>
            <span className="text-[11px] text-[#1B2D54]/70">{tr("students flagged")}</span>
          </p>
          <p dir="auto" className="text-[11px] leading-snug text-[#1B2D54]/75">
            {tr("WCAG contrast & interactive prototyping below 65%; flagged for 48h 1-on-1.")}
          </p>
          <div className="mt-auto flex items-center justify-between gap-2 pt-1">
            <span className="rounded bg-[#fde8e8] px-1.5 py-0.5 text-[9px] font-semibold text-[#c81e1e]">{tr("Critical Attention")}</span>
            <button type="button" className="flex items-center gap-1 text-[10px] font-semibold text-[#0b6b70] hover:underline">
              {tr("Queue Review")}
              <ArrowRight aria-hidden className="size-3 rtl:rotate-180" />
            </button>
          </div>
        </Card>

        {/* 4 */}
        <Card className="flex flex-col gap-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <p dir="auto" className={cn("text-[9px] font-semibold leading-tight text-[#1B2D54]/60", caps)}>{tr("Studio & Figma Active Time")}</p>
            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-[#eef0f2] text-[#14243f]">
              <Timer aria-hidden className="size-3.5" />
            </span>
          </div>
          <p dir="auto" className="flex flex-wrap items-baseline gap-2">
            <Ltr className="text-3xl font-bold leading-none text-[#14243f]">18.4</Ltr>
            <span className="text-[11px] text-[#1B2D54]/70">{tr("hrs / wk")}</span>
          </p>
          <p dir="auto" className="text-[11px] leading-snug text-[#1B2D54]/75">{tr("High studio engagement logged in production component files & tests.")}</p>
          <p dir="auto" className="mt-auto flex items-center gap-1.5 pt-1 text-[10px] font-semibold text-[#0b6b70]">
            <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-[#2fd0c4]" />
            {tr("Telemetries syncing continuously")}
          </p>
        </Card>
      </div>

      <div className="grid min-w-0 items-stretch gap-4 xl:grid-cols-12">
        {/* Heatmap: stretches to the same height as the column beside it */}
        <Card className="flex min-w-0 flex-col p-5 xl:col-span-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-[16rem] leading-tight">
              <h2 dir="auto" className="text-sm font-bold">{tr("Competency Matrix Heatmap")}</h2>
              <p dir="auto" className="mt-1 text-[10px] leading-snug text-[#1B2D54]/60">
                {tr("Automated score calibration based on live design submission audits")}
              </p>
            </div>

            <ul className="flex max-w-[15rem] flex-wrap items-center gap-x-3 gap-y-1 text-[9px] font-semibold text-[#14243f]">
              {LEGEND.map((l) => (
                <li key={l.label} className="flex items-center gap-1.5">
                  <span aria-hidden className={cn("size-2 rounded-full", l.dot)} />
                  {tr(l.label)}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 flex-1 overflow-x-auto">
            <table className="w-full min-w-[640px] border-separate border-spacing-y-1.5 text-[10px]">
              <thead>
                <tr className="text-[8px] font-bold text-[#1B2D54]/70 [&>th:first-child]:rounded-s-lg [&>th:last-child]:rounded-e-lg [&>th]:bg-[#f1f4f4]">
                  <th className={cn("px-3 py-2.5 text-start font-bold", caps)}>{tr("Student Profile")}</th>
                  {SKILL_COLUMNS.map((c) => (
                    <th key={c} className={cn("px-1.5 py-2.5 text-center font-bold leading-tight", caps)}>
                      {tr(c)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <tr
                    key={s.id}
                    className={cn(s.alert && "[&>td:first-child]:rounded-s-lg [&>td:last-child]:rounded-e-lg [&>td]:bg-[#fdf1f1]")}
                  >
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={tr(s.name)} initials={s.initials} avatar={s.avatar} photo={s.photo} size="size-10" />
                        <div className="min-w-0 text-start leading-tight">
                          <p dir="auto" className="text-xs font-bold">
                            {tr(s.name)}
                          </p>
                          <p
                            dir="auto"
                            className={cn(
                              "mt-0.5 flex items-center gap-1 text-[9px]",
                              s.metaTone === "teal" && "font-semibold text-[#0b6b70]",
                              s.metaTone === "gray" && "text-[#1B2D54]/60",
                              s.metaTone === "red" && "font-semibold text-[#c81e1e]"
                            )}
                          >
                            {s.metaTone === "red" && <TriangleAlert aria-hidden className="size-3 shrink-0" />}
                            {tr(s.meta)}
                          </p>
                        </div>
                      </div>
                    </td>
                    {s.scores.map((v, i) => (
                      <td key={i} className="px-1.5 py-3 text-center">
                        <HeatCell value={v} />
                      </td>
                    ))}
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-[#1B2D54]/60">
                      {tr("No students match your search.")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px]">
            <p dir="auto" className="text-[#1B2D54]/70">
              {t("Showing {n} of {total} registered candidates in active cohort", { n: rows.length, total: TOTAL_CANDIDATES })}
            </p>

            <nav dir="ltr" aria-label="Pagination" className="flex items-center gap-1">
              <button
                type="button"
                aria-label={tr("Previous")}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="grid size-6 place-items-center rounded-md border border-[#e3ece9] bg-white hover:bg-[#f6f9f8]"
              >
                <ChevronLeft aria-hidden className="size-3.5" />
              </button>
              {[1, 2, 3, "…", 9].map((n, i) =>
                typeof n === "number" ? (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPage(n)}
                    aria-current={page === n ? "page" : undefined}
                    className={cn(
                      "grid size-6 place-items-center rounded-md text-[10px] font-semibold",
                      page === n ? "bg-[#0b6b70] text-white" : "border border-[#e3ece9] bg-white hover:bg-[#f6f9f8]"
                    )}
                  >
                    {n}
                  </button>
                ) : (
                  <span key={i} className="px-1 text-[#1B2D54]/50">
                    {n}
                  </span>
                )
              )}
              <button
                type="button"
                aria-label={tr("Next")}
                onClick={() => setPage((p) => Math.min(9, p + 1))}
                className="grid size-6 place-items-center rounded-md border border-[#e3ece9] bg-white hover:bg-[#f6f9f8]"
              >
                <ChevronRight aria-hidden className="size-3.5" />
              </button>
            </nav>
          </div>
        </Card>

        {/* Side cards */}
        <div className="flex min-w-0 flex-col gap-4 xl:col-span-4">
          {/* Skill gap analysis */}
          <Card className="p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 dir="auto" className="flex items-center gap-2 text-sm font-bold">
                <span className="grid size-6 place-items-center rounded-md border border-[#0b6b70]/40 text-[#0b6b70]">
                  <Target aria-hidden className="size-3.5" />
                </span>
                {tr("Skill Gap Analysis & AI")}
              </h2>
              <span className="shrink-0 rounded bg-[#eef0f2] px-2 py-0.5 text-[9px] font-semibold text-[#1B2D54]/70">
                {tr("Sprint 06")}
              </span>
            </div>

            <ul className="mt-3 flex flex-col gap-2.5">
              {SKILL_GAPS.map((g) => (
                <li key={g.label}>
                  <div className="flex items-center justify-between gap-2 text-[10px] font-semibold">
                    <span>{tr(g.label)}</span>
                    <Ltr>{g.value}%</Ltr>
                  </div>
                  <div
                    dir="ltr"
                    className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#dfe9e7]"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={g.value}
                  >
                    <div className={cn("h-full rounded-full", g.bar)} style={{ width: `${g.value}%` }} />
                  </div>
                </li>
              ))}

              <li className="rounded-lg bg-[#fdecec] p-2">
                <div className="flex items-center justify-between gap-2 text-[10px] font-semibold text-[#c81e1e]">
                  <span className="flex items-center gap-1">
                    <CircleAlert aria-hidden className="size-3" />
                    {tr("WCAG AA Contrast Compliance")}
                  </span>
                  <Ltr>68%</Ltr>
                </div>
                <div dir="ltr" className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#f9c9c9]">
                  <div className="h-full w-[68%] rounded-full bg-[#c81e1e]" />
                </div>
              </li>
            </ul>

            <div className="mt-4 rounded-xl bg-[#f1f4f4] p-3">
              <p dir="auto" className={cn("text-[8px] font-bold text-[#0b6b70]", caps)}>{tr("Targeted Lecture Recommendation")}</p>
              <p dir="auto" className="mt-1.5 text-[10px] leading-snug text-[#1B2D54]/80">
                {tr(
                  "32% of cohort students struggled with placeholder contrast on tinted backgrounds. Suggest allocating 25 minutes of upcoming standup to Stark contrast audit workflow."
                )}
              </p>
              <button type="button" className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-[#0b6b70] hover:underline">
                {tr("Schedule In-Class Drill")}
                <ArrowRight aria-hidden className="size-3 rtl:rotate-180" />
              </button>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 dir="auto" className="flex items-center gap-2 text-sm font-bold">
                <span className="grid size-6 place-items-center rounded-md bg-[#0b6b70] text-white">
                  <CircleCheck aria-hidden className="size-3.5" />
                </span>
                {tr("Simulation Readiness")}
              </h2>
              <span className="shrink-0 rounded bg-[#9aeaea] px-2 py-0.5 text-[9px] font-semibold text-[#0b6b70]">
                {tr("Sprint 08")}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-4 rounded-xl bg-[#f1f4f4] p-3">
              <Donut percent={70} />
              <div className="min-w-0 leading-tight">
                <p dir="auto" className="text-[12px] font-bold">
                  <Ltr>38 / 54</Ltr> {tr("Students")}
                </p>
                <p dir="auto" className="mt-1 text-[10px] leading-snug text-[#1B2D54]/70">
                  {tr("Qualified to advance to individual FinTech App Redesign simulation.")}
                </p>
              </div>
            </div>

            <div className="mt-3">
              <Btn tone="navy" full icon={<Rocket aria-hidden className="size-3.5" />}>
                {tr("Activate Cohort Simulation")}
              </Btn>
            </div>
          </Card>
        </div>
      </div>

      <section className="mt-6">
        <div className="ps-1 leading-tight">
          <h2 dir="auto" className="text-xl font-bold text-[#0f1f3d]">
            {tr("Spotlight Deep-Dive (Individual Intervention & Recognition)")}
          </h2>
          <p dir="auto" className="mt-1.5 text-[11px] text-[#1B2D54]/60">
            {tr("Granular telemetry analysis for top performers and critical interventions.")}
          </p>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {SPOTLIGHT.map((p) => {
            const good = p.tone === "good";
            return (
              <Card key={p.id} className="flex flex-col gap-5 rounded-2xl border-0 p-6 shadow-[0_6px_24px_rgba(20,54,90,0.08)]">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3.5">
                    <span
                      className={cn(
                        "grid size-12 shrink-0 place-items-center rounded-xl text-base font-bold",
                        good ? "bg-[#0b6b70] text-white" : "bg-[#fde8e8] text-[#c81e1e]"
                      )}
                    >
                      {p.initials}
                    </span>
                    <div className="min-w-0 text-start leading-tight">
                      <p dir="auto" className="flex flex-wrap items-center gap-2 text-base font-bold text-[#14243f]">
                        {tr(p.name)}
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
                            good ? "bg-[#9be9ef] text-[#0b6b70]" : "bg-[#fde8e8] text-[#c81e1e]"
                          )}
                        >
                          {tr(p.badge)}
                        </span>
                      </p>
                      <p dir="auto" className="mt-1.5 text-[12px] text-[#1B2D54]/70">
                        {tr("Cumulative Mastery:")}{" "}
                        <Ltr className={cn("font-bold", good ? "text-[#0b6b70]" : "text-[#c81e1e]")}>{p.mastery}%</Ltr> • {tr(p.note)}
                      </p>
                    </div>
                  </div>
                  {good ? (
                    <Award aria-hidden className="size-6 shrink-0 text-[#0b6b70]" />
                  ) : (
                    <Bell aria-hidden className="size-6 shrink-0 text-[#c81e1e]" />
                  )}
                </div>

                <ul className="flex flex-wrap gap-2">
                  {p.chips.map((c) => (
                    <li
                      key={c.text}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10.5px] font-semibold",
                        c.bad
                          ? "border-[#f7d4d4] bg-[#fdf0f0] text-[#c81e1e]"
                          : "border-[#e6eaed] bg-[#f8fafb] text-[#14243f] [&_svg]:text-[#14243f]"
                      )}
                    >
                      {c.icon}
                      {tr(c.text)}
                    </li>
                  ))}
                </ul>

                <div className="rounded-2xl bg-[#f1f4f4] px-5 py-4">
                  <p
                    dir="auto"
                    className={cn(
                      "flex items-center gap-1.5 text-[9.5px] font-semibold",
                      caps,
                      good ? "text-[#1B2D54]/55" : "text-[#c81e1e]"
                    )}
                  >
                    {!good && <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-[#c81e1e]" />}
                    {tr(p.title)}
                  </p>

                  {p.message && (
                    <p dir="auto" className="mt-2 text-[13px] leading-relaxed text-[#14243f]">
                      “{tr(p.message)}”
                    </p>
                  )}

                  {p.plan && (
                    <ul className="mt-3 flex flex-col gap-2.5">
                      {p.plan.map((step) => (
                        <li key={step} className="flex items-center gap-2.5 text-[12.5px] leading-snug text-[#14243f]">
                          <span aria-hidden className="size-4 shrink-0 rounded-[5px] border border-[#c81e1e]/60 bg-white" />
                          <span dir="auto">{tr(step)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[11px] font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12939b]/40",
                      good ? "bg-[#0b6b70] hover:bg-[#095a5e]" : "bg-[#c81e1e] hover:bg-[#a51919]"
                    )}
                  >
                    {p.primary.icon}
                    {tr(p.primary.label)}
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#eef0f2] px-4 py-2.5 text-[11px] font-semibold text-[#14243f] transition-colors hover:bg-[#e1e5e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12939b]/40"
                  >
                    {p.secondary.icon}
                    {tr(p.secondary.label)}
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}