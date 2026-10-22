"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { LanguageSwitcher } from "./LanguageSwitcher";

/**
 * Wrapper for the end-hand panel of the activation pages:
 * back button + language switch, Poppins font, and the Figma teal brand colour.
 * The colour override is scoped here on purpose (global --color-primary is still
 * the placeholder purple). Delete the three [--color-*] classes once the real
 * theme lands.
 */
export function AuthPanel({ children }: { children: ReactNode }) {
  const t = useT();
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6 font-[family-name:var(--font-poppins)] text-[#14365a] [--color-primary:#0e8f8f] [--color-primary-hover:#0b7878] [--color-ring:#0e8f8f]">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label={t("Back")}
          className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors hover:bg-border"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
        </button>

        <LanguageSwitcher className="text-xs font-medium" />
      </div>

      {children}
    </div>
  );
}