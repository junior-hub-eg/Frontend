import Link from "next/link";
import type { Route } from "next";
import { Star } from "lucide-react";
import type { Mentor } from "@/lib/data/mentors";
import { MentorAvatar } from "./MentorAvatar";

export function MentorCard({ mentor }: { mentor: Mentor }) {
  return (
    <article className="flex flex-col rounded-2xl border border-[#dfe7e5] bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        <MentorAvatar name={mentor.name} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-[#1b2a5c]">{mentor.name}</h3>
          <p className="truncate text-xs text-[#1b2a5c]/70">{mentor.role}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-[#1b2a5c]">
            <Star aria-hidden size={12} className="fill-[#F5A623] text-[#F5A623]" />
            <span className="font-semibold">{mentor.rating.toFixed(1)}</span>
            <span className="text-[#1b2a5c]/60">({mentor.reviews})</span>
          </p>
        </div>
        {mentor.availableThisWeek && (
          <span className="shrink-0 rounded-full bg-[#DDF3E7] px-2 py-0.5 text-[10px] font-semibold text-[#1E9D5B]">Available</span>
        )}
      </div>

      <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-[#1b2a5c]/75">{mentor.bio}</p>

      <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Skills">
        {mentor.technologies.map((t) => (
          <li key={t} className="rounded-full bg-[#E9F7F4] px-2.5 py-1 text-[10px] font-medium text-[#12939b]">
            {t}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-baseline gap-1 text-[#1b2a5c]">
        <span className="text-base font-bold">${mentor.price}</span>
        <span className="text-[11px] text-[#1b2a5c]/60">/ 30 min session</span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Link
          href={`/monitor/${mentor.id}/book` as Route}
          className="rounded-lg border border-[#12939b] px-3 py-2 text-center text-xs font-semibold text-[#12939b] transition-colors hover:bg-[#E9F7F4]"
        >
          View Profile
        </Link>
        <Link
          href={`/monitor/${mentor.id}/book` as Route}
          className="rounded-lg bg-linear-to-r from-[#14757d] to-[#1b2a5c] px-3 py-2 text-center text-xs font-semibold text-white transition-opacity hover:opacity-90"
        >
          Book Mentor
        </Link>
      </div>
    </article>
  );
}
