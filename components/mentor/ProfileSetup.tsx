"use client";

import { useState } from "react";
import { Camera, Check, Link2 } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { Avatar, Card, Eyebrow, PageHeading, fieldCls, ghostBtn, primaryBtn } from "./mentor-ui";
import { cn } from "@/lib/utils";

const TRACKS = ["Frontend", "Backend", "AI/ML", "Data Analysis", "Mobile", "Design"];
const BIO_MAX = 300;

export default function ProfileSetup() {
  const t = useT();
  const [fullName, setFullName] = useState("Alex Morgan");
  const [title, setTitle] = useState("Frontend Development Mentor");
  const [bio, setBio] = useState("I help junior developers build confidence with modern frontend work, clear communication and a solid learning routine.");
  const [tracks, setTracks] = useState<string[]>(["Frontend", "Design"]);
  const [expertise, setExpertise] = useState("React, JavaScript, HTML/CSS, Accessibility, Design Systems");
  const [languages, setLanguages] = useState("English, Arabic");
  const [level, setLevel] = useState("Beginners");
  const [link, setLink] = useState("https://meet.juniorhub.demo/mentor-alex");
  const [saved, setSaved] = useState(false);
  const [touched, setTouched] = useState(false);

  const toggle = (tr: string) => {
    setSaved(false);
    setTracks((cur) => (cur.includes(tr) ? cur.filter((x) => x !== tr) : [...cur, tr]));
  };
  const invalid = fullName.trim() === "" || title.trim() === "" || tracks.length === 0;
  const linkBad = link.trim() !== "" && !/^https?:\/\/\S+$/i.test(link.trim());

  function save() {
    setTouched(true);
    if (invalid || linkBad) return;
    setSaved(true);
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
          <Avatar initials="AM" size="lg" />
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
            <input className={cn(fieldCls, "mt-1.5 font-normal")} value={fullName} onChange={(e) => on(setFullName)(e.target.value)} aria-invalid={touched && !fullName.trim()} />
          </label>
          <label className="text-xs font-semibold">
            {t("Professional title")} *
            <input className={cn(fieldCls, "mt-1.5 font-normal")} value={title} onChange={(e) => on(setTitle)(e.target.value)} aria-invalid={touched && !title.trim()} />
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
            const active = tracks.includes(tr);
            return (
              <button
                key={tr}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(tr)}
                className={cn("flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors", active ? "border-[#0f8f8c] bg-[#0f8f8c] text-white" : "border-[#cfe0dd] bg-white hover:bg-[#f1faf8]")}
              >
                {active && <Check className="size-3.5" />} {t(tr)}
              </button>
            );
          })}
        </div>
        {touched && tracks.length === 0 && <p role="alert" className="text-xs font-semibold text-[#b83232]">{t("Pick at least one track.")}</p>}
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
          <select className={cn(fieldCls, "mt-1.5 font-normal")} value={level} onChange={(e) => on(setLevel)(e.target.value)}>
            <option value="Beginners">{t("Beginners")}</option>
            <option value="Intermediate">{t("Intermediate")}</option>
            <option value="All levels">{t("All levels")}</option>
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
        <button type="button" className={ghostBtn} onClick={() => { setTouched(false); setSaved(false); }}>{t("Cancel")}</button>
        <button type="button" className={primaryBtn} onClick={save}>
          <Check className="size-4" /> {t("Save Changes")}
        </button>
      </div>
    </>
  );
}
