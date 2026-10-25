"use client";

import { useState } from "react";
import { CalendarClock, Link2, Send, Users } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { useI18n } from "@/lib/i18n/client";
import { getMentorAnnouncements, saveMentorAnnouncement, type MentorAnnouncement } from "@/lib/monitor-api";
import { cn } from "@/lib/utils";
import { Card, CardTitle, ErrorState, MentorPage, Pill, PrimaryButton, ProgressBar, SecondaryButton, SegmentTabs, Skeleton, inputCls } from "../mentor-area-ui";
import { useApi } from "../use-api";

const localInput = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

export default function Announcements() {
  const { t, intl, locale } = useI18n();
  const { data, error, loading, reload } = useApi(getMentorAnnouncements);
  const [id, setId] = useState<string | null>(null);
  // An announcement is written in the site's language; an edited one keeps its own.
  const [editLanguage, setEditLanguage] = useState<"en" | "ar" | null>(null);
  const language = editLanguage ?? (locale === "ar" ? "ar" : "en");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [link, setLink] = useState("");
  const [squads, setSquads] = useState<string[]>([]);
  const [mentees, setMentees] = useState(false);
  const [when, setWhen] = useState<"now" | "schedule">("now");
  const [sendAt, setSendAt] = useState(() => localInput(new Date(Date.now() + 86400000)));
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  if (error) return <MentorPage title={t("Announcements")}><ErrorState title={t("We could not load your announcements")} onRetry={reload} error={error} /></MentorPage>;

  const recipients = (data?.squads.filter((s) => squads.includes(s.squadId)).reduce((n, s) => n + s.students, 0) ?? 0) + (mentees ? data?.mentees ?? 0 : 0);
  const toggle = (sid: string) => setSquads(squads.includes(sid) ? squads.filter((x) => x !== sid) : [...squads, sid]);
  const edit = (a: MentorAnnouncement) => {
    setId(a.id); setTitle(a.title); setBody(a.body); setLink(a.link ?? ""); setEditLanguage(a.language); setSquads(a.squadIds); setMentees(a.includeMentees);
    if (a.sendAtUtc) { setWhen("schedule"); setSendAt(localInput(new Date(a.sendAtUtc))); } else setWhen("now");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const reset = () => { setId(null); setEditLanguage(null); setTitle(""); setBody(""); setLink(""); setSquads([]); setMentees(false); setWhen("now"); };
  const submit = (mode: "Now" | "Schedule" | "Draft") => {
    setBusy(true);
    setNotice(null);
    saveMentorAnnouncement({ id, title, body, link, language, squadIds: squads, includeMentees: mentees, mode, sendAtUtc: mode === "Schedule" ? new Date(sendAt).toISOString() : null })
      .then((a) => {
        setBusy(false);
        setNotice({ ok: true, text: a.status === "Sent" ? t("Sent to {n} students.", { n: a.recipients }) : a.status === "Scheduled" ? t("Scheduled.") : t("Draft saved.") });
        if (a.status === "Draft") setId(a.id); else reset();
        reload();
      }, (e) => { setBusy(false); setNotice({ ok: false, text: errorMessage(e) }); });
  };
  const ready = title.trim() && body.trim() && recipients > 0;
  const stamp = (iso: string) => new Date(iso).toLocaleString(intl, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

  return (
    <MentorPage title={t("Announcements")} subtitle={t("Write to your squads and mentees.")}>
      <div className="grid items-start gap-[1.4em] xl:grid-cols-[1fr_24em]">
        <Card>
          <h2 className="mb-[1em] text-[1.15em] font-bold text-[#1b2d54]">{id ? t("Edit announcement") : t("New announcement")}</h2>
          <div dir={language === "ar" ? "rtl" : "ltr"} className="space-y-[1em]">
            <label className="block text-[0.85em]">
              <span className="mb-[0.4em] block font-medium text-[#1b2d54]">{t("Title")}</span>
              <input value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder={t("Weekly reminder")} />
            </label>
            <label className="block text-[0.85em]">
              <span className="mb-[0.4em] flex justify-between font-medium text-[#1b2d54]">{t("Message")}<span className="font-normal text-[#64748b]">{body.length}/1000</span></span>
              <textarea value={body} maxLength={1000} rows={5} onChange={(e) => setBody(e.target.value)} className={inputCls} />
            </label>
            <label className="block text-[0.85em]">
              <span className="mb-[0.4em] block font-medium text-[#1b2d54]">{t("Link (optional)")}</span>
              <span className="relative block"><Link2 className="absolute start-[0.8em] top-1/2 size-[1em] -translate-y-1/2 text-[#64748b]" />
                <input dir="ltr" value={link} maxLength={500} onChange={(e) => setLink(e.target.value)} className={cn(inputCls, "ps-[2.4em]")} placeholder="https://" /></span>
            </label>
          </div>
          {notice && <p className={cn("mt-[0.8em] text-[0.85em]", notice.ok ? "text-[#167a3e]" : "text-[#c81e1e]")}>{notice.text}</p>}
          <div className="mt-[1.2em] flex justify-end gap-[0.6em]">
            {id && <SecondaryButton onClick={reset}>{t("New")}</SecondaryButton>}
            <SecondaryButton disabled={busy || !title.trim() || !body.trim()} onClick={() => submit("Draft")}>{t("Save draft")}</SecondaryButton>
            <PrimaryButton disabled={busy || !ready} onClick={() => submit(when === "now" ? "Now" : "Schedule")}>
              {when === "now" ? <Send className="size-[1em] rtl:-scale-x-100" /> : <CalendarClock className="size-[1em]" />}
              {when === "now" ? t("Send to {n} students", { n: recipients }) : t("Schedule for {n} students", { n: recipients })}
            </PrimaryButton>
          </div>
        </Card>

        <Card>
          <CardTitle>{t("Audience")}</CardTitle>
          {loading || !data ? <Skeleton className="h-[12em] w-full" /> : (
            <ul className="divide-y divide-[#eef2f6]">
              {data.squads.map((s) => (
                <li key={s.squadId}>
                  <label className="flex cursor-pointer items-center gap-[0.7em] py-[0.7em] text-[0.88em]">
                    <input type="checkbox" checked={squads.includes(s.squadId)} onChange={() => toggle(s.squadId)} className="size-[1.1em] accent-[#1b2d54]" />
                    <span className="flex-1 font-medium text-[#1b2d54]">{s.squadName}</span>
                    <span className="text-[0.85em] text-[#64748b]">{t("{n} students", { n: s.students })}</span>
                  </label>
                </li>
              ))}
              <li>
                <label className="flex cursor-pointer items-center gap-[0.7em] py-[0.7em] text-[0.88em]">
                  <input type="checkbox" checked={mentees} onChange={() => setMentees(!mentees)} className="size-[1.1em] accent-[#1b2d54]" disabled={data.mentees === 0} />
                  <span className="flex-1 font-medium text-[#1b2d54]">{t("My mentees")}</span>
                  <span className="text-[0.85em] text-[#64748b]">{t("{n} students", { n: data.mentees })}</span>
                </label>
              </li>
            </ul>
          )}
          <div className="mt-[0.8em] flex items-center justify-between rounded-[0.9em] bg-[#e9f6f4] px-[1em] py-[0.8em]">
            <span className="flex items-center gap-[0.5em] text-[0.88em] font-medium text-[#1b2d54]"><Users className="size-[1.1em] text-[#0f7378]" />{t("Recipients")}</span>
            <b className="text-[1.4em] text-[#0f7378]">{recipients}</b>
          </div>
          <p className="mt-[1em] text-[0.85em] font-medium text-[#1b2d54]">{t("When")}</p>
          <div className="mt-[0.4em]"><SegmentTabs value={when} onChange={setWhen} tabs={[{ value: "now", label: t("Send now") }, { value: "schedule", label: t("Schedule") }]} /></div>
          {when === "schedule" && <input type="datetime-local" value={sendAt} min={localInput(new Date())} onChange={(e) => setSendAt(e.target.value)} className={cn(inputCls, "mt-[0.6em]")} aria-label={t("Send at")} />}
        </Card>
      </div>

      <Card>
        <CardTitle>{t("History")}</CardTitle>
        {loading || !data ? <Skeleton className="h-[8em] w-full" /> : data.announcements.length === 0 ? (
          <p className="text-[0.85em] text-[#475467]">{t("You have not written an announcement yet.")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[46em] text-[0.85em]">
              <thead><tr className="text-[0.9em] text-[#475467]">{[t("Title"), t("Audience"), t("Sent"), t("Read")].map((h) => <th key={h} className="pb-[0.8em] text-start font-medium">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-[#eef2f6] border-t border-[#eef2f6]">
                {data.announcements.map((a) => (
                  <tr key={a.id} className={cn(a.status !== "Sent" && "cursor-pointer hover:bg-[#f7fafc]")} onClick={() => a.status !== "Sent" && edit(a)}>
                    <td className="py-[0.9em] pe-3 font-semibold text-[#1b2d54]">{a.title}</td>
                    <td className="pe-3 text-[#475467]">{[...a.squadNames, ...(a.includeMentees ? [t("My mentees")] : [])].join(", ") || "—"}</td>
                    <td className="pe-3 text-[#475467]">
                      {a.status === "Sent" && a.sentUtc ? stamp(a.sentUtc) : a.status === "Scheduled" && a.sendAtUtc ? <Pill tone="purple" dot={false}>{t("Scheduled {when}", { when: stamp(a.sendAtUtc) })}</Pill> : <Pill tone="gray" dot={false}>{t("Draft")}</Pill>}
                    </td>
                    <td className="pe-3">
                      {a.readPercent != null ? (
                        <span className="flex items-center gap-[0.8em]"><ProgressBar value={a.readPercent} className="w-[14em]" /><span className="text-[#1b2d54]">{t("{n}% read", { n: a.readPercent })}</span></span>
                      ) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </MentorPage>
  );
}
