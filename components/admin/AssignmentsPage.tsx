"use client";

import Image from "next/image";
import { CheckCircle2, Clock, FileText, Plus, Star } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { getAdminSubmissions } from "@/lib/admin-api";
import { AdminBody, AdminHero, AdminPage } from "./page-parts";
import { LoadState, useAdminData } from "./admin-data";

const IMG = "/images/Intern";

const BADGE: Record<string, string> = {
  Submitted: "bg-[#cfeedd] text-[#2f9a5f]",
  Pending: "bg-[#fdeeb8] text-[#b7840f]",
  Graded: "bg-[#e3e6ea] text-[#5a6270]",
};

export default function AssignmentsPage() {
  const t = useT();
  const { data, error, reload } = useAdminData(getAdminSubmissions, tk("Could not load the submissions."));
  const stats = data?.stats;
  const STATS = [
    { icon: FileText, label: "Total Submissions", value: stats ? stats.totalSubmissions.toLocaleString() : "–", color: "#14365a" },
    { icon: CheckCircle2, label: "Avg Score", value: stats?.avgScore ?? "–", color: "#2f9a5f" },
    { icon: Clock, label: "Pending Review", value: stats ? stats.pendingReview.toLocaleString() : "–", color: "#d9822b" },
    { icon: Star, label: "Approved", value: stats ? stats.approved.toLocaleString() : "–", color: "#d9a21b" },
  ];

  return (
    <AdminPage>
      <AdminHero>
        <h1 className="text-[2.2em] font-bold leading-tight text-[#0f7378]">{t("Assignments & Submissions")}</h1>

        <ul className="mt-[0.7em] grid max-w-[56em] grid-cols-2 gap-[0.9em] lg:grid-cols-4">
          {STATS.map((s) => (
            <li key={s.label} className="flex items-center gap-[0.7em] rounded-[0.9em] border border-white/50 bg-white/55 px-[0.9em] py-[0.7em] backdrop-blur-[3px]">
              <span className="grid size-[2.3em] shrink-0 place-items-center rounded-[0.5em] bg-white/85">
                <s.icon className="size-[1.2em]" style={{ color: s.color }} />
              </span>
              <span className="leading-tight">
                <span className="block text-[0.6em] text-[#14365a]/70">{t(s.label)}</span>
                <span className="block text-[1.15em] font-bold text-[#0b1b2b]">{s.value}</span>
              </span>
            </li>
          ))}
        </ul>
      </AdminHero>

      <AdminBody>
        <section className="rounded-[1.3em] bg-white p-[1.2em] shadow-[0_6px_22px_rgba(20,54,90,0.07)]">
          <header className="flex items-center justify-between gap-[1em]">
            <h2 className="text-[0.95em] font-bold text-[#0b1b2b]">{t("Recent Submissions")}</h2>
            <button
              type="button"
              className="inline-flex items-center gap-[0.5em] rounded-[0.6em] bg-[#2f5be0] px-[1.2em] py-[0.55em] text-[0.75em] font-semibold text-white hover:bg-[#274ec4]"
            >
              <Plus className="size-[1.1em]" strokeWidth={3} /> {t("Create Assignment")}
            </button>
          </header>

          {!data ? (
            <LoadState error={error} onRetry={reload} />
          ) : data.rows.length === 0 ? (
            <p className="py-[2em] text-center text-[0.8em] text-[#14365a]/60">{t("No submissions yet.")}</p>
          ) : (
          <div className="mt-[0.8em] overflow-x-auto">
            <table className="w-full min-w-[40em] text-left text-[0.75em]">
              <thead>
                <tr className="text-[0.9em] font-medium text-[#14365a]/60">
                  <th className="py-[0.6em] pr-[1em] font-medium">{t("Student\\Squad")}</th>
                  <th className="py-[0.6em] pr-[1em] font-medium">{t("Assignment Name")}</th>
                  <th className="py-[0.6em] pr-[1em] font-medium">{t("Track")}</th>
                  <th className="py-[0.6em] pr-[1em] font-medium">{t("Status")}</th>
                  <th className="py-[0.6em] text-right font-medium">{t("Actions")}</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((r) => (
                  <tr key={r.id} className="border-t border-[#eef2f6]">
                    <td className="py-[0.7em] pr-[1em]">
                      <span className="flex items-center gap-[0.7em]">
                        <span className="relative size-[2em] shrink-0 overflow-hidden rounded-full" style={{ backgroundColor: r.bg }}>
                          <Image src={`${IMG}/${r.avatar}`} alt="" fill sizes="32px" className="origin-top scale-[2.1] object-cover object-top" />
                        </span>
                        <span className="font-medium text-[#0b1b2b]">{r.student}</span>
                      </span>
                    </td>
                    <td className="py-[0.7em] pr-[1em] text-[#14365a]/80">{r.assignment}</td>
                    <td className="py-[0.7em] pr-[1em] text-[#14365a]/80">{r.track}</td>
                    <td className="py-[0.7em] pr-[1em]">
                      <span className={`inline-block rounded-full px-[0.9em] py-[0.15em] text-[0.85em] font-semibold ${BADGE[r.status] ?? BADGE.Submitted}`}>{t(r.status)}</span>
                    </td>
                    <td className="py-[0.7em] text-right">
                      <button
                        type="button"
                        className="rounded-[0.5em] border border-[#d5dce5] px-[1em] py-[0.35em] text-[0.9em] font-semibold text-[#0b1b2b] hover:bg-[#eef4fa]"
                      >
                        {t("Review Submission")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </section>
      </AdminBody>
    </AdminPage>
  );
}