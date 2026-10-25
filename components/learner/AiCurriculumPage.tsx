"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";

const IMG = "/images/Intern/AI%20Curriculum";

/** Subjects from the Figma. `href` is set only for subjects that are built. */
const SUBJECTS: {
  title: string;
  desc: string;
  img: string;
  w: number;
  h: number;
  bg: string;
  href?: Route;
}[] = [
  {
    title: tk("Mathematics"),
    desc: tk("Solve problems step by step with AI videos, interactive simulations, and live coding."),
    img: `${IMG}/image%2038.png`,
    w: 523,
    h: 396,
    bg: "#eaf3fd",
    href: "/learner/ai-curriculum/mathematics" as Route,
  },
  {
    title: tk("Arabic Language"),
    desc: tk("Learn and practice grammar analysis and writing with AI explanations, interactive exercises and real examples."),
    img: `${IMG}/arabic.png`,
    w: 780,
    h: 380,
    bg: "#ffffff",
    href: "/learner/ai-curriculum/arabic" as Route,
  },
  {
    title: tk("Physics"),
    desc: tk("Explore physics concepts with AI-guided videos, interactive experiments, and real-time coding."),
    img: `${IMG}/image%2039.png`,
    w: 451,
    h: 301,
    bg: "#ddf5f7",
  },
  {
    title: tk("Chemistry"),
    desc: tk("Understand chemistry concepts with AI explanations, virtual labs, and interactive problem solving."),
    img: `${IMG}/chemistry.png`,
    w: 780,
    h: 380,
    bg: "#ffffff",
  },
];

const ARROW_CLASS =
  "grid h-[4em] w-[4em] shrink-0 place-items-center rounded-full bg-[#14365a] text-white";

/** The Figma "AI Curriculum" page, inside the learner shell (it places itself next to the sidebar, like Courses). */
export default function AiCurriculumPage() {
  const t = useT();
  return (
    <div className="relative -ms-[4rem] min-h-[calc(100svh-5rem)] min-w-0 flex-1 bg-[#fbfdff] lg:absolute lg:inset-0 lg:ms-0 lg:min-h-0">
      <div
        className="relative min-w-0 pb-8 ps-[4.75rem] pe-3 pt-2 sm:pe-4 lg:absolute lg:inset-0 lg:overflow-y-auto lg:pb-[calc(var(--u)*2)] lg:ps-[var(--hl)] lg:pe-[calc(var(--u)*1.6)] lg:pt-[calc(var(--u)*6.5)]"
        style={{ fontSize: "clamp(11px, calc(var(--u) * 1.05), 17px)" }}
      >
        {/* Title + banner */}
        <section className="flex flex-col gap-[0.8em] lg:flex-row lg:items-center">
          <div className="shrink-0">
            <h1 className="text-[2.3em] font-extrabold leading-tight text-[#14365a]">{t("AI Curriculum")}</h1>
            <p className="max-w-[17em] text-[0.95em] leading-snug text-[#14365a]">{t("Choose a Subject to start solving problems with ai.")}</p>
          </div>
          <div className="relative aspect-[751/121] w-full min-w-0 lg:ms-auto lg:w-[54%]">
            <Image src={`${IMG}/Group%20189.png`} alt="" fill priority sizes="(max-width: 1024px) 90vw, 50vw" className="object-cover object-right" />
          </div>
        </section>

        {/* Subjects */}
        <ul className="mt-[2.6em] grid gap-[1em] md:grid-cols-2 lg:px-[1.8em]">
          {SUBJECTS.map((s) => (
            <li
              key={s.title}
              className={`relative flex flex-col overflow-hidden rounded-[1.8em] ${s.bg === "#ffffff" ? "border border-[#e3e9f0]" : ""} ${s.href ? "transition hover:shadow-lg" : ""}`}
              style={{ backgroundColor: s.bg }}
            >
              <div className="relative aspect-[523/396] w-full">
                <Image src={s.img} alt="" fill sizes="(max-width: 768px) 90vw, 40vw" className="object-contain" />
              </div>
              <div className="flex items-end gap-[1em] px-[1.5em] pb-[2.4em] pt-[1em]">
                <div className="min-w-0 flex-1">
                  <h2 className="text-[2.1em] font-extrabold leading-tight text-[#14365a]">{t(s.title)}</h2>
                  <p className="mt-[0.6em] text-[0.95em] leading-snug text-[#14365a]">{t(s.desc)}</p>
                </div>
                {s.href ? (
                  // The ::after layer stretches this link over the whole card, so clicking anywhere opens the page.
                  <Link
                    href={s.href}
                    aria-label={t("Open {name}", { name: t(s.title) })}
                    className={`${ARROW_CLASS} transition hover:brightness-125 after:absolute after:inset-0 after:content-['']`}
                  >
                    <ArrowRight className="h-[1.8em] w-[1.8em]" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    title={t("Coming soon")}
                    aria-label={t("Open {name} (coming soon)", { name: t(s.title) })}
                    className={`${ARROW_CLASS} disabled:cursor-not-allowed`}
                  >
                    <ArrowRight className="h-[1.8em] w-[1.8em]" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}