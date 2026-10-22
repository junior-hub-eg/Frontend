"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { ChevronDown, LogOut, Menu, User as UserIcon, X } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";

/** A nav link is active on its page and on the pages under it (e.g. Recruitment on a job's page). */
function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

const NAV_ITEMS: { label: string; href: Route }[] = [
  { label: tk("Home"), href: "/" },
  { label: tk("Courses"), href: "/courses" },
  { label: tk("Monitor"), href: "/monitor" },
  { label: tk("Interns"), href: "/interns" },
  { label: tk("Recruitment"), href: "/recruitment" },
];

function ProfileMenu() {
  const t = useT();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-[#12939b]/30 px-4 py-2 text-sm font-semibold text-[#1b2a5c] transition-colors hover:bg-[#E9F7F4]"
      >
        <UserIcon size={16} />
        <span className="hidden sm:inline">{t("Profile")}</span>
        <ChevronDown size={14} />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label={t("Close menu")}
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute end-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-black/5 bg-white py-1.5 shadow-lg">
            <p className="truncate px-4 py-2 text-xs text-[#1b2a5c]/50">{user?.firstName}</p>
            <Link
              href="/learner/profile"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-[#1b2a5c] hover:bg-[#E9F7F4]"
            >
              {t("Profile")}
            </Link>
            <button
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[#1b2a5c] hover:bg-[#E9F7F4]"
            >
              <LogOut size={14} /> {t("Log out")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function LandingHeader() {
  const t = useT();
  const { user } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 lg:px-10">
        <Link href="/" className="shrink-0" onClick={() => setMobileOpen(false)}>
          <Image src="/images/Auth/logo.png" alt={t("Junior Hub")} width={160} height={32} priority />
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-[#1b2a5c]/80 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                isActive(pathname, item.href)
                  ? "border-b-2 border-[#12939b] pb-1 text-[#12939b]"
                  : "transition-colors hover:text-[#12939b]"
              }
            >
              {t(item.label)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:block">
            <LanguageSwitcher className="text-sm font-medium text-[#1b2a5c]/80" />
          </div>
          {user ? (
            <ProfileMenu />
          ) : (
            <Link
              href="/login"
              className="rounded-[15px] bg-gradient-to-r from-[#128084] to-[#1b2d55] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            >
              {t("Log in")}
            </Link>
          )}

          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? t("Close menu") : t("Open menu")}
            aria-expanded={mobileOpen}
            className="grid size-9 shrink-0 place-items-center rounded-full text-[#1b2a5c] transition-colors hover:bg-[#E9F7F4] md:hidden"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="flex flex-col gap-1 border-t border-black/5 bg-white px-6 py-3 md:hidden">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={
                "rounded-lg px-3 py-2.5 text-sm font-medium " +
                (isActive(pathname, item.href) ? "bg-[#E9F7F4] text-[#12939b]" : "text-[#1b2a5c]/80 hover:bg-[#E9F7F4]")
              }
            >
              {t(item.label)}
            </Link>
          ))}
          <div className="sm:hidden">
            <LanguageSwitcher className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#1b2a5c]/80" />
          </div>
        </nav>
      )}
    </header>
  );
}
