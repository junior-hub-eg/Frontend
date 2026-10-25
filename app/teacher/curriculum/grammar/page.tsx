"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpenText, ChevronRight } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { getTeacherPassages, type GrammarPassage } from "@/lib/grammar-api";
import { cn } from "@/lib/utils";
import { Card, LoadBlock, formatDate, useTeacherData } from "@/components/teacher/teacher-ui";
import { useToast } from "@/components/teacher/teacher-dialogs";
import { AddPassagePanel } from "@/components/teacher/grammar/AddPassagePanel";
import { PassageReview, StatusChip } from "@/components/teacher/grammar/PassageReview";
import { ConfirmDialog } from "@/components/teacher/grammar/grammar-parts";

type Tab = "review" | "published";

const TABS: { key: Tab; label: string }[] = [
  { key: "review", label: tk("Under review") },
  { key: "published", label: tk("Published") },
];

/** The Arabic grammar coach for teachers (US-13): add a photographed passage, review the AI's parsing, publish it. */
export default function TeacherGrammarPage() {
  const t = useT();
  const passages = useTeacherData(getTeacherPassages, tk("We couldn't load your passages. Please try again."));
  const [tab, setTab] = useState<Tab>("review");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const dirtyRef = useRef(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  const onDirtyChange = useCallback((dirty: boolean) => {
    dirtyRef.current = dirty;
  }, []);

  const list = passages.data ?? [];
  const shown = list.filter((p) => (tab === "published" ? p.isPublished : !p.isPublished));
  const selected = list.find((p) => p.id === selectedId) ?? null;
  const counts = { review: list.filter((p) => !p.isPublished).length, published: list.filter((p) => p.isPublished).length };

  function open(id: string) {
    dirtyRef.current = false;
    setSelectedId(id);
    setPending(null);
    requestAnimationFrame(() => {
      if (window.matchMedia("(max-width: 1023px)").matches) editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function select(id: string) {
    if (id === selectedId) return;
    if (dirtyRef.current) setPending(id);
    else open(id);
  }

  function replace(p: GrammarPassage) {
    passages.setData((all) => (all ? all.map((x) => (x.id === p.id ? p : x)) : all));
    setTab(p.isPublished ? "published" : "review");
  }

  function added(p: GrammarPassage) {
    passages.setData((all) => [p, ...(all ?? [])]);
    setTab("review");
    open(p.id);
    toast.show(t("The AI parsed the passage. Review it before publishing."));
  }

  function deleted(id: string) {
    passages.setData((all) => (all ? all.filter((x) => x.id !== id) : all));
    dirtyRef.current = false;
    setSelectedId(null);
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 pb-6 pt-4 font-[family-name:var(--font-poppins)] text-[#1B2D54]">
      <header>
        <Link href="/teacher/curriculum" className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#14757d] hover:underline">
          <ArrowLeft className="size-3.5 rtl:rotate-180" /> {t("Back to curriculum")}
        </Link>
        <h1 className="mt-2 text-xl font-bold leading-tight sm:text-2xl">{t("Arabic grammar coach")}</h1>
        <p className="mt-1 max-w-2xl text-[11px] text-[#1B2D54]/60">
          {t("Photograph a grammar passage; the AI parses it and you review it before your students see it")}
        </p>
      </header>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <div className="grid min-w-0 gap-4">
          <AddPassagePanel onAdded={added} />

          <Card>
            <div className="flex gap-1 rounded-full bg-[#eef2f1] p-1" role="tablist">
              {TABS.map((x) => (
                <button
                  key={x.key}
                  type="button"
                  role="tab"
                  aria-selected={tab === x.key}
                  onClick={() => setTab(x.key)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors",
                    tab === x.key ? "bg-white text-[#14757d] shadow-sm" : "text-[#1B2D54]/60 hover:text-[#1B2D54]",
                  )}
                >
                  {t(x.label)}
                  {passages.data && <span className="rounded-full bg-[#e3ece9] px-1.5 text-[9px] text-[#1B2D54]/70">{counts[x.key]}</span>}
                </button>
              ))}
            </div>

            {!passages.data ? (
              <LoadBlock error={passages.error} onRetry={passages.reload} />
            ) : shown.length === 0 ? (
              <p className="px-2 py-8 text-center text-[11px] text-[#1B2D54]/60">
                {tab === "review" ? t("No passages under review. Add one above.") : t("No published passages yet.")}
              </p>
            ) : (
              <ul className="mt-3 grid gap-2">
                {shown.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => select(p.id)}
                      aria-current={p.id === selectedId}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-start transition-colors",
                        p.id === selectedId ? "border-[#14757d] bg-[#f0f8f7]" : "border-[#e3ece9] hover:bg-[#f6f9f8]",
                      )}
                    >
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#e3ece9] text-[#14757d]">
                        <BookOpenText className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span dir="auto" className="block truncate text-[12px] font-semibold">
                          {p.title || t("Untitled passage")}
                        </span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px] text-[#1B2D54]/60">
                          <StatusChip passage={p} />
                          <span>{t("{count} sentences", { count: p.sentences.length })}</span>
                          <span>{formatDate(p.createdUtc)}</span>
                        </span>
                      </span>
                      <ChevronRight className="size-4 shrink-0 text-[#1B2D54]/40 rtl:rotate-180" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div ref={editorRef} className="min-w-0 scroll-mt-4">
          {selected ? (
            <PassageReview
              key={selected.id}
              passage={selected}
              onSaved={replace}
              onDeleted={deleted}
              onDirtyChange={onDirtyChange}
              toast={toast.show}
            />
          ) : (
            <Card className="grid place-items-center gap-2 py-14 text-center">
              <BookOpenText className="size-8 text-[#14757d]/60" />
              <p className="text-[12px] font-semibold">{t("Choose a passage to review")}</p>
              <p className="max-w-sm text-[10px] text-[#1B2D54]/60">
                {t("Check the AI's parsing word by word, correct what it got wrong, then publish it to your students.")}
              </p>
            </Card>
          )}
        </div>
      </div>

      {pending && (
        <ConfirmDialog title={t("Discard your corrections?")} confirmLabel={t("Discard")} danger onConfirm={() => open(pending)} onClose={() => setPending(null)}>
          {t("You have corrections that are not saved yet.")}
        </ConfirmDialog>
      )}
      {toast.node}
    </div>
  );
}
