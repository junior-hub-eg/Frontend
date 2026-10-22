"use client";

import { FileText, Briefcase, CheckCircle2, TrendingUp } from "lucide-react";
import { useT } from "@/lib/i18n/client";

export function ApplicationsStats() {
  const t = useT();
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Total Applications */}
      <div className="flex flex-col justify-between rounded-[22px] bg-[#181E29] p-6 text-white shadow-md transition-transform hover:-translate-y-1">
        <div className="grid size-11 place-items-center rounded-xl bg-white/10 text-white">
          <FileText size={20} />
        </div>
        <div className="mt-6">
          <span className="text-3xl font-extrabold tracking-tight sm:text-4xl">3</span>
          <p className="mt-1 text-xs font-semibold text-white/80">{t("Total Applications")}</p>
          <p className="mt-2 text-[11px] font-bold text-emerald-400">{t("{n} vs last month", { n: "+2" })}</p>
        </div>
      </div>

      {/* 2. Under Review */}
      <div className="flex flex-col justify-between rounded-[22px] bg-[#0A666A] p-6 text-white shadow-md transition-transform hover:-translate-y-1">
        <div className="grid size-11 place-items-center rounded-xl bg-white/10 text-white">
          <Briefcase size={20} />
        </div>
        <div className="mt-6">
          <span className="text-3xl font-extrabold tracking-tight sm:text-4xl">1</span>
          <p className="mt-1 text-xs font-semibold text-white/80">{t("Under Review")}</p>
          <p className="mt-2 text-[11px] font-bold text-emerald-300">{t("In Progress")}</p>
        </div>
      </div>

      {/* 3. Accepted Offers */}
      <div className="flex flex-col justify-between rounded-[22px] bg-[#1D2E4E] p-6 text-white shadow-md transition-transform hover:-translate-y-1">
        <div className="grid size-11 place-items-center rounded-xl bg-white/10 text-white">
          <CheckCircle2 size={20} />
        </div>
        <div className="mt-6">
          <span className="text-3xl font-extrabold tracking-tight sm:text-4xl">1</span>
          <p className="mt-1 text-xs font-semibold text-white/80">{t("Accepted Offers")}</p>
          <p className="mt-2 text-[11px] font-bold text-emerald-400">{t("{n} vs last month", { n: "+1" })}</p>
        </div>
      </div>

      {/* 4. Profile Strength */}
      <div className="flex flex-col justify-between rounded-[22px] bg-[#A2C7C4] p-6 text-[#1b2a5c] shadow-md transition-transform hover:-translate-y-1">
        <div className="grid size-11 place-items-center rounded-xl bg-[#1b2a5c]/10 text-[#1b2a5c]">
          <TrendingUp size={20} />
        </div>
        <div className="mt-6">
          <span className="text-3xl font-extrabold tracking-tight sm:text-4xl">85%</span>
          <p className="mt-1 text-xs font-semibold text-[#1b2a5c]/80">{t("Profile Strength")}</p>
          <p className="mt-2 text-[11px] font-bold text-emerald-700">{t("{n} vs last month", { n: "+10%" })}</p>
        </div>
      </div>
    </div>
  );
}
