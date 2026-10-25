"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { AlertTriangle, Check, ChevronDown, Clock, Link2, LoaderCircle } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { useI18n } from "@/lib/i18n/client";
import {
  getReviewSheet, saveReviewDraft, saveStudentReview, submitReviewSheet,
  type ReviewSheet, type StudentReview,
} from "@/lib/monitor-api";
import { cn } from "@/lib/utils";
import { Card, ErrorState, LevelBadge, MentorAvatar, MentorPage, Pill, PrimaryButton, ProgressBar, RolePill, SecondaryButton, Skeleton, useRelative } from "../mentor-area-ui";
import { useApi } from "../use-api";

const CRITERIA = [
  { key: "qualityOfWork", label: "Quality of work" },
  { key: "deliveredOnTime", label: "Delivered on time" },
  { key: "teamwork", label: "Teamwork" },
  { key: "communication", label: "Communication" },
  { key: "roleSkills", label: "Role skills" },
] as const;
type ScoreKey = (typeof CRITERIA)[number]["key"];

const KIND: Record<string, string> = { Figma: "Figma", GitHub: "GitHub", LiveSite: "Live site", Api: "API", Demo: "Demo", TestReport: "Test report", Standup: "Docs", Grooming: "Docs", Other: "Link" };

export default function ReviewScreen({ squadId, round }: { squadId: string; round?: number }) {
  const { t, intl } = useI18n();
  const router = useRouter();
  const rel = useRelative();
  const { data, error, loading, reload, setData } = useApi(() => getReviewSheet(squadId, round), [squadId, round]);
  const [open, setOpen] = useState<string | null>(null);
  const [decision, setDecision] = useState<"Approved" | "ChangesRequested" | null>(null);
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState<"draft" | "submit" | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!data) return;
    setDecision(data.decision);
    setFeedback(data.feedback ?? "");
    setOpen((o) => o ?? data.students.find((s) => s.status !== "Done")?.studentId ?? null);
  }, [data]);

  if (error)
    return (
      <MentorPage title={t("Review")}>
        <ErrorState title={t("We could not load this review")} onRetry={reload} back={{ href: "/mentor/reviews", label: t("Back to Reviews") }} error={error} />
      </MentorPage>
    );
  if (loading || !data)
    return (
      <MentorPage title={t("Review")}>
        <div className="grid gap-[1.4em] lg:grid-cols-[28em_1fr]">
          <Card className="space-y-4">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-5 w-full" />)}</Card>
          <Card className="space-y-4">{Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-8 w-full" />)}</Card>
        </div>
      </MentorPage>
    );

  const done = data.students.filter((s) => s.status === "Done").length;
  const canSubmit = !data.readOnly && done === data.students.length && !!decision && feedback.trim().length > 0;
  const countdown = data.dueUtc ? rel.countdown(data.dueUtc) : null;
  const updateStudent = (s: StudentReview) => setData({ ...data, students: data.students.map((x) => (x.studentId === s.studentId ? s : x)) });

  const saveDraft = () => {
    setBusy("draft");
    saveReviewDraft(squadId, decision, feedback).then(
      () => { setBusy(null); setNotice({ ok: true, text: t("Draft saved.") }); },
      (e) => { setBusy(null); setNotice({ ok: false, text: errorMessage(e) }); },
    );
  };
  const submit = () => {
    if (!decision) return;
    setBusy("submit");
    submitReviewSheet(squadId, decision, feedback).then(
      () => router.push(`/mentor/squads/${squadId}?tab=reviews` as Route),
      (e) => { setBusy(null); setNotice({ ok: false, text: errorMessage(e) }); },
    );
  };

  return (
    <MentorPage
      title={t("Review · {squad}", { squad: data.squadName })}
      subtitle={
        data.submittedUtc
          ? `${data.projectTitle} · ${t("Round {n}", { n: data.round })} · ${t("submitted {date}", { date: new Date(data.submittedUtc).toLocaleString(intl, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) })}`
          : data.projectTitle
      }
      meta={
        <>
          <LevelBadge level={data.level} />
          {countdown && <Pill tone={countdown.overdue ? "red" : "amber"} dot={false} icon={<Clock className="size-[1em]" />}>{countdown.label}</Pill>}
          {data.readOnly && <Pill tone="gray" dot={false}>{t("Read only")}</Pill>}
        </>
      }
    >
      <div className="grid items-start gap-[1.4em] lg:grid-cols-[28em_1fr]">
        <Card>
          <h2 className="text-[1.15em] font-bold text-[#1b2d54]">{t("The work")}</h2>
          <div className="mt-[1em] rounded-[1em] bg-[#eef6f6] p-[1em]">
            <p className="font-semibold text-[#1b2d54]">{data.projectTitle}</p>
            <p className="mt-[0.3em] text-[0.8em] text-[#475467]">{data.projectDescription}</p>
          </div>
          <div className="mt-[1em] grid grid-cols-2 gap-[0.8em]">
            <WorkStat label={t("Tasks done")} a={data.tasksDone} b={data.tasksTotal} />
            <WorkStat label={t("Story points")} a={data.pointsDone} b={data.pointsTotal} />
          </div>
          <h3 className="mt-[1.4em] font-semibold text-[#1b2d54]">{t("Member work")}</h3>
          <ul className="mt-[0.6em] divide-y divide-[#eef2f6]">
            {data.work.map((w) => (
              <li key={w.studentId} className="flex items-center gap-[0.7em] py-[0.8em]">
                <MentorAvatar name={w.fullName} photoUrl={w.photoUrl} className="size-[2.2em]" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.85em] font-semibold text-[#1b2d54]">{w.fullName}</span>
                  <span className="text-[0.72em] text-[#64748b]">{t("{n} tasks done", { n: w.tasksDone })}</span>
                </span>
                <span className="flex flex-wrap justify-end gap-[0.4em]">
                  {w.links.slice(0, 2).map((l) => (
                    <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-[0.3em] rounded-full bg-[#eef6f6] px-[0.7em] py-[0.2em] text-[0.72em] font-medium text-[#0f7378] hover:bg-[#e0f4f2]">
                      <Link2 className="size-[1em]" /> {t(KIND[l.kind] ?? l.kind)}
                    </a>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[1.15em] font-bold text-[#1b2d54]">{t("Student reviews")}</h2>
            <span className="flex items-center gap-[0.7em] text-[0.82em] text-[#0f7378]">
              {t("{a} of {b} done", { a: done, b: data.students.length })}
              <ProgressBar value={(done / Math.max(1, data.students.length)) * 100} className="w-[7em]" />
            </span>
          </div>
          <div className="mt-[1em] space-y-[0.8em]">
            {data.students.map((s) => (
              <StudentPanel key={s.studentId} squadId={squadId} review={s} readOnly={data.readOnly} open={open === s.studentId}
                onToggle={() => setOpen(open === s.studentId ? null : s.studentId)} onSaved={updateStudent} />
            ))}
          </div>

          <h3 className="mt-[1.6em] text-[1.1em] font-bold text-[#1b2d54]">{t("Squad decision")}</h3>
          <div className="mt-[0.8em] grid gap-[0.8em] sm:grid-cols-2">
            <DecisionCard selected={decision === "Approved"} disabled={data.readOnly} onClick={() => setDecision("Approved")}
              title={t("Approve")} text={t("Squad becomes Completed")} />
            <DecisionCard selected={decision === "ChangesRequested"} disabled={data.readOnly} onClick={() => setDecision("ChangesRequested")}
              title={t("Request changes")} text={t("Back to Working with your feedback")} />
          </div>
          <label className="mt-[1.2em] block">
            <span className="flex justify-between text-[0.85em] font-medium text-[#1b2d54]">
              {t("Squad feedback (required)")} <span className="font-normal text-[#64748b]">{feedback.length} / 2000</span>
            </span>
            <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} maxLength={2000} rows={4} disabled={data.readOnly}
              className="mt-[0.4em] w-full rounded-[0.9em] border border-[#d6dde6] px-[1em] py-[0.8em] text-[0.88em] text-[#1b2d54] outline-none focus:border-[#0f7378] disabled:bg-[#f7fafc]" />
          </label>
          {notice && <p className={cn("mt-[0.6em] text-[0.82em]", notice.ok ? "text-[#167a3e]" : "text-[#c81e1e]")}>{notice.text}</p>}
          {!data.readOnly && (
            <div className="mt-[1em] flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-center gap-[0.5em] text-[0.8em] text-[#475467]">
                <AlertTriangle className="size-[1.1em] text-[#d97706]" /> {t("Submit is disabled until every student has scores and the feedback is written.")}
              </p>
              <div className="flex gap-[0.6em]">
                <SecondaryButton onClick={saveDraft} disabled={busy !== null}>{busy === "draft" ? <LoaderCircle className="size-[1em] animate-spin" /> : null}{t("Save draft")}</SecondaryButton>
                <PrimaryButton onClick={submit} disabled={!canSubmit || busy !== null}>
                  {busy === "submit" ? <LoaderCircle className="size-[1em] animate-spin" /> : <Check className="size-[1em]" />} {t("Submit")}
                </PrimaryButton>
              </div>
            </div>
          )}
        </Card>
      </div>
    </MentorPage>
  );
}

function WorkStat({ label, a, b }: { label: string; a: number; b: number }) {
  return (
    <div className="rounded-[1em] border border-[#e6ebf1] bg-[#f7fafc] p-[0.9em]">
      <p className="text-[0.78em] text-[#475467]">{label}</p>
      <p className="mt-[0.2em] text-[1.4em] font-extrabold text-[#1b2d54]">{a} / {b}</p>
      <ProgressBar value={(a / Math.max(1, b)) * 100} className="mt-[0.5em]" />
    </div>
  );
}

function DecisionCard({ selected, disabled, onClick, title, text }: { selected: boolean; disabled: boolean; onClick: () => void; title: string; text: string }) {
  return (
    <button type="button" disabled={disabled} onClick={onClick} aria-pressed={selected}
      className={cn("flex items-center gap-[0.9em] rounded-[1em] border p-[1em] text-start transition", selected ? "border-[#0f7378] bg-[#eef8f7] ring-1 ring-[#0f7378]" : "border-[#d6dde6] bg-white hover:bg-[#f7fafc]")}>
      <span className={cn("grid size-[1.6em] shrink-0 place-items-center rounded-full border-2", selected ? "border-[#1b2d54] bg-[#1b2d54] text-white" : "border-[#cbd5e1]")}>
        {selected && <Check className="size-[0.9em]" />}
      </span>
      <span>
        <span className={cn("block font-semibold", selected ? "text-[#0f7378]" : "text-[#1b2d54]")}>{title}</span>
        <span className="text-[0.78em] text-[#475467]">{text}</span>
      </span>
    </button>
  );
}

/** One student's scores and texts; changes are saved after a short pause, done once everything is filled. */
function StudentPanel({ squadId, review, readOnly, open, onToggle, onSaved }: {
  squadId: string; review: StudentReview; readOnly: boolean; open: boolean; onToggle: () => void; onSaved: (r: StudentReview) => void;
}) {
  const { t } = useI18n();
  const [draft, setDraft] = useState(review);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [err, setErr] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (readOnly) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const complete = CRITERIA.every((c) => draft[c.key] != null) && !!draft.strengths?.trim();
      setState("saving");
      saveStudentReview(squadId, review.studentId, {
        qualityOfWork: draft.qualityOfWork, deliveredOnTime: draft.deliveredOnTime, teamwork: draft.teamwork, communication: draft.communication,
        roleSkills: draft.roleSkills, strengths: draft.strengths, toImprove: draft.toImprove, shareWithStudent: draft.shareWithStudent, done: complete,
      }).then((saved) => { setState("saved"); setErr(null); onSaved(saved); }, (e) => { setState("error"); setErr(errorMessage(e)); });
    }, 700);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  const scores = CRITERIA.map((c) => draft[c.key]).filter((v): v is number => v != null);
  const overall = scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : null;
  const status = review.status;
  const set = (key: ScoreKey, value: number) => setDraft({ ...draft, [key]: value });
  const roleLabel = draft.role === "UIUX" ? "UI/UX" : draft.role;

  return (
    <section className={cn("rounded-[1.1em] border transition", open ? "border-[#9fd3cf] ring-1 ring-[#9fd3cf]/60" : "border-[#e6ebf1]")}>
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-[0.7em] px-[1em] py-[0.9em] text-start">
        <MentorAvatar name={draft.fullName} photoUrl={draft.photoUrl} className="size-[2.3em]" />
        <span className="font-semibold text-[#1b2d54]">{draft.fullName}</span>
        <RolePill role={draft.role} />
        <span className="ms-auto flex items-center gap-[0.6em] text-[0.8em]">
          {state === "saving" && <LoaderCircle className="size-[1em] animate-spin text-[#64748b]" />}
          {status === "Done" ? <span className="flex items-center gap-1 text-[#167a3e]"><Check className="size-[1em]" /> {t("Done")}</span>
            : status === "InProgress" ? <Pill tone="blue" dot={false}>{t("In progress")}</Pill> : <span className="text-[#64748b]">{t("Not started")}</span>}
          <ChevronDown className={cn("size-[1.1em] text-[#475467] transition", open && "rotate-180")} />
        </span>
      </button>
      {open && (
        <div className="space-y-[0.9em] border-t border-[#eef2f6] px-[1em] pb-[1.1em] pt-[1em]">
          {CRITERIA.map((c) => (
            <div key={c.key} className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[0.85em] text-[#1b2d54]">{c.key === "roleSkills" ? `${t(c.label)} · ${t(roleLabel)}` : t(c.label)}</span>
              <span className="flex gap-[0.4em]" role="radiogroup" aria-label={t(c.label)}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" role="radio" aria-checked={draft[c.key] === n} disabled={readOnly} onClick={() => set(c.key, n)}
                    className={cn("grid size-[2.1em] place-items-center rounded-full border text-[0.85em] transition",
                      draft[c.key] === n ? "border-[#1b2d54] bg-gradient-to-br from-[#0f6b70] to-[#1b2d54] font-semibold text-white" : "border-[#d6dde6] text-[#1b2d54] hover:bg-[#f2f6f9]")}>
                    {n}
                  </button>
                ))}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between rounded-[0.9em] bg-[#eef6f6] px-[1em] py-[0.8em]">
            <span className="text-[0.88em] font-semibold text-[#1b2d54]">{t("Overall score")} <span className="ms-[0.5em] text-[0.85em] font-normal text-[#64748b]">{t("calculated automatically")}</span></span>
            <span className="text-[1.3em] font-extrabold text-[#0f7378]">{overall ?? "—"} / 5</span>
          </div>
          <TextBox label={t("Strengths")} value={draft.strengths ?? ""} disabled={readOnly} onChange={(v) => setDraft({ ...draft, strengths: v })} />
          <TextBox label={t("To improve")} value={draft.toImprove ?? ""} disabled={readOnly} onChange={(v) => setDraft({ ...draft, toImprove: v })} />
          <label className="flex items-center gap-[0.7em] text-[0.85em] text-[#1b2d54]">
            <button type="button" role="switch" aria-checked={draft.shareWithStudent} disabled={readOnly} onClick={() => setDraft({ ...draft, shareWithStudent: !draft.shareWithStudent })}
              className={cn("relative h-[1.5em] w-[2.7em] rounded-full transition", draft.shareWithStudent ? "bg-[#0f7378]" : "bg-[#cbd5e1]")}>
              <span className={cn("absolute top-[0.15em] size-[1.2em] rounded-full bg-white shadow transition-all", draft.shareWithStudent ? "start-[1.35em]" : "start-[0.15em]")} />
            </button>
            {t("Share with the student")}
          </label>
          {err && <p className="text-[0.8em] text-[#c81e1e]">{err}</p>}
          {!readOnly && status !== "Done" && <p className="text-[0.75em] text-[#64748b]">{t("Score all five criteria and write a strength to mark this review done.")}</p>}
        </div>
      )}
    </section>
  );
}

function TextBox({ label, value, onChange, disabled }: { label: string; value: string; onChange: (v: string) => void; disabled: boolean }) {
  return (
    <label className="block">
      <span className="text-[0.85em] font-medium text-[#1b2d54]">{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} maxLength={1000} rows={2} disabled={disabled}
        className="mt-[0.4em] w-full rounded-[0.9em] border border-[#d6dde6] px-[1em] py-[0.7em] text-[0.85em] text-[#1b2d54] outline-none focus:border-[#0f7378] disabled:bg-[#f7fafc]" />
    </label>
  );
}

export type { ReviewSheet };
