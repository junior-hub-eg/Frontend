"use client";

import { useState } from "react";
import { BellRing, GraduationCap, Mail, Monitor, Send, Zap } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { BTN_PRIMARY, BTN_SECONDARY, INPUT } from "../page-parts";
import { Section } from "../mentor-detail/parts";

const AUDIENCES = ["Students", "Squads", "Mentors", "Track Leads"];
const CHANNELS = [
  { key: "app", label: "In-App Notification", tag: "Real-time", icon: Monitor },
  { key: "email", label: "Email Digest", tag: "HTML Template", icon: Mail },
  { key: "push", label: "Push Mobile", tag: "Native App", icon: BellRing },
];

/** Live preview works. Save / Send are not connected yet (TODO(api): broadcast endpoint). */
export function QuickComposer() {
  const t = useT();
  const [title, setTitle] = useState("Capstone Review Window Now Open");
  const [audience, setAudience] = useState<string[]>(["Students"]);
  const [channels, setChannels] = useState<string[]>(["app", "email"]);
  const [message, setMessage] = useState("Hello {student_name}! Your squad {squad_name} can now submit your final Capstone milestone code repository before Sunday midnight.");
  const [done, setDone] = useState<string | null>(null);

  const toggle = (list: string[], set: (v: string[]) => void, k: string) => set(list.includes(k) ? list.filter((x) => x !== k) : [...list, k]);
  const preview = message.replaceAll("{student_name}", "Ahmed").replaceAll("{squad_name}", "Design Masters");
  const canSend = title.trim() !== "" && message.trim() !== "" && audience.length > 0 && channels.length > 0;

  return (
    <Section title={t("Quick Composer")} action={<span className="rounded-[0.4em] bg-[#eef3fa] px-[0.7em] py-[0.3em] text-[0.65em] font-bold text-[#5b6b7c]">{t("LIVE PREVIEW")}</span>}>
      <label className="block text-[0.75em] font-semibold text-[#5b6b7c]">
        {t("Title")}
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={`${INPUT} mt-[0.3em] w-full !text-[1.1em]`} />
      </label>

      <p className="mb-[0.4em] mt-[1em] text-[0.75em] font-semibold text-[#5b6b7c]">{t("Target Audience")}</p>
      <div className="flex flex-wrap gap-[0.4em] text-[0.75em]">
        {AUDIENCES.map((a) => (
          <button key={a} type="button" aria-pressed={audience.includes(a)} onClick={() => toggle(audience, setAudience, a)} className={`rounded-full px-[1em] py-[0.35em] font-semibold ${audience.includes(a) ? "bg-[#06b6d4] text-white" : "bg-[#eef3fa] text-[#14365a]"}`}>{t(a)}</button>
        ))}
      </div>

      <p className="mb-[0.4em] mt-[1em] text-[0.75em] font-semibold text-[#5b6b7c]">{t("Delivery Channels")}</p>
      <ul className="grid gap-[0.4em] text-[0.8em]">
        {CHANNELS.map(({ key, label, tag, icon: Icon }) => (
          <li key={key}>
            <label className="flex cursor-pointer items-center gap-[0.7em] rounded-[0.6em] bg-[#f1f5fd] px-[0.8em] py-[0.6em]">
              <input type="checkbox" checked={channels.includes(key)} onChange={() => toggle(channels, setChannels, key)} className="size-[1.1em] accent-[#1d6fe0]" />
              <Icon className="size-[1.1em] text-[#14365a]" />
              <span className="flex-1 text-[#14365a]">{t(label)}</span>
              <span className="text-[0.85em] text-[#8a97a6]">{t(tag)}</span>
            </label>
          </li>
        ))}
      </ul>

      <div className="mb-[0.4em] mt-[1em] flex items-center justify-between text-[0.75em] font-semibold text-[#5b6b7c]">
        <span>{t("Message Body & Tags")}</span>
        <span className="flex gap-[0.3em] font-mono text-[0.85em] text-[#0b6f86]">
          {["{student_name}", "{squad_name}"].map((tag) => (
            <button key={tag} type="button" onClick={() => setMessage((m) => `${m} ${tag}`)} className="rounded-[0.4em] bg-[#dff3fb] px-[0.5em] py-[0.15em]">{tag}</button>
          ))}
        </span>
      </div>
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} aria-label={t("Message Body & Tags")} className="w-full rounded-[0.7em] border border-[#e1e8f0] bg-white p-[0.8em] text-[0.8em] text-[#14365a] outline-none focus:ring-2 focus:ring-[#06b6d4]/40" />

      <div className="mt-[0.8em] rounded-[0.9em] bg-[#f1f5fd] p-[1em] text-[0.8em]">
        <p className="flex items-center justify-between font-semibold text-[#0b1b2b]">
          <span className="inline-flex items-center gap-[0.5em]"><span className="grid size-[1.8em] place-items-center rounded-full bg-[#dbe8fb] text-[#1d6fe0]"><GraduationCap className="size-[1em]" /></span>Junior Hub Relay</span>
          <span className="text-[0.85em] font-normal text-[#8a97a6]">{t("Just now")}</span>
        </p>
        <p className="mt-[0.5em] font-semibold text-[#14365a]">{title}</p>
        <p className="mt-[0.2em] text-[#14365a]">{preview}</p>
        <button type="button" className="mt-[0.7em] ms-auto block rounded-[0.5em] bg-[#06b6d4] px-[0.9em] py-[0.35em] text-[0.85em] font-semibold text-white">{t("Go to Capstone")}</button>
      </div>

      <div className="mt-[1em] grid grid-cols-2 gap-[0.6em]">
        <button type="button" onClick={() => setDone(t("Draft saved (demo)."))} className={`${BTN_SECONDARY} !bg-[#eef3fa]`}>{t("Save Draft")}</button>
        <button type="button" disabled={!canSend} onClick={() => setDone(t("Broadcast queued (demo)."))} className={BTN_PRIMARY}><Send className="size-[1em]" /> {t("Send Broadcast")}</button>
      </div>
      {done && <p role="status" className="mt-[0.6em] text-center text-[0.75em] text-[#12676b]"><Zap className="me-[0.3em] inline size-[1em]" />{done}</p>}
    </Section>
  );
}