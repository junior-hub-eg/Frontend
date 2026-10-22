"use client";

import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft } from "lucide-react";
import { useT } from "@/lib/i18n/client";

interface BackButtonProps {
  href: Route;
}

export function BackButton({ href }: BackButtonProps) {
  const t = useT();
  return (
    <Link
      href={href}
      aria-label={t("Go back")}
      className="absolute start-[clamp(20px,4.4cqw,40px)] top-[clamp(20px,3cqw,32px)] flex size-[clamp(30px,4.6cqw,42px)] items-center justify-center rounded-lg bg-[#cfd5d4] text-white transition-colors hover:bg-[#b9c2c0]"
    >
      <ArrowLeft aria-hidden className="size-[55%]" strokeWidth={2.2} />
    </Link>
  );
}
