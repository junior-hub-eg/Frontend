"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, Lightbulb, PanelLeft, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { LearnerSidebar } from "./learner-sidebar";

interface LearnerShellProps {
  userName: string;
  userEmail?: string;
  userAvatar?: string;
  levelLabel?: string;
  trackLabel?: string;
  onLogout?: () => void;
  activeHref?: string;
  children: ReactNode;
}

export function LearnerShell({
  userName,
  userEmail,
  userAvatar,
  levelLabel = "Level 4",
  trackLabel = "UI/UX",
  onLogout,
  activeHref,
  children,
}: LearnerShellProps) {
  const pathname = usePathname();
  const current = activeHref ?? pathname;
  const [collapsed, setCollapsed] = useState(false); // desktop: icons only
  const [mobileOpen, setMobileOpen] = useState(false); // mobile/tablet: expanded drawer
  const [menuOpen, setMenuOpen] = useState(false);

  function toggleSidebar() {
    if (window.matchMedia("(min-width: 1024px)").matches) setCollapsed((c) => !c);
    else setMobileOpen((o) => !o);
  }
  const closeMobile = () => setMobileOpen(false);

  const frameVars = {
    "--fw": "calc(100vw - 1.5rem)",
    "--fh": "calc(100svh - 1.5rem)",
    "--sw": "min(var(--fw), calc(var(--fh) * 1.40625))",
    "--u": "calc(var(--sw) / 100)",
    "--c": "min(calc(var(--fw) / 100), calc((var(--fh) - 90px) / 50.08))",
    "--t": "max(0px, calc(var(--c) * 70.7 - var(--fh) - 90px))",
    "--sb": collapsed ? "calc(var(--u) * 8.3)" : "calc(var(--u) * 19.4)",
    "--cx": "calc((100% + var(--sb)) / 2)",
    // left edge right next to the sidebar (search bar + greeting use this)
    "--hl": "calc(var(--sb) + var(--u) * 2)",
    "--bgw": "max(var(--fw), calc(var(--fh) * 1.40625))",
    "--bgh": "calc(var(--bgw) / 1.40625)",
  } as CSSProperties;

  return (
    <div dir="ltr" className="min-h-screen bg-[#eaf4fb] lg:h-svh lg:overflow-hidden lg:p-1">
      <div
        style={frameVars}
        className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-[#8fd0f5] via-[#bfe4f7] to-[#e6f6fc] lg:h-full lg:min-h-0 lg:rounded-[28px] lg:shadow-[0_24px_70px_rgba(20,54,90,0.22)]"
      >
        {mobileOpen && (
          <button
            type="button"
            aria-label="Close menu"
            onClick={closeMobile}
            className="absolute inset-0 z-20 bg-black/30 lg:hidden"
          />
        )}

        <LearnerSidebar activeHref={current} collapsed={collapsed} mobileOpen={mobileOpen} onNavigate={closeMobile} />

        {/* ---------- Top bar ---------- */}
        <header className="relative z-40 flex items-center gap-3 py-4 pl-[4rem] pr-4 lg:absolute lg:left-[var(--hl)] lg:right-[calc(var(--u)*1.6)] lg:top-[3.8%] lg:gap-[1.2em] lg:p-0 lg:transition-[left] lg:duration-300 lg:[font-size:clamp(9px,var(--u),16px)]">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
            className={cn(
              "grid h-[2.7em] w-[2.7em] shrink-0 place-items-center rounded-full backdrop-blur transition-colors",
              collapsed ? "bg-white/70 text-[#14365a] lg:bg-[#14365a] lg:text-white" : "bg-white/70 text-[#14365a]",
            )}
          >
            <PanelLeft className="h-[1.2em] w-[1.2em]" />
          </button>

          <form role="search" onSubmit={(e) => e.preventDefault()} className="relative hidden max-w-[34em] flex-1 sm:block">
            <Search className="pointer-events-none absolute left-[1em] top-1/2 h-[1.1em] w-[1.1em] -translate-y-1/2 text-[#14365a]/60" />
            <input
              type="search"
              placeholder="Search anything...."
              className="h-[2.8em] w-full rounded-full border border-white/70 bg-white/55 pl-[3em] pr-[5em] text-[0.95em] text-[#14365a] outline-none backdrop-blur placeholder:text-[#14365a]/55 focus:ring-2 focus:ring-[#12939b]/40"
            />
            <kbd className="pointer-events-none absolute right-[0.7em] top-1/2 -translate-y-1/2 rounded-full bg-[#4a9df8]/25 px-[0.8em] py-[0.25em] font-sans text-[0.8em] font-semibold text-[#2f7fd6]">
              ⌘K
            </kbd>
          </form>

          <div className="ml-auto flex items-center gap-[1.2em]">
            <button type="button" className="flex items-center gap-[0.3em] text-[0.95em] font-medium text-[#14365a]">
              EN <ChevronDown className="h-[1em] w-[1em]" />
            </button>

            <div className="hidden h-[2.8em] items-center gap-[0.6em] rounded-full border border-white/70 bg-white/55 px-[1em] text-[0.95em] font-semibold text-[#14365a] backdrop-blur md:flex">
              <Lightbulb className="h-[1.3em] w-[1.3em] text-[#2f7fd6]" />
              <span>{levelLabel}</span>
              <span className="font-bold">{trackLabel}</span>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-expanded={menuOpen}
                className="flex h-[2.8em] items-center gap-[0.7em] rounded-full border border-white/70 bg-white/55 pl-[0.3em] pr-[1em] text-[0.95em] font-medium text-[#14365a] backdrop-blur"
              >
                <span className="relative grid h-[2.2em] w-[2.2em] shrink-0 place-items-center overflow-hidden rounded-full bg-[#ffd66b] ring-2 ring-white">
                  {userAvatar ? (
                    <Image src={userAvatar} alt="" fill sizes="40px" className="origin-top scale-[2.1] object-cover object-top" />
                  ) : (
                    <span className="text-[0.8em] font-semibold text-[#14365a]">{userName.charAt(0).toUpperCase()}</span>
                  )}
                </span>
                <span className="hidden sm:inline">{userName}</span>
                <ChevronDown className="h-[1em] w-[1em]" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-white/60 bg-white p-1 text-base shadow-lg">
                  {userEmail && <p className="truncate px-3 py-2 text-[11px] text-slate-500">{userEmail}</p>}
                  {onLogout && (
                    <button
                      type="button"
                      onClick={onLogout}
                      className="w-full rounded-lg px-3 py-2 text-left text-xs text-[#14365a] hover:bg-slate-100"
                    >
                      Log out
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ---------- Content: fills the whole frame on desktop ---------- */}
        <main className="relative flex flex-col pl-[4rem] lg:absolute lg:inset-0 lg:z-0 lg:pl-0">{children}</main>
      </div>
    </div>
  );
}