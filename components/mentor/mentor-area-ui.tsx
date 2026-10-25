"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { AlertTriangle, Check, ChevronDown, Clock, RotateCw, Wifi, Flag } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

/** Building blocks of the mentor area design (26 Oct 2026): hero, cards, pills, badges, states. */

const PARK_IMG = "/images/Intern/bg-park.png";

/** The page title over the park picture; the first card overlaps the bottom of the picture. */
export function MentorPage({ title, subtitle, children, meta }: { title: string; subtitle?: ReactNode; meta?: ReactNode; children: ReactNode }) {
  return (
    <div className="relative flex min-h-full flex-col">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[27em] overflow-hidden">
        <Image src={PARK_IMG} alt="" fill priority sizes="100vw" className="object-cover object-top" />
        <span className="absolute inset-x-0 bottom-0 h-[8em] bg-gradient-to-b from-transparent to-[#eef3fa]" />
      </div>
      <div className="relative z-10 px-[calc(var(--u)*1.6)] pb-[2em] pt-[calc(var(--u)*7.4)] lg:ps-[calc(var(--u)*2.2)] lg:pe-[calc(var(--u)*2)]">
        <h1 className="text-[2.2em] font-extrabold leading-tight text-[#1b2d54] sm:text-[2.6em]">{title}</h1>
        {(subtitle || meta) && (
          <div className="mt-[0.3em] flex flex-wrap items-center gap-[0.6em] text-[0.85em] text-[#1b2d54]">
            {subtitle && <span>{subtitle}</span>}
            {meta}
          </div>
        )}
        <div className="mt-[1.4em] space-y-[1.4em]">{children}</div>
      </div>
    </div>
  );
}

export function Card({ children, className, as: As = "section" }: { children: ReactNode; className?: string; as?: "section" | "div" | "article" }) {
  return <As className={cn("rounded-[1.4em] bg-white p-[1.4em] shadow-[0_10px_40px_rgba(20,54,90,0.08)]", className)}>{children}</As>;
}

export function CardTitle({ children, hint, action }: { children: ReactNode; hint?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-[1em] flex items-start justify-between gap-3">
      <div>
        <h2 className="text-[1.15em] font-bold text-[#1b2d54]">{children}</h2>
        {hint && <p className="mt-[0.2em] text-[0.82em] text-[#64748b]">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

export type Tone = "orange" | "red" | "blue" | "green" | "purple" | "gray" | "teal" | "pink" | "amber";

const TONES: Record<Tone, string> = {
  orange: "bg-[#fff1e3] text-[#c2570c]",
  red: "bg-[#fde8e8] text-[#c81e1e]",
  blue: "bg-[#e6f0ff] text-[#1d5fd1]",
  green: "bg-[#e3f6ea] text-[#167a3e]",
  purple: "bg-[#efe9ff] text-[#6b3fd6]",
  gray: "bg-[#eef1f5] text-[#475467]",
  teal: "bg-[#e0f4f2] text-[#0f7378]",
  pink: "bg-[#fde7f1] text-[#c4317a]",
  amber: "bg-[#fff5d6] text-[#a15c07]",
};

export function Pill({ tone, children, dot = true, icon, className }: { tone: Tone; children: ReactNode; dot?: boolean; icon?: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-[0.4em] whitespace-nowrap rounded-full px-[0.75em] py-[0.25em] text-[0.78em] font-medium", TONES[tone], className)}>
      {icon ?? (dot && <span className="size-[0.45em] rounded-full bg-current" />)}
      {children}
    </span>
  );
}

const LEVELS: Record<string, string> = {
  Beginner: "border-[#bfe5cf] bg-[#ecf8f1] text-[#167a3e]",
  Intermediate: "border-[#bcd6f7] bg-[#eef5ff] text-[#1d5fd1]",
  Advanced: "border-[#98a2b3] bg-[#eef1f5] text-[#344054]",
};

export function LevelBadge({ level }: { level: string }) {
  const { t } = useI18n();
  return <span className={cn("inline-flex rounded-[0.5em] border px-[0.6em] py-[0.15em] text-[0.75em] font-medium", LEVELS[level] ?? LEVELS.Beginner)}>{t(level)}</span>;
}

const ROLE_TONES: Record<string, Tone> = { Frontend: "blue", Backend: "teal", UIUX: "pink", Testing: "amber", Mobile: "green", Data: "purple", AI: "purple", Gaming: "orange" };
const ROLE_LABELS: Record<string, string> = { UIUX: "UI/UX" };

export function RolePill({ role }: { role: string }) {
  const { t } = useI18n();
  return <Pill tone={ROLE_TONES[role] ?? "gray"}>{t(ROLE_LABELS[role] ?? role)}</Pill>;
}

/** The squad's state in the mentor's words (design M2). */
export type SquadState = "Working" | "WaitingForReview" | "Late" | "Completed" | "ChangesRequested";

export function SquadStatePill({ state }: { state: SquadState }) {
  const { t } = useI18n();
  switch (state) {
    case "WaitingForReview":
      return <Pill tone="orange">{t("Waiting for your review")}</Pill>;
    case "Late":
      return <Pill tone="red">{t("Late")}</Pill>;
    case "Completed":
      return <Pill tone="green">{t("Completed")}</Pill>;
    case "ChangesRequested":
      return <Pill tone="orange">{t("Changes requested")}</Pill>;
    default:
      return <Pill tone="blue">{t("Squad is working")}</Pill>;
  }
}

export function ProgressBar({ value, className, tone = "teal" }: { value: number; className?: string; tone?: "teal" | "orange" | "red" | "green" }) {
  const fill = { teal: "from-[#0f7378] to-[#2bb3ad]", orange: "from-[#b45309] to-[#f59e0b]", red: "from-[#b42318] to-[#ef4444]", green: "from-[#167a3e] to-[#3ccf7d]" }[tone];
  return (
    <div className={cn("h-[0.5em] overflow-hidden rounded-full bg-[#cdeeea]", className)} role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
      <div className={cn("h-full rounded-full bg-gradient-to-r rtl:bg-gradient-to-l", fill)} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

export function MentorAvatar({ name, photoUrl, className }: { name: string; photoUrl?: string | null; className?: string }) {
  return (
    <span className={cn("relative inline-grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-[#ffb52e] to-[#ff7a59] text-[0.75em] font-bold text-white", className)}>
      {photoUrl ? <Image src={photoUrl} alt="" fill sizes="48px" className="object-cover" /> : initials(name)}
    </span>
  );
}

export function AvatarStack({ people, max = 3 }: { people: { name: string; photoUrl?: string | null }[]; max?: number }) {
  const shown = people.slice(0, max);
  return (
    <span className="inline-flex items-center">
      {shown.map((p, i) => (
        <MentorAvatar key={i} name={p.name} photoUrl={p.photoUrl} className="-me-[0.5em] size-[1.9em] ring-2 ring-white" />
      ))}
      {people.length > max && <span className="ms-[0.9em] text-[0.8em] text-[#64748b]">+{people.length - max}</span>}
    </span>
  );
}

/** A filter/sort dropdown that looks like the design's "Status: All ⌄". */
export function SelectPill<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  const current = options.find((o) => o.value === value)?.label ?? value;
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-[2.6em] items-center gap-[0.5em] rounded-[0.7em] border border-[#d6dde6] bg-white px-[0.9em] text-[0.82em] font-medium text-[#1b2d54] hover:bg-[#f7f9fc]"
      >
        {label}: {current} <ChevronDown className="size-[1em]" />
      </button>
      {open && (
        <ul role="listbox" className="absolute end-0 top-full z-30 mt-1 min-w-full overflow-hidden rounded-[0.8em] border border-[#e1e8f0] bg-white py-1 text-[0.82em] shadow-lg">
          {options.map((o) => (
            <li key={o.value}>
              <button
                type="button"
                role="option"
                aria-selected={o.value === value}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between gap-4 whitespace-nowrap px-3 py-2 text-start text-[#1b2d54] hover:bg-[#f5f8fc]"
              >
                {o.label}
                {o.value === value && <Check className="size-[1em] text-[#0f7378]" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Underlined tabs (squad detail, reviews) with an optional count after the label. */
export function UnderlineTabs<T extends string>({ tabs, value, onChange }: { tabs: { value: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div role="tablist" className="flex gap-[1.8em] overflow-x-auto border-b border-[#e6ebf1] [scrollbar-width:none]">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={tab.value === value}
          onClick={() => onChange(tab.value)}
          className={cn(
            "-mb-px shrink-0 border-b-[3px] pb-[0.7em] text-[0.9em] transition-colors",
            tab.value === value ? "border-[#0f7378] font-semibold text-[#0f7378]" : "border-transparent text-[#475467] hover:text-[#1b2d54]",
          )}
        >
          {tab.label}
          {tab.count != null && <span className="ms-[0.5em]">{tab.count}</span>}
        </button>
      ))}
    </div>
  );
}

/** Pill tabs like "Current 4 | History 7". */
export function SegmentTabs<T extends string>({ tabs, value, onChange }: { tabs: { value: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div role="tablist" className="inline-flex rounded-[0.8em] bg-[#eef2f7] p-[0.25em]">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={tab.value === value}
          onClick={() => onChange(tab.value)}
          className={cn(
            "rounded-[0.6em] px-[1em] py-[0.45em] text-[0.85em] transition-colors",
            tab.value === value ? "bg-white font-semibold text-[#0f7378] shadow-sm" : "text-[#475467] hover:text-[#1b2d54]",
          )}
        >
          {tab.label}
          {tab.count != null && <span className="ms-[0.5em]">{tab.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function PrimaryButton({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-[0.5em] rounded-[0.7em] bg-gradient-to-r from-[#0f6b70] to-[#1b2d54] px-[1.1em] py-[0.6em] text-[0.85em] font-semibold text-white shadow-[0_6px_16px_rgba(15,107,112,0.3)] transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-45 rtl:bg-gradient-to-l",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, className, danger, warn, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { danger?: boolean; warn?: boolean }) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-[0.5em] rounded-[0.7em] border bg-white px-[1em] py-[0.55em] text-[0.85em] font-medium transition-colors hover:bg-[#f7f9fc] disabled:cursor-not-allowed disabled:opacity-50",
        danger ? "border-[#f3b8b5] text-[#c81e1e]" : warn ? "border-[#f5cf9f] text-[#c2570c]" : "border-[#d6dde6] text-[#1b2d54]",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function LinkButton({ href, children, primary }: { href: string; children: ReactNode; primary?: boolean }) {
  return (
    <Link
      href={href as Route}
      className={
        primary
          ? "inline-flex items-center gap-[0.5em] rounded-[0.7em] bg-gradient-to-r from-[#0f6b70] to-[#1b2d54] px-[1.1em] py-[0.6em] text-[0.85em] font-semibold text-white shadow-[0_6px_16px_rgba(15,107,112,0.3)] rtl:bg-gradient-to-l"
          : "inline-flex items-center gap-[0.5em] rounded-[0.7em] border border-[#d6dde6] bg-white px-[1em] py-[0.55em] text-[0.85em] font-medium text-[#1b2d54] hover:bg-[#f7f9fc]"
      }
    >
      {children}
    </Link>
  );
}

/** The calendar chip of the design: month on top, the day below. */
export function DateChip({ iso, tone = "gray" }: { iso: string; tone?: "gray" | "blue" }) {
  const { intl } = useI18n();
  const d = new Date(iso);
  return (
    <span className={cn("grid w-[3.2em] shrink-0 place-items-center rounded-[0.7em] border py-[0.35em] leading-none", tone === "blue" ? "border-[#cfe0f5] bg-[#eef5ff]" : "border-[#dfe5ec] bg-[#f4f7fa]")}>
      <span className="text-[0.62em] font-semibold uppercase text-[#1d5fd1]">{d.toLocaleDateString(intl, { month: "short" })}</span>
      <span className="mt-[0.2em] text-[1.25em] font-bold text-[#1b2d54]">{d.getDate()}</span>
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <span className={cn("block animate-pulse rounded-full bg-[#e6ebf2]", className)} />;
}

/** "We could not load this …" with Try again and the things to try (design: State · Error). */
export function ErrorState({ title, onRetry, back, error }: { title: string; onRetry: () => void; back?: { href: string; label: string }; error?: { status?: number; requestId?: string | null } }) {
  const { t } = useI18n();
  return (
    <>
      <Card className="py-[3em] text-center">
        <StateArt kind="error" />
        <h2 className="mt-[1em] text-[1.4em] font-bold text-[#1b2d54]">{title}</h2>
        <p className="mx-auto mt-[0.6em] max-w-[34em] text-[0.88em] text-[#475467]">
          {t("Something went wrong on our side. Check your connection and try again. If it keeps happening, report it to the Admin.")}
        </p>
        <div className="mt-[1.4em] flex justify-center gap-[0.6em]">
          <PrimaryButton onClick={onRetry}>{t("Try again")}</PrimaryButton>
          {back && <LinkButton href={back.href}>{back.label}</LinkButton>}
        </div>
        {error?.status != null && (
          <p className="mt-[1em] text-[0.75em] text-[#64748b]">
            {t("Error code {code}", { code: error.status })}
            {error.requestId ? ` · ${t("Request ID {id}", { id: error.requestId })}` : ""}
          </p>
        )}
      </Card>
      <h3 className="text-[1.1em] font-bold text-[#1b2d54]">{t("Things you can try")}</h3>
      <div className="grid gap-[1.2em] md:grid-cols-3">
        <TryCard icon={<Wifi className="size-[1.2em] text-[#1d5fd1]" />} tint="bg-[#eef5ff]" title={t("Check your connection")} text={t("Make sure you are online, then press Try again.")} />
        <TryCard icon={<RotateCw className="size-[1.2em] text-[#0f7378]" />} tint="bg-[#e0f4f2]" title={t("Refresh the page")} text={t("A fresh load fixes most temporary problems.")} />
        <TryCard
          icon={<Flag className="size-[1.2em] text-[#c81e1e]" />}
          tint="bg-[#fde8e8]"
          title={t("Report it to the Admin")}
          text={t("If it keeps happening, send the request ID above.")}
          link={{ href: "/mentor/reports?report=1", label: t("Report to Admin") }}
        />
      </div>
    </>
  );
}

function TryCard({ icon, tint, title, text, link }: { icon: ReactNode; tint: string; title: string; text: string; link?: { href: string; label: string } }) {
  return (
    <Card>
      <div className="flex items-center gap-[0.8em]">
        <span className={cn("grid size-[2.6em] place-items-center rounded-[0.8em]", tint)}>{icon}</span>
        <h4 className="text-[1.05em] font-bold text-[#1b2d54]">{title}</h4>
      </div>
      <p className="mt-[0.8em] text-[0.82em] text-[#475467]">{text}</p>
      {link && (
        <Link href={link.href as Route} className="mt-[0.5em] inline-block text-[0.82em] font-semibold text-[#0f7378]">
          {link.label} →
        </Link>
      )}
    </Card>
  );
}

export function EmptyState({ title, text, children, art = "clipboard" }: { title: string; text: string; children?: ReactNode; art?: "clipboard" | "lock" }) {
  return (
    <div className="py-[2.5em] text-center">
      <StateArt kind={art} />
      <h2 className="mt-[1em] text-[1.3em] font-bold text-[#1b2d54]">{title}</h2>
      <p className="mx-auto mt-[0.6em] max-w-[34em] text-[0.88em] text-[#475467]">{text}</p>
      {children && <div className="mt-[1.4em] flex justify-center gap-[0.6em]">{children}</div>}
    </div>
  );
}

/** Small line drawings of the state screens (error cloud, clipboard, lock shield). */
function StateArt({ kind }: { kind: "error" | "clipboard" | "lock" }) {
  return (
    <svg viewBox="0 0 160 130" className="mx-auto h-[8em] w-auto" aria-hidden>
      <circle cx="80" cy="60" r="44" fill={kind === "error" ? "#fdecec" : kind === "lock" ? "#fff3dc" : "#e3f4f1"} />
      <ellipse cx="80" cy="118" rx="36" ry="4" fill="#e6ebf2" />
      <circle cx="22" cy="38" r="3" fill="#8fb4f8" />
      <circle cx="140" cy="28" r="3" fill="#7cc7b8" />
      {kind === "error" && (
        <>
          <path d="M45 82h70a18 18 0 0 0 0-36 26 26 0 0 0-50-6 20 20 0 0 0-20 42z" fill="#fff" stroke="#1b2d54" strokeWidth="4" strokeLinejoin="round" />
          <path d="M82 50l-8 16h10l-6 14" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="116" cy="84" r="12" fill="#ef4444" />
          <path d="M116 77v8M116 90v1" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
        </>
      )}
      {kind === "clipboard" && (
        <>
          <rect x="54" y="22" width="52" height="76" rx="9" fill="#fff" stroke="#1b2d54" strokeWidth="4" />
          <rect x="68" y="16" width="24" height="12" rx="4" fill="#0f7378" />
          {[44, 62, 80].map((y) => (
            <g key={y}>
              <path d={`M64 ${y}l5 5 9-10`} fill="none" stroke="#0f7378" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <path d={`M84 ${y + 1}h12`} stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
            </g>
          ))}
          <path d="M118 30l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#f59e0b" />
        </>
      )}
      {kind === "lock" && (
        <>
          <path d="M80 18l34 12v26c0 22-14 38-34 46-20-8-34-24-34-46V30z" fill="#fff" stroke="#1b2d54" strokeWidth="4" strokeLinejoin="round" />
          <rect x="66" y="56" width="28" height="22" rx="4" fill="#1b2d54" />
          <path d="M71 56v-6a9 9 0 0 1 18 0v6" fill="none" stroke="#1b2d54" strokeWidth="4" />
          <circle cx="80" cy="66" r="3" fill="#f59e0b" />
        </>
      )}
    </svg>
  );
}

/** A small "time" note under a card, like "Completed squads move to the History tab." */
export function FootNote({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-[0.5em] text-[0.82em] text-[#475467]">
      <Clock className="size-[1.05em] shrink-0" /> {children}
    </p>
  );
}

export function WarningCount({ n }: { n: number }) {
  if (n <= 0) return <span className="text-[#98a2b3]">—</span>;
  return (
    <span className="inline-flex items-center gap-[0.3em] rounded-full bg-[#fff1e3] px-[0.6em] py-[0.15em] text-[0.78em] font-semibold text-[#c2570c]">
      <AlertTriangle className="size-[1em]" /> {n}
    </span>
  );
}

/** "2 days ago", "in 5 hours", "Overdue 2d" style durations. */
export function useRelative() {
  const { t } = useI18n();
  return {
    ago(iso: string | null | undefined) {
      if (!iso) return t("Never");
      const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
      if (mins < 1) return t("Just now");
      if (mins < 60) return t("{n} min ago", { n: mins });
      const hours = Math.round(mins / 60);
      if (hours < 24) return t("{n} h ago", { n: hours });
      const days = Math.round(hours / 24);
      if (days === 1) return t("Yesterday");
      return t("{n} days ago", { n: days });
    },
    countdown(dueIso: string) {
      const hours = (new Date(dueIso).getTime() - Date.now()) / 3600000;
      if (hours < 0) {
        const days = Math.max(1, Math.round(-hours / 24));
        return { label: t("Overdue {n}d", { n: days }), tone: "red" as Tone, overdue: true };
      }
      if (hours < 24) return { label: t("Due in {n}h", { n: Math.max(1, Math.round(hours)) }), tone: "orange" as Tone, overdue: false };
      return { label: t("{n} days left", { n: Math.round(hours / 24) }), tone: "blue" as Tone, overdue: false };
    },
  };
}

/** A centred dialog with a title, closed with Escape or the backdrop. */
export function Dialog({ title, onClose, children, footer }: { title: string; onClose: () => void; children: ReactNode; footer: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Close" className="absolute inset-0 cursor-default bg-[#14365a]/35" onClick={onClose} />
      <div className="relative w-full max-w-[32em] rounded-[1.3em] bg-white p-[1.5em] text-[0.95em] shadow-2xl">
        <h2 className="text-[1.2em] font-bold text-[#1b2d54]">{title}</h2>
        <div className="mt-[1em] space-y-[1em]">{children}</div>
        <div className="mt-[1.4em] flex justify-end gap-[0.6em]">{footer}</div>
      </div>
    </div>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: ReactNode }) {
  return (
    <label className="block text-[0.85em]">
      <span className="mb-[0.4em] flex justify-between font-medium text-[#1b2d54]">
        {label}
        {hint && <span className="font-normal text-[#64748b]">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export const inputCls =
  "w-full rounded-[0.8em] border border-[#d6dde6] bg-white px-[0.9em] py-[0.65em] text-[0.95em] text-[#1b2d54] outline-none placeholder:text-[#98a2b3] focus:border-[#0f7378] focus:ring-2 focus:ring-[#0f7378]/15";
