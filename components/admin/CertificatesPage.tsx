"use client";

import { useState, type FormEvent } from "react";
import { Award, BadgeCheck, Hourglass, Plus, ShieldCheck } from "lucide-react";

import { useI18n } from "@/lib/i18n/client";
import { dateLocale } from "@/lib/i18n/translate";
import {
  AdminCard,
  AdminDialog,
  AdminPageHero,
  FIELD,
  StatusPill,
  type HeroStat,
} from "./AdminPageFrame";

const TRACKS = ["Frontend", "UI/UX Design", "Backend"] as const;

type Status = "issued" | "pending";

type Cert = {
  id: number;
  student: string;
  track: string;
  date: string; // ISO yyyy-mm-dd
  status: Status;
};

// Mock data: replace with your API calls (list / issue / verify).
const INITIAL: Cert[] = [
  { id: 1, student: "Mohammed Yasser", track: "Frontend", date: "2026-10-23", status: "issued" },
  { id: 2, student: "Sarah Ahmed", track: "UI/UX Design", date: "2026-10-23", status: "pending" },
  { id: 3, student: "Amr Hassan", track: "Backend", date: "2026-10-23", status: "pending" },
  { id: 4, student: "Nada Ali", track: "Frontend", date: "2026-10-23", status: "pending" },
];

export default function CertificatesPage() {
  const { t } = useI18n();

  const [rows, setRows] = useState<Cert[]>(INITIAL);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [track, setTrack] = useState<string>(TRACKS[0]);
  const [date, setDate] = useState("");
  const [error, setError] = useState(false);

  const formatDate = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString(dateLocale(), { dateStyle: "medium" });

  const issued = rows.filter((r) => r.status === "issued").length;
  const pending = rows.length - issued;
  const rate = rows.length ? Math.round((issued / rows.length) * 100) : 0;

  const stats: HeroStat[] = [
    { label: "Total Certs", value: rows.length.toLocaleString("en"), icon: Award },
    { label: "Issued", value: String(issued), icon: BadgeCheck, valueClass: "text-[#0f8a86]" },
    { label: "Pending Verifs", value: String(pending), icon: Hourglass, valueClass: "text-[#d9822b]" },
    { label: "Verified Rate", value: `${rate}%`, icon: ShieldCheck, valueClass: "text-[#1b9a4a]" },
  ];

  const openDialog = () => {
    setName("");
    setTrack(TRACKS[0]);
    setDate(new Date().toISOString().slice(0, 10));
    setError(false);
    setOpen(true);
  };

  const issue = (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !date) {
      setError(true);

      return;
    }

    setRows((prev) => [
      { id: Math.max(0, ...prev.map((r) => r.id)) + 1, student: name.trim(), track, date, status: "issued" },
      ...prev,
    ]);
    setOpen(false);
  };

  const verify = (id: number) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: "issued" } : r)));

  return (
    <AdminPageHero title="Certificates & Verification" stats={stats}>
      <AdminCard className="mx-auto max-w-3xl">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-[#14365a]">{t("Certificates & Verification")}</h2>

          <button
            type="button"
            onClick={openDialog}
            className="flex items-center gap-1.5 rounded-lg bg-[#1d5bd8] px-3.5 py-2 text-[0.72rem] font-semibold text-white hover:bg-[#1749ad]"
          >
            <Plus className="size-3.5" /> {t("Issue Certificate")}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] text-[0.78rem] text-[#14365a]">
            <thead>
              <tr className="border-b border-[#e1e8f0] text-[0.68rem] text-[#14365a]/55">
                <th scope="col" className="py-2 pe-3 text-start font-medium">{t("Student")}</th>
                <th scope="col" className="py-2 pe-3 text-start font-medium">{t("Track Completed")}</th>
                <th scope="col" className="py-2 pe-3 text-start font-medium">{t("Completion Date")}</th>
                <th scope="col" className="py-2 pe-3 text-start font-medium">{t("Status")}</th>
                <th scope="col" className="py-2 text-end font-medium">{t("Actions")}</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-[#eef2f7] last:border-0">
                  <td className="py-2.5 pe-3 font-medium">{r.student}</td>
                  <td className="py-2.5 pe-3 text-[#14365a]/60">{t(r.track)}</td>
                  <td className="py-2.5 pe-3 text-[#14365a]/60">{formatDate(r.date)}</td>
                  <td className="py-2.5 pe-3">
                    <StatusPill tone={r.status === "issued" ? "green" : "amber"}>
                      {t(r.status === "issued" ? "Issued" : "Pending")}
                    </StatusPill>
                  </td>
                  <td className="py-2.5 text-end">
                    {r.status === "pending" ? (
                      <button
                        type="button"
                        onClick={() => verify(r.id)}
                        className="rounded-full border border-[#cfe0ee] px-3 py-1 text-[0.68rem] font-semibold hover:bg-[#eef4fa]"
                      >
                        {t("Verify")}
                      </button>
                    ) : (
                      <span className="text-[#14365a]/40">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>

      <AdminDialog open={open} title="Issue Certificate" onClose={() => setOpen(false)}>
        <form onSubmit={issue} className="space-y-3 text-sm">
          <label className="block">
            <span className="mb-1 block text-[0.72rem] font-medium">{t("Student name")}</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className={FIELD} />
          </label>

          <label className="block">
            <span className="mb-1 block text-[0.72rem] font-medium">{t("Track Completed")}</span>
            <select value={track} onChange={(e) => setTrack(e.target.value)} className={FIELD}>
              {TRACKS.map((x) => (
                <option key={x} value={x}>
                  {t(x)}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-[0.72rem] font-medium">{t("Completion Date")}</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={FIELD} />
          </label>

          {error && (
            <p role="alert" className="text-[0.75rem] font-medium text-[#e0245e]">
              {t("Please fill in all fields.")}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-[#cfe0ee] px-4 py-2 text-[0.75rem] font-semibold hover:bg-[#eef4fa]"
            >
              {t("Cancel")}
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#1d5bd8] px-4 py-2 text-[0.75rem] font-semibold text-white hover:bg-[#1749ad]"
            >
              {t("Issue Certificate")}
            </button>
          </div>
        </form>
      </AdminDialog>
    </AdminPageHero>
  );
}