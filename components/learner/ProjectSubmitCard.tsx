"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Hourglass, LoaderCircle, MessageSquareWarning, Send, Undo2 } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { getProjectStatus, submitWork, withdrawSubmission, type ProjectStatus } from "@/lib/interns-api";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";

/**
 * Decision of 21 Oct 2026: each member submits their work (a link shared, every own task Done); when everyone did,
 * the monitor reviews the project and approves it or asks for changes, shown here.
 */
export function ProjectSubmitCard({ className = "" }: { className?: string }) {
  const t = useT();
  const [status, setStatus] = useState<ProjectStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getProjectStatus().then(
      (s) => active && setStatus(s),
      () => {},
    );
    return () => {
      active = false;
    };
  }, []);

  async function run(action: () => Promise<ProjectStatus>, fallback: string) {
    setBusy(true);
    setError(null);
    try {
      setStatus(await action());
    } catch (e) {
      setError(errorMessage(e, fallback));
    } finally {
      setBusy(false);
    }
  }

  if (!status) return null;
  const latest = status.reviews[0];
  const changes = status.status === "InProgress" && latest?.decision === "ChangesRequested";

  return (
    <section className={`rounded-[1.4em] border border-white/80 bg-white/85 p-[1.1em] text-[#14365a] shadow-lg shadow-[#14365a]/10 ${className}`}>
      <div className="flex flex-wrap items-center gap-[0.8em]">
        <div className="min-w-0 flex-1">
          <h2 className="text-[1.25em] font-extrabold">{t("Submit your work")}</h2>
          <p className="text-[0.85em] text-[#14365a]/70">
            {status.status === "InReview"
              ? t("Everyone submitted. Your monitor is reviewing the project.")
              : status.status === "Completed"
                ? t("Your monitor approved the project.")
                : t("{n} of {total} teammates submitted. Share your links and move your tasks to Done, then submit.", { n: status.submitted, total: status.members })}
          </p>
        </div>

        {status.status === "InProgress" &&
          (status.mySubmittedUtc ? (
            <div className="flex items-center gap-[0.6em]">
              <span className="flex items-center gap-[0.3em] rounded-full bg-[#d8f0df] px-[0.8em] py-[0.3em] text-[0.8em] font-bold text-[#1f7a43]">
                <CheckCircle2 className="h-[1.1em] w-[1.1em]" /> {t("Submitted")}
              </span>
              <button
                type="button"
                disabled={busy}
                onClick={() => run(withdrawSubmission, tk("We couldn't take your submission back."))}
                className="flex items-center gap-[0.3em] text-[0.8em] font-semibold text-[#14365a]/70 hover:underline disabled:opacity-60"
              >
                <Undo2 className="h-[1em] w-[1em]" /> {t("Take back")}
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() => run(submitWork, tk("We couldn't submit your work. Please try again."))}
              className="flex items-center gap-[0.4em] rounded-[0.8em] bg-[#14365a] px-[1.2em] py-[0.6em] text-[0.9em] font-semibold text-white hover:bg-[#0f2a47] disabled:opacity-60"
            >
              {busy ? <LoaderCircle className="h-[1em] w-[1em] animate-spin" /> : <Send className="h-[1em] w-[1em]" />} {t("I submitted my work")}
            </button>
          ))}
        {status.status === "InReview" && (
          <span className="flex items-center gap-[0.3em] rounded-full bg-[#fff1d6] px-[0.8em] py-[0.3em] text-[0.8em] font-bold text-[#a86a00]">
            <Hourglass className="h-[1em] w-[1em]" /> {t("In review")}
          </span>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-[0.7em] rounded-[0.7em] bg-[#fdecec] px-[0.8em] py-[0.5em] text-[0.8em] font-semibold text-[#b83232]">
          {error}
        </p>
      )}
      {changes && (
        <div className="mt-[0.8em] rounded-[0.9em] bg-[#fff6e8] p-[0.8em] text-[0.85em]">
          <p className="flex items-center gap-[0.4em] font-bold text-[#a86a00]">
            <MessageSquareWarning className="h-[1.1em] w-[1.1em]" /> {t("{name} asked for changes", { name: latest.monitorName })}
          </p>
          <p className="mt-[0.3em] leading-relaxed">{latest.feedback}</p>
          <p className="mt-[0.3em] text-[0.9em] text-[#14365a]/65">{t("Fix it together, then everyone submits again.")}</p>
        </div>
      )}
    </section>
  );
}
