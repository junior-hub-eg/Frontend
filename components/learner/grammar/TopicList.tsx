"use client";

import { BookOpen, ChevronLeft, Star } from "lucide-react";
import type { GrammarTopic } from "@/lib/grammar-api";
import { useI18n } from "@/lib/i18n/client";
import { CARD, StatusChip } from "./shared";

/** "دروس النحو العربي": the topics from the API with their number, title and status. */
export default function TopicList({
  topics,
  selected,
  onSelect,
}: {
  topics: GrammarTopic[];
  selected: string | null;
  onSelect: (key: string) => void;
}) {
  const { t, locale } = useI18n();
  return (
    <aside className={`${CARD} flex flex-col p-[1em]`}>
      <header className="flex items-start gap-[0.7em]">
        <span className="grid h-[2.6em] w-[2.6em] shrink-0 place-items-center rounded-[0.8em] bg-[#e6f2fd] text-[#1d5fb8]">
          <BookOpen className="h-[1.5em] w-[1.5em]" />
        </span>
        <div className="min-w-0">
          <h2 className="text-[1.15em] font-extrabold text-[#14365a]">{t("Arabic Grammar Lessons")}</h2>
          <p className="text-[0.75em] text-[#5b7089]">{t("Follow your journey to mastering Arabic grammar rules")}</p>
        </div>
      </header>

      <ul className="mt-[1em] flex flex-col gap-[0.55em]">
        {topics.map((tp, i) => {
          const active = tp.key === selected;
          return (
            <li key={tp.key}>
              <button
                type="button"
                onClick={() => onSelect(tp.key)}
                aria-current={active}
                className={`flex w-full items-center gap-[0.7em] rounded-[0.9em] border px-[0.7em] py-[0.6em] text-start transition ${
                  active
                    ? "border-[#2bb8a6] bg-[#e4f7f4] shadow-sm"
                    : "border-[#e8eef3] bg-white hover:bg-[#f5fafc]"
                }`}
              >
                <span
                  className={`grid h-[2em] w-[2em] shrink-0 place-items-center rounded-full text-[0.9em] font-bold ${
                    active ? "bg-[#1f9e95] text-white" : "bg-[#eef3f7] text-[#14365a]"
                  }`}
                >
                  {i + 1}
                </span>
                <span dir="auto" className="min-w-0 flex-1 truncate text-[0.88em] font-bold text-[#14365a]">
                  {locale === "ar" || !tp.titleEn ? tp.titleAr : tp.titleEn}
                </span>
                <StatusChip status={tp.status} />
                <ChevronLeft className="h-[1em] w-[1em] shrink-0 text-[#8a9bb0] ltr:rotate-180" />
              </button>
            </li>
          );
        })}
      </ul>

      <footer className="mt-auto flex items-end justify-between gap-[0.6em] pt-[1.2em]">
        <span aria-hidden className="text-[2.6em] leading-none">📚</span>
        <p className="flex items-start gap-[0.3em] text-[0.78em] font-semibold text-[#14365a]">
          <Star className="mt-[0.15em] h-[1em] w-[1em] shrink-0 fill-[#f6c445] text-[#f6c445]" />
          {t("A small step leads you to great mastery")}
        </p>
      </footer>
    </aside>
  );
}
