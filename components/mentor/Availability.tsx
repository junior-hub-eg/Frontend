"use client";

import { useState } from "react";
import { CalendarClock, Check, Plus, X } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { WEEK_AVAILABILITY } from "@/lib/data/mentor-workspace";
import { Card, Eyebrow, PageHeading, Pill, fieldCls, primaryBtn } from "./mentor-ui";
import { cn } from "@/lib/utils";

type Slot = { id: string; time: string; booked?: boolean };

/** "4:00 PM" -> minutes since midnight, for sorting and comparing. */
const mins = (v: string) => {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(v.trim());
  if (!m) return 0;
  return (Number(m[1]) % 12) * 60 + Number(m[2]) + (m[3].toUpperCase() === "PM" ? 720 : 0);
};
const to12 = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};

export default function Availability() {
  const t = useT();
  const [week, setWeek] = useState<Record<string, Slot[]>>(() =>
    Object.fromEntries(WEEK_AVAILABILITY.map((d) => [d.key, d.slots.map((s, i) => ({ id: `${d.key}-${i}`, ...s }))])),
  );
  const [day, setDay] = useState("mon");
  const [start, setStart] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ahead, setAhead] = useState("2");
  const [saved, setSaved] = useState(false);

  function add() {
    if (!start) return setError(t("Choose a start time."));
    const time = to12(start);
    if ((week[day] ?? []).some((s) => mins(s.time) === mins(time))) return setError(t("You already have a slot at that time."));
    setError(null);
    setSaved(false);
    setWeek((w) => ({ ...w, [day]: [...(w[day] ?? []), { id: `${day}-${Date.now()}`, time }].sort((a, b) => mins(a.time) - mins(b.time)) }));
    setStart("");
  }
  function remove(dayKey: string, id: string) {
    setSaved(false);
    setWeek((w) => ({ ...w, [dayKey]: w[dayKey].filter((s) => s.id !== id) }));
  }
  const total = Object.values(week).reduce((n, s) => n + s.length, 0);

  return (
    <>
      <PageHeading
        eyebrow={t("Availability")}
        title={t("Weekly availability")}
        subtitle={t("Set the times students can book with you for your sessions.")}
        action={
          <button type="button" className={primaryBtn} onClick={() => setSaved(true)}>
            <Check className="size-4" /> {t("Save Availability")}
          </button>
        }
      />
      {saved && <p role="status" className="rounded-xl bg-[#d5f0eb] px-4 py-2 text-sm font-semibold text-[#0b7a77]">{t("Availability saved")}</p>}

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <div className="flex items-start justify-between gap-2">
            <div>
              <Eyebrow>{t("Weekly schedule")}</Eyebrow>
              <h2 className="text-lg font-bold">{t("Open slots")}</h2>
              <p className="text-xs text-[#14305a]/60">{t("Slots repeat every week until you change them.")}</p>
            </div>
            <Pill>{t("{n} slots", { n: total })}</Pill>
          </div>
          <div className="mt-4 overflow-x-auto">
            <div className="grid min-w-[34rem] grid-cols-7 gap-2">
              {WEEK_AVAILABILITY.map((d) => (
                <div key={d.key} className="rounded-xl bg-[#f4fbf9] p-2">
                  <p className="text-center text-[0.7rem] font-bold">{t(d.short)}</p>
                  <ul className="mt-2 space-y-1.5">
                    {week[d.key].length === 0 && <li className="py-3 text-center text-[0.65rem] text-[#14305a]/40">{t("No slots")}</li>}
                    {week[d.key].map((s) => (
                      <li key={s.id} className={cn("group flex items-center justify-between gap-1 rounded-lg px-1.5 py-1.5 text-[0.65rem] font-semibold", s.booked ? "bg-[#14305a] text-white" : "bg-[#c8ece6] text-[#0b5f5d]")}>
                        <span>{s.time}</span>
                        {s.booked ? (
                          <span className="text-[0.55rem] font-medium opacity-80">{t("Booked")}</span>
                        ) : (
                          <button type="button" onClick={() => remove(d.key, s.id)} aria-label={t("Remove slot")} className="opacity-60 hover:opacity-100">
                            <X className="size-3" />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="space-y-3">
            <div>
              <Eyebrow>{t("New slot")}</Eyebrow>
              <h2 className="text-lg font-bold">{t("Add availability")}</h2>
            </div>
            <label className="block text-xs font-semibold">
              {t("Day")}
              <select className={cn(fieldCls, "mt-1.5 font-normal")} value={day} onChange={(e) => setDay(e.target.value)}>
                {WEEK_AVAILABILITY.map((d) => <option key={d.key} value={d.key}>{t(d.label)}</option>)}
              </select>
            </label>
            <label className="block text-xs font-semibold">
              {t("Start time")}
              <input type="time" className={cn(fieldCls, "mt-1.5 font-normal")} value={start} onChange={(e) => setStart(e.target.value)} />
            </label>
            <p className="text-[0.7rem] text-[#14305a]/55">{t("Each session lasts 45 minutes.")}</p>
            {error && <p role="alert" className="text-xs font-semibold text-[#b83232]">{error}</p>}
            <button type="button" onClick={add} className={cn(primaryBtn, "w-full")}>
              <Plus className="size-4" /> {t("Add Slot")}
            </button>
          </Card>

          <Card className="space-y-3">
            <div>
              <Eyebrow>{t("Booking window")}</Eyebrow>
              <h2 className="text-lg font-bold">{t("How far ahead?")}</h2>
              <p className="text-xs text-[#14305a]/60">{t("Students can book up to this far in advance.")}</p>
            </div>
            <select className={fieldCls} value={ahead} onChange={(e) => { setAhead(e.target.value); setSaved(false); }} aria-label={t("Booking window")}>
              <option value="1">{t("1 week")}</option>
              <option value="2">{t("2 weeks")}</option>
              <option value="4">{t("4 weeks")}</option>
            </select>
            <p className="flex items-center gap-2 rounded-xl bg-[#e9f7f4] px-3 py-2 text-xs">
              <CalendarClock className="size-4 text-[#0f8f8c]" /> {t("Your calendar is open for {n} weeks ahead.", { n: ahead })}
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}
