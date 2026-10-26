"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, Search, UserPlus } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { useI18n } from "@/lib/i18n/client";
import { addSquadStudent, getSquadCandidates, type SquadCandidates, type SquadSeatRole } from "@/lib/monitor-api";
import { Dialog, MentorAvatar, PrimaryButton, SecondaryButton, inputCls } from "../mentor-area-ui";

const ALL_ROLES: SquadSeatRole[] = ["Frontend", "Backend", "UIUX", "AI", "Testing", "Data", "Mobile", "Gaming"];

/** The seat of a track's students, as the backend sets it: a Frontend student joins only as Frontend. */
const roleForTrack = (code: string | null): SquadSeatRole | null =>
  code ? (ALL_ROLES.find((r) => r.toUpperCase() === code.toUpperCase() && r !== "Gaming") ?? "Gaming") : null;

/**
 * "Add students" (26 Oct 2026): the students of the squad's school who are in no squad, and the seats still open.
 * Each student is added in a role that has an open seat, so the squad never goes over the number it needs. The
 * squad page reloads when the dialog closes (onAdded), so several students can be added in a row.
 */
export function AddSquadStudents({ squadId, onClose, onAdded }: { squadId: string; onClose: () => void; onAdded: () => void }) {
  const { t } = useI18n();
  const [data, setData] = useState<SquadCandidates | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [roles, setRoles] = useState<Record<string, SquadSeatRole>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(0);

  useEffect(() => {
    let active = true;
    getSquadCandidates(squadId).then(
      (d) => active && setData(d),
      (e) => active && setLoadError(errorMessage(e, t("We could not load the students."))),
    );
    return () => {
      active = false;
    };
  }, [squadId, t]);

  // Roles with an open seat; without a seat plan every role is open.
  const open = data?.seats.length ? data.seats.filter((s) => s.filled < s.needed).map((s) => s.role) : ALL_ROLES;
  const seatsLeft = data?.seats.length ? data.seats.reduce((n, s) => n + Math.max(0, s.needed - s.filled), 0) : null;
  const full = seatsLeft === 0;
  const q = query.trim().toLowerCase();
  // Only students whose track's role has an open seat (a student with no track yet may take any open seat).
  const fitting = (data?.students ?? []).filter((s) => {
    const r = roleForTrack(s.trackCode);
    return r === null ? open.length > 0 : open.includes(r);
  });
  const students = fitting.filter(
    (s) => !q || s.fullName.toLowerCase().includes(q) || (s.trackName ?? "").toLowerCase().includes(q),
  );

  async function add(studentId: string) {
    const student = data?.students.find((s) => s.id === studentId);
    const role = roleForTrack(student?.trackCode ?? null) ?? roles[studentId] ?? open[0];
    if (!role) return;
    setBusy(studentId);
    setError(null);
    try {
      await addSquadStudent(squadId, studentId, role);
      setAdded((n) => n + 1);
      setData((d) =>
        d && {
          seats: d.seats.map((s) => (s.role === role ? { ...s, filled: s.filled + 1 } : s)),
          students: d.students.filter((s) => s.id !== studentId),
        },
      );
    } catch (e) {
      setError(errorMessage(e, t("We could not add the student.")));
    } finally {
      setBusy(null);
    }
  }

  // The squad page reloads once the dialog closes, so the dialog stays open while adding several students.
  const close = () => {
    if (added) onAdded();
    onClose();
  };

  return (
    <Dialog
      title={t("Add students to the squad")}
      onClose={close}
      footer={<SecondaryButton onClick={close}>{added ? t("Done") : t("Close")}</SecondaryButton>}
    >
      {!data ? (
        loadError ? (
          <p role="alert" className="text-[0.85em] text-[#c81e1e]">{loadError}</p>
        ) : (
          <LoaderCircle className="mx-auto size-[1.6em] animate-spin text-[#0f7378]" />
        )
      ) : (
        <>
          {data.seats.length === 0 && (
            <p className="rounded-[0.8em] bg-[#f4f7fa] px-[0.9em] py-[0.6em] text-[0.8em] text-[#475467]">
              {t("This squad has no seat plan, so students can join in any role.")}
            </p>
          )}
          {added > 0 && (
            <p role="status" className="rounded-[0.8em] bg-[#e3f6ea] px-[0.9em] py-[0.5em] text-[0.8em] text-[#167a3e]">
              {t("{count} students added.", { count: added })}
            </p>
          )}
          {data.seats.length > 0 && (
            <div>
              <p className="mb-[0.4em] text-[0.8em] font-medium text-[#1b2d54]">
                {full ? t("The squad is full.") : t("{count} seats left", { count: seatsLeft ?? 0 })}
              </p>
              <div className="flex flex-wrap gap-[0.4em]">
                {data.seats.map((s) => (
                  <span
                    key={s.role}
                    className={`rounded-full px-[0.8em] py-[0.2em] text-[0.75em] font-semibold ${
                      s.filled < s.needed ? "bg-[#e3f6ea] text-[#167a3e]" : "bg-[#eef2f6] text-[#64748b]"
                    }`}
                  >
                    {t(s.role)} {s.filled}/{s.needed}
                  </span>
                ))}
              </div>
            </div>
          )}

          <label className="relative block">
            <span className="sr-only">{t("Search students")}</span>
            <Search className="pointer-events-none absolute start-[0.8em] top-1/2 size-[1em] -translate-y-1/2 text-[#98a2b3]" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("Search students")} className={`${inputCls} ps-[2.4em]`} />
          </label>

          {error && <p role="alert" className="rounded-[0.8em] bg-[#fdecec] px-[0.9em] py-[0.5em] text-[0.82em] text-[#c81e1e]">{error}</p>}

          {students.length === 0 ? (
            <p className="py-[1em] text-center text-[0.85em] text-[#64748b]">
              {data.students.length === 0
                ? t("Every student is already in a squad.")
                : fitting.length === 0
                  ? t("No student without a squad learns a track that has an open seat here.")
                  : t("No students match.")}
            </p>
          ) : (
            <ul className="max-h-[22em] divide-y divide-[#eef2f6] overflow-y-auto">
              {students.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center gap-[0.6em] py-[0.6em] text-[0.85em]">
                  <MentorAvatar name={s.fullName} photoUrl={s.photoUrl} className="size-[2.2em]" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-[#1b2d54]">{s.fullName}</span>
                    <span className="block text-[0.85em] text-[#64748b]">
                      {s.trackName ? t(s.trackName) : t("No track yet")}
                      {s.grade ? ` · ${t("Grade {grade}", { grade: s.grade })}` : ""}
                    </span>
                  </span>
{roleForTrack(s.trackCode) ? (
                    <span
                      title={t("The role follows the student's track.")}
                      className="rounded-[0.6em] bg-[#eef2f6] px-[0.6em] py-[0.35em] text-[0.9em] font-semibold text-[#1b2d54]"
                    >
                      {t(roleForTrack(s.trackCode)!)}
                    </span>
                  ) : (
                    <select
                      aria-label={t("Role")}
                      value={roles[s.id] ?? open[0] ?? ""}
                      onChange={(e) => setRoles((r) => ({ ...r, [s.id]: e.target.value as SquadSeatRole }))}
                      disabled={full}
                      className="rounded-[0.6em] border border-[#d6dde6] bg-white px-[0.6em] py-[0.35em] text-[0.9em]"
                    >
                      {open.map((r) => (
                        <option key={r} value={r}>
                          {t(r)}
                        </option>
                      ))}
                    </select>
                  )}
                  <PrimaryButton type="button" onClick={() => add(s.id)} disabled={full || busy !== null} className="!px-[0.9em] !py-[0.4em]">
                    {busy === s.id ? <LoaderCircle className="size-[1em] animate-spin" /> : <UserPlus className="size-[1em]" />} {t("Add")}
                  </PrimaryButton>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Dialog>
  );
}
