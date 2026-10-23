"use client";

import { useState } from "react";
import { Bell, Check } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { AdminBody, AdminHero, AdminPage } from "./page-parts";

type Item = { id: number; text: string; time: string; read: boolean };

/** Demo notifications until the API has them. */
const SEED: Item[] = [
  { id: 1, text: "Sara Ahmed submitted Assignment #3 in Web Development Track.", time: "1h ago", read: false },
  { id: 2, text: "Code Ninjas Squad requested approval for a new member (Mohamed Ali).", time: "5h ago", read: false },
  { id: 3, text: "Eng. Yasser added feedback for Alex Code Squad presentation.", time: "13h ago", read: true },
];

export default function NotificationsPage() {
  const t = useT();
  const [items, setItems] = useState(SEED);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unread = items.filter((i) => !i.read).length;
  const shown = filter === "unread" ? items.filter((i) => !i.read) : items;

  const markRead = (id: number) => setItems((list) => list.map((i) => (i.id === id ? { ...i, read: true } : i)));
  const markAll = () => setItems((list) => list.map((i) => ({ ...i, read: true })));

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

        <p className="mt-[1.1em] text-[1.4em] text-[#14365a]/80">{t("Today")}</p>
      </AdminHero>

      <AdminBody className="!pt-[0.8em]">
        {shown.length === 0 ? (
          <p className="mx-auto max-w-[56em] rounded-[1em] bg-white px-[1.2em] py-[1.4em] text-center text-[0.9em] text-[#14365a]/65">
            {t("You're all caught up.")}
          </p>
        ) : (
          <ul className="mx-auto max-w-[58em] space-y-[1.1em]">
            {shown.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => markRead(n.id)}
                  aria-label={n.read ? n.text : `${n.text} (${t("Unread")})`}
                  className={`flex w-full items-center gap-[1.4em] rounded-[1.1em] px-[1.2em] py-[0.9em] text-left shadow-[0_6px_16px_rgba(60,120,180,0.15)] transition-colors ${
                    n.read ? "bg-[#e6f7fd]" : "bg-[#b8e6f8] hover:bg-[#abdff4]"
                  }`}
                >
                  <Bell className="size-[2.6em] shrink-0 fill-[#8ec3f5] text-[#8ec3f5]" strokeWidth={1.5} />
                  <span className="max-w-[34em]">
                    <span className="block text-[1.25em] leading-snug text-[#17757f]">{n.text}</span>
                    <span className="mt-[0.4em] block text-[1.1em] font-bold text-[#1a8cff]">{n.time}</span>
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