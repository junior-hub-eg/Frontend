import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  Calendar,
  CheckCircle2,
  ListChecks,
  MoreHorizontal,
  Plane,
  Plus,
  Star,
  Target,
  Timer,
  Trophy,
} from "lucide-react";

const IMG = "/images/Intern";
const BG = `${IMG}/bg-park.png`;

const MEMBERS = [
  { name: "Mohammed Yasser", role: "UI/UX Designer", avatar: `${IMG}/char-boy-glasses.png`, bg: "#ffc531" },
  { name: "Mohammed Yasser", role: "UI/UX Designer", avatar: `${IMG}/char-girl.png`, bg: "#ff9a62" },
  { name: "Mohammed Yasser", role: "UI/UX Designer", avatar: `${IMG}/char-boy-glasses-2.png`, bg: "#5aa9e6" },
  { name: "Mohammed Yasser", role: "UI/UX Designer", avatar: `${IMG}/char-girl.png`, bg: "#3fc9b0" },
];

const STATS = [
  { label: "Total Tasks", value: "8", icon: ListChecks, color: "#4a9df8", bg: "#eaf4fe" },
  { label: "Completed", value: "5", icon: CheckCircle2, color: "#2fb36b", bg: "#e6f6ee" },
  { label: "Remaining", value: "8", icon: Timer, color: "#ef5b5b", bg: "#fdecec" },
  { label: "Story Points", value: "1200", icon: Star, color: "#f5a623", bg: "#fff6dc" },
];

type Task = { title: string; tag: string; tagBg: string; tagText: string; points: string; mine?: boolean };
type Column = {
  title: string;
  count: number;
  bg: string;
  dot: string;
  add: string;
  tasks: Task[];
};

const TASKS: Task[] = [
  { title: "Implement API intgeration", tag: "Backend", tagBg: "#fbd5d5", tagText: "#b83232", points: "3 pts" },
  { title: "Design user authentication flow", tag: "Prompted", tagBg: "#ffdcc8", tagText: "#c2571a", points: "5 pts" },
  { title: "Set up database schema", tag: "UI/UX", tagBg: "#fbd5d5", tagText: "#b83232", points: "4 pts" },
];

const COLUMNS: Column[] = [
  { title: "To Do", count: 2, bg: "#eceef3", dot: "#64748b", add: "#14365a", tasks: TASKS },
  {
    title: "Review",
    count: 2,
    bg: "#ffefd9",
    dot: "#ff9a1f",
    add: "#f08a00",
    tasks: [{ ...TASKS[0], mine: true }, TASKS[2], TASKS[2]],
  },
  { title: "Done", count: 2, bg: "#d8f0df", dot: "#2fb36b", add: "#2fb36b", tasks: TASKS },
  { title: "Done", count: 2, bg: "#d8f0df", dot: "#2fb36b", add: "#2fb36b", tasks: TASKS },
];

const SQUADS = [
  { rank: 1, name: "Pixel Pirates", xp: 875, color: "#b07fd6", hl: true },
  { rank: 2, name: "Debug Divas", xp: 920, color: "#3b9cf5" },
  { rank: 3, name: "Syntax Sorcerers", xp: 890, color: "#52d6b0" },
  { rank: 4, name: "Loop Legends", xp: 940, color: "#7fe8d6", hl: true },
  { rank: 5, name: "Array Avengers", xp: 865, color: "#3b9cf5", hl: true },
  { rank: 6, name: "Binary Brawlers", xp: 915, color: "#a31818" },
  { rank: 7, name: "Function Fanatics", xp: 930, color: "#f9a8b8" },
];

const MAX_XP = 1000;

const glass = "rounded-[1.6em] border border-white/80 bg-white/40 shadow-lg shadow-[#14365a]/10 backdrop-blur-md";
const solid = "rounded-[1.6em] border border-white bg-white shadow-lg shadow-[#14365a]/10";

function TeamCard() {
  return (
    <section className="flex min-w-0 flex-col gap-[0.8em]">
      <div className={`${glass} flex items-center gap-[1em] p-[1em]`}>
        <span className="grid h-[4.6em] w-[4.6em] shrink-0 place-items-center rounded-[1em] bg-gradient-to-br from-[#d4f6f3] to-[#b4e8f2] text-[#12939b]">
          <BrainCircuit className="h-[2.6em] w-[2.6em]" />
        </span>
        <div className="min-w-0">
          <h1 className="flex flex-wrap items-center gap-[0.5em] text-[2.1em] font-extrabold leading-tight text-[#14365a]">
            Code Hunters Team
            <span className="flex items-center gap-[0.3em] rounded-full bg-[#d7f5e4] px-[0.6em] py-[0.15em] text-[0.38em] font-bold text-[#1f9d5b]">
              <span className="h-[0.7em] w-[0.7em] rounded-full bg-[#2fb36b]" /> Active
            </span>
          </h1>
          <p className="text-[1.25em] font-bold text-[#14365a]">Wedding Website an mobile app</p>
          <p className="mt-[0.2em] text-[0.8em] text-[#14365a]/75">
            Junior Hub is not just a course library. It&apos;s a complete learning opportunities in the tech world.
          </p>
        </div>
      </div>

      <div className={`${solid} min-w-0 p-[1em]`}>
        <ul className="flex items-center gap-[1.2em] overflow-x-auto pb-[0.2em]">
          {MEMBERS.map((m, i) => (
            <li key={i} className="flex w-[9em] shrink-0 flex-col items-center text-center">
              <span
                className="relative h-[5.2em] w-[5.2em] overflow-hidden rounded-full shadow-md ring-[0.25em] ring-white"
                style={{ backgroundColor: m.bg }}
              >
                <Image src={m.avatar} alt="" fill sizes="96px" className="origin-top scale-[2.1] object-cover object-top" />
              </span>
              <span className="mt-[0.5em] text-[0.95em] font-bold text-[#14365a]">{m.name}</span>
              <span className="text-[0.75em] text-[#14365a]/60">{m.role}</span>
            </li>
          ))}
          <li className="flex shrink-0 flex-col items-center">
            <button
              type="button"
              aria-label="Add members"
              className="grid h-[5.2em] w-[5.2em] place-items-center rounded-[1.2em] bg-[#e8f1fb] text-[#14365a] hover:bg-[#d9e8f8]"
            >
              <Plus className="h-[1.8em] w-[1.8em]" />
            </button>
            <span className="mt-[0.5em] text-[0.7em] text-[#14365a]/60">Add Members</span>
          </li>
        </ul>
      </div>
    </section>
  );
}

function SprintCard() {
  const percent = 60.2;
  return (
    <section className={`${solid} min-w-0 p-[1.1em]`}>
      <div className="flex flex-wrap items-start gap-[1em]">
        <span className="grid h-[3.4em] w-[3.4em] place-items-center rounded-[0.9em] bg-[#d6f3f0] text-[#12939b]">
          <Target className="h-[1.8em] w-[1.8em]" />
        </span>
        <div>
          <h2 className="text-[1.7em] font-extrabold leading-tight text-[#14365a]">Sprint 04</h2>
          <p className="text-[0.8em] text-[#14365a]/60">sep 21 - sep 27, 2026</p>
        </div>
        <div className="ml-auto text-right">
          <span className="inline-flex items-center gap-[0.4em] rounded-[0.6em] bg-[#eef2f7] px-[0.7em] py-[0.25em] text-[0.75em] text-[#14365a]/70">
            <Calendar className="h-[1em] w-[1em]" /> 8 days left
          </span>
          <p className="mt-[0.2em] text-[2em] font-extrabold leading-none text-[#14365a]">{percent}%</p>
          <p className="mt-[0.2em] text-[0.75em] text-[#14365a]/70">5 of 8 tasks done</p>
        </div>
      </div>

      <div className="mt-[0.6em] h-[0.9em] overflow-hidden rounded-full bg-[#cfeee9]">
        <div className="h-full rounded-full bg-[#138a8a]" style={{ width: `${percent}%` }} />
      </div>

      <ul className="mt-[0.9em] grid grid-cols-2 gap-[0.7em] sm:grid-cols-4">
        {STATS.map((s) => (
          <li key={s.label} className="flex items-center gap-[0.7em] rounded-[1em] p-[0.7em]" style={{ backgroundColor: s.bg }}>
            <span
              className="grid h-[2.4em] w-[2.4em] shrink-0 place-items-center rounded-[0.6em]"
              style={{ backgroundColor: `${s.color}26`, color: s.color }}
            >
              <s.icon className="h-[1.2em] w-[1.2em]" />
            </span>
            <span className="leading-tight">
              <span className="block text-[0.75em] text-[#14365a]/70">{s.label}</span>
              <span className="block text-[1.05em] font-bold text-[#14365a]">{s.value}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function TaskBoard() {
  return (
    <section className={`${solid} min-w-0 p-[1.1em]`}>
      <div className="mb-[0.9em] flex items-center">
        <h2 className="flex items-center gap-[0.5em] text-[1.5em] font-extrabold text-[#14365a]">
          <svg className="h-[1em] w-[1em]" viewBox="0 0 24 24" fill="#14365a" aria-hidden="true">
            <rect x="3" y="3" width="8" height="10" rx="2" />
            <rect x="13" y="3" width="8" height="6" rx="2" />
            <rect x="3" y="15" width="8" height="6" rx="2" />
            <rect x="13" y="11" width="8" height="10" rx="2" />
          </svg>
          Task Board
        </h2>
        <div className="ml-auto flex gap-[0.4em]">
          <span className="grid h-[1.6em] w-[1.6em] place-items-center rounded-[0.4em] bg-[#14365a] text-white">
            <ArrowLeft className="h-[1em] w-[1em]" />
          </span>
          <span className="grid h-[1.6em] w-[1.6em] place-items-center rounded-[0.4em] bg-[#14365a] text-white">
            <ArrowRight className="h-[1em] w-[1em]" />
          </span>
        </div>
      </div>

      <div className="flex gap-[1em] overflow-x-auto pb-[0.4em]">
        {COLUMNS.map((col, ci) => (
          <div key={ci} className="w-[17em] shrink-0 rounded-[1.1em] p-[0.8em]" style={{ backgroundColor: col.bg }}>
            <div className="mb-[0.7em] flex items-center gap-[0.5em] text-[0.95em] font-bold text-[#14365a]">
              <span className="h-[0.7em] w-[0.7em] rounded-full" style={{ backgroundColor: col.dot }} />
              {col.title}
              <span className="rounded-full bg-white/70 px-[0.5em] text-[0.75em] font-semibold text-[#14365a]/70">
                {col.count}
              </span>
              <Plus className="ml-auto h-[1.2em] w-[1.2em] text-[#14365a]/70" />
            </div>

            <ul className="grid gap-[0.6em]">
              {col.tasks.map((t, ti) => (
                <li
                  key={ti}
                  className={`rounded-[0.9em] bg-white p-[0.7em] shadow-sm ${
                    t.mine ? "border-l-[0.3em] border-l-[#ff9a1f]" : ""
                  }`}
                >
                  <p className="text-[0.85em] font-semibold text-[#14365a]">{t.title}</p>
                  <div className="mt-[0.5em] flex flex-wrap items-center gap-[0.4em]">
                    <span className="relative h-[1.9em] w-[1.9em] shrink-0 overflow-hidden rounded-full bg-[#ffc531] ring-2 ring-white">
                      <Image
                        src={`${IMG}/char-boy-glasses.png`}
                        alt=""
                        fill
                        sizes="32px"
                        className="origin-top scale-[2.1] object-cover object-top"
                      />
                    </span>
                    <span
                      className="rounded-[0.4em] px-[0.6em] py-[0.15em] text-[0.65em] font-bold"
                      style={{ backgroundColor: t.tagBg, color: t.tagText }}
                    >
                      {t.tag}
                    </span>
                    <span className="text-[0.65em] text-[#14365a]/60">{t.points}</span>
                    {t.mine && (
                      <span className="rounded-[0.4em] bg-[#d7f5e4] px-[0.6em] py-[0.15em] text-[0.6em] font-semibold text-[#1f9d5b]">
                        assigned to you
                      </span>
                    )}
                    <MoreHorizontal className="ml-auto h-[1.1em] w-[1.1em] text-[#14365a]/50" />
                  </div>
                </li>
              ))}
            </ul>

            <button
              type="button"
              className="mt-[0.7em] flex w-full items-center justify-center gap-[0.3em] text-[0.85em] font-semibold"
              style={{ color: col.add }}
            >
              <Plus className="h-[1.1em] w-[1.1em]" /> Add Task
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function Leaderboard() {
  return (
    <section className={`${solid} min-w-0 p-[1.1em]`}>
      <div className="flex items-center gap-[0.7em]">
        <Trophy className="h-[1.8em] w-[1.8em] shrink-0 text-[#f5a623]" />
        <div className="leading-tight">
          <h2 className="text-[1.2em] font-extrabold text-[#14365a]">Squad Leaderboard</h2>
          <p className="text-[0.75em] text-[#14365a]/60">Top 5 squads this Sprint</p>
        </div>
        <span className="ml-auto flex items-center gap-[0.4em] rounded-full bg-[#d7f5e4] px-[0.8em] py-[0.2em] text-[0.7em] font-bold text-[#1f9d5b]">
          <span className="h-[0.6em] w-[0.6em] rounded-full bg-[#2fb36b]" /> Live
        </span>
      </div>

      <ol className="mt-[1em] grid gap-[0.9em]">
        {SQUADS.map((s) => (
          <li key={s.rank} className="flex items-center gap-[0.7em]">
            <span
              className={`grid h-[2.2em] w-[2.2em] shrink-0 place-items-center rounded-full text-[0.85em] font-bold text-[#14365a] ${
                s.rank === 1
                  ? "bg-[#ffd66b] ring-[0.25em] ring-[#ffe9a8]"
                  : s.hl
                    ? "bg-[#ff9a1f] ring-[0.25em] ring-[#ffd9a3]"
                    : "bg-[#e1e4ea]"
              }`}
            >
              {s.rank}
            </span>
            <span
              className="grid h-[2.7em] w-[2.7em] shrink-0 place-items-center rounded-[0.7em] text-white"
              style={{ backgroundColor: s.color }}
              aria-hidden="true"
            >
              <Plane className="h-[1.4em] w-[1.4em]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.85em] font-semibold text-[#14365a]">{s.name}</p>
              <div className="mt-[0.3em] h-[0.45em] rounded-full bg-[#dde6ee]">
                <div className="h-full rounded-full bg-[#14365a]" style={{ width: `${(s.xp / MAX_XP) * 100}%` }} />
              </div>
            </div>
            <span className="text-[0.85em] font-bold text-[#14365a]">{s.xp} XP</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function InternshipProgress() {
  return (
    <div className="relative -ml-[4rem] min-h-[calc(100svh-5rem)] min-w-0 flex-1 lg:absolute lg:inset-0 lg:ml-0 lg:min-h-0">
      {/* Background: on mobile it only covers the top and fades out, on desktop it fills the frame */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[75svh] [mask-image:linear-gradient(to_bottom,black_70%,transparent)] lg:h-full lg:[mask-image:none]"
      >
        <Image src={BG} alt="" fill priority sizes="100vw" className="object-cover object-[50%_40%]" />
      </div>

      {/* Scrolls on desktop (content starts under the header, next to the sidebar) */}
      <div
        className="relative min-w-0 pb-8 pl-[4.75rem] pr-3 pt-2 sm:pr-4 lg:absolute lg:inset-0 lg:overflow-y-auto lg:pb-[calc(var(--u)*2)] lg:pl-[var(--hl)] lg:pr-[calc(var(--u)*1.6)] lg:pt-[calc(var(--u)*8.5)]"
        style={{ fontSize: "clamp(12px, calc(var(--u) * 1.05), 17px)" }}
      >
        <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-[1em] lg:grid-cols-[minmax(0,1fr)_calc(var(--u)*27)] lg:grid-rows-[auto_1fr]">
          {/* Internship pod: first on mobile, top-right on desktop */}
          <div className="order-1 min-w-0 lg:order-none lg:col-start-2 lg:row-start-1">
            <Image
              src={`${IMG}/building-internship.png`}
              alt="Internship"
              width={535}
              height={388}
              sizes="(max-width: 1024px) 80vw, 30vw"
              className="mx-auto h-auto w-full max-w-[18em] drop-shadow-[0_18px_22px_rgba(13,43,90,0.25)] sm:max-w-[22em] lg:-mb-[0.5em] lg:max-w-[26em]"
            />
          </div>

          {/* Team, sprint, task board */}
          <div className="order-2 flex min-w-0 flex-col gap-[1em] lg:order-none lg:col-start-1 lg:row-span-2 lg:row-start-1">
            <TeamCard />
            <SprintCard />
            <TaskBoard />
          </div>

          {/* Leaderboard: last on mobile, under the pod on desktop */}
          <div className="order-3 min-w-0 lg:order-none lg:col-start-2 lg:row-start-2">
            <Leaderboard />
          </div>
        </div>
      </div>
    </div>
  );
}