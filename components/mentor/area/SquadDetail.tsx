"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import { ArrowLeft, ArrowRight, CalendarClock, ClipboardCheck, Clock, Flag, MessageSquare } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { useI18n } from "@/lib/i18n/client";
import {
  getMentorSquadDetail, getMentorSquads, markSquadLate, proposeDateChange, sendMentorReport,
  type DelayReason, type ReportCategory, type SquadDetail as Detail,
} from "@/lib/monitor-api";
import {
  Card, Dialog, EmptyState, ErrorState, Field, LevelBadge, LinkButton, MentorPage, Pill, PrimaryButton, ProgressBar, SecondaryButton, Skeleton,
  SquadStatePill, UnderlineTabs, inputCls,
} from "../mentor-area-ui";
import { useApi } from "../use-api";
import { SquadIcon, useSquadText } from "./squad-parts";
import { BoardTab, ChatTab, LinksTab, MembersTab, ProjectTab, ReviewsTab, SprintTimeline } from "./squad-tabs";

export type Tab = "members" | "project" | "board" | "links" | "reviews" | "chat";
const TABS: Tab[] = ["members", "project", "board", "links", "reviews", "chat"];

export default function SquadDetail({ id }: { id: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const initial = params.get("tab") as Tab | null;
  const [tab, setTab] = useState<Tab>(initial && TABS.includes(initial) ? initial : "members");
  const [dialog, setDialog] = useState<"late" | "date" | "report" | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const { data, error, loading, reload, setData } = useApi(() => getMentorSquadDetail(id), [id]);

  const changeTab = (next: Tab) => {
    setTab(next);
    router.replace(`/mentor/squads/${id}?tab=${next}` as Route, { scroll: false });
  };

  if (error?.code === "NOT_YOUR_SQUAD" || error?.status === 404)
    return (
      <MentorPage title={t("Squad detail")} subtitle={<Crumb />}>
        <NoAccess notFound={error.status === 404} />
      </MentorPage>
    );
  if (error)
    return (
      <MentorPage title={t("Squad detail")} subtitle={<Crumb />}>
        <ErrorState title={t("We could not load this squad")} onRetry={reload} back={{ href: "/mentor/squads", label: t("Back to My squads") }} error={error} />
      </MentorPage>
    );
  if (loading || !data)
    return (
      <MentorPage title={t("Squad detail")} subtitle={<Crumb />}>
        <Card className="space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-9 w-2/3" />
        </Card>
        <Card className="space-y-5">
          {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-5 w-full" />)}
        </Card>
      </MentorPage>
    );

  const s = data.squad;
  const done = !s.isCurrent;
  return (
    <MentorPage title={s.name} subtitle={<Crumb project={s.projectTitle} />}>
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-[1.4em]">
          <div className="flex min-w-0 items-start gap-[1em]">
            <Link href={"/mentor/squads" as Route} aria-label={t("Back to My squads")} className="grid size-[2.8em] shrink-0 place-items-center rounded-[0.8em] border border-[#d6dde6] text-[#1b2d54] hover:bg-[#f7f9fc]">
              <ArrowLeft className="size-[1.1em] rtl:-scale-x-100" />
            </Link>
            <div className="min-w-0">
              <h2 className="text-[1.35em] font-bold text-[#1b2d54]">{s.projectTitle}</h2>
              <div className="mt-[0.5em] flex flex-wrap gap-[0.5em]">
                <LevelBadge level={s.level} />
                <SquadStatePill state={s.state} />
                {data.pendingDateChange && <Pill tone="purple" dot={false}>{t("Date change waits for the Admin")}</Pill>}
              </div>
            </div>
          </div>
          <SprintProgress detail={data} />
        </div>
        <div className="mt-[1.2em] flex flex-wrap gap-[0.6em]">
          <SecondaryButton onClick={() => changeTab("chat")}><MessageSquare className="size-[1.1em]" /> {t("Message squad")}</SecondaryButton>
          <PrimaryButton disabled={s.state !== "WaitingForReview"} onClick={() => router.push(`/mentor/reviews/${s.id}` as Route)}
            title={s.state !== "WaitingForReview" ? t("The squad has not submitted its work yet.") : undefined}>
            <ClipboardCheck className="size-[1.1em]" /> {t("Start review")}
          </PrimaryButton>
          <SecondaryButton warn disabled={done} onClick={() => setDialog("late")}><Clock className="size-[1.1em]" /> {t("Mark as late")}</SecondaryButton>
          <SecondaryButton disabled={done || !!data.pendingDateChange} onClick={() => setDialog("date")}><CalendarClock className="size-[1.1em]" /> {t("Propose date change")}</SecondaryButton>
          <SecondaryButton danger onClick={() => setDialog("report")}><Flag className="size-[1.1em]" /> {t("Report to Admin")}</SecondaryButton>
        </div>
        {notice && <p role="status" className="mt-[1em] rounded-[0.8em] bg-[#e3f6ea] px-[1em] py-[0.6em] text-[0.85em] text-[#167a3e]">{notice}</p>}
      </Card>

      <Card>
        <UnderlineTabs
          value={tab}
          onChange={changeTab}
          tabs={TABS.map((v) => ({ value: v, label: t({ members: "Members", project: "Project", board: "Board", links: "Work links", reviews: "Reviews", chat: "Chat" }[v]) }))}
        />
        <div className="pt-[1.2em]">
          {tab === "members" && <MembersTab detail={data} onChanged={reload} />}
          {tab === "project" && <ProjectTab detail={data} />}
          {tab === "board" && <BoardTab detail={data} />}
          {tab === "links" && <LinksTab detail={data} onLinks={(links) => setData({ ...data, links })} />}
          {tab === "reviews" && <ReviewsTab detail={data} />}
          {tab === "chat" && <ChatTab detail={data} />}
        </div>
      </Card>

      {tab === "members" && <SprintTimeline detail={data} />}

      {dialog === "late" && <LateDialog id={id} onClose={() => setDialog(null)} onDone={(m) => { setDialog(null); setNotice(m); reload(); }} />}
      {dialog === "date" && <DateDialog detail={data} onClose={() => setDialog(null)} onDone={(m) => { setDialog(null); setNotice(m); reload(); }} />}
      {dialog === "report" && <ReportDialog detail={data} onClose={() => setDialog(null)} onDone={(m) => { setDialog(null); setNotice(m); }} />}
    </MentorPage>
  );
}

function Crumb({ project }: { project?: string }) {
  const { t } = useI18n();
  return (
    <span>
      <Link href={"/mentor/squads" as Route} className="hover:underline">{t("My squads")}</Link> › {project ?? t("Squad detail")}
    </span>
  );
}

function SprintProgress({ detail }: { detail: Detail }) {
  const text = useSquadText();
  const s = detail.squad;
  return (
    <div className="w-full max-w-[19em]">
      <div className="flex items-center justify-between text-[0.85em]">
        <span className="text-[#1b2d54]">{[s.sprintName, text.sprintNote(s)].filter(Boolean).join(" · ")}</span>
        <b className="text-[1.1em] text-[#0f7378]">{s.progress}%</b>
      </div>
      <ProgressBar value={s.progress} className="mt-[0.6em]" />
    </div>
  );
}

function NoAccess({ notFound }: { notFound: boolean }) {
  const { t } = useI18n();
  const { data } = useApi(getMentorSquads);
  const mine = data?.filter((r) => r.isCurrent) ?? [];
  const short = { WaitingForReview: t("Review"), Working: t("Working"), Late: t("Late"), ChangesRequested: t("Working"), Completed: t("Completed") } as const;
  const tone = { WaitingForReview: "amber", Working: "blue", Late: "red", ChangesRequested: "blue", Completed: "green" } as const;
  return (
    <>
      <Card>
        <EmptyState
          art="lock"
          title={notFound ? t("This squad does not exist") : t("You do not monitor this squad")}
          text={notFound ? t("The link may be old. Open one of your own squads instead.")
            : t("This squad is assigned to another monitor, so its details are not available to you. You can only open squads from your My squads list. If you think this is a mistake, contact the Admin.")}
        >
          <LinkButton href="/mentor/squads" primary>{t("Back to My squads")}</LinkButton>
          <LinkButton href="/mentor/reports?report=1">{t("Contact Admin")}</LinkButton>
        </EmptyState>
      </Card>
      {mine.length > 0 && (
        <Card>
          <h3 className="text-[1.15em] font-bold text-[#1b2d54]">{t("Squads you monitor")}</h3>
          <p className="text-[0.82em] text-[#64748b]">{t("Open one of your own squads instead")}</p>
          <div className="mt-[1em] grid gap-[1em] sm:grid-cols-2 xl:grid-cols-4">
            {mine.map((r) => (
              <Link key={r.id} href={`/mentor/squads/${r.id}` as Route} className="rounded-[1em] bg-[#f4f8fa] p-[1em] hover:bg-[#eef4f7]">
                <span className="flex items-center gap-[0.7em]">
                  <SquadIcon id={r.id} className="size-[2.3em]" />
                  <span className="min-w-0">
                    <span className="block truncate text-[0.88em] font-semibold text-[#1b2d54]">{r.name}</span>
                    <span className="block truncate text-[0.72em] text-[#64748b]">{r.projectTitle}</span>
                  </span>
                </span>
                <span className="mt-[0.8em] flex items-center justify-between">
                  <Pill tone={tone[r.state]} dot={false}>{short[r.state]}</Pill>
                  <span className="flex items-center gap-1 text-[0.8em] font-semibold text-[#0f7378]">{t("Open")} <ArrowRight className="size-[1em] rtl:-scale-x-100" /></span>
                </span>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </>
  );
}

const DELAY_REASONS: DelayReason[] = ["TechnicalBlock", "MissingMember", "ScopeTooBig", "Other"];
export const delayLabel = (r: string) => ({ TechnicalBlock: "Technical block", MissingMember: "Missing member", ScopeTooBig: "Scope too big", Other: "Other" })[r] ?? r;

function LateDialog({ id, onClose, onDone }: { id: string; onClose: () => void; onDone: (message: string) => void }) {
  const { t } = useI18n();
  const [reason, setReason] = useState<DelayReason>("TechnicalBlock");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const save = () => {
    setBusy(true);
    markSquadLate(id, reason, note).then(() => onDone(t("The squad is marked late. The Admin and the students were told.")), (e) => { setErr(errorMessage(e)); setBusy(false); });
  };
  return (
    <Dialog title={t("Mark as late")} onClose={onClose}
      footer={<><SecondaryButton onClick={onClose}>{t("Cancel")}</SecondaryButton><PrimaryButton disabled={busy} onClick={save}>{t("Mark as late")}</PrimaryButton></>}>
      <p className="text-[0.85em] text-[#475467]">{t("Late squads notify the Admin and all students.")}</p>
      <Field label={t("Reason")}>
        <select value={reason} onChange={(e) => setReason(e.target.value as DelayReason)} className={inputCls}>
          {DELAY_REASONS.map((r) => <option key={r} value={r}>{t(delayLabel(r))}</option>)}
        </select>
      </Field>
      <Field label={t("Note (optional)")} hint={`${note.length}/500`}>
        <textarea value={note} maxLength={500} rows={3} onChange={(e) => setNote(e.target.value)} className={inputCls} />
      </Field>
      {err && <p className="text-[0.85em] text-[#c81e1e]">{err}</p>}
    </Dialog>
  );
}

function DateDialog({ detail, onClose, onDone }: { detail: Detail; onClose: () => void; onDone: (message: string) => void }) {
  const { t } = useI18n();
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(detail.squad.sprintEndDate ?? today);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const save = () => {
    setBusy(true);
    proposeDateChange(detail.squad.id, date, reason).then(() => onDone(t("Your new date was sent to the Admin.")), (e) => { setErr(errorMessage(e)); setBusy(false); });
  };
  return (
    <Dialog title={t("Propose date change")} onClose={onClose}
      footer={<><SecondaryButton onClick={onClose}>{t("Cancel")}</SecondaryButton><PrimaryButton disabled={busy || !reason.trim() || date === detail.squad.sprintEndDate} onClick={save}>{t("Send to Admin")}</PrimaryButton></>}>
      <p className="text-[0.85em] text-[#475467]">{t("{sprint} ends on {date}. The Admin approves the new date.", { sprint: detail.squad.sprintName ?? t("The sprint"), date: detail.squad.sprintEndDate ?? "—" })}</p>
      <Field label={t("New end date")}>
        <input type="date" value={date} min={today} onChange={(e) => setDate(e.target.value)} className={inputCls} />
      </Field>
      <Field label={t("Reason")} hint={`${reason.length}/500`}>
        <textarea value={reason} maxLength={500} rows={3} onChange={(e) => setReason(e.target.value)} className={inputCls} placeholder={t("Why should the date change?")} />
      </Field>
      {err && <p className="text-[0.85em] text-[#c81e1e]">{err}</p>}
    </Dialog>
  );
}

const CATEGORIES: ReportCategory[] = ["InactiveMember", "Behaviour", "BrokenLink", "ProjectProblem", "Other"];
export const categoryLabel = (c: string) =>
  ({ InactiveMember: "Inactive member", Behaviour: "Behaviour", BrokenLink: "Broken link", ProjectProblem: "Project problem", Other: "Other" })[c] ?? c;

function ReportDialog({ detail, onClose, onDone }: { detail: Detail; onClose: () => void; onDone: (message: string) => void }) {
  const { t } = useI18n();
  const [category, setCategory] = useState<ReportCategory>("InactiveMember");
  const [student, setStudent] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const save = () => {
    setBusy(true);
    sendMentorReport({ squadId: detail.squad.id, studentId: student || null, category, message })
      .then(() => onDone(t("Your report was sent to the Admin. You will see the reply on your Overview.")), (e) => { setErr(errorMessage(e)); setBusy(false); });
  };
  return (
    <Dialog title={t("Report to Admin")} onClose={onClose}
      footer={<><SecondaryButton onClick={onClose}>{t("Cancel")}</SecondaryButton><PrimaryButton disabled={busy || !message.trim()} onClick={save}>{t("Send report")}</PrimaryButton></>}>
      <Field label={t("About")}>
        <select value={category} onChange={(e) => setCategory(e.target.value as ReportCategory)} className={inputCls}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{t(categoryLabel(c))}</option>)}
        </select>
      </Field>
      <Field label={t("Student (optional)")}>
        <select value={student} onChange={(e) => setStudent(e.target.value)} className={inputCls}>
          <option value="">{t("The whole squad")}</option>
          {detail.members.map((m) => <option key={m.studentId} value={m.studentId}>{m.fullName}</option>)}
        </select>
      </Field>
      <Field label={t("What happened?")} hint={`${message.length}/2000`}>
        <textarea value={message} maxLength={2000} rows={4} onChange={(e) => setMessage(e.target.value)} className={inputCls} />
      </Field>
      {err && <p className="text-[0.85em] text-[#c81e1e]">{err}</p>}
    </Dialog>
  );
}
