"use client";

import { ShieldUser } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { MOCK_ROLE_ADMINS } from "../dashboardMock";
import { Section } from "../mentor-detail/parts";

const COLORS = ["#12676b", "#5b6b88", "#12939b", "#1a2b57", "#06b6d4"];

export function AssignedAdministrators() {
  const t = useT();
  return (
    <Section
      title={t("Assigned Administrators")}
      sub={t("{n} Users currently operating in this role", { n: 6 })}
      action={<button type="button" className="rounded-[0.5em] bg-[#dff3fb] px-[0.9em] py-[0.4em] text-[0.75em] font-semibold text-[#0b6f86]">+ {t("Assign User")}</button>}
    >
      <ul className="grid gap-[0.6em]">
        {MOCK_ROLE_ADMINS.map((a, i) => (
          <li key={a.email} className="flex items-center gap-[0.8em] rounded-[0.8em] bg-[#f1f5fd] p-[0.7em] text-[0.8em]">
            <span className="grid size-[2.6em] shrink-0 place-items-center rounded-full font-bold text-white" style={{ background: COLORS[i % COLORS.length] }}>{a.initials}</span>
            <div className="min-w-0 flex-1">
              <b className="flex flex-wrap items-center gap-[0.5em] text-[#0b1b2b]">{a.name} {a.badge && <span className="rounded-full bg-[#dff3fb] px-[0.6em] py-[0.05em] text-[0.8em] font-semibold text-[#0b6f86]">{t(a.badge)}</span>}</b>
              <span dir="ltr" className="block truncate text-[0.9em] text-[#5b6b7c] rtl:text-end">{a.email} · {t(a.active)}</span>
            </div>
            <button type="button" className="shrink-0 text-[0.85em] font-semibold text-[#5b6b7c] hover:text-[#0b6f86]">{t("Reassign Role")}</button>
          </li>
        ))}
      </ul>
      <p className="mt-[1em] flex justify-between text-[0.75em] text-[#5b6b7c]">
        <span className="inline-flex items-center gap-[0.4em]"><ShieldUser className="size-[1em]" /> {t("Displaying {n} of {total} assigned members", { n: 5, total: 6 })}</span>
        <button type="button" className="font-semibold text-[#0b6f86]">{t("View All Members")} →</button>
      </p>
    </Section>
  );
}