"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { LEARNER_NAV_MAIN, LEARNER_NAV_SECONDARY, type LearnerNavItem } from "./learner-nav";

interface LearnerSidebarProps {
  activeHref?: string;
  /** Desktop: icons only */
  collapsed?: boolean;
  /** Mobile/tablet: expanded drawer (otherwise a slim icon rail) */
  mobileOpen?: boolean;
  onNavigate?: () => void;
  /** No track yet: the student finishes Find your track first, so the links are shown locked. */
  locked?: boolean;
}

function NavLink({
  item,
  active,
  collapsed,
  rail,
  onNavigate,
  locked = false,
}: {
  item: LearnerNavItem;
  active: boolean;
  collapsed: boolean;
  /** mobile/tablet icon-only rail */
  rail: boolean;
  onNavigate?: () => void;
  locked?: boolean;
}) {
  const Icon = item.icon;

  const align = collapsed
    ? rail
      ? "justify-center px-0"
      : "px-[1em] lg:justify-center lg:px-0"
    : rail
      ? "justify-center px-0 lg:justify-start lg:px-[1em]"
      : "px-[1em]";

  const label = collapsed ? (rail ? "hidden" : "lg:hidden") : rail ? "hidden lg:inline" : "";

  if (locked) {
    return (
      <span
        aria-disabled="true"
        title={`${item.label}: choose your track first`}
        className={cn("flex h-[2.8em] cursor-not-allowed items-center gap-[0.9em] rounded-[0.7em] text-[1.05em] font-medium text-[#14365a]/40", align)}
      >
        <Icon className="h-[1.3em] w-[1.3em] shrink-0" />
        <span className={label}>{item.label}</span>
        <Lock className={cn("ml-auto h-[0.9em] w-[0.9em] shrink-0", label)} />
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      title={item.label}
      onClick={onNavigate}
      className={cn(
        "flex h-[2.8em] items-center gap-[0.9em] rounded-[0.7em] text-[1.05em] transition-colors",
        align,
        active
          ? "bg-[#7fdcb8]/80 font-bold text-[#14365a] shadow-sm"
          : "font-medium text-[#14365a]/90 hover:bg-white/50",
      )}
    >
      <Icon className="h-[1.3em] w-[1.3em] shrink-0" />
      <span className={label}>{item.label}</span>
    </Link>
  );
}

/** The parent (LearnerShell frame) must be `relative` and define `--sb` and `--u`. */
export function LearnerSidebar({ activeHref, collapsed = false, mobileOpen = false, onNavigate, locked = false }: LearnerSidebarProps) {
  const pathname = usePathname();
  const current = activeHref ?? pathname;
  const isActive = (item: LearnerNavItem) =>
    [item.href, ...(item.matches ?? [])].some((href) => current === href || current.startsWith(`${href}/`));

  // On mobile/tablet the sidebar is always visible: a slim icon rail, or the full drawer when open.
  const rail = !mobileOpen;

  const logoFull = collapsed ? (rail ? "hidden" : "lg:hidden") : rail ? "hidden lg:block" : "";
  const logoCap = collapsed ? (rail ? "block" : "hidden lg:block") : rail ? "block lg:hidden" : "hidden";
  const logoBox = collapsed
    ? rail
      ? "justify-center px-0"
      : "px-[0.6em] lg:justify-center lg:px-0"
    : rail
      ? "justify-center px-0 lg:justify-start lg:px-[0.6em]"
      : "px-[0.6em]";
  const brand = collapsed ? (rail ? "hidden" : "lg:hidden") : rail ? "hidden lg:block" : "";

  return (
    <aside
      className={cn(
        "absolute inset-y-0 left-0 z-30 flex flex-col overflow-hidden border-r border-white/70 bg-[linear-gradient(180deg,rgba(198,236,255,0.78)_0%,rgba(217,243,255,0.45)_55%,rgba(203,233,252,0.6)_100%)] backdrop-blur-xl pb-[2.4em] shadow-[0_8px_40px_rgba(20,54,90,0.10)] transition-[width] duration-300",
        // mobile / tablet
        mobileOpen
          ? "w-64 rounded-r-[2rem] px-[1.2em] pt-[4.4em]"
          : "w-[3.5rem] rounded-r-[2rem] px-[0.5rem] pt-[1.6rem]",
        // desktop
        "lg:w-[var(--sb)] lg:rounded-br-[4.7em] lg:rounded-tr-[6.5em] lg:pt-[4.4em] lg:[font-size:clamp(9px,var(--u),16px)]",
        collapsed ? "lg:px-[0.7em]" : "lg:px-[1.2em]",
      )}
    >
      {/* soft blue hills at the bottom (like the Figma) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[40%]">
        <div className="absolute -left-[35%] top-[22%] h-[140%] w-[150%] rounded-[50%] bg-[#9fd3f6]/80" />
        <div className="absolute -right-[45%] top-[48%] h-[120%] w-[150%] rounded-[50%] bg-[#c3e7fb]/90" />
      </div>

      {/* logo: full logo when open, graduation cap on the rail / collapsed. Opens the landing page. */}
      <Link
        href="/"
        aria-label="Junior Hub home"
        onClick={onNavigate}
        className={cn("mb-[2.6em] flex h-[2.6em] items-center rounded-[0.7em]", logoBox)}
      >
        <Image
          src="/images/Auth/logo.png"
          alt="Junior Hub"
          width={160}
          height={32}
          priority
          style={{ height: "2.6em", width: "auto" }}
          className={logoFull}
        />
        <GraduationCap className={cn("h-[2em] w-[2em] text-[#14365a]", logoCap)} />
      </Link>

      <nav className="flex flex-col gap-[0.8em]">
        {LEARNER_NAV_MAIN.map((item) => (
          <NavLink
            key={item.label}
            item={item}
            active={isActive(item)}
            collapsed={collapsed}
            rail={rail}
            onNavigate={onNavigate}
            locked={locked}
          />
        ))}
      </nav>

      <div className="my-[1.6em] border-t border-[#14365a]/10" />

      <nav className="flex flex-col gap-[0.8em]">
        {LEARNER_NAV_SECONDARY.map((item) => (
          <NavLink
            key={item.label}
            item={item}
            active={isActive(item)}
            collapsed={collapsed}
            rail={rail}
            onNavigate={onNavigate}
            locked={locked}
          />
        ))}
      </nav>

      <div className={cn("mt-auto px-[0.6em] pt-[1.5em]", brand)}>
        <Image
          src="/images/Auth/logo.png"
          alt="Junior Hub"
          width={130}
          height={26}
          style={{ height: "2em", width: "auto" }}
        />
        <p className="mt-[0.5em] text-[1.1em] tracking-wide text-[#14365a]">BUILD YOUR DREAMS</p>
      </div>
    </aside>
  );
}