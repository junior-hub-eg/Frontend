"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { CalendarDays, Clock, GraduationCap, Lock, PencilLine, Plus, Star } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { useI18n } from "@/lib/i18n/client";
import { getTracks, type TrackSummary } from "@/lib/learning-api";
import {
  changeMentorPassword, getMentorSettings, getMonitorProfile, saveNotificationSettings, sendTrackRequest, updateMentorProfile,
  type MentoringLevel, type MonitorProfile, type NotificationSettings,
} from "@/lib/monitor-api";
import { cn } from "@/lib/utils";
import { Card, Dialog, ErrorState, Field, MentorAvatar, MentorPage, Pill, PrimaryButton, ProgressBar, RolePill, SecondaryButton, SegmentTabs, Skeleton, inputCls, useRelative } from "../mentor-area-ui";
import { useApi } from "../use-api";

const TRACK_ROLE: Record<string, string> = { FRONTEND: "Frontend", BACKEND: "Backend", UIUX: "UIUX", DATA: "Data", AI: "AI", MOBILE: "Mobile", TESTING: "Testing", GAMING: "Gaming" };

export default function ProfileSettings() {
  const { t, locale, setLocale } = useI18n();
  const router = useRouter();
  const rel = useRelative();
  const profile = useApi(getMonitorProfile);
  const settings = useApi(getMentorSettings);
  const [edited, setPrefs] = useState<NotificationSettings | null>(null);
  const prefs = edited ?? settings.data?.notifications ?? null;
  const [dialog, setDialog] = useState<"edit" | "password" | "track" | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (profile.error || settings.error)
    return <MentorPage title={t("Profile & settings")}><ErrorState title={t("We could not load your profile")} onRetry={() => { profile.reload(); settings.reload(); }} error={profile.error ?? settings.error ?? undefined} /></MentorPage>;

  const p = profile.data;
  const s = settings.data;
  const toggle = (key: keyof NotificationSettings) => {
    if (!prefs) return;
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    saveNotificationSettings(next).catch(() => setPrefs(prefs));
  };
  const pending = s?.trackRequests.filter((r) => r.status === "Pending") ?? [];

  return (
    <MentorPage title={t("Profile & settings")} subtitle={t("What students see about you, your capacity and your notifications.")}>
      {notice && <p role="status" className="rounded-[0.8em] bg-[#e3f6ea] px-[1em] py-[0.6em] text-[0.85em] text-[#167a3e]">{notice}</p>}
      <div className="grid items-start gap-[1.4em] xl:grid-cols-[26em_1fr]">
        <div className="space-y-[1.4em]">
          <Card>
            {!p ? <Skeleton className="h-[14em] w-full" /> : (
              <>
                <div className="flex items-center gap-[1em]">
                  <MentorAvatar name={p.mentor.fullName} photoUrl={p.mentor.photoUrl} className="size-[5.5em] text-[1.2em]" />
                  <div className="min-w-0">
                    <h2 className="text-[1.4em] font-bold text-[#1b2d54]">{p.mentor.fullName}</h2>
                    <p className="text-[0.85em] text-[#475467]">{p.mentor.title}</p>
                    <div className="mt-[0.4em] flex flex-wrap items-center gap-[0.4em]">
                      <RolePill role={TRACK_ROLE[p.mentor.trackCode] ?? p.mentor.trackCode} />
                      {pending.map((r) => <Pill key={r.id} tone="amber" dot={false}>{t("{track} · waiting for the Admin", { track: t(r.trackName) })}</Pill>)}
                      <button type="button" onClick={() => setDialog("track")} className="inline-flex items-center gap-[0.2em] text-[0.75em] font-semibold text-[#0f7378]"><Plus className="size-[1em]" />{t("Request another track")}</button>
                    </div>
                  </div>
                </div>
                {p.mentor.bio && <p className="mt-[1em] text-[0.85em] text-[#475467]">{p.mentor.bio}</p>}
                {p.mentor.skills.length > 0 && <Chips title={t("Skills")} items={p.mentor.skills} />}
                {p.mentor.languages.length > 0 && <Chips title={t("Languages")} items={p.mentor.languages.map((l) => t(l))} />}
                <div className="mt-[1.2em] flex gap-[0.6em]">
                  <PrimaryButton onClick={() => setDialog("edit")}><PencilLine className="size-[1em]" /> {t("Edit profile")}</PrimaryButton>
                  <SecondaryButton onClick={() => router.push("/mentor/calendar?tab=availability" as Route)}><CalendarDays className="size-[1em]" /> {t("Availability")}</SecondaryButton>
                </div>
              </>
            )}
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <h3 className="text-[1.1em] font-bold text-[#1b2d54]">{t("Capacity")}</h3>
              <span className="flex items-center gap-[0.3em] rounded-full bg-[#eef1f5] px-[0.8em] py-[0.25em] text-[0.72em] text-[#475467]"><Lock className="size-[0.9em]" />{t("Set by the Admin")}</span>
            </div>
            {!s ? <Skeleton className="mt-4 h-[6em] w-full" /> : (
              <ul className="mt-[0.9em] space-y-[0.9em] text-[0.85em]">
                {[[t("Max students"), s.capacity.maxStudents, s.capacity.studentsNow], [t("Max squads"), s.capacity.maxSquads, s.capacity.squadsNow], [t("Squads now"), s.capacity.squadsNow, s.capacity.squadsNow]].map(([k, max, now], i) => (
                  <li key={i}>
                    <p className="flex justify-between"><span className="text-[#475467]">{k}</span><b className="text-[#1b2d54]">{i === 2 ? now : max}</b></p>
                    <ProgressBar value={(Number(now) / Math.max(1, Number(i === 2 ? s.capacity.maxSquads : max))) * 100} className="mt-[0.4em]" />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-[1.4em]">
          <div className="grid gap-[1em] md:grid-cols-3">
            <StatBox icon={<GraduationCap className="size-[1.1em] text-[#0f7378]" />} tint="bg-[#e0f4f2]" value={s ? String(s.stats.squadsCompleted) : "—"} label={t("Squads completed")} />
            <StatBox icon={<Clock className="size-[1.1em] text-[#1d5fd1]" />} tint="bg-[#e6f0ff]" value={s?.stats.averageReviewDays != null ? t("{n} days", { n: s.stats.averageReviewDays }) : "—"} label={t("Average review time")} />
            <StatBox icon={<Star className="size-[1.1em] text-[#c2570c]" />} tint="bg-[#fff1e3]" value={s?.stats.averageStudentScore != null ? `${s.stats.averageStudentScore} / 5` : "—"} label={t("Average student score")} />
          </div>
          <Card>
            <h3 className="text-[1.1em] font-bold text-[#1b2d54]">{t("Email notifications")}</h3>
            {!prefs ? <Skeleton className="mt-4 h-[12em] w-full" /> : (
              <ul className="mt-[0.6em] divide-y divide-[#eef2f6]">
                {([
                  ["newSquad", t("New squad"), t("You now monitor a new squad")],
                  ["submission", t("Submission"), t("A squad submitted its work")],
                  ["warning", t("Warning"), t("A student or squad gets a warning")],
                  ["chatMessage", t("Chat message"), t("A message in a squad chat")],
                  ["adminReply", t("Admin reply"), t("The Admin answers your report")],
                ] as const).map(([key, title, text]) => (
                  <li key={key} className="flex items-center justify-between gap-3 py-[0.8em]">
                    <span><span className="block font-semibold text-[#1b2d54]">{title}</span><span className="text-[0.8em] text-[#64748b]">{text}</span></span>
                    <button type="button" role="switch" aria-checked={prefs[key]} aria-label={title} onClick={() => toggle(key)}
                      className={cn("relative h-[1.6em] w-[3em] shrink-0 rounded-full transition", prefs[key] ? "bg-[#0f7378]" : "bg-[#d6dde6]")}>
                      <span className={cn("absolute top-[0.2em] size-[1.2em] rounded-full bg-white shadow transition-all", prefs[key] ? "start-[1.6em]" : "start-[0.2em]")} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card>
            <h3 className="text-[1.1em] font-bold text-[#1b2d54]">{t("Password and language")}</h3>
            <div className="mt-[0.6em] flex items-center justify-between gap-3 border-b border-[#eef2f6] py-[0.9em]">
              <span><span className="block font-semibold text-[#1b2d54]">{t("Password")}</span>
                <span className="text-[0.8em] text-[#64748b]">{s?.passwordChangedUtc ? t("Last changed {ago}", { ago: rel.ago(s.passwordChangedUtc).toLowerCase() }) : t("Change it any time")}</span></span>
              <SecondaryButton onClick={() => setDialog("password")}><Lock className="size-[1em]" /> {t("Change password")}</SecondaryButton>
            </div>
            <div className="flex items-center justify-between gap-3 py-[0.9em]">
              <span><span className="block font-semibold text-[#1b2d54]">{t("Language")}</span><span className="text-[0.8em] text-[#64748b]">{t("The whole layout mirrors in Arabic")}</span></span>
              <SegmentTabs value={locale} onChange={(v) => setLocale(v)} tabs={[{ value: "en", label: "English" }, { value: "ar", label: "العربية" }]} />
            </div>
          </Card>
        </div>
      </div>

      {dialog === "edit" && p && <EditDialog profile={p} onClose={() => setDialog(null)} onSaved={() => { setDialog(null); setNotice(t("Your profile is saved.")); profile.reload(); }} />}
      {dialog === "password" && <PasswordDialog onClose={() => setDialog(null)} onDone={() => { setDialog(null); setNotice(t("Your password is changed.")); settings.reload(); }} />}
      {dialog === "track" && p && <TrackDialog current={p.mentor.trackCode} pending={pending.map((r) => r.trackCode)} onClose={() => setDialog(null)} onDone={() => { setDialog(null); setNotice(t("Your request was sent to the Admin.")); settings.reload(); }} />}
    </MentorPage>
  );
}

function Chips({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-[1em]">
      <p className="text-[0.82em] font-medium text-[#1b2d54]">{title}</p>
      <div className="mt-[0.4em] flex flex-wrap gap-[0.4em]">{items.map((x) => <span key={x} className="rounded-full border border-[#bfe5e1] bg-[#eef8f7] px-[0.8em] py-[0.2em] text-[0.75em] text-[#0f7378]">{x}</span>)}</div>
    </div>
  );
}

function StatBox({ icon, tint, value, label }: { icon: React.ReactNode; tint: string; value: string; label: string }) {
  return (
    <Card>
      <span className={cn("grid size-[2.4em] place-items-center rounded-[0.7em]", tint)}>{icon}</span>
      <p className="mt-[0.7em] text-[1.8em] font-extrabold text-[#1b2d54]">{value}</p>
      <p className="text-[0.8em] text-[#475467]">{label}</p>
    </Card>
  );
}

function EditDialog({ profile, onClose, onSaved }: { profile: MonitorProfile; onClose: () => void; onSaved: () => void }) {
  const { t } = useI18n();
  const [bio, setBio] = useState(profile.mentor.bio ?? "");
  const [skills, setSkills] = useState(profile.mentor.skills.join(", "));
  const [languages, setLanguages] = useState(profile.mentor.languages.join(", "));
  const [level, setLevel] = useState<MentoringLevel | "">(profile.mentoringLevel ?? "");
  const [link, setLink] = useState(profile.meetingLink ?? "");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const save = () => {
    if (link && !/^https?:\/\//.test(link)) return setErr(t("The meeting link must start with https://"));
    setBusy(true);
    updateMentorProfile({ bio, skills, languages, mentoringLevel: level || null, meetingLink: link || null }).then(onSaved, (e) => { setErr(errorMessage(e)); setBusy(false); });
  };
  return (
    <Dialog title={t("Edit profile")} onClose={onClose} footer={<><SecondaryButton onClick={onClose}>{t("Cancel")}</SecondaryButton><PrimaryButton disabled={busy} onClick={save}>{t("Save")}</PrimaryButton></>}>
      <Field label={t("Mentoring summary")} hint={`${bio.length}/300`}><textarea value={bio} maxLength={300} rows={3} onChange={(e) => setBio(e.target.value)} className={inputCls} /></Field>
      <Field label={t("Skills and areas of expertise")}><input value={skills} onChange={(e) => setSkills(e.target.value)} className={inputCls} placeholder="Figma, Design systems" /></Field>
      <Field label={t("Languages")}><input value={languages} onChange={(e) => setLanguages(e.target.value)} className={inputCls} placeholder="English, Arabic" /></Field>
      <Field label={t("Mentoring level")}>
        <select value={level} onChange={(e) => setLevel(e.target.value as MentoringLevel)} className={inputCls}>
          <option value="">—</option><option value="Beginner">{t("Beginners")}</option><option value="Intermediate">{t("Intermediate")}</option><option value="All">{t("All levels")}</option>
        </select>
      </Field>
      <Field label={t("Meeting link")}><input dir="ltr" value={link} onChange={(e) => setLink(e.target.value)} className={inputCls} placeholder="https://meet.google.com/..." /></Field>
      {err && <p className="text-[0.85em] text-[#c81e1e]">{err}</p>}
    </Dialog>
  );
}

function PasswordDialog({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const { t } = useI18n();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <Dialog title={t("Change password")} onClose={onClose}
      footer={<><SecondaryButton onClick={onClose}>{t("Cancel")}</SecondaryButton>
        <PrimaryButton disabled={busy || !current || !next || next !== confirm} onClick={() => { setBusy(true); changeMentorPassword(current, next, confirm).then(onDone, (e) => { setErr(errorMessage(e)); setBusy(false); }); }}>{t("Change password")}</PrimaryButton></>}>
      <Field label={t("Current password")}><input type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} className={inputCls} /></Field>
      <Field label={t("New password")}><input type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} className={inputCls} /></Field>
      <Field label={t("Confirm the new password")}><input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputCls} /></Field>
      {next && confirm && next !== confirm && <p className="text-[0.8em] text-[#c81e1e]">{t("Passwords don't match.")}</p>}
      {err && <p className="text-[0.85em] text-[#c81e1e]">{err}</p>}
    </Dialog>
  );
}

/** "Request another track": the mentor sees only their own track; another one needs the Admin's approval. */
function TrackDialog({ current, pending, onClose, onDone }: { current: string; pending: string[]; onClose: () => void; onDone: () => void }) {
  const { t } = useI18n();
  const [tracks, setTracks] = useState<TrackSummary[] | null>(null);
  const [code, setCode] = useState("");
  const [note, setNote] = useState("");
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    getTracks().then((all) => { const left = all.filter((x) => x.code !== current && !pending.includes(x.code)); setTracks(left); setCode(left[0]?.code ?? ""); }, (e) => setErr(errorMessage(e)));
  }, [current, pending]);
  return (
    <Dialog title={t("Request another track")} onClose={onClose}
      footer={<><SecondaryButton onClick={onClose}>{t("Cancel")}</SecondaryButton><PrimaryButton disabled={!code} onClick={() => sendTrackRequest(code, note).then(onDone, (e) => setErr(errorMessage(e)))}>{t("Send to Admin")}</PrimaryButton></>}>
      <p className="text-[0.85em] text-[#475467]">{t("Students see only your track. A new one needs the Admin's approval.")}</p>
      <Field label={t("Track")}>
        <select value={code} onChange={(e) => setCode(e.target.value)} className={inputCls}>
          {tracks?.map((x) => <option key={x.code} value={x.code}>{t(x.name)}</option>)}
        </select>
      </Field>
      <Field label={t("Why you can teach it (optional)")} hint={`${note.length}/500`}><textarea value={note} maxLength={500} rows={3} onChange={(e) => setNote(e.target.value)} className={inputCls} /></Field>
      {err && <p className="text-[0.85em] text-[#c81e1e]">{err}</p>}
    </Dialog>
  );
}
