"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import type { AdminMentor } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { mentorAvatar } from "@/lib/avatars";

export function MentorPicture({ mentor, size }: { mentor: { id: string; photoUrl?: string | null }; size: string }) {
  const avatar = mentorAvatar(mentor);
  return (
    <span className="relative shrink-0 overflow-hidden rounded-full" style={{ width: size, height: size, backgroundColor: avatar.bg }}>
      <Image src={avatar.src} alt="" fill sizes="64px" className="object-cover object-top" />
    </span>
  );
}

export function MentorStatus({ active }: { active: boolean }) {
  const t = useT();
  return (
    <span
      className={`rounded-full px-[0.8em] py-[0.2em] text-[0.85em] font-medium ${active ? "bg-[#d7efe6] text-[#12676b]" : "bg-[#e6ebf1] text-[#5b6b7c]"}`}
    >
      {active ? t("Active") : t("Inactive")}
    </span>
  );
}

export function MentorsTable({ mentors }: { mentors: AdminMentor[] }) {
  const t = useT();
  return (
    <section className="rounded-[1.1em] bg-white p-[1.2em] shadow-[0_6px_22px_rgba(20,54,90,0.1)]">
      <header className="flex flex-wrap items-center justify-between gap-[0.8em]">
        <h2 className="text-[1.05em] font-bold text-[#14365a]">{t("Mentors Overview")}</h2>
        <Link
          href={"/admin/mentors/new" as Route}
          className="rounded-[0.5em] bg-[#1d6fe0] px-[1.2em] py-[0.55em] text-[0.75em] font-semibold text-white shadow-sm hover:bg-[#1659b8]"
        >
          + {t("Add Mentor")}
        </Link>
      </header>

      <div className="mt-[1em] overflow-x-auto rounded-[0.7em] border border-[#e6edf3]">
        <table className="w-full min-w-[46em] text-[0.8em]">
          <thead>
            <tr className="bg-[#f4f7fb] text-[0.85em] text-[#5b6b7c]">
              <th className="px-[1.1em] py-[0.7em] text-start font-medium">{t("Mentor Name")}</th>
              <th className="px-[1.1em] py-[0.7em] text-start font-medium">{t("Track")}</th>
              <th className="px-[1.1em] py-[0.7em] text-start font-medium">{t("Students")}</th>
              <th className="px-[1.1em] py-[0.7em] text-start font-medium">{t("Squad")}</th>
              <th className="px-[1.1em] py-[0.7em] text-start font-medium">{t("Status")}</th>
              <th className="px-[1.1em] py-[0.7em] text-end font-medium">{t("Actions")}</th>
            </tr>
          </thead>
          <tbody className="text-[#14365a]">
            {mentors.map((m) => (
              <tr key={m.id} className="border-t border-[#e6edf3] hover:bg-[#f9fbfd]">
                <td className="px-[1.1em] py-[0.7em]">
                  <span className="flex items-center gap-[0.7em] font-semibold">
                    <MentorPicture mentor={m} size="2em" />
                    {m.fullName}
                  </span>
                </td>
                <td className="px-[1.1em] py-[0.7em] text-[#5b6b7c]">{m.trackName}</td>
                <td className="px-[1.1em] py-[0.7em] text-[#5b6b7c]">{m.students}</td>
                <td className="max-w-[14em] truncate px-[1.1em] py-[0.7em] text-[#5b6b7c]" title={m.squadNames.join(", ")}>
                  {m.squadNames.length === 0 ? "—" : m.squadNames.join(", ")}
                </td>
                <td className="px-[1.1em] py-[0.7em]">
                  <MentorStatus active={m.isActive} />
                </td>
                <td className="px-[1.1em] py-[0.7em] text-end">
                  <Link
                    href={`/admin/mentors/${m.id}` as Route}
                    className="rounded-[0.5em] border border-[#d5dee8] px-[0.9em] py-[0.35em] text-[0.85em] font-medium hover:bg-[#eef4fa]"
                  >
                    {t("View Profile")}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
