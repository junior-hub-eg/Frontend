"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { ChevronDown, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";

const NAV_ITEMS: { label: string; href: Route }[] = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "Monitor", href: "/monitor" },
  { label: "Interns", href: "/interns" },
  { label: "Recruitment", href: "/recruitment" },
];

function ProfileMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-[#12939b]/30 px-4 py-2 text-sm font-semibold text-[#1b2a5c] transition-colors hover:bg-[#E9F7F4]"
      >
        <UserIcon size={16} />
        Profile
        <ChevronDown size={14} />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
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
              Profile
            </Link>
            <button
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[#1b2a5c] hover:bg-[#E9F7F4]"
            >
              <LogOut size={14} /> Log out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function LandingHeader() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 lg:px-10">
        <Link href="/" className="shrink-0">
          <Image src="/images/Auth/logo.png" alt="Junior Hub" width={160} height={32} priority />
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-[#1b2a5c]/80 md:flex">
          {NAV_ITEMS.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className={i === 0 ? "border-b-2 border-[#12939b] pb-1 text-[#12939b]" : "transition-colors hover:text-[#12939b]"}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button className="hidden items-center gap-1 text-sm font-medium text-[#1b2a5c]/80 sm:flex">
            EN <ChevronDown size={14} />
          </button>
          {user ? (
            <ProfileMenu />
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-[#12939b] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0f7a81]"
            >
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
