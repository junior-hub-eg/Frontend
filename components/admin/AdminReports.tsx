"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { AdminPage, PageHero } from "./AdminPage";
import { ReportStats } from "./ReportStats";
import { ReportCharts } from "./ReportCharts";

/** The value is what is kept; the label is translated when shown. */
const PERIODS = [tk("This Week"), tk("This Month"), tk("This Year")];

export default function AdminReports() {
  const t = useT();
  const [period, setPeriod] = useState(PERIODS[1]);

  return (
    <AdminPage>
      {/* The hero is taller at the bottom so the charts can sit on top of it */}
      <PageHero title={t("Reports & Analytics")} contentClassName="pb-[6em]">
        <label className="pointer-events-auto absolute end-[1.6em] top-[calc(var(--u)*5.6)] hidden items-center gap-[0.4em] text-[0.8em] font-medium text-[#14365a]/80 sm:flex lg:end-[9%]">
          <span className="sr-only">{t("Period")}</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="cursor-pointer appearance-none bg-transparent pe-[1.4em] outline-none"
          >
            {PERIODS.map((p) => (
              <option key={p} value={p}>
                {t(p)}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none -ms-[1.4em] size-[1em]" />
        </label>

        <ReportStats className="mt-[1.6em] lg:w-[85%]" />
      </PageHero>

      <div className="relative z-10 mx-auto -mt-[3.5em] w-full lg:w-[82%]">
        <ReportCharts />
      </div>
    </AdminPage>
  );
}