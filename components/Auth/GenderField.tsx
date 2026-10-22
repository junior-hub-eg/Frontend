"use client";

import { useId } from "react";
import Image from "next/image";
import { GENDERS, type Gender } from "@/lib/avatars";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/client";

/** Boy or girl, shown with the avatar each starts with. Decides which avatars the student can pick later. */
export function GenderField({
  value,
  onChange,
  error,
  label,
}: {
  value: Gender | null | undefined;
  onChange: (gender: Gender) => void;
  error?: string;
  label?: string;
}) {
  const t = useT();
  const id = useId();
  return (
    <div>
      <p id={id} className="mb-1.5 text-[length:clamp(10px,1.2cqw,12px)] font-semibold leading-tight text-[#1b2a5c]">
        {label ?? t("I am a")}
      </p>
      <div role="radiogroup" aria-labelledby={id} aria-invalid={error ? true : undefined} className="grid grid-cols-2 gap-3">
        {GENDERS.map((g) => {
          const selected = value === g.id;
          return (
            <button
              key={g.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={t(g.label)}
              onClick={() => onChange(g.id)}
              className={cn(
                "flex items-center gap-3 rounded-xl border bg-white px-3 py-2 text-start transition-colors",
                selected ? "border-[#12939b] ring-2 ring-[#12939b]/25" : "border-[#dfe7e5] hover:border-[#12939b]/60",
                error && !selected && "border-danger"
              )}
            >
              <span className="relative size-[clamp(30px,4cqw,40px)] shrink-0 overflow-hidden rounded-full" style={{ backgroundColor: g.avatar.bg }}>
                <Image src={g.avatar.src} alt="" fill sizes="40px" className="object-cover" />
              </span>
              <span className="text-[length:clamp(12px,1.45cqw,14px)] font-semibold text-[#1b2a5c]">{t(g.label)}</span>
            </button>
          );
        })}
      </div>
      {error && <p role="alert" className="mt-1 px-1 text-xs text-danger">{t(error)}</p>}
    </div>
  );
}
