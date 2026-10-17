"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

const TEXT_QUESTIONS = [
  {
    title: "Tell us about yourself and your interest in UI/UX design.",
    description: "Share a little about your background, what drew you to design, and what you hope to learn.",
  },
  {
    title: "Describe a project you have worked on.",
    description: "This can be a school, personal, volunteer, or practice project. Tell us about your role and process.",
  },
  {
    title: "Why are you interested in this simulation?",
    description: "Tell us what interests you about the challenge and what you hope to learn.",
  },
] as const;

const DESIGN_TOOLS = ["Figma", "Adobe XD", "Sketch", "Canva", "Miro", "Other"] as const;
type DesignTool = (typeof DESIGN_TOOLS)[number];

export function RecruitmentApplicationForm() {
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
        setError("Please answer this question before continuing.");
        return;
      }
      setStep((current) => current + 1);
      return;
    }

    if (selectedTools.length === 0) {
      setError("Select at least one design tool to continue.");
      return;
    }

    setIsComplete(true);
  }

  function goBack() {
    setError("");
    setStep((current) => Math.max(1, current - 1));
  }

  return (
    <main className="flex-1 bg-[radial-gradient(ellipse_at_50%_18%,rgba(219,240,237,0.62),transparent_45%),#fff]">
      <div className="mx-auto max-w-3xl px-5 pb-16 pt-10 sm:px-8 sm:pt-14">
        <div className="mb-7">
          <p className="text-xs font-medium text-[#64748b] sm:text-sm">Application for</p>
          <h1 className="mt-1 text-2xl font-bold leading-tight text-[#1b2a5c] sm:text-3xl">
            Junior UI/UX Designer
          </h1>
        </div>

        {isComplete ? (
          <section className="rounded-2xl border border-[#e8edf0] bg-white p-7 shadow-[0_12px_35px_rgba(27,42,92,0.08)] sm:p-10">
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-[#dff3ee] text-[#07858c]">
              <Check size={24} aria-hidden />
            </div>
            <h2 className="mt-4 text-center text-xl font-semibold text-[#1b2a5c]">Practice application complete</h2>
            <p className="mx-auto mt-2 max-w-lg text-center text-sm leading-relaxed text-[#64748b]">
              Your answers are ready for this hiring simulation. This is a practice exercise and has not been sent to
              an employer.
            </p>
            <Link
              href="/recruitment"
              className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-md bg-[#128b91] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0e747a]"
            >
              Back to opportunities <ArrowRight size={16} aria-hidden />
            </Link>
          </section>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between text-xs text-[#64748b] sm:text-sm">
              <span>Question {step} of 4</span>
              <span className="font-medium text-[#07858c]">{progress}% complete</span>
            </div>
            <div
              className="mb-5 h-1.5 overflow-hidden rounded-full bg-[#dcecea]"
              role="progressbar"
              aria-label="Application progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
            >
              <div
                className="h-full rounded-full bg-[#12939b] transition-[width] duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <h2 className="text-base font-medium text-[#475569] sm:text-lg">
              {step === 4 ? (
                <>
                  Which design tools have you used?<span className="text-red-500">*</span>
                </>
              ) : (
                <>
                  {TEXT_QUESTIONS[step - 1].title}
                  <span className="text-red-500">*</span>
                </>
              )}
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-[#64748b] sm:text-sm">
              {step === 4 ? "Select all that apply. It’s completely fine if you’re still learning." : TEXT_QUESTIONS[step - 1].description}
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-1 rounded-2xl border border-[#e8edf0] bg-white p-5 shadow-[0_12px_35px_rgba(27,42,92,0.08)] sm:p-8"
            >
              {step < 4 ? (
                <div className="relative">
                  <label className="sr-only" htmlFor={`application-answer-${step}`}>
                    Your answer
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
                    placeholder="Write your answer here..."
                    aria-invalid={Boolean(error)}
                    aria-describedby="answer-count application-error"
                    className="h-48 w-full resize-y rounded-xl border border-[#cbd0d3] bg-white px-4 pb-9 pt-4 text-sm leading-relaxed text-[#1b2a5c] outline-none transition focus:border-[#12939b] focus:ring-2 focus:ring-[#12939b]/20 sm:h-56 sm:px-5"
                  />
                  <span id="answer-count" className="absolute bottom-3 right-4 text-xs text-[#64748b]">
                    {answers[step - 1].length}/1000
                  </span>
                </div>
              ) : (
                <fieldset>
                  <legend className="sr-only">Select the design tools you have used</legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {DESIGN_TOOLS.map((tool) => (
                      <label
                        key={tool}
                        className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors ${
                          selectedTools.includes(tool)
                            ? "border-[#12939b] bg-[#eaf7f5] text-[#087f87]"
                            : "border-[#e2e6e9] bg-white text-[#475569] hover:border-[#9ccfca]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedTools.includes(tool)}
                          onChange={() => toggleTool(tool)}
                          className="size-4 accent-[#12939b]"
                        />
                        {tool}
                      </label>
                    ))}
                  </div>
                  {selectedTools.includes("Other") && (
                    <label className="mt-4 block text-sm font-medium text-[#475569]">
                      Which other design tools?
                      <input
                        value={otherTool}
                        onChange={(event) => setOtherTool(event.target.value)}
                        placeholder="Optional"
                        className="mt-2 h-11 w-full rounded-lg border border-[#cbd0d3] px-3 text-sm outline-none focus:border-[#12939b] focus:ring-2 focus:ring-[#12939b]/20"
                      />
                    </label>
                  )}
                </fieldset>
              )}

              <p id="application-error" className="mt-3 min-h-5 text-sm text-red-600" role="alert">
                {error}
              </p>
              <div className="mt-3 flex justify-end gap-3">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={goBack}
                    className="inline-flex items-center gap-2 rounded-md border border-[#d5dce1] bg-white px-4 py-2.5 text-sm font-semibold text-[#475569] transition-colors hover:bg-[#f6f8f9]"
                  >
                    <ArrowLeft size={15} aria-hidden /> Back
                  </button>
                )}
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-md bg-[#128b91] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0e747a]"
                >
                  {step === 4 ? "Submit" : "Next"}
                  {step < 4 && <ArrowRight size={15} aria-hidden />}
                  {step === 4 && <ArrowRight size={15} aria-hidden />}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
