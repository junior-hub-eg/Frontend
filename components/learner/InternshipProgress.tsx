"use client";

import { useEffect, useState, type DragEvent } from "react";
import Image from "next/image";
import Link from "next/link";
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
  createTask,
  getSquadLinks,
  moveTask,
  type SquadLinks,
  type Leaderboard as LeaderboardData,
  type Squad,
  type SquadTask,
  type Sprint,
  type TaskBoard as TaskBoardData,
  type TaskStatus,
} from "@/lib/interns-api";
import { mentorAvatar } from "@/lib/avatars";
import { avatarFor, memberIndex, ROLE_TITLE, ROLE_TAG, useInterns } from "./interns-data";
import { LinkChips, MyLinksEditor } from "./work-links";
import { ProjectSubmitCard } from "./ProjectSubmitCard";
import { useT } from "@/lib/i18n/client";
import { currentLocale, tk } from "@/lib/i18n/translate";
import RedirectToSquad, { SQUAD_PAGE } from "./RedirectToSquad";
import { TeamChatButton, TeamChatPanel, useTeamChat, type ChatKey } from "./TeamChat";
import { useT } from "@/lib/i18n/client";

const IMG = "/images/Intern";
const BG = `${IMG}/bg-park.png`;

const STATS = [
  { key: "total", label: tk("Total Tasks"), icon: ListChecks, color: "#4a9df8", bg: "#eaf4fe" },
  { key: "done", label: tk("Completed"), icon: CheckCircle2, color: "#2fb36b", bg: "#e6f6ee" },
  { key: "left", label: tk("Remaining"), icon: Timer, color: "#ef5b5b", bg: "#fdecec" },
  { key: "points", label: tk("Story Points"), icon: Star, color: "#f5a623", bg: "#fff6dc" },
] as const;

const COLUMN_STYLE: Record<TaskStatus, { title: string; bg: string; dot: string; add: string }> = {
  ToDo: { title: tk("To Do"), bg: "#eceef3", dot: "#64748b", add: "#14365a" },
  InProgress: { title: tk("In Progress"), bg: "#dcecfb", dot: "#3b82f6", add: "#2f7fd6" },
  Review: { title: tk("Review"), bg: "#ffefd9", dot: "#ff9a1f", add: "#f08a00" },
  Done: { title: tk("Done"), bg: "#d8f0df", dot: "#2fb36b", add: "#2fb36b" },
};

const ORDER: TaskStatus[] = ["ToDo", "InProgress", "Review", "Done"];

const SQUAD_COLORS = ["#b07fd6", "#3b9cf5", "#52d6b0", "#7fe8d6", "#3b9cf5", "#a31818", "#f9a8b8"];

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const MONTHS_AR = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

/** "sep 21 - sep 27, 2026", like the Figma ("21 سبتمبر - 27 سبتمبر 2026" in Arabic). */
function sprintDates(start: string, end: string) {
  const [, sm, sd] = start.split("-").map(Number);
  const [ey, em, ed] = end.split("-").map(Number);
  if (currentLocale() === "ar") return `${sd} ${MONTHS_AR[sm - 1]} - ${ed} ${MONTHS_AR[em - 1]} ${ey}`;
  return `${MONTHS[sm - 1]} ${sd} - ${MONTHS[em - 1]} ${ed}, ${ey}`;
}

const glass = "rounded-[1.6em] border border-white/80 bg-white/40 shadow-lg shadow-[#14365a]/10 backdrop-blur-md";
const solid = "rounded-[1.6em] border border-white bg-white shadow-lg shadow-[#14365a]/10";

/** Unread messages on a teammate's or the monitor's avatar. */
function AvatarBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -end-[0.2em] -top-[0.2em] z-10 grid h-[1.6em] min-w-[1.6em] place-items-center rounded-full bg-[#ef5b5b] px-[0.35em] text-[0.7em] font-bold text-white ring-2 ring-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

/**
 * The team: the squad's monitor, then the members. Clicking the monitor or a teammate opens a private chat with them
 * (decision of 22 Oct 2026); "Team chat" opens the list with the squad's group chat.
 */
function TeamCard({
  squad,
  unreadFor,
  unreadTotal,
  onChat,
}: {
  squad: Squad | null;
  unreadFor: (key: ChatKey) => number;
  unreadTotal: number;
  onChat: (key: ChatKey | undefined) => void;
}) {
  const t = useT();
  return (
    <section className="flex min-w-0 flex-col gap-[0.8em]">
      <div className={`${glass} flex items-center gap-[1em] p-[1em]`}>
        <span className="grid h-[4.6em] w-[4.6em] shrink-0 place-items-center rounded-[1em] bg-gradient-to-br from-[#d4f6f3] to-[#b4e8f2] text-[#12939b]">
          <BrainCircuit className="h-[2.6em] w-[2.6em]" />
        </span>
        <div className="min-w-0">
          <h1 className="flex flex-wrap items-center gap-[0.5em] text-[2.1em] font-extrabold leading-tight text-[#14365a]">
            {squad ? t("{name} Team", { name: squad.name }) : "\u00a0"}
            <span className="flex items-center gap-[0.3em] rounded-full bg-[#d7f5e4] px-[0.6em] py-[0.15em] text-[0.38em] font-bold text-[#1f9d5b]">
              <span className="h-[0.7em] w-[0.7em] rounded-full bg-[#2fb36b]" /> {t("Active")}
            </span>
          </h1>
          <p className="text-[1.25em] font-bold text-[#14365a]">{squad?.projectTitle}</p>
          <p className="mt-[0.2em] text-[0.8em] text-[#14365a]/75">
            {squad?.projectDescription}
          </p>
        </div>
        {squad && (
          <div className="ms-auto shrink-0 self-start">
            <TeamChatButton unread={unreadTotal} onClick={() => onChat(undefined)} />
          </div>
        )}
      </div>

      <div className={`${solid} min-w-0 p-[1em]`}>
        <ul className="flex items-center gap-[1.2em] overflow-x-auto pb-[0.2em]">
          {/* The project's monitor (a mentor picked for the squad), then the members. */}
          {squad?.monitor && (
            <li className="flex min-w-[9em] shrink-0 flex-col items-center border-e border-[#e3ebf3] pe-[1.2em] text-center">
              <button
                type="button"
                onClick={() => onChat(squad.monitor!.id)}
                aria-label={t("Chat with {name}", { name: squad.monitor.fullName })}
                title={t("Chat with {name}", { name: squad.monitor.fullName })}
                className="relative rounded-full transition-transform hover:scale-105"
              >
                <AvatarBadge count={unreadFor(squad.monitor.id)} />
                <span
                  className="relative block h-[5.2em] w-[5.2em] overflow-hidden rounded-full shadow-md ring-[0.25em] ring-[#12939b]"
                  style={{ backgroundColor: mentorAvatar(squad.monitor).bg }}
                >
                  <Image src={mentorAvatar(squad.monitor).src} alt="" fill sizes="96px" className="object-cover" />
                </span>
              </button>
              <span className="mt-[0.5em] whitespace-nowrap text-[0.95em] font-bold text-[#14365a]">{squad.monitor.fullName}</span>
              <span className="mt-[0.15em] rounded-full bg-[#e9f7f4] px-[0.7em] py-[0.1em] text-[0.7em] font-bold text-[#12939b]">{t("Monitor")}</span>
              <span className="mt-[0.15em] max-w-[11em] truncate text-[0.7em] text-[#14365a]/60">{t(squad.monitor.title)}</span>
            </li>
          )}
          {squad?.members.map((m, i) => {
            const avatar = avatarFor(m.photoUrl, i);
            return (
              <li key={m.studentId} className="flex min-w-[9em] shrink-0 flex-col items-center text-center">
                {m.isMe ? (
                  <span
                    className="relative h-[5.2em] w-[5.2em] overflow-hidden rounded-full shadow-md ring-[0.25em] ring-white"
                    style={{ backgroundColor: avatar.bg }}
                  >
                    <Image src={avatar.src} alt="" fill sizes="96px" className="object-cover" />
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onChat(m.studentId)}
                    aria-label={t("Chat with {name}", { name: m.fullName })}
                    title={t("Chat with {name}", { name: m.fullName })}
                    className="relative rounded-full transition-transform hover:scale-105"
                  >
                    <AvatarBadge count={unreadFor(m.studentId)} />
                    <span
                      className="relative block h-[5.2em] w-[5.2em] overflow-hidden rounded-full shadow-md ring-[0.25em] ring-white"
                      style={{ backgroundColor: avatar.bg }}
                    >
                      <Image src={avatar.src} alt="" fill sizes="96px" className="object-cover" />
                    </span>
                  </button>
                )}
                <span className="mt-[0.5em] whitespace-nowrap text-[0.95em] font-bold text-[#14365a]">{m.fullName}</span>
                <span className="text-[0.75em] text-[#14365a]/60">{t(ROLE_TITLE[m.role])}</span>
              </li>
            );
          })}
          <li className="flex shrink-0 flex-col items-center">
            <button
              type="button"
              aria-label={t("Add members")}
              className="grid h-[5.2em] w-[5.2em] place-items-center rounded-[1.2em] bg-[#e8f1fb] text-[#14365a] hover:bg-[#d9e8f8]"
            >
              <Plus className="h-[1.8em] w-[1.8em]" />
            </button>
            <span className="mt-[0.5em] text-[0.7em] text-[#14365a]/60">{t("Add Members")}</span>
          </li>
        </ul>
      </div>
    </section>
  );
}

function SprintCard({ sprint }: { sprint: Sprint | null }) {
  const t = useT();
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
        <div className="ms-auto text-end">
          <span className="inline-flex items-center gap-[0.4em] rounded-[0.6em] bg-[#eef2f7] px-[0.7em] py-[0.25em] text-[0.75em] text-[#14365a]/70">
            <Calendar className="h-[1em] w-[1em]" /> {sprint?.daysLeft === 1 ? t("1 day left") : t("{n} days left", { n: sprint?.daysLeft ?? 0 })}
          </span>
          <p className="mt-[0.2em] text-[2em] font-extrabold leading-none text-[#14365a]">{percent}%</p>
          <p className="mt-[0.2em] text-[0.75em] text-[#14365a]/70">
            {t("{n} of {total} tasks done", { n: sprint?.tasksDone ?? 0, total: sprint?.tasksTotal ?? 0 })}
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
              <span className="block text-[0.75em] text-[#14365a]/70">{t(s.label)}</span>
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
  const moves = BOARD_COLUMNS.filter((s) => s !== task.status);
  const tag = task.assignee ? ROLE_TAG[task.assignee.role] : null;
  const avatar = task.assignee ? avatarFor(task.assignee.photoUrl, avatarIndex) : null;

  return (
    <li
      draggable={task.isMine}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", task.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      className={`relative rounded-[0.9em] bg-white p-[0.7em] shadow-sm ${task.isMine ? "cursor-grab active:cursor-grabbing" : ""} ${
        task.isMine && task.status === "Review" ? "border-s-[0.3em] border-s-[#ff9a1f]" : ""
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
            <Image src={avatar.src} alt="" fill sizes="32px" className="object-cover" />
          </span>
        )}
        {tag && (
          <span
            className="rounded-[0.4em] px-[0.6em] py-[0.15em] text-[0.65em] font-bold"
            style={{ backgroundColor: tag.bg, color: tag.text }}
          >
            {t(tag.label)}
          </span>
        )}
        <span className="text-[0.65em] text-[#14365a]/60">{t("{n} pts", { n: task.storyPoints })}</span>
        {task.isMine && (
          <span className="rounded-[0.4em] bg-[#d7f5e4] px-[0.6em] py-[0.15em] text-[0.6em] font-semibold text-[#1f9d5b]">
            {t("Assigned to you")}
          </span>
        )}
        {task.isMine ? (
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={t("Move {title}", { title: task.title })}
            aria-expanded={menuOpen}
            className="ms-auto rounded-[0.4em] text-[#14365a]/50 hover:text-[#14365a]"
          >
            <MoreHorizontal className="h-[1.1em] w-[1.1em]" />
          </button>
        ) : (
          <MoreHorizontal className="ms-auto h-[1.1em] w-[1.1em] text-[#14365a]/30" aria-hidden="true" />
        )}
      </div>

      {menuOpen && (
        <div className="absolute end-[0.5em] top-full z-20 mt-[0.2em] w-[11em] rounded-[0.7em] border border-[#14365a]/10 bg-white p-[0.3em] shadow-lg">
          {moves.map((to) => (
            <button
              key={to}
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onMove(task, to);
              }}
              className="w-full rounded-[0.5em] px-[0.6em] py-[0.4em] text-start text-[0.75em] font-semibold text-[#14365a] hover:bg-[#eef2f7]"
            >
              {t("Move to {column}", { column: t(COLUMN_STYLE[to].title) })}
            </button>
          ))}
        </div>
      )}
    </li>
  );
}

/** "To Do" to "Review" to "Done"; In Progress shows only while a task is in it (older squads). */
const BOARD_COLUMNS: TaskStatus[] = ["ToDo", "Review", "Done"];

function AddTaskForm({ onAdd }: { onAdd: (title: string) => Promise<boolean> }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  if (!open)
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-[0.7em] flex w-full items-center justify-center gap-[0.3em] text-[0.85em] font-semibold text-[#14365a]"
      >
        <Plus className="h-[1.1em] w-[1.1em]" /> {t("Add Task")}
      </button>
    );
  return (
    <form
      className="mt-[0.7em] flex flex-col gap-[0.4em]"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        setSaving(true);
        if (await onAdd(title.trim())) {
          setTitle("");
          setOpen(false);
        }
        setSaving(false);
      }}
    >
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={200}
        placeholder={t("What will you do?")}
        aria-label={t("New task")}
        className="rounded-[0.7em] border border-[#14365a]/15 bg-white px-[0.7em] py-[0.5em] text-[0.85em] text-[#14365a] outline-none focus:ring-2 focus:ring-[#12939b]/30"
      />
      <div className="flex gap-[0.4em]">
        <button type="submit" disabled={saving || !title.trim()} className="rounded-[0.6em] bg-[#14365a] px-[0.9em] py-[0.35em] text-[0.8em] font-semibold text-white disabled:opacity-50">
          {saving ? t("Adding…") : t("Add")}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-[0.8em] font-semibold text-[#14365a]/70 hover:underline">
          {t("Cancel")}
        </button>
      </div>
    </form>
  );
}

function TaskBoard({
  board,
  members,
  onMove,
  onAdd,
  message,
}: {
  board: TaskBoardData | null;
  members: Map<string, number>;
  onMove: (task: SquadTask, to: TaskStatus) => void;
  onAdd: (title: string) => Promise<boolean>;
  message: string | null;
}) {
  const t = useT();
  const [over, setOver] = useState<TaskStatus | null>(null);
  const columns = (board?.columns ?? ORDER.map((status) => ({ status, tasks: [] as SquadTask[] }))).filter(
    (c) => BOARD_COLUMNS.includes(c.status) || c.tasks.length > 0,
  );
  const allTasks = columns.flatMap((c) => c.tasks);

  function drop(e: DragEvent, status: TaskStatus) {
    e.preventDefault();
    setOver(null);
    const task = allTasks.find((x) => x.id === e.dataTransfer.getData("text/plain"));
    if (task && task.status !== status) onMove(task, status);
  }

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
          {t("Task Board")}
        </h2>
        <div className="ms-auto flex gap-[0.4em]">
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
        {columns.map((col) => {
          const style = COLUMN_STYLE[col.status];
          return (
            <div
              key={col.status}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(col.status);
              }}
              onDragLeave={() => setOver((o) => (o === col.status ? null : o))}
              onDrop={(e) => drop(e, col.status)}
              className={`w-[17em] shrink-0 rounded-[1.1em] p-[0.8em] transition-shadow ${over === col.status ? "ring-2 ring-[#14365a]/40" : ""}`}
              style={{ backgroundColor: style.bg }}
            >
              <div className="mb-[0.7em] flex items-center gap-[0.5em] text-[0.95em] font-bold text-[#14365a]">
                <span className="h-[0.7em] w-[0.7em] rounded-full" style={{ backgroundColor: style.dot }} />
                {t(style.title)}
                <span className="rounded-full bg-white/70 px-[0.5em] text-[0.75em] font-semibold text-[#14365a]/70">
                  {col.tasks.length}
                </span>
              </div>

              <ul className="grid gap-[0.6em]">
                {col.tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    avatarIndex={(task.assignee && members.get(task.assignee.studentId)) ?? 0}
                    onMove={onMove}
                  />
                ))}
              </ul>

              {col.status === "ToDo" && <AddTaskForm onAdd={onAdd} />}
              {col.tasks.length === 0 && col.status !== "ToDo" && (
                <p className="py-[1em] text-center text-[0.75em] text-[#14365a]/55">{t("Drag your tasks here")}</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Leaderboard({ data }: { data: LeaderboardData | null }) {
  const t = useT();
  const rows = data ? [...data.top, ...(data.mine ? [data.mine] : [])] : [];
  return (
    <section className={`${solid} min-w-0 p-[1.1em]`}>
      <div className="flex items-center gap-[0.7em]">
        <Trophy className="h-[1.8em] w-[1.8em] shrink-0 text-[#f5a623]" />
        <div className="leading-tight">
          <h2 className="text-[1.2em] font-extrabold text-[#14365a]">{t("Squad Leaderboard")}</h2>
          <p className="text-[0.75em] text-[#14365a]/60">{t("Top 5 squads this Sprint")}</p>
        </div>
        <span className="ms-auto flex items-center gap-[0.4em] rounded-full bg-[#d7f5e4] px-[0.8em] py-[0.2em] text-[0.7em] font-bold text-[#1f9d5b]">
          <span className="h-[0.6em] w-[0.6em] rounded-full bg-[#2fb36b]" /> {t("Live")}
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
            <span className="text-[0.85em] font-bold text-[#14365a]">{t("{n} XP", { n: s.xp })}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Every member's links to the project (Figma, GitHub, Vercel, the server, ...); the student edits their own. */
function ProjectLinks() {
  const t = useT();
  const [links, setLinks] = useState<SquadLinks | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    let active = true;
    getSquadLinks().then(
      (l) => active && setLinks(l),
      () => {},
    );
    return () => {
      active = false;
    };
  }, []);

  if (!links) return null;
  const me = links.members.find((m) => m.isMe);
  return (
    <section className={`${solid} min-w-0 p-[1.1em]`}>
      <div className="flex items-center gap-[0.6em]">
        <h2 className="text-[1.3em] font-extrabold text-[#14365a]">{t("Project Links")}</h2>
        {me && !editing && (
          <button type="button" onClick={() => setEditing(true)} className="ms-auto text-[0.85em] font-semibold text-[#12939b] hover:underline">
            {me.links.length ? t("Edit my links") : t("+ Add my links")}
          </button>
        )}
      </div>
      {me && editing && (
        <div className="mt-[0.7em] rounded-[0.9em] bg-[#eef6fb] p-[0.7em]">
          <MyLinksEditor
            me={me}
            onSaved={(l) => {
              setLinks(l);
              setEditing(false);
            }}
          />
        </div>
      )}
      <ul className="mt-[0.7em] grid gap-[0.6em] sm:grid-cols-2">
        {links.members.map((m) => (
          <li key={m.studentId} className="rounded-[0.9em] border border-[#14365a]/10 p-[0.6em]">
            <p className="text-[0.9em] font-bold text-[#14365a]">
              {m.fullName}
              {m.isMe && ` ${t("(you)")}`} <span className="font-normal text-[#14365a]/60">· {t(ROLE_TITLE[m.role])}</span>
            </p>
            {m.links.length ? (
              <LinkChips member={m} className="mt-[0.4em]" />
            ) : (
              <p className="mt-[0.3em] text-[0.75em] text-[#14365a]/55">{t("No links yet")}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function InternshipProgress() {
  const t = useT();
  const { squad, sprint, board, leaderboard, error, notReady, reload } = useInterns();
  const [moveError, setMoveError] = useState<string | null>(null);
  const chat = useTeamChat(squad);
  /** The chat drawer: closed (false), the list (undefined), the group (null) or a private chat (an id). */
  const [chatOpen, setChatOpen] = useState<ChatKey | undefined | false>(false);

  async function handleMove(task: SquadTask, to: TaskStatus) {
    setMoveError(null);
    try {
      await moveTask(task.id, to);
      await reload();
    } catch (e) {
      setMoveError(errorMessage(e, "We couldn't move this task. Please try again."));
    }
  }

  async function handleAdd(title: string) {
    setMoveError(null);
    try {
      await createTask(title);
      await reload();
      return true;
    } catch (e) {
      setMoveError(errorMessage(e, "We couldn't add this task. Please try again."));
      return false;
    }
  }

  // No project yet: the dashboard is closed, the squad page shows the cube (decision of 22 Oct 2026).
  if (notReady) return <RedirectToSquad />;

  return (
    <div className="relative -ms-[4rem] min-h-[calc(100svh-5rem)] min-w-0 flex-1 lg:absolute lg:inset-0 lg:ms-0 lg:min-h-0">
      {/* Background: on mobile it only covers the top and fades out, on desktop it fills the frame */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[75svh] [mask-image:linear-gradient(to_bottom,black_70%,transparent)] lg:h-full lg:[mask-image:none]"
      >
        <Image src={BG} alt="" fill priority sizes="100vw" className="object-cover object-[50%_40%]" />
      </div>

      {/* Scrolls on desktop (content starts under the header, next to the sidebar) */}
      <div
        className="relative min-w-0 pb-8 ps-[4.75rem] pe-3 pt-2 sm:pe-4 lg:absolute lg:inset-0 lg:overflow-y-auto lg:pb-[calc(var(--u)*2)] lg:ps-[var(--hl)] lg:pe-[calc(var(--u)*1.6)] lg:pt-[calc(var(--u)*8.5)]"
        style={{ fontSize: "clamp(12px, calc(var(--u) * 1.05), 17px)" }}
      >
        <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-[1em] lg:grid-cols-[minmax(0,1fr)_calc(var(--u)*27)] lg:grid-rows-[auto_1fr]">
          {/* Internship pod: first on mobile, top-right on desktop */}
          <div className="order-1 min-w-0 lg:order-none lg:col-start-2 lg:row-start-1">
            {/* The squad page: the monitor, the team and the project the cube picked */}
            <Link href={SQUAD_PAGE} aria-label={t("Your squad")} className="block transition-transform hover:scale-[1.02]">
              <Image
                src={`${IMG}/building-internship.png`}
                alt={t("Internship")}
                width={535}
                height={388}
                sizes="(max-width: 1024px) 80vw, 30vw"
                className="mx-auto h-auto w-full max-w-[18em] drop-shadow-[0_18px_22px_rgba(13,43,90,0.25)] sm:max-w-[22em] lg:-mb-[0.5em] lg:max-w-[26em]"
              />
            </Link>
          </div>

          {/* Team, sprint, task board */}
          <div className="order-2 flex min-w-0 flex-col gap-[1em] lg:order-none lg:col-start-1 lg:row-span-2 lg:row-start-1">
            {error && (
              <p role="alert" className={`${glass} p-[1em] text-[0.95em] font-semibold text-[#14365a]`}>
                {error}
              </p>
            )}
            <TeamCard squad={squad} unreadFor={chat.unreadFor} unreadTotal={chat.unreadTotal} onChat={(key) => setChatOpen(key)} />
            <SprintCard sprint={sprint} />
            <ProjectSubmitCard />
            <ProjectLinks />
            <TaskBoard board={board} members={memberIndex(squad)} onMove={handleMove} onAdd={handleAdd} message={moveError} />
          </div>

          {/* Leaderboard: last on mobile, under the pod on desktop */}
          <div className="order-3 min-w-0 lg:order-none lg:col-start-2 lg:row-start-2">
            <Leaderboard data={leaderboard} />
          </div>
        </div>
      </div>

      {squad && chatOpen !== false && (
        <TeamChatPanel chat={chat} squad={squad} open={chatOpen} onOpen={setChatOpen} onClose={() => setChatOpen(false)} />
      )}
    </div>
  );
}
