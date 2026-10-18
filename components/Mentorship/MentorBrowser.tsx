"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { EXPERTISE, FOCUS, MENTORS, TECHNOLOGIES } from "@/lib/data/mentors";
import { MentorCard } from "./MentorCard";

type SortKey = "best" | "rating" | "price";

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function FilterGroup({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <fieldset className="border-t border-[#e8eeed] pt-4">
      <legend className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#1b2a5c]/60">{title}</legend>
      <div className="flex flex-col gap-2">
        {options.map((option) => (
          <label key={option} className="flex cursor-pointer items-center gap-2 text-xs text-[#1b2a5c]">
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => onToggle(option)}
              className="size-3.5 accent-[#12939b]"
            />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function MentorBrowser() {
  const [query, setQuery] = useState("");
  const [expertise, setExpertise] = useState<string[]>([]);
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [focus, setFocus] = useState<string[]>([]);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(60);
  const [sort, setSort] = useState<SortKey>("best");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = MENTORS.filter(
      (m) =>
        (!q || `${m.name} ${m.role} ${m.technologies.join(" ")}`.toLowerCase().includes(q)) &&
        (expertise.length === 0 || expertise.some((e) => m.expertise.includes(e))) &&
        (technologies.length === 0 || technologies.some((t) => m.technologies.includes(t))) &&
        (focus.length === 0 || focus.some((f) => m.focus.includes(f))) &&
        (!availableOnly || m.availableThisWeek) &&
        m.price <= maxPrice
    );
    if (sort === "rating") return [...filtered].sort((a, b) => b.rating - a.rating);
    if (sort === "price") return [...filtered].sort((a, b) => a.price - b.price);
    return [...filtered].sort((a, b) => b.sessions - a.sessions);
  }, [query, expertise, technologies, focus, availableOnly, maxPrice, sort]);

  function clearFilters() {
    setQuery("");
    setExpertise([]);
    setTechnologies([]);
    setFocus([]);
    setAvailableOnly(false);
    setMaxPrice(60);
  }

  return (
    <section id="mentors" className="mx-auto max-w-[1200px] scroll-mt-6 px-6 py-12 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#1b2a5c]">Browse Verified Mentors</h2>
          <p className="mt-0.5 text-xs text-[#1b2a5c]/60">
            Showing {results.length} of {MENTORS.length} expert mentors
          </p>
        </div>
        <label className="flex items-center gap-2 text-xs text-[#1b2a5c]/70">
          Sort by
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-lg border border-[#dfe7e5] bg-white px-3 py-2 text-xs font-medium text-[#1b2a5c] outline-none focus:border-[#12939b]"
          >
            <option value="best">Best match</option>
            <option value="rating">Top rated</option>
            <option value="price">Price: low to high</option>
          </select>
        </label>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit rounded-2xl border border-[#dfe7e5] bg-white p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#1b2a5c]">Refine Search</h3>
            <button type="button" onClick={clearFilters} className="text-[11px] font-semibold text-[#12939b] hover:underline">
              Clear all
            </button>
          </div>

          <label className="mt-3 flex items-center gap-2 rounded-lg border border-[#dfe7e5] px-3 py-2 focus-within:border-[#12939b]">
            <Search aria-hidden size={14} className="text-[#1b2a5c]/50" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search mentors"
              aria-label="Search mentors"
              className="w-full bg-transparent text-xs text-[#1b2a5c] outline-none placeholder:text-[#1b2a5c]/40"
            />
          </label>

          <div className="mt-4 flex flex-col gap-4">
            <FilterGroup title="Expertise" options={EXPERTISE} selected={expertise} onToggle={(v) => setExpertise(toggle(expertise, v))} />
            <FilterGroup title="Technologies" options={TECHNOLOGIES} selected={technologies} onToggle={(v) => setTechnologies(toggle(technologies, v))} />
            <FilterGroup title="Mentorship focus" options={FOCUS} selected={focus} onToggle={(v) => setFocus(toggle(focus, v))} />

            <div className="border-t border-[#e8eeed] pt-4">
              <label className="flex cursor-pointer items-center gap-2 text-xs text-[#1b2a5c]">
                <input type="checkbox" checked={availableOnly} onChange={(e) => setAvailableOnly(e.target.checked)} className="size-3.5 accent-[#12939b]" />
                Available this week
              </label>
            </div>

            <div className="border-t border-[#e8eeed] pt-4">
              <label htmlFor="max-price" className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-[#1b2a5c]/60">
                Max price <span className="text-[#12939b]">${maxPrice}</span>
              </label>
              <input
                id="max-price"
                type="range"
                min={20}
                max={60}
                step={5}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="mt-2 w-full accent-[#12939b]"
              />
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-[#E9F7F4] p-3">
            <p className="text-xs font-semibold text-[#1b2a5c]">Unsure who to pick?</p>
            <p className="mt-1 text-[11px] leading-relaxed text-[#1b2a5c]/70">
              Start with a free 15-minute intro chat. It&apos;s a relaxed way to meet a mentor.
            </p>
          </div>
        </aside>

        <div>
          {results.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#cfd5d4] p-10 text-center">
              <p className="text-sm font-semibold text-[#1b2a5c]">No mentors match these filters</p>
              <button type="button" onClick={clearFilters} className="mt-2 text-xs font-semibold text-[#12939b] hover:underline">
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((mentor) => (
                <MentorCard key={mentor.id} mentor={mentor} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
