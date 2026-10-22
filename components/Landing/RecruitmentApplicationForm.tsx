"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";

const TEXT_QUESTIONS = [
  {
    title: tk("Tell us about yourself and your interest in UI/UX design."),
    description: tk("Share a little about your background, what drew you to design, and what you hope to learn."),
  },
  {
    title: tk("Describe a project you have worked on."),
    description: tk("This can be a school, personal, volunteer, or practice project. Tell us about your role and process."),
  },
  {
    title: tk("Why are you interested in this simulation?"),
    description: tk("Share a little about your background, what drew you to design, and what you hope to learn."),
  },
] as const;

const DESIGN_TOOLS = ["Figma", "Adobe XD", "Sketch", "Canva", "Miro", "Other"] as const;
type DesignTool = (typeof DESIGN_TOOLS)[number];

export function RecruitmentApplicationForm() {
  const t = useT();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState(["", "", ""]);
  const [selectedTools, setSelectedTools] = useState<DesignTool[]>([]);
  const [otherTool, setOtherTool] = useState("");
  const [error, setError] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  const progress = step * 25;

  function toggleTool(tool: DesignTool) {
    setSelectedTools((current) =>
      current.includes(tool) ? current.filter((selected) => selected !== tool) : [...current, tool],
    );
    setError("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (step < 4) {
      if (!answers[step - 1]?.trim()) {
        setError(t("Please answer this question before continuing."));
        return;
      }
      setStep((current) => current + 1);
      return;
    }

    if (selectedTools.length === 0) {
      setError(t("Select at least one design tool to continue."));
      return;
    }

    setIsComplete(true);
  }

  function goBack() {
    setError("");
    setStep((current) => Math.max(1, current - 1));
  }

  return (
    <div className="flex-1 bg-[radial-gradient(ellipse_at_50%_18%,rgba(219,240,237,0.62),transparent_45%),#fff]">
      <div className="mx-auto max-w-[900px] px-5 pb-24 pt-14 sm:px-0 sm:pt-[110px]">
        <div className="mb-12">
          <p className="text-lg text-[#64748b]">{t("Application for")}</p>
          <h1 className="mt-1 text-3xl font-extrabold leading-tight text-[#1b2a5c] sm:text-[40px]">
            {t("Junior UI/UX Designer")}
          </h1>
        </div>

        {isComplete ? (
          <section className="rounded-2xl border border-[#e8edf0] bg-white p-7 shadow-[0_12px_35px_rgba(27,42,92,0.08)] sm:p-10">
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-[#dff3ee] text-[#07858c]">
              <Check size={24} aria-hidden />
            </div>
            <h2 className="mt-4 text-center text-xl font-semibold text-[#1b2a5c]">{t("Practice application complete")}</h2>
            <p className="mx-auto mt-2 max-w-lg text-center text-sm leading-relaxed text-[#64748b]">
              {t("Your answers are ready for this hiring simulation. This is a practice exercise and has not been sent to an employer.")}
            </p>
            <Link
              href="/recruitment"
              className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-md bg-[#128b91] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0e747a]"
            >
              {t("Back to opportunities")} <ArrowRight size={16} aria-hidden />
            </Link>
          </section>
        ) : (
          <>
            <div className="mb-1.5 flex items-center justify-between px-2 text-lg text-[#64748b]">
              <span>{t("Question {n} of {total}", { n: step, total: 4 })}</span>
              <span className="text-[#07858c]">{t("{percent}% complete", { percent: progress })}</span>
            </div>
            <div
              className="mb-7 h-1.5 overflow-hidden rounded-full bg-[#dcecea]"
              role="progressbar"
              aria-label={t("Application progress")}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
            >
              <div
                className="h-full rounded-full bg-[#12939b] transition-[width] duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <h2 className="text-xl font-medium text-[#64748b] sm:text-[25px]">
              {step === 4 ? (
                <>
                  {t("Which design tools have you used?")}<span className="text-[#b3002d]">*</span>
                </>
              ) : (
                <>
                  {t(TEXT_QUESTIONS[step - 1].title)}
                  <span className="text-[#b3002d]">*</span>
                </>
              )}
            </h2>
            <p className="mt-5 text-base leading-snug text-[#64748b]">
              {step === 4 ? t("Select all that apply. It’s completely fine if you’re still learning.") : t(TEXT_QUESTIONS[step - 1].description)}
            </p>

            <form
              onSubmit={handleSubmit}
              className={`mt-1.5 rounded-3xl border border-[#e8edf0] bg-white shadow-[0_12px_35px_rgba(27,42,92,0.08)] ${
                step < 4 ? "px-5 pb-11 pt-10 sm:px-[50px] sm:pt-[76px]" : "px-5 pb-10 pt-9 sm:px-[38px]"
              }`}
            >
              {step < 4 ? (
                <div className="relative">
                  <label className="sr-only" htmlFor={`application-answer-${step}`}>
                    {t("Your answer")}
                  </label>
                  <textarea
                    id={`application-answer-${step}`}
                    maxLength={1000}
                    value={answers[step - 1]}
                    onChange={(event) => {
                      const nextAnswers = [...answers];
                      nextAnswers[step - 1] = event.target.value;
                      setAnswers(nextAnswers);
                      setError("");
                    }}
                    dir="auto"
                    placeholder={t("Write your answer here...")}
                    aria-invalid={Boolean(error)}
                    aria-describedby="answer-count application-error"
                    className="h-[250px] w-full resize-none rounded-2xl border border-[#9aa3a8] bg-white px-10 pb-10 pt-10 text-base leading-relaxed text-[#1b2a5c] outline-none transition placeholder:text-[#64748b] focus:border-[#12939b] focus:ring-2 focus:ring-[#12939b]/20"
                  />
                  <span id="answer-count" className="absolute bottom-3 end-6 text-sm text-[#64748b]">
                    {answers[step - 1].length}/1000
                  </span>
                </div>
              ) : (
                <fieldset>
                  <legend className="sr-only">{t("Select the design tools you have used")}</legend>
                  <div className="grid gap-x-[84px] gap-y-[30px] sm:grid-cols-2">
                    {DESIGN_TOOLS.map((tool) => (
                      <label
                        key={tool}
                        className={`flex h-[60px] cursor-pointer items-center gap-2.5 rounded-lg border px-4 text-base transition-colors ${
                          selectedTools.includes(tool)
                            ? "border-[#12939b] bg-[#eaf7f5] text-[#087f87]"
                            : "border-[#e2e6e9] bg-white text-[#475569] hover:border-[#9ccfca]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedTools.includes(tool)}
                          onChange={() => toggleTool(tool)}
                          className="peer sr-only"
                        />
                        <span
                          aria-hidden
                          className="grid size-[30px] shrink-0 place-items-center rounded-lg border border-[#64748b] text-white peer-checked:border-[#12939b] peer-checked:bg-[#12939b] peer-focus-visible:ring-2 peer-focus-visible:ring-[#12939b]/40"
                        >
                          {selectedTools.includes(tool) && <Check size={18} strokeWidth={3} />}
                        </span>
                        {t(tool)}
                      </label>
                    ))}
                  </div>
                  {selectedTools.includes("Other") && (
                    <label className="mt-4 block text-sm font-medium text-[#475569]">
                      {t("Which other design tools?")}
                      <input
                        value={otherTool}
                        onChange={(event) => setOtherTool(event.target.value)}
                        placeholder={t("Optional")}
                        className="mt-2 h-11 w-full rounded-lg border border-[#cbd0d3] px-3 text-sm outline-none focus:border-[#12939b] focus:ring-2 focus:ring-[#12939b]/20"
                      />
                    </label>
                  )}
                </fieldset>
              )}

              <p id="application-error" className="mt-2 min-h-5 text-sm text-red-600" role="alert">
                {error}
              </p>
              <div className={`flex justify-end gap-2.5 ${step < 4 ? "mt-3" : "mt-6"}`}>
                {step > 1 && (
                  <button
                    type="button"
                    onClick={goBack}
                    className="inline-flex h-[38px] items-center gap-2 rounded-md bg-[#128b91] px-4 text-base font-bold text-white shadow-[0_8px_16px_rgba(18,139,145,0.25)] transition-colors hover:bg-[#0e747a]"
                  >
                    <ArrowLeft size={15} aria-hidden /> {t("Back")}
                  </button>
                )}
                <button
                  type="submit"
                  className={`inline-flex h-[38px] items-center gap-2 rounded-md px-4 text-base font-bold text-white shadow-[0_8px_16px_rgba(18,139,145,0.25)] transition-opacity hover:opacity-90 ${
                    step === 4 ? "bg-gradient-to-r from-[#128084] to-[#1b2d55]" : "bg-[#128b91]"
                  }`}
                >
                  {step === 4 ? t("Submit") : t("Next")}
                  <ArrowRight size={15} aria-hidden />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
