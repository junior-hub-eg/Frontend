"use client";

import { useState } from "react";
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
import { errorMessage } from "@/lib/api-client";
import {
  moveTask,
  type Leaderboard as LeaderboardData,
  type Squad,
  type SquadTask,
  type Sprint,
  type TaskBoard as TaskBoardData,
  type TaskStatus,
} from "@/lib/interns-api";
import { avatarFor, memberIndex, ROLE_TITLE, ROLE_TAG, useInterns } from "./interns-data";

const IMG = "/images/Intern";
const BG = `${IMG}/bg-park.png`;

const STATS = [
  { key: "total", label: "Total Tasks", icon: ListChecks, color: "#4a9df8", bg: "#eaf4fe" },
  { key: "done", label: "Completed", icon: CheckCircle2, color: "#2fb36b", bg: "#e6f6ee" },
  { key: "left", label: "Remining", icon: Timer, color: "#ef5b5b", bg: "#fdecec" },
  { key: "points", label: "Story Points", icon: Star, color: "#f5a623", bg: "#fff6dc" },
] as const;

const COLUMN_STYLE: Record<TaskStatus, { title: string; bg: string; dot: string; add: string }> = {
  ToDo: { title: "To Do", bg: "#eceef3", dot: "#64748b", add: "#14365a" },
  InProgress: { title: "In Progress", bg: "#dcecfb", dot: "#3b82f6", add: "#2f7fd6" },
  Review: { title: "Review", bg: "#ffefd9", dot: "#ff9a1f", add: "#f08a00" },
  Done: { title: "Done", bg: "#d8f0df", dot: "#2fb36b", add: "#2fb36b" },
};

const ORDER: TaskStatus[] = ["ToDo", "InProgress", "Review", "Done"];

const SQUAD_COLORS = ["#b07fd6", "#3b9cf5", "#52d6b0", "#7fe8d6", "#3b9cf5", "#a31818", "#f9a8b8"];

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** "sep 21 - sep 27, 2026", like the Figma. */
function sprintDates(start: string, end: string) {
  const [, sm, sd] = start.split("-").map(Number);
  const [ey, em, ed] = end.split("-").map(Number);
  return `${MONTHS[sm - 1]} ${sd} - ${MONTHS[em - 1]} ${ed}, ${ey}`;
}

const glass = "rounded-[1.6em] border border-white/80 bg-white/40 shadow-lg shadow-[#14365a]/10 backdrop-blur-md";
const solid = "rounded-[1.6em] border border-white bg-white shadow-lg shadow-[#14365a]/10";

function TeamCard({ squad }: { squad: Squad | null }) {
  return (
    <section className="flex min-w-0 flex-col gap-[0.8em]">
      <div className={`${glass} flex items-center gap-[1em] p-[1em]`}>
        <span className="grid h-[4.6em] w-[4.6em] shrink-0 place-items-center rounded-[1em] bg-gradient-to-br from-[#d4f6f3] to-[#b4e8f2] text-[#12939b]">
          <BrainCircuit className="h-[2.6em] w-[2.6em]" />
        </span>
        <div className="min-w-0">
          <h1 className="flex flex-wrap items-center gap-[0.5em] text-[2.1em] font-extrabold leading-tight text-[#14365a]">
            {squad ? `${squad.name} Team` : "\u00a0"}
            <span className="flex items-center gap-[0.3em] rounded-full bg-[#d7f5e4] px-[0.6em] py-[0.15em] text-[0.38em] font-bold text-[#1f9d5b]">
              <span className="h-[0.7em] w-[0.7em] rounded-full bg-[#2fb36b]" /> Active
            </span>
          </h1>
          <p className="text-[1.25em] font-bold text-[#14365a]">{squad?.projectTitle}</p>
          <p className="mt-[0.2em] text-[0.8em] text-[#14365a]/75">
            {squad?.projectDescription}
          </p>
        </div>
      </div>

      <div className={`${solid} min-w-0 p-[1em]`}>
        <ul className="flex items-center gap-[1.2em] overflow-x-auto pb-[0.2em]">
          {squad?.members.map((m, i) => {
            const avatar = avatarFor(m.photoUrl, i);
            return (
              <li key={m.studentId} className="flex min-w-[9em] shrink-0 flex-col items-center text-center">
                <span
                  className="relative h-[5.2em] w-[5.2em] overflow-hidden rounded-full shadow-md ring-[0.25em] ring-white"
                  style={{ backgroundColor: avatar.bg }}
                >
                  <Image src={avatar.src} alt="" fill sizes="96px" className="origin-top scale-[2.1] object-cover object-top" />
                </span>
                <span className="mt-[0.5em] whitespace-nowrap text-[0.95em] font-bold text-[#14365a]">{m.fullName}</span>
                <span className="text-[0.75em] text-[#14365a]/60">{ROLE_TITLE[m.role]}</span>
              </li>
            );
          })}
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

function SprintCard({ sprint }: { sprint: Sprint | null }) {
  const percent = sprint?.progressPercent ?? 0;
  const values = {
    total: sprint?.tasksTotal,
    done: sprint?.tasksDone,
    left: sprint ? sprint.tasksTotal - sprint.tasksDone : undefined,
    points: sprint?.storyPointsTotal,
  };
  return (
    <section className={`${solid} min-w-0 p-[1.1em]`}>
      <div className="flex flex-wrap items-start gap-[1em]">
        <span className="grid h-[3.4em] w-[3.4em] place-items-center rounded-[0.9em] bg-[#d6f3f0] text-[#12939b]">
          <Target className="h-[1.8em] w-[1.8em]" />
        </span>
        <div>
          <h2 className="text-[1.7em] font-extrabold leading-tight text-[#14365a]">{sprint?.name ?? "\u00a0"}</h2>
          <p className="text-[0.8em] text-[#14365a]/60">{sprint ? sprintDates(sprint.startDate, sprint.endDate) : "\u00a0"}</p>
        </div>
        <div className="ml-auto text-right">
          <span className="inline-flex items-center gap-[0.4em] rounded-[0.6em] bg-[#eef2f7] px-[0.7em] py-[0.25em] text-[0.75em] text-[#14365a]/70">
            <Calendar className="h-[1em] w-[1em]" /> {sprint?.daysLeft ?? 0} {sprint?.daysLeft === 1 ? "day" : "days"} left
          </span>
          <p className="mt-[0.2em] text-[2em] font-extrabold leading-none text-[#14365a]">{percent}%</p>
          <p className="mt-[0.2em] text-[0.75em] text-[#14365a]/70">
            {sprint?.tasksDone ?? 0} of {sprint?.tasksTotal ?? 0} tasks done
          </p>
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
              <span className="block text-[1.05em] font-bold text-[#14365a]">{values[s.key] ?? "–"}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function TaskCard({ task, avatarIndex, onMove }: { task: SquadTask; avatarIndex: number; onMove: (task: SquadTask, to: TaskStatus) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const at = ORDER.indexOf(task.status);
  const moves = [ORDER[at - 1], ORDER[at + 1]].filter(Boolean);
  const tag = task.assignee ? ROLE_TAG[task.assignee.role] : null;
  const avatar = task.assignee ? avatarFor(task.assignee.photoUrl, avatarIndex) : null;

  return (
    <li
      className={`relative rounded-[0.9em] bg-white p-[0.7em] shadow-sm ${
        task.isMine && task.status === "Review" ? "border-l-[0.3em] border-l-[#ff9a1f]" : ""
      }`}
    >
      <p className="text-[0.85em] font-semibold text-[#14365a]">{task.title}</p>
      <div className="mt-[0.5em] flex flex-wrap items-center gap-[0.4em]">
        {avatar && (
          <span
            className="relative h-[1.9em] w-[1.9em] shrink-0 overflow-hidden rounded-full ring-2 ring-white"
            style={{ backgroundColor: avatar.bg }}
            title={task.assignee?.firstName}
          >
            <Image src={avatar.src} alt="" fill sizes="32px" className="origin-top scale-[2.1] object-cover object-top" />
          </span>
        )}
        {tag && (
          <span
            className="rounded-[0.4em] px-[0.6em] py-[0.15em] text-[0.65em] font-bold"
            style={{ backgroundColor: tag.bg, color: tag.text }}
          >
            {tag.label}
          </span>
        )}
        <span className="text-[0.65em] text-[#14365a]/60">{task.storyPoints} pts</span>
        {task.isMine && (
          <span className="rounded-[0.4em] bg-[#d7f5e4] px-[0.6em] py-[0.15em] text-[0.6em] font-semibold text-[#1f9d5b]">
            Assigned to you
          </span>
        )}
        {task.isMine ? (
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={`Move ${task.title}`}
            aria-expanded={menuOpen}
            className="ml-auto rounded-[0.4em] text-[#14365a]/50 hover:text-[#14365a]"
          >
            <MoreHorizontal className="h-[1.1em] w-[1.1em]" />
          </button>
        ) : (
          <MoreHorizontal className="ml-auto h-[1.1em] w-[1.1em] text-[#14365a]/30" aria-hidden="true" />
        )}
      </div>

      {menuOpen && (
        <div className="absolute right-[0.5em] top-full z-20 mt-[0.2em] w-[11em] rounded-[0.7em] border border-[#14365a]/10 bg-white p-[0.3em] shadow-lg">
          {moves.map((to) => (
            <button
              key={to}
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onMove(task, to);
              }}
              className="w-full rounded-[0.5em] px-[0.6em] py-[0.4em] text-left text-[0.75em] font-semibold text-[#14365a] hover:bg-[#eef2f7]"
            >
              Move to {COLUMN_STYLE[to].title}
            </button>
          ))}
        </div>
      )}
    </li>
  );
}

function TaskBoard({
  board,
  members,
  onMove,
  message,
}: {
  board: TaskBoardData | null;
  members: Map<string, number>;
  onMove: (task: SquadTask, to: TaskStatus) => void;
  message: string | null;
}) {
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

      {message && (
        <p role="status" className="mb-[0.8em] rounded-[0.7em] bg-[#fdecec] px-[0.8em] py-[0.5em] text-[0.8em] font-semibold text-[#b83232]">
          {message}
        </p>
      )}

      <div className="flex gap-[1em] overflow-x-auto pb-[0.4em]">
        {(board?.columns ?? ORDER.map((status) => ({ status, tasks: [] }))).map((col) => {
          const style = COLUMN_STYLE[col.status];
          return (
            <div key={col.status} className="w-[17em] shrink-0 rounded-[1.1em] p-[0.8em]" style={{ backgroundColor: style.bg }}>
              <div className="mb-[0.7em] flex items-center gap-[0.5em] text-[0.95em] font-bold text-[#14365a]">
                <span className="h-[0.7em] w-[0.7em] rounded-full" style={{ backgroundColor: style.dot }} />
                {style.title}
                <span className="rounded-full bg-white/70 px-[0.5em] text-[0.75em] font-semibold text-[#14365a]/70">
                  {col.tasks.length}
                </span>
                <Plus className="ml-auto h-[1.2em] w-[1.2em] text-[#14365a]/70" />
              </div>

              <ul className="grid gap-[0.6em]">
                {col.tasks.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    avatarIndex={(t.assignee && members.get(t.assignee.studentId)) ?? 0}
                    onMove={onMove}
                  />
                ))}
              </ul>

              <button
                type="button"
                className="mt-[0.7em] flex w-full items-center justify-center gap-[0.3em] text-[0.85em] font-semibold"
                style={{ color: style.add }}
              >
                <Plus className="h-[1.1em] w-[1.1em]" /> Add Task
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Leaderboard({ data }: { data: LeaderboardData | null }) {
  const rows = data ? [...data.top, ...(data.mine ? [data.mine] : [])] : [];
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
        {rows.map((s, i) => (
          <li
            key={s.squadId}
            className={`flex items-center gap-[0.7em] ${s.isMine ? "-mx-[0.4em] rounded-[0.8em] bg-[#eaf4fe] px-[0.4em] py-[0.2em]" : ""}`}
          >
            <span
              className={`grid h-[2.2em] w-[2.2em] shrink-0 place-items-center rounded-full text-[0.85em] font-bold text-[#14365a] ${
                s.rank === 1
                  ? "bg-[#ffd66b] ring-[0.25em] ring-[#ffe9a8]"
                  : s.rank <= 3
                    ? "bg-[#ff9a1f] ring-[0.25em] ring-[#ffd9a3]"
                    : "bg-[#e1e4ea]"
              }`}
            >
              {s.rank}
            </span>
            <span
              className="grid h-[2.7em] w-[2.7em] shrink-0 place-items-center rounded-[0.7em] text-white"
              style={{ backgroundColor: SQUAD_COLORS[i % SQUAD_COLORS.length] }}
              aria-hidden="true"
            >
              <Plane className="h-[1.4em] w-[1.4em]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.85em] font-semibold text-[#14365a]">{s.name}</p>
              <div className="mt-[0.3em] h-[0.45em] rounded-full bg-[#dde6ee]">
                <div className="h-full rounded-full bg-[#14365a]" style={{ width: `${s.progressPercent}%` }} />
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
  const { squad, sprint, board, leaderboard, error, reload } = useInterns();
  const [moveError, setMoveError] = useState<string | null>(null);

  async function handleMove(task: SquadTask, to: TaskStatus) {
    setMoveError(null);
    try {
      await moveTask(task.id, to);
      await reload();
    } catch (e) {
      setMoveError(errorMessage(e, "We couldn't move this task. Please try again."));
    }
  }

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
            {error && (
              <p role="alert" className={`${glass} p-[1em] text-[0.95em] font-semibold text-[#14365a]`}>
                {error}
              </p>
            )}
            <TeamCard squad={squad} />
            <SprintCard sprint={sprint} />
            <TaskBoard board={board} members={memberIndex(squad)} onMove={handleMove} message={moveError} />
          </div>

          {/* Leaderboard: last on mobile, under the pod on desktop */}
          <div className="order-3 min-w-0 lg:order-none lg:col-start-2 lg:row-start-2">
            <Leaderboard data={leaderboard} />
          </div>
        </div>
      </div>
    </div>
  );
}