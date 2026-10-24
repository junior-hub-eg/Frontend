import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";

const baseFont = { fontSize: "clamp(11px, calc(var(--u) * 1.05), 17px)" } as CSSProperties;

/**
 * Wraps an admin page: fills the space above Quick Management (set by AdminShell).
 */
export function AdminPage({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col xl:min-h-0 xl:flex-1" style={baseFont}>
      {children}
    </div>
  );
}

/** Top part of a page, with the park picture behind it (same as the dashboard hero). */
export function AdminHero({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`relative shrink-0 overflow-hidden ${className}`}>
      <Image src="/images/Intern/bg-park.png" alt="" fill priority sizes="100vw" className="object-cover" />
      <div className="relative z-10 px-[calc(var(--u)*1.6)] pb-[1.6em] pt-[calc(var(--u)*5.4)]">{children}</div>
    </section>
  );
}

/** Below the hero: scrolls by itself on tall pages so Quick Management stays visible. */
export function AdminBody({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`px-[calc(var(--u)*1.6)] py-[1.4em] xl:min-h-0 xl:flex-1 xl:overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
    >
      {children}
    </div>
  );
}