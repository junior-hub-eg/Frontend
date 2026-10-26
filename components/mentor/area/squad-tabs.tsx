"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { AlertTriangle, Check, ClipboardCheck, ExternalLink, Info, LoaderCircle, RefreshCw, UserPlus, UserRound } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { useI18n } from "@/lib/i18n/client";
import {
  checkSquadLinks,
  type BoardTask, type LinkRow, type SquadDetail,
} from "@/lib/monitor-api";
import { EmbeddedChat } from "@/components/chat/ChatWorkspace";
import { cn } from "@/lib/utils";
import { Card, MentorAvatar, Pill, RolePill, SecondaryButton, SelectPill, useRelative, type Tone } from "../mentor-area-ui";
import { AddSquadStudents } from "./AddSquadStudents";

const day = (iso: string, intl: string) => new Date(iso).toLocaleDateString(intl, { month: "short", day: "numeric" });

/** "Sprint timeline" under the members (design M3). */
export function SprintTimeline({ detail, vertical = false }: { detail: SquadDetail; vertical?: boolean }) {
  const { t, intl } = useI18n();
  const range = (a: string, b: string) =>
    `${new Date(a).toLocaleDateString(intl, { month: "short", day: "numeric" })} - ${new Date(b).toLocaleDateString(intl, { month: "short", day: "numeric" })}`;
  const sprints = detail.sprints;
  const pill = (status: string, progress: number) =>
    status === "Closed" || progress >= 100 ? <Pill tone="green">{t("Done")}</Pill> : status === "Active" ? <Pill tone="blue">{t("In progress")}</Pill> : <Pill tone="gray">{t("Planned")}</Pill>;
  if (vertical)
    return (
      <div className="rounded-[1.2em] border border-[#e6ebf1] bg-[#f7fafc] p-[1.2em]">
        <h3 className="mb-[0.8em] text-[1.05em] font-bold text-[#1b2d54]">{t("Sprint timeline")}</h3>
        <ul className="divide-y divide-[#e6ebf1]">
          {sprints.map((sp) => (
            <li key={sp.id} className="flex items-center justify-between py-[0.7em]">
              <span>
                <span className="block text-[0.88em] font-semibold text-[#1b2d54]">{sp.name}</span>
                <span className="text-[0.75em] text-[#64748b]">{range(sp.startDate, sp.endDate)}</span>
              </span>
              {pill(sp.status, sp.progress)}
            </li>
          ))}
        </ul>
      </div>
    );
  const first = sprints[0];
  const last = sprints[sprints.length - 1];
  return (
    <Card>
      <h3 className="text-[1.15em] font-bold text-[#1b2d54]">{t("Sprint timeline")}</h3>
      {first && last && <p className="text-[0.82em] text-[#64748b]">{t("{n} sprints", { n: sprints.length })} · {range(first.startDate, last.endDate)}</p>}
      <ol className="mt-[1.4em] grid gap-[1em]" style={{ gridTemplateColumns: `repeat(${Math.max(1, sprints.length)}, minmax(0, 1fr))` }}>
        {sprints.map((sp, i) => {
          const finished = sp.status === "Closed" || sp.progress >= 100;
          return (
            <li key={sp.id} className="relative">
              {i < sprints.length - 1 && <span className={`absolute start-[1.6em] top-[0.8em] h-[3px] w-[calc(100%-0.6em)] ${finished ? "bg-[#86c9a0]" : "bg-[#e6ebf1]"}`} />}
              <span className={`relative grid size-[1.7em] place-items-center rounded-full text-[0.8em] text-white ${finished ? "bg-[#16a34a]" : sp.status === "Active" ? "bg-[#2563eb]" : "bg-[#cbd5e1]"}`}>
                {finished ? "✓" : i + 1}
              </span>
              <p className="mt-[0.8em] text-[0.88em] font-semibold text-[#1b2d54]">{sp.name}</p>
              <p className="text-[0.75em] text-[#64748b]">{range(sp.startDate, sp.endDate)}</p>
              <div className="mt-[0.6em]">{pill(sp.status, sp.progress)}</div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

// ---------- Members ----------

/** The members, and "Add students" for a squad that still takes members (students who are in no squad, by open seat). */
export function MembersTab({ detail, onChanged }: { detail: SquadDetail; onChanged?: () => void }) {
  const { t, intl } = useI18n();
  const rel = useRelative();
  const [adding, setAdding] = useState(false);
  const canAdd = detail.squad.isCurrent && detail.squad.state !== "Completed";
  return (
    <div>
      {canAdd && (
        <div className="mb-[1em] flex justify-end">
          <SecondaryButton onClick={() => setAdding(true)}>
            <UserPlus className="size-[1.1em]" /> {t("Add students")}
          </SecondaryButton>
        </div>
      )}
      {detail.members.length === 0 && (
        <p className="mb-[1em] rounded-[0.8em] bg-[#f4f7fa] px-[1em] py-[0.8em] text-[0.85em] text-[#475467]">
          {canAdd ? t("No members yet. Add students who are not in a squad.") : t("No members yet.")}
        </p>
      )}
      {adding && <AddSquadStudents squadId={detail.squad.id} onClose={() => setAdding(false)} onAdded={() => onChanged?.()} />}
    <div className="overflow-x-auto">
      <table className="w-full min-w-[58em] text-[0.85em]">
        <thead>
          <tr className="text-[0.9em] text-[#475467]">
            {[t("Student"), t("Role"), t("Joined"), t("Tasks done"), t("Points"), t("Submitted"), t("Last active"), t("Warning"), t("Actions")].map((h) => (
              <th key={h} className="pb-[0.8em] text-start font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#eef2f6]">
          {detail.members.map((m) => {
            const stale = m.warning === "Inactive";
            return (
              <tr key={m.studentId}>
                <td className="py-[0.9em] pe-3">
                  <span className="flex items-center gap-[0.7em] font-semibold text-[#1b2d54]">
                    <MentorAvatar name={m.fullName} photoUrl={m.photoUrl} className="size-[2.3em]" /> {m.fullName}
                  </span>
                </td>
                <td className="pe-3"><RolePill role={m.role} /></td>
                <td className="pe-3 font-semibold text-[#1b2d54]">{day(m.joinedUtc, intl)}</td>
                <td className="pe-3 text-[#1b2d54]">{m.tasksDone}</td>
                <td className="pe-3 font-semibold text-[#1b2d54]">{m.points}</td>
                <td className="pe-3">
                  {m.submitted ? <span className="flex items-center gap-1 text-[#167a3e]"><Check className="size-[1em]" /> {t("Yes")}</span> : <span className="text-[#98a2b3]">{t("No")}</span>}
                </td>
                <td className={cn("pe-3", stale ? "text-[#c81e1e]" : "text-[#475467]")}>{rel.ago(m.lastActiveUtc)}</td>
                <td className="pe-3">
                  {m.warning && (
                    <Pill tone="orange" icon={<AlertTriangle className="size-[1em]" />}>
                      {m.warning === "Inactive" ? t("Inactive") : t("Overdue")}
                    </Pill>
                  )}
                </td>
                <td>
                  <Link href={`/mentor/students/${m.studentId}` as Route} aria-label={t("Open {name}'s page", { name: m.fullName })}
                    className="grid size-[2em] place-items-center rounded-[0.6em] border border-[#d6dde6] text-[#1b2d54] hover:bg-[#f7f9fc]">
                    <UserRound className="size-[1em]" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    </div>
  );
}

// ---------- Project ----------

const DELIVERABLE: Record<string, { tone: Tone; label: string }> = {
  Done: { tone: "green", label: "Done" },
  InProgress: { tone: "blue", label: "In progress" },
  Review: { tone: "amber", label: "In review" },
  ToDo: { tone: "gray", label: "To do" },
};

export function ProjectTab({ detail }: { detail: SquadDetail }) {
  const { t, intl } = useI18n();
  const info = detail.info;
  const full = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString(intl, { month: "short", day: "numeric", year: "numeric" }) : "—");
  return (
    <div className="grid gap-[1.6em] lg:grid-cols-[1fr_22em]">
      <div className="space-y-[1.4em]">
        <section>
          <h3 className="font-bold text-[#1b2d54]">{t("About the project")}</h3>
          <p className="mt-[0.4em] text-[0.85em] leading-relaxed text-[#475467]">{detail.projectDescription}</p>
        </section>
        {detail.goals.length > 0 && (
          <section>
            <h3 className="font-bold text-[#1b2d54]">{t("Goals")}</h3>
            <ul className="mt-[0.5em] space-y-[0.4em] text-[0.85em] text-[#1b2d54]">
              {detail.goals.map((g) => (
                <li key={g} className="flex gap-[0.6em]"><span className="mt-[0.5em] size-[0.4em] shrink-0 rounded-full bg-[#0f7378]" />{g}</li>
              ))}
            </ul>
          </section>
        )}
        {detail.techStack.length > 0 && (
          <section>
            <h3 className="font-bold text-[#1b2d54]">{t("Tech stack")}</h3>
            <div className="mt-[0.6em] flex flex-wrap gap-[0.5em]">
              {detail.techStack.map((s) => <span key={s} className="rounded-full border border-[#d6dde6] bg-[#f4f7fa] px-[0.8em] py-[0.25em] text-[0.78em] text-[#1b2d54]">{s}</span>)}
            </div>
          </section>
        )}
        {detail.deliverables.length > 0 && (
          <section>
            <h3 className="font-bold text-[#1b2d54]">{t("Deliverables")}</h3>
            <ul className="mt-[0.6em] divide-y divide-[#e6ebf1] rounded-[1em] border border-[#e6ebf1] bg-[#f7fafc]">
              {detail.deliverables.map((d) => (
                <li key={d.title} className="flex items-center justify-between px-[1em] py-[0.75em] text-[0.85em] text-[#1b2d54]">
                  {d.title}
                  <Pill tone={DELIVERABLE[d.status].tone}>{t(DELIVERABLE[d.status].label)}</Pill>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
      <div className="space-y-[1.2em]">
        <div className="rounded-[1.2em] border border-[#e6ebf1] bg-[#f7fafc] p-[1.2em]">
          <h3 className="mb-[0.6em] text-[1.05em] font-bold text-[#1b2d54]">{t("Project info")}</h3>
          <dl className="space-y-[0.7em] text-[0.85em]">
            {[
              [t("Level"), t(info.level)],
              [t("Track"), t(info.track)],
              [t("Students"), String(info.students)],
              [t("Starts"), full(info.starts)],
              [t("Final review"), full(info.finalReview)],
              [t("Monitor"), info.monitorName ?? "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3"><dt className="text-[#64748b]">{k}</dt><dd className="font-medium text-[#1b2d54]">{v}</dd></div>
            ))}
          </dl>
        </div>
        <SprintTimeline detail={detail} vertical />
      </div>
    </div>
  );
}

// ---------- Board ----------

const COLUMNS: { status: BoardTask["status"]; label: string; dot: string }[] = [
  { status: "ToDo", label: "To do", dot: "bg-[#475467]" },
  { status: "InProgress", label: "In progress", dot: "bg-[#2563eb]" },
  { status: "Review", label: "In review", dot: "bg-[#f59e0b]" },
  { status: "Done", label: "Done", dot: "bg-[#16a34a]" },
];

export function BoardTab({ detail }: { detail: SquadDetail }) {
  const { t } = useI18n();
  const active = detail.sprints.find((s) => s.status === "Active") ?? detail.sprints[detail.sprints.length - 1];
  const [sprintId, setSprintId] = useState(active?.id ?? "");
  const [role, setRole] = useState("all");
  const sprint = detail.sprints.find((s) => s.id === sprintId);
  const roles = [...new Set(detail.members.map((m) => m.role))];
  const tasks = detail.board.filter((b) => b.sprintId === sprintId && (role === "all" || b.role === role));
  const doneCount = tasks.filter((b) => b.status === "Done").length;
  return (
    <>
      <div className="mb-[1.2em] flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-[1.05em] font-bold text-[#1b2d54]">{t("{sprint} board", { sprint: sprint?.name ?? t("Sprint") })}</h3>
          <p className="text-[0.8em] text-[#64748b]">
            {t("{n} tasks · {d} done · students move the cards, you can follow the progress here", { n: tasks.length, d: doneCount })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-[0.5em]">
          <span className="rounded-full bg-[#eef1f5] px-[0.9em] py-[0.35em] text-[0.75em] text-[#475467]">{t("Read-only for monitors")}</span>
          <SelectPill label={t("Role")} value={role} onChange={setRole} options={[{ value: "all", label: t("All roles") }, ...roles.map((r) => ({ value: r, label: t(r === "UIUX" ? "UI/UX" : r) }))]} />
          <SelectPill label={t("Sprint")} value={sprintId} onChange={setSprintId} options={detail.sprints.map((s) => ({ value: s.id, label: s.name }))} />
        </div>
      </div>
      <div className="grid gap-[1em] md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((c) => {
          const col = tasks.filter((b) => b.status === c.status);
          return (
            <section key={c.status} className="min-h-[18em] rounded-[1.1em] border border-[#e6ebf1] bg-[#f7fafc] p-[0.9em]">
              <h4 className="mb-[0.8em] flex items-center gap-[0.5em] text-[0.88em] font-semibold text-[#1b2d54]">
                <span className={cn("size-[0.5em] rounded-full", c.dot)} /> {t(c.label)}
                <span className="grid min-w-[1.6em] place-items-center rounded-full bg-[#e6ebf1] px-1 text-[0.85em] text-[#475467]">{col.length}</span>
              </h4>
              <ul className="space-y-[0.7em]">
                {col.map((task) => (
                  <li key={task.id} className="rounded-[0.9em] bg-white p-[0.9em] shadow-[0_2px_8px_rgba(20,54,90,0.06)]">
                    <p className="text-[0.85em] font-semibold text-[#1b2d54]">{task.title}</p>
                    <div className="mt-[0.7em] flex items-center gap-[0.5em]">
                      {task.role && <RolePill role={task.role} />}
                      <span className="rounded-full bg-[#eef1f5] px-[0.6em] py-[0.15em] text-[0.72em] text-[#475467]">{t("{n} pts", { n: task.storyPoints })}</span>
                      {task.assigneeName && <MentorAvatar name={task.assigneeName} photoUrl={task.assigneePhotoUrl} className="ms-auto size-[1.9em]" />}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}

// ---------- Work links ----------

const KIND_LABELS: Record<string, string> = {
  Figma: "Design", GitHub: "Repository", LiveSite: "Live preview", Api: "API", Demo: "Demo", TestReport: "Test report", Standup: "Docs", Grooming: "Docs", Other: "Other",
};
const LINK_STATUS: Record<LinkRow["status"], { tone: Tone; label: string }> = {
  Reachable: { tone: "green", label: "Reachable" },
  Expired: { tone: "amber", label: "Link expired" },
  NotReachable: { tone: "red", label: "Not reachable" },
  Unknown: { tone: "gray", label: "Not checked" },
};

function linkTitle(url: string) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    return { host, short: (host + u.pathname).replace(/\/$/, "").slice(0, 46) };
  } catch {
    return { host: url, short: url.slice(0, 46) };
  }
}

export function LinksTab({ detail, onLinks }: { detail: SquadDetail; onLinks: (links: LinkRow[]) => void }) {
  const { t } = useI18n();
  const rel = useRelative();
  const [checking, setChecking] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const links = detail.links;
  const asked = useRef(false);

  const check = () => {
    setChecking(true);
    setErr(null);
    checkSquadLinks(detail.squad.id).then((l) => { onLinks(l); setChecking(false); }, (e) => { setErr(errorMessage(e)); setChecking(false); });
  };
  // Links nobody checked yet (or a day ago) are checked when the tab opens.
  useEffect(() => {
    if (asked.current || links.length === 0) return;
    if (links.some((l) => l.status === "Unknown" || !l.checkedUtc || Date.now() - new Date(l.checkedUtc).getTime() > 86400000)) {
      asked.current = true;
      const timer = setTimeout(check, 0);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const count = (s: LinkRow["status"]) => links.filter((l) => l.status === s).length;
  return (
    <>
      <div className="mb-[1.2em] flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-[1.05em] font-bold text-[#1b2d54]">{t("Work links")}</h3>
          <p className="text-[0.8em] text-[#64748b]">{t("{n} links shared by the squad. Students add and edit them, you can open and check each one.", { n: links.length })}</p>
        </div>
        <div className="flex flex-wrap items-center gap-[0.5em]">
          <Pill tone="green">{t("{n} reachable", { n: count("Reachable") })}</Pill>
          <Pill tone="amber">{t("{n} expired", { n: count("Expired") })}</Pill>
          <Pill tone="red">{t("{n} not reachable", { n: count("NotReachable") })}</Pill>
          <button type="button" onClick={check} disabled={checking} aria-label={t("Check links again")} title={t("Check links again")}
            className="grid size-[2em] place-items-center rounded-full border border-[#d6dde6] text-[#1b2d54] hover:bg-[#f7f9fc] disabled:opacity-50">
            {checking ? <LoaderCircle className="size-[1em] animate-spin" /> : <RefreshCw className="size-[1em]" />}
          </button>
        </div>
      </div>
      {err && <p className="mb-[1em] text-[0.85em] text-[#c81e1e]">{err}</p>}
      {links.length === 0 ? (
        <p className="py-[2em] text-center text-[0.88em] text-[#475467]">{t("The squad has not shared any links yet.")}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[56em] text-[0.85em]">
            <thead>
              <tr className="text-[0.9em] text-[#475467]">
                {[t("Link"), t("Type"), t("Added by"), t("Updated"), t("Status"), t("Actions")].map((h) => <th key={h} className="pb-[0.8em] text-start font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef2f6]">
              {links.map((l) => {
                const title = linkTitle(l.url);
                const status = LINK_STATUS[l.status];
                return (
                  <tr key={l.id}>
                    <td className="py-[0.9em] pe-3">
                      <span className="flex items-center gap-[0.8em]">
                        <span className="grid size-[2.3em] shrink-0 place-items-center rounded-[0.6em] bg-[#eef1f5] text-[0.85em] font-bold uppercase text-[#475467]">{title.host[0]}</span>
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-[#1b2d54]">{t(KIND_LABELS[l.kind] ?? l.kind)} · {l.studentName.split(" ")[0]}</span>
                          <span className="block truncate text-[0.85em] text-[#64748b]">{title.short}</span>
                        </span>
                      </span>
                    </td>
                    <td className="pe-3 text-[#1b2d54]">{t(KIND_LABELS[l.kind] ?? l.kind)}</td>
                    <td className="pe-3">
                      <span className="flex items-center gap-[0.5em] text-[#1b2d54]"><MentorAvatar name={l.studentName} photoUrl={l.photoUrl} className="size-[1.8em]" /> {l.studentName}</span>
                    </td>
                    <td className="pe-3 text-[#475467]">{rel.ago(l.updatedUtc)}</td>
                    <td className="pe-3"><Pill tone={status.tone}>{t(status.label)}</Pill></td>
                    <td>
                      <a href={l.url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-[0.4em] rounded-[0.6em] border border-[#d6dde6] px-[0.9em] py-[0.35em] text-[#0f7378] hover:bg-[#f7f9fc]">
                        {t("Open")} <ExternalLink className="size-[0.9em]" />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-[1.2em] flex items-center gap-[0.6em] rounded-[0.9em] border border-[#e6ebf1] bg-[#f7fafc] px-[1em] py-[0.8em] text-[0.8em] text-[#475467]">
        <Info className="size-[1.1em] shrink-0 text-[#0f7378]" /> {t("If a link is expired or not reachable, message the squad or report it to the Admin from the header.")}
      </p>
    </>
  );
}

// ---------- Reviews ----------

export function ReviewsTab({ detail }: { detail: SquadDetail }) {
  const { t, intl } = useI18n();
  const rel = useRelative();
  const r = detail.reviews;
  const waiting = r.items.find((i) => i.status === "Waiting");
  const range = (a: string | null, b: string | null) => (a && b ? `${day(a, intl)} – ${day(b, intl)}` : "—");
  const statusPill = (s: string) =>
    s === "Waiting" ? <Pill tone="orange">{t("Waiting for your review")}</Pill> : s === "Approved" ? <Pill tone="green">{t("Approved")}</Pill> : <Pill tone="orange">{t("Changes requested")}</Pill>;
  return (
    <>
      <h3 className="text-[1.05em] font-bold text-[#1b2d54]">{t("Squad reviews")}</h3>
      <p className="text-[0.8em] text-[#64748b]">{t("One review for the whole project. Approve completes the squad; Request changes sends it back to Working.")}</p>
      <div className="mt-[1em] grid gap-[1em] md:grid-cols-3">
        <Box label={t("Average score")} value={r.averageScore != null ? `${r.averageScore} / 5` : "—"} tone="text-[#0f7378]"
          hint={r.averageRound ? t("From review round {n}", { n: r.averageRound }) : t("No scored round yet")} />
        <Box label={t("Review rounds")} value={String(r.rounds)} hint={waiting ? t("Round {n} is waiting for you", { n: waiting.round }) : t("Nothing is waiting")} />
        <Box label={t("Next deadline")} tone="text-[#c2570c]"
          value={r.nextDeadlineUtc ? new Date(r.nextDeadlineUtc).toLocaleDateString(intl, { month: "short", day: "numeric" }) : "—"}
          hint={r.nextDeadlineUtc ? rel.countdown(r.nextDeadlineUtc).label : t("No review due")} />
      </div>
      {r.items.length === 0 ? (
        <p className="py-[2em] text-center text-[0.88em] text-[#475467]">{t("No review yet. The squad submits its work first.")}</p>
      ) : (
        <div className="mt-[1.2em] overflow-x-auto">
          <table className="w-full min-w-[52em] text-[0.85em]">
            <thead>
              <tr className="text-[0.9em] text-[#475467]">
                {[t("Review"), t("Period"), t("Status"), t("Submitted"), t("Avg score"), t("Decision"), t("Actions")].map((h) => <th key={h} className="pb-[0.8em] text-start font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef2f6] border-t border-[#eef2f6]">
              {r.items.map((item) => (
                <tr key={item.round}>
                  <td className="py-[1em] pe-3 font-semibold text-[#1b2d54]">
                    {item.status === "Waiting" || item.status === "Approved" ? t("Final project review") : t("Review round {n}", { n: item.round })}
                  </td>
                  <td className="pe-3 text-[#1b2d54]">{range(item.periodStart, item.periodEnd)}</td>
                  <td className="pe-3">{statusPill(item.status)}</td>
                  <td className="pe-3 text-[#475467]">
                    {item.submittedUtc ? day(item.submittedUtc, intl) : "—"}
                    {item.dueUtc && ` · ${rel.countdown(item.dueUtc).label.toLowerCase()}`}
                  </td>
                  <td className="pe-3 font-semibold text-[#1b2d54]">{item.averageScore ?? "—"}</td>
                  <td className={cn("pe-3", item.decision === "ChangesRequested" ? "text-[#c2570c]" : item.decision === "Approved" ? "text-[#167a3e]" : "text-[#475467]")}>
                    {item.decision === "Approved" ? t("Approved") : item.decision === "ChangesRequested" ? t("Changes requested") : t("Not decided yet")}
                  </td>
                  <td>
                    {item.status === "Waiting" ? (
                      <Link href={`/mentor/reviews/${detail.squad.id}` as Route}
                        className="inline-flex items-center gap-[0.4em] rounded-[0.7em] bg-gradient-to-r from-[#0f6b70] to-[#1b2d54] px-[1em] py-[0.5em] font-semibold text-white rtl:bg-gradient-to-l">
                        <ClipboardCheck className="size-[1em]" /> {t("Start review")}
                      </Link>
                    ) : (
                      <Link href={`/mentor/reviews/${detail.squad.id}?round=${item.round}` as Route}
                        className="inline-flex rounded-[0.7em] border border-[#d6dde6] px-[1em] py-[0.45em] text-[#1b2d54] hover:bg-[#f7f9fc]">
                        {t("View review")}
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function Box({ label, value, hint, tone = "text-[#1b2d54]" }: { label: string; value: string; hint: string; tone?: string }) {
  return (
    <div className="rounded-[1em] border border-[#e6ebf1] bg-[#f7fafc] p-[1em]">
      <p className="text-[0.8em] text-[#475467]">{label}</p>
      <p className={cn("mt-[0.3em] text-[1.6em] font-extrabold", tone)}>{value}</p>
      <p className="text-[0.75em] text-[#64748b]">{hint}</p>
    </div>
  );
}

// ---------- Chat ----------

/** The squad's conversation of the one chat (27 Oct 2026): stickers, pictures and files, live. */
export function ChatTab({ detail }: { detail: SquadDetail }) {
  return <EmbeddedChat target={{ squadId: detail.squad.id }} className="h-[min(70vh,40rem)]" />;
}

