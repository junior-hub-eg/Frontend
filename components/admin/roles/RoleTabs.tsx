"use client";

import { ShieldCheck } from "lucide-react";
import type { AdminRole } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { PANEL } from "../page-parts";

export function RoleTabs({ roles, selectedId, onSelect }: { roles: AdminRole[]; selectedId: string; onSelect: (id: string) => void }) {
  const t = useT();
  return (
    <section className={`${PANEL} p-[1em]`}>
      <p className="flex items-center justify-between text-[0.7em] font-bold uppercase text-[#14365a]">
        <span className="inline-flex items-center gap-[0.5em]"><ShieldCheck className="size-[1.2em] text-[#0b6f86]" /> {t("Role Profiles")}</span>
        <span className="font-medium normal-case text-[#8a97a6]">{t("Switch role to inspect permissions matrix")}</span>
      </p>
      <div role="tablist" className="mt-[0.8em] flex gap-[0.6em] overflow-x-auto pb-[0.2em] [scrollbar-width:none]">
        {roles.map((r) => {
          const on = r.id === selectedId;
          return (
            <button
              key={r.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => onSelect(r.id)}
              className={`flex shrink-0 items-center gap-[0.6em] whitespace-nowrap rounded-[0.8em] px-[1.1em] py-[0.7em] text-[0.85em] font-bold ${on ? "bg-[#0b1b2b] text-white" : "bg-[#eef3fa] text-[#14365a] hover:bg-[#e1eaf7]"}`}
            >
              <span className={`size-[0.5em] rounded-full ${on ? "bg-[#06b6d4]" : "bg-[#8a97a6]"}`} />
              {t(r.name)}
              <span className={`rounded-full px-[0.7em] py-[0.1em] text-[0.8em] font-semibold ${on ? "bg-white/15" : "bg-white text-[#0b6f86]"}`}>{r.meta}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}