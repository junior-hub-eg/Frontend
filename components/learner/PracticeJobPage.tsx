"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Check,
  CheckCircle2,
  ChevronRight,
  Copy,
  ExternalLink,
  LoaderCircle,
  RotateCcw,
  Send,
  Sparkles,
  XCircle,
} from "lucide-react";
import { ApiError, errorMessage } from "@/lib/api-client";
import {
  applyToPracticeJob,
  getPracticeJob,
  submitPracticeInterview,
  verifyCertificate,
  type Certificate,
  type InterviewResult,
  type JobDetail,
} from "@/lib/recruitment-api";
import { ApplicationBadge, Chip, CompanyMark, RecruitmentFrame, SimulationBadge } from "./recruitment-ui";
import { useT } from "@/lib/i18n/client";
import { dateLocale } from "@/lib/i18n/translate";

const LIST = "/learner/recruitment-practice" as Route;

const primaryBtn =
  "inline-flex items-center justify-center gap-[0.4em] rounded-[0.8em] bg-[#14365a] px-[1.3em] py-[0.7em] text-[0.9em] font-semibold text-white transition hover:bg-[#0f2a47] disabled:opacity-50";
const ghostBtn =
  "inline-flex items-center justify-center gap-[0.4em] rounded-[0.8em] border border-[#c9d3df] px-[1.3em] py-[0.7em] text-[0.9em] font-semibold text-[#14365a] transition hover:bg-[#f3f6f9] disabled:opacity-50";
const card = "rounded-[1.4em] border border-[#e3e9f0] bg-white p-[1.4em]";

const day = (iso: string) => new Date(iso).toLocaleDateString(dateLocale("en-GB"), { day: "numeric", month: "long", year: "numeric" });

type View = "overview" | "interview" | "result";

/** US-40: the practice certificate, loaded by its code. Always says it is not a job offer. */
function CertificateCard({ code }: { code: string }) {
  const t = useT();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    verifyCertificate(code).then(
      (c) => active && setCertificate(c),
      () => {},
    );
    return () => {
      active = false;
    };
  }, [code]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section aria-label={t("Practice certificate")} className="relative overflow-hidden rounded-[1.4em] border-[0.2em] border-[#12939b]/40 bg-gradient-to-br from-[#f2fbfa] to-white p-[1.6em] text-center text-[#14365a]">
      <Award className="mx-auto h-[2.6em] w-[2.6em] text-[#f5a623]" aria-hidden />
      <p className="mt-[0.4em] text-[0.75em] font-bold uppercase tracking-[0.2em] text-[#0f7a81]">{t("Practice certificate")}</p>
      {certificate ? (
        <>
          <p className="mt-[0.8em] text-[0.85em]">{t("This certifies that")}</p>
          <p className="text-[1.6em] font-extrabold">{certificate.studentName}</p>
          <p className="mt-[0.3em] text-[0.9em]">
            {t("completed the practice interview for")} <b>{t(certificate.role)}</b> {t("at {company} with a score of", { company: certificate.companyName })}{" "}
            <b>{certificate.scorePercent}%</b>.
          </p>
          <p className="mt-[0.3em] text-[0.8em] text-[#14365a]/70">
            {t(certificate.trackName)} · {day(certificate.issuedUtc)}
          </p>
          <p className="mx-auto mt-[0.9em] max-w-[28em] rounded-[0.7em] bg-[#fff6e8] px-[0.9em] py-[0.4em] text-[0.8em] font-bold text-[#a86a00]">
            {t(certificate.disclaimer)}
          </p>
        </>
      ) : (
        <LoaderCircle className="mx-auto my-[1.2em] h-[1.6em] w-[1.6em] animate-spin text-[#12939b]" aria-label={t("Loading")} />
      )}
      <div className="mt-[1em] flex flex-wrap items-center justify-center gap-[0.6em]">
        <span className="rounded-[0.6em] bg-white px-[0.8em] py-[0.35em] font-mono text-[0.9em] font-bold tracking-wider ring-1 ring-[#e3e9f0]">{code}</span>
        <button type="button" onClick={copy} className="inline-flex items-center gap-[0.3em] text-[0.8em] font-semibold text-[#0f7a81] hover:underline">
          {copied ? <Check className="h-[1em] w-[1em]" /> : <Copy className="h-[1em] w-[1em]" />} {copied ? t("Copied") : t("Copy code")}
        </button>
        <a
          href={`/certificates/${code}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-[0.3em] text-[0.8em] font-semibold text-[#0f7a81] hover:underline"
        >
          <ExternalLink className="h-[1em] w-[1em]" /> {t("View and print")}
        </a>
      </div>
    </section>
  );
}

/** US-38: the 5 questions, one at a time. */
function Interview({
  detail,
  onDone,
  onCancel,
}: {
  detail: JobDetail;
  onDone: (result: InterviewResult) => void;
  onCancel: () => void;
}) {
  const t = useT();
  const { questions } = detail;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const question = questions[index];
  const chosen = answers[index];
  const last = index === questions.length - 1;

  async function submit() {
    setSending(true);
    setError(null);
    try {
      onDone(await submitPracticeInterview(detail.job.id, answers.map((a) => a ?? -1)));
    } catch (e) {
      setError(errorMessage(e, "We couldn't send your answers. Please try again."));
      setSending(false);
    }
  }

  return (
    <section className={card}>
      <div className="flex items-center justify-between gap-[1em]">
        <p className="text-[0.85em] font-semibold text-[#14365a]/70">
          {t("Question {n} of {total}", { n: index + 1, total: questions.length })}
        </p>
        <button type="button" onClick={onCancel} className="text-[0.8em] font-semibold text-[#14365a]/60 hover:underline">
          {t("Leave the interview")}
        </button>
      </div>
      <div className="mt-[0.6em] flex gap-[0.3em]" aria-hidden>
        {questions.map((q, i) => (
          <span key={q.id} className={`h-[0.35em] flex-1 rounded-full ${answers[i] !== null ? "bg-[#12939b]" : i === index ? "bg-[#12939b]/40" : "bg-[#e3e9f0]"}`} />
        ))}
      </div>

      <fieldset className="mt-[1.2em]">
        <legend className="text-[1.25em] font-bold leading-snug text-[#14365a]">{t(question.prompt)}</legend>
        <div className="mt-[1em] grid gap-[0.6em]">
          {question.options.map((option, i) => {
            const selected = chosen === i;
            return (
              <label
                key={option}
                className={`flex cursor-pointer items-center gap-[0.8em] rounded-[0.9em] border px-[1em] py-[0.8em] text-[0.95em] text-[#14365a] transition ${
                  selected ? "border-[#12939b] bg-[#e4f7f4] font-semibold" : "border-[#e3e9f0] hover:bg-[#f3f6f9]"
                }`}
              >
                <input
                  type="radio"
                  name={question.id}
                  checked={selected}
                  onChange={() => setAnswers((a) => a.map((v, j) => (j === index ? i : v)))}
                  className="h-[1.1em] w-[1.1em] accent-[#12939b]"
                />
                {t(option)}
              </label>
            );
          })}
        </div>
      </fieldset>

      {error && (
        <p role="alert" className="mt-[1em] rounded-[0.8em] bg-[#fdecec] px-[0.9em] py-[0.5em] text-[0.85em] font-semibold text-[#b83232]">
          {error}
        </p>
      )}

      <div className="mt-[1.4em] flex flex-wrap justify-between gap-[0.6em]">
        <button type="button" onClick={() => setIndex((i) => i - 1)} disabled={index === 0 || sending} className={ghostBtn}>
          <ArrowLeft className="h-[1.1em] w-[1.1em]" /> {t("Back")}
        </button>
        {last ? (
          <button type="button" onClick={submit} disabled={answers.some((a) => a === null) || sending} className={primaryBtn}>
            {sending ? <LoaderCircle className="h-[1.1em] w-[1.1em] animate-spin" /> : <Send className="h-[1.1em] w-[1.1em]" />} {t("Submit my answers")}
          </button>
        ) : (
          <button type="button" onClick={() => setIndex((i) => i + 1)} disabled={chosen === null} className={primaryBtn}>
            {t("Next")} <ArrowRight className="h-[1.1em] w-[1.1em]" />
          </button>
        )}
      </div>
    </section>
  );
}

/** US-39: the score, pass or not, why each answer was right or wrong, and the certificate on a pass. */
function Result({ result, onRetry }: { result: InterviewResult; onRetry: () => void }) {
  const t = useT();
  const right = result.results.filter((r) => r.correct).length;
  return (
    <div className="flex flex-col gap-[1em]">
      <section className={`${card} flex flex-wrap items-center gap-[1.2em]`}>
        <span
          className={`grid h-[5em] w-[5em] shrink-0 place-items-center rounded-full text-[1.5em] font-extrabold ${
            result.passed ? "bg-[#d8f0df] text-[#1f7a43]" : "bg-[#fff1d6] text-[#a86a00]"
          }`}
        >
          {result.scorePercent}%
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[1.5em] font-extrabold text-[#14365a]">{result.passed ? t("Passed! Well done.") : t("Not passed this time")}</h2>
          <p className="text-[0.9em] text-[#14365a]/80">
            {t("{n} of {total} answers right. You need {percent}% to pass.", { n: right, total: result.results.length, percent: result.passPercent })}
            {!result.passed && ` ${t("Read why below, then try again.")}`}
          </p>
          {result.xpAwarded > 0 && (
            <p className="mt-[0.4em] inline-flex items-center gap-[0.3em] rounded-full bg-[#fff4d6] px-[0.7em] py-[0.2em] text-[0.8em] font-bold text-[#a86a00]">
              <Sparkles className="h-[1em] w-[1em]" /> {t("+{xp} XP", { xp: result.xpAwarded })}
            </p>
          )}
        </div>
        {!result.passed && (
          <button type="button" onClick={onRetry} className={primaryBtn}>
            <RotateCcw className="h-[1.1em] w-[1.1em]" /> {t("Try again")}
          </button>
        )}
      </section>

      {result.certificate && <CertificateCard code={result.certificate.code} />}

      <section className={card}>
        <h2 className="text-[1.1em] font-bold text-[#14365a]">{t("Your answers")}</h2>
        <ol className="mt-[0.8em] grid gap-[0.8em]">
          {result.results.map((r, i) => (
            <li key={r.questionId} className={`rounded-[1em] p-[0.9em] ${r.correct ? "bg-[#eef9f2]" : "bg-[#fdf3f3]"}`}>
              <p className="flex items-start gap-[0.5em] text-[0.9em] font-bold text-[#14365a]">
                {r.correct ? (
                  <CheckCircle2 className="mt-[0.1em] h-[1.1em] w-[1.1em] shrink-0 text-[#1f9d55]" aria-label={t("Right")} />
                ) : (
                  <XCircle className="mt-[0.1em] h-[1.1em] w-[1.1em] shrink-0 text-[#c0392b]" aria-label={t("Wrong")} />
                )}
                {i + 1}. {t(r.prompt)}
              </p>
              <p className="mt-[0.3em] ps-[1.6em] text-[0.85em] text-[#14365a]">
                {t("Your answer: {answer}", { answer: t(r.options[r.chosen]) })}
                {!r.correct && (
                  <>
                    <br />
                    {t("Right answer:")} <b>{t(r.options[r.correctOptionIndex])}</b>
                  </>
                )}
              </p>
              <p className="mt-[0.3em] ps-[1.6em] text-[0.8em] text-[#14365a]/75">{t(r.feedback)}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

/** US-37 to US-40 for one practice job: apply, the interview, the result and the certificate. */
export default function PracticeJobPage({ jobId }: { jobId: string }) {
  const t = useT();
  const [detail, setDetail] = useState<JobDetail | null>(null);
  const [error, setError] = useState<{ message: string; notFound: boolean } | null>(null);
  const [view, setView] = useState<View>("overview");
  const [result, setResult] = useState<InterviewResult | null>(null);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getPracticeJob(jobId).then(
      (d) => active && setDetail(d),
      (e) =>
        active &&
        setError({
          message: errorMessage(e, "We couldn't load this practice job. Please try again."),
          notFound: e instanceof ApiError && (e.status === 404 || e.status === 400),
        }),
    );
    return () => {
      active = false;
    };
  }, [jobId]);

  async function apply() {
    setApplying(true);
    setApplyError(null);
    try {
      setDetail(await applyToPracticeJob(jobId));
    } catch (e) {
      setApplyError(errorMessage(e, "We couldn't send your application. Please try again."));
    } finally {
      setApplying(false);
    }
  }

  async function finish(r: InterviewResult) {
    setResult(r);
    setView("result");
    // The application's status and best score changed.
    setDetail(await getPracticeJob(jobId).catch(() => detail));
  }

  const job = detail?.job;
  const application = job?.myApplication ?? null;

  return (
    <RecruitmentFrame>
      <nav aria-label={t("Breadcrumb")} className="flex flex-wrap items-center gap-[0.5em] text-[0.8em] text-[#14365a]">
        <Link href={LIST} className="font-semibold hover:underline">
          {t("Recruitment Practice")}
        </Link>
        <ChevronRight className="h-[1em] w-[1em]" />
        <span>{t(job?.role ?? "Practice job")}</span>
      </nav>

      {error && (
        <div className="mt-[2em] flex flex-col items-start gap-[0.8em]">
          <p role="alert" className="rounded-[0.9em] bg-[#fdecec] px-[1em] py-[0.7em] text-[0.9em] font-semibold text-[#b83232]">
            {error.notFound ? t("We could not find this practice job.") : error.message}
          </p>
          <Link href={LIST} className={ghostBtn}>
            <ArrowLeft className="h-[1.1em] w-[1.1em]" /> {t("All practice jobs")}
          </Link>
        </div>
      )}
      {!detail && !error && <LoaderCircle className="mx-auto my-[4em] h-[2em] w-[2em] animate-spin text-[#12939b]" aria-label={t("Loading")} />}

      {detail && job && (
        <>
          <header className="mt-[0.8em] flex flex-wrap items-start gap-[1em]">
            <CompanyMark name={job.companyName} className="h-[3.2em] w-[3.2em]" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-[0.5em]">
                <SimulationBadge />
                <ApplicationBadge application={application} />
              </div>
              <h1 className="mt-[0.3em] text-[2em] font-extrabold leading-tight text-[#14365a]">{t(job.role)}</h1>
              <p className="text-[0.95em] text-[#14365a]/75">
                {job.companyName} · {t(job.trackName)} · {t(job.level)}
              </p>
            </div>
          </header>
          <p className="mt-[0.6em] text-[0.8em] font-semibold text-[#a86a00]">{t(detail.disclaimer)}</p>

          <div className="mt-[1.2em]">
            {view === "interview" && detail.questions.length > 0 && (
              <Interview key={application?.attempts ?? 0} detail={detail} onDone={finish} onCancel={() => setView("overview")} />
            )}

            {view === "result" && result && <Result result={result} onRetry={() => setView("interview")} />}

            {view === "overview" && (
              <div className="grid items-start gap-[1em] lg:grid-cols-[1.5fr_1fr]">
                <section className={card}>
                  <h2 className="text-[1.1em] font-bold text-[#14365a]">{t("About this practice job")}</h2>
                  <p className="mt-[0.5em] text-[0.9em] leading-relaxed text-[#14365a]/85">{t(job.description)}</p>
                  <h3 className="mt-[1em] text-[0.9em] font-bold text-[#14365a]">{t("Skills")}</h3>
                  <div className="mt-[0.4em] flex flex-wrap gap-[0.4em]">
                    {job.skills.map((s) => (
                      <Chip key={s}>{s}</Chip>
                    ))}
                  </div>
                  <h3 className="mt-[1em] text-[0.9em] font-bold text-[#14365a]">{t("The interview")}</h3>
                  <ul className="mt-[0.4em] grid gap-[0.3em] text-[0.85em] text-[#14365a]/85">
                    <li>• {t("5 questions about teamwork and the job. Choose one answer for each.")}</li>
                    <li>• {t("You pass with 60% (3 of 5) or more.")}</li>
                    <li>• {t("You get XP the first time you finish it, and a practice certificate when you pass.")}</li>
                    <li>• {t("Not passed? Read why, then try again.")}</li>
                  </ul>
                </section>

                <aside className={`${card} flex flex-col gap-[0.9em]`}>
                  {!application && (
                    <>
                      <h2 className="text-[1.1em] font-bold text-[#14365a]">{t("Ready to apply?")}</h2>
                      <p className="text-[0.85em] text-[#14365a]/80">{t("Your application is sent at once. Then you can start the interview.")}</p>
                      {applyError && (
                        <p role="alert" className="rounded-[0.8em] bg-[#fdecec] px-[0.9em] py-[0.5em] text-[0.8em] font-semibold text-[#b83232]">
                          {applyError}
                        </p>
                      )}
                      <button type="button" onClick={apply} disabled={applying} className={primaryBtn}>
                        {applying ? <LoaderCircle className="h-[1.1em] w-[1.1em] animate-spin" /> : <Send className="h-[1.1em] w-[1.1em]" />} {t("Apply")}
                      </button>
                    </>
                  )}

                  {application && application.status !== "InterviewPassed" && (
                    <>
                      <h2 className="text-[1.1em] font-bold text-[#14365a]">
                        {application.status === "Applied" ? t("You applied!") : t("Ready to try again?")}
                      </h2>
                      <p className="text-[0.85em] text-[#14365a]/80">
                        {application.status === "Applied"
                          ? t("The next step is the interview: 5 questions, and 60% passes.")
                          : t("Your best score so far is {n}%. You need 60% to pass.", { n: application.bestScorePercent })}
                      </p>
                      <button type="button" onClick={() => setView("interview")} className={primaryBtn}>
                        {application.status === "Applied" ? t("Start the interview") : t("Try the interview again")} <ArrowRight className="h-[1.1em] w-[1.1em]" />
                      </button>
                    </>
                  )}

                  {application?.status === "InterviewPassed" && (
                    <>
                      <h2 className="text-[1.1em] font-bold text-[#14365a]">{t("You passed this interview")}</h2>
                      <p className="text-[0.85em] text-[#14365a]/80">
                        {application.attempts === 1
                          ? t("Best score {n}% in 1 try.", { n: application.bestScorePercent })
                          : t("Best score {n}% in {tries} tries.", { n: application.bestScorePercent, tries: application.attempts })}
                      </p>
                    </>
                  )}
                </aside>

                {application?.certificate && (
                  <div className="lg:col-span-2">
                    <CertificateCard code={application.certificate.code} />
                  </div>
                )}
              </div>
            )}
          </div>

          {view === "result" && (
            <Link href={LIST} className={`${ghostBtn} mt-[1em]`}>
              <ArrowLeft className="h-[1.1em] w-[1.1em]" /> {t("All practice jobs")}
            </Link>
          )}
        </>
      )}
    </RecruitmentFrame>
  );
}
