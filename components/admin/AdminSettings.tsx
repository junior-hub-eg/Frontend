"use client";

import { useState, type ReactNode } from "react";
import { Globe, Mail, Tag } from "lucide-react";
import { AdminPage, PageHero } from "./AdminPage";

type Settings = {
  platformName: string;
  supportEmail: string;
  timezone: string;
  maintenance: boolean;
  registration: boolean;
  notifications: boolean;
};

const DEFAULTS: Settings = {
  platformName: "Junior Hub",
  supportEmail: "support@junior-hub.com",
  timezone: "(UTC+02:00) Cairo",
  maintenance: false,
  registration: true,
  notifications: true,
};

const TIMEZONES = ["(UTC+02:00) Cairo", "(UTC+00:00) London", "(UTC+03:00) Riyadh", "(UTC+04:00) Dubai", "(UTC-05:00) New York"];

const glass = "rounded-[1.1em] border border-white/60 bg-white/75 p-[1.3em] shadow-[0_6px_22px_rgba(20,54,90,0.1)] backdrop-blur-[6px]";
const field =
  "flex h-[2.4em] items-center gap-[0.6em] rounded-full bg-[#b7dcd8]/80 px-[1em] text-[0.8em] text-[#14365a] focus-within:ring-2 focus-within:ring-[#12939b]/40";

function Field({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-[0.95em] font-medium text-[#0b1b2b]">{label}</span>
      <span className={`mt-[0.4em] ${field}`}>
        <span className="shrink-0 text-[#14365a]/60">{icon}</span>
        {children}
      </span>
    </label>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-[1em] py-[0.55em]">
      <div className="min-w-0">
        <p className="text-[0.95em] font-medium text-[#0b1b2b]">{label}</p>
        <p className="text-[0.7em] text-[#14365a]/70">{hint}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-[1.5em] w-[2.6em] shrink-0 rounded-full transition-colors ${
          checked ? "bg-[#34c759]" : "bg-[#b8c4d0]"
        }`}
      >
        <span
          className={`absolute top-[0.2em] size-[1.1em] rounded-full bg-white shadow transition-all ${
            checked ? "left-[1.4em]" : "left-[0.2em]"
          }`}
        />
      </button>
    </div>
  );
}

export default function AdminSettings() {
  const [saved, setSaved] = useState<Settings>(DEFAULTS);
  const [form, setForm] = useState<Settings>(DEFAULTS);
  const [justSaved, setJustSaved] = useState(false);

  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setJustSaved(false);
  };

  const save = () => {
    // TODO: send `form` to the API here
    setSaved(form);
    setJustSaved(true);
  };

  const reset = () => {
    setForm(DEFAULTS);
    setJustSaved(false);
  };

  return (
    <AdminPage>
      {/* The hero is taller at the bottom so the cards can sit on top of it */}
      <PageHero title="System Settings" contentClassName="pb-[10em] lg:pb-[11em]" />

      <div className="relative z-10 mx-auto -mt-[7.5em] w-full lg:-mt-[8.5em] lg:w-[72%]">
        <div className="grid gap-[1.2em] lg:grid-cols-2">
          {/* Platform profile */}
          <section className={glass}>
            <h2 className="text-[1.2em] font-semibold text-[#0b1b2b]">Platform Profile</h2>
            <div className="mt-[0.8em] space-y-[0.9em]">
              <Field label="Platform Name" icon={<Tag className="size-[1em]" />}>
                <input
                  value={form.platformName}
                  onChange={(e) => set("platformName", e.target.value)}
                  placeholder="Platform Name"
                  className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[#14365a]/50"
                />
              </Field>

              <Field label="Support Email" icon={<Mail className="size-[1em]" />}>
                <input
                  type="email"
                  value={form.supportEmail}
                  onChange={(e) => set("supportEmail", e.target.value)}
                  placeholder="support@example.com"
                  className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[#14365a]/50"
                />
              </Field>

              <Field label="Timezone" icon={<Globe className="size-[1em]" />}>
                <select
                  value={form.timezone}
                  onChange={(e) => set("timezone", e.target.value)}
                  className="min-w-0 flex-1 cursor-pointer bg-transparent outline-none"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </section>

          {/* System controls */}
          <section className={glass}>
            <h2 className="text-[1.2em] font-semibold text-[#0b1b2b]">System Controls</h2>
            <div className="mt-[0.5em] divide-y divide-[#14365a]/10">
              <Toggle
                label="Maintenance Mode"
                hint="Disable public access during updates"
                checked={form.maintenance}
                onChange={(v) => set("maintenance", v)}
              />
              <Toggle
                label="Allow Student Registration"
                hint="New users can create accounts"
                checked={form.registration}
                onChange={(v) => set("registration", v)}
              />
              <Toggle
                label="Email notifications"
                hint="Send automated activity reports"
                checked={form.notifications}
                onChange={(v) => set("notifications", v)}
              />
            </div>
          </section>
        </div>

        {/* Actions */}
        <div className="mt-[1.2em] flex flex-wrap items-center justify-center gap-[0.8em] rounded-full border border-white/60 bg-white/70 px-[1.2em] py-[0.6em] shadow-[0_6px_22px_rgba(20,54,90,0.08)] backdrop-blur-[6px]">
          <button
            type="button"
            onClick={save}
            disabled={!dirty}
            className="rounded-full bg-[#3d4f7c] px-[1.6em] py-[0.55em] text-[0.95em] font-medium text-white shadow-sm transition hover:bg-[#2f3f66] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-full border border-[#14365a]/40 bg-white/60 px-[1.4em] py-[0.55em] text-[0.95em] font-medium text-[#14365a] hover:bg-white"
          >
            Reset defaults
          </button>
          {justSaved && (
            <span role="status" className="text-[0.8em] font-medium text-[#1a7f55]">
              Saved
            </span>
          )}
        </div>
      </div>
    </AdminPage>
  );
}