"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft, CalendarDays, Check, CheckCircle2, Clock, ExternalLink, Link2, Video } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { errorMessage } from "@/lib/api-client";
import { tk } from "@/lib/i18n/translate";
import { getMonitorProfile, getMonitorSession, saveSessionNotes, setSessionNoShow, type MonitorSession, type SessionDetails as Details } from "@/lib/monitor-api";
import { Avatar, Card, Eyebrow, Pill, fieldCls, ghostBtn, primaryBtn } from "./mentor-ui";
import { LoadState, initialsOf, sessionDate, sessionTime, useMentorData } from "./mentor-data";
import { cn } from "@/lib/utils";

const SESSION_TYPE: Record<string, string> = { OneToOne: tk("1:1 session"), Group: tk("Group session") };

export default function SessionDetails({ id }: { id: string }) {
  const load = useCallback(() => Promise.all([getMonitorSession(id), getMonitorProfile().then((p) => p.meetingLink, () => null)]), [id]);
  const { data, error, reload } = useMentorData(load, tk("Could not load this session."));
  if (!data) {
    return (
      <>
        <BackLink />
        <LoadState error={error} onRetry={reload} />
      </>
    );
  }
  return <SessionView key={data[0].id} initial={data[0]} mentorLink={data[1]} />;
}

function BackLink() {
  const t = useT();
  return (
    <Link href={"/mentor/sessions" as Route} className="flex w-fit items-center gap-1.5 text-xs font-semibold text-[#0f8f8c]">
      <ArrowLeft className="size-3.5 rtl:rotate-180" /> {t("Back to sessions")}
    </Link>
  );
}

function SessionView({ initial, mentorLink }: { initial: MonitorSession; mentorLink: string | null }) {
  const t = useT();
  const [session, setSession] = useState(initial);
  const status = session.status;
  const [confirm, setConfirm] = useState(false);
  const [banner, setBanner] = useState(false);
  const [notes, setNotes] = useState(initial.mentorNotes ?? "");
  const [goals, setGoals] = useState(initial.learningGoals ?? "");
  const [followUp, setFollowUp] = useState(initial.followUpPoints ?? "");
  const [notesSaved, setNotesSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const meetingLink = session.meetingLink || mentorLink;

  useEffect(() => {
    if (!confirm) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setConfirm(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirm]);

  const done = status === "Completed";
  const noShow = status === "NoShow";
  const upcoming = status === "Upcoming" || status === "Cancelled";

  /** Every detail is saved each time, so send the current text of all of them. */
  const details = (): Details => ({
    topic: session.topic,
    agenda: session.agenda,
    meetingLink: session.meetingLink,
    mentorNotes: notes.trim() || null,
    followUpPoints: followUp.trim() || null,
    learningGoals: goals.trim() || null,
  });

  async function run(action: () => Promise<MonitorSession>, after?: () => void) {
    setBusy(true);
    setActionError(null);
    try {
      setSession(await action());
      after?.();
    } catch (e) {
      setActionError(errorMessage(e, t("Could not update the session.")));
    } finally {
      setBusy(false);
    }
  }
  const markDone = () => run(() => setSessionNoShow(session.id, details(), false), () => { setConfirm(false); setBanner(true); });
  const markNoShow = () => run(() => setSessionNoShow(session.id, details(), true), () => setBanner(false));
  const saveNotes = () => run(() => saveSessionNotes(session.id, details()), () => setNotesSaved(true));

  return (
    <>
      <BackLink />
      <header>
        <Eyebrow>{t("Session details")}</Eyebrow>
        <h1 className="mt-1 text-3xl font-bold">{session.studentName} • {t(SESSION_TYPE[session.type] ?? session.type)}</h1>
        <p className="mt-1 text-sm text-[#14305a]/65">{t("Review the session plan, add private notes and update the outcome when appropriate.")}</p>
      </header>

      {banner && (
        <p role="status" className="flex items-center gap-2 rounded-xl bg-[#d5f0eb] px-4 py-3 text-sm font-semibold text-[#0b7a77]">
          <CheckCircle2 className="size-4" /> {t("Session marked as completed.")}
        </p>
      )}
      {actionError && <p role="alert" className="rounded-xl bg-[#fdecec] px-4 py-3 text-sm font-semibold text-[#b83232]">{actionError}</p>}

      <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
        <div className="flex flex-col gap-4">
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar initials={initialsOf(session.studentName)} size="lg" />
                <div>
                  <Eyebrow>{t("Student")}</Eyebrow>
                  <Link href={`/mentor/students/${session.studentId}` as Route} className="text-lg font-bold hover:underline">{session.studentName}</Link>
                  <p className="text-xs text-[#14305a]/60">{t(SESSION_TYPE[session.type] ?? session.type)}</p>
                </div>
              </div>
              <Pill tone={noShow ? "amber" : "teal"}>{noShow ? t("No-show") : done ? t("Completed") : t("Upcoming")}</Pill>
            </div>
            <dl className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: CalendarDays, k: t("Date"), v: sessionDate(session.startsUtc) },
                { icon: Clock, k: t("Time"), v: sessionTime(session.startsUtc, session.durationMinutes) },
                { icon: Video, k: t("Format"), v: t("Live video session") },
              ].map((r) => (
                <div key={r.k} className="flex items-center gap-2.5 rounded-xl bg-[#f2faf8] p-3">
                  <r.icon className="size-4 text-[#0f8f8c]" />
                  <div className="text-xs">
                    <dt className="text-[#14305a]/55">{r.k}</dt>
                    <dd className="font-semibold">{r.v}</dd>
                  </div>
                </div>
              ))}
            </dl>
            <div>
              <Eyebrow>{t("Session summary")}</Eyebrow>
              <h2 className="text-base font-bold">{t("What you will cover")}</h2>
              <p className="mt-1 text-sm text-[#14305a]/70">{session.agenda || t("The student did not add an agenda for this session.")}</p>
            </div>
          </Card>

          <Card className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <Eyebrow>{t("Private session notes")}</Eyebrow>
                <h2 className="text-base font-bold">{session.topic || t("Session notes")}</h2>
              </div>
              <Pill tone="gray">{t("Only you can see this")}</Pill>
            </div>
            <label className="block text-xs font-semibold">
              {t("Session notes")}
              <textarea rows={4} value={notes} onChange={(e) => { setNotes(e.target.value); setNotesSaved(false); }} placeholder={t("Write what you covered and what to remember.")} className={cn(fieldCls, "mt-1.5 resize-none font-normal")} />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs font-semibold">
                {t("Learning goals")}
                <textarea rows={3} value={goals} onChange={(e) => { setGoals(e.target.value); setNotesSaved(false); }} className={cn(fieldCls, "mt-1.5 resize-none font-normal")} />
              </label>
              <label className="block text-xs font-semibold">
                {t("Follow-up points")}
                <textarea rows={3} value={followUp} onChange={(e) => { setFollowUp(e.target.value); setNotesSaved(false); }} className={cn(fieldCls, "mt-1.5 resize-none font-normal")} />
              </label>
            </div>
            <div className="flex items-center justify-end gap-3">
              {notesSaved && <span role="status" className="text-xs font-semibold text-[#0b7a77]">{t("Notes saved")}</span>}
              <button type="button" className={primaryBtn} disabled={busy || (!notes && !goals && !followUp)} onClick={saveNotes}>
                <Check className="size-4" /> {t("Save Notes")}
              </button>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card className="space-y-3">
            <div>
              <Eyebrow>{t("Fixed meeting link")}</Eyebrow>
              <h2 className="text-base font-bold">{t("Join the session")}</h2>
              <p className="text-xs text-[#14305a]/60">{done ? t("This session is finished, so the link is closed.") : t("Use this link when it is time to start the session.")}</p>
            </div>
            {meetingLink ? (
              <p dir="ltr" className="flex items-center gap-2 truncate rounded-xl bg-[#f2faf8] px-3 py-2 text-xs"><Link2 className="size-3.5 shrink-0 text-[#0f8f8c]" /> <span className="truncate">{meetingLink}</span></p>
            ) : (
              <Link href={"/mentor/profile" as Route} className="flex items-center gap-2 rounded-xl bg-[#fff1d6] px-3 py-2 text-xs font-semibold text-[#a86a00]"><Link2 className="size-3.5 shrink-0" /> {t("Add your fixed meeting link in your profile.")}</Link>
            )}
            {done || noShow || !meetingLink ? (
              <button type="button" disabled className={cn(primaryBtn, "w-full")}><ExternalLink className="size-4" /> {t("Open Meeting Link")}</button>
            ) : (
              <a href={meetingLink} target="_blank" rel="noopener noreferrer" className={cn(primaryBtn, "w-full")}><ExternalLink className="size-4" /> {t("Open Meeting Link")}</a>
            )}
          </Card>

          <Card className="space-y-3">
            <div>
              <Eyebrow>{t("Session outcome")}</Eyebrow>
              <h2 className="text-base font-bold">{t("Update status")}</h2>
              <p className="text-xs text-[#14305a]/60">{t("Update the outcome once the session has ended.")}</p>
            </div>
            {done ? (
              <>
                <p className="flex items-center gap-2 rounded-xl bg-[#e9f7f4] px-3 py-3 text-xs font-semibold"><CheckCircle2 className="size-4 text-[#0f8f8c]" /> {t("Session marked as completed")}</p>
                <button type="button" disabled={busy} className="w-full text-center text-xs font-semibold text-[#14305a]/70 underline-offset-2 hover:underline disabled:opacity-50" onClick={markNoShow}>{t("Mark Student No-show")}</button>
              </>
            ) : noShow ? (
              <>
                <p className="rounded-xl bg-[#fff1d6] px-3 py-3 text-xs font-semibold text-[#a86a00]">{t("The student did not attend this session.")}</p>
                <button type="button" disabled={busy} className={cn(ghostBtn, "w-full")} onClick={markDone}>{t("Undo no-show")}</button>
              </>
            ) : (
              <>
                <button type="button" disabled={upcoming || busy} className={cn(primaryBtn, "w-full")} onClick={() => setConfirm(true)}><Check className="size-4" /> {t("Mark Completed")}</button>
                <button type="button" disabled={upcoming || busy} className="w-full text-center text-xs font-semibold text-[#14305a]/70 underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:no-underline" onClick={markNoShow}>{t("Mark Student No-show")}</button>
              </>
            )}
          </Card>
        </div>
      </div>

      {confirm && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-[#14305a]/50 p-4" role="dialog" aria-modal="true" aria-labelledby="complete-title">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <span className="mx-auto grid size-10 place-items-center rounded-full bg-[#e3f4f1] text-[#0f8f8c]"><Check className="size-5" /></span>
            <p className="mt-3 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-[#0f8f8c]">{t("Changing session status")}</p>
            <h2 id="complete-title" className="mt-1 text-lg font-bold">{t("Mark session as completed?")}</h2>
            <p className="mt-1 text-xs text-[#14305a]/65">{t("This closes the session and moves it to your completed list.")}</p>
            <div className="mt-5 flex gap-3">
              <button type="button" autoFocus className={cn(ghostBtn, "flex-1")} onClick={() => setConfirm(false)}>{t("Cancel")}</button>
              <button type="button" disabled={busy} className={cn(primaryBtn, "flex-1")} onClick={markDone}>{t("Confirm")}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
