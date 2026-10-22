"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: tk("Is there an internship opportunity after completing the course?"),
    answer: tk("Absolutely! We provide an internship program for students who finish the course path. Selection depends on your performance and project submissions."),
  },
  {
    question: tk("Do I need any previous experience to join?"),
    answer: tk("No prior work experience is required. Our curriculum is structured to guide motivated learners through real-world software squads from scratch."),
  },
  {
    question: tk("Are the certificates officially recognized?"),
    answer: tk("Yes, every graduation certificate is digitally verifiable and accredited through Junior Hub industry partners."),
  },
  {
    question: tk("What qualifications are required to apply for the internship?"),
    answer: tk("You should finish the foundational skill assessment and demonstrate consistent weekly code commits and collaboration."),
  },
  {
    question: tk("Is the internship guaranteed for every course graduate?"),
    answer: tk("Squad matching is merit-based. Top performers from assessments and mock interviews receive direct placements."),
  },
  {
    question: tk("Will the internship be compensated?"),
    answer: tk("Select partner positions provide monthly stipends, and all interns receive free mentorship, portfolio reviews, and hiring network referrals."),
  },
];

export function FaqAccordion() {
  const t = useT();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="mx-auto max-w-4xl px-6">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-[#12939b]">
            {t("QUESTIONS")}
          </span>
          <h2 className="mt-2 text-3xl font-extrabold text-[#1b2a5c] sm:text-4xl">
            {t("Frequently Asked Questions")}
          </h2>
          <p className="mt-2 text-xs text-[#1b2a5c]/60 sm:text-sm">
            {t("Everything you need to know before you start")}
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.question}
                className="overflow-hidden rounded-2xl border border-black/8 bg-white transition-all shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="flex w-full items-center justify-between p-4 text-start transition-colors hover:bg-slate-50/50 sm:p-5"
                >
                  <span className="text-xs font-semibold text-[#1b2a5c] sm:text-sm">
                    {t(faq.question)}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-[#12939b] transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-black/5 px-4 pb-4 pt-2 text-xs leading-relaxed text-[#1b2a5c]/75 sm:px-5 sm:text-sm">
                    {t(faq.answer)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
