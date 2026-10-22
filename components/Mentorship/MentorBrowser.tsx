"use client";

import { useMemo, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, CircleHelp, SlidersHorizontal } from "lucide-react";
import { EXPERIENCE, FOCUS, MAX_RATE, MENTORS, SESSION_FORMATS, TECH_GROUPS, type Mentor } from "@/lib/data/mentors";
import { MentorCard } from "./MentorCard";
import { useT } from "@/lib/i18n/client";

type SortKey = "best" | "rating" | "price";

const PAGE_SIZE = 6;

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function CheckRow({
  label,
  count,
  checked,
  onChange,
  pill = false,
}: {
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
  pill?: boolean;
}) {
  const t = useT();
  return (
    <label className="flex cursor-pointer items-center gap-2 text-[11px] text-[#1b2a5c]">
      <input type="checkbox" checked={checked} onChange={onChange} className="size-3.5 shrink-0 accent-[#12939b]" />
      <span className="flex-1">{t(label)}</span>
      {count !== undefined && (
        <span
          className={
            pill
              ? `rounded-full px-2 py-0.5 text-[10px] font-semibold ${checked ? "bg-[#7fdcb8] text-[#0f6b60]" : "bg-[#F3F7FA] text-[#1b2a5c]/60"}`
              : "text-[10px] text-[#1b2a5c]/50"
          }
        >
          {count}
        </span>
      )}
    </label>
  );
}

function Group({ title, aside, children }: { title: string; aside?: string; children: React.ReactNode }) {
  const t = useT();
  return (
    <fieldset className="mt-5">
      <legend className="mb-2.5 flex w-full items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-[#1b2a5c]">
        {t(title)}
        {aside && <span className="font-normal normal-case text-[#1b2a5c]/50">{aside}</span>}
      </legend>
      <div className="flex flex-col gap-2.5">{children}</div>
    </fieldset>
  );
}

const count = (match: (m: Mentor) => boolean) => MENTORS.filter(match).length;

export function MentorBrowser() {
  const t = useT();
  const [formats, setFormats] = useState<string[]>([]);
  const [tech, setTech] = useState<string[]>([]);
  const [focus, setFocus] = useState<string[]>([]);
  const [experience, setExperience] = useState<string | null>(null);
  const [maxRate, setMaxRate] = useState(MAX_RATE);
  const [sort, setSort] = useState<SortKey>("best");
  const [page, setPage] = useState(1);

  const results = useMemo(() => {
    const band = EXPERIENCE.find((e) => e.id === experience);
    const filtered = MENTORS.filter(
      (m) =>
        (formats.length === 0 || formats.some((f) => m.formats.includes(f as Mentor["formats"][number]))) &&
        (tech.length === 0 || tech.some((g) => m.techGroups.includes(g))) &&
        (focus.length === 0 || focus.some((f) => m.focus.includes(f))) &&
        (!band || (m.years >= band.min && m.years <= band.max)) &&
        m.price <= maxRate,
    );
    if (sort === "rating") return [...filtered].sort((a, b) => b.rating - a.rating);
    if (sort === "price") return [...filtered].sort((a, b) => a.price - b.price);
    return filtered; // best match: the curated order
  }, [formats, tech, focus, experience, maxRate, sort]);

  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const shown = results.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const from = results.length === 0 ? 0 : (current - 1) * PAGE_SIZE + 1;

  function reset() {
    setFormats([]);
    setTech([]);
    setFocus([]);
    setExperience(null);
    setMaxRate(MAX_RATE);
    setPage(1);
  }

  /** Any filter change goes back to the first page. */
  function change<T>(set: (v: T) => void) {
    return (v: T) => {
      set(v);
      setPage(1);
    };
  }

  return (
    <section id="mentors" className="mx-auto w-full max-w-[1200px] scroll-mt-24 px-6 py-12 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#1b2a5c]">{t("Browse Verified Mentors")}</h2>
          <p className="mt-0.5 text-[11px] text-[#1b2a5c]/60">
            {t("Showing")} <span className="font-semibold text-[#1b2a5c]">{t("{n} expert mentors", { n: results.length })}</span> {t("ready to book sessions")}
          </p>
        </div>
        <label className="flex items-center gap-2 text-[11px] font-medium text-[#1b2a5c]">
          {t("Sort by:")}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-full border border-[#e3ecea] bg-white px-4 py-1.5 text-[11px] font-semibold text-[#1b2a5c] outline-none focus:border-[#12939b]"
          >
            <option value="best">{t("Best Match (Recommended)")}</option>
            <option value="rating">{t("Top Rated")}</option>
            <option value="price">{t("Price: Low to High")}</option>
          </select>
        </label>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[232px_1fr]">
        <div className="flex flex-col gap-4">
          <aside className="h-fit rounded-2xl border border-[#e3ecea] bg-white p-4 shadow-[0_6px_20px_rgba(27,42,92,0.05)]">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold text-[#1b2a5c]">
                <SlidersHorizontal size={14} aria-hidden /> {t("Refine Search")}
              </h3>
              <button type="button" onClick={reset} className="text-[10px] font-semibold text-[#12939b] hover:underline">
                {t("Reset All")}
              </button>
            </div>

            <Group title="Session Format">
              {SESSION_FORMATS.map((f) => (
                <CheckRow
                  key={f}
                  label={f}
                  pill
                  count={count((m) => m.formats.includes(f))}
                  checked={formats.includes(f)}
                  onChange={() => change(setFormats)(toggle(formats, f))}
                />
              ))}
            </Group>

            <Group title="Technologies" aside={tech.length ? t("{n} Selected", { n: tech.length }) : undefined}>
              {TECH_GROUPS.map((g) => (
                <CheckRow
                  key={g}
                  label={g}
                  count={count((m) => m.techGroups.includes(g))}
                  checked={tech.includes(g)}
                  onChange={() => change(setTech)(toggle(tech, g))}
                />
              ))}
            </Group>

            <Group title="Mentorship Focus">
              {FOCUS.map((f) => (
                <CheckRow key={f} label={f} checked={focus.includes(f)} onChange={() => change(setFocus)(toggle(focus, f))} />
              ))}
            </Group>

            <Group title="Years of Experience">
              <div className="flex flex-wrap gap-1.5">
                {EXPERIENCE.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    aria-pressed={experience === e.id}
                    onClick={() => change(setExperience)(experience === e.id ? null : e.id)}
                    className={`rounded-full px-3 py-1.5 text-[10px] font-semibold transition-colors ${
                      experience === e.id ? "bg-[#12939b] text-white" : "bg-[#F3F7FA] text-[#1b2a5c]/75 hover:bg-[#E9F7F4]"
                    }`}
                  >
                    {t(e.label)}
                  </button>
                ))}
              </div>
            </Group>

            <div className="mt-5">
              <label htmlFor="max-rate" className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-[#1b2a5c]">
                {t("Max Hourly Rate")} <span className="normal-case text-[#12939b]">{maxRate === 0 ? t("Free") : t("${n}/hr", { n: maxRate })}</span>
              </label>
              <input
                id="max-rate"
                type="range"
                min={0}
                max={MAX_RATE}
                step={5}
                value={maxRate}
                onChange={(e) => change(setMaxRate)(Number(e.target.value))}
                className="mt-2 w-full accent-[#12939b]"
              />
              <div className="flex justify-between text-[9px] text-[#1b2a5c]/50">
                <span>{t("Free Only")}</span>
                <span>$75</span>
                <span>$150+</span>
              </div>
            </div>
          </aside>

          <div className="rounded-2xl bg-[#EEF0FB] p-4">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-[#2b3a8c]">
              <CircleHelp size={15} aria-hidden /> {t("Unsure who to pick?")}
            </p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-[#1b2a5c]/65">
              {t("Our career concierge matches you with the ideal mentor based on your project goals within 2 hours.")}
            </p>
            <a href="#mentors" className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#2b3a8c] hover:underline">
              {t("Request concierge match")} <ArrowRight size={12} aria-hidden />
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {shown.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#cfd5d4] bg-white p-10 text-center">
              <p className="text-sm font-semibold text-[#1b2a5c]">{t("No mentors match these filters")}</p>
              <button type="button" onClick={reset} className="mt-2 text-xs font-semibold text-[#12939b] hover:underline">
                {t("Reset all filters")}
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {shown.map((mentor) => (
                <MentorCard key={mentor.id} mentor={mentor} />
              ))}
            </div>
          )}

          <nav
            aria-label={t("Mentor pages")}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e3ecea] bg-white px-5 py-3"
          >
            <p className="text-[11px] text-[#1b2a5c]/65">
              {t("Showing {from} - {to} of {total} mentors", { from, to: from === 0 ? 0 : from + shown.length - 1, total: results.length })}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                aria-label={t("Previous page")}
                disabled={current === 1}
                onClick={() => setPage(current - 1)}
                className="grid size-7 place-items-center rounded-full bg-[#F3F7FA] text-[#1b2a5c] disabled:opacity-40"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-current={n === current ? "page" : undefined}
                  onClick={() => setPage(n)}
                  className={`grid size-7 place-items-center rounded-full text-[11px] font-semibold ${
                    n === current ? "bg-[#0f6b60] text-white" : "text-[#1b2a5c] hover:bg-[#F3F7FA]"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                aria-label={t("Next page")}
                disabled={current === pages}
                onClick={() => setPage(current + 1)}
                className="grid size-7 place-items-center rounded-full bg-[#F3F7FA] text-[#1b2a5c] disabled:opacity-40"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </nav>
        </div>
      </div>
    </section>
  );
}
