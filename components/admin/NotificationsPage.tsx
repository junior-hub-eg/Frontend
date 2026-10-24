"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { Bell, Check } from "lucide-react";
import { useI18n, useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { getNotifications, markAllNotificationsRead, markNotificationRead, notificationText, timeAgo, type AppNotification } from "@/lib/notifications-api";
import { AdminBody, AdminHero, AdminPage } from "./page-parts";
import { LoadState, useAdminData } from "./admin-data";

const loadNotifications = () => getNotifications({ limit: 100 });

export default function NotificationsPage() {
  const t = useT();
  const { locale } = useI18n();
  const router = useRouter();
  const { data, error, reload, setData } = useAdminData(loadNotifications, tk("Could not load your notifications."));
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const items: AppNotification[] = data ?? [];

  const unread = items.filter((i) => !i.isRead).length;
  const shown = filter === "unread" ? items.filter((i) => !i.isRead) : items;

  const markRead = (n: AppNotification) => {
    if (!n.isRead) {
      setData((list) => (list ?? []).map((i) => (i.id === n.id ? { ...i, isRead: true } : i)));
      markNotificationRead(n.id).catch(() => undefined);
    }
    if (n.link?.startsWith("/")) router.push(n.link as Route);
  };
  const markAll = () => {
    setData((list) => (list ?? []).map((i) => ({ ...i, isRead: true })));
    markAllNotificationsRead().catch(reload);
  };

  return (
    <AdminPage>
      <AdminHero>
        <div className="flex items-start justify-between gap-[1em]">
          <h1 className="text-[2.6em] font-bold leading-tight text-[#0f2a1d]">{t("Notification")}</h1>
          <button
            type="button"
            onClick={markAll}
            disabled={unread === 0}
            className="mt-[0.8em] inline-flex items-center gap-[0.5em] text-[1em] font-semibold text-[#6fcf3a] hover:opacity-80 disabled:opacity-40"
          >
            {t("Mark All As Read")} <Check className="size-[1.1em]" strokeWidth={3} />
          </button>
        </div>

        <div role="radiogroup" aria-label={t("Filter")} className="mt-[0.4em] flex items-center gap-[2.2em]">
          {(
            [
              ["all", "All"],
              ["unread", "Unread"],
            ] as const
          ).map(([id, label]) => {
            const on = filter === id;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setFilter(id)}
                className="inline-flex items-center gap-[0.7em] text-[1.6em] text-[#14365a]"
              >
                <span
                  className={`size-[0.8em] rounded-full ${on ? "bg-[#7fe04a] shadow-[0_0_0_0.15em_rgba(127,224,74,0.35)]" : "bg-white"}`}
                />
                {t(label)}
              </button>
            );
          })}
        </div>
      </AdminHero>

      <AdminBody className="!pt-[0.8em]">
        {!data ? (
          <LoadState error={error} onRetry={reload} className="mx-auto max-w-[56em]" />
        ) : shown.length === 0 ? (
          <p className="mx-auto max-w-[56em] rounded-[1em] bg-white px-[1.2em] py-[1.4em] text-center text-[0.9em] text-[#14365a]/65">
            {t("You're all caught up.")}
          </p>
        ) : (
          <ul className="mx-auto max-w-[58em] space-y-[1.1em]">
            {shown.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => markRead(n)}
                  aria-label={n.isRead ? notificationText(n, locale) : `${notificationText(n, locale)} (${t("Unread")})`}
                  className={`flex w-full items-center gap-[1.4em] rounded-[1.1em] px-[1.2em] py-[0.9em] text-start shadow-[0_6px_16px_rgba(60,120,180,0.15)] transition-colors ${
                    n.isRead ? "bg-[#e6f7fd]" : "bg-[#b8e6f8] hover:bg-[#abdff4]"
                  }`}
                >
                  <Bell className="size-[2.6em] shrink-0 fill-[#8ec3f5] text-[#8ec3f5]" strokeWidth={1.5} />
                  <span className="max-w-[34em]">
                    <span className="block text-[1.25em] leading-snug text-[#17757f]">{notificationText(n, locale)}</span>
                    {n.extraText && <span className="mt-[0.2em] block text-[1em] text-[#14365a]/70">{n.extraText}</span>}
                    <span className="mt-[0.4em] block text-[1.1em] font-bold text-[#1a8cff]">{timeAgo(n.createdUtc)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </AdminBody>
    </AdminPage>
  );
}