"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Briefcase, ChevronDown, CircleCheck, Languages, LoaderCircle, MessagesSquare, Route as RouteIcon, Search, Star, Users, X } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { mentorAvatar } from "@/lib/avatars";
import { getHub } from "@/lib/hub-api";
import { chooseMentor, getMentor, getMentors, type Mentor, type MentorProfile } from "@/lib/mentorship-api";

const TRACK_NAMES: Record<string, string> = {
  FRONTEND: "Frontend",
  BACKEND: "Backend",
  UIUX: "UI/UX",
  MOBILE: "Mobile",
  AI: "AI",
  DATA: "Data",
  TESTING: "Testing",
  GAMING: "Gaming",
};

type Sort = "rating" | "experience" | "name";
const SORTS: { id: Sort; label: string }[] = [
  { id: "rating", label: "Top Rated" },
  { id: "experience", label: "Most Experienced" },
  { id: "name", label: "Name" },
];

const FEATURES = [
  { icon: RouteIcon, title: "Guide your track", text: "Lessons, projects and career", color: "bg-[#e3eefd] text-[#2f6fc4]" },
  { icon: CircleCheck, title: "Review your work", text: "Feedback in every session", color: "bg-[#e3f6ee] text-[#1f9d5b]" },
  { icon: Briefcase, title: "Plan your future", text: "Internships and first jobs", color: "bg-[#fff4d6] text-[#c27c00]" },
];

function Avatar({ id, className }: { id: string; className: string }) {
  const a = mentorAvatar(id);
  return (
    <span className={`relative shrink-0 overflow-hidden rounded-full ${className}`} style={{ backgroundColor: a.bg }}>
      <Image src={a.src} alt="" fill sizes="170px" className="object-cover" />
    </span>
  );
}

function Rating({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-[0.25em] text-[0.8em] text-[#14365a]/80">
      <Star className="h-[1.05em] w-[1.05em] fill-[#ffc531] text-[#ffc531]" /> {value.toFixed(1)}
    </span>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="rounded-[0.5em] bg-[#eaf3fb] px-[0.6em] py-[0.3em] text-[0.75em] font-semibold text-[#14365a]">{children}</span>;
}

function Select<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { id: T; label: string }[]; label: string }) {
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="h-[2.9em] appearance-none rounded-[0.9em] border border-[#e1e8f0] bg-white pl-[1.1em] pr-[2.6em] text-[0.9em] text-[#14365a] outline-none focus:ring-2 focus:ring-[#12939b]/30"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-[0.9em] top-1/2 h-[1em] w-[1em] -translate-y-1/2 text-[#14365a]" />
    </label>
  );
}

/** Figma "Choose Your Mentor": the student's mentor and every mentor to choose from (MentorsController). */
export default function ChooseMentorPage() {
  const [mentors, setMentors] = useState<Mentor[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [track, setTrack] = useState("all");
  const [skill, setSkill] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [sort, setSort] = useState<Sort>("rating");
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<MentorProfile | "loading" | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([getMentors({ all: true }), getHub().catch(() => null)])
      .then(([list, hub]) => {
        if (!active) return;
        setMentors(list);
        // Mentors of the student's track first, like the backend's default list.
        const code = hub?.courses.track?.code;
        if (code && list.some((m) => m.trackCode === code)) setTrack(code);
      })
      .catch((e) => active && setLoadError(errorMessage(e, "We couldn't load the mentors. Please try again.")));
    return () => {
      active = false;
    };
  }, []);

  const mine = mentors?.find((m) => m.isMyMentor) ?? null;
  // Plain values: the React Compiler memoizes them.
  const options = (() => {
    const list = mentors ?? [];
    const uniq = (xs: string[]) => [...new Set(xs)].sort();
    return {
      tracks: [{ id: "all", label: "All Tracks" }, ...uniq(list.map((m) => m.trackCode)).map((c) => ({ id: c, label: TRACK_NAMES[c] ?? c }))],
      skills: [{ id: "all", label: "All Skills" }, ...uniq(list.flatMap((m) => m.skills)).map((s) => ({ id: s, label: s }))],
      availability: [{ id: "all", label: "Availability" }, ...uniq(list.map((m) => m.availability)).map((a) => ({ id: a, label: a }))],
    };
  })();

  const shown = (() => {
    const q = query.trim().toLowerCase();
    return (mentors ?? [])
      .filter((m) => track === "all" || m.trackCode === track)
      .filter((m) => skill === "all" || m.skills.includes(skill))
      .filter((m) => availability === "all" || m.availability === availability)
      .filter((m) => !q || `${m.fullName} ${m.title} ${m.skills.join(" ")}`.toLowerCase().includes(q))
      .sort((a, b) =>
        sort === "rating" ? b.rating - a.rating : sort === "experience" ? b.yearsOfExperience - a.yearsOfExperience : a.fullName.localeCompare(b.fullName),
      );
  })();

  async function select(m: Mentor) {
    setSaving(m.id);
    setError(null);
    try {
      await chooseMentor(m.id);
      setMentors((list) => list?.map((x) => ({ ...x, isMyMentor: x.id === m.id })) ?? list);
      setProfile(null);
    } catch (e) {
      setError(errorMessage(e, "We couldn't choose this mentor. Please try again."));
    } finally {
      setSaving(null);
    }
  }

  async function openProfile(m: Mentor) {
    setProfile("loading");
    try {
      setProfile(await getMentor(m.id));
    } catch (e) {
      setProfile(null);
      setError(errorMessage(e, "We couldn't load this profile. Please try again."));
    }
  }

  return (
    <div className="relative min-w-0 flex-1 pb-8 pr-3 sm:pr-4 lg:absolute lg:inset-0 lg:overflow-y-auto lg:pb-[calc(var(--u)*2)] lg:pl-[var(--hl)] lg:pr-[calc(var(--u)*1.6)] lg:pt-[calc(var(--u)*6.5)]">
      <div style={{ fontSize: "clamp(11px, calc(var(--u) * 1.05), 16px)" }}>
        {/* ---------- Title, features and your mentor ---------- */}
        <div className="grid gap-[1.2em] lg:grid-cols-[1fr_minmax(0,38em)]">
          <section className="flex flex-col justify-between gap-[1.2em] rounded-[1.6em] bg-white/35 p-[1.4em] backdrop-blur-sm">
            <div>
              <h1 className="text-[2.6em] font-extrabold leading-tight text-[#14365a]">Choose Your Mentor</h1>
              <p className="mt-[0.3em] text-[0.95em] text-[#14365a]">Track your journey, achievements and growth</p>
            </div>
            <ul className="grid gap-[0.8em] rounded-[1.4em] bg-white p-[1em] shadow-[0_6px_22px_rgba(20,54,90,0.07)] sm:grid-cols-3">
              {FEATURES.map((f) => (
                <li key={f.title} className="flex items-center gap-[0.7em]">
                  <span className={`grid h-[2.2em] w-[2.2em] shrink-0 place-items-center rounded-[0.6em] ${f.color}`}>
                    <f.icon className="h-[1.1em] w-[1.1em]" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.85em] font-bold text-[#14365a]">{f.title}</span>
                    <span className="block text-[0.7em] text-[#14365a]/70">{f.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="your-mentor" className="rounded-[1.6em] bg-white p-[1.2em] shadow-[0_6px_22px_rgba(20,54,90,0.07)]">
            <h2 id="your-mentor" className="text-[1.3em] font-extrabold text-[#14365a]">
              Your Mentor
            </h2>
            {!mentors ? (
              <LoaderCircle className="mx-auto my-[2em] h-[2em] w-[2em] animate-spin text-[#12939b]" />
            ) : mine ? (
              <div className="mt-[0.6em] flex flex-wrap items-center gap-[1.2em]">
                <Avatar id={mine.id} className="h-[10em] w-[10em]" />
                <div className="min-w-0 flex-1">
                  <span className="rounded-full bg-[#c9f2d6] px-[0.6em] py-[0.15em] text-[0.7em] font-semibold text-[#1f7a43]">{mine.availability}</span>
                  <div className="mt-[0.5em]">
                    <Rating value={mine.rating} />
                  </div>
                  <p className="mt-[0.2em] text-[1.35em] font-bold text-[#14365a]">{mine.fullName}</p>
                  <p className="text-[1em] text-[#14365a]">{mine.title}</p>
                  <p className="text-[0.9em] text-[#14365a]/75">{mine.yearsOfExperience} years experience</p>
                </div>
                <div className="flex flex-col gap-[0.5em]">
                  {mine.skills.slice(0, 3).map((s) => (
                    <Chip key={s}>{s}</Chip>
                  ))}
                </div>
              </div>
            ) : (
              <p className="mt-[0.8em] text-[0.95em] text-[#14365a]/75">
                You don&apos;t have a mentor yet. Choose one below: they will guide you through your track.
              </p>
            )}
          </section>
        </div>

        {/* ---------- Mentors ---------- */}
        <section aria-label="Mentors" className="mt-[1.2em] rounded-[1.6em] bg-white p-[1.2em] shadow-[0_6px_22px_rgba(20,54,90,0.07)]">
          <div className="flex flex-wrap items-center gap-[0.8em]">
            <label className="relative min-w-[14em] flex-1">
              <Search className="pointer-events-none absolute left-[1em] top-1/2 h-[1.1em] w-[1.1em] -translate-y-1/2 text-[#14365a]/55" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search a mentor..."
                aria-label="Search a mentor"
                className="h-[2.9em] w-full rounded-[0.9em] border border-[#e1e8f0] bg-white pl-[2.8em] pr-[1em] text-[0.9em] text-[#14365a] outline-none placeholder:text-[#14365a]/45 focus:ring-2 focus:ring-[#12939b]/30"
              />
            </label>
            <Select label="Track" value={track} onChange={setTrack} options={options.tracks} />
            <Select label="Skill" value={skill} onChange={setSkill} options={options.skills} />
            <Select label="Availability" value={availability} onChange={setAvailability} options={options.availability} />
            <span className="ml-auto flex items-center gap-[0.6em] text-[0.9em] text-[#14365a]">
              Sort by <Select label="Sort by" value={sort} onChange={setSort} options={SORTS} />
            </span>
          </div>

          {(error || loadError) && (
            <p role="alert" className="mt-[1em] rounded-[0.8em] bg-[#fdecec] px-[1em] py-[0.6em] text-[0.85em] font-semibold text-[#b83232]">
              {error ?? loadError}
            </p>
          )}

          {!mentors && !loadError && <LoaderCircle className="mx-auto my-[3em] h-[2em] w-[2em] animate-spin text-[#12939b]" />}
          {mentors && shown.length === 0 && <p className="py-[3em] text-center text-[0.95em] text-[#14365a]/65">No mentor matches these filters.</p>}

          <ul className="mt-[1em] grid gap-[0.9em] md:grid-cols-2 xl:grid-cols-3">
            {shown.map((m) => (
              <li key={m.id} className="flex flex-col rounded-[1.2em] border border-[#e8eef5] p-[1em]">
                <div className="flex items-center gap-[1em]">
                  <Avatar id={m.id} className="h-[8.5em] w-[8.5em]" />
                  <div className="min-w-0">
                    <span className="rounded-full bg-[#c9f2d6] px-[0.6em] py-[0.15em] text-[0.7em] font-semibold text-[#1f7a43]">{m.availability}</span>
                    <div className="mt-[0.5em]">
                      <Rating value={m.rating} />
                    </div>
                    <p className="mt-[0.2em] truncate text-[1.25em] font-bold text-[#14365a]">{m.fullName}</p>
                    <p className="text-[0.95em] text-[#14365a]">{m.title}</p>
                    <p className="text-[0.85em] text-[#14365a]/70">
                      {TRACK_NAMES[m.trackCode] ?? m.trackCode} · {m.yearsOfExperience} years
                    </p>
                  </div>
                </div>
                <p className="mt-[0.9em] line-clamp-2 text-[0.85em] leading-snug text-[#14365a]/85">{m.bio}</p>
                <div className="mt-[0.7em] flex flex-wrap gap-[0.4em]">
                  {m.skills.slice(0, 3).map((s) => (
                    <Chip key={s}>{s}</Chip>
                  ))}
                </div>
                <div className="mt-auto grid grid-cols-2 gap-[0.6em] pt-[1.2em]">
                  <button
                    type="button"
                    onClick={() => openProfile(m)}
                    className="h-[2.8em] rounded-[0.6em] border border-[#e1e8f0] text-[0.95em] font-semibold text-[#14365a] hover:bg-[#f4f8fc]"
                  >
                    View Profile
                  </button>
                  <button
                    type="button"
                    disabled={m.isMyMentor || saving !== null}
                    onClick={() => select(m)}
                    className="flex h-[2.8em] items-center justify-center gap-[0.4em] rounded-[0.6em] bg-[#14365a] text-[0.95em] font-semibold text-white hover:bg-[#0f2a47] disabled:cursor-default disabled:opacity-70"
                  >
                    {saving === m.id ? <LoaderCircle className="h-[1.1em] w-[1.1em] animate-spin" /> : m.isMyMentor ? <CircleCheck className="h-[1.1em] w-[1.1em]" /> : null}
                    {m.isMyMentor ? "Your Mentor" : "Select Mentor"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {profile && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mentor profile"
          className="fixed inset-0 z-[70] grid place-items-center bg-[#14365a]/40 p-4"
          onClick={(e) => e.target === e.currentTarget && setProfile(null)}
        >
          <div className="w-full max-w-lg rounded-[24px] bg-white p-6 text-[#14365a] shadow-2xl">
            {profile === "loading" ? (
              <LoaderCircle className="mx-auto my-10 size-8 animate-spin text-[#12939b]" />
            ) : (
              <>
                <div className="flex items-start gap-4">
                  <Avatar id={profile.mentor.id} className="size-24" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xl font-bold">{profile.mentor.fullName}</p>
                    <p className="text-sm">{profile.mentor.title}</p>
                    <div className="mt-1 text-base">
                      <Rating value={profile.mentor.rating} />
                    </div>
                  </div>
                  <button type="button" onClick={() => setProfile(null)} aria-label="Close" className="grid size-9 place-items-center rounded-full hover:bg-slate-100">
                    <X className="size-5" />
                  </button>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-[#14365a]/85">{profile.mentor.bio}</p>
                <dl className="mt-4 grid gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Briefcase className="size-4 text-[#12939b]" /> {profile.mentor.yearsOfExperience} years experience ·{" "}
                    {TRACK_NAMES[profile.mentor.trackCode] ?? profile.mentor.trackCode}
                  </div>
                  <div className="flex items-center gap-2">
                    <MessagesSquare className="size-4 text-[#12939b]" /> {profile.mentor.availability}
                  </div>
                  <div className="flex items-center gap-2">
                    <Languages className="size-4 text-[#12939b]" /> {profile.mentor.languages.join(", ")}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="size-4 text-[#12939b]" /> Mentoring {profile.currentStudents} {profile.currentStudents === 1 ? "student" : "students"} now
                  </div>
                </dl>
                <div className="mt-4 flex flex-wrap gap-1.5 text-base">
                  {profile.mentor.skills.map((s) => (
                    <Chip key={s}>{s}</Chip>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={profile.mentor.isMyMentor || saving !== null}
                  onClick={() => select(profile.mentor)}
                  className="mt-6 h-11 w-full rounded-xl bg-[#14365a] text-sm font-semibold text-white hover:bg-[#0f2a47] disabled:opacity-70"
                >
                  {profile.mentor.isMyMentor ? "Your Mentor" : saving ? "Saving…" : "Select Mentor"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
