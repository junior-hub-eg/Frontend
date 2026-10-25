"use client";

import { useCallback, useState, type FormEvent, type ReactNode } from "react";
import { Bell, Check, Copy, KeyRound, LoaderCircle, School, UserRound } from "lucide-react";
import { ApiError, errorMessage } from "@/lib/api-client";
import { useI18n } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { changeTeacherPassword, getTeacherSettings, updateTeacherSettings, type TeacherSettings } from "@/lib/teacher-api";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { Card, FieldLabel, LoadBlock, SUBJECT_LABEL, inputClass, useTeacherData } from "@/components/teacher/teacher-ui";
import { useToast } from "@/components/teacher/teacher-dialogs";

type Toggle = "notifyMessages" | "notifySubmissions" | "notifyQuestions" | "weeklyDigest";

const TOGGLES: { key: Toggle; label: string; hint: string }[] = [
  { key: "notifyMessages", label: tk("New messages"), hint: tk("When a student sends you a direct message.") },
  { key: "notifySubmissions", label: tk("Submissions"), hint: tk("When a student submits an assignment.") },
  { key: "notifyQuestions", label: tk("Students' questions"), hint: tk("When a student asks a question in your class.") },
  { key: "weeklyDigest", label: tk("Weekly summary"), hint: tk("A short summary of your classes every week.") },
];

function Section({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <Card className="p-5">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
        <span className="grid size-7 place-items-center rounded-lg bg-[#c9efe9] text-[#14757d]">{icon}</span>
        {title}
      </h2>
      {children}
    </Card>
  );
}

/** Teacher Settings: profile (from the school), booking link and office, notifications, language and password. */
export default function TeacherSettingsPage() {
  const { t } = useI18n();
  const load = useCallback(() => getTeacherSettings(), []);
  const settings = useTeacherData(load, tk("We couldn't load your settings. Please try again."));
  const s: TeacherSettings | null = settings.data;
  const toast = useToast();

  const [booking, setBooking] = useState<{ slug: string; office: string } | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [password, setPassword] = useState({ current: "", next: "", confirm: "" });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  if (!s) {
    return (
      <div className="flex min-w-0 flex-1 flex-col gap-4 pb-6 pt-4 font-[family-name:var(--font-poppins)] text-[#1B2D54]">
        <LoadBlock error={settings.error} onRetry={settings.reload} />
      </div>
    );
  }

  const slug = booking?.slug ?? s.bookingSlug;
  const office = booking?.office ?? s.officeLocation ?? "";
  const link = `${typeof window === "undefined" ? "" : window.location.origin}/book/${s.bookingSlug}`;

  async function save(key: string, changes: Parameters<typeof updateTeacherSettings>[0]) {
    setSaving(key);
    try {
      settings.setData(await updateTeacherSettings(changes));
      toast.show(t("Saved"));
      return true;
    } catch (e) {
      if (key === "booking") setBookingError(errorMessage(e));
      else toast.show(errorMessage(e));
      return false;
    } finally {
      setSaving(null);
    }
  }

  async function saveBooking(e: FormEvent) {
    e.preventDefault();
    setBookingError(null);
    if (await save("booking", { bookingSlug: slug.trim(), officeLocation: office.trim() })) setBooking(null);
  }

  async function savePassword(e: FormEvent) {
    e.preventDefault();
    setPasswordErrors({});
    setPasswordMessage(null);
    setSaving("password");
    try {
      await changeTeacherPassword(password.current, password.next, password.confirm);
      setPassword({ current: "", next: "", confirm: "" });
      toast.show(t("Your password was changed. Other devices were signed out."));
    } catch (err) {
      const body = err instanceof ApiError ? err.problem : undefined;
      if (body?.errors)
        setPasswordErrors(Object.fromEntries(Object.entries(body.errors).map(([k, v]) => [k.charAt(0).toLowerCase() + k.slice(1), v[0]])));
      else setPasswordMessage(errorMessage(err));
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 pb-6 pt-4 font-[family-name:var(--font-poppins)] text-[#1B2D54]">
      <header>
        <p className="text-[9px] font-semibold uppercase tracking-wide text-[#14757d]">{t("Teacher workspace")}</p>
        <h1 className="mt-1 text-2xl font-bold">{t("Settings")}</h1>
        <p className="mt-0.5 text-[11px] text-[#1B2D54]/70">{t("Your profile, booking link, notifications, language and password.")}</p>
      </header>

      <div className="grid min-w-0 gap-4 xl:grid-cols-2">
        <Section icon={<UserRound className="size-4" />} title={t("Profile")}>
          <dl className="grid gap-3 text-[11px] sm:grid-cols-2">
            <div>
              <dt className="text-[10px] text-[#1B2D54]/60">{t("Full name")}</dt>
              <dd className="mt-0.5 font-semibold">{s.fullName}</dd>
            </div>
            <div>
              <dt className="text-[10px] text-[#1B2D54]/60">{t("Email")}</dt>
              <dd dir="ltr" className="mt-0.5 truncate text-start font-semibold">{s.email}</dd>
            </div>
            <div>
              <dt className="text-[10px] text-[#1B2D54]/60">{t("School")}</dt>
              <dd className="mt-0.5 flex items-center gap-1.5 font-semibold">
                <School className="size-3.5 text-[#14757d]" />
                {s.school}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] text-[#1B2D54]/60">{t("Subjects and grades")}</dt>
              <dd className="mt-1 flex flex-wrap gap-1.5">
                {s.subjects.map((x) => (
                  <span key={x} className="rounded-full bg-[#c9efe9] px-2 py-0.5 text-[10px] font-semibold text-[#14757d]">
                    {t(SUBJECT_LABEL[x])}
                  </span>
                ))}
                {s.grades.map((g) => (
                  <span key={g} className="rounded-full bg-[#eef2f1] px-2 py-0.5 text-[10px] font-semibold">
                    {t("Grade {grade}", { grade: g })}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-[10px] text-[#1B2D54]/60">{t("Your school, subjects and grades are set by the school admin.")}</p>
        </Section>

        <Section icon={<Copy className="size-4" />} title={t("1-on-1 Booking Link")}>
          <form onSubmit={saveBooking} className="grid gap-3">
            <FieldLabel label={t("Booking link")} error={bookingError}>
              <div className="flex items-center gap-2">
                <span dir="ltr" className="shrink-0 text-[10px] text-[#1B2D54]/60">/book/</span>
                <input
                  dir="ltr"
                  className={inputClass}
                  value={slug}
                  onChange={(e) => setBooking({ slug: e.target.value.toLowerCase(), office })}
                  maxLength={40}
                />
              </div>
            </FieldLabel>
            <FieldLabel label={t("Office or room")}>
              <input dir="auto" className={inputClass} value={office} onChange={(e) => setBooking({ slug, office: e.target.value })} maxLength={200} />
            </FieldLabel>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(link).then(() => toast.show(t("Copied")), () => undefined)}
                className="flex items-center gap-1.5 rounded-lg bg-[#eef2f1] px-3 py-2 text-[10px] font-semibold"
              >
                <Copy className="size-3.5" />
                <span dir="ltr">{link.replace(/^https?:\/\//, "")}</span>
              </button>
              <button
                type="submit"
                disabled={saving === "booking" || booking === null}
                className="flex items-center gap-1.5 rounded-full bg-[#14757d] px-5 py-2 text-[11px] font-semibold text-white disabled:opacity-50"
              >
                {saving === "booking" && <LoaderCircle className="size-3.5 animate-spin" />}
                {t("Save")}
              </button>
            </div>
          </form>
        </Section>

        <Section icon={<Bell className="size-4" />} title={t("Notifications")}>
          <ul className="grid gap-3">
            {TOGGLES.map((x) => (
              <li key={x.key} className="flex items-center justify-between gap-3">
                <div className="leading-tight">
                  <p className="text-[12px] font-semibold">{t(x.label)}</p>
                  <p className="mt-0.5 text-[10px] text-[#1B2D54]/60">{t(x.hint)}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={s[x.key]}
                  aria-label={t(x.label)}
                  disabled={saving === x.key}
                  onClick={() => save(x.key, { [x.key]: !s[x.key] })}
                  className={cn(
                    "relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60",
                    s[x.key] ? "bg-[#14757d]" : "bg-[#d3dcda]",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 size-5 rounded-full bg-white shadow transition-[inset-inline-start]",
                      s[x.key] ? "start-[1.375rem]" : "start-0.5",
                    )}
                  />
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#e3ece9] pt-4">
            <div className="leading-tight">
              <p className="text-[12px] font-semibold">{t("Language")}</p>
              <p className="mt-0.5 text-[10px] text-[#1B2D54]/60">{t("The language of your workspace.")}</p>
            </div>
            <LanguageSwitcher className="h-9 gap-2 rounded-full border border-[#e3ece9] bg-[#f6f9f8] px-4 text-[11px] font-medium text-[#14365a]" />
          </div>
        </Section>

        <Section icon={<KeyRound className="size-4" />} title={t("Password")}>
          <form onSubmit={savePassword} className="grid gap-3">
            <FieldLabel label={t("Current password")} error={passwordErrors.currentPassword}>
              <input type="password" autoComplete="current-password" className={inputClass} value={password.current}
                onChange={(e) => setPassword({ ...password, current: e.target.value })} required />
            </FieldLabel>
            <div className="grid gap-3 sm:grid-cols-2">
              <FieldLabel label={t("New password")} error={passwordErrors.newPassword}>
                <input type="password" autoComplete="new-password" className={inputClass} value={password.next}
                  onChange={(e) => setPassword({ ...password, next: e.target.value })} required />
              </FieldLabel>
              <FieldLabel label={t("Confirm new password")} error={passwordErrors.confirmPassword}>
                <input type="password" autoComplete="new-password" className={inputClass} value={password.confirm}
                  onChange={(e) => setPassword({ ...password, confirm: e.target.value })} required />
              </FieldLabel>
            </div>
            {passwordMessage && <p role="alert" className="text-[11px] text-[#c81e1e]">{passwordMessage}</p>}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving === "password"}
                className="flex items-center gap-1.5 rounded-full bg-[#1B2D54] px-5 py-2 text-[11px] font-semibold text-white disabled:opacity-60"
              >
                {saving === "password" ? <LoaderCircle className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                {t("Change password")}
              </button>
            </div>
          </form>
        </Section>
      </div>
      {toast.node}
    </div>
  );
}
