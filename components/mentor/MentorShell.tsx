"use client";

import { useCallback, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Route } from "next";
import { BarChart3, Bell, CalendarDays, ChevronRight, Clock, LoaderCircle, LogOut, Menu, MessageSquare, ShieldCheck, Star, User, Users, X } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useI18n, useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { landingFont } from "@/components/Landing/font";
import { getMonitorConversations } from "@/lib/monitor-api";
import { getNotifications, getUnreadNotificationCount, markNotificationRead, notificationText, type AppNotification } from "@/lib/notifications-api";
import { Avatar } from "./mentor-ui";
import { shortTime } from "./mentor-data";

const SKIP_AUTH = process.env.NEXT_PUBLIC_SKIP_AUTH === "true" && process.env.NODE_ENV !== "production";
const noopSubscribe = () => () => {};

const NAV = [
  { href: "/mentor/dashboard", label: tk("Dashboard"), icon: BarChart3 },
  { href: "/mentor/profile", label: tk("Profile Setup"), icon: User },
  { href: "/mentor/availability", label: tk("Availability"), icon: CalendarDays },
  { href: "/mentor/sessions", label: tk("Sessions"), icon: Clock },
  { href: "/mentor/feedback", label: tk("Feedback"), icon: Star },
  { href: "/mentor/messages", label: tk("Messages"), icon: MessageSquare },
  { href: "/mentor/squads", label: tk("Squads"), icon: Users },
];

/** The mentor workspace frame (Figma "Mentor - Home & Setup"): navy sidebar + top bar with notifications and account. */
export function MentorShell({ children }: { children: ReactNode }) {
  const t = useT();
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [bell, setBell] = useState(false);
  const { locale } = useI18n();
  const [unread, setUnread] = useState(0);
  const [unseen, setUnseen] = useState(0);
  const [notes, setNotes] = useState<AppNotification[] | null>(null);
  const [notesError, setNotesError] = useState(false);
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const allowed = SKIP_AUTH || (!!user && user.role === "mentor");

  useEffect(() => {
    if (hydrated && !allowed) router.replace("/login");
  }, [hydrated, allowed, router]);

  useEffect(() => {
    setOpen(false);
    setBell(false);
  }, [pathname]);

  // The unread messages (sidebar badge) and notifications (bell dot), again on each page.
  const isMentor = user?.role === "mentor";
  useEffect(() => {
    if (!isMentor) return;
    let active = true;
    getMonitorConversations().then((list) => active && setUnread(list.reduce((n, c) => n + c.unread, 0)), () => undefined);
    getUnreadNotificationCount().then((n) => active && setUnseen(n), () => undefined);
    return () => {
      active = false;
    };
  }, [isMentor, pathname]);

  const toggleBell = useCallback(() => {
    setBell(!bell);
    if (bell) return;
    setNotesError(false);
    getNotifications({ limit: 8 }).then(setNotes, () => setNotesError(true));
  }, [bell]);
  const openNote = (n: AppNotification) => {
    if (n.isRead) return;
    setUnseen((c) => Math.max(0, c - 1));
    setNotes((all) => all?.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)) ?? null);
    markNotificationRead(n.id).catch(() => undefined);
  };

  if (!allowed) {
    return (
      <div className="grid min-h-svh place-items-center" role="status" aria-label={t("Loading")}>
        <LoaderCircle className="size-8 animate-spin text-[#0f8f8c]" />
      </div>
    );
  }

  const name = user ? [user.firstName, user.lastName].filter(Boolean).join(" ") : "";
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className={`${landingFont.variable} flex min-h-svh bg-[#e9f7f4] font-[family-name:var(--font-poppins)] text-[#14305a]`}>
      {open && <button type="button" aria-label={t("Close sidebar")} onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-[#14305a]/40 lg:hidden" />}

      <aside
        aria-label={t("Sidebar")}
        className={`fixed inset-y-0 start-0 z-50 flex w-64 flex-col bg-[#14305a] p-4 text-white transition-transform lg:sticky lg:top-0 lg:h-svh lg:translate-x-0 rtl:lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-2 py-2">
          <Link href={"/mentor/dashboard" as Route} className="flex items-center gap-2 text-sm font-extrabold tracking-wide">
            <BarChart3 className="size-5 text-[#3cc4bd]" /> JUNIOR HUB
          </Link>
          <button type="button" className="lg:hidden" onClick={() => setOpen(false)} aria-label={t("Close sidebar")}>
            <X className="size-5" />
          </button>
        </div>

        <p className="mt-6 px-3 text-[0.6rem] font-bold uppercase tracking-[0.16em] text-white/50">{t("Mentor workspace")}</p>
        <nav aria-label={t("Mentor")} className="mt-2 flex flex-1 flex-col gap-1 overflow-y-auto">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`) || (item.href === "/mentor/sessions" && pathname.startsWith("/mentor/students"));
            return (
              <Link
                key={item.href}
                href={item.href as Route}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.8rem] font-medium transition-colors ${active ? "bg-[#0f8f8c] text-white" : "text-white/80 hover:bg-white/10"}`}
              >
                <item.icon className="size-4 shrink-0" />
                <span className="truncate">{t(item.label)}</span>
                {item.href === "/mentor/messages" && unread > 0 && (
                  <span className="ms-auto grid min-w-5 place-items-center rounded-full bg-[#3cc4bd] px-1 text-[0.65rem] font-bold text-[#14305a]">{unread}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 rounded-xl bg-white/10 p-3 text-xs">
          <p className="flex items-center gap-1.5 font-semibold">
            <ShieldCheck className="size-3.5 text-[#3cc4bd]" /> {t("Safe mentorship")}
          </p>
          <p className="mt-1 text-white/60">{t("Student conversations stay within Junior Hub.")}</p>
        </div>

        <div className="mt-3 flex items-center gap-3 border-t border-white/10 px-1 pt-3">
          <Avatar initials={initials} size="sm" />
          <div className="min-w-0 flex-1 text-xs">
            <p className="truncate font-semibold">{name}</p>
            <p className="text-white/60">{t("Mentor")}</p>
          </div>
          <button type="button" onClick={logout} aria-label={t("Log out")} className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white">
            <LogOut className="size-4 rtl:rotate-180" />
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[#dbe8e6] bg-white px-4 py-3 sm:px-8">
          <button type="button" className="lg:hidden" onClick={() => setOpen(true)} aria-label={t("Open sidebar")}>
            <Menu className="size-5" />
          </button>
          <p className="hidden text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[#14305a]/60 sm:block">{t("Fictional demo workspace")}</p>

          <div className="ms-auto flex items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={toggleBell}
                aria-label={t("Notifications")}
                aria-expanded={bell}
                className="relative grid size-10 place-items-center rounded-full border border-[#dbe8e6] bg-white hover:bg-[#f1faf8]"
              >
                <Bell className="size-4" />
                {unseen > 0 && <span className="absolute end-2.5 top-2.5 size-2 rounded-full bg-[#0f8f8c]" aria-label={t("{n} unread notifications", { n: unseen })} />}
              </button>
              {bell && (
                <>
                  <button type="button" aria-label={t("Close menu")} className="fixed inset-0 z-40 cursor-default" onClick={() => setBell(false)} />
                  <div role="menu" className="absolute end-0 top-full z-50 mt-2 w-80 max-w-[85vw] rounded-2xl border border-[#dbe8e6] bg-white p-4 shadow-xl">
                    <p className="text-[0.6rem] font-bold uppercase tracking-[0.14em] text-[#0f8f8c]">{t("Notifications")}</p>
                    <p className="text-sm font-bold">{t("What needs your attention")}</p>
                    {notesError ? (
                      <p role="alert" className="mt-3 text-xs font-semibold text-[#b83232]">{t("Could not load your notifications.")}</p>
                    ) : !notes ? (
                      <p role="status" className="mt-3 flex justify-center"><LoaderCircle className="size-5 animate-spin text-[#0f8f8c]" /></p>
                    ) : notes.length === 0 ? (
                      <p className="mt-3 py-4 text-center text-xs text-[#14305a]/60">{t("No notifications yet.")}</p>
                    ) : (
                      <ul className="mt-3 space-y-1">
                        {notes.map((n) => {
                          const body = (
                            <>
                              <span className="min-w-0 flex-1">
                                <span className={`block text-xs ${n.isRead ? "font-medium text-[#14305a]/70" : "font-semibold"}`}>{notificationText(n, locale)}</span>
                                <span className="block truncate text-[0.7rem] text-[#14305a]/60">{n.extraText ? `${n.extraText} · ` : ""}{shortTime(n.createdUtc)}</span>
                              </span>
                              {!n.isRead && <span className="size-2 shrink-0 rounded-full bg-[#0f8f8c]" />}
                              {n.link && <ChevronRight className="size-3.5 shrink-0 text-[#14305a]/40 rtl:rotate-180" />}
                            </>
                          );
                          return (
                            <li key={n.id}>
                              {n.link?.startsWith("/") ? (
                                <Link href={n.link as Route} role="menuitem" onClick={() => openNote(n)} className="flex items-center gap-2 rounded-xl p-2 hover:bg-[#f1faf8]">{body}</Link>
                              ) : (
                                <button type="button" role="menuitem" onClick={() => openNote(n)} className="flex w-full items-center gap-2 rounded-xl p-2 text-start hover:bg-[#f1faf8]">{body}</button>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-[#e9f7f4] py-1.5 pe-3 ps-1.5">
              <Avatar initials={initials} size="sm" />
              <div className="hidden text-xs leading-tight sm:block">
                <p className="font-semibold">{name}</p>
                <p className="text-[#14305a]/60">{t("Frontend Development Mentor")}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
