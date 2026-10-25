"use client";

import { useCallback, useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CheckCheck, ChevronRight, LoaderCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { useLiveChannel } from "@/lib/live-channel";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
  notificationText,
  timeAgo,
  type AppNotification,
} from "@/lib/notifications-api";

/**
 * The top-bar bell of the teacher and the student: a dot for unread notifications and the latest ones in a menu.
 * A new one arrives live ("NotificationReceived"). Links inside the user's own area (`home`, "/teacher" or "/learner") open in place.
 */
export function NotificationBell({ home }: { home: "/teacher" | "/learner" }) {
  const { t, locale } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [unseen, setUnseen] = useState(0);
  const [notes, setNotes] = useState<AppNotification[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    getUnreadNotificationCount().then((n) => active && setUnseen(n), () => undefined);
    return () => {
      active = false;
    };
  }, [pathname]);

  useLiveChannel({
    NotificationReceived: (n: Omit<AppNotification, "isRead">) => {
      setUnseen((c) => c + 1);
      setNotes((all) => (all ? [{ ...n, isRead: false }, ...all.filter((x) => x.id !== n.id)] : all));
    },
  });

  const toggle = useCallback(() => {
    setOpen((o) => !o);
    if (open) return;
    setFailed(false);
    getNotifications({ limit: 8 }).then(setNotes, () => setFailed(true));
  }, [open]);

  const read = (n: AppNotification) => {
    if (n.link?.startsWith(home)) setOpen(false);
    if (n.isRead) return;
    setUnseen((c) => Math.max(0, c - 1));
    setNotes((all) => all?.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)) ?? null);
    markNotificationRead(n.id).catch(() => undefined);
  };

  const readAll = () => {
    setUnseen(0);
    setNotes((all) => all?.map((x) => ({ ...x, isRead: true })) ?? null);
    markAllNotificationsRead().catch(() => undefined);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label={t("Notifications")}
        title={t("Notifications")}
        aria-expanded={open}
        className="relative grid h-[2.8em] w-[2.8em] place-items-center rounded-full border border-white/70 bg-white/55 text-[#14365a] backdrop-blur"
      >
        <Bell className="h-[1.2em] w-[1.2em]" />
        {unseen > 0 && (
          <span
            className="absolute end-[0.55em] top-[0.55em] size-2 rounded-full bg-[#e5484d] ring-2 ring-white"
            aria-label={t("{n} unread notifications", { n: unseen })}
          />
        )}
      </button>

      {open && (
        <>
          <button type="button" aria-label={t("Close menu")} className="fixed inset-0 z-40 cursor-default" onClick={() => setOpen(false)} />
          <div role="menu" className="absolute end-0 top-full z-50 mt-2 w-80 max-w-[85vw] rounded-2xl border border-[#e3ece9] bg-white p-4 text-[#1B2D54] shadow-xl">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#14757d]">{t("Notifications")}</p>
                <p className="text-sm font-bold">{t("What needs your attention")}</p>
              </div>
              {unseen > 0 && (
                <button type="button" onClick={readAll} className="flex items-center gap-1 rounded-full bg-[#eef2f1] px-2.5 py-1 text-[10px] font-semibold">
                  <CheckCheck className="size-3" /> {t("Mark all read")}
                </button>
              )}
            </div>
            {failed ? (
              <p role="alert" className="mt-3 text-xs font-semibold text-[#c81e1e]">{t("Could not load your notifications.")}</p>
            ) : !notes ? (
              <p role="status" className="mt-3 flex justify-center">
                <LoaderCircle className="size-5 animate-spin text-[#14757d]" />
              </p>
            ) : notes.length === 0 ? (
              <p className="mt-3 py-4 text-center text-xs text-[#1B2D54]/60">{t("No notifications yet.")}</p>
            ) : (
              <ul className="mt-3 max-h-80 space-y-1 overflow-y-auto">
                {notes.map((n) => {
                  const body = (
                    <>
                      <span className="min-w-0 flex-1">
                        <span dir="auto" className={`block text-xs ${n.isRead ? "font-medium text-[#1B2D54]/70" : "font-semibold"}`}>
                          {notificationText(n, locale)}
                        </span>
                        <span className="block text-[0.7rem] text-[#1B2D54]/55">{timeAgo(n.createdUtc)}</span>
                      </span>
                      {!n.isRead && <span className="size-2 shrink-0 rounded-full bg-[#14757d]" />}
                      {n.link && <ChevronRight className="size-3.5 shrink-0 text-[#1B2D54]/40 rtl:rotate-180" />}
                    </>
                  );
                  return (
                    <li key={n.id}>
                      {n.link?.startsWith(home) ? (
                        <Link href={n.link as Route} role="menuitem" onClick={() => read(n)} className="flex items-center gap-2 rounded-xl p-2 hover:bg-[#f1f7f6]">
                          {body}
                        </Link>
                      ) : (
                        <button type="button" role="menuitem" onClick={() => read(n)} className="flex w-full items-center gap-2 rounded-xl p-2 text-start hover:bg-[#f1f7f6]">
                          {body}
                        </button>
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
  );
}
