"use client";

import { ArrowUpRight, ChartSpline } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { MOCK_ENGAGEMENT, MOCK_VELOCITY as V } from "../dashboardMock";
import { Bar, Section } from "../mentor-detail/parts";

export function AudienceEngagement() {
  const t = useT();
  return (
    <Section title={t("Audience Engagement")} action={<span className="text-[0.7em] text-[#8a97a6]">{t("Past 30 Days")}</span>}>
      <ul className="grid gap-[1em] text-[0.8em]">
        {MOCK_ENGAGEMENT.map((m) => (
          <li key={m.label}>
            <p className="mb-[0.3em] flex justify-between font-semibold text-[#14365a]"><span className="inline-flex items-center gap-[0.5em]"><span className="size-[0.6em] rounded-full" style={{ background: m.color }} />{t(m.label)}</span><b className="text-[#0b1b2b]">{m.value}%</b></p>
            <Bar pct={m.value} color={m.color} />
            <p className="mt-[0.3em] flex justify-between text-[0.85em] text-[#8a97a6]"><span>{t("Benchmark")}: {m.bench}%</span><span className="font-semibold text-[#12676b]">+{(m.value - m.bench).toFixed(1)}% {t("above avg")}</span></p>
          </li>
        ))}
      </ul>

      <div className="mt-[1.2em] rounded-[0.9em] bg-[#f1f5fd] p-[1em]">
        <p className="flex justify-between text-[0.75em] font-semibold text-[#14365a]"><span>{t("Weekly Delivery Velocity")}</span><span className="text-[#0b6f86]">{V.rate} {t("High")}</span></p>
        <div className="mt-[0.8em] flex h-[5em] items-end gap-[0.4em]" aria-hidden>
          {V.bars.map((h, i) => <span key={i} className="flex-1 rounded-[0.3em]" style={{ height: `${h}%`, background: h > 50 ? "#22c1dd" : "#dbe8fb" }} />)}
        </div>
        <div className="mt-[0.3em] flex gap-[0.4em] text-center text-[0.65em] text-[#8a97a6]">{V.days.map((d, i) => <span key={i} className="flex-1">{d}</span>)}</div>
      </div>

      <p className="mt-[1em] flex items-center justify-between text-[0.75em] text-[#5b6b7c]">
        <span className="inline-flex items-center gap-[0.4em]"><ChartSpline className="size-[1em]" /> {t("Need push gateway logs?")}</span>
        <button type="button" className="inline-flex items-center gap-[0.3em] font-semibold text-[#0b6f86]">{t("Server Webhooks")} <ArrowUpRight className="size-[1em]" /></button>
      </p>
    </Section>
  );
}