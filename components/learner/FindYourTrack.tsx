"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CirclePlay, LoaderCircle, RotateCcw } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { abandonInterview, startInterview, type DiscoveryPath, type InterviewState, type TrackSummary } from "@/lib/learning-api";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";

const CHOICES: { path: DiscoveryPath; emoji: string; title: string; text: string; bg: string }[] = [
  {
    path: "KnowsTrack",
    emoji: "🎯",
    title: tk("I know my track"),
    text: tk("Pick your track and answer 6 quick technical questions. We'll find your level and start you there."),
    bg: "from-[#e3f6ee] to-[#f4fbf8]",
  },
  {
    path: "Exploring",
    emoji: "🧭",
    title: tk("I have no idea"),
    text: tk("Talk with Alice, our AI assistant. She asks about what you enjoy and suggests your top 3 tracks."),
    bg: "from-[#dcebfb] to-[#f1f7fe]",
  },
];

/** After sign-in, while the student has no track: I know my track (placement test) or I have no idea (AI interview). */
export default function FindYourTrack({
  tracks,
  inProgress,
}: {
  tracks: TrackSummary[];
  inProgress: InterviewState | null;
}) {
  const t = useT();
  const router = useRouter();
  const [picking, setPicking] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [restarting, setRestarting] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  /** Closes the interview in progress and opens a new one with the same path. */
  async function startAgain(interview: InterviewState) {
    const path = interview.path;
    setRestarting(true);
    setError(null);
    try {
      if (path === "KnowsTrack") {
        // The track is chosen again first: close the open interview and show the list.
        await abandonInterview(interview.interviewId);
        setDismissed(true);
        setPicking(true);
        setRestarting(false);
        return;
      }
      await startInterview(path, true);
      router.push(`/learner/ai-interview?path=${path}&fresh=1`);
    } catch (e) {
      setError(errorMessage(e, "We couldn't start a new interview. Please try again."));
      setRestarting(false);
    }
  }

  /** "I know what I want": an interview about the chosen track finds the student's level in it. */
  function choose(code: string) {
    setSaving(code);
    router.push(`/learner/placement/${code.toLowerCase()}`);
  }

  return (
    <div className="flex flex-1 flex-col bg-[#fbfdff] p-6 md:p-10">
      <h1 className="text-[2em] font-extrabold leading-tight text-[#14365a]">{t("Find your track")}</h1>
      <p className="mt-1 text-sm text-[#14365a]/75">
        {picking ? t("Choose the track you want to learn. 6 quick technical questions then find your level in it.") : t("How do you want to start? Pick the way that feels right.")}
      </p>

      {inProgress && !picking && !dismissed && (
        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-[#12939b]/30 bg-[#e9f7f4] p-4 text-sm text-[#14365a]">
          <CirclePlay className="size-6 shrink-0 text-[#12939b]" />
          <span className="min-w-0 flex-1">
            <span className="block font-bold">{t("Continue your interview")}</span>
            {t("You answered {n} of {total} questions.", { n: inProgress.answeredCount, total: inProgress.maxQuestions })}
          </span>
          <button
            type="button"
            disabled={restarting}
            onClick={() => startAgain(inProgress)}
            className="flex items-center gap-1.5 rounded-full border border-[#12939b] px-4 py-2 text-xs font-bold text-[#12939b] hover:bg-white disabled:opacity-60"
          >
            {restarting ? <LoaderCircle className="size-4 animate-spin" /> : <RotateCcw className="size-4" />} {t("Start again")}
          </button>
          <button
            type="button"
            disabled={restarting}
            onClick={() => router.push(`/learner/ai-interview?path=${inProgress.path}`)}
            className="flex items-center gap-1.5 rounded-full bg-[#12939b] px-4 py-2 text-xs font-bold text-white hover:bg-[#0f7a81] disabled:opacity-60"
          >
            {t("Continue")} <ArrowRight className="size-4" />
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-[#fdecec] px-4 py-2 text-sm font-semibold text-[#b83232]">
          {error}
        </p>
      )}

      {!picking ? (
        <ul className="mt-6 grid gap-5 md:grid-cols-2">
          {CHOICES.map((c) => (
            <li key={c.path}>
              <button
                type="button"
                onClick={() => (c.path === "KnowsTrack" ? setPicking(true) : router.push(`/learner/ai-interview?path=${c.path}`))}
                className={`group flex h-full w-full flex-col rounded-[28px] border border-white bg-gradient-to-br p-7 text-start shadow-[0_10px_30px_rgba(20,54,90,0.08)] transition-shadow hover:shadow-[0_14px_36px_rgba(20,54,90,0.16)] ${c.bg}`}
              >
                <span className="text-5xl" aria-hidden>
                  {c.emoji}
                </span>
                <span className="mt-6 text-xl font-extrabold text-[#14365a]">{t(c.title)}</span>
                <span className="mt-2 text-sm leading-relaxed text-[#14365a]/75">{t(c.text)}</span>
                <span className="mt-auto flex justify-end pt-6">
                  <span className="grid size-12 place-items-center rounded-full bg-[#14365a] text-white transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                    <ArrowRight className="size-5" />
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setPicking(false)}
            className="mt-4 flex w-fit items-center gap-1 text-sm font-semibold text-[#12939b] hover:underline"
          >
            <ArrowLeft className="size-4" /> {t("Back")}
          </button>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {tracks.map((tr) => (
              <li key={tr.code}>
                <button
                  type="button"
                  disabled={saving !== null}
                  onClick={() => choose(tr.code)}
                  className="flex h-full w-full flex-col rounded-2xl border border-[#e3ecea] bg-white p-5 text-start shadow-sm transition-colors hover:border-[#12939b] disabled:opacity-60"
                >
                  <span className="text-base font-bold text-[#14365a]">{t(tr.name)}</span>
                  <span className="mt-1 text-xs leading-relaxed text-[#14365a]/70">{t(tr.shortDescription)}</span>
                  <span className="mt-auto flex items-center justify-between pt-4 text-[11px] text-[#14365a]/60">
                    {t("{n} videos", { n: tr.videoCount })}{tr.hasLessons ? t(" · lessons") : ""}
                    {saving === tr.code ? (
                      <LoaderCircle className="size-4 animate-spin text-[#12939b]" />
                    ) : (
                      <ArrowRight className="size-4 text-[#12939b]" />
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
