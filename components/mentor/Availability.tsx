"use client";

import { useState } from "react";
import { CalendarClock, Check, Plus, X } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { errorMessage } from "@/lib/api-client";
import { tk } from "@/lib/i18n/translate";
import { getMonitorAvailability, saveMonitorAvailability, type MentorAvailability, type Weekday } from "@/lib/monitor-api";
import { Card, Eyebrow, PageHeading, Pill, fieldCls, primaryBtn } from "./mentor-ui";
import { LoadState, useMentorData } from "./mentor-data";
import { cn } from "@/lib/utils";

/** A slot keeps the backend's "HH:mm" (24h) start time. */
type Slot = { id: string; time: string; booked?: boolean };

const WEEK: { key: string; label: string; short: string; day: Weekday }[] = [
  { key: "mon", label: tk("Monday"), short: tk("Mon"), day: "Monday" },
  { key: "tue", label: tk("Tuesday"), short: tk("Tue"), day: "Tuesday" },
  { key: "wed", label: tk("Wednesday"), short: tk("Wed"), day: "Wednesday" },
  { key: "thu", label: tk("Thursday"), short: tk("Thu"), day: "Thursday" },
  { key: "fri", label: tk("Friday"), short: tk("Fri"), day: "Friday" },
  { key: "sat", label: tk("Saturday"), short: tk("Sat"), day: "Saturday" },
  { key: "sun", label: tk("Sunday"), short: tk("Sun"), day: "Sunday" },
];

/** "16:30" -> minutes since midnight, for sorting and comparing. */
const mins = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};
const to12 = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};
const toWeek = (a: MentorAvailability): Record<string, Slot[]> =>
  Object.fromEntries(
    WEEK.map((d) => [
      d.key,
      (a.days.find((x) => x.key === d.key)?.slots ?? []).map((s, i) => ({ id: `${d.key}-${i}`, time: s.time, booked: s.booked })),
    ]),
  );

export default function Availability() {
  const { data, error, reload } = useMentorData(getMonitorAvailability, tk("Could not load your availability."));
  if (!data) return <LoadState error={error} onRetry={reload} />;
  return <AvailabilityForm initial={data} />;
}

function AvailabilityForm({ initial }: { initial: MentorAvailability }) {
  const t = useT();
  const [week, setWeek] = useState<Record<string, Slot[]>>(() => toWeek(initial));
  const [day, setDay] = useState("mon");
  const [start, setStart] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ahead, setAhead] = useState(String(initial.bookingWindowWeeks));
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  function add() {
    if (!start) return setError(t("Choose a start time."));
    const time = start.slice(0, 5);
    if ((week[day] ?? []).some((s) => mins(s.time) === mins(time))) return setError(t("You already have a slot at that time."));
    setError(null);
    setSaved(false);
    setWeek((w) => ({ ...w, [day]: [...(w[day] ?? []), { id: `${day}-${Date.now()}`, time }].sort((a, b) => mins(a.time) - mins(b.time)) }));
    setStart("");
  }
  async function save() {
    setSaving(true);
    setSaveError(null);
    try {
      const slots = WEEK.flatMap((d) => (week[d.key] ?? []).map((s) => ({ dayOfWeek: d.day, startTime: s.time })));
      const result = await saveMonitorAvailability(Number(ahead), slots);
      setWeek(toWeek(result));
      setAhead(String(result.bookingWindowWeeks));
      setSaved(true);
    } catch (e) {
      setSaveError(errorMessage(e, t("Could not save your availability.")));
    } finally {
      setSaving(false);
    }
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
          <button type="button" className={primaryBtn} disabled={saving} onClick={save}>
            <Check className="size-4" /> {t("Save Availability")}
          </button>
        }
      />
      {saved && <p role="status" className="rounded-xl bg-[#d5f0eb] px-4 py-2 text-sm font-semibold text-[#0b7a77]">{t("Availability saved")}</p>}
      {saveError && <p role="alert" className="rounded-xl bg-[#fdecec] px-4 py-2 text-sm font-semibold text-[#b83232]">{saveError}</p>}

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
              {WEEK.map((d) => (
                <div key={d.key} className="rounded-xl bg-[#f4fbf9] p-2">
                  <p className="text-center text-[0.7rem] font-bold">{t(d.short)}</p>
                  <ul className="mt-2 space-y-1.5">
                    {week[d.key].length === 0 && <li className="py-3 text-center text-[0.65rem] text-[#14305a]/40">{t("No slots")}</li>}
                    {week[d.key].map((s) => (
                      <li key={s.id} className={cn("group flex items-center justify-between gap-1 rounded-lg px-1.5 py-1.5 text-[0.65rem] font-semibold", s.booked ? "bg-[#14305a] text-white" : "bg-[#c8ece6] text-[#0b5f5d]")}>
                        <span dir="ltr">{to12(s.time)}</span>
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
                {WEEK.map((d) => <option key={d.key} value={d.key}>{t(d.label)}</option>)}
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
