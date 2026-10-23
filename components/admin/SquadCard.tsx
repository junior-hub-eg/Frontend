"use client";

import { useState } from "react";
import { LoaderCircle, Pencil } from "lucide-react";
import { setSquadMonitor, type AdminMentor, type AdminSquad, type AdminSquadStatus } from "@/lib/admin-api";
import { errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { MentorPicture } from "./MentorsTable";

const STATUS_STYLE: Record<AdminSquadStatus, string> = {
  Active: "bg-[#c9f1dd] text-[#1a7f55]",
  Waiting: "bg-[#ffb21f] text-white",
  InReview: "bg-[#7c5cff] text-white",
  Completed: "bg-[#2f9cf4] text-white",
};

const STATUS_LABEL: Record<AdminSquadStatus, string> = {
  Active: tk("Active"),
  Waiting: tk("Waiting for members"),
  InReview: tk("In review"),
  Completed: tk("Completed"),
};

/** A squad with its monitor; the admin can pick another monitor (active mentors only). */
export function SquadCard({ squad, mentors, onChanged }: { squad: AdminSquad; mentors: AdminMentor[] | null; onChanged: (squad: AdminSquad) => void }) {
  const t = useT();
  const [editing, setEditing] = useState(false);
  const [choice, setChoice] = useState(squad.monitor?.id ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      onChanged(await setSquadMonitor(squad.id, choice));
      setEditing(false);
    } catch (e) {
      setError(errorMessage(e, tk("We couldn't change the monitor. Please try again.")));
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="min-w-0 rounded-[1.1em] bg-white p-[1.2em] shadow-[0_6px_22px_rgba(20,54,90,0.1)]">
      <header className="flex items-start justify-between gap-[0.6em]">
        <h3 className="truncate text-[1.2em] font-bold text-[#0b1b2b]">{squad.name}</h3>
        <span className={`shrink-0 rounded-full px-[0.9em] py-[0.2em] text-[0.75em] font-semibold ${STATUS_STYLE[squad.status]}`}>
          {t(STATUS_LABEL[squad.status])}
        </span>
      </header>

      <p className="mt-[0.2em] truncate text-[0.8em] text-[#8a97a6]" title={squad.projectTitle}>
        {squad.projectTitle} · {t(squad.level)}
      </p>

      {editing ? (
        <div className="mt-[0.9em] flex flex-wrap items-center gap-[0.5em] text-[0.8em]">
          <select
            value={choice}
            onChange={(e) => setChoice(e.target.value)}
            disabled={!mentors || saving}
            aria-label={t("Monitor")}
            className="min-w-0 flex-1 rounded-[0.5em] border border-[#d5dee8] bg-white px-[0.6em] py-[0.35em]"
          >
            <option value="" disabled>
              {t("Choose a mentor")}
            </option>
            {mentors?.map((m) => (
              <option key={m.id} value={m.id}>
                {m.fullName} · {m.trackName}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={save}
            disabled={saving || !choice || choice === squad.monitor?.id}
            className="inline-flex items-center gap-[0.3em] rounded-[0.5em] bg-[#1d6fe0] px-[0.9em] py-[0.35em] font-semibold text-white disabled:opacity-50"
          >
            {saving && <LoaderCircle className="size-[1em] animate-spin" />} {t("Save")}
          </button>
          <button type="button" onClick={() => setEditing(false)} className="px-[0.4em] py-[0.35em] text-[#5b6b7c] hover:underline">
            {t("Cancel")}
          </button>
        </div>
      ) : (
        <p className="mt-[0.9em] flex items-center gap-[0.6em] text-[1.05em] font-medium text-[#14365a]">
          {squad.monitor ? <MentorPicture mentor={squad.monitor} size="1.8em" /> : <span className="size-[1.8em] shrink-0 rounded-full bg-[#e6edf3]" />}
          <span className="truncate">
            {t("Monitor")}: {squad.monitor?.fullName ?? <span className="text-[#c0392b]">{t("None yet")}</span>}
          </span>
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label={t("Change monitor")}
            title={t("Change monitor")}
            className="ms-auto grid size-[1.8em] shrink-0 place-items-center rounded-full text-[#5b6b7c] hover:bg-[#eef4fa]"
          >
            <Pencil className="size-[0.8em]" />
          </button>
        </p>
      )}
      {error && <p role="alert" className="mt-[0.4em] text-[0.75em] text-[#b83232]">{error}</p>}

      <div className="mt-[0.8em] flex items-center justify-between text-[0.75em] text-[#8a97a6]">
        <span dir="ltr">{squad.progress}%</span>
        <span>{t("{students}/{capacity} Students", { students: squad.students, capacity: squad.capacity })}</span>
      </div>

      <div
        role="progressbar"
        aria-valuenow={squad.progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t("Sprint progress")}
        className="mt-[0.4em] h-[0.45em] overflow-hidden rounded-full bg-[#e6edf3]"
      >
        <div className="h-full rounded-full bg-gradient-to-r from-[#12a86b] to-[#7fddc9]" style={{ width: `${squad.progress}%` }} />
      </div>
    </article>
  );
}
