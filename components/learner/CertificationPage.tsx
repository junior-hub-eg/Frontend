"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowRight, Award, Check, ExternalLink, FileBadge, Link2, LoaderCircle, Medal, Sparkles } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { getAchievements, type Achievements } from "@/lib/learning-api";
import { getMyCertificates, type Certificate } from "@/lib/recruitment-api";
import { RecruitmentFrame, SimulationBadge } from "./recruitment-ui";
import { certificateTitle } from "@/components/certificates/certificate-title";
import { useT } from "@/lib/i18n/client";
import { dateLocale, tk } from "@/lib/i18n/translate";

const day = (iso: string) => new Date(iso).toLocaleDateString(dateLocale("en-GB"), { day: "numeric", month: "short", year: "numeric" });
const checkPath = (code: string) => `/certificates/${code}`;

function Stat({ icon: Icon, value, label, color }: { icon: typeof Award; value: number | string; label: string; color: string }) {
  return (
    <div className="flex items-center gap-[0.8em] rounded-[1.2em] border border-[#e3e9f0] bg-white p-[1em]">
      <span className="grid h-[2.6em] w-[2.6em] shrink-0 place-items-center rounded-full" style={{ backgroundColor: `${color}22`, color }}>
        <Icon className="h-[1.3em] w-[1.3em]" />
      </span>
      <span>
        <span className="block text-[1.4em] font-extrabold leading-none text-[#14365a]">{value}</span>
        <span className="text-[0.8em] text-[#14365a]/70">{label}</span>
      </span>
    </div>
  );
}

/** What an admin-signed certificate is for. */
const KIND_LABEL: Record<string, string> = {
  CourseLevel: tk("Course level"),
  TrackCompletion: tk("Track completion"),
  Capstone: tk("Capstone project"),
};

function CertificateCard({ certificate }: { certificate: Certificate }) {
  const t = useT();
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${checkPath(certificate.code)}`);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article className="flex flex-col gap-[0.8em] rounded-[1.4em] border-[0.15em] border-[#12939b]/30 bg-gradient-to-br from-[#f2fbfa] to-white p-[1.2em]">
      <div className="flex items-start gap-[0.8em]">
        <span className="grid h-[2.8em] w-[2.8em] shrink-0 place-items-center rounded-full bg-[#fff4d6] text-[#f5a623]">
          <Award className="h-[1.5em] w-[1.5em]" />
        </span>
        <div className="min-w-0 flex-1">
          {!certificate.isSimulation && certificate.kind && KIND_LABEL[certificate.kind] && (
            <span className="mb-[0.3em] inline-block rounded-full bg-[#e3f4f5] px-[0.7em] py-[0.15em] text-[0.7em] font-bold text-[#0f7a81]">
              {t(KIND_LABEL[certificate.kind])}
            </span>
          )}
          <h3 dir="auto" className="text-[1.05em] font-bold leading-snug text-[#14365a]">{certificateTitle(certificate, t)}</h3>
          <p className="text-[0.85em] text-[#14365a]/70">
            {certificate.companyName} · {t(certificate.trackName)}
          </p>
        </div>
        <span className="rounded-full bg-[#d8f0df] px-[0.7em] py-[0.2em] text-[0.8em] font-bold text-[#1f7a43]">{certificate.scorePercent}%</span>
      </div>

      <dl className="flex flex-wrap gap-x-[1.5em] gap-y-[0.3em] text-[0.8em] text-[#14365a]">
        <div>
          <dt className="inline text-[#14365a]/60">{t("Issued")} </dt>
          <dd className="inline font-semibold">{day(certificate.issuedUtc)}</dd>
        </div>
        <div>
          <dt className="inline text-[#14365a]/60">{t("Code")} </dt>
          <dd className="inline font-mono font-bold tracking-wider">{certificate.code}</dd>
        </div>
      </dl>
      <p className={`text-[0.75em] font-semibold ${certificate.isSimulation ? "text-[#a86a00]" : "text-[#1f7a43]"}`}>
        {certificate.isSimulation || !certificate.signerName ? t(certificate.disclaimer) : t("Signed by {name}", { name: certificate.signerName })}
      </p>

      <div className="mt-auto flex flex-wrap gap-[0.6em]">
        <a
          href={checkPath(certificate.code)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-[0.4em] rounded-[0.8em] bg-[#14365a] px-[1em] py-[0.6em] text-[0.85em] font-semibold text-white hover:bg-[#0f2a47]"
        >
          {t("View and print")} <ExternalLink className="h-[1em] w-[1em]" />
        </a>
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex items-center gap-[0.4em] rounded-[0.8em] border border-[#c9d3df] px-[1em] py-[0.6em] text-[0.85em] font-semibold text-[#14365a] hover:bg-[#f3f6f9]"
        >
          {copied ? <Check className="h-[1em] w-[1em]" /> : <Link2 className="h-[1em] w-[1em]" />} {copied ? t("Link copied") : t("Copy check link")}
        </button>
      </div>
    </article>
  );
}

/**
 * Certification: the student's practice certificates from Recruitment Practice (US-40), each with a page anyone can
 * use to check it and print it, and the badges they earned (US-26).
 */
export default function CertificationPage() {
  const t = useT();
  const [certificates, setCertificates] = useState<Certificate[] | null>(null);
  const [achievements, setAchievements] = useState<Achievements | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([getMyCertificates(), getAchievements()]).then(
      ([c, a]) => {
        if (!active) return;
        setCertificates(c);
        setAchievements(a);
      },
      (e) => active && setError(errorMessage(e, "We couldn't load your certificates. Please try again.")),
    );
    return () => {
      active = false;
    };
  }, []);

  const loading = !certificates && !error;
  // The ones the admin signed (a finished course level, track or capstone) come first, apart from the practice ones.
  const earned = certificates?.filter((c) => !c.isSimulation) ?? [];
  const practice = certificates?.filter((c) => c.isSimulation) ?? [];

  return (
    <RecruitmentFrame>
      <section className="flex flex-col gap-[0.4em]">
        <h1 className="text-[2.3em] font-extrabold leading-tight text-[#14365a]">{t("Certification")}</h1>
        <p className="max-w-[40em] text-[0.95em] leading-snug text-[#14365a]">
          {t("Your practice certificates and the badges you earned. Share a certificate's check link so anyone can see it is yours.")}
        </p>
      </section>

      {error && (
        <p role="alert" className="mt-[1.5em] rounded-[0.9em] bg-[#fdecec] px-[1em] py-[0.7em] text-[0.9em] font-semibold text-[#b83232]">
          {error}
        </p>
      )}
      {loading && <LoaderCircle className="mx-auto my-[4em] h-[2em] w-[2em] animate-spin text-[#12939b]" aria-label={t("Loading")} />}

      {certificates && achievements && (
        <>
          <div className="mt-[1.4em] grid gap-[0.8em] sm:grid-cols-3">
            <Stat icon={FileBadge} value={certificates.length} label={certificates.length === 1 ? t("Certificate") : t("Certificates")} color="#12939b" />
            <Stat icon={Medal} value={achievements.badges.length} label={achievements.badges.length === 1 ? t("Badge") : t("Badges")} color="#d4a017" />
            <Stat icon={Sparkles} value={achievements.totalXp} label={t("Total XP")} color="#7c4dff" />
          </div>

          <section className="mt-[2em]">
            <h2 className="mb-[0.3em] text-[1.3em] font-extrabold text-[#14365a]">{t("Course certificates")}</h2>
            <p className="mb-[0.8em] text-[0.85em] text-[#14365a]/70">
              {t("Finish a level of a course (its lessons and its exam) and the admin signs your certificate.")}
            </p>
            {earned.length === 0 ? (
              <p className="rounded-[1.4em] border border-dashed border-[#c9d3df] bg-white p-[1.5em] text-center text-[0.85em] text-[#14365a]/70">
                {t("No course certificates yet.")}
              </p>
            ) : (
              <div className="grid gap-[1em] md:grid-cols-2 xl:grid-cols-3">
                {earned.map((c) => (
                  <CertificateCard key={c.code} certificate={c} />
                ))}
              </div>
            )}
          </section>

          <section className="mt-[2em]">
            <div className="mb-[0.8em] flex flex-wrap items-center gap-[0.6em]">
              <h2 className="text-[1.3em] font-extrabold text-[#14365a]">{t("Practice certificates")}</h2>
              <SimulationBadge />
            </div>
            {practice.length === 0 ? (
              <div className="flex flex-col items-center gap-[0.6em] rounded-[1.4em] border border-dashed border-[#c9d3df] bg-white p-[2em] text-center">
                <Award className="h-[2.4em] w-[2.4em] text-[#c9d3df]" aria-hidden />
                <p className="text-[0.95em] font-bold text-[#14365a]">{t("No certificates yet")}</p>
                <p className="max-w-[28em] text-[0.85em] text-[#14365a]/70">
                  {t("Pass a practice interview in Recruitment Practice with 60% or more to get your first certificate.")}
                </p>
                <Link
                  href={"/learner/recruitment-practice" as Route}
                  className="mt-[0.4em] inline-flex items-center gap-[0.4em] rounded-[0.8em] bg-[#14365a] px-[1.2em] py-[0.6em] text-[0.85em] font-semibold text-white hover:bg-[#0f2a47]"
                >
                  {t("Go to Recruitment Practice")} <ArrowRight className="h-[1em] w-[1em]" />
                </Link>
              </div>
            ) : (
              <div className="grid gap-[1em] md:grid-cols-2 xl:grid-cols-3">
                {practice.map((c) => (
                  <CertificateCard key={c.code} certificate={c} />
                ))}
              </div>
            )}
          </section>

          <section className="mt-[2em]">
            <h2 className="mb-[0.8em] text-[1.3em] font-extrabold text-[#14365a]">{t("Badges")}</h2>
            {achievements.badges.length === 0 ? (
              <p className="rounded-[1.4em] border border-dashed border-[#c9d3df] bg-white p-[1.5em] text-center text-[0.85em] text-[#14365a]/70">
                {t("Pass a lesson linked to school to earn your first badge.")}
              </p>
            ) : (
              <ul className="grid gap-[0.8em] sm:grid-cols-2 xl:grid-cols-3">
                {achievements.badges.map((b) => (
                  <li key={b.code} className="flex items-center gap-[0.8em] rounded-[1.2em] border border-[#e3e9f0] bg-white p-[0.9em]">
                    <span className="grid h-[2.4em] w-[2.4em] shrink-0 place-items-center rounded-full bg-[#fff4d6] text-[#d4a017]">
                      <Medal className="h-[1.3em] w-[1.3em]" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[0.9em] font-bold text-[#14365a]">{t(b.name)}</span>
                      <span className="text-[0.75em] text-[#14365a]/65">{t("Earned {date}", { date: day(b.earnedUtc) })}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </RecruitmentFrame>
  );
}
