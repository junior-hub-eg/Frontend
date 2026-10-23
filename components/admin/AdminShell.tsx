"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Route } from "next";
import {
  Bell,
  ChevronDown,
  ClipboardList,
  Layers,
  LayoutGrid,
  LoaderCircle,
  LogOut,
  Menu,
  Search,
  UserCheck,
  Users,
  UsersRound,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { landingFont } from "@/components/Landing/font";
import { QuickManagement } from "./QuickManagement";

/** LOCAL ONLY: same switch as proxy.ts. Ignored in production builds. */
const SKIP_AUTH = process.env.NEXT_PUBLIC_SKIP_AUTH === "true" && process.env.NODE_ENV !== "production";

/** Logos: put the two images in public/images/admin/ (change the names here if yours differ). */
const CAP_IMG = "/images/admin/reicon_grad-cap-filled.png";
const GROUP_IMG = "/images/admin/group.png";
const PARK_IMG = "/images/Intern/bg-park.png";
const AVATAR = "/images/Intern/char-boy-glasses.png";

/** Two groups, separated by a thin line like the learner sidebar. */
const NAV_GROUPS = [
  [
    { href: "/admin/dashboard", label: "Admin Dashboard", icon: LayoutGrid },
    { href: "/admin/students", label: "Student Management", icon: Users },
    { href: "/admin/squads", label: "Squads Management", icon: UsersRound },
    { href: "/admin/mentors", label: "Mentors Management", icon: UserCheck },
  ],
  [
    { href: "/admin/tracks", label: "Tracks", icon: Layers },
    { href: "/admin/assignments", label: "Assignments & Submissions", icon: ClipboardList },
  ],
];

/** Defines the CSS variables the admin pages size themselves with. */
const vars = {
  "--u": "clamp(10px, 0.9vw, 16px)",
  "--hl": "calc(var(--u) * 1.6)",
} as CSSProperties;

const baseFont = { fontSize: "clamp(11px, calc(var(--u) * 1.05), 17px)" } as CSSProperties;

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const [expanded, setExpanded] = useState(true); // desktop: full sidebar or narrow rail
  const [mobileOpen, setMobileOpen] = useState(false); // mobile: drawer open or closed
  const [isDesktop, setIsDesktop] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Track the lg breakpoint (1024px)
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Close the drawer when the page changes or the screen grows to desktop
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, isDesktop]);

  // Esc closes the drawer
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  // Ctrl/Cmd + K focuses the search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const allowed = SKIP_AUTH || (!!user && String(user.role) === "admin");

  useEffect(() => {
    if (!allowed) router.replace("/login");
  }, [allowed, router]);

  if (!allowed) {
    return (
      <div className="grid min-h-svh place-items-center" role="status" aria-label="Loading">
        <LoaderCircle className="size-8 animate-spin text-[#12939b]" />
      </div>
    );
  }

  const displayName =
    (user as { name?: string } | null)?.name ?? (user as { fullName?: string } | null)?.fullName ?? "Admin";

  // The drawer on mobile always shows labels; on desktop it depends on `expanded`
  const showLabels = isDesktop ? expanded : true;
  const toggleSidebar = () => (isDesktop ? setExpanded((v) => !v) : setMobileOpen((v) => !v));

  return (
    <div
      className={`${landingFont.variable} flex h-svh gap-2 overflow-hidden bg-[#eaf3fb] p-2 font-[family-name:var(--font-poppins)]`}
      style={vars}
    >
      {/* Dark backdrop behind the mobile drawer */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 cursor-default bg-[#14365a]/35 backdrop-blur-[1px] lg:hidden"
        />
      )}

      {/* ================= Sidebar ================= */}
      {/* Mobile: off-canvas drawer (outside the screen until opened). Desktop: part of the layout. */}
      <aside
        aria-label="Sidebar"
        className={`fixed bottom-2 left-2 top-2 z-50 flex w-[15rem] max-w-[calc(100vw-1rem)] shrink-0 flex-col overflow-hidden rounded-[1.6rem] border border-white/60 shadow-[0_10px_30px_rgba(20,90,140,0.18)] transition-[transform,width] duration-200 lg:relative lg:z-auto lg:max-w-none lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-[calc(100%+1rem)]"
        } ${expanded ? "lg:w-[15rem]" : "lg:w-[4.5rem]"}`}
      >
        {/* Frosted glass: blurred park picture + light blue wash */}
        <Image
          src={PARK_IMG}
          alt=""
          fill
          sizes="240px"
          aria-hidden
          className="pointer-events-none origin-left scale-150 object-cover blur-[14px]"
        />
        <span aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#c8ebfb]/80 via-[#d4effc]/55 to-[#9fd8f5]/80" />

        {/* Waves at the bottom */}
        <span aria-hidden className="pointer-events-none absolute -bottom-20 -left-12 size-64 rounded-full bg-[#b9d9fb]/70" />
        <span aria-hidden className="pointer-events-none absolute -bottom-28 left-8 size-72 rounded-full bg-[#7fcdf1]/65" />

        {/* Logo */}
        <div className={`relative z-10 flex h-[4.5rem] shrink-0 items-center gap-2.5 ${showLabels ? "px-5" : "justify-center"}`}>
          <Image src={CAP_IMG} alt="" width={30} height={30} className="size-[1.9rem] shrink-0 object-contain" />
          {showLabels && <span className="text-[1.15rem] font-extrabold tracking-tight text-[#14365a]">JUNIOR HUB</span>}
        </div>

        {/* Nav */}
        <nav
          aria-label="Admin"
          className="relative z-10 flex-1 overflow-y-auto px-2.5 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi}>
              {gi > 0 && <hr className="mx-2 my-3 border-0 border-t border-[#14365a]/15" />}
              <ul className="space-y-1">
                {group.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href as Route}
                        title={item.label}
                        aria-current={active ? "page" : undefined}
                        className={`flex items-center gap-3 rounded-[0.7rem] py-2.5 text-[0.78rem] transition-colors ${
                          showLabels ? "px-3.5" : "justify-center px-0"
                        } ${
                          active
                            ? "bg-gradient-to-r from-[#9de0d0] to-[#bfeadf] font-semibold text-[#14365a] shadow-[0_4px_12px_rgba(60,190,170,0.25)]"
                            : "font-medium text-[#14365a] hover:bg-white/45"
                        }`}
                      >
                        <item.icon className="size-[1.15rem] shrink-0" strokeWidth={1.8} />
                        {showLabels && <span className="truncate">{item.label}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Bottom logo: image on the left, text on its right */}
        {showLabels && (
          <div className="relative z-10 flex shrink-0 items-center gap-3 px-5 pb-5 pt-2">
            <div className="relative size-[3rem] shrink-0">
              <Image src={GROUP_IMG} alt="" fill sizes="48px" className="object-contain object-left" />
            </div>
            <span className="min-w-0 truncate text-[1.15rem] font-extrabold leading-tight tracking-tight text-[#14365a]">
              JUNIOR HUB
            </span>
          </div>
        )}
      </aside>

      {/* ================= Main ================= */}
      {/* < xl: the whole column scrolls (page, then Quick Management at the end).
          xl+ : the page fills the free height and Quick Management stays pinned at the bottom. */}
      <main className="relative flex min-w-0 flex-1 flex-col overflow-y-auto rounded-[1.4rem] xl:overflow-hidden">
        {/* ---------- Top bar (floats over the page hero) ---------- */}
        <header
          className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center gap-[0.7em] px-[calc(var(--u)*1.6)] pt-[calc(var(--u)*1.1)]"
          style={baseFont}
        >
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={isDesktop ? (expanded ? "Collapse sidebar" : "Expand sidebar") : mobileOpen ? "Close sidebar" : "Open sidebar"}
            aria-expanded={isDesktop ? expanded : mobileOpen}
            className="pointer-events-auto grid size-[2.5em] shrink-0 place-items-center rounded-full bg-[#14365a] text-white shadow-md hover:bg-[#0f2a47]"
          >
            <Menu className="size-[1.2em]" />
          </button>

          <label className="pointer-events-auto relative min-w-0 max-w-[32em] flex-1">
            <Search className="pointer-events-none absolute left-[1em] top-1/2 size-[1.1em] -translate-y-1/2 text-[#14365a]/70" />
            <input
              ref={searchRef}
              type="search"
              placeholder="Search anything...."
              className="h-[2.6em] w-full rounded-full border border-white/70 bg-white/55 pl-[2.8em] pr-[1em] text-[0.8em] text-[#14365a] shadow-[0_6px_18px_rgba(60,160,230,0.25)] outline-none backdrop-blur placeholder:text-[#14365a]/70 focus:ring-2 focus:ring-[#12939b]/40 sm:pr-[4em]"
            />
            <kbd className="pointer-events-none absolute right-[0.9em] top-1/2 hidden -translate-y-1/2 rounded-full bg-[#3aa6f2]/85 px-[0.7em] py-[0.15em] text-[0.65em] font-bold text-white sm:block">
              ⌘K
            </kbd>
          </label>

          <button
            type="button"
            className="pointer-events-auto hidden h-[2.4em] items-center gap-[0.5em] rounded-full border border-white/70 bg-white/55 px-[1.1em] text-[0.8em] font-semibold text-[#14365a] shadow-[0_6px_18px_rgba(60,160,230,0.2)] backdrop-blur md:flex"
          >
            EN <ChevronDown className="size-[1em]" />
          </button>

          <div className="ml-auto flex items-center gap-[0.7em]">
            <button
              type="button"
              aria-label="Notifications"
              className="pointer-events-auto relative grid size-[2.4em] place-items-center rounded-full border border-white/70 bg-white/55 text-[#14365a] shadow-[0_6px_18px_rgba(60,160,230,0.2)] backdrop-blur hover:bg-white/80"
            >
              <Bell className="size-[1.1em]" />
              <span className="absolute right-[0.55em] top-[0.55em] size-[0.55em] rounded-full bg-[#e0245e]" />
            </button>

            <div className="pointer-events-auto relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex h-[2.4em] items-center gap-[0.6em] rounded-full border border-white/70 bg-white/55 pl-[0.3em] pr-[0.9em] text-[0.8em] font-semibold text-[#14365a] shadow-[0_6px_18px_rgba(60,160,230,0.2)] backdrop-blur hover:bg-white/80"
              >
                <span className="relative size-[1.9em] overflow-hidden rounded-full bg-[#ffc531]">
                  <Image src={AVATAR} alt="" fill sizes="32px" className="origin-top scale-[2.1] object-cover object-top" />
                </span>
                <span className="hidden max-w-[10em] truncate sm:block">{displayName}</span>
                <ChevronDown className="size-[1em]" />
              </button>

              {menuOpen && (
                <>
                  <button type="button" aria-label="Close menu" className="fixed inset-0 z-40 cursor-default" onClick={() => setMenuOpen(false)} />
                  <div role="menu" className="absolute right-0 top-full z-50 mt-2 min-w-[11em] overflow-hidden rounded-[0.9em] border border-[#e1e8f0] bg-white shadow-lg">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-[0.6em] px-[1.1em] py-[0.7em] text-left text-[0.85em] font-semibold text-[#14365a] hover:bg-[#eef4fa]"
                    >
                      <LogOut className="size-[1.1em]" /> Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* ---------- Page content ---------- */}
        <div className="relative flex shrink-0 flex-col xl:min-h-0 xl:flex-1 xl:shrink">{children}</div>

        {/* ---------- Quick Management: same on every admin page ---------- */}
        <div className="relative z-20 shrink-0 px-3 sm:px-4 xl:px-[2.4%]" style={baseFont}>
          <QuickManagement />
        </div>
      </main>
    </div>
  );
}