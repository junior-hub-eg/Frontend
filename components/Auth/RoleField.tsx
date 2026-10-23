"use client";

import { useId } from "react";
import { GraduationCap, School, UsersRound, type LucideIcon } from "lucide-react";
import type { SignupRole } from "@/lib/auth/account-api";
import { tk } from "@/lib/i18n/translate";
import { useT } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

const ROLES: { id: SignupRole; label: string; hint: string; icon: LucideIcon }[] = [
  { id: "Student", label: tk("Student"), hint: tk("Learn, build projects and get ready for work"), icon: GraduationCap },
  // The monitor (Mentor role) guides students of their track one to one, and can also supervise an internship squad.
  { id: "Mentor", label: tk("Monitor / Mentor"), hint: tk("Guide students in your track one to one, or supervise an internship squad"), icon: UsersRound },
  { id: "Teacher", label: tk("Teacher"), hint: tk("Teach your school subject and follow your classes"), icon: School },
];

/** Who is signing up (23 Oct 2026). Monitors and teachers wait for the admin's approval. */
export function RoleField({ value, onChange }: { value: SignupRole; onChange: (role: SignupRole) => void }) {
  const t = useT();
  const id = useId();
  return (
    <div>
      <p id={id} className="mb-1.5 text-[length:clamp(10px,1.2cqw,12px)] font-semibold leading-tight text-[#1b2a5c]">
        {t("I am signing up as")}
      </p>
      <div role="radiogroup" aria-labelledby={id} className="grid grid-cols-3 gap-2">
        {ROLES.map((r) => {
          const selected = value === r.id;
          return (
            <button
              key={r.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={t(r.label)}
              onClick={() => onChange(r.id)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl border bg-white px-2 py-2 text-center transition-colors",
                selected ? "border-[#12939b] ring-2 ring-[#12939b]/25" : "border-[#dfe7e5] hover:border-[#12939b]/60",
              )}
            >
              <r.icon className={cn("size-5", selected ? "text-[#12939b]" : "text-[#1b2a5c]/70")} />
              <span className="text-[length:clamp(11px,1.35cqw,13px)] font-semibold text-[#1b2a5c]">{t(r.label)}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-1 px-1 text-[length:clamp(10px,1.2cqw,12px)] text-[#1b2a5c]/70">{t(ROLES.find((r) => r.id === value)!.hint)}</p>
    </div>
  );
}

/** A row of toggle chips, for subjects and grades. */
export function ChipsField<T extends string | number>({
  label,
  options,
  value,
  onChange,
  render,
  error,
}: {
  label: string;
  options: T[];
  value: T[];
  onChange: (value: T[]) => void;
  render: (option: T) => string;
  error?: string;
}) {
  const t = useT();
  const id = useId();
  return (
    <div>
      <p id={id} className="mb-1.5 text-[length:clamp(10px,1.2cqw,12px)] font-semibold leading-tight text-[#1b2a5c]">{label}</p>
      <div role="group" aria-labelledby={id} className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = value.includes(o);
          return (
            <button
              key={o}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(on ? value.filter((v) => v !== o) : [...value, o])}
              className={cn(
                "rounded-full border px-3 py-1 text-[length:clamp(11px,1.3cqw,13px)] font-medium transition-colors",
                on ? "border-[#12939b] bg-[#12939b] text-white" : "border-[#dfe7e5] bg-white text-[#1b2a5c] hover:border-[#12939b]/60",
              )}
            >
              {render(o)}
            </button>
          );
        })}
      </div>
      {error && <p role="alert" className="mt-1 px-1 text-xs text-danger">{t(error)}</p>}
    </div>
  );
}

/** A labelled select in the sign-up style. */
export function SelectField({
  label,
  error,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string }) {
  const t = useT();
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[length:clamp(10px,1.2cqw,12px)] font-semibold leading-tight text-[#1b2a5c]">
        {label}
      </label>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        className={cn(
          "h-[clamp(36px,4.6cqw,44px)] w-full rounded-xl border bg-white px-3 text-[length:clamp(12px,1.45cqw,14px)] text-[#1b2a5c] outline-none focus:border-[#12939b] focus:ring-2 focus:ring-[#12939b]/25",
          error ? "border-danger" : "border-[#dfe7e5]",
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p role="alert" className="mt-1 px-1 text-xs text-danger">{t(error)}</p>}
    </div>
  );
}
