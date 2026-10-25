"use client";

import { useState } from "react";
import { Activity, BellRing, CalendarClock, ChevronLeft, ChevronRight, ClipboardCheck, Hand, Mail, Monitor, Pencil, Send, ShieldAlert, Users, X } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { PANEL } from "../page-parts";
import type { MockBroadcast } from "../dashboardMock";

const ROW_ICONS = [CalendarClock, Users, ShieldAlert, ClipboardCheck, Hand];
const CH = { "In-App": Monitor, Email: Mail, Push: BellRing };

export function BroadcastTable({ items }: { items: MockBroadcast[] }) {
  const t = useT();
  const [page, setPage] = useState(1);

  return (
    <section className={`${PANEL} min-w-0 overflow-hidden`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[44em] text-start text-[0.8em]">
          <thead>
            <tr className="bg-[#eaf1fd] text-[0.8em] font-bold uppercase text-[#14365a]/70">
              {["Notification Title & Topic", "Target Audience", "Channel", "Status & Date"].map((h) => (
                <th key={h} className="px-[1.1em] py-[0.9em] text-start">{t(h)}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-[#14365a]">
            {items.map((b, i) => {
              const Icon = ROW_ICONS[i % ROW_ICONS.length];
              const done = b.status === "delivered";
              return (
                <tr key={b.id} className="border-b border-[#eef2f6] align-middle last:border-0">
                  <td className="px-[1.1em] py-[1em]">
                    <div className="flex items-center gap-[0.8em]">
                      <span className="grid size-[2.6em] shrink-0 place-items-center rounded-[0.7em] bg-[#e0f6fc] text-[#0b89a6]"><Icon className="size-[1.2em]" /></span>
                      <div className="min-w-0">
                        <b className="block text-[1.05em] text-[#0b1b2b]">{b.title}</b>
                        <span className="text-[0.85em] text-[#8a97a6]">{b.meta} • ID: #{b.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-[1.1em]"><b className="block">{b.audience}</b><span className="text-[0.85em] text-[#8a97a6]">{b.audienceSub}</span></td>
                  <td className="px-[1.1em]">
                    <span className="flex flex-col items-start gap-[0.3em]">
                      {b.channels.map((c) => {
                        const C = CH[c];
                        return <span key={c} className="inline-flex items-center gap-[0.4em] rounded-full bg-[#dff3fb] px-[0.7em] py-[0.15em] text-[0.85em] font-semibold text-[#0b6f86]"><C className="size-[0.95em]" />{c === "In-App" ? t("In-App") : c === "Email" ? t("Email") : t("Push")}</span>;
                      })}
                    </span>
                  </td>
                  <td className="px-[1.1em]">
                    <span className={`inline-block rounded-full px-[0.8em] py-[0.2em] text-[0.85em] font-semibold ${done ? "bg-[#d7efe6] text-[#12676b]" : "bg-[#dff3fb] text-[#0b6f86]"}`}>● {t(b.statusLabel)}</span>
                    <span className="mt-[0.3em] block text-[0.85em] text-[#8a97a6]">{b.date}</span>
                    {done ? (
                      <button type="button" className="mt-[0.3em] inline-flex items-center gap-[0.4em] text-[0.85em] font-semibold text-[#0b6f86]">{t("View Analytics")} <Activity className="size-[1em]" /></button>
                    ) : (
                      <span className="mt-[0.4em] flex gap-[0.6em] text-[#5b6b7c]">
                        <button type="button" aria-label={t("Edit")}><Pencil className="size-[1em]" /></button>
                        <button type="button" aria-label={t("Send now")}><Send className="size-[1em]" /></button>
                        <button type="button" aria-label={t("Cancel")}><X className="size-[1em]" /></button>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && <tr><td colSpan={4} className="py-[2.5em] text-center text-[#5b6b7c]">{t("No broadcasts match your filters.")}</td></tr>}
          </tbody>
        </table>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-[0.8em] px-[1.1em] py-[0.9em] text-[0.75em] text-[#5b6b7c]">
        <span>{t("Showing {from}-{to} of {total} broadcasts", { from: 1, to: items.length, total: "1,420" })}</span>
        <nav aria-label={t("Pagination")} className="flex items-center gap-[0.3em]">
          <button type="button" aria-label={t("Previous page")} disabled={page <= 1} onClick={() => setPage(page - 1)} className="grid size-[2.2em] place-items-center rounded-[0.4em] bg-[#eef3fa] disabled:opacity-40 rtl:rotate-180"><ChevronLeft className="size-[1.1em]" /></button>
          {[1, 2, 3, 284].map((n) => (
            <button key={n} type="button" onClick={() => setPage(n)} aria-current={n === page ? "page" : undefined} className={`grid h-[2.2em] min-w-[2.2em] place-items-center rounded-[0.4em] px-[0.5em] font-semibold ${n === page ? "bg-[#06b6d4] text-white" : "text-[#14365a] hover:bg-[#eef3fa]"}`}>{n}</button>
          ))}
          <button type="button" aria-label={t("Next page")} onClick={() => setPage(page + 1)} className="grid size-[2.2em] place-items-center rounded-[0.4em] bg-[#eef3fa] rtl:rotate-180"><ChevronRight className="size-[1.1em]" /></button>
        </nav>
      </footer>
    </section>
  );
}