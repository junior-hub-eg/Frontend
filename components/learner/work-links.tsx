"use client";

import { useState } from "react";
import { ExternalLink, Link2, LoaderCircle, Plus, Trash2 } from "lucide-react";
import { ApiError, errorMessage } from "@/lib/api-client";
import { saveMyLinks, type SquadLinks, type SquadMemberLinks, type WorkLinkKind } from "@/lib/interns-api";

export const LINK_KINDS: Record<WorkLinkKind, { label: string; placeholder: string }> = {
  Figma: { label: "Figma", placeholder: "https://www.figma.com/..." },
  GitHub: { label: "GitHub", placeholder: "https://github.com/..." },
  LiveSite: { label: "Live site", placeholder: "https://your-project.vercel.app" },
  Api: { label: "API / server", placeholder: "https://your-api.../swagger" },
  Demo: { label: "Demo", placeholder: "https://..." },
  TestReport: { label: "Test report", placeholder: "https://..." },
  Standup: { label: "Standup", placeholder: "https://meet.google.com/..." },
  Grooming: { label: "Grooming", placeholder: "https://zoom.us/j/..." },
  Other: { label: "Other", placeholder: "https://..." },
};
const ORDER = Object.keys(LINK_KINDS) as WorkLinkKind[];
const MAX_LINKS = 10;

type Row = { kind: WorkLinkKind; url: string };

/** A member's links as chips that open in a new tab. */
export function LinkChips({ member, className = "" }: { member: SquadMemberLinks; className?: string }) {
  if (member.links.length === 0) return null;
  return (
    <ul className={`flex flex-wrap gap-[0.4em] ${className}`}>
      {member.links.map((l, i) => (
        <li key={`${l.kind}-${i}`}>
          <a
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-[0.3em] rounded-full bg-white/80 px-[0.7em] py-[0.2em] text-[0.8em] font-semibold text-[#14365a] hover:bg-white"
          >
            {LINK_KINDS[l.kind]?.label ?? l.kind} <ExternalLink className="h-[0.9em] w-[0.9em]" />
          </a>
        </li>
      ))}
    </ul>
  );
}

/**
 * The student's own links to their project work: any number (up to 10) of any kind, Figma, GitHub, the live site,
 * the API... The role's usual kinds are suggested first. Saving replaces the whole list.
 */
export function MyLinksEditor({ me, onSaved, submitLabel = "Save links" }: { me: SquadMemberLinks; onSaved: (s: SquadLinks) => void; submitLabel?: string }) {
  const suggested = [...me.kinds, ...ORDER.filter((k) => !me.kinds.includes(k))];
  const [rows, setRows] = useState<Row[]>(() => (me.links.length ? me.links.map((l) => ({ ...l })) : [{ kind: suggested[0], url: "" }]));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const update = (i: number, row: Partial<Row>) => {
    setRows((r) => r.map((x, j) => (j === i ? { ...x, ...row } : x)));
    setSaved(false);
    setError(null);
  };

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const s = await saveMyLinks(rows.filter((r) => r.url.trim()).map((r) => ({ kind: r.kind, url: r.url.trim() })));
      onSaved(s);
      setSaved(true);
    } catch (e) {
      const fields = e instanceof ApiError ? e.problem?.errors : undefined;
      setError(fields ? Object.values(fields).flat()[0] : errorMessage(e, "We couldn't save your links. Please try again."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      className="flex flex-col gap-[0.5em]"
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
    >
      {rows.map((row, i) => (
        <div key={i} className="flex min-w-0 items-center gap-[0.5em] rounded-full border border-white/80 bg-white/55 py-[0.3em] pl-[0.4em] pr-[0.3em]">
          <select
            value={row.kind}
            onChange={(e) => update(i, { kind: e.target.value as WorkLinkKind })}
            aria-label="Kind of link"
            className="shrink-0 rounded-full bg-[#4f9cf0]/20 px-[0.6em] py-[0.3em] text-[0.8em] font-semibold text-[#14365a] outline-none"
          >
            {suggested.map((k) => (
              <option key={k} value={k}>
                {LINK_KINDS[k].label}
              </option>
            ))}
          </select>
          <Link2 className="h-[1.1em] w-[1.1em] shrink-0 text-[#14365a]/70" aria-hidden />
          <input
            value={row.url}
            onChange={(e) => update(i, { url: e.target.value })}
            placeholder={LINK_KINDS[row.kind].placeholder}
            aria-label={`${LINK_KINDS[row.kind].label} link`}
            className="min-w-0 flex-1 bg-transparent text-[0.85em] text-[#14365a] outline-none placeholder:text-[#14365a]/55"
          />
          <button
            type="button"
            onClick={() => {
              setRows((r) => (r.length > 1 ? r.filter((_, j) => j !== i) : [{ kind: suggested[0], url: "" }]));
              setSaved(false);
            }}
            aria-label="Remove this link"
            className="grid h-[1.9em] w-[1.9em] shrink-0 place-items-center rounded-full text-[#14365a]/60 hover:bg-white hover:text-[#b83232]"
          >
            <Trash2 className="h-[0.95em] w-[0.95em]" />
          </button>
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-[0.6em]">
        {rows.length < MAX_LINKS && (
          <button
            type="button"
            onClick={() => setRows((r) => [...r, { kind: suggested[Math.min(r.length, suggested.length - 1)], url: "" }])}
            className="flex items-center gap-[0.3em] text-[0.85em] font-semibold text-[#14365a] hover:underline"
          >
            <Plus className="h-[1em] w-[1em]" /> Add another link
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className={`ml-auto flex h-[2.5em] items-center gap-[0.4em] rounded-[0.8em] px-[1.2em] text-[0.9em] font-extrabold tracking-wide shadow-[0_6px_18px_rgba(47,127,214,0.35)] disabled:opacity-70 ${
            saved && me.ready ? "bg-[#2fb36b] text-white" : "bg-[#4f9cf0] text-[#14365a] hover:bg-[#3d8ce6]"
          }`}
        >
          {saving && <LoaderCircle className="h-[1em] w-[1em] animate-spin" />}
          {saved && me.ready ? "READY ✓" : submitLabel}
        </button>
      </div>
      {error && (
        <p role="alert" className="text-[0.8em] font-semibold text-[#b83232]">
          {error}
        </p>
      )}
    </form>
  );
}
