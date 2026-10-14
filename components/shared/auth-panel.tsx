"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown } from "lucide-react";

/**
 * Wrapper for the right-hand panel of the activation pages:
 * back button + language switch, Poppins font, and the Figma teal brand colour.
 * The colour override is scoped here on purpose (global --color-primary is still
 * the placeholder purple). Delete the three [--color-*] classes once the real
 * theme lands.
 */
export function AuthPanel({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6 font-[family-name:var(--font-poppins)] text-[#14365a] [--color-primary:#0e8f8f] [--color-primary-hover:#0b7878] [--color-ring:#0e8f8f]">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Back"
          className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors hover:bg-border"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
        </button>

        <button type="button" className="flex items-center gap-1 text-xs font-medium">
          EN <ChevronDown className="h-3 w-3" />
        </button>
      </div>

      {children}
    </div>
  );
}