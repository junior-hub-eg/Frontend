"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  LoaderCircle,
  Lightbulb,
  Lock,
  PenLine,
  Play,
  RefreshCw,
  Sparkles,
  Zap,
} from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import { Card } from "@/components/teacher/teacher-ui";
import { TeacherDialog } from "@/components/teacher/teacher-dialogs";

/* ------------------------------------------------------------------ */
/* Mock data. TODO: replace with the real data from the API.          */
/* Everything is plain English: the Arabic lives in lib/i18n/ar/ai-integration.ts */
/* ------------------------------------------------------------------ */

type SubjectId = "physics" | "math" | "biology" | "chemistry";

const SUBJECTS: { id: SubjectId; label: string }[] = [
  { id: "physics", label: "Physics" },
  { id: "math", label: "Math" },
  { id: "biology", label: "Biology" },
  { id: "chemistry", label: "Chemistry" },
];

type Detail = {
  intro: string;
  summary: { title: string; text: string }[];
  links: Record<SubjectId, string[]>;
  quick: { question: string; options: string[]; answer: number }[];
  xp: number;
  videoUrl?: string;
};

type Concept = { id: string; title: string; minutes: number; detail?: Detail };

const CONCEPTS: Concept[] = [
  {
    id: "computer-vision",
    title: "Computer Vision",
    minutes: 3,
    detail: {
      intro: "Short video explaining Computer Vision with simple drawings.",
      videoUrl: "https://www.youtube.com/watch?v=-4E2-0sxVUM",
      summary: [
        { title: "What it is", text: "Computer Vision lets computers understand images and video the way people do." },
        {
          title: "How it works",
          text: "A camera turns the picture into numbers, and a trained model finds patterns such as edges, shapes and objects.",
        },
        {
          title: "Where it's used",
          text: "Face unlock, self-driving cars, medical scans and spotting plant diseases from a photo.",
        },
      ],
      links: {
        physics: [
          "The camera captures light through lenses and reflection, the same thing you study in optics.",
          "Compare how a camera lens focuses light with how the lens of the eye does.",
          "Build a simple pinhole camera to see how light forms an image.",
        ],
        math: [
          "An image is a matrix of numbers (pixels), and AI does its calculations on it.",
          "Count how many numbers it takes to describe a small 10×10 image.",
          "Use coordinates to describe where an object sits inside a picture.",
        ],
        biology: [
          "The eye and the brain recognize shapes, and AI imitates that.",
          "Compare the cells of the retina with the pixels of a camera sensor.",
          "Discuss how the brain recognizes a face even in poor light.",
        ],
        chemistry: [
          "The camera reads the color of a reaction or solution and estimates the concentration.",
          "Compare the color of solutions at different concentrations using a phone camera.",
          "Explain how a color change shows that a reaction has finished.",
        ],
      },
      quick: [
        {
          question: "What does a computer see when it looks at a picture?",
          options: ["A grid of numbers (pixels)", "A tiny human eye", "Only the colors red and blue"],
          answer: 0,
        },
        {
          question: "Which one is an example of Computer Vision?",
          options: ["Unlocking a phone with your face", "Playing a song from a playlist", "Sending a text message"],
          answer: 0,
        },
      ],
      xp: 20,
    },
  },
  {
    id: "machine-learning",
    title: "Machine Learning Basics",
    minutes: 4,
    detail: {
      intro: "Short video explaining Machine Learning basics.",
      videoUrl: "https://www.youtube.com/watch?v=jVwvnWRYcdk",
      summary: [
        { title: "Overview", text: "Introduction to machine learning models." },
        { title: "Key concepts", text: "Understanding data science fundamentals." },
      ],
      links: { physics: [], math: [], biology: [], chemistry: [] },
      quick: [],
      xp: 20,
    },
  },
  {
    id: "chatbots",
    title: "Chatbots & Language Models",
    minutes: 4,
    detail: {
      intro: "Short video explaining Chatbots and Language Models.",
      videoUrl: "https://www.youtube.com/watch?v=puB-4LuRNys&t=80s",
      summary: [
        { title: "Overview", text: "Introduction to language models." },
        { title: "Key concepts", text: "Understanding chatbots." },
      ],
      links: { physics: [], math: [], biology: [], chemistry: [] },
      quick: [],
      xp: 20,
    },
  },
];

async function suggestLinkIdeas(detail: Detail, subject: SubjectId, round: number): Promise<string[]> {
  await new Promise((r) => setTimeout(r, 700));
  const ideas = detail.links[subject];
  const shift = round % ideas.length;
  return [...ideas.slice(shift), ...ideas.slice(0, shift)];
}

type PublishPayload = { conceptId: string; subject: SubjectId; link: string; classIds: string[] };

async function publishConceptLink(payload: PublishPayload): Promise<void> {
  void payload;
  await new Promise((r) => setTimeout(r, 600));
}

function VideoBox({ title, videoUrl, disabled }: { title: string; videoUrl?: string; disabled?: boolean }) {
  const { t } = useI18n();

  if (videoUrl && !disabled) {
    let embedUrl = videoUrl;
    // Turn a normal YouTube link into an embed link so it plays inside the iframe
    if (embedUrl.includes("watch?v=")) {
      embedUrl = embedUrl.replace("watch?v=", "embed/");
    } else if (embedUrl.includes("youtu.be/")) {
      embedUrl = embedUrl.replace("youtu.be/", "www.youtube.com/embed/");
    }
    // Remove extra parameters such as t= to avoid loading errors
    if (embedUrl.includes("&")) {
      embedUrl = embedUrl.split("&")[0];
    }

    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
        <iframe
          src={embedUrl}
          title={title}
          className="h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className={cn(
      "relative grid aspect-video w-full place-items-center overflow-hidden rounded-lg bg-gradient-to-br from-[#14757d] to-[#1B2D54]",
      disabled && "from-slate-400 to-slate-600 opacity-75"
    )}>
      {disabled ? (
        <div className="flex flex-col items-center justify-center gap-1 text-white">
          <div className="grid size-9 place-items-center rounded-full bg-black/40">
            <Lock aria-hidden className="size-4 text-white" />
          </div>
          <span className="text-[10px] font-semibold tracking-wide rtl:tracking-normal">{t("Coming soon")}</span>
        </div>
      ) : (
        <button
          type="button"
          aria-label={t("Play video")}
          className="grid size-10 place-items-center rounded-full bg-white/90 text-[#14757d] shadow-md transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <Play aria-hidden className="size-4 translate-x-px rtl:-scale-x-100" fill="currentColor" />
        </button>
      )}
      <span className="absolute bottom-2 start-2 rounded-full bg-black/40 px-2.5 py-0.5 text-[9px] font-medium text-white">{title}</span>
    </div>
  );
}

function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="mb-4 flex items-center gap-2">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex min-w-0 flex-1 items-center gap-2">
            <span
              aria-current={active ? "step" : undefined}
              className={cn(
                "grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-bold",
                done && "bg-[#14757d] text-white",
                active && "bg-[#1B2D54] text-white",
                !done && !active && "bg-[#eef2f1] text-[#1B2D54]/60",
              )}
            >
              {done ? <CircleCheck aria-hidden className="size-3.5" /> : i + 1}
            </span>
            <span className={cn("hidden truncate text-[10px] font-semibold sm:block", active ? "text-[#1B2D54]" : "text-[#1B2D54]/50")}>{label}</span>
            {i < steps.length - 1 && <span aria-hidden className="h-px flex-1 bg-[#e3ece9]" />}
          </li>
        );
      })}
    </ol>
  );
}

type PublishedItem = { id: string; concept: string; subject: string; link: string; classNames: string[] };

function ConceptWizard({
  concept,
  detail,
  classes,
  onClose,
  onPublished,
}: {
  concept: Concept;
  detail: Detail;
  classes: { id: string; name: string }[];
  onClose: () => void;
  onPublished: (item: PublishedItem) => void;
}) {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [subject, setSubject] = useState<SubjectId | null>(null);
  const [ideas, setIdeas] = useState<string[] | null>(null);
  const [round, setRound] = useState(0);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [choice, setChoice] = useState<number | "custom" | null>(null);
  const [custom, setCustom] = useState("");
  const [classIds, setClassIds] = useState<string[]>(classes.length === 1 ? [classes[0].id] : []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps = [t("Watch & summary"), t("Subject"), t("Link idea"), t("Preview & publish")];
  const subjectLabel = SUBJECTS.find((s) => s.id === subject)?.label ?? "";
  const link = choice === "custom" ? custom.trim() : choice !== null && ideas ? ideas[choice] : "";

  async function loadIdeas(nextRound: number) {
    if (!subject) return;
    setLoadingIdeas(true);
    setChoice(null);
    try {
      setIdeas(await suggestLinkIdeas(detail, subject, nextRound));
    } finally {
      setLoadingIdeas(false);
    }
  }

  async function next() {
    if (step === 1) {
      setStep(2);
      if (!ideas) await loadIdeas(round);
      return;
    }
    setStep((s) => s + 1);
  }

  function pickSubject(id: SubjectId) {
    if (id !== subject) {
      setSubject(id);
      setIdeas(null);
      setChoice(null);
    }
  }

  async function publish() {
    if (!subject) return;
    setBusy(true);
    setError(null);
    try {
      await publishConceptLink({ conceptId: concept.id, subject, link, classIds });
      onPublished({
        id: `${concept.id}-${Date.now()}`,
        concept: concept.title,
        subject: subjectLabel,
        link,
        classNames: classes.filter((c) => classIds.includes(c.id)).map((c) => c.name),
      });
    } catch (e) {
      setError(errorMessage(e) || t("We couldn't publish. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  const canNext = step === 0 || (step === 1 && subject !== null);
  const canPublish = link.length >= 10 && classIds.length > 0 && !busy;

  let body: ReactNode;

  if (step === 0) {
    body = (
      <div className="grid gap-4">
        <VideoBox title={t(concept.title)} videoUrl={detail.videoUrl} />
        <p className="text-[11px] text-[#1B2D54]/70">{t(detail.intro)}</p>

        <div>
          <h3 className="flex items-center gap-1.5 text-xs font-semibold">
            <Lightbulb aria-hidden className="size-4 text-[#14757d]" />
            {t("Quick summary")}
          </h3>
          <ol className="mt-2 grid gap-2 sm:grid-cols-3">
            {detail.summary.map((s, i) => (
              <li key={s.title} className="rounded-xl bg-[#f1f4f4] p-3">
                <p className="flex items-center gap-1.5 text-[10px] font-bold text-[#14757d]">
                  <span className="grid size-4 place-items-center rounded-full bg-[#14757d] text-[9px] text-white">{i + 1}</span>
                  {t(s.title)}
                </p>
                <p className="mt-1.5 text-[11px] leading-snug text-[#1B2D54]/80">{t(s.text)}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    );
  } else if (step === 1) {
    body = (
      <div className="grid gap-3">
        <div>
          <h3 className="text-sm font-semibold">{t("Which subject do you teach?")}</h3>
          <p className="mt-1 text-[11px] text-[#1B2D54]/60">{t("The AI will suggest ways to connect {concept} to it.", { concept: t(concept.title) })}</p>
        </div>
        <div role="radiogroup" aria-label={t("Subject")} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SUBJECTS.map((s) => {
            const selected = subject === s.id;
            return (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => pickSubject(s.id)}
                className={cn(
                  "rounded-xl border px-3 py-4 text-center text-xs font-semibold transition-colors",
                  selected ? "border-[#14757d] bg-[#e9f7f5] text-[#14757d]" : "border-[#e3ece9] bg-white hover:bg-[#f6f9f8]",
                )}
              >
                {t(s.label)}
              </button>
            );
          })}
        </div>
      </div>
    );
  } else if (step === 2) {
    body = (
      <div className="grid gap-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="flex items-center gap-1.5 text-sm font-semibold">
              <Sparkles aria-hidden className="size-4 text-[#14757d]" />
              {t("AI link ideas")}
              <span className="rounded-full bg-[#c9efe9] px-2 py-0.5 text-[9px] font-semibold text-[#14757d]">{t(subjectLabel)}</span>
            </h3>
            <p className="mt-1 text-[11px] text-[#1B2D54]/60">{t("Pick one idea, or write your own.")}</p>
          </div>
          <button
            type="button"
            disabled={loadingIdeas}
            onClick={() => {
              const nextRound = round + 1;
              setRound(nextRound);
              void loadIdeas(nextRound);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-[#eef2f1] px-3 py-1.5 text-[10px] font-semibold disabled:opacity-50"
          >
            <RefreshCw aria-hidden className={cn("size-3.5", loadingIdeas && "animate-spin")} />
            {t("Suggest new ideas")}
          </button>
        </div>

        {loadingIdeas || !ideas ? (
          <p className="flex items-center justify-center gap-2 rounded-xl bg-[#f1f4f4] p-8 text-[11px] text-[#1B2D54]/60">
            <LoaderCircle aria-hidden className="size-4 animate-spin" />
            {t("The AI is thinking…")}
          </p>
        ) : (
          <div role="radiogroup" aria-label={t("AI link ideas")} className="grid gap-2">
            {ideas.map((idea, i) => {
              const selected = choice === i;
              return (
                <button
                  key={idea}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setChoice(i)}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-3 text-start transition-colors",
                    selected ? "border-[#14757d] bg-[#e9f7f5]" : "border-[#e3ece9] bg-white hover:bg-[#f6f9f8]",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn("mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border-2", selected ? "border-[#14757d]" : "border-[#1B2D54]/30")}
                  >
                    {selected && <span className="size-1.5 rounded-full bg-[#14757d]" />}
                  </span>
                  <span className="text-[11px] leading-snug">{t(idea)}</span>
                </button>
              );
            })}

            <button
              type="button"
              role="radio"
              aria-checked={choice === "custom"}
              onClick={() => setChoice("custom")}
              className={cn(
                "flex items-center gap-3 rounded-xl border p-3 text-start text-[11px] font-semibold transition-colors",
                choice === "custom" ? "border-[#14757d] bg-[#e9f7f5]" : "border-dashed border-[#c9d6d3] bg-white hover:bg-[#f6f9f8]",
              )}
            >
              <PenLine aria-hidden className="size-4 shrink-0 text-[#14757d]" />
              {t("Write my own link")}
            </button>

            {choice === "custom" && (
              <textarea
                dir="auto"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                rows={3}
                maxLength={400}
                placeholder={t("Write how {concept} connects to your subject…", { concept: t(concept.title) })}
                className="w-full resize-none rounded-xl border border-[#e3ece9] bg-[#f6f9f8] p-3 text-[11px] outline-none focus:ring-2 focus:ring-[#12939b]/40"
              />
            )}
          </div>
        )}
      </div>
    );
  } else {
    body = (
      <div className="grid gap-4">
        <div>
          <h3 className="text-sm font-semibold">{t("Student view")}</h3>
          <p className="mt-1 text-[11px] text-[#1B2D54]/60">{t("This is what your students will see under the video.")}</p>
        </div>

        <div className="grid gap-3 rounded-2xl bg-[#f1f4f4] p-3">
          <VideoBox title={t(concept.title)} videoUrl={detail.videoUrl} />

          <div className="rounded-xl bg-white p-3">
            <p className="flex items-center gap-1.5 text-[10px] font-bold text-[#14757d]">
              <Lightbulb aria-hidden className="size-3.5" />
              {t("Teacher's link to the subject")}
              <span className="rounded-full bg-[#c9efe9] px-2 py-0.5 text-[9px]">{t(subjectLabel)}</span>
            </p>
            <p dir="auto" className="mt-1.5 text-[11px] leading-snug">
              {link || t("Pick or write a link in the previous step.")}
            </p>
          </div>

          <div className="rounded-xl bg-white p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-bold text-[#1B2D54]">
                {t("Quick Check")} • {t("{n} questions", { n: detail.quick.length })}
              </p>
              <span className="flex items-center gap-1 rounded-full bg-[#fdeedb] px-2 py-0.5 text-[9px] font-semibold text-[#c76a0a]">
                <Zap aria-hidden className="size-3" />
                <bdi dir="ltr">{t("+{xp} XP", { xp: detail.xp })}</bdi>
              </span>
            </div>

            <ol className="mt-2 grid gap-3">
              {detail.quick.map((q, qi) => (
                <li key={q.question}>
                  <p className="text-[11px] font-semibold">
                    {qi + 1}. {t(q.question)}
                  </p>
                  <ul className="mt-1.5 grid gap-1">
                    {q.options.map((o, oi) => (
                      <li
                        key={o}
                        className={cn(
                          "flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[10px]",
                          oi === q.answer ? "border-[#14757d]/40 bg-[#e9f7f5]" : "border-[#e3ece9]",
                        )}
                      >
                        <span aria-hidden className="size-3 shrink-0 rounded-full border border-[#1B2D54]/30" />
                        {t(o)}
                        {oi === q.answer && <CircleCheck aria-hidden className="ms-auto size-3.5 text-[#14757d]" />}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold">{t("Publish to classes")}</h3>
          {classes.length === 0 ? (
            <p className="mt-2 text-[11px] text-[#1B2D54]/60">{t("No classes yet. Ask the school admin to link your classes.")}</p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {classes.map((c) => {
                const on = classIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setClassIds((ids) => (on ? ids.filter((x) => x !== c.id) : [...ids, c.id]))}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold transition-colors",
                      on ? "bg-[#14757d] text-white" : "bg-[#eef2f1] text-[#1B2D54] hover:bg-[#dfe9e7]",
                    )}
                  >
                    {on && <CircleCheck aria-hidden className="size-3.5" />}
                    {t("Class {name}", { name: c.name })}
                  </button>
                );
              })}
            </div>
          )}
          {classIds.length === 0 && classes.length > 0 && (
            <p className="mt-2 text-[10px] text-[#1B2D54]/60">{t("Choose at least one class.")}</p>
          )}
        </div>

        {error && (
          <p role="alert" className="text-[11px] text-[#c81e1e]">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <TeacherDialog title={t("Use a concept video in class")} subtitle={t("Watch, choose a subject, pick a link, then publish.")} onClose={onClose} wide>
      <Stepper steps={steps} current={step} />
      {body}

      <div className="mt-5 flex items-center justify-between gap-2">
        {step === 0 ? (
          <button type="button" onClick={onClose} className="rounded-full bg-[#eef2f1] px-4 py-2 text-[11px] font-semibold">
            {t("Cancel")}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="flex items-center gap-1 rounded-full bg-[#eef2f1] px-4 py-2 text-[11px] font-semibold"
          >
            <ChevronLeft aria-hidden className="size-3.5 rtl:rotate-180" />
            {t("Back")}
          </button>
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={() => (step === 2 ? setStep(3) : void next())}
            disabled={step === 2 ? link.length < 10 || loadingIdeas : !canNext}
            className="flex items-center gap-1 rounded-full bg-[#14757d] px-5 py-2 text-[11px] font-semibold text-white disabled:opacity-50"
          >
            {t("Next")}
            <ChevronRight aria-hidden className="size-3.5 rtl:rotate-180" />
          </button>
        ) : (
          <button
            type="button"
            onClick={publish}
            disabled={!canPublish}
            className="flex items-center gap-1.5 rounded-full bg-[#14757d] px-5 py-2 text-[11px] font-semibold text-white disabled:opacity-50"
          >
            {busy && <LoaderCircle aria-hidden className="size-3.5 animate-spin" />}
            {t("Publish")}
          </button>
        )}
      </div>
    </TeacherDialog>
  );
}

function ConceptVideosCard({
  classes,
  onNotice,
}: {
  classes: { id: string; name: string }[];
  onNotice: (text: string) => void;
}) {
  const { t } = useI18n();
  const [active, setActive] = useState<Concept | null>(null);
  const [published, setPublished] = useState<PublishedItem[]>([]);

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#c9efe9] text-[#14757d]">
            <Sparkles aria-hidden className="size-4" />
          </span>
          <div className="leading-tight">
            <h2 className="text-sm font-semibold">{t("AI Concept Videos")}</h2>
            <p className="mt-1 text-[10px] text-[#1B2D54]/60">{t("Turn a short AI concept video into a lesson linked to your subject.")}</p>
          </div>
        </div>
      </div>

      <ul className="mt-4 grid gap-3 md:grid-cols-3">
        {CONCEPTS.map((c, index) => {
          const isAvailable = index === 0;

          return (
            <li key={c.id} className={cn("flex flex-col gap-3 rounded-xl border border-[#e3ece9] bg-white p-3", !isAvailable && "opacity-90")}>
              <div className="relative overflow-hidden rounded-lg">
                <VideoBox title={t(c.title)} videoUrl={c.detail?.videoUrl} disabled={!isAvailable} />
              </div>

              <p className="text-xs font-semibold leading-snug">{t(c.title)}</p>

              {isAvailable ? (
                <button
                  type="button"
                  onClick={() => setActive(c)}
                  className="mt-auto flex items-center justify-center gap-1.5 rounded-lg bg-[#14757d] px-3 py-2 text-[11px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12939b]/40"
                >
                  {t("Use in class")}
                  <ChevronRight aria-hidden className="size-3.5 rtl:rotate-180" />
                </button>
              ) : (
                <span className="mt-auto flex items-center justify-center gap-1.5 rounded-lg bg-[#eef2f1] px-3 py-2 text-center text-[11px] font-semibold text-[#1B2D54]/60">
                  <Lock aria-hidden className="size-3.5" />
                  {t("Coming soon")}
                </span>
              )}
            </li>
          );
        })}
      </ul>

      {published.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xs font-semibold">{t("Recently linked")}</h3>
          <ul className="mt-2 grid gap-2">
            {published.map((p) => (
              <li key={p.id} className="rounded-xl bg-[#f1f4f4] p-3">
                <p className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                  {t(p.concept)}
                  <span className="rounded-full bg-[#c9efe9] px-2 py-0.5 text-[9px] text-[#14757d]">{t(p.subject)}</span>
                  <span className="text-[10px] font-normal text-[#1B2D54]/60">
                    {p.classNames.map((n) => t("Class {name}", { name: n })).join(" • ")}
                  </span>
                </p>
                <p dir="auto" className="mt-1 text-[11px] leading-snug text-[#1B2D54]/75">
                  {p.link}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {active?.detail && (
        <ConceptWizard
          concept={active}
          detail={active.detail}
          classes={classes}
          onClose={() => setActive(null)}
          onPublished={(item) => {
            setPublished((list) => [item, ...list]);
            setActive(null);
            onNotice(
              t("{concept} was linked to {subject} and published to {classes}.", {
                concept: t(item.concept),
                subject: t(item.subject),
                classes: item.classNames.map((n) => t("Class {name}", { name: n })).join(", "),
              }),
            );
          }}
        />
      )}
    </Card>
  );
}

export default function AIIntegrationPage() {
  const { t } = useI18n();

  // TODO: replace with the teacher's real classes from the API (names look like "4A", "5A")
  const mockClasses = [
    { id: "1", name: "4A" },
    { id: "2", name: "5A" },
  ];

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 pb-6 pt-4 font-[family-name:var(--font-poppins)] text-[#1B2D54]">
      {/* Sky background: only the top part, fading into white */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[453px] [mask-image:linear-gradient(to_bottom,black_60%,transparent)]">
        <Image src="/images/learner/projects/background.png" alt="" fill priority sizes="100vw" className="object-cover object-top" />
      </div>

      <div className="mb-4">
        <h1 className="text-[28px] font-bold leading-tight text-[#0f1f3d]">{t("AI Integration & Curriculum")}</h1>
        <p className="mt-1.5 max-w-[34rem] text-[13px] leading-snug text-[#1B2D54]/75">
          {t("Turn short AI concept videos into interactive lessons linked directly to your school curriculum.")}
        </p>
      </div>

      <ConceptVideosCard
        classes={mockClasses}
        onNotice={(text) => alert(text)}
      />
    </div>
  );
}
