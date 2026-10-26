"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Route } from "next";
import {
  BarChart3,
  Bell,
  CalendarDays,
  ChevronDown,
  ClipboardCheck,
  GraduationCap,
  House,
  LoaderCircle,
  LogOut,
  Megaphone,
  Menu,
  Search,
  UserRound,
  UserRoundCog,
  Users,
  MessageCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useI18n } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { landingFont } from "@/components/Landing/font";
import { getMonitorProfile, getMentorAreaBadges, searchMentorArea, type MentorAreaSearch } from "@/lib/monitor-api";
import { getNotifications, getUnreadNotificationCount, markNotificationRead, notificationText, timeAgo, type AppNotification } from "@/lib/notifications-api";
import { MentorAvatar } from "./mentor-area-ui";
import { ChatButton } from "@/components/chat/ChatButton";

const SKIP_AUTH = process.env.NEXT_PUBLIC_SKIP_AUTH === "true" && process.env.NODE_ENV !== "production";
const noopSubscribe = () => () => {};

const PARK_IMG = "/images/Intern/bg-park.png";
const CAP_IMG = "/images/admin/reicon_grad-cap-filled.png";

/** The mentor area (design "Junior Hub · Mentor", M1–M9, 26 Oct 2026). */
const NAV = [
  { href: "/mentor/dashboard", label: tk("Overview"), icon: House },
  { href: "/mentor/squads", label: tk("My squads"), icon: Users },
  { href: "/mentor/reviews", label: tk("Reviews"), icon: ClipboardCheck, badge: "reviews" as const },
  { href: "/mentor/students", label: tk("My students"), icon: GraduationCap },
  { href: "/mentor/messages", label: tk("Messages"), icon: MessageCircle },
  { href: "/mentor/calendar", label: tk("Calendar"), icon: CalendarDays },
  { href: "/mentor/announcements", label: tk("Announcements"), icon: Megaphone },
  { href: "/mentor/reports", label: tk("Reports"), icon: BarChart3 },
  { href: "/mentor/profile", label: tk("Profile & settings"), icon: UserRound },
];

const vars = { "--u": "clamp(10px, 0.9vw, 16px)" } as CSSProperties;
const baseFont = { fontSize: "clamp(11px, calc(var(--u) * 1.05), 17px)" } as CSSProperties;

export function MentorShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { t, locale, setLocale } = useI18n();
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const allowed = SKIP_AUTH || (!!user && user.role === "mentor");

  const [expanded, setExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [waiting, setWaiting] = useState(0);
  const [unseen, setUnseen] = useState(0);
  const [notes, setNotes] = useState<AppNotification[] | null>(null);
  const [notesError, setNotesError] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && !allowed) router.replace("/login");
  }, [hydrated, allowed, router]);

  // A new page closes the drawer and the menus.
  const [shownPath, setShownPath] = useState(pathname);
  if (shownPath !== pathname) {
    setShownPath(pathname);
    setMobileOpen(false);
    setMenuOpen(false);
    setBellOpen(false);
  }

  // The reviews badge and the bell dot, again on each page.
  const isMentor = user?.role === "mentor";
  useEffect(() => {
    if (!isMentor) return;
    let active = true;
    getMentorAreaBadges().then((b) => active && setWaiting(b.waitingReviews), () => undefined);
    getUnreadNotificationCount().then((n) => active && setUnseen(n), () => undefined);
    return () => {
      active = false;
    };
  }, [isMentor, pathname]);

  useEffect(() => {
    if (!isMentor) return;
    getMonitorProfile().then((p) => setPhotoUrl(p.mentor.photoUrl), () => undefined);
  }, [isMentor]);

  const toggleBell = useCallback(() => {
    setBellOpen((open) => {
      if (!open) {
        setNotesError(false);
        getNotifications({ limit: 8 }).then(setNotes, () => setNotesError(true));
      }
      return !open;
    });
  }, []);

  const openNote = (n: AppNotification) => {
    if (n.isRead) return;
    setUnseen((c) => Math.max(0, c - 1));
    setNotes((all) => all?.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)) ?? null);
    markNotificationRead(n.id).catch(() => undefined);
  };

  if (!allowed) {
    return (
      <div className="grid min-h-svh place-items-center" role="status" aria-label={t("Loading")}>
        <LoaderCircle className="size-8 animate-spin text-[#12939b]" />
      </div>
    );
  }

  const displayName = user ? [user.firstName, user.lastName].filter(Boolean).join(" ") : t("Mentor");
  const toggleSidebar = () => {
    if (window.matchMedia("(min-width: 1024px)").matches) setExpanded((v) => !v);
    else setMobileOpen((v) => !v);
  };

  return (
    <div className={`${landingFont.variable} flex h-svh overflow-hidden bg-[#eef3fa] font-[family-name:var(--font-poppins)]`} style={vars}>
      {mobileOpen && (
        <button
          type="button"
          aria-label={t("Close sidebar")}
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 cursor-default bg-[#14365a]/35 lg:hidden"
        />
      )}

      {/* ================= Sidebar: a frosted rail of icons, labels when expanded ================= */}
      <aside
        aria-label={t("Sidebar")}
        className={`fixed inset-y-0 start-0 z-50 flex shrink-0 flex-col overflow-hidden rounded-e-[3.2rem] border-e border-white/60 shadow-[0_10px_30px_rgba(20,90,140,0.18)] transition-[transform,width] duration-200 lg:relative lg:z-auto lg:translate-x-0 rtl:lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"
        } ${expanded || mobileOpen ? "w-[15rem]" : "w-[15rem] lg:w-[6.6rem]"}`}
      >
        <Image src={PARK_IMG} alt="" fill sizes="240px" aria-hidden className="pointer-events-none scale-150 object-cover blur-[14px]" />
        <span aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#c8ebfb]/85 via-[#d4effc]/60 to-[#9fd8f5]/80" />
        <span aria-hidden className="pointer-events-none absolute -bottom-24 -start-16 size-72 rounded-full bg-[#7fcdf1]/70" />

        <div className={`relative z-10 flex h-[7rem] shrink-0 items-center gap-2.5 ${expanded || mobileOpen ? "px-7" : "justify-center"}`}>
          <Image src={CAP_IMG} alt="" width={40} height={40} className="size-[2.4rem] shrink-0 object-contain" />
          {(expanded || mobileOpen) && <span className="text-[1.1rem] font-extrabold tracking-tight text-[#14365a]">JUNIOR HUB</span>}
        </div>

        <nav aria-label={t("Mentor")} className="relative z-10 flex-1 overflow-y-auto px-3 pt-8 [scrollbar-width:none]">
          <ul className="space-y-3">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const labels = expanded || mobileOpen;
              return (
                <li key={item.href} className="flex justify-center">
                  <Link
                    href={item.href as Route}
                    title={t(item.label)}
                    aria-current={active ? "page" : undefined}
                    className={`relative flex items-center gap-3 rounded-[0.9rem] text-[0.82rem] transition-colors ${
                      labels ? "w-full px-4 py-2.5" : "size-[3rem] justify-center"
                    } ${active ? "bg-gradient-to-br from-[#9de0d0] to-[#7fd0e6] font-semibold text-[#14365a] shadow-[0_4px_12px_rgba(60,190,170,0.3)]" : "font-medium text-[#14365a] hover:bg-white/45"}`}
                  >
                    <item.icon className="size-[1.35rem] shrink-0" strokeWidth={1.8} />
                    {labels && <span className="truncate">{t(item.label)}</span>}
                    {item.badge === "reviews" && waiting > 0 && (
                      <span
                        aria-label={t("{count} waiting", { count: waiting })}
                        className={`grid min-w-[1.25rem] place-items-center rounded-full bg-[#e5484d] px-1 text-[0.65rem] font-bold leading-[1.25rem] text-white ring-2 ring-white ${labels ? "ms-auto" : "absolute -end-1 -top-1"}`}
                      >
                        {waiting}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* ================= Main ================= */}
      <main className="relative flex min-w-0 flex-1 flex-col overflow-y-auto [scrollbar-width:thin]">
        <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center gap-[0.7em] px-[calc(var(--u)*1.6)] pt-[calc(var(--u)*2.4)] lg:ps-[calc(var(--u)*2.2)]" style={baseFont}>
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={t(expanded || mobileOpen ? "Collapse sidebar" : "Expand sidebar")}
            aria-expanded={expanded || mobileOpen}
            className="pointer-events-auto grid size-[2.7em] shrink-0 place-items-center rounded-full bg-[#1b2d54] text-white shadow-md hover:bg-[#14223f]"
          >
            <Menu className="size-[1.2em]" />
          </button>

          <TopSearch />

          <button
            type="button"
            onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
            aria-label={t("Change language")}
            className="pointer-events-auto flex h-[2.6em] items-center gap-[0.5em] rounded-full border border-white/70 bg-white/55 px-[1.1em] text-[0.85em] font-semibold text-[#14365a] shadow-[0_6px_18px_rgba(60,160,230,0.2)] backdrop-blur"
          >
            {locale === "ar" ? "AR" : "EN"} <ChevronDown className="size-[1em]" />
          </button>

          <div className="ms-auto flex items-center gap-[0.7em]">
            <ChatButton className="pointer-events-auto size-[2.7em] border border-white/70 bg-white/55 text-[#14365a] shadow-[0_6px_18px_rgba(60,160,230,0.2)] backdrop-blur hover:bg-white/80" />
            <div className="pointer-events-auto relative">
              <button
                type="button"
                onClick={toggleBell}
                aria-label={t("Notifications")}
                aria-expanded={bellOpen}
                className="relative grid size-[2.7em] place-items-center rounded-full border border-white/70 bg-white/55 text-[#14365a] shadow-[0_6px_18px_rgba(60,160,230,0.2)] backdrop-blur hover:bg-white/80"
              >
                <Bell className="size-[1.15em]" />
                {unseen > 0 && <span className="absolute end-[0.6em] top-[0.55em] size-[0.55em] rounded-full bg-[#e5484d]" aria-label={t("{n} unread notifications", { n: unseen })} />}
              </button>
              {bellOpen && (
                <>
                  <button type="button" aria-label={t("Close menu")} className="fixed inset-0 z-40 cursor-default" onClick={() => setBellOpen(false)} />
                  <div className="absolute end-0 top-full z-50 mt-2 w-[22em] max-w-[85vw] overflow-hidden rounded-[1em] border border-[#e1e8f0] bg-white text-[0.85em] shadow-lg">
                    <p className="border-b border-[#eef2f6] px-4 py-3 font-semibold text-[#1b2d54]">{t("Notifications")}</p>
                    {notesError && <p className="px-4 py-4 text-[#b42318]">{t("We could not load your notifications.")}</p>}
                    {!notesError && notes === null && <p className="px-4 py-4 text-[#64748b]">{t("Loading")}</p>}
                    {notes?.length === 0 && <p className="px-4 py-4 text-[#64748b]">{t("You have no notifications.")}</p>}
                    <ul className="max-h-[22em] overflow-y-auto">
                      {notes?.map((n) => {
                        const body = (
                          <>
                            <span className={`mt-1.5 size-2 shrink-0 rounded-full ${n.isRead ? "bg-transparent" : "bg-[#12939b]"}`} />
                            <span className="min-w-0 flex-1">
                              <span className="block text-[#1b2d54]">{notificationText(n, locale)}</span>
                              <span className="text-[0.85em] text-[#64748b]">{timeAgo(n.createdUtc)}</span>
                            </span>
                          </>
                        );
                        const cls = "flex w-full gap-3 px-4 py-3 text-start hover:bg-[#f5f8fc]";
                        return (
                          <li key={n.id} className="border-b border-[#f1f4f8] last:border-0">
                            {n.link?.startsWith("/") ? (
                              <Link href={n.link as Route} onClick={() => openNote(n)} className={cls}>{body}</Link>
                            ) : (
                              <button type="button" onClick={() => openNote(n)} className={cls}>{body}</button>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </>
              )}
            </div>

            <div className="pointer-events-auto relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex h-[2.7em] items-center gap-[0.6em] rounded-full border border-white/70 bg-white/55 ps-[0.25em] pe-[0.9em] text-[0.9em] font-semibold text-[#14365a] shadow-[0_6px_18px_rgba(60,160,230,0.2)] backdrop-blur hover:bg-white/80"
              >
                <MentorAvatar name={displayName} photoUrl={photoUrl} className="size-[2.2em]" />
                <span className="hidden max-w-[10em] truncate sm:block">{displayName}</span>
                <ChevronDown className="size-[1em]" />
              </button>
              {menuOpen && (
                <>
                  <button type="button" aria-label={t("Close menu")} className="fixed inset-0 z-40 cursor-default" onClick={() => setMenuOpen(false)} />
                  <div role="menu" className="absolute end-0 top-full z-50 mt-2 min-w-[12em] overflow-hidden rounded-[0.9em] border border-[#e1e8f0] bg-white text-[0.85em] shadow-lg">
                    <Link role="menuitem" href={"/mentor/profile" as Route} className="flex items-center gap-[0.6em] px-[1.1em] py-[0.75em] font-semibold text-[#14365a] hover:bg-[#eef4fa]">
                      <UserRoundCog className="size-[1.1em]" /> {t("Profile & settings")}
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-[0.6em] px-[1.1em] py-[0.75em] text-start font-semibold text-[#14365a] hover:bg-[#eef4fa]"
                    >
                      <LogOut className="size-[1.1em]" /> {t("Log out")}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="relative flex min-h-full flex-col" style={baseFont}>
          {children}
        </div>
      </main>
    </div>
  );
}

/** "Search my students and squads…" with ⌘K: matches from the backend, opened from a small list. */
function TopSearch() {
  const { t } = useI18n();
  const router = useRouter();
  const ref = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [result, setResult] = useState<MentorAreaSearch | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const text = q.trim();
  const shown = text.length >= 2 ? result : null;
  useEffect(() => {
    if (text.length < 2) return;
    let active = true;
    const timer = setTimeout(() => {
      searchMentorArea(text).then((r) => active && setResult(r), () => active && setResult({ squads: [], students: [] }));
    }, 200);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [text]);

  const go = (href: string) => {
    setOpen(false);
    setQ("");
    router.push(href as Route);
  };
  const first = shown?.squads[0] ? `/mentor/squads/${shown.squads[0].id}` : shown?.students[0] ? `/mentor/students/${shown.students[0].id}` : null;

  return (
    <div className="pointer-events-auto relative min-w-0 max-w-[34em] flex-1">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (first) go(first);
        }}
      >
        <Search className="pointer-events-none absolute start-[1.1em] top-1/2 size-[1.15em] -translate-y-1/2 text-[#14365a]/70" />
        <input
          ref={ref}
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={t("Search my students and squads…")}
          aria-label={t("Search my students and squads…")}
          className="h-[2.8em] w-full rounded-full border border-white/70 bg-white/55 ps-[3em] pe-[1em] text-[0.9em] text-[#14365a] shadow-[0_6px_18px_rgba(60,160,230,0.25)] outline-none backdrop-blur placeholder:text-[#14365a]/75 focus:ring-2 focus:ring-[#12939b]/40 sm:pe-[4.2em]"
        />
        <kbd className="pointer-events-none absolute end-[0.9em] top-1/2 hidden -translate-y-1/2 rounded-full bg-[#3aa6f2]/85 px-[0.7em] py-[0.15em] text-[0.7em] font-bold text-white sm:block">⌘K</kbd>
      </form>
      {open && shown && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-[1em] border border-[#e1e8f0] bg-white text-[0.85em] shadow-lg">
          {shown.squads.length === 0 && shown.students.length === 0 && <p className="px-4 py-3 text-[#64748b]">{t("Nothing found.")}</p>}
          {shown.squads.length > 0 && <p className="px-4 pt-3 text-[0.8em] font-semibold uppercase text-[#64748b]">{t("Squads")}</p>}
          {shown.squads.map((s) => (
            <button key={s.id} type="button" onMouseDown={() => go(`/mentor/squads/${s.id}`)} className="flex w-full items-center justify-between gap-3 px-4 py-2 text-start hover:bg-[#f5f8fc]">
              <span className="font-semibold text-[#1b2d54]">{s.name}</span>
              <span className="truncate text-[#64748b]">{s.projectTitle}</span>
            </button>
          ))}
          {shown.students.length > 0 && <p className="px-4 pt-3 text-[0.8em] font-semibold uppercase text-[#64748b]">{t("Students")}</p>}
          {shown.students.map((s) => (
            <button key={s.id} type="button" onMouseDown={() => go(`/mentor/students/${s.id}`)} className="flex w-full items-center gap-3 px-4 py-2 text-start hover:bg-[#f5f8fc]">
              <MentorAvatar name={s.fullName} photoUrl={s.photoUrl} className="size-7" />
              <span className="font-semibold text-[#1b2d54]">{s.fullName}</span>
              {s.squadName && <span className="truncate text-[#64748b]">{s.squadName}</span>}
            </button>
          ))}
          <div className="h-2" />
        </div>
      )}
    </div>
  );
}
