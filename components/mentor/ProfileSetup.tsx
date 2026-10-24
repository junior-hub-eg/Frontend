"use client";

import { useState } from "react";
import { Camera, Check, Link2 } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { errorMessage } from "@/lib/api-client";
import { tk } from "@/lib/i18n/translate";
import { getMonitorProfile, updateMentorProfile, type MentoringLevel, type MonitorProfile } from "@/lib/monitor-api";
import { Avatar, Card, Eyebrow, PageHeading, fieldCls, ghostBtn, primaryBtn } from "./mentor-ui";
import { LoadState, initialsOf, useMentorData } from "./mentor-data";
import { cn } from "@/lib/utils";

/** The mentor's track is set by the admin; the chips show which one it is. */
const TRACKS: { code: string; label: string }[] = [
  { code: "FRONTEND", label: tk("Frontend") },
  { code: "BACKEND", label: tk("Backend") },
  { code: "AI", label: tk("AI/ML") },
  { code: "DATA", label: tk("Data Analysis") },
  { code: "MOBILE", label: tk("Mobile") },
  { code: "UIUX", label: tk("Design") },
];
const BIO_MAX = 300;

export default function ProfileSetup() {
  const { data, error, reload } = useMentorData(getMonitorProfile, tk("Could not load your profile."));
  if (!data) return <LoadState error={error} onRetry={reload} />;
  return <ProfileForm initial={data} />;
}

function ProfileForm({ initial }: { initial: MonitorProfile }) {
  const t = useT();
  /** The last saved profile: what Cancel goes back to. */
  const [profile, setProfile] = useState(initial);
  const m = profile.mentor;
  const [bio, setBio] = useState(m.bio);
  const [expertise, setExpertise] = useState(m.skills.join(", "));
  const [languages, setLanguages] = useState(m.languages.join(", "));
  const [level, setLevel] = useState<MentoringLevel>(profile.mentoringLevel ?? "Beginner");
  const [link, setLink] = useState(profile.meetingLink ?? "");
  const [saved, setSaved] = useState(false);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const linkBad = link.trim() !== "" && !/^https?:\/\/\S+$/i.test(link.trim());

  async function save() {
    setTouched(true);
    if (linkBad) return;
    setSaving(true);
    setSaveError(null);
    try {
      const result = await updateMentorProfile({ bio, skills: expertise, languages, mentoringLevel: level, meetingLink: link.trim() });
      setProfile(result);
      setSaved(true);
    } catch (e) {
      setSaveError(errorMessage(e, t("Could not save your profile.")));
    } finally {
      setSaving(false);
    }
  }
  function reset() {
    setBio(m.bio);
    setExpertise(m.skills.join(", "));
    setLanguages(m.languages.join(", "));
    setLevel(profile.mentoringLevel ?? "Beginner");
    setLink(profile.meetingLink ?? "");
    setTouched(false);
    setSaved(false);
    setSaveError(null);
  }
  const on = <T,>(set: (v: T) => void) => (v: T) => {
    setSaved(false);
    set(v);
  };

  return (
    <>
      <PageHeading eyebrow={t("Profile setup")} title={t("Your mentor profile")} subtitle={t("Keep your professional details clear and useful for the students you support.")} />

      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold">{t("Profile photo")}</h2>
          <p className="text-xs text-[#14305a]/60">{t("Students see this photo on your profile.")}</p>
        </div>
        <div className="flex items-center gap-4">
          <Avatar initials={initialsOf(m.fullName)} size="lg" />
          <button type="button" className={ghostBtn}>
            <Camera className="size-4" /> {t("Change Photo")}
          </button>
        </div>
      </Card>

      <Card className="space-y-4">
        <div>
          <Eyebrow>{t("About you")}</Eyebrow>
          <h2 className="text-lg font-bold">{t("Professional information")}</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs font-semibold">
            {t("Full name")} *
            <input className={cn(fieldCls, "mt-1.5 font-normal disabled:bg-[#f4f8f7]")} value={m.fullName} disabled />
          </label>
          <label className="text-xs font-semibold">
            {t("Professional title")} *
            <input className={cn(fieldCls, "mt-1.5 font-normal disabled:bg-[#f4f8f7]")} value={m.title} disabled />
          </label>
        </div>
        <label className="block text-xs font-semibold">
          {t("Mentoring summary")}
          <textarea
            rows={4}
            maxLength={BIO_MAX}
            className={cn(fieldCls, "mt-1.5 resize-none font-normal")}
            value={bio}
            onChange={(e) => on(setBio)(e.target.value)}
          />
          <span className="mt-1 block text-end text-[0.7rem] font-normal text-[#14305a]/50">{bio.length}/{BIO_MAX}</span>
        </label>
      </Card>

      <Card className="space-y-4">
        <div>
          <Eyebrow>{t("Expertise")}</Eyebrow>
          <h2 className="text-lg font-bold">{t("Tracks and skills")}</h2>
          <p className="text-xs text-[#14305a]/60">{t("Select the tracks you can mentor in.")}</p>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label={t("Supported mentoring tracks")}>
          {TRACKS.map((tr) => {
            const active = tr.code === m.trackCode;
            return (
              <button
                key={tr.code}
                type="button"
                aria-pressed={active}
                disabled
                className={cn("flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors", active ? "border-[#0f8f8c] bg-[#0f8f8c] text-white" : "border-[#cfe0dd] bg-white opacity-60")}
              >
                {active && <Check className="size-3.5" />} {t(tr.label)}
              </button>
            );
          })}
        </div>
        <p className="text-[0.7rem] text-[#14305a]/55">{t("The admin sets your track. Ask them to change it.")}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs font-semibold">
            {t("Skills and areas of expertise")}
            <input className={cn(fieldCls, "mt-1.5 font-normal")} value={expertise} onChange={(e) => on(setExpertise)(e.target.value)} />
          </label>
          <label className="text-xs font-semibold">
            {t("Languages")}
            <input className={cn(fieldCls, "mt-1.5 font-normal")} value={languages} onChange={(e) => on(setLanguages)(e.target.value)} />
          </label>
        </div>
        <label className="block text-xs font-semibold sm:max-w-xs">
          {t("Mentoring level")}
          <select className={cn(fieldCls, "mt-1.5 font-normal")} value={level} onChange={(e) => on(setLevel)(e.target.value as MentoringLevel)}>
            <option value="Beginner">{t("Beginners")}</option>
            <option value="Intermediate">{t("Intermediate")}</option>
            <option value="All">{t("All levels")}</option>
          </select>
        </label>
      </Card>

      <Card className="space-y-3">
        <div>
          <Eyebrow>{t("Meeting setup")}</Eyebrow>
          <h2 className="text-lg font-bold">{t("Fixed meeting link")}</h2>
          <p className="text-xs text-[#14305a]/60">{t("Students use this link to join every session with you.")}</p>
        </div>
        <label className="block text-xs font-semibold">
          {t("Meeting link")}
          <span className="relative mt-1.5 block">
            <Link2 className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-[#0f8f8c]" />
            <input className={cn(fieldCls, "ps-9 font-normal")} dir="ltr" value={link} onChange={(e) => on(setLink)(e.target.value)} aria-invalid={touched && linkBad} />
          </span>
        </label>
        {touched && linkBad && <p role="alert" className="text-xs font-semibold text-[#b83232]">{t("Enter a valid link that starts with https://")}</p>}
      </Card>

      <div className="flex items-center justify-end gap-3">
        {saved && <span role="status" className="text-xs font-semibold text-[#0b7a77]">{t("Profile saved")}</span>}
        {saveError && <span role="alert" className="text-xs font-semibold text-[#b83232]">{saveError}</span>}
        <button type="button" className={ghostBtn} onClick={reset}>{t("Cancel")}</button>
        <button type="button" className={primaryBtn} disabled={saving} onClick={save}>
          <Check className="size-4" /> {t("Save Changes")}
        </button>
      </div>
    </>
  );
}
