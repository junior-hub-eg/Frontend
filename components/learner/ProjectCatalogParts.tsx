"use client";

import { FileText, Folder, GitBranch, Link2, MessageCircle, PenTool, Video } from "lucide-react";
import type { ReactNode } from "react";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import type { CatalogLink, CatalogLinkKind } from "@/lib/projects-api";
import { cn } from "@/lib/utils";

/** The catalog project's logo (27 Oct 2026), or its first letter on a tinted tile when it has none. */
export function ProjectLogo({ src, title, className }: { src?: string | null; title: string; className?: string }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element -- a data URL or any link the admin gave
    <img src={src} alt="" className={cn("shrink-0 rounded-2xl bg-white object-cover ring-1 ring-[#dfe7f1]", className)} />
  ) : (
    <span
      aria-hidden
      className={cn("flex shrink-0 items-center justify-center rounded-2xl bg-[#c9efe9] font-extrabold text-[#14757d]", className)}
    >
      {title.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}

export const CATALOG_LINK: Record<CatalogLinkKind, { label: string; icon: ReactNode }> = {
  Chat: { label: tk("Squad chat"), icon: <MessageCircle aria-hidden className="size-3.5" /> },
  Meeting: { label: tk("Meeting"), icon: <Video aria-hidden className="size-3.5" /> },
  Figma: { label: tk("Figma"), icon: <PenTool aria-hidden className="size-3.5" /> },
  GitHub: { label: tk("GitHub"), icon: <GitBranch aria-hidden className="size-3.5" /> },
  Drive: { label: tk("Drive folder"), icon: <Folder aria-hidden className="size-3.5" /> },
  Docs: { label: tk("Docs"), icon: <FileText aria-hidden className="size-3.5" /> },
  Other: { label: tk("Link"), icon: <Link2 aria-hidden className="size-3.5" /> },
};

/** The links the admin prepared with the project (chat, meeting, Figma, ...), opening in a new tab. */
export function CatalogLinks({ links, className }: { links?: CatalogLink[]; className?: string }) {
  const t = useT();
  if (!links?.length) return null;
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)}>
      {links.map((l, i) => (
        <li key={`${l.kind}-${i}`}>
          <a
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#e9f7f5] px-2.5 py-1 text-[0.72em] font-semibold text-[#14757d] transition-colors hover:bg-[#d9f0ec]"
          >
            {CATALOG_LINK[l.kind]?.icon ?? CATALOG_LINK.Other.icon}
            {l.label || t(CATALOG_LINK[l.kind]?.label ?? CATALOG_LINK.Other.label)}
          </a>
        </li>
      ))}
    </ul>
  );
}
