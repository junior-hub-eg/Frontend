"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Route } from "next";

import {
  Bell,
  ChevronDown,
  ClipboardList,
  ShieldCheck,
  Settings,
  UserPlus,
  Layers,
  LayoutGrid,
  LoaderCircle,
  TrendingUp,
  LogOut,
  Menu,
  Search,
  UserCheck,
  Users,
  UsersRound,
  Shield,
  Megaphone,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { landingFont } from "@/components/Landing/font";
import { APPROVALS_CHANGED, getApprovals } from "@/lib/admin-api";
import { useI18n } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { QuickManagement } from "./QuickManagement";

const SKIP_AUTH = process.env.NEXT_PUBLIC_SKIP_AUTH === "true" && process.env.NODE_ENV !== "production";

const CAP_IMG = "/images/admin/reicon_grad-cap-filled.png";
const GROUP_IMG = "/images/admin/group.png";
const PARK_IMG = "/images/Intern/bg-park.png";
const AVATAR = "/images/Intern/char-boy-glasses.png";

const NAV_GROUPS = [
  [
    { href: "/admin/dashboard", label: tk("Admin Dashboard"), icon: LayoutGrid },
    { href: "/admin/students", label: tk("Student Management"), icon: Users },
    { href: "/admin/squads", label: tk("Squads Management"), icon: UsersRound },
    { href: "/admin/mentors", label: tk("Mentors Management"), icon: UserCheck },
    { href: "/admin/approvals", label: tk("Approvals"), icon: UserPlus },
    { href: "/admin/notifications", label: tk("Notifications"), icon: Megaphone },
  ],
  [
    { href: "/admin/tracks", label: tk("Tracks"), icon: Layers },
    { href: "/admin/assignments", label: tk("Assignments & Submissions"), icon: ClipboardList },
    { href: "/admin/roles", label: tk("Roles & Permissions"), icon: Shield },
    { href: "/admin/reports", label: tk("Reports & Analytics"), icon: TrendingUp },
    { href: "/admin/settings", label: tk("System Settings"), icon: Settings },
  ],
];

const OWNER_NAV = { href: "/admin/admins", label: tk("Admins"), icon: ShieldCheck };

const vars = {
  "--u": "clamp(10px, 0.9vw, 16px)",
  "--hl": "calc(var(--u) * 1.6)",
} as CSSProperties;

const baseFont = { fontSize: "clamp(11px, calc(var(--u) * 1.05), 17px)" } as CSSProperties;

const noopSubscribe = () => () => {};

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { t, locale, setLocale } = useI18n();

  const [expanded, setExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [waiting, setWaiting] = useState(0);

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

  // Count the sign-ups waiting for approval again on every page change.
  useEffect(() => {
    if (user?.role !== "admin") return;

    let active = true;

    const count = () =>
      getApprovals().then(
        (list) => active && setWaiting(list.length),
        () => {},
      );

    void count();
    window.addEventListener(APPROVALS_CHANGED, count);

    return () => {
      active = false;
      window.removeEventListener(APPROVALS_CHANGED, count);
    };
  }, [pathname, user?.role]);

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

  // The signed-in user is only known after hydration, so redirect only then.
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);

  useEffect(() => {
    if (hydrated && !allowed) router.replace("/admin/login");
  }, [hydrated, allowed, router]);

  if (!allowed) {
    return (
      <div className="grid min-h-svh place-items-center" role="status" aria-label={t("Loading")}>
        <LoaderCircle className="size-8 animate-spin text-[#12939b]" />
      </div>
    );
  }

  const displayName = user ? [user.firstName, user.lastName].filter(Boolean).join(" ") : t("Admin");

  const navGroups = user?.isOwner
    ? [NAV_GROUPS[0], [...NAV_GROUPS[1], OWNER_NAV]]
    : NAV_GROUPS;

  // The drawer on mobile always shows labels; on desktop it depends on `expanded`.
  const showLabels = isDesktop ? expanded : true;

  const toggleSidebar = () =>
    isDesktop ? setExpanded((v) => !v) : setMobileOpen((v) => !v);

  return (
    <div
      className={`${landingFont.variable} flex h-svh gap-2 overflow-hidden bg-[#eaf3fb] p-2 font-[family-name:var(--font-poppins)]`}
      style={vars}
    >
      {/* Dark backdrop behind the mobile drawer */}
      {mobileOpen && (
        <button
          type="button"
          aria-label={t("Close sidebar")}
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 cursor-default bg-[#14365a]/35 backdrop-blur-[1px] lg:hidden"
        />
      )}

      {/* ================= Sidebar ================= */}
      <aside
        aria-label={t("Sidebar")}
        className={`fixed bottom-2 start-2 top-2 z-50 flex w-[15rem] max-w-[calc(100vw-1rem)] shrink-0 flex-col overflow-hidden rounded-[1.6rem] border border-white/60 shadow-[0_10px_30px_rgba(20,90,140,0.18)] transition-[transform,width] duration-200 lg:relative lg:z-auto lg:max-w-none lg:translate-x-0 lg:rtl:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-[calc(100%+1rem)] rtl:translate-x-[calc(100%+1rem)]"
        } ${expanded ? "lg:w-[15rem]" : "lg:w-[4.5rem]"}`}
      >
        {/* Frosted glass: blurred park picture + light blue wash */}
        <Image
          src={PARK_IMG}
          alt=""
          fill
          sizes="240px"
          aria-hidden
          className="pointer-events-none origin-left scale-150 object-cover blur-[14px] rtl:origin-right"
        />

        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#c8ebfb]/80 via-[#d4effc]/55 to-[#9fd8f5]/80"
        />

        {/* Waves at the bottom */}
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -start-12 size-64 rounded-full bg-[#b9d9fb]/70"
        />

        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-28 start-8 size-72 rounded-full bg-[#7fcdf1]/65"
        />

        {/* Logo */}
        <div className={`relative z-10 flex h-[4.5rem] shrink-0 items-center gap-2.5 ${showLabels ? "px-5" : "justify-center"}`}>
          <Image
            src={CAP_IMG}
            alt=""
            width={30}
            height={30}
            className="size-[1.9rem] shrink-0 object-contain"
          />

          {showLabels && (
            <span className="text-[1.15rem] font-extrabold tracking-tight text-[#14365a]">
              JUNIOR HUB
            </span>
          )}
        </div>

        {/* Nav */}
        <nav
          aria-label={t("Admin")}
          className="relative z-10 flex-1 overflow-y-auto px-2.5 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {navGroups.map((group, gi) => (
            <div key={gi}>
              {gi > 0 && (
                <hr className="mx-2 my-3 border-0 border-t border-[#14365a]/15" />
              )}

              <ul className="space-y-1">
                {group.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href as Route}
                        title={t(item.label)}
                        aria-current={active ? "page" : undefined}
                        className={`relative flex items-center gap-3 rounded-[0.7rem] py-2.5 text-[0.78rem] transition-colors ${
                          showLabels ? "px-3.5" : "justify-center px-0"
                        } ${
                          active
                            ? "bg-gradient-to-r from-[#9de0d0] to-[#bfeadf] font-semibold text-[#14365a] shadow-[0_4px_12px_rgba(60,190,170,0.25)] rtl:bg-gradient-to-l"
                            : "font-medium text-[#14365a] hover:bg-white/45"
                        }`}
                      >
                        <item.icon className="size-[1.15rem] shrink-0" strokeWidth={1.8} />

                        {showLabels && <span className="truncate">{t(item.label)}</span>}

                        {item.href === "/admin/approvals" && waiting > 0 && (
                          <span
                            aria-label={t("{count} waiting", { count: waiting })}
                            className={`grid min-w-[1.3rem] place-items-center rounded-full bg-[#e0245e] px-1 text-[0.65rem] font-bold text-white ${
                              showLabels ? "ms-auto" : "absolute end-1 top-1"
                            }`}
                          >
                            {waiting}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Bottom logo */}
        {showLabels && (
          <div className="relative z-10 flex shrink-0 items-center gap-3 px-5 pb-5 pt-2">
            <div className="relative size-[3rem] shrink-0">
              <Image
                src={GROUP_IMG}
                alt=""
                fill
                sizes="48px"
                className="object-contain object-left rtl:object-right"
              />
            </div>

            <span className="min-w-0 truncate text-[1.15rem] font-extrabold leading-tight tracking-tight text-[#14365a]">
              JUNIOR HUB
            </span>
          </div>
        )}
      </aside>

      {/* ================= Main ================= */}
      <main className="relative flex min-w-0 flex-1 flex-col overflow-y-auto rounded-[1.4rem] xl:overflow-hidden">
        {/* ---------- Top bar ---------- */}
        <header
          className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center gap-[0.7em] px-[calc(var(--u)*1.6)] pt-[calc(var(--u)*1.1)]"
          style={baseFont}
        >
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={t(isDesktop ? (expanded ? "Collapse sidebar" : "Expand sidebar") : mobileOpen ? "Close sidebar" : "Open sidebar")}
            aria-expanded={isDesktop ? expanded : mobileOpen}
            className="pointer-events-auto grid size-[2.5em] shrink-0 place-items-center rounded-full bg-[#14365a] text-white shadow-md hover:bg-[#0f2a47]"
          >
            <Menu className="size-[1.2em]" />
          </button>

          <label className="pointer-events-auto relative min-w-0 max-w-[32em] flex-1">
            <Search className="pointer-events-none absolute start-[1em] top-1/2 size-[1.1em] -translate-y-1/2 text-[#14365a]/70" />

            <input
              ref={searchRef}
              type="search"
              placeholder={t("Search anything....")}
              className="h-[2.6em] w-full rounded-full border border-white/70 bg-white/55 ps-[2.8em] pe-[1em] text-[0.8em] text-[#14365a] shadow-[0_6px_18px_rgba(60,160,230,0.25)] outline-none backdrop-blur placeholder:text-[#14365a]/70 focus:ring-2 focus:ring-[#12939b]/40 sm:pe-[4em]"
            />

            <kbd className="pointer-events-none absolute end-[0.9em] top-1/2 hidden -translate-y-1/2 rounded-full bg-[#3aa6f2]/85 px-[0.7em] py-[0.15em] text-[0.65em] font-bold text-white sm:block">
              ⌘K
            </kbd>
          </label>

          {/* Language switch: updated */}
          <button
            type="button"
            onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
            aria-label={t("Change language")}
            className="pointer-events-auto flex h-[2.4em] items-center gap-[0.5em] rounded-full border border-white/70 bg-white/55 px-[1.1em] text-[0.8em] font-semibold text-[#14365a] shadow-[0_6px_18px_rgba(60,160,230,0.2)] backdrop-blur"
          >
            {locale === "ar" ? "EN" : "AR"} <ChevronDown className="size-[1em]" />
          </button>

          <div className="ms-auto flex items-center gap-[0.7em]">
            <Link
              href={"/admin/notifications" as Route}
              aria-label={t("Notifications")}
              className="pointer-events-auto relative grid size-[2.4em] place-items-center rounded-full border border-white/70 bg-white/55 text-[#14365a] shadow-[0_6px_18px_rgba(60,160,230,0.2)] backdrop-blur hover:bg-white/80"
            >
              <Bell className="size-[1.1em]" />
              <span className="absolute end-[0.55em] top-[0.55em] size-[0.55em] rounded-full bg-[#e0245e]" />
            </Link>

            <div className="pointer-events-auto relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex h-[2.4em] items-center gap-[0.6em] rounded-full border border-white/70 bg-white/55 ps-[0.3em] pe-[0.9em] text-[0.8em] font-semibold text-[#14365a] shadow-[0_6px_18px_rgba(60,160,230,0.2)] backdrop-blur hover:bg-white/80"
              >
                <span className="relative size-[1.9em] overflow-hidden rounded-full bg-[#ffc531]">
                  <Image
                    src={AVATAR}
                    alt=""
                    fill
                    sizes="32px"
                    className="origin-top scale-[2.1] object-cover object-top"
                  />
                </span>

                <span className="hidden max-w-[10em] truncate sm:block">{displayName}</span>

                <ChevronDown className="size-[1em]" />
              </button>

              {menuOpen && (
                <>
                  <button
                    type="button"
                    aria-label={t("Close menu")}
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setMenuOpen(false)}
                  />

                  <div
                    role="menu"
                    className="absolute end-0 top-full z-50 mt-2 min-w-[11em] overflow-hidden rounded-[0.9em] border border-[#e1e8f0] bg-white shadow-lg"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-[0.6em] px-[1.1em] py-[0.7em] text-start text-[0.85em] font-semibold text-[#14365a] hover:bg-[#eef4fa]"
                    >
                      <LogOut className="size-[1.1em]" /> {t("Log out")}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* ---------- Page content ---------- */}
        <div className="relative flex shrink-0 flex-col xl:min-h-0 xl:flex-1 xl:shrink">
          {children}
        </div>

        {/* ---------- Quick Management ---------- */}
        <div className="relative z-20 shrink-0 px-3 sm:px-4 xl:px-[2.4%]" style={baseFont}>
          <QuickManagement />
        </div>
      </main>
    </div>
  );
}