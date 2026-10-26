"use client";

import { useCallback, useEffect, useState } from "react";
import { BadgeCheck, Camera, Eye, EyeOff, ImageUp, Sparkles, X } from "lucide-react";
import { addStudentPassage, getStudentPassages, WORD_COLOR, type GrammarPassage, type ParsedWord } from "@/lib/grammar-api";
import { useI18n } from "@/lib/i18n/client";
import { dateLocale } from "@/lib/i18n/translate";
import { ColorLegend, ErrorBox, PRIMARY_BTN, SOFT_BTN, Spinner } from "./shared";

const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = ["image/png", "image/jpeg", "image/webp"];

function readBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).replace(/^data:[^,]*,/, ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * One parsed sentence (US-12): each word with its إعراب under it, in the case color. With the إعراب hidden, the student
 * tries first and taps a word to check it. Tapping a word shows its full إعراب and the reason.
 */
function ParsedSentenceView({ words, showRoles }: { words: ParsedWord[]; showRoles: boolean }) {
  const { t } = useI18n();
  const [open, setOpen] = useState<number | null>(null);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const w = open == null ? null : words[open];
  return (
    <div>
      <div dir="rtl" className="flex flex-wrap gap-[0.45em]">
        {words.map((word, i) => {
          const visible = showRoles || revealed.has(i);
          return (
            <button
              key={i}
              type="button"
              onClick={() => {
                setOpen(open === i ? null : i);
                setRevealed((r) => new Set(r).add(i));
              }}
              aria-expanded={open === i}
              className={`flex min-w-[4.2em] flex-col items-center rounded-[0.7em] px-[0.6em] py-[0.35em] ring-1 transition ${
                WORD_COLOR[word.color] ?? WORD_COLOR.gray
              } ${open === i ? "ring-2 ring-[#14365a]" : ""}`}
            >
              <span className="text-[1.15em] font-bold leading-snug">{word.word}</span>
              <span className={`mt-[0.15em] max-w-[11em] text-center text-[0.68em] font-semibold leading-tight ${visible ? "" : "opacity-0"}`}>
                {visible ? word.role : "؟"}
              </span>
            </button>
          );
        })}
      </div>
      {w && (
        <div dir="rtl" className="mt-[0.5em] rounded-[0.9em] bg-white p-[0.8em] text-[0.85em] text-[#14365a] ring-1 ring-[#e3eef5]">
          <p className="font-extrabold">
            {w.word}: <span className="font-semibold">{w.role}</span>
          </p>
          {(w.case || w.sign) && (
            <p className="mt-[0.2em] text-[#5b7089]">
              {[w.case, w.sign].filter(Boolean).join(" - ")}
            </p>
          )}
          {w.explanation && <p className="mt-[0.3em] leading-relaxed">{w.explanation}</p>}
          <button type="button" onClick={() => setOpen(null)} className="mt-[0.4em] text-[0.8em] font-semibold text-[#1f9e95] hover:underline">
            {t("Close")}
          </button>
        </div>
      )}
    </div>
  );
}

function PassageView({ passage, startShown = true }: { passage: GrammarPassage; startShown?: boolean }) {
  const { t } = useI18n();
  const [showRoles, setShowRoles] = useState(startShown);
  return (
    <article className="rounded-[1em] border border-[#e3eef5] bg-white p-[0.9em]">
      <header className="flex flex-wrap items-center justify-between gap-[0.5em]">
        <h4 dir="auto" className="text-[0.95em] font-extrabold text-[#14365a]">{passage.title || t("Passage with no title")}</h4>
        {passage.byTeacher ? (
          <span className="inline-flex items-center gap-[0.3em] rounded-full bg-[#e3f6ec] px-[0.7em] py-[0.15em] text-[0.7em] font-semibold text-[#11704a]">
            <BadgeCheck className="h-[1.1em] w-[1.1em]" />
            {t("Reviewed by your teacher")}
          </span>
        ) : (
          <span className="inline-flex items-center gap-[0.3em] rounded-full bg-[#fff8ef] px-[0.7em] py-[0.15em] text-[0.7em] font-semibold text-[#8a4b12]">
            <Sparkles className="h-[1.1em] w-[1.1em]" />
            {t("Automatic parsing, not reviewed yet")}
          </span>
        )}
      </header>
      <p className="mt-[0.2em] text-[0.7em] text-[#8a9bb0]">
        {new Date(passage.publishedUtc ?? passage.createdUtc).toLocaleDateString(dateLocale("en-GB"), { day: "numeric", month: "short", year: "numeric" })}
      </p>
      <div className="mt-[0.6em] flex flex-wrap items-center justify-between gap-[0.5em]">
        <p className="text-[0.75em] text-[#5b7089]">
          {showRoles ? t("Tap a word to see its full إعراب and why.") : t("Try it yourself: say each word's إعراب, then tap it to check.")}
        </p>
        <button type="button" className={SOFT_BTN} onClick={() => setShowRoles((v) => !v)}>
          {showRoles ? <EyeOff className="h-[1.1em] w-[1.1em]" /> : <Eye className="h-[1.1em] w-[1.1em]" />}
          {showRoles ? t("Parse it myself first") : t("Show the إعراب")}
        </button>
      </div>
      <div className="mt-[0.6em] space-y-[0.8em]">
        {passage.sentences.map((s, i) => (
          <ParsedSentenceView key={i} words={s.words} showRoles={showRoles} />
        ))}
      </div>
    </article>
  );
}

/** "صوّر قطعة نحو": photograph or paste a passage, get it parsed word by word, and see past passages (US-13). */
export default function PassagesDialog({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const [passages, setPassages] = useState<GrammarPassage[] | null>(null);
  const [listError, setListError] = useState<unknown>(null);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [added, setAdded] = useState<GrammarPassage | null>(null);

  const load = useCallback(async () => {
    setListError(null);
    try {
      setPassages(await getStudentPassages());
    } catch (e) {
      setListError(e);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading the list when the dialog opens
    void load();
  }, [load]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const pick = (f: File | undefined) => {
    setFileError("");
    if (!f) return setFile(null);
    if (!TYPES.includes(f.type)) return setFileError(t("Choose a PNG, JPEG or WebP image."));
    if (f.size > MAX_BYTES) return setFileError(t("The image must be 5 MB or smaller."));
    setFile(f);
  };

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const p = await addStudentPassage({
        title: title.trim() || undefined,
        text: file ? undefined : text.trim(),
        imageBase64: file ? await readBase64(file) : undefined,
        mimeType: file?.type,
      });
      setAdded(p);
      setPassages((list) => [p, ...(list ?? []).filter((x) => x.id !== p.id)]);
      setTitle("");
      setText("");
      setFile(null);
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };

  const canSend = !busy && (!!file || text.trim().length > 0);
  const teacherPassages = (passages ?? []).filter((p) => p.byTeacher);
  const ownPassages = (passages ?? []).filter((p) => !p.byTeacher && p.id !== added?.id);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#14365a]/40 p-[0.5em] sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("Photograph a grammar passage")}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92svh] w-full max-w-[46em] flex-col overflow-hidden rounded-[1.4em] bg-[#fbfdff] shadow-2xl"
        style={{ fontSize: "clamp(12px, 1.05vw, 16px)" }}
      >
        <header className="flex items-center justify-between gap-[0.6em] border-b border-[#e3eef5] px-[1.2em] py-[0.9em]">
          <h2 className="flex items-center gap-[0.5em] text-[1.15em] font-extrabold text-[#14365a]">
            <Camera className="h-[1.2em] w-[1.2em] text-[#1f9e95]" />
            {t("Photograph a grammar passage")}
          </h2>
          <button type="button" onClick={onClose} aria-label={t("Close")} className="grid h-[2.2em] w-[2.2em] place-items-center rounded-full hover:bg-[#eef3f7]">
            <X className="h-[1.2em] w-[1.2em]" />
          </button>
        </header>

        <div className="space-y-[1em] overflow-y-auto p-[1.2em]">
          <section className="space-y-[0.6em] rounded-[1em] border border-[#e3eef5] bg-white p-[0.9em]">
            <p className="text-[0.8em] text-[#5b7089]">
              {t("Upload a photo of a passage from your book, or paste its text. The AI will parse every word for you.")}
            </p>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              dir="auto"
              maxLength={120}
              placeholder={t("Title (optional)")}
              className="w-full rounded-[0.7em] border border-[#e3eef5] px-[0.8em] py-[0.5em] text-[0.85em] outline-none focus:border-[#2bb8a6]"
            />
            <label className="flex cursor-pointer items-center gap-[0.6em] rounded-[0.8em] border-2 border-dashed border-[#bfe3df] bg-[#f3fbfa] px-[0.9em] py-[0.7em] text-[0.85em] text-[#14365a] hover:bg-[#e9f7f5]">
              <ImageUp className="h-[1.4em] w-[1.4em] text-[#1f9e95]" />
              <span className="min-w-0 flex-1 truncate">{file ? file.name : t("Choose an image (PNG, JPEG or WebP, up to 5 MB)")}</span>
              <input type="file" accept={TYPES.join(",")} className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
            </label>
            {file && (
              <button type="button" className="text-[0.75em] font-semibold text-[#b42323] hover:underline" onClick={() => setFile(null)}>
                {t("Remove image")}
              </button>
            )}
            {fileError && <p role="alert" className="text-[0.78em] text-[#b42323]">{fileError}</p>}
            {!file && (
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                dir="rtl"
                rows={3}
                maxLength={2000}
                placeholder={t("...or paste the passage text here")}
                className="w-full rounded-[0.7em] border border-[#e3eef5] px-[0.8em] py-[0.5em] text-[0.95em] outline-none focus:border-[#2bb8a6]"
              />
            )}
            {error != null && <ErrorBox error={error} onRetry={submit} />}
            <div className="flex justify-end">
              <button type="button" className={PRIMARY_BTN} disabled={!canSend} onClick={submit}>
                <Sparkles className="h-[1.1em] w-[1.1em]" />
                {busy ? t("Parsing...") : t("Parse the passage")}
              </button>
            </div>
          </section>

          {added && (
            <section className="space-y-[0.5em]">
              <h3 className="text-[0.9em] font-extrabold text-[#14365a]">{t("Your passage, parsed")}</h3>
              <ColorLegend />
              <PassageView passage={added} />
            </section>
          )}

          {listError != null ? (
            <ErrorBox error={listError} onRetry={load} />
          ) : passages == null ? (
            <Spinner label={t("Loading passages...")} />
          ) : (
            <>
              {teacherPassages.length > 0 && (
                <section className="space-y-[0.5em]">
                  <h3 className="text-[0.9em] font-extrabold text-[#14365a]">{t("Passages from your teacher")}</h3>
                  {teacherPassages.map((p) => <PassageView key={p.id} passage={p} />)}
                </section>
              )}
              {ownPassages.length > 0 && (
                <section className="space-y-[0.5em]">
                  <h3 className="text-[0.9em] font-extrabold text-[#14365a]">{t("Your passages")}</h3>
                  {ownPassages.map((p) => <PassageView key={p.id} passage={p} />)}
                </section>
              )}
              {passages.length === 0 && !added && (
                <p className="text-center text-[0.8em] text-[#8a9bb0]">{t("No passages yet.")}</p>
              )}
            </>
          )}
        </div>

        <footer className="flex justify-end border-t border-[#e3eef5] px-[1.2em] py-[0.7em]">
          <button type="button" className={SOFT_BTN} onClick={onClose}>{t("Close")}</button>
        </footer>
      </div>
    </div>
  );
}
