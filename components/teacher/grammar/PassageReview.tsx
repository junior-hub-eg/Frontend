"use client";

import { useEffect, useMemo, useState } from "react";
import { CircleAlert, History, LoaderCircle, Save, Send, Trash2 } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import {
  deleteTeacherPassage,
  publishTeacherPassage,
  updateTeacherPassage,
  type GrammarPassage,
  type ParsedSentence,
  type ParsedWord,
} from "@/lib/grammar-api";
import { Card, FieldLabel, formatDate, inputClass } from "@/components/teacher/teacher-ui";
import { ColorLegend, ConfirmDialog, WordChip, WordEditorDialog } from "./grammar-parts";

const sameWord = (a: ParsedWord, b: ParsedWord) =>
  a.role === b.role && a.case === b.case && a.sign === b.sign && a.explanation === b.explanation && a.color === b.color;

export function StatusChip({ passage }: { passage: GrammarPassage }) {
  const t = useT();
  if (!passage.isPublished) {
    return <span className="shrink-0 rounded-full bg-[#fff1d6] px-2 py-0.5 text-[9px] font-semibold text-[#a86400]">{t("Under review")}</span>;
  }
  return (
    <span className="shrink-0 rounded-full bg-[#c9f1f0] px-2 py-0.5 text-[9px] font-semibold text-[#14757d]">
      {passage.grade != null ? t("Published to Grade {grade}", { grade: passage.grade }) : t("Published")}
    </span>
  );
}

/**
 * The review editor (US-13): every sentence with its words as colored chips. A click opens the word's parsing;
 * edits stay local until "Save corrections" (which sends a published passage back to review), then "Publish to students".
 */
export function PassageReview({
  passage,
  onSaved,
  onDeleted,
  onDirtyChange,
  toast,
}: {
  passage: GrammarPassage;
  onSaved: (p: GrammarPassage) => void;
  onDeleted: (id: string) => void;
  onDirtyChange: (dirty: boolean) => void;
  toast: (text: string) => void;
}) {
  const t = useT();
  const [title, setTitle] = useState(passage.title);
  const [draft, setDraft] = useState<ParsedSentence[]>(passage.sentences);
  const [editing, setEditing] = useState<{ s: number; w: number } | null>(null);
  const [confirm, setConfirm] = useState<"publish" | "delete" | null>(null);
  const [busy, setBusy] = useState<"save" | "publish" | "delete" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const changedCount = useMemo(
    () =>
      draft.reduce(
        (n, s, si) => n + s.words.filter((w, wi) => !passage.sentences[si]?.words[wi] || !sameWord(w, passage.sentences[si].words[wi])).length,
        0,
      ),
    [draft, passage.sentences],
  );
  const dirty = changedCount > 0 || title.trim() !== passage.title;

  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  function applyWord(s: number, w: number, word: ParsedWord) {
    setDraft((d) => d.map((sent, si) => (si !== s ? sent : { ...sent, words: sent.words.map((x, wi) => (wi === w ? word : x)) })));
    setEditing(null);
  }

  async function save() {
    setError(null);
    setBusy("save");
    try {
      const saved = await updateTeacherPassage(passage.id, { title: title.trim() || undefined, sentences: draft });
      setTitle(saved.title);
      setDraft(saved.sentences);
      onSaved(saved);
      toast(passage.isPublished ? t("Corrections saved. The passage is back under review.") : t("Corrections saved."));
    } catch (e) {
      setError(errorMessage(e, tk("We couldn't save the corrections. Please try again.")));
    } finally {
      setBusy(null);
    }
  }

  async function publish() {
    setError(null);
    setBusy("publish");
    try {
      const published = await publishTeacherPassage(passage.id);
      setConfirm(null);
      onSaved(published);
      toast(t("Published to your students."));
    } catch (e) {
      setError(errorMessage(e, tk("We couldn't publish the passage. Please try again.")));
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    setError(null);
    setBusy("delete");
    try {
      await deleteTeacherPassage(passage.id);
      setConfirm(null);
      onDeleted(passage.id);
      toast(t("Passage deleted."));
    } catch (e) {
      setError(errorMessage(e, tk("We couldn't delete the passage. Please try again.")));
      setBusy(null);
    }
  }

  const editingWord = editing ? draft[editing.s]?.words[editing.w] : null;

  return (
    <Card className="grid gap-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <FieldLabel label={t("Title")}>
            <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={150} dir="auto" />
          </FieldLabel>
          <p className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] text-[#1B2D54]/60">
            <StatusChip passage={passage} />
            <span>{t("Added {date}", { date: formatDate(passage.createdUtc) })}</span>
            {passage.publishedUtc && passage.isPublished && <span>{t("Published {date}", { date: formatDate(passage.publishedUtc) })}</span>}
          </p>
        </div>
      </div>

      <ColorLegend />
      <p className="text-[10px] text-[#1B2D54]/60">{t("Click a word to correct its role, case, sign or color.")}</p>

      {draft.length === 0 ? (
        <p className="rounded-xl bg-[#f6f9f8] px-4 py-6 text-center text-[11px] text-[#1B2D54]/60">{t("The AI found no sentences in this passage.")}</p>
      ) : (
        <ol className="grid gap-3">
          {draft.map((sentence, si) => (
            <li key={si} className="rounded-xl border border-[#e3ece9] bg-[#fbfdfc] p-3">
              <p dir="rtl" className="mb-2 text-[12px] leading-relaxed text-[#1B2D54]/70">
                {sentence.text}
              </p>
              <div dir="rtl" className="flex flex-wrap gap-1.5">
                {sentence.words.map((w, wi) => {
                  const orig = passage.sentences[si]?.words[wi];
                  return <WordChip key={wi} word={w} changed={!orig || !sameWord(w, orig)} onClick={() => setEditing({ s: si, w: wi })} />;
                })}
              </div>
            </li>
          ))}
        </ol>
      )}

      <p className="flex items-start gap-1.5 rounded-lg bg-[#f0f8f7] px-3 py-2 text-[10px] text-[#14757d]">
        <History className="mt-px size-3.5 shrink-0" />
        {t("Every change you make is logged so the admin can improve the AI.")}
      </p>

      {dirty && passage.isPublished && (
        <p className="flex items-start gap-1.5 rounded-lg bg-[#fff6e5] px-3 py-2 text-[10px] text-[#a86400]">
          <CircleAlert className="mt-px size-3.5 shrink-0" />
          {t("Saving sends this passage back to review; your students won't see it until you publish it again.")}
        </p>
      )}

      {error && !confirm && (
        <p role="alert" className="rounded-lg bg-[#fdecec] px-3 py-2 text-[11px] font-semibold text-[#c81e1e]">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setError(null);
            setConfirm("delete");
          }}
          disabled={busy !== null}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#fde8e8] px-4 py-2 text-[11px] font-semibold text-[#c81e1e] disabled:opacity-60"
        >
          <Trash2 className="size-3.5" /> {t("Delete")}
        </button>
        <span className="ms-auto text-[10px] text-[#1B2D54]/60">{changedCount > 0 && t("{count} words corrected", { count: changedCount })}</span>
        <button
          type="button"
          onClick={save}
          disabled={!dirty || busy !== null}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#14757d] px-4 py-2 text-[11px] font-semibold text-[#14757d] disabled:opacity-50"
        >
          {busy === "save" ? <LoaderCircle className="size-3.5 animate-spin" /> : <Save className="size-3.5" />} {t("Save corrections")}
        </button>
        {!passage.isPublished && (
          <button
            type="button"
            onClick={() => {
              setError(null);
              setConfirm("publish");
            }}
            disabled={dirty || busy !== null || draft.length === 0}
            title={dirty ? t("Save your corrections first.") : undefined}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#14757d] px-4 py-2 text-[11px] font-semibold text-white hover:bg-[#0f6169] disabled:opacity-50"
          >
            <Send className="size-3.5 rtl:-scale-x-100" /> {t("Publish to students")}
          </button>
        )}
      </div>
      {dirty && !passage.isPublished && <p className="-mt-2 text-end text-[10px] text-[#1B2D54]/60">{t("Save your corrections first.")}</p>}

      {editing && editingWord && (
        <WordEditorDialog
          word={editingWord}
          original={passage.sentences[editing.s]?.words[editing.w] ?? null}
          onApply={(w) => applyWord(editing.s, editing.w, w)}
          onClose={() => setEditing(null)}
        />
      )}

      {confirm === "publish" && (
        <ConfirmDialog
          title={t("Publish to students?")}
          confirmLabel={t("Publish")}
          busy={busy === "publish"}
          error={error}
          onConfirm={publish}
          onClose={() => setConfirm(null)}
        >
          {passage.grade != null
            ? t("Your Grade {grade} students will see this passage with its colors and explanations.", { grade: passage.grade })
            : t("Your students will see this passage with its colors and explanations.")}
        </ConfirmDialog>
      )}
      {confirm === "delete" && (
        <ConfirmDialog
          title={t("Delete this passage?")}
          confirmLabel={t("Delete")}
          danger
          busy={busy === "delete"}
          error={error}
          onConfirm={remove}
          onClose={() => setConfirm(null)}
        >
          {passage.isPublished ? t("Your students will no longer see it. This can't be undone.") : t("This can't be undone.")}
        </ConfirmDialog>
      )}
    </Card>
  );
}
