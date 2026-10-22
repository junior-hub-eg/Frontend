"use client";

import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/client";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  groupAfter?: number;
  hasError?: boolean;
  disabled?: boolean;
}

export function OtpInput({ value, onChange, length = 6, groupAfter = 3, hasError, disabled }: OtpInputProps) {
  const t = useT();
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  function focusBox(index: number) {
    refs.current[Math.max(0, Math.min(index, length - 1))]?.focus();
  }

  function handleChange(index: number, raw: string) {
    const digit = raw.replace(/\D/g, "").slice(-1);
    if (!digit) {
      onChange(value.slice(0, index) + value.slice(index + 1));
      return;
    }
    onChange((value.slice(0, index) + digit + value.slice(index + 1)).slice(0, length));
    focusBox(index + 1);
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !value[index]) {
      e.preventDefault();
      focusBox(index - 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusBox(index - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusBox(index + 1);
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    onChange(pasted);
    focusBox(pasted.length);
  }

  return (
    // Digits are typed left to right in both languages.
    <div dir="ltr" className="flex items-center justify-between" role="group" aria-label={t("Verification code")}>
      {Array.from({ length }, (_, i) => (
        <div key={i} className="contents">
          {groupAfter > 0 && i === groupAfter && <span aria-hidden className="h-px w-[clamp(6px,1cqw,10px)] bg-[#1b2a5c]/30" />}
          <input
            ref={(el) => {
              refs.current[i] = el;
            }}
            value={value[i] ?? ""}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={1}
            disabled={disabled}
            aria-label={t("Digit {n}", { n: i + 1 })}
            className={cn(
              "h-[clamp(44px,6cqw,56px)] w-[clamp(38px,5.2cqw,50px)] rounded-lg border bg-white text-center text-[length:clamp(16px,2.2cqw,22px)] font-semibold text-[#1b2a5c] outline-none transition-colors",
              "border-[#cfd5d4] focus:border-[#12939b] focus:ring-2 focus:ring-[#12939b]/20",
              hasError && "border-danger focus:border-danger focus:ring-danger/20"
            )}
          />
        </div>
      ))}
    </div>
  );
}
