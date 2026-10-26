"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Route } from "next";
import { ClipboardCheck, MessageSquare } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { useI18n } from "@/lib/i18n/client";
import { addStudentNote, getMyStudent } from "@/lib/monitor-api";
import { openChat } from "@/lib/chat-api";
import { cn } from "@/lib/utils";
import {
  Card, Dialog, EmptyState, ErrorState, Field, LevelBadge, LinkButton, MentorAvatar, MentorPage, Pill, PrimaryButton, ProgressBar, RolePill,
  SecondaryButton, Skeleton, UnderlineTabs, inputCls, useRelative,
} from "../mentor-area-ui";
import { useApi } from "../use-api";

/** The learner's XP levels (components/learner/dashboard-cards.tsx). */
const XP_PER_LEVEL = 500;

type Tab = "overview" | "squads" | "reviews" | "notes" | "sessions";

export default function StudentPage({ id }: { id: string }) {
  const { t, intl } = useI18n();
  // The notification of a new message links here with ?chat=1.
  const params = useSearchParams();
  const chatLink = params.get("chat") === "1";
  useEffect(() => {
    if (chatLink) openChat({ userId: id });
  }, [chatLink, id]);
  const rel = useRelative();
  const { data, error, loading, reload, setData } = useApi(() => getMyStudent(id), [id]);
  const [tab, setTab] = useState<Tab>("overview");
  const [writing, setWriting] = useState(false);

  if (error?.code === "NOT_YOUR_STUDENT" || error?.status === 404)
    return (
      <MentorPage title={t("Student")}>
        <Card>
          <EmptyState art="lock" title={t("This student is not one of yours")}
            text={t("You can only open students of your squads and your mentees. If you think this is a mistake, contact the Admin.")}>
            <LinkButton href="/mentor/students" primary>{t("Back to My students")}</LinkButton>
          </EmptyState>
        </Card>
      </MentorPage>
    );
  if (error) return <MentorPage title={t("Student")}><ErrorState title={t("We could not load this student")} onRetry={reload} back={{ href: "/mentor/students", label: t("Back to My students") }} error={error} /></MentorPage>;
  if (loading || !data)
    return (
      <MentorPage title={t("Student")}>
        <Card className="space-y-4"><Skeleton className="h-16 w-1/2" /></Card>
        <Card className="space-y-4">{Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-5 w-full" />)}</Card>
      </MentorPage>
    );

  const level = Math.floor(data.totalXp / XP_PER_LEVEL) + 1;
  const toNext = level * XP_PER_LEVEL - data.totalXp;
  const sq = data.currentSquad;
  const scored = data.reviews.filter((r) => r.overall != null);
  const latest = scored[scored.length - 1];
  const previous = scored[scored.length - 2];
  const upcoming = data.sessions.filter((s) => s.status === "Upcoming").sort((a, b) => a.startsUtc.localeCompare(b.startsUtc));
  const day = (iso: string) => new Date(iso).toLocaleDateString(intl, { month: "short", day: "numeric" });

  return (
    <MentorPage title={data.fullName} subtitle={<span><Link href={"/mentor/students" as Route} className="hover:underline">{t("My students")}</Link>{sq ? ` › ${sq.squadName}` : ""}</span>}>
      <Card>
        <div className="flex flex-wrap items-center gap-[1.2em]">
          <MentorAvatar name={data.fullName} photoUrl={data.photoUrl} className="size-[5em] text-[1.3em]" />
          <div className="min-w-0 flex-1">
            <h2 className="text-[1.5em] font-bold text-[#1b2d54]">{data.fullName}</h2>
            <div className="mt-[0.4em] flex flex-wrap items-center gap-[0.5em] text-[0.85em] text-[#475467]">
              {data.level && <LevelBadge level={data.level} />}
              {sq && <RolePill role={sq.role} />}
              {sq?.squadName ?? (data.trackName ? t(data.trackName) : null)}
            </div>
          </div>
          <div className="w-full max-w-[18em]">
            <p className="flex justify-between text-[0.82em]"><b className="text-[#1b2d54]">{t("Level {n} · {xp} XP", { n: level, xp: data.totalXp.toLocaleString(intl) })}</b><span className="text-[#64748b]">{t("{n} to level {next}", { n: toNext, next: level + 1 })}</span></p>
            <ProgressBar value={((data.totalXp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100} className="mt-[0.5em]" />
          </div>
          <div className="flex gap-[0.6em]">
            <PrimaryButton onClick={() => setWriting(true)}><ClipboardCheck className="size-[1.1em]" /> {t("Write review")}</PrimaryButton>
            <SecondaryButton onClick={() => openChat({ userId: data.id })}><MessageSquare className="size-[1.1em]" /> {t("Message")}</SecondaryButton>
          </div>
        </div>
      </Card>

      <Card>
        <UnderlineTabs value={tab} onChange={setTab} tabs={[
          { value: "overview", label: t("Overview") }, { value: "squads", label: t("Squads") }, { value: "reviews", label: t("Reviews") },
          { value: "notes", label: t("Notes") }, { value: "sessions", label: t("Sessions") },
        ]} />
        <div className="pt-[1.2em]">
          {tab === "overview" && (
            <div className="grid gap-[1.2em] lg:grid-cols-3">
              <Panel title={data.trackName ? t("Track progress · {track}", { track: t(data.trackName) }) : t("Track progress")}>
                {data.trackProgress.length === 0 ? <p className="text-[0.85em] text-[#475467]">{t("No lessons in this track yet.")}</p> : (
                  <ul className="space-y-[0.9em]">
                    {data.trackProgress.slice(0, 6).map((m) => (
                      <li key={m.title}>
                        <p className="flex justify-between text-[0.85em]"><span className="text-[#1b2d54]">{m.title}</span><span className="text-[#64748b]">{m.percent}%</span></p>
                        <ProgressBar value={m.percent} className="mt-[0.4em]" />
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-[1em] rounded-[0.8em] bg-[#e6eff2] px-[0.9em] py-[0.6em] text-[0.75em] text-[#475467]">{t("{name} sees only their track. New ones need approval.", { name: data.fullName.split(" ")[0] })}</p>
              </Panel>
              <Panel title={t("Current squad")}>
                {sq ? (
                  <dl className="divide-y divide-[#e6ebf1] text-[0.85em]">
                    {[
                      [t("Squad"), sq.squadName], [t("Project"), sq.projectTitle], [t("Role"), t(sq.role === "UIUX" ? "UI/UX" : sq.role)],
                      [t("Tasks done"), t("{n} ({p} story points)", { n: sq.tasksDone, p: sq.points })], [t("Submitted"), sq.submitted ? t("Yes") : t("No")],
                      [t("Last active"), rel.ago(sq.lastActiveUtc)],
                    ].map(([k, v]) => <div key={k} className="flex justify-between gap-3 py-[0.7em]"><dt className="text-[#64748b]">{k}</dt><dd className="text-end font-medium text-[#1b2d54]">{v}</dd></div>)}
                  </dl>
                ) : <p className="text-[0.85em] text-[#475467]">{t("Not in one of your squads right now.")}</p>}
              </Panel>
              <Panel title={t("Review score trend")}>
                {scored.length === 0 ? <p className="text-[0.85em] text-[#475467]">{t("No reviews yet.")}</p> : (
                  <div className="flex h-[10em] items-end justify-around gap-[0.6em]">
                    {scored.slice(-5).map((r, i) => (
                      <div key={i} className="flex h-full flex-1 flex-col items-center justify-end">
                        <span className="mb-[0.3em] text-[0.75em] font-semibold text-[#1b2d54]">{r.overall}</span>
                        <span className="w-[2.2em] rounded-[0.5em] bg-gradient-to-b from-[#2bb3ad] to-[#0f6b70]" style={{ height: `${((r.overall ?? 0) / 5) * 100}%` }} />
                        <span className="mt-[0.4em] text-[0.7em] text-[#64748b]">R{i + 1}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Panel>
            </div>
          )}
          {tab === "squads" && (
            data.squads.length === 0 ? <EmptyState title={t("No squads yet")} text={t("The student has not joined a squad.")} /> : (
              <ul className="divide-y divide-[#eef2f6]">
                {data.squads.map((s) => (
                  <li key={s.squadId} className="flex flex-wrap items-center justify-between gap-3 py-[0.9em] text-[0.85em]">
                    <span><b className="text-[#1b2d54]">{s.squadName}</b> <span className="text-[#64748b]">· {s.projectTitle}</span></span>
                    <span className="flex items-center gap-[0.6em]"><RolePill role={s.role} /><span className="text-[#64748b]">{day(s.joinedUtc)}{s.leftUtc ? ` – ${day(s.leftUtc)}` : ""}</span>
                      <Pill tone={s.status === "Current" ? "blue" : "green"}>{t(s.status)}</Pill></span>
                  </li>
                ))}
              </ul>
            )
          )}
          {tab === "reviews" && (
            data.reviews.length === 0 ? <EmptyState title={t("No reviews yet")} text={t("Reviews appear here once a squad review is submitted.")} /> : (
              <ul className="space-y-[0.8em]">
                {[...data.reviews].reverse().map((r) => (
                  <li key={`${r.squadId}-${r.round}`} className="rounded-[1em] border border-[#e6ebf1] p-[1em] text-[0.85em]">
                    <p className="flex justify-between"><b className="text-[#1b2d54]">{r.squadName} · {t("Round {n}", { n: r.round })}</b><span className="font-semibold text-[#0f7378]">{r.overall ?? "—"} / 5</span></p>
                    {r.strengths && <p className="mt-[0.4em] text-[#475467]"><b>{t("Strengths")}:</b> {r.strengths}</p>}
                    {r.toImprove && <p className="text-[#475467]"><b>{t("To improve")}:</b> {r.toImprove}</p>}
                  </li>
                ))}
              </ul>
            )
          )}
          {tab === "notes" && (
            <>
              <div className="mb-[1em]"><PrimaryButton onClick={() => setWriting(true)}>{t("Write a note")}</PrimaryButton></div>
              {data.notes.length === 0 ? <p className="text-[0.85em] text-[#475467]">{t("No notes yet. Notes stay private unless you share them.")}</p> : (
                <ul className="space-y-[0.8em]">
                  {data.notes.map((n) => (
                    <li key={n.id} className="rounded-[1em] border border-[#e6ebf1] p-[1em] text-[0.85em]">
                      <p className="whitespace-pre-wrap text-[#1b2d54]">{n.text}</p>
                      <p className="mt-[0.4em] text-[0.8em] text-[#64748b]">{rel.ago(n.createdUtc)} · {n.shared ? t("Shared with the student") : t("Private")}</p>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
          {tab === "sessions" && (
            data.sessions.length === 0 ? <EmptyState title={t("No sessions")} text={t("Sessions this student books with you show up here.")} /> : (
              <ul className="divide-y divide-[#eef2f6]">
                {data.sessions.map((s) => (
                  <li key={s.id}>
                    <Link href={`/mentor/sessions/${s.id}` as Route} className="flex items-center justify-between gap-3 py-[0.8em] text-[0.85em]">
                      <span><b className="text-[#1b2d54]">{s.topic ?? t(s.type === "Group" ? "Group session" : "One-to-one session")}</b> <span className="text-[#64748b]">· {new Date(s.startsUtc).toLocaleString(intl, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span></span>
                      <Pill tone={s.status === "Upcoming" ? "blue" : s.status === "Completed" ? "green" : s.status === "NoShow" ? "red" : "gray"}>{t({ Upcoming: "Upcoming", Completed: "Completed", NoShow: "Student no-show", Cancelled: "Cancelled" }[s.status])}</Pill>
                    </Link>
                  </li>
                ))}
              </ul>
            )
          )}
        </div>
      </Card>

      {tab === "overview" && (
        <div className="grid gap-[1.4em] lg:grid-cols-[1fr_32em]">
          <Card>
            <h3 className="text-[1.15em] font-bold text-[#1b2d54]">{t("Latest review feedback")}</h3>
            {latest ? (
              <>
                <p className="text-[0.82em] text-[#64748b]">{t("Review {n}", { n: scored.length })} · {latest.submittedUtc ? day(latest.submittedUtc) : ""}</p>
                <p className="mt-[0.8em] flex items-center gap-[0.6em]">
                  <span className="text-[2.2em] font-extrabold text-[#1b2d54]">{latest.overall}</span><span className="text-[0.85em] text-[#475467]">{t("/ 5 overall")}</span>
                  {previous?.overall != null && latest.overall != null && (
                    <Pill tone={latest.overall >= previous.overall ? "green" : "red"} dot={false}>
                      {latest.overall >= previous.overall ? t("Up {n} from last review", { n: (latest.overall - previous.overall).toFixed(1) }) : t("Down {n} from last review", { n: (previous.overall - latest.overall).toFixed(1) })}
                    </Pill>
                  )}
                </p>
                {latest.strengths && <div className="mt-[1em] rounded-[1em] bg-[#eaf6ee] p-[1em]"><Pill tone="green" dot={false}>{t("Strengths")}</Pill><p className="mt-[0.6em] text-[0.85em] text-[#1b2d54]">{latest.strengths}</p></div>}
                {latest.toImprove && <div className="mt-[0.8em] rounded-[1em] bg-[#fdf3e3] p-[1em]"><Pill tone="amber" dot={false}>{t("To improve")}</Pill><p className="mt-[0.6em] text-[0.85em] text-[#1b2d54]">{latest.toImprove}</p></div>}
              </>
            ) : <p className="mt-[0.6em] text-[0.85em] text-[#475467]">{t("No reviews yet.")}</p>}
          </Card>
          <Card>
            <h3 className="text-[1.15em] font-bold text-[#1b2d54]">{t("Upcoming sessions")}</h3>
            <p className="text-[0.82em] text-[#64748b]">{t("One-to-one sessions with {name}", { name: data.fullName.split(" ")[0] })}</p>
            {upcoming.length === 0 ? <p className="mt-[0.8em] text-[0.85em] text-[#475467]">{t("No sessions booked.")}</p> : (
              <ul className="mt-[0.8em] divide-y divide-[#eef2f6]">
                {upcoming.slice(0, 3).map((s) => {
                  const d = new Date(s.startsUtc);
                  return (
                    <li key={s.id} className="flex items-center gap-[0.8em] py-[0.7em]">
                      <span className="grid w-[3em] place-items-center rounded-[0.7em] border border-[#dfe5ec] bg-[#f4f7fa] py-[0.35em] leading-none">
                        <span className="text-[0.6em] font-semibold uppercase text-[#1d5fd1]">{d.toLocaleDateString(intl, { month: "short" })}</span>
                        <span className="mt-[0.2em] text-[1.25em] font-bold text-[#1b2d54]">{d.getDate()}</span>
                      </span>
                      <span className="flex-1">
                        <span className="block text-[0.88em] font-semibold text-[#1b2d54]">{s.topic ?? t(s.type === "Group" ? "Group session" : "One-to-one session")}</span>
                        <span className="text-[0.75em] text-[#64748b]">{d.toLocaleString(intl, { weekday: "short", hour: "numeric", minute: "2-digit" })} · {t("{n} min", { n: s.durationMinutes })}</span>
                      </span>
                      <Pill tone="green" dot={false}>{t("Confirmed")}</Pill>
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="mt-[0.8em] rounded-[0.8em] bg-[#eef6f6] px-[1em] py-[0.6em] text-[0.78em] text-[#475467]">{t("Sessions only happen inside your availability slots.")}</p>
          </Card>
        </div>
      )}

      {writing && <NoteDialog name={data.fullName} onClose={() => setWriting(false)} onSave={(text, share) =>
        addStudentNote(id, text, share).then((n) => { setData({ ...data, notes: [n, ...data.notes] }); setWriting(false); setTab("notes"); })} />}
    </MentorPage>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={cn("rounded-[1.2em] border border-[#e6ebf1] bg-[#f7fafc] p-[1.2em]")}>
      <h3 className="mb-[0.9em] font-bold text-[#1b2d54]">{title}</h3>
      {children}
    </section>
  );
}

function NoteDialog({ name, onClose, onSave }: { name: string; onClose: () => void; onSave: (text: string, share: boolean) => Promise<void> }) {
  const { t } = useI18n();
  const [text, setText] = useState("");
  const [share, setShare] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <Dialog title={t("Write a review for {name}", { name })} onClose={onClose}
      footer={<><SecondaryButton onClick={onClose}>{t("Cancel")}</SecondaryButton>
        <PrimaryButton disabled={busy || !text.trim()} onClick={() => { setBusy(true); onSave(text, share).catch((e) => { setErr(errorMessage(e)); setBusy(false); }); }}>{t("Save")}</PrimaryButton></>}>
      <p className="text-[0.85em] text-[#475467]">{t("Give a student feedback outside of a sprint review.")}</p>
      <Field label={t("Feedback")} hint={`${text.length}/2000`}>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} maxLength={2000} className={inputCls} />
      </Field>
      <label className="flex items-center gap-[0.6em] text-[0.85em] text-[#1b2d54]">
        <input type="checkbox" checked={share} onChange={(e) => setShare(e.target.checked)} className="size-4 accent-[#0f7378]" /> {t("Share with the student")}
      </label>
      {err && <p className="text-[0.85em] text-[#c81e1e]">{err}</p>}
    </Dialog>
  );
}
