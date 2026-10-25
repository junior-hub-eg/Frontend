"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Image from "next/image";
import { ImagePlus, LoaderCircle, Sparkles, Type, X } from "lucide-react";
import { ApiError, errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { addTeacherPassage, type GrammarPassage } from "@/lib/grammar-api";
import { getTeacherProfile } from "@/lib/teacher-api";
import { cn } from "@/lib/utils";
import { Card, FieldLabel, inputClass } from "@/components/teacher/teacher-ui";

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

type Mode = "image" | "text";
type Photo = { dataUrl: string; base64: string; mimeType: string; name: string };

function readPhoto(file: File): Promise<Photo> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      resolve({ dataUrl, base64: dataUrl.slice(dataUrl.indexOf(",") + 1), mimeType: file.type, name: file.name });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** "Add passage": a photo (or typed text) the AI reads and parses into a draft the teacher reviews. */
export function AddPassagePanel({ onAdded }: { onAdded: (p: GrammarPassage) => void }) {
  const t = useT();
  const [grades, setGrades] = useState<number[]>([]);
  const [mode, setMode] = useState<Mode>("image");
  const [title, setTitle] = useState("");
  const [grade, setGrade] = useState<string>("");
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    getTeacherProfile().then(
      (me) => {
        if (!active) return;
        const list = [...me.grades].sort((a, b) => a - b);
        setGrades(list);
        setGrade((g) => g || (list[0] != null ? String(list[0]) : ""));
      },
      () => undefined,
    );
    return () => {
      active = false;
    };
  }, []);

  async function pickFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    if (!IMAGE_TYPES.includes(file.type)) {
      setError(t("Choose a PNG, JPEG or WebP picture."));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError(t("The picture is larger than 5 MB. Choose a smaller one."));
      return;
    }
    try {
      setPhoto(await readPhoto(file));
    } catch {
      setError(t("We couldn't read that picture. Try another one."));
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFields({});
    if (mode === "image" && !photo) {
      setError(t("Add a photo of the passage first."));
      return;
    }
    if (mode === "text" && !text.trim()) {
      setError(t("Type the passage first."));
      return;
    }
    setBusy(true);
    try {
      const created = await addTeacherPassage({
        title: title.trim() || undefined,
        grade: grade ? Number(grade) : undefined,
        ...(mode === "image" && photo ? { imageBase64: photo.base64, mimeType: photo.mimeType } : { text: text.trim() }),
      });
      setTitle("");
      setText("");
      setPhoto(null);
      onAdded(created);
    } catch (err) {
      if (err instanceof ApiError && (err.status === 503 || err.code === "AI_UNAVAILABLE")) {
        setError(t("The AI is not available right now. Please try again in a few minutes."));
      } else if (err instanceof ApiError && Object.keys(err.fieldErrors).length) {
        const f = Object.fromEntries(Object.entries(err.fieldErrors).map(([k, v]) => [k.charAt(0).toLowerCase() + k.slice(1), v]));
        setFields(f);
        const placed = ["title", "grade", "text"];
        const other = Object.entries(f).find(([k]) => !placed.includes(k));
        if (other) setError(t(other[1]));
      } else {
        setError(errorMessage(err, tk("We couldn't add the passage. Please try again.")));
      }
    } finally {
      setBusy(false);
    }
  }

  const modeButton = (m: Mode, label: string, Icon: typeof Type) => (
    <button
      type="button"
      onClick={() => setMode(m)}
      aria-pressed={mode === m}
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors",
        mode === m ? "bg-white text-[#14757d] shadow-sm" : "text-[#1B2D54]/60 hover:text-[#1B2D54]",
      )}
    >
      <Icon className="size-3.5" /> {label}
    </button>
  );

  return (
    <Card>
      <h2 className="flex items-center gap-1.5 text-sm font-bold">
        <Sparkles className="size-4 text-[#14757d]" /> {t("Add passage")}
      </h2>
      <p className="mt-1 text-[10px] text-[#1B2D54]/60">{t("The AI reads it and colors each word by its case. It stays under review until you publish it.")}</p>

      {busy ? (
        <div role="status" className="mt-4 grid place-items-center gap-2 rounded-xl bg-[#f0f8f7] px-4 py-8 text-center">
          <LoaderCircle className="size-6 animate-spin text-[#14757d]" />
          <p className="text-[12px] font-semibold text-[#14757d]">{t("The AI is reading the passage…")}</p>
          <p className="text-[10px] text-[#1B2D54]/60">{t("This can take up to a minute.")}</p>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-3 grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <FieldLabel label={t("Title (optional)")} error={fields.title}>
              <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={150} dir="auto" />
            </FieldLabel>
            <FieldLabel label={t("Grade")} error={fields.grade}>
              <select className={inputClass} value={grade} onChange={(e) => setGrade(e.target.value)}>
                <option value="">{t("No specific grade")}</option>
                {grades.map((g) => (
                  <option key={g} value={g}>
                    {t("Grade {grade}", { grade: g })}
                  </option>
                ))}
              </select>
            </FieldLabel>
          </div>

          <div className="flex gap-1 rounded-full bg-[#eef2f1] p-1">
            {modeButton("image", t("Photo"), ImagePlus)}
            {modeButton("text", t("Type the text"), Type)}
          </div>

          {mode === "image" ? (
            photo ? (
              <div className="relative h-44 overflow-hidden rounded-xl border border-[#e3ece9] bg-[#f6f9f8]">
                <Image src={photo.dataUrl} alt={t("The passage photo")} fill unoptimized className="object-contain" />
                <button
                  type="button"
                  onClick={() => setPhoto(null)}
                  aria-label={t("Remove the photo")}
                  className="absolute end-2 top-2 grid size-7 place-items-center rounded-full bg-white/90 shadow-sm hover:bg-white"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="grid place-items-center gap-1.5 rounded-xl border-2 border-dashed border-[#c9dcd8] bg-[#f6f9f8] px-4 py-7 text-center hover:border-[#14757d]"
              >
                <ImagePlus className="size-6 text-[#14757d]" />
                <span className="text-[11px] font-semibold">{t("Choose a photo of the passage")}</span>
                <span className="text-[10px] text-[#1B2D54]/60">{t("PNG, JPEG or WebP, up to 5 MB")}</span>
              </button>
            )
          ) : (
            <FieldLabel label={t("Passage text")} error={fields.text}>
              <textarea
                className={cn(inputClass, "h-32 py-2 text-[13px] leading-relaxed")}
                dir="rtl"
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={4000}
              />
            </FieldLabel>
          )}
          <input ref={fileRef} type="file" accept={IMAGE_TYPES.join(",")} className="hidden" onChange={pickFile} />

          {error && (
            <p role="alert" className="rounded-lg bg-[#fdecec] px-3 py-2 text-[11px] font-semibold text-[#c81e1e]">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 rounded-full bg-[#14757d] px-5 py-2 text-[11px] font-semibold text-white shadow-sm hover:bg-[#0f6169]"
          >
            <Sparkles className="size-3.5" /> {t("Parse with AI")}
          </button>
        </form>
      )}
    </Card>
  );
}
