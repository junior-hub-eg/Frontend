"use client";

import Image from "next/image";
import Link from "next/link";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";

export type Teammate = { name: string; avatar: string; bg: string; role?: string; isMe?: boolean };

const ROLE_TITLE: Record<string, string> = {
  Frontend: tk("Frontend Developer"),
  Backend: tk("Backend Developer"),
  UIUX: tk("UI/UX Designer"),
  AI: tk("AI Engineer"),
  Testing: tk("QA Tester"),
  Data: tk("Data Analyst"),
  Mobile: tk("Mobile Developer"),
  Gaming: tk("Game Developer"),
};

export function TeammatesPanel({
  teammates,
  className = "",
  fluid = false,
}: {
  teammates: Teammate[];
  className?: string;
  fluid?: boolean;
}) {
  const t = useT();
  const card =
    "rounded-[1.4em] border border-white/80 bg-white/55 p-[1em] shadow-lg shadow-[#14365a]/10 backdrop-blur-md";

  return (
    <div
      style={{ fontSize: fluid ? "clamp(8px, calc(var(--u) * 0.95), 14px)" : "14px" }}
      className={`flex items-start gap-[0.8em] ${fluid ? "flex-row" : "flex-col"} ${className}`}
    >
      {/* ---------- Teammates list (the chat and Invite were removed for now; the team chat is on the Internship page) ---------- */}
      <section
        aria-labelledby="teammates-title"
        className={`${card} ${fluid ? "w-[calc(var(--u)*22.1)] shrink-0" : "w-full"}`}
      >
        <h2
          id="teammates-title"
          className="mb-[0.8em] flex items-center gap-[0.5em] text-[1.15em] font-extrabold text-[#14365a]"
        >
          <svg className="h-[1.6em] w-[1.6em]" viewBox="0 0 24 24" fill="#14365a" aria-hidden="true">
            <circle cx="12" cy="5" r="3" />
            <circle cx="5" cy="12" r="3" />
            <circle cx="19" cy="12" r="3" />
            <circle cx="12" cy="19" r="3" />
          </svg>
          <Link href="/learner/interns/session" className="hover:underline">
            {t("Your Teammates")}
          </Link>
          <Link
            href="/learner/interns/session"
            className="ms-auto rounded-full bg-[#14365a] px-[0.8em] py-[0.25em] text-[0.7em] font-bold text-white hover:bg-[#0f2a47]"
          >
            {t("Get ready")}
          </Link>
        </h2>

        {teammates.length === 0 && (
          <p className="text-[0.85em] text-[#14365a]/70">{t("You'll see your squad here once you join an internship team.")}</p>
        )}
        <ul className="grid gap-[0.6em]">
          {teammates.map((m, i) => {
            return (
              <li key={i} className="flex items-center gap-[0.6em] text-[1em] font-semibold text-[#14365a]">
                <span
                  className="relative h-[2.4em] w-[2.4em] shrink-0 overflow-hidden rounded-full ring-2 ring-white"
                  style={{ backgroundColor: m.bg }}
                >
                  <Image src={m.avatar} alt="" fill sizes="40px" className="object-cover" />
                </span>

                <span className="min-w-0">
                  <span className="block truncate">
                    {m.name}
                    {m.isMe && <span className="ms-[0.3em] text-[0.8em] font-medium text-[#14365a]/60">{t("(you)")}</span>}
                  </span>
                  {m.role && <span className="block truncate text-[0.7em] font-medium text-[#14365a]/65">{t(ROLE_TITLE[m.role] ?? m.role)}</span>}
                </span>

              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}