"use client";

import Link from "next/link";
import type { Route } from "next";
import { BadgeCheck, Building2, CalendarDays, Clock, Star } from "lucide-react";
import type { Mentor } from "@/lib/data/mentors";
import { MentorAvatar } from "./MentorAvatar";
import { useT } from "@/lib/i18n/client";

export function MentorCard({ mentor }: { mentor: Mentor }) {
  const t = useT();
  const book = `/monitor/${mentor.id}/book` as Route;
  const soon = /^(Today|Tomorrow)/.test(mentor.nextSlot);
  const SlotIcon = soon ? Clock : CalendarDays;

  return (
    <article className="flex flex-col rounded-2xl border border-[#e3ecea] bg-white p-5 shadow-[0_6px_20px_rgba(27,42,92,0.06)] transition-shadow hover:shadow-[0_10px_28px_rgba(27,42,92,0.12)]">
      <div className="flex items-start justify-between gap-3">
        <MentorAvatar name={mentor.name} photo={mentor.photo} photoHasDot={mentor.photoHasDot} online className="size-14 text-base" />
        <div className="text-end">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#E9F7F4] px-2.5 py-1 text-[10px] font-semibold text-[#12939b]">
            <Building2 size={11} aria-hidden /> {mentor.company}
          </span>
          <p className="mt-1 text-[10px] text-[#1b2a5c]/55">{t("{n} yrs exp.", { n: mentor.years })}</p>
        </div>
      </div>

      <h3 className="mt-3 flex items-center gap-1 text-base font-semibold text-[#1b2a5c]">
        {mentor.name}
        <BadgeCheck size={14} className="shrink-0 text-[#12939b]" aria-label={t("Verified")} />
      </h3>
      <p className="text-[11px] text-[#1b2a5c]/65">{t(mentor.role)}</p>

      <div className="mt-3 flex items-center gap-3 rounded-lg bg-[#F3F7FA] px-3 py-2 text-[11px] text-[#1b2a5c]">
        <span className="flex items-center gap-1">
          <Star size={13} className="fill-[#12939b] text-[#12939b]" aria-hidden />
          <span className="font-semibold">{mentor.rating.toFixed(1)}</span>
          <span className="text-[#1b2a5c]/55">({mentor.reviews})</span>
        </span>
        <span className="h-3 w-px bg-[#1b2a5c]/15" aria-hidden />
        <span className="text-[#1b2a5c]/75">{t("{n} Sessions", { n: mentor.sessions })}</span>
      </div>

      <p className="mt-3 line-clamp-2 text-[11px] leading-relaxed text-[#1b2a5c]/70">{t(mentor.bio)}</p>

      <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={t("Skills")}>
        {mentor.technologies.map((tech) => (
          <li key={tech} className="rounded-md border border-[#e3ecea] bg-[#F7FAF9] px-2 py-1 text-[10px] font-medium text-[#1b2a5c]/80">
            {tech}
          </li>
        ))}
      </ul>

      <div className="mt-auto flex items-center justify-between pt-5">
        <p className="text-[#1b2a5c]">
          <span className="text-sm font-bold">${mentor.price}</span>
          <span className="text-[10px] text-[#1b2a5c]/55"> {t("/45m session")}</span>
        </p>
        <p className="flex items-center gap-1 text-[10px] font-medium text-[#12939b]">
          <SlotIcon size={11} aria-hidden /> {t(mentor.nextSlot)}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Link
          href={book}
          className="rounded-lg px-3 py-2 text-center text-[11px] font-semibold text-[#1b2a5c] transition-colors hover:bg-[#F3F7FA]"
        >
          {t("View Profile")}
        </Link>
        <Link
          href={book}
          className="rounded-lg bg-[#12939b] px-3 py-2 text-center text-[11px] font-semibold text-white transition-colors hover:bg-[#0f7a81]"
        >
          {t("Select Mentor")}
        </Link>
      </div>
    </article>
  );
}
