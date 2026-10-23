"use client";

import { useState } from "react";
import Image from "next/image";
import { CheckCircle2, Clock, FileText, Plus, Star } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { AdminBody, AdminHero, AdminPage } from "./page-parts";

const IMG = "/images/Intern";

type Status = "Submitted" | "Pending" | "Graded";

type Row = { id: number; student: string; assignment: string; track: string; status: Status; avatar: string; bg: string };

/** Demo rows until the API has them. */
const SEED: Row[] = [
  { id: 1, student: "Mohammed Yasser", assignment: "Figma Prototype", track: "Frontend", status: "Submitted", avatar: "char-boy-glasses.png", bg: "#ffc531" },
  { id: 2, student: "Sarah Ahmed", assignment: "Sprint 1", track: "UI/UX Design", status: "Pending", avatar: "char-girl.png", bg: "#ff9a62" },
  { id: 3, student: "Amr Hassan", assignment: "API Integration", track: "Backend", status: "Graded", avatar: "char-boy-glasses-2.png", bg: "#5aa9e6" },
  { id: 4, student: "Nada Ali", assignment: "Task 3", track: "Frontend", status: "Graded", avatar: "char-girl.png", bg: "#3fc9b0" },
];

const BADGE: Record<Status, string> = {
  Submitted: "bg-[#cfeedd] text-[#2f9a5f]",
  Pending: "bg-[#fdeeb8] text-[#b7840f]",
  Graded: "bg-[#e3e6ea] text-[#5a6270]",
};

const STATS = [
  { icon: FileText, label: "Total Submissions", value: "1,420", color: "#14365a" },
  { icon: CheckCircle2, label: "Avg Score", value: "92%", color: "#2f9a5f" },
  { icon: Clock, label: "Pending Review", value: "88", color: "#d9822b" },
  { icon: Star, label: "Approved", value: "1,280", color: "#d9a21b" },
];

export default function AssignmentsPage() {
  const t = useT();
  const [rows, setRows] = useState(SEED);

  // Demo only: marks the submission as graded in this page
  const review = (id: number) => setRows((list) => list.map((r) => (r.id === id && r.status !== "Graded" ? { ...r, status: "Graded" } : r)));

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
            {/* TODO: open the "create assignment" form / call the API */}
            <button
              type="button"
              className="inline-flex items-center gap-[0.5em] rounded-[0.6em] bg-[#2f5be0] px-[1.2em] py-[0.55em] text-[0.75em] font-semibold text-white hover:bg-[#274ec4]"
            >
              <Plus className="size-[1.1em]" strokeWidth={3} /> {t("Create Assignment")}
            </button>
          </header>

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
                {rows.map((r) => (
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
                      <span className={`inline-block rounded-full px-[0.9em] py-[0.15em] text-[0.85em] font-semibold ${BADGE[r.status]}`}>{t(r.status)}</span>
                    </td>
                    <td className="py-[0.7em] text-right">
                      <button
                        type="button"
                        onClick={() => review(r.id)}
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
        </section>
      </AdminBody>
    </AdminPage>
  );
}