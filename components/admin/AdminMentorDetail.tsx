"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft, LoaderCircle, Star } from "lucide-react";
import { getAdminMentor, setMentorActive } from "@/lib/admin-api";
import { errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { AdminPage, PageHero } from "./AdminPage";
import { MentorPicture, MentorStatus } from "./MentorsTable";
import { LoadState, useAdminData } from "./admin-data";

const card = "rounded-[1.1em] bg-white p-[1.2em] shadow-[0_6px_22px_rgba(20,54,90,0.07)]";

/** One mentor, with the switch to activate or deactivate them. */
export default function AdminMentorDetail({ id }: { id: string }) {
  const t = useT();
  const load = useCallback(() => getAdminMentor(id), [id]);
  const mentor = useAdminData(load, tk("We couldn't load this mentor. Please try again."));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const m = mentor.data;

  async function toggle() {
    if (!m) return;
    setSaving(true);
    setError(null);
    try {
      mentor.setData(await setMentorActive(m.id, !m.isActive));
    } catch (e) {
      setError(errorMessage(e, tk("We couldn't save the change. Please try again.")));
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminPage>
      <PageHero title={m?.fullName ?? t("Mentor profile")} contentClassName="pb-[3em]" pictureTop>
        <Link href={"/admin/mentors" as Route} className="mt-[0.8em] inline-flex items-center gap-[0.4em] text-[0.85em] font-semibold text-[#14365a] hover:underline">
          <ArrowLeft className="size-[1em] rtl:rotate-180" /> {t("All mentors")}
        </Link>
      </PageHero>

      <div className="mx-auto mt-[1.5em] grid w-full gap-[1.2em] lg:w-[70%]">
        {!m ? (
          <LoadState error={mentor.error} onRetry={mentor.reload} />
        ) : (
          <section className={card}>
            <div className="flex flex-wrap items-center gap-[1.2em]">
              <MentorPicture mentor={m} size="4.5em" />
              <div className="min-w-0 flex-1">
                <h2 className="text-[1.2em] font-bold text-[#0b1b2b]">{m.fullName}</h2>
                <p className="text-[0.85em] text-[#5b6b7c]">
                  {m.title} · {m.trackName}
                </p>
                {m.email && (
                  <p dir="ltr" className="text-[0.8em] text-[#8a97a6] rtl:text-end">
                    {m.email}
                  </p>
                )}
              </div>
              <MentorStatus active={m.isActive} />
            </div>

            <dl className="mt-[1.2em] grid grid-cols-2 gap-[0.8em] text-[0.85em] sm:grid-cols-4">
              <Fact label={t("Students")} value={String(m.students)} />
              <Fact label={t("Squads monitored")} value={String(m.monitoredSquads)} />
              <Fact label={t("Rating")} value={<span className="inline-flex items-center gap-[0.2em]"><Star className="size-[0.9em] fill-[#f5b72b] text-[#f5b72b]" /> {m.rating}</span>} />
              <Fact label={t("Experience")} value={t("{count} years", { count: m.yearsOfExperience })} />
            </dl>
            {m.squadNames.length > 0 && (
              <p className="mt-[0.8em] text-[0.85em] text-[#5b6b7c]">
                {t("Monitors")}: {m.squadNames.join(", ")}
              </p>
            )}

            <div className="mt-[1.2em] flex flex-wrap items-center gap-[0.8em] border-t border-[#e6edf3] pt-[1em]">
              <p className="flex-1 text-[0.8em] text-[#5b6b7c]">
                {m.isActive
                  ? t("Students can choose this mentor, and the mentor can monitor squads.")
                  : t("This mentor is hidden from students and cannot monitor squads.")}
              </p>
              <button
                type="button"
                onClick={toggle}
                disabled={saving}
                className={`inline-flex items-center gap-[0.4em] rounded-[0.5em] px-[1.1em] py-[0.45em] text-[0.85em] font-semibold disabled:opacity-50 ${
                  m.isActive ? "border border-[#e3b4b4] text-[#b83232] hover:bg-[#fdecec]" : "bg-[#12676b] text-white hover:bg-[#0f5559]"
                }`}
              >
                {saving && <LoaderCircle className="size-[1em] animate-spin" />}
                {m.isActive ? t("Deactivate") : t("Activate")}
              </button>
            </div>
            {error && <p role="alert" className="mt-[0.5em] text-[0.8em] text-[#b83232]">{error}</p>}
          </section>
        )}
      </div>
    </AdminPage>
  );
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-[0.7em] bg-[#f4f7fb] px-[0.8em] py-[0.6em]">
      <dt className="text-[0.8em] text-[#8a97a6]">{label}</dt>
      <dd className="font-bold text-[#14365a]">{value}</dd>
    </div>
  );
}
