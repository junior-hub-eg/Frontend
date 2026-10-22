"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { LOCALES, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

const LABEL: Record<Locale, { short: string; name: string }> = {
  en: { short: "EN", name: "English" },
  ar: { short: "AR", name: "العربية" },
};

/** The EN / AR switch. `className` styles the trigger so it fits each header. */
export function LanguageSwitcher({ className, iconClassName }: { className?: string; iconClassName?: string }) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("Language")}
        className={cn("flex items-center gap-1", className)}
      >
        {LABEL[locale].short} <ChevronDown className={cn("h-[1em] w-[1em]", iconClassName)} />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label={t("Close menu")}
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <ul
            role="listbox"
            className="absolute start-0 top-full z-50 mt-2 w-36 overflow-hidden rounded-xl border border-black/5 bg-white py-1.5 text-sm text-[#1b2a5c] shadow-lg"
          >
            {LOCALES.map((l) => (
              <li key={l}>
                <button
                  type="button"
                  role="option"
                  aria-selected={l === locale}
                  onClick={() => {
                    setOpen(false);
                    if (l !== locale) setLocale(l);
                  }}
                  className="flex w-full items-center justify-between px-4 py-2 text-start hover:bg-[#E9F7F4]"
                >
                  <span lang={l}>{LABEL[l].name}</span>
                  {l === locale && <Check className="h-4 w-4 text-[#12939b]" />}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
