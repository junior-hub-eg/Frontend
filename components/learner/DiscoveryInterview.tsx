"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, LoaderCircle, Mic, Navigation, Phone, RotateCcw, Square, Volume2, VolumeX } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { useAuth } from "@/lib/auth/auth-context";
import { avatarOrDefault } from "@/lib/avatars";
import {
  abandonInterview,
  answerTyped,
  answerVoice,
  finishInterview,
  selectTrack,
  startInterview,
  type DiscoveryPath,
  type DiscoveryQuestion,
  type InterviewState,
  trackPath,
  type DiscoveryResult,
} from "@/lib/learning-api";

/** The interviewer (Figma "Karima AI assistant"). */
const KARIMA = { name: "Karima", photo: "/images/avatars/girl-orange.png", video: "/images/Ai%20intervew/Video_1.mp4" };

/** Figma colours: the ring and the send button are the same stack of gradients over rgba(104,174,255). */
const RING_FILL = [
  "linear-gradient(210deg, rgba(39,216,255,1) 0%, rgba(39,216,255,0) 55%)",
  "linear-gradient(90deg, rgba(167,114,255,1) 0%, rgba(167,114,255,0) 55%)",
  "linear-gradient(330deg, rgba(104,255,237,1) 0%, rgba(104,255,237,0) 45%)",
  "linear-gradient(180deg, rgba(255,47,134,0) 60%, rgba(255,47,134,0.35) 100%)",
  "rgba(104,174,255,1)",
].join(", ");
const CHAT_BORDER = "linear-gradient(180deg, #ffffff 0%, rgba(94,212,255,1) 50%, #ffffff 100%)";
const CHAT_FILL = "linear-gradient(180deg, rgba(199,240,255,0.55) 0%, rgba(64,182,254,0.4) 50%, rgba(199,240,255,0.55) 100%)";
const LEAVE_FILL =
  "radial-gradient(circle at 50% 20%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 55%), linear-gradient(180deg, rgba(255,34,174,1) 0%, rgba(229,0,92,1) 100%)";
const MIC_FILL = "rgba(41,45,50,0.47)";

const PATH_TITLE: Record<DiscoveryPath, string> = {
  KnowsTrack: "Find your level",
  Exploring: "Explore the world of tech",
  Unsure: "Find the tracks that fit you",
};

type Interview = {
  id: string;
  maxQuestions: number;
  answered: number;
  canFinish: boolean;
  question: DiscoveryQuestion | null;
  /** An interview in progress was continued rather than a new one started. */
  resumed: boolean;
};

/** One chat bubble: Karima's questions on the left, the student's answers on the right. */
type Message = { id: number; from: "karima" | "me"; text: string; time: Date; sending?: boolean };

const toInterview = (s: InterviewState): Interview => ({
  id: s.interviewId,
  maxQuestions: s.maxQuestions,
  answered: s.answeredCount,
  canFinish: s.canFinishNow,
  question: s.question,
  resumed: s.resumed,
});

/** "16.50", as in the Figma. */
const clock = (d: Date) => `${String(d.getHours()).padStart(2, "0")}.${String(d.getMinutes()).padStart(2, "0")}`;

let nextMessageId = 0;
const message = (from: Message["from"], text: string, sending = false): Message => ({
  id: nextMessageId++,
  from,
  text,
  time: new Date(),
  sending,
});

/** Track Discovery (US-07 to US-14): the AI interview with Karima, then the top 3 tracks with a level each. */
export default function DiscoveryInterview({
  path,
  fresh = false,
  trackCode,
}: {
  path: DiscoveryPath;
  fresh?: boolean;
  /** KnowsTrack: the track the student chose; the interview finds their level in it. */
  trackCode?: string;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const me = avatarOrDefault(user?.photoUrl);
  const [interview, setInterview] = useState<Interview | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [result, setResult] = useState<DiscoveryResult | null>(null);
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState<"start" | "send" | "finish" | "choose" | null>("start");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const mutedRef = useRef(false);
  const chatEnd = useRef<HTMLDivElement>(null);

  /** Karima reads the question aloud when the AI service sent audio. */
  function speak(q: DiscoveryQuestion | null) {
    audio.current?.pause();
    if (!q?.audioBase64 || mutedRef.current) return;
    const a = new Audio(`data:${q.audioMimeType ?? "audio/mpeg"};base64,${q.audioBase64}`);
    a.onplay = () => setSpeaking(true);
    a.onended = a.onpause = () => setSpeaking(false);
    audio.current = a;
    // Browsers may block autoplay until the student interacts; the sound button plays it again.
    void a.play().catch(() => setSpeaking(false));
  }

  /** Shows a new interview (or the one continued) with its current question. */
  function begin(s: InterviewState, resumed: boolean) {
    setInterview({ ...toInterview(s), resumed });
    setMessages(s.question ? [message("karima", s.question.text)] : []);
    speak(s.question);
  }

  useEffect(() => {
    let active = true;
    startInterview(path, false, trackCode)
      .then((s) => {
        // Just started again from Find your track: the new interview is not "continued".
        if (active) begin(s, s.resumed && !(fresh && s.answeredCount === 0));
      })
      .catch((e) => active && setError(errorMessage(e, "We couldn't start the interview. Please try again.")))
      .finally(() => active && setBusy(null));
    return () => {
      active = false;
      audio.current?.pause();
    };
    // begin and speak only set state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, fresh, trackCode]);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  /** Closes the interview in progress and starts a new one from the first question. */
  async function startAgain() {
    setBusy("start");
    setError(null);
    setNotice(null);
    setAnswer("");
    try {
      if (path === "KnowsTrack" && !trackCode && interview) {
        // Resumed without the chosen track: close it and choose the track again.
        await abandonInterview(interview.id);
        router.push("/learner/courses");
        return;
      }
      begin(await startInterview(path, true, trackCode), false);
    } catch (e) {
      setError(errorMessage(e, "We couldn't start a new interview. Please try again."));
    } finally {
      setBusy(null);
    }
  }

  async function finish(id: string) {
    setBusy("finish");
    try {
      audio.current?.pause();
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
    const mine = message("me", "text" in input ? input.text : "Voice answer…", true);
    setMessages((m) => [...m, mine]);
    if ("text" in input) setAnswer("");
    try {
      const r =
        "text" in input
          ? await answerTyped(interview.id, interview.question.orderIndex, input.text)
          : await answerVoice(interview.id, interview.question.orderIndex, input.audio);
      if (r.retryAsText) {
        setMessages((m) => m.filter((x) => x.id !== mine.id));
        setNotice("We couldn't hear that clearly. Please type your answer.");
        return;
      }
      // A voice answer shows what the AI heard.
      setMessages((m) => [
        ...m.map((x) => (x.id === mine.id ? { ...x, text: r.answered?.transcript || x.text, sending: false } : x)),
        ...(r.nextQuestion ? [message("karima", r.nextQuestion.text)] : []),
      ]);
      setInterview({ ...interview, answered: interview.answered + 1, canFinish: r.canFinishNow, question: r.nextQuestion });
      if (r.finished || !r.nextQuestion) await finish(interview.id);
      else speak(r.nextQuestion);
    } catch (e) {
      setMessages((m) => m.filter((x) => x.id !== mine.id));
      if ("text" in input) setAnswer(input.text);
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
      audio.current?.pause();
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

  /** Mutes Karima, or unmutes her and reads the current question again. */
  function toggleSound() {
    const next = !muted;
    mutedRef.current = next;
    setMuted(next);
    if (next) audio.current?.pause();
    else speak(interview?.question ?? null);
  }

  /** Leave keeps the interview: Find your track offers to continue it. */
  function leave() {
    audio.current?.pause();
    if (recording) recorder.current?.stop();
    router.push("/learner/courses");
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

  const locked = busy !== null || recording;
  const questionNumber = interview ? Math.min(interview.answered + 1, interview.maxQuestions) : 0;

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <Image src="/images/Intern/bg-park.png" alt="" fill priority sizes="100vw" className="object-cover object-center" />

      <div className="relative flex flex-1 items-center justify-center p-3 sm:p-6 lg:min-h-0 lg:p-[3%]">
        <div className="relative flex w-full max-w-[1300px] flex-col gap-6 rounded-[40px] border border-white/70 bg-white/20 p-5 shadow-[0_20px_60px_rgba(20,54,90,0.15)] backdrop-blur-[6px] sm:p-8 lg:h-full lg:max-h-[820px] lg:flex-row lg:items-stretch lg:gap-[4%] lg:px-[3.5%] lg:py-[clamp(16px,3.5vh,40px)]">
          {result ? (
            <section className="flex min-w-0 flex-1 flex-col rounded-[32px] bg-white/85 p-6 md:p-10">
              <h1 className="text-[2em] font-extrabold leading-tight text-[#14365a]">
                {path === "KnowsTrack" ? "Your level and 2 more tracks to explore" : "Your top 3 tracks"}
              </h1>
              {error && <ErrorBox text={error} />}
              {path === "KnowsTrack" && result.recommendations.length > 0 ? (
                <KnowsTrackResult result={result} busy={busy !== null} onStart={startTrack} />
              ) : (
                <TopTracks result={result} busy={busy !== null} onStart={startTrack} />
              )}
            </section>
          ) : (
            <>
              {/* Karima: the avatar, her voice and the call buttons */}
              <section className="flex shrink-0 flex-col items-center justify-center gap-[clamp(10px,2.4vh,24px)] lg:min-h-0 lg:w-[40%]">
                <button
                  type="button"
                  onClick={leave}
                  aria-label="Back to Find your track"
                  className="absolute left-5 top-5 z-10 grid size-11 place-items-center sm:left-8 sm:top-8 lg:left-[2.5%] lg:top-[clamp(16px,4vh,40px)] rounded-[10px] bg-[rgba(41,45,50,0.47)] text-white shadow-md backdrop-blur-sm hover:bg-[rgba(41,45,50,0.6)]"
                >
                  <ArrowLeft className="size-6" />
                </button>

                {/* Figma "Animation-Character": the 400 × 400 ring with Karima's video inside */}
                <div
                  className="mt-12 grid aspect-square w-[min(70vw,400px)] shrink-0 place-items-center rounded-full p-[12.5%] shadow-[inset_0_-2px_5px_rgba(0,0,0,0.12),0_12px_40px_rgba(56,130,246,0.3)] lg:mt-0 lg:w-[min(80%,400px,calc(100vh-490px))] lg:min-w-[180px]"
                  style={{ background: RING_FILL }}
                >
                  <div className="relative size-full overflow-hidden rounded-full bg-white">
                    <video
                      src={KARIMA.video}
                      poster={KARIMA.photo}
                      autoPlay
                      loop
                      muted
                      playsInline
                      aria-label={`${KARIMA.name}, your AI interviewer`}
                      className="size-full object-cover"
                    />
                  </div>
                </div>

                <Wave active={speaking || recording} />

                <p className="sr-only" aria-live="polite">
                  {recording ? "Recording your answer" : speaking ? `${KARIMA.name} is speaking` : ""}
                </p>

                <div className="flex shrink-0 items-start gap-6 sm:gap-8">
                  <CallButton
                    label={recording ? "Stop" : "Microphone"}
                    onClick={toggleRecording}
                    disabled={busy !== null || !interview?.question}
                    pressed={recording}
                    className={recording ? "bg-[#e11d74] text-white" : "text-white hover:brightness-110"}
                    style={recording ? undefined : { background: MIC_FILL }}
                  >
                    {recording ? <Square className="size-6 fill-current" /> : <Mic className="size-7" />}
                  </CallButton>
                  <CallButton
                    label="Leave"
                    onClick={leave}
                    className="border border-[rgba(228,59,127,1)] text-white shadow-[0_8px_24px_rgba(229,0,92,0.4)] hover:brightness-110"
                    style={{ background: LEAVE_FILL }}
                  >
                    <Phone className="size-7 rotate-[135deg] fill-current" />
                  </CallButton>
                  <CallButton
                    label={muted ? "Sound off" : "Sound"}
                    onClick={toggleSound}
                    pressed={!muted}
                    className="text-white hover:brightness-110"
                    style={{ background: MIC_FILL }}
                  >
                    {muted ? <VolumeX className="size-7" /> : <Volume2 className="size-7" />}
                  </CallButton>
                </div>
              </section>

              {/* The chat */}
              {/* Figma: a 7 px gradient border (white, rgba(94,212,255), white) around a light blue gradient */}
              <div
                className="flex h-[620px] min-w-0 flex-1 rounded-[40px] p-[7px] shadow-[0_2.5px_5px_rgba(94,212,255,0.6),0_9px_9px_rgba(94,212,255,0.35)] lg:h-auto lg:min-h-0"
                style={{ background: CHAT_BORDER }}
              >
              <section className="flex min-h-0 min-w-0 flex-1 flex-col rounded-[33px] p-4 backdrop-blur-md sm:p-6" style={{ background: CHAT_FILL }}>
                <header className="flex items-center gap-3 rounded-full border border-white/80 bg-white/30 px-4 py-2.5 shadow-sm">
                  <span className="relative size-11 shrink-0 overflow-hidden rounded-full bg-white">
                    <Image src={KARIMA.photo} alt="" fill sizes="44px" className="object-cover" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-bold text-[#14365a]">{KARIMA.name} AI assistant</span>
                    <span className="block truncate text-[11px] text-[#14365a]/70">{PATH_TITLE[path]}</span>
                  </span>
                  {interview && (
                    <span className="shrink-0 rounded-full bg-white/60 px-3 py-1 text-[11px] font-bold text-[#14365a]">
                      {questionNumber} / {interview.maxQuestions}
                    </span>
                  )}
                </header>

                {interview?.resumed && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl bg-white/50 px-4 py-2 text-xs text-[#14365a]">
                    <span className="flex-1">You&apos;re continuing the interview you started before.</span>
                    <button
                      type="button"
                      disabled={locked}
                      onClick={startAgain}
                      className="flex items-center gap-1 font-bold text-[#12797f] hover:underline disabled:opacity-60"
                    >
                      <RotateCcw className="size-3.5" /> Start again
                    </button>
                  </div>
                )}

                <div className="mt-3 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-1 py-2" aria-live="polite">
                  {busy === "start" && <LoaderCircle className="m-auto size-8 animate-spin text-[#12797f]" aria-label="Starting" />}
                  {messages.map((m) => (
                    <Bubble key={m.id} message={m} photo={m.from === "karima" ? KARIMA.photo : me.src} photoBg={m.from === "karima" ? "#fff" : me.bg} />
                  ))}
                  {busy === "send" && (
                    <p className="ml-14 flex items-center gap-1.5 text-xs font-semibold text-[#14365a]/70">
                      <LoaderCircle className="size-3.5 animate-spin" /> {KARIMA.name} is thinking…
                    </p>
                  )}
                  {busy === "finish" && (
                    <p className="ml-14 flex items-center gap-1.5 text-xs font-semibold text-[#14365a]/70">
                      <LoaderCircle className="size-3.5 animate-spin" /> Finding your tracks…
                    </p>
                  )}
                  <div ref={chatEnd} />
                </div>

                {error && <ErrorBox text={error} />}
                {notice && <p className="mt-2 text-xs font-semibold text-[#b4500f]">{notice}</p>}

                {interview?.canFinish && interview.question && (
                  <button
                    type="button"
                    disabled={locked}
                    onClick={() => finish(interview.id)}
                    className="mt-2 self-end text-xs font-bold text-[#12797f] hover:underline disabled:opacity-60"
                  >
                    Finish and see my tracks
                  </button>
                )}

                <form
                  className="mt-3 flex items-center gap-2 rounded-full border border-white/80 bg-white/30 py-2 pl-5 pr-2 shadow-sm focus-within:ring-2 focus-within:ring-[#12939b]/40"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (answer.trim()) void send({ text: answer.trim() });
                  }}
                >
                  <input
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    maxLength={1000}
                    dir="auto"
                    disabled={!interview?.question}
                    placeholder="Type Here...."
                    aria-label="Your answer"
                    className="min-w-0 flex-1 bg-transparent py-2 text-[15px] text-[#14365a] outline-none placeholder:text-[#14365a]/70"
                  />
                  <button
                    type="submit"
                    disabled={locked || !answer.trim()}
                    aria-label="Send"
                    className="grid size-[46px] shrink-0 place-items-center rounded-full text-[#1b2d54] shadow-[inset_0_-2px_4px_rgba(0,0,0,0.15)] transition-opacity disabled:opacity-50"
                    style={{ background: RING_FILL }}
                  >
                    {busy === "send" ? <LoaderCircle className="size-5 animate-spin" /> : <Navigation className="size-5 fill-current" />}
                  </button>
                </form>
              </section>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ErrorBox({ text }: { text: string }) {
  return (
    <p role="alert" className="mt-3 rounded-xl bg-[#fdecec]/95 px-4 py-2 text-sm font-semibold text-[#b83232]">
      {text}
    </p>
  );
}

/** A chat bubble with its time; the student's own show "Read" once the answer is saved. */
function Bubble({ message: m, photo, photoBg }: { message: Message; photo: string; photoBg: string }) {
  const mine = m.from === "me";
  return (
    <div className={`flex items-end gap-2.5 ${mine ? "flex-row-reverse" : ""}`}>
      <span className="relative size-11 shrink-0 overflow-hidden rounded-full shadow-sm" style={{ backgroundColor: photoBg }}>
        <Image src={photo} alt="" fill sizes="44px" className="object-cover" />
      </span>
      <div
        className={`max-w-[75%] rounded-[16px] px-3.5 py-2.5 shadow-sm ${
          mine ? "rounded-br-[4px] border border-white/70 bg-white/45" : "rounded-bl-[4px] bg-white"
        } ${m.sending ? "opacity-70" : ""}`}
      >
        <p dir="auto" className="whitespace-pre-wrap break-words text-[14px] leading-relaxed text-[#14365a]">
          {m.text}
        </p>
        <p className={`mt-1 text-[10px] text-[#14365a]/70 ${mine ? "text-right" : ""}`}>
          {clock(m.time)}
          {mine && (m.sending ? " · Sending" : " · Read")}
        </p>
      </div>
    </div>
  );
}

function CallButton({
  label,
  onClick,
  disabled,
  pressed,
  className,
  style,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  pressed?: boolean;
  className: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <span className="flex flex-col items-center gap-1.5">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-pressed={pressed}
        aria-label={label}
        className={`grid size-[60px] place-items-center rounded-full transition disabled:opacity-50 ${className}`}
        style={style}
      >
        {children}
      </button>
      <span aria-hidden className="text-[12px] font-bold text-white drop-shadow-[0_1px_2px_rgba(20,54,90,0.5)]">
        {label}
      </span>
    </span>
  );
}

/** The voice line under Karima; it moves while she speaks or the student records. */
function Wave({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 350 90"
      className="h-auto w-[min(85%,338px)] shrink-0 overflow-visible lg:w-[min(85%,338px,calc((100vh-490px)*0.85))] lg:min-w-[160px] [filter:drop-shadow(0_2.77px_2.21px_rgba(98,149,247,0.5))_drop-shadow(0_6.65px_5.32px_rgba(98,149,247,0.35))]"
      aria-hidden
    >
      <path
        d="M2 62 H62 C78 62 74 30 92 30 C110 30 104 72 122 72 C140 72 130 44 148 44 C164 44 158 84 176 84 C194 84 186 52 200 52 C214 52 206 4 226 4 C246 4 238 70 256 70 C272 70 268 40 284 40 C300 40 298 62 316 62 H348"
        fill="none"
        stroke="rgba(27,45,84,1)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={active ? "origin-center [transform-box:fill-box] animate-[jh-wave_0.9s_ease-in-out_infinite]" : ""}
      />
    </svg>
  );
}

/** The top 3 tracks with a level each (Unsure and Exploring). */
function TopTracks({ result, busy, onStart }: { result: DiscoveryResult; busy: boolean; onStart: (code: string) => void }) {
  return (
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
              disabled={busy}
              onClick={() => onStart(r.trackCode)}
              className="mt-auto flex items-center justify-center gap-2 rounded-full bg-[#12939b] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0f7a81] disabled:opacity-60"
              style={{ marginTop: "1.5rem" }}
            >
              Start this track <ArrowRight className="size-4" />
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

/** KnowsTrack: the chosen track with the level the interview found, and two more tracks worth exploring later. */
function KnowsTrackResult({ result, busy, onStart }: { result: DiscoveryResult; busy: boolean; onStart: (code: string) => void }) {
  const [chosen, ...others] = result.recommendations;
  return (
    <>
      {result.summary && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#14365a]/80">{result.summary}</p>}
      <section className="mt-6 flex flex-wrap items-center gap-6 rounded-[28px] bg-gradient-to-br from-[#e3f6ee] to-[#dcebfb] p-7">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wide text-[#12939b]">Your track</p>
          <h2 className="mt-1 text-2xl font-extrabold text-[#14365a]">{chosen.trackName}</h2>
          <p className="mt-3 inline-flex rounded-full bg-white px-4 py-1.5 text-sm font-bold text-[#7c3aed]">Your level: {chosen.level}</p>
          {chosen.levelReason && <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#14365a]/75">{chosen.levelReason}</p>}
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => onStart(chosen.trackCode)}
          className="flex items-center gap-2 rounded-full bg-[#14365a] px-6 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          Start learning {chosen.trackName} <ArrowRight className="size-4" />
        </button>
      </section>

      {others.length > 0 && (
        <>
          <h3 className="mt-8 text-lg font-extrabold text-[#14365a]">Also worth exploring</h3>
          <p className="mt-1 text-sm text-[#14365a]/70">You can open these tracks from Courses once you start learning.</p>
          <ul className="mt-4 grid gap-4 md:grid-cols-2">
            {others.map((r) => (
              <li key={r.trackCode} className="rounded-[24px] border border-[#e3ecea] bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-base font-bold text-[#14365a]">{r.trackName}</h4>
                  <span className="rounded-full bg-[#e9f7f4] px-3 py-1 text-xs font-bold text-[#12939b]">{r.matchPercent}% match</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[#14365a]/75">{r.reason}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
