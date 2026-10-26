"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarClock, LoaderCircle, Mail, Send } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { useI18n } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { getReportSchedule, saveReportSchedule, sendReportNow, type ReportSchedule, type ReportScheduleInput } from "@/lib/reports-api";
import { cn } from "@/lib/utils";
import { KitError, KitSkeleton, ReportCard } from "./ui";

const fieldCls =
  "h-[2.5em] w-full rounded-[0.7em] border border-[#d6dde6] bg-white px-[0.7em] text-[0.85em] text-[#1b2d54] outline-none focus:ring-2 focus:ring-[#0f7378]/30 disabled:bg-[#f6f9fb] disabled:text-[#94a3b8]";

const inputOf = (s: ReportSchedule): ReportScheduleInput => ({
  enabled: s.enabled,
  frequency: s.frequency,
  dayOfWeek: s.dayOfWeek,
  dayOfMonth: s.dayOfMonth,
  language: s.language,
});

/** The e-mailed report: on/off, weekly or monthly, which day, which language; Save and Send now. */
export function ScheduleCard({ className }: { className?: string }) {
  const { t, intl } = useI18n();
  const [saved, setSaved] = useState<ReportSchedule | null>(null);
  const [form, setForm] = useState<ReportScheduleInput | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"save" | "send" | null>(null);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(() => {
    setLoadError(null);
    getReportSchedule().then(
      (s) => {
        setSaved(s);
        setForm(inputOf(s));
      },
      (e) => setLoadError(errorMessage(e, t("We could not load your report schedule."))),
    );
  }, [t]);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const dirty = !!(saved && form && JSON.stringify(inputOf(saved)) !== JSON.stringify(form));
  const set = (patch: Partial<ReportScheduleInput>) => {
    setNote(null);
    setForm((f) => (f ? { ...f, ...patch } : f));
  };
  const when = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString(intl, { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "—";
  const weekdays = Array.from({ length: 7 }, (_, i) => new Date(2024, 0, 7 + i).toLocaleDateString(intl, { weekday: "long" }));

  const save = async () => {
    if (!form) return;
    setBusy("save");
    setNote(null);
    try {
      const next = await saveReportSchedule(form);
      if (next) {
        setSaved(next);
        setForm(inputOf(next));
      } else {
        load();
      }
      setNote({ ok: true, text: t("Schedule saved.") });
    } catch (e) {
      setNote({ ok: false, text: errorMessage(e, t("The schedule could not be saved. Try again.")) });
    } finally {
      setBusy(null);
    }
  };

  const sendNow = async () => {
    setBusy("send");
    setNote(null);
    try {
      await sendReportNow();
      setNote({ ok: true, text: saved?.email ? t("Report sent to {email}.", { email: saved.email }) : t("Report sent to your e-mail.") });
      load();
    } catch (e) {
      setNote({ ok: false, text: errorMessage(e, t("The report could not be sent. Try again.")) });
    } finally {
      setBusy(null);
    }
  };

  return (
    <ReportCard
      className={cn("rk-no-print", className)}
      title={
        <span className="flex items-center gap-[0.5em]">
          <span className="grid size-[1.9em] place-items-center rounded-[0.6em] bg-[#e0f4f2] text-[#0f7378]">
            <CalendarClock aria-hidden className="size-[1em]" />
          </span>
          {t("E-mail report schedule")}
        </span>
      }
      hint={t("Get a summary of this report in your inbox.")}
      action={
        form && (
          <label className="flex cursor-pointer items-center gap-[0.5em] text-[0.82em] font-semibold text-[#1b2d54]">
            {form.enabled ? t("On") : t("Off")}
            <button
              type="button"
              role="switch"
              aria-checked={form.enabled}
              aria-label={t("Send the report by e-mail")}
              onClick={() => set({ enabled: !form.enabled })}
              className={cn("relative h-[1.5em] w-[2.7em] rounded-full transition-colors", form.enabled ? "bg-[#0f7378]" : "bg-[#cbd5e1]")}
            >
              <span className={cn("absolute top-[0.2em] size-[1.1em] rounded-full bg-white shadow transition-[inset-inline-start]", form.enabled ? "start-[1.4em]" : "start-[0.2em]")} />
            </button>
          </label>
        )
      }
    >
      {loadError ? (
        <KitError text={loadError} onRetry={load} retryLabel={t("Try again")} />
      ) : !form || !saved ? (
        <div className="space-y-[0.6em]">
          <KitSkeleton className="h-[2.4em] w-full" />
          <KitSkeleton className="h-[2.4em] w-[70%]" />
        </div>
      ) : (
        <>
          <div className="grid gap-[0.8em] sm:grid-cols-3">
            <div className="grid gap-[0.3em]">
              <span className="text-[0.76em] font-semibold text-[#475467]">{t("How often")}</span>
              <div role="radiogroup" aria-label={t("How often")} className="inline-flex h-[2.5em] rounded-[0.7em] bg-[#eef2f7] p-[0.2em]">
                {([["Weekly", tk("Weekly")], ["Monthly", tk("Monthly")]] as const).map(([f, label]) => (
                  <button
                    key={f}
                    type="button"
                    role="radio"
                    aria-checked={form.frequency === f}
                    disabled={!form.enabled}
                    onClick={() => set({ frequency: f })}
                    className={cn(
                      "flex-1 rounded-[0.55em] text-[0.8em] transition-colors disabled:opacity-50",
                      form.frequency === f ? "bg-white font-semibold text-[#0f7378] shadow-sm" : "text-[#475467]",
                    )}
                  >
                    {t(label)}
                  </button>
                ))}
              </div>
            </div>
            <label className="grid gap-[0.3em]">
              <span className="text-[0.76em] font-semibold text-[#475467]">{form.frequency === "Weekly" ? t("Day of the week") : t("Day of the month")}</span>
              {form.frequency === "Weekly" ? (
                <select value={form.dayOfWeek} disabled={!form.enabled} onChange={(e) => set({ dayOfWeek: Number(e.target.value) })} className={fieldCls}>
                  {weekdays.map((name, i) => <option key={i} value={i}>{name}</option>)}
                </select>
              ) : (
                <select value={form.dayOfMonth} disabled={!form.enabled} onChange={(e) => set({ dayOfMonth: Number(e.target.value) })} className={fieldCls}>
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              )}
            </label>
            <label className="grid gap-[0.3em]">
              <span className="text-[0.76em] font-semibold text-[#475467]">{t("Report language")}</span>
              <select value={form.language} disabled={!form.enabled} onChange={(e) => set({ language: e.target.value as "en" | "ar" })} className={fieldCls}>
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </label>
          </div>

          <dl className="mt-[1em] grid gap-[0.5em] rounded-[0.9em] bg-[#f6f9fb] p-[0.9em] text-[0.8em] sm:grid-cols-3">
            <div className="flex min-w-0 items-center gap-[0.4em]">
              <Mail aria-hidden className="size-[1em] shrink-0 text-[#0f7378]" />
              <dt className="text-[#64748b]">{t("Sent to")}</dt>
              <dd className="truncate font-semibold text-[#1b2d54]" dir="ltr">{saved.email ?? "—"}</dd>
            </div>
            <div className="flex items-center gap-[0.4em]">
              <dt className="text-[#64748b]">{t("Next report")}</dt>
              <dd className="font-semibold text-[#1b2d54]">{saved.enabled ? when(saved.nextSendUtc) : t("Off")}</dd>
            </div>
            <div className="flex items-center gap-[0.4em]">
              <dt className="text-[#64748b]">{t("Last sent")}</dt>
              <dd className="font-semibold text-[#1b2d54]">{when(saved.lastSentUtc)}</dd>
            </div>
          </dl>

          <div className="mt-[1em] flex flex-wrap items-center justify-end gap-[0.6em]">
            {note && (
              <p role="status" className={cn("me-auto text-[0.8em]", note.ok ? "text-[#167a3e]" : "text-[#b42318]")}>
                {note.text}
              </p>
            )}
            <button
              type="button"
              onClick={sendNow}
              disabled={busy !== null}
              className="inline-flex h-[2.5em] items-center gap-[0.45em] rounded-[0.7em] border border-[#d6dde6] bg-white px-[1em] text-[0.82em] font-semibold text-[#1b2d54] hover:bg-[#f7f9fc] disabled:opacity-50"
            >
              {busy === "send" ? <LoaderCircle aria-hidden className="size-[1em] animate-spin" /> : <Send aria-hidden className="size-[1em]" />}
              {t("Send now")}
            </button>
            <button
              type="button"
              onClick={save}
              disabled={!dirty || busy !== null}
              className="inline-flex h-[2.5em] items-center gap-[0.45em] rounded-[0.7em] bg-[#0f7378] px-[1.1em] text-[0.82em] font-semibold text-white hover:bg-[#0c5f63] disabled:opacity-45"
            >
              {busy === "save" && <LoaderCircle aria-hidden className="size-[1em] animate-spin" />}
              {t("Save schedule")}
            </button>
          </div>
        </>
      )}
    </ReportCard>
  );
}
