"use client";

import { useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  ClipboardList,
  Download,
  ExternalLink,
  GraduationCap,
  Megaphone,
  Search,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CLASSES = [
  {
    id: "9a",
    code: "9A",
    name: "Grade 9A",
    subject: "Mathematics",
    info: "Assigned Class • Room 204 • Section Lead",
    badge: "Read-Only Schedule",
    size: 28,
    activeRate: "92.8%",
    avgScore: "84.5%",
    unit: "Current: Unit 3 — Algebra: Linear Equations",
    term: 68,
  },
  {
    id: "9b",
    code: "9B",
    name: "Grade 9B",
    subject: "Mathematics",
    info: "Assigned Class • Room 208 • Section Lead",
    badge: "Read-Only Schedule",
    size: 32,
    activeRate: "90.8%",
    avgScore: "88.5%",
    unit: "Current: Unit 3 — Algebra: Linear Equations",
    term: 68,
  },
];

const TABS = [
  { key: "students", label: "Students (28)", icon: Users, dot: false },
  { key: "invite", label: "Invite & Access", icon: UserPlus, dot: true },
  { key: "lesson", label: "Weekly Lesson Plan", icon: CalendarCheck, dot: false },
  { key: "assignments", label: "Assignments (3)", icon: ClipboardList, dot: false },
] as const;

type Status = "Top Quartile" | "On Track" | "Needs Assistance";

const STUDENTS: {
  name: string;
  email: string;
  id: string;
  attendance: string;
  mastery: number;
  status: Status;
  avatar: string;
  photo?: string;
}[] = [
  { name: "Zainab Ezzat", email: "zainab.ezzat@student.hub", id: "JH-9A-0184", attendance: "96.4%", mastery: 92, status: "Top Quartile", avatar: "bg-[#f5a524]", photo: "/images/teacher/students/zainab.png" },
  { name: "Tariq Al-Mansoor", email: "tariq.mansoor@student.hub", id: "JH-9A-0189", attendance: "94.0%", mastery: 86, status: "On Track", avatar: "bg-[#7c5cff]", photo: "/images/teacher/students/tariq.png" },
  { name: "Lina Hamdy", email: "lina.hamdy@student.hub", id: "JH-9A-0115", attendance: "90.2%", mastery: 79, status: "On Track", avatar: "bg-[#12939b]", photo: "/images/teacher/students/lina.png" },
  { name: "Youssef Amgad", email: "youssef.a@student.hub", id: "JH-9A-0122", attendance: "78.5%", mastery: 61, status: "Needs Assistance", avatar: "bg-[#e5484d]", photo: "/images/teacher/students/youssef.png" },
];

const QUICK_LINKS = [
  { title: "Digital Curriculum", note: "Grade 9 Textbook & Guide", icon: GraduationCap, trailing: ExternalLink },
  { title: "AI Grading Copilot", note: "Auto-diagnostic summaries", icon: Sparkles, trailing: ExternalLink },
  { title: "Class Announcements", note: "Broadcast to parents & students", icon: Megaphone, trailing: ChevronRight },
];

const STATUS_STYLE: Record<Status, string> = {
  "Top Quartile": "bg-[#eef2f1] text-[#1B2D54]/70",
  "On Track": "bg-[#c9f1f0] text-[#14757d]",
  "Needs Assistance": "bg-[#fde8e8] text-[#c62828]",
};

function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <section className={cn("rounded-2xl border border-[#e3ece9] bg-white p-4 shadow-sm", className)}>{children}</section>
  );
}

function MiniStat({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-[#e3ece9] bg-white px-3 py-2">
      <p className="truncate text-[9px] text-[#1B2D54]/60">{label}</p>
      <p className="mt-0.5 flex flex-wrap items-baseline gap-x-1">
        <span className="text-lg font-bold leading-none text-[#14757d]">{value}</span>
        {suffix && <span className="text-[9px] text-[#1B2D54]/60">{suffix}</span>}
      </p>
    </div>
  );
}

function ClassCard({ c, active, onSelect }: { c: (typeof CLASSES)[number]; active: boolean; onSelect: () => void }) {
  return (
    <Card
      className={cn(
        "w-[88%] min-w-0 shrink-0 snap-start p-4 transition-colors sm:w-[400px]",
        active && "bg-[#f4fbfa] ring-2 ring-[#14757d]"
      )}
    >
      <button type="button" onClick={onSelect} className="block w-full text-start">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#c9efe9] text-sm font-bold text-[#14757d]">
            {c.code}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold">
                {c.name} •{c.subject}
              </h3>
              <span className="rounded-full bg-[#dff5e8] px-2 py-0.5 text-[9px] font-medium text-[#22a559]">Active Cohort</span>
              <span className="rounded-full bg-[#eef2f1] px-2 py-0.5 text-[9px] font-medium text-[#1B2D54]/70">{c.badge}</span>
            </div>
            <p className="mt-1 text-[10px] text-[#1B2D54]/60">{c.info}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2.5">
          <MiniStat label="Class Size" value={String(c.size)} suffix="Students" />
          <MiniStat label="Active Rate" value={c.activeRate} />
          <MiniStat label="Avg Score" value={c.avgScore} suffix="Mastery" />
        </div>

        <div className="mt-4 flex items-center justify-between text-[10px]">
          <span className="font-medium">{c.unit}</span>
          <span className="font-semibold text-[#14757d]">{c.term}% of Term</span>
        </div>
        <div
          className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#c9efe9]"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={c.term}
        >
          <div className="h-full rounded-full bg-[#14757d]" style={{ width: `${c.term}%` }} />
        </div>
      </button>
    </Card>
  );
}

function Slider({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, startLeft: 0 });
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = () => {
    const el = ref.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  };

  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div className="relative min-w-0">
      {!atStart && (
        <button
          type="button"
          aria-label="Previous"
          onClick={() => scrollBy(-1)}
          className="absolute -start-3 top-1/2 z-10 hidden size-8 -translate-y-1/2 place-items-center rounded-full bg-white text-[#1B2D54] shadow-md hover:bg-[#f6f9f8] lg:grid"
        >
          <ChevronLeft aria-hidden className="size-4" />
        </button>
      )}
      {!atEnd && (
        <button
          type="button"
          aria-label="Next"
          onClick={() => scrollBy(1)}
          className="absolute -end-3 top-1/2 z-10 hidden size-8 -translate-y-1/2 place-items-center rounded-full bg-white text-[#1B2D54] shadow-md hover:bg-[#f6f9f8] lg:grid"
        >
          <ChevronRight aria-hidden className="size-4" />
        </button>
      )}

      <div
        ref={ref}
        onScroll={update}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse" || !ref.current) return;
          drag.current = { active: true, startX: e.clientX, startLeft: ref.current.scrollLeft };
        }}
        onPointerMove={(e) => {
          if (drag.current.active && ref.current) ref.current.scrollLeft = drag.current.startLeft - (e.clientX - drag.current.startX);
        }}
        onPointerUp={() => (drag.current.active = false)}
        onPointerLeave={() => (drag.current.active = false)}
        className={cn(
          "flex snap-x snap-mandatory gap-4 overflow-x-auto px-2 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "cursor-grab active:cursor-grabbing",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

export default function MyClassesPage() {
  const [activeClass, setActiveClass] = useState("9a");
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("students");
  const [query, setQuery] = useState("");

  const rows = STUDENTS.filter(
    (s) => s.name.toLowerCase().includes(query.toLowerCase()) || s.id.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div dir="ltr" className="flex min-w-0 flex-1 flex-col gap-4 pb-6 pt-4 font-[family-name:var(--font-poppins)] text-[#1B2D54]">
      {/* ---------------- Title + class switcher ---------------- */}
      <header className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wide text-[#14757d]">
            <GraduationCap aria-hidden className="size-3.5" />
            Academic Year 2025/2026 • Semester 1
          </p>
          <h1 className="mt-1 text-2xl font-bold">My Classes</h1>
          <p className="mt-0.5 text-[11px] text-[#1B2D54]/70">
            Track your cohorts, curriculum velocity, and student performance.
          </p>
        </div>

        <div className="min-w-0 max-w-full rounded-full bg-white/80 p-0.5 shadow-sm ring-1 ring-[#e3ece9] lg:max-w-[340px]">
          <div className="flex gap-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CLASSES.map((c) => {
              const active = activeClass === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveClass(c.id)}
                  aria-pressed={active}
                  className={cn(
                    "flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[9px] font-semibold transition-colors",
                    active ? "bg-[#14757d] text-white" : "text-[#1B2D54] hover:bg-[#14757d]/10"
                  )}
                >
                  {c.name} (Assigned)
                  {active && <span aria-hidden className="size-1.5 rounded-full bg-[#4da3ff]" />}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <Slider>
        {CLASSES.map((c) => (
          <ClassCard key={c.id} c={c} active={activeClass === c.id} onSelect={() => setActiveClass(c.id)} />
        ))}
      </Slider>

      <Card className="p-0">
        <div className="border-b border-[#e3ece9] px-5 pt-4">
          <div role="tablist" className="flex flex-wrap items-center gap-4">
            {TABS.map(({ key, label, icon: Icon, dot }) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={cn(
                  "flex items-center gap-1.5 border-b-2 pb-3 text-[11px] font-semibold transition-colors",
                  tab === key ? "border-[#14757d] text-[#14757d]" : "border-transparent text-[#1B2D54]/70 hover:text-[#1B2D54]"
                )}
              >
                <Icon aria-hidden className="size-3.5" />
                {label}
                {dot && <span aria-label="New" className="size-1.5 rounded-full bg-[#e5484d]" />}
              </button>
            ))}
          </div>

          <p className="flex items-center gap-1.5 py-2.5 text-[10px] font-medium text-[#1B2D54]/70">
            <CircleCheck aria-hidden className="size-3.5 shrink-0 text-[#14757d]" />
            Syllabus Sync: Ministry Standard Math 9
          </p>
        </div>

        {tab === "students" ? (
          <div className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="relative w-full max-w-[280px]">
                <Search aria-hidden className="pointer-events-none absolute start-3 top-1/2 size-3.5 -translate-y-1/2 text-[#1B2D54]/50" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter by student name, ID..."
                  className="h-9 w-full rounded-lg border border-[#e3ece9] bg-[#f6f9f8] ps-9 pe-3 text-[11px] outline-none placeholder:text-[#1B2D54]/50 focus:ring-2 focus:ring-[#12939b]/40"
                />
              </label>

              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-[#1B2D54]/60">Sort by:</span>
                <select className="h-8 rounded-lg border border-[#e3ece9] bg-white px-2 text-[10px] font-bold text-[#14243f] outline-none">
                  <option>Attendance Rate</option>
                  <option>Mastery</option>
                  <option>Name</option>
                </select>
                <button
                  type="button"
                  aria-label="Export"
                  className="grid size-8 place-items-center rounded-lg border border-[#e3ece9] bg-white hover:bg-[#f6f9f8]"
                >
                  <Download aria-hidden className="size-3.5" />
                </button>
              </div>
            </div>

            <div className="mt-3 overflow-x-auto rounded-xl bg-[#f6f9f8]">
              <table className="w-full min-w-[720px] text-left text-[10px]">
                <thead>
                  <tr className="text-[9px] font-bold text-[#1B2D54]/70">
                    <th className="px-4 py-2.5">Student Name</th>
                    <th className="px-3 py-2.5">Student ID</th>
                    <th className="px-3 py-2.5">Attendance</th>
                    <th className="px-3 py-2.5">Current Topic Mastery</th>
                    <th className="px-3 py-2.5">Status</th>
                    <th className="px-3 py-2.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((s) => {
                    const low = s.mastery < 70;
                    return (
                      <tr key={s.id} className="border-t border-[#e3ece9] bg-white">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={cn(
                                "relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full text-[10px] font-bold text-white",
                                s.avatar
                              )}
                            >
                              {s.photo ? (
                                <Image src={s.photo} alt={s.name} fill sizes="32px" className="object-cover" />
                              ) : (
                                s.name.split(" ").map((p) => p[0]).slice(0, 2).join("")
                              )}
                            </span>
                            <div className="leading-tight">
                              <p className="text-[11px] font-bold text-[#14243f]">{s.name}</p>
                              <p className="font-mono text-[9px] text-[#1B2D54]/55">{s.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 font-mono text-[#1B2D54]/55">{s.id}</td>
                        <td className={cn("px-3 py-3 font-bold", low ? "text-[#c62828]" : "text-[#14243f]")}>{s.attendance}</td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[#e3ece9]">
                              <div
                                className={cn("h-full rounded-full", low ? "bg-[#c62828]" : "bg-[#0b6b70]")}
                                style={{ width: `${s.mastery}%` }}
                              />
                            </div>
                            <span className={cn("font-bold", low ? "text-[#c62828]" : "text-[#0b6b70]")}>{s.mastery}%</span>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span className={cn("rounded-full px-2.5 py-1 text-[9px] font-bold", STATUS_STYLE[s.status])}>
                            {s.status}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <button
                            type="button"
                            className="rounded-lg bg-[#eef0f2] px-3 py-1.5 text-[10px] font-bold text-[#14243f] transition-colors hover:bg-[#e1e5e8]"
                          >
                            Details →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-[#1B2D54]/60">
                        No students match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px]">
              <p className="font-medium text-[#1B2D54]/70">Showing {rows.length} of 28 enrolled students in Grade 9A</p>
              <div className="flex items-center gap-1">
                <button type="button" className="rounded-md border border-[#e3ece9] bg-white px-2.5 py-1">Previous</button>
                <button type="button" className="rounded-md bg-[#14757d] px-2.5 py-1 font-semibold text-white">1</button>
                <button type="button" className="rounded-md border border-[#e3ece9] bg-white px-2.5 py-1">2</button>
                <button type="button" className="rounded-md border border-[#e3ece9] bg-white px-2.5 py-1">Next</button>
              </div>
            </div>
          </div>
        ) : (
          <p className="p-8 text-center text-[11px] text-[#1B2D54]/60">This tab is coming soon.</p>
        )}
      </Card>
      <div className="grid gap-3 md:grid-cols-3">
        {QUICK_LINKS.map(({ title, note, icon: Icon, trailing: Trailing }) => (
          <button
            key={title}
            type="button"
            className="flex items-center gap-3 rounded-2xl border border-[#e3ece9] bg-white p-3 text-start shadow-sm transition-colors hover:bg-[#f6f9f8]"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#c9efe9] text-[#14757d]">
              <Icon aria-hidden className="size-4" />
            </span>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block text-[11px] font-semibold">{title}</span>
              <span className="block truncate text-[9px] text-[#1B2D54]/60">{note}</span>
            </span>
            <Trailing aria-hidden className="size-3.5 shrink-0 text-[#1B2D54]/60" />
          </button>
        ))}
      </div>
    </div>
  );
}