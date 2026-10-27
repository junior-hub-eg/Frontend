"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { LoaderCircle, Trophy, X } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { getCompetitor, type Competitor, type TaskStatus } from "@/lib/interns-api";
import { mentorAvatar } from "@/lib/avatars";
import { useI18n } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { avatarFor, ROLE_TITLE } from "./interns-data";

const COLUMN: Record<TaskStatus, { title: string; bg: string; dot: string }> = {
  ToDo: { title: tk("To Do"), bg: "#eceef3", dot: "#64748b" },
  InProgress: { title: tk("In Progress"), bg: "#dcecfb", dot: "#3b82f6" },
  Review: { title: tk("Review"), bg: "#ffefd9", dot: "#ff9a1f" },
  Done: { title: tk("Done"), bg: "#d8f0df", dot: "#2fb36b" },
};

/**
 * The squad competition: a squad of the school's leaderboard in detail — its rank, project, members with the work each
 * finished, sprint progress and tasks (read only). Opened from a leaderboard row.
 */
export function SquadCompetitorDialog({ squadId, onClose }: { squadId: string; onClose: () => void }) {
  const { t, dir } = useI18n();
  const [data, setData] = useState<Competitor | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getCompetitor(squadId).then(
      (c) => active && setData(c),
      (e) => active && setError(errorMessage(e)),
    );
    return () => {
      active = false;
    };
  }, [squadId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // On document.body: the internship page is its own fixed layer, which would keep the dialog under the side menu.
  return createPortal(
    <div
      role="dialog"
      dir={dir}
      aria-modal="true"
      aria-label={data ? data.entry.name : t("Squad details")}
      className="fixed inset-0 z-[70] grid place-items-center bg-[#14365a]/40 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[24px] bg-white p-5 text-[#14365a] shadow-2xl sm:p-6">
        <div className="flex items-start gap-3">
          <Trophy className="mt-1 size-7 shrink-0 text-[#f5a623]" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xl font-extrabold">
              {data ? data.entry.name : t("Squad details")}
              {data?.entry.isMine && ` ${t("(you)")}`}
            </p>
            {data && (
              <p className="text-sm text-[#14365a]/65">
                {t("Rank #{n}", { n: data.entry.rank })} · {t("{n} XP", { n: data.entry.xp })} · {t(data.level)}
              </p>
            )}
          </div>
          <button type="button" onClick={onClose} aria-label={t("Close")} className="rounded-full p-1 hover:bg-[#eef3f7]">
            <X className="size-5" />
          </button>
        </div>

        {error ? (
          <p className="mt-6 rounded-xl bg-[#fdecec] p-3 text-sm text-[#a31818]">{error}</p>
        ) : !data ? (
          <LoaderCircle className="mx-auto my-12 size-8 animate-spin text-[#12939b]" />
        ) : (
          <>
            <section className="mt-5 rounded-2xl bg-[#eef6fb] p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[#12939b]">{t("Project")}</p>
              <p className="mt-1 text-lg font-bold">{data.projectTitle}</p>
              {data.projectDescription && <p className="mt-1 text-sm leading-relaxed text-[#14365a]/75">{data.projectDescription}</p>}
            </section>

            <section className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold">{data.sprint.name}</span>
                <span className="text-[#14365a]/65">
                  {t("{done}/{total} tasks · {days} days left", {
                    done: data.sprint.tasksDone,
                    total: data.sprint.tasksTotal,
                    days: data.sprint.daysLeft,
                  })}
                </span>
              </div>
              <div className="mt-2 h-2.5 rounded-full bg-[#dde6ee]">
                <div className="h-full rounded-full bg-[#14365a]" style={{ width: `${data.sprint.progressPercent}%` }} />
              </div>
            </section>

            <section className="mt-5">
              <h3 className="font-extrabold">{t("Team")}</h3>
              <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                {data.monitor && (
                  <li className="flex items-center gap-3 rounded-xl border border-[#14365a]/10 p-2">
                    <span
                      className="relative size-11 shrink-0 overflow-hidden rounded-full"
                      style={{ backgroundColor: mentorAvatar(data.monitor).bg }}
                    >
                      <Image src={mentorAvatar(data.monitor).src} alt="" fill sizes="44px" className="object-cover" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{data.monitor.fullName}</p>
                      <p className="text-xs text-[#12939b]">{t("Monitor")}</p>
                    </div>
                  </li>
                )}
                {data.members.map((m, i) => {
                  const avatar = avatarFor(m.photoUrl, i);
                  return (
                    <li key={m.studentId} className="flex items-center gap-3 rounded-xl border border-[#14365a]/10 p-2">
                      <span className="relative size-11 shrink-0 overflow-hidden rounded-full" style={{ backgroundColor: avatar.bg }}>
                        <Image src={avatar.src} alt="" fill sizes="44px" className="object-cover" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">
                          {m.firstName}
                          {m.isMe && ` ${t("(you)")}`}
                        </p>
                        <p className="text-xs text-[#14365a]/60">
                          {t(ROLE_TITLE[m.role])} ·{" "}
                          {t("{n} tasks done · {points} points", {
                            n: m.tasksDone,
                            points: m.storyPointsDone,
                          })}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="mt-5">
              <h3 className="font-extrabold">{t("Sprint tasks")}</h3>
              <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {data.columns.map((col) => {
                  const style = COLUMN[col.status];
                  return (
                    <div key={col.status} className="rounded-xl p-2" style={{ backgroundColor: style.bg }}>
                      <p className="flex items-center gap-1.5 text-xs font-bold">
                        <span className="size-2 rounded-full" style={{ backgroundColor: style.dot }} />
                        {t(style.title)} <span className="text-[#14365a]/50">({col.tasks.length})</span>
                      </p>
                      <ul className="mt-1.5 grid gap-1.5">
                        {col.tasks.map((task) => (
                          <li key={task.id} className="rounded-lg bg-white p-2 text-xs shadow-sm">
                            <p className="font-semibold">{task.title}</p>
                            <p className="mt-0.5 text-[#14365a]/55">
                              {task.assignee ? task.assignee.firstName : t("Unassigned")} · {t("{n} pts", { n: task.storyPoints })}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
