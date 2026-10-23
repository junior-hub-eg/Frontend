"use client";

import { useState } from "react";
import { Check, LoaderCircle, School, UsersRound, X } from "lucide-react";
import { APPROVALS_CHANGED, approveSignup, getApprovals, rejectSignup, type AdminApproval } from "@/lib/admin-api";
import { errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { dateLocale, tk } from "@/lib/i18n/translate";
import { AdminPage, PageHero } from "./AdminPage";
import { LoadState, useAdminData } from "./admin-data";

const SUBJECT_LABEL: Record<AdminApproval["subjects"][number], string> = {
  Math: tk("Mathematics"),
  Science: tk("Science"),
  Physics: tk("Physics"),
  Language: tk("Language"),
};

const card = "rounded-[1.1em] bg-white p-[1.2em] shadow-[0_6px_22px_rgba(20,54,90,0.07)]";

/** Monitors and teachers who signed up wait here until the admin approves or rejects them (23 Oct 2026). */
export default function AdminApprovals() {
  const t = useT();
  const approvals = useAdminData(getApprovals, tk("We couldn't load the sign-ups. Please try again."));
  const [done, setDone] = useState<string | null>(null);

  function remove(id: string, message: string) {
    approvals.setData((list) => list?.filter((a) => a.id !== id) ?? null);
    setDone(message);
    window.dispatchEvent(new Event(APPROVALS_CHANGED)); // the sidebar count
  }

  return (
    <AdminPage>
      <PageHero title={t("Approvals")} contentClassName="pb-[3em]" pictureTop>
        <p className="mt-[0.6em] max-w-[40em] text-[0.9em] text-[#14365a]">
          {t("Monitors and teachers who signed up and confirmed their email. They can sign in once you approve them.")}
        </p>
      </PageHero>

      <div className="mx-auto mt-[1.5em] grid w-full gap-[1em] lg:w-[80%]">
        {done && (
          <p role="status" className="rounded-[0.8em] bg-[#d7efe6] px-[1em] py-[0.6em] text-[0.85em] font-semibold text-[#12676b]">
            {done}
          </p>
        )}
        {!approvals.data ? (
          <LoadState error={approvals.error} onRetry={approvals.reload} />
        ) : approvals.data.length === 0 ? (
          <p className={`${card} text-center text-[0.9em] text-[#5b6b7c]`}>{t("No one is waiting for approval.")}</p>
        ) : (
          approvals.data.map((a) => <ApprovalCard key={a.id} approval={a} onDone={remove} />)
        )}
      </div>
    </AdminPage>
  );
}

function ApprovalCard({ approval: a, onDone }: { approval: AdminApproval; onDone: (id: string, message: string) => void }) {
  const t = useT();
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const isMentor = a.role === "Mentor";

  async function act(kind: "approve" | "reject") {
    setBusy(kind);
    setError(null);
    try {
      if (kind === "approve") {
        await approveSignup(a.id);
        onDone(a.id, t("{name} is approved and can sign in now.", { name: a.fullName }));
      } else {
        await rejectSignup(a.id, reason.trim());
        onDone(a.id, t("{name} was rejected.", { name: a.fullName }));
      }
    } catch (e) {
      setError(errorMessage(e, tk("We couldn't save the change. Please try again.")));
    } finally {
      setBusy(null);
    }
  }

  return (
    <article className={card}>
      <header className="flex flex-wrap items-start gap-[0.8em]">
        <span className="grid size-[2.6em] shrink-0 place-items-center rounded-full bg-[#14365a] text-white">
          {isMentor ? <UsersRound className="size-[1.2em]" /> : <School className="size-[1.2em]" />}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-bold text-[#0b1b2b]">
            {a.fullName}{" "}
            <span className="ms-[0.3em] rounded-full bg-[#e6f4f1] px-[0.7em] py-[0.1em] text-[0.75em] font-semibold text-[#0f7378]">
              {isMentor ? t("Monitor / Mentor") : t("Teacher")}
            </span>
          </h2>
          <p dir="ltr" className="truncate text-[0.85em] text-[#5b6b7c] rtl:text-end">
            {a.email}
            {a.phone ? ` · ${a.phone}` : ""}
          </p>
        </div>
        <span className="text-[0.8em] text-[#8a97a6]">
          {t("Signed up {date}", {
            date: new Date(a.createdUtc).toLocaleDateString(dateLocale("en-GB"), { day: "numeric", month: "short", year: "numeric" }),
          })}
        </span>
      </header>

      <dl className="mt-[0.9em] grid grid-cols-2 gap-[0.6em] text-[0.85em] sm:grid-cols-3">
        {isMentor ? (
          <>
            <Fact label={t("Track")} value={a.trackName ? t(a.trackName) : "—"} />
            <Fact label={t("Job title")} value={a.title ?? "—"} />
            <Fact label={t("Experience")} value={t("{count} years", { count: a.yearsOfExperience ?? 0 })} />
          </>
        ) : (
          <>
            <Fact label={t("School")} value={a.schoolName ?? "—"} />
            <Fact label={t("Subjects")} value={a.subjects.map((s) => t(SUBJECT_LABEL[s])).join(" · ") || "—"} />
            <Fact label={t("Grades")} value={a.grades.join(", ") || "—"} />
          </>
        )}
      </dl>

      {rejecting && (
        <label className="mt-[0.9em] grid gap-[0.3em] text-[0.85em]">
          <span className="font-semibold text-[#14365a]">{t("Reason (optional, sent by email)")}</span>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={500}
            rows={2}
            className="rounded-[0.5em] border border-[#d5dee8] px-[0.8em] py-[0.5em] outline-none focus:border-[#1d6fe0]"
          />
        </label>
      )}
      {error && <p role="alert" className="mt-[0.5em] text-[0.8em] text-[#b83232]">{error}</p>}

      <div className="mt-[0.9em] flex flex-wrap justify-end gap-[0.6em] text-[0.85em]">
        {rejecting ? (
          <>
            <button type="button" onClick={() => setRejecting(false)} className="px-[0.8em] py-[0.45em] text-[#5b6b7c] hover:underline">
              {t("Cancel")}
            </button>
            <button
              type="button"
              onClick={() => act("reject")}
              disabled={!!busy}
              className="inline-flex items-center gap-[0.4em] rounded-[0.5em] bg-[#b83232] px-[1em] py-[0.45em] font-semibold text-white disabled:opacity-50"
            >
              {busy === "reject" ? <LoaderCircle className="size-[1em] animate-spin" /> : <X className="size-[1em]" />} {t("Reject")}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setRejecting(true)}
              disabled={!!busy}
              className="rounded-[0.5em] border border-[#e3b4b4] px-[1em] py-[0.45em] font-semibold text-[#b83232] hover:bg-[#fdecec] disabled:opacity-50"
            >
              {t("Reject")}
            </button>
            <button
              type="button"
              onClick={() => act("approve")}
              disabled={!!busy}
              className="inline-flex items-center gap-[0.4em] rounded-[0.5em] bg-[#12676b] px-[1.1em] py-[0.45em] font-semibold text-white hover:bg-[#0f5559] disabled:opacity-50"
            >
              {busy === "approve" ? <LoaderCircle className="size-[1em] animate-spin" /> : <Check className="size-[1em]" />} {t("Approve")}
            </button>
          </>
        )}
      </div>
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[0.7em] bg-[#f4f7fb] px-[0.8em] py-[0.5em]">
      <dt className="text-[0.8em] text-[#8a97a6]">{label}</dt>
      <dd className="font-semibold text-[#14365a]">{value}</dd>
    </div>
  );
}
