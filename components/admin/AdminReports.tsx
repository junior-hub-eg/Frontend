"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AdminPage, PageHero } from "./AdminPage";
import { ReportStats } from "./ReportStats";
import { ReportCharts } from "./ReportCharts";

const PERIODS = ["This Week", "This Month", "This Year"];

export default function AdminReports() {
  const [period, setPeriod] = useState("This Month");

  return (
    <AdminPage>
      {/* The hero is taller at the bottom so the charts can sit on top of it */}
      <PageHero title="Reports & Analytics" contentClassName="pb-[6em]">
        <label className="pointer-events-auto absolute right-[1.6em] top-[calc(var(--u)*5.6)] hidden items-center gap-[0.4em] text-[0.8em] font-medium text-[#14365a]/80 sm:flex lg:right-[9%]">
          <span className="sr-only">Period</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="cursor-pointer appearance-none bg-transparent pr-[1.4em] outline-none"
          >
            {PERIODS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none -ml-[1.4em] size-[1em]" />
        </label>

        <ReportStats className="mt-[1.6em] lg:w-[85%]" />
      </PageHero>

      <div className="relative z-10 mx-auto -mt-[3.5em] w-full lg:w-[82%]">
        <ReportCharts />
      </div>
    </AdminPage>
  );
}