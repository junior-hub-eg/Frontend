"use client";

import { useEffect, useRef, useState } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, LoaderCircle, Mic, Send, Square, Volume2 } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import {
  answerTyped,
  answerVoice,
  finishInterview,
  selectTrack,
  startInterview,
  type DiscoveryPath,
  type DiscoveryQuestion,
  trackPath,
  type DiscoveryResult,
} from "@/lib/learning-api";

const PATH_TITLE: Record<DiscoveryPath, string> = {
  KnowsTrack: "Check your level",
  Exploring: "Explore the world of tech",
  Unsure: "Find the tracks that fit you",
};

type Interview = { id: string; maxQuestions: number; answered: number; canFinish: boolean; question: DiscoveryQuestion | null };

function playAudio(q: DiscoveryQuestion | null) {
  if (!q?.audioBase64) return;
  const audio = new Audio(`data:${q.audioMimeType ?? "audio/mpeg"};base64,${q.audioBase64}`);
  // Browsers may block autoplay until the student interacts; the Listen button plays it again.
  void audio.play().catch(() => {});
}

/** Track Discovery (US-07 to US-14): the AI interview, then the top 3 tracks with a level each. */
export default function DiscoveryInterview({ path }: { path: DiscoveryPath }) {
  const router = useRouter();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [result, setResult] = useState<DiscoveryResult | null>(null);
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState<"start" | "send" | "finish" | "choose" | null>("start");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    let active = true;
    startInterview(path)
      .then((s) => {
        if (!active) return;
        setInterview({ id: s.interviewId, maxQuestions: s.maxQuestions, answered: s.answeredCount, canFinish: s.canFinishNow, question: s.question });
        playAudio(s.question);
      })
      .catch((e) => active && setError(errorMessage(e, "We couldn't start the interview. Please try again.")))
      .finally(() => active && setBusy(null));
    return () => {
      active = false;
    };
  }, [path]);

  async function finish(id: string) {
    setBusy("finish");
    try {
      setResult(await finishInterview(id));
    } catch (e) {
      setError(errorMessage(e, "We couldn't get your results. Please try again."));
    } finally {
      setBusy(null);
    }
  }

  async function send(input: { text: string } | { audio: Blob }) {
    if (!interview?.question) return;
    setBusy("send");
    setError(null);
    setNotice(null);
    try {
      const r =
        "text" in input
          ? await answerTyped(interview.id, interview.question.orderIndex, input.text)
          : await answerVoice(interview.id, interview.question.orderIndex, input.audio);
      if (r.retryAsText) {
        setNotice("We couldn't hear that clearly. Please type your answer.");
        return;
      }
      setAnswer("");
      const next = { ...interview, answered: interview.answered + 1, canFinish: r.canFinishNow, question: r.nextQuestion };
      setInterview(next);
      if (r.finished || !r.nextQuestion) await finish(interview.id);
      else playAudio(r.nextQuestion);
    } catch (e) {
      setError(errorMessage(e, "We couldn't send your answer. Please try again."));
    } finally {
      setBusy((b) => (b === "send" ? null : b));
    }
  }

  async function toggleRecording() {
    if (recording) {
      recorder.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => chunks.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
        void send({ audio: new Blob(chunks, { type: rec.mimeType || "audio/webm" }) });
      };
      recorder.current = rec;
      rec.start();
      setRecording(true);
    } catch {
      setNotice("We couldn't use your microphone. You can type your answer instead.");
    }
  }

  async function startTrack(code: string) {
    setBusy("choose");
    try {
      await selectTrack(code);
      router.push(trackPath(code) as Route);
    } catch (e) {
      setError(errorMessage(e, "We couldn't save your track. Please try again."));
      setBusy(null);
    }
  }

  const progress = interview ? Math.round((interview.answered / interview.maxQuestions) * 100) : 0;

  return (
    <div className="flex flex-1 flex-col bg-[#fbfdff] p-6 md:p-10">
      <button
        type="button"
        onClick={() => router.push("/learner/courses")}
        className="flex w-fit items-center gap-1 text-sm font-semibold text-[#12939b] hover:underline"
      >
        <ArrowLeft className="size-4" /> Courses
      </button>
      <h1 className="mt-3 text-[2em] font-extrabold leading-tight text-[#14365a]">{result ? "Your top 3 tracks" : PATH_TITLE[path]}</h1>

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-[#fdecec] px-4 py-2 text-sm font-semibold text-[#b83232]">
          {error}
        </p>
      )}

      {busy === "start" && <LoaderCircle className="mx-auto mt-16 size-8 animate-spin text-[#12939b]" aria-label="Starting" />}

      {result ? (
        <>
          {result.summary && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#14365a]/80">{result.summary}</p>}
          <ul className="mt-6 grid gap-5 lg:grid-cols-3">
            {result.recommendations.map((r) => (
              <li key={r.trackCode} className="flex flex-col rounded-[24px] border border-[#e3ecea] bg-white p-6 shadow-[0_10px_30px_rgba(20,54,90,0.08)]">
                <div className="flex items-center justify-between">
                  <span className="grid size-9 place-items-center rounded-full bg-[#14365a] text-sm font-bold text-white">{r.rank}</span>
                  <span className="rounded-full bg-[#e9f7f4] px-3 py-1 text-xs font-bold text-[#12939b]">{r.matchPercent}% match</span>
                </div>
                <h2 className="mt-4 text-xl font-extrabold text-[#14365a]">{r.trackName}</h2>
                <p className="mt-1 text-xs font-semibold text-[#7c3aed]">{r.level}</p>
                <p className="mt-3 text-sm leading-relaxed text-[#14365a]/75">{r.reason}</p>
                {r.levelReason && <p className="mt-2 text-xs text-[#14365a]/60">{r.levelReason}</p>}
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => startTrack(r.trackCode)}
                  className="mt-auto flex items-center justify-center gap-2 rounded-full bg-[#12939b] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0f7a81] disabled:opacity-60"
                  style={{ marginTop: "1.5rem" }}
                >
                  Start this track <ArrowRight className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        interview && (
          <section className="mt-6 max-w-3xl">
            <div className="flex items-center justify-between text-xs font-semibold text-[#14365a]/70">
              <span>
                Question {Math.min(interview.answered + 1, interview.maxQuestions)} of {interview.maxQuestions}
              </span>
              {interview.canFinish && (
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => finish(interview.id)}
                  className="font-bold text-[#12939b] hover:underline disabled:opacity-60"
                >
                  Finish and see my tracks
                </button>
              )}
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#dde6ee]">
              <div className="h-full rounded-full bg-[#12939b] transition-[width]" style={{ width: `${progress}%` }} />
            </div>

            {interview.question && (
              <div className="mt-6 rounded-[24px] bg-gradient-to-br from-[#e3f6ee] to-[#dcebfb] p-6">
                <p className="text-lg font-bold leading-relaxed text-[#14365a]">{interview.question.text}</p>
                {interview.question.audioBase64 && (
                  <button
                    type="button"
                    onClick={() => playAudio(interview.question)}
                    className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-[#12939b] hover:underline"
                  >
                    <Volume2 className="size-4" /> Listen again
                  </button>
                )}
              </div>
            )}

            {notice && <p className="mt-4 text-sm font-semibold text-[#c2571a]">{notice}</p>}

            <form
              className="mt-5 flex flex-col gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (answer.trim()) void send({ text: answer.trim() });
              }}
            >
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={4}
                maxLength={1000}
                placeholder="Type your answer, or record it with the microphone…"
                aria-label="Your answer"
                className="w-full resize-none rounded-2xl border border-[#e1e8f0] bg-white p-4 text-sm text-[#14365a] outline-none focus:ring-2 focus:ring-[#12939b]/30"
              />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleRecording}
                  disabled={busy !== null}
                  aria-pressed={recording}
                  className={`flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-60 ${
                    recording ? "bg-[#b83232] text-white" : "bg-[#eef2f7] text-[#14365a] hover:bg-[#e2e8f0]"
                  }`}
                >
                  {recording ? <Square className="size-4" /> : <Mic className="size-4" />}
                  {recording ? "Stop and send" : "Record answer"}
                </button>
                <button
                  type="submit"
                  disabled={busy !== null || !answer.trim()}
                  className="ml-auto flex items-center gap-2 rounded-full bg-[#14365a] px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {busy === "send" || busy === "finish" ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
                  {busy === "finish" ? "Getting your tracks…" : "Send"}
                </button>
              </div>
            </form>
          </section>
        )
      )}
    </div>
  );
}
