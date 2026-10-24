"use client";

import { useCallback } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft, Award, CheckCircle2, CheckSquare, Circle, MessageSquare, ArrowRight } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { getMonitorStudent } from "@/lib/monitor-api";
import { Avatar, Card, Eyebrow, Pill } from "./mentor-ui";
import { LoadState, useMentorData } from "./mentor-data";

export default function StudentProfile({ id }: { id: string }) {
  const t = useT();
  const load = useCallback(() => getMonitorStudent(id), [id]);
  const { data: s, error, reload } = useMentorData(load, tk("Could not load this student."));

  if (!s) {
    return (
      <>
        <Link href={"/mentor/dashboard" as Route} className="flex w-fit items-center gap-1.5 text-xs font-semibold text-[#0f8f8c]">
          <ArrowLeft className="size-3.5 rtl:rotate-180" /> {t("Back to dashboard")}
        </Link>
        <LoadState error={error} onRetry={reload} />
      </>
    );
  }

  return (
    <>
      <Link href={"/mentor/dashboard" as Route} className="flex w-fit items-center gap-1.5 text-xs font-semibold text-[#0f8f8c]">
        <ArrowLeft className="size-3.5 rtl:rotate-180" /> {t("Back to dashboard")}
      </Link>

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#14305a] p-5 text-white">
        <div className="flex items-center gap-4">
          <Avatar initials={s.initials} size="lg" className="bg-[#3cc4bd] text-[#14305a]" />
          <div>
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.16em] text-white/55">{t("Student profile")}</p>
            <h1 className="text-2xl font-bold">{s.name}</h1>
            <p className="text-xs text-white/70">{t(s.track)} {t("student")}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/mentor/messages?student=${s.id}` as Route} className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-xs font-semibold hover:bg-white/25"><MessageSquare className="size-4" /> {t("Open Conversation")}</Link>
          <Link href={"/mentor/sessions" as Route} className="inline-flex items-center gap-2 rounded-xl bg-[#3cc4bd] px-4 py-2 text-xs font-semibold text-[#14305a] hover:bg-[#5fd3cd]">{t("View Sessions")}</Link>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr]">
        <Card>
          <Eyebrow>{t("Overall progress")}</Eyebrow>
          <p className="text-sm font-bold">{t(s.progressTitle)}</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#e3eeec]" role="progressbar" aria-valuenow={s.progress} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full bg-[#0f8f8c]" style={{ width: `${s.progress}%` }} />
            </div>
            <span className="text-sm font-bold">{s.progress}%</span>
          </div>
        </Card>
        <Card className="flex items-center gap-3"><CheckCircle2 className="size-5 text-[#0f8f8c]" /><div><p className="text-2xl font-bold">{s.completedLessons}</p><p className="text-xs text-[#14305a]/60">{t("Completed lessons")}</p></div></Card>
        <Card className="flex items-center gap-3"><CheckSquare className="size-5 text-[#0f8f8c]" /><div><p className="text-2xl font-bold">{s.pendingTasks}</p><p className="text-xs text-[#14305a]/60">{t("Pending tasks")}</p></div></Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <Eyebrow>{t("Learning progress")}</Eyebrow>
          <h2 className="text-lg font-bold">{t("Recent learning activity")}</h2>
          {s.recent.length === 0 && <p className="py-8 text-center text-sm text-[#14305a]/60">{t("No learning activity yet.")}</p>}
          <ul className="mt-3 divide-y divide-[#e6efed]">
            {s.recent.map((r, i) => (
              <li key={`${r.title}-${i}`} className="flex items-center gap-3 py-3">
                {r.done ? <CheckCircle2 className="size-4 text-[#0f8f8c]" /> : <Circle className="size-4 text-[#14305a]/35" />}
                <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{r.title}</span><span className="block text-xs text-[#14305a]/60">{t(r.when)}</span></span>
                {!r.done && <Pill tone="amber">{t("In progress")}</Pill>}
              </li>
            ))}
          </ul>
        </Card>
        <div className="flex flex-col gap-4">
          <Card>
            <Eyebrow>{t("Outstanding tasks")}</Eyebrow>
            <h2 className="text-lg font-bold">{t("Next steps")}</h2>
            <ul className="mt-3 space-y-2">
              {s.nextSteps.map((n) => <li key={n} className="flex items-center gap-2 rounded-xl bg-[#f2faf8] px-3 py-2 text-xs font-semibold"><ArrowRight className="size-3.5 text-[#0f8f8c] rtl:rotate-180" /> {t(n)}</li>)}
            </ul>
          </Card>
          <Card>
            <Eyebrow>{t("Achievements")}</Eyebrow>
            <h2 className="text-lg font-bold">{t("Recent badges")}</h2>
            {s.badges.length === 0 && <p className="py-4 text-center text-xs text-[#14305a]/60">{t("No badges yet.")}</p>}
            <ul className="mt-3 space-y-2">
              {s.badges.map((b) => <li key={b} className="flex items-center gap-2 rounded-xl bg-[#f2faf8] px-3 py-2 text-xs font-semibold"><Award className="size-3.5 text-[#0f8f8c]" /> {t(b)}</li>)}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
