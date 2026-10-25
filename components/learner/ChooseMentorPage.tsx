"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Briefcase,
  CalendarCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Hourglass,
  MessageCircle,
  Languages,
  LoaderCircle,
  MessagesSquare,
  Route as RouteIcon,
  Search,
  Star,
  User,
  Users,
  X,
} from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { mentorAvatar } from "@/lib/avatars";
import {
  bookSession,
  cancelSession,
  chooseMentor,
  getMentor,
  getMentors,
  getMentorMessages,
  getMentorSlots,
  getMyMentor,
  getMySessions,
  markMentorMessagesRead,
  sendMentorMessage,
  sessionTime,
  type Mentor,
  type MentorAssignment,
  type MentorProfile,
  type MentorSession,
  type MentorSlots,
  type PendingMentorRequest,
  type SessionType,
} from "@/lib/mentorship-api";
import { useT } from "@/lib/i18n/client";
import { dateLocale, tk, tNow } from "@/lib/i18n/translate";
import DirectChat from "@/components/shared/DirectChat";

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
const trackName = (code: string) => tNow(TRACK_NAMES[code] ?? code);

type Sort = "rating" | "experience" | "name";
const SORTS: { id: Sort; label: string }[] = [
  { id: "rating", label: tk("Top Rated") },
  { id: "experience", label: tk("Most Experienced") },
  { id: "name", label: tk("Name") },
];

const FEATURES = [
  { icon: RouteIcon, title: tk("1:1 Mentoring"), text: tk("Guidance on your track"), color: "bg-[#e3eefd] text-[#2f6fc4]" },
  { icon: CircleCheck, title: tk("Practical advice"), text: tk("From real experience"), color: "bg-[#e3f6ee] text-[#1f9d5b]" },
  { icon: Briefcase, title: tk("Plan your future"), text: tk("Projects and career"), color: "bg-[#fff4d6] text-[#c27c00]" },
];

/** Day key and labels in school time (Cairo). */
const CAIRO = "Africa/Cairo";
const dayKey = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { timeZone: CAIRO });
const dayParts = (iso: string) => ({
  weekday: new Date(iso).toLocaleDateString(dateLocale("en-GB"), { weekday: "short", timeZone: CAIRO }),
  day: new Date(iso).toLocaleDateString(dateLocale("en-GB"), { day: "numeric", timeZone: CAIRO }),
  month: new Date(iso).toLocaleDateString(dateLocale("en-GB"), { month: "long", year: "numeric", timeZone: CAIRO }),
});
const timeLabel = (iso: string) =>
  new Date(iso).toLocaleTimeString(dateLocale("en-GB"), { hour: "numeric", minute: "2-digit", hour12: true, timeZone: CAIRO }).toUpperCase();

const DAYS_SHOWN = 5;

function Avatar({ mentor, className }: { mentor: { id: string; photoUrl?: string | null }; className: string }) {
  const a = mentorAvatar(mentor);
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

function Availability({ text }: { text: string }) {
  const t = useT();
  return <span className="rounded-full bg-[#c9f2d6] px-[0.6em] py-[0.15em] text-[0.7em] font-semibold text-[#1f7a43]">{t(text)}</span>;
}

function Select<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { id: T; label: string }[]; label: string }) {
  const t = useT();
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="h-[2.9em] appearance-none rounded-[0.9em] border border-[#e1e8f0] bg-white ps-[1.1em] pe-[2.6em] text-[0.9em] text-[#14365a] outline-none focus:ring-2 focus:ring-[#12939b]/30"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {t(o.label)}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute end-[0.9em] top-1/2 h-[1em] w-[1em] -translate-y-1/2 text-[#14365a]" />
    </label>
  );
}

/** Figma "Choose Your Mentor": the student's mentor in each track, the mentors of their tracks, and booking a session. */
export default function ChooseMentorPage() {
  const t = useT();
  const [mentors, setMentors] = useState<Mentor[] | null>(null);
  const [mine, setMine] = useState<MentorAssignment[]>([]);
  const [pending, setPending] = useState<PendingMentorRequest[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [chatWith, setChatWith] = useState<Mentor | null>(null);
  // The notification of a new message from the mentor links here with ?chat=1.
  const openChat = useSearchParams().get("chat") === "1";
  const [sessions, setSessions] = useState<MentorSession[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [track, setTrack] = useState("all");
  const [skill, setSkill] = useState("all");
  const [sort, setSort] = useState<Sort>("rating");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [profile, setProfile] = useState<MentorProfile | "loading" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([getMentors(), getMyMentor(), getMySessions().catch(() => [])])
      .then(([list, my, booked]) => {
        if (!active) return;
        setMentors(list);
        setMine(my.currents);
        setPending(my.pendingRequests ?? []);
        setSessions(booked);
        if (openChat && my.current) setChatWith(my.current.mentor);
        setSelectedId(my.current?.mentor.id ?? list[0]?.id ?? null);
      })
      .catch((e) => active && setLoadError(errorMessage(e, "We couldn't load the mentors. Please try again.")));
    return () => {
      active = false;
    };
  }, [openChat]);

  const pendingFor = (m: Mentor) => pending.some((p) => p.requestedMentor.id === m.id);
  const selected = mentors?.find((m) => m.id === selectedId) ?? null;
  const options = (() => {
    const list = mentors ?? [];
    const uniq = (xs: string[]) => [...new Set(xs)].sort();
    return {
      tracks: [{ id: "all", label: t("All My Tracks") }, ...uniq(list.map((m) => m.trackCode)).map((c) => ({ id: c, label: trackName(c) }))],
      skills: [{ id: "all", label: t("All Skills") }, ...uniq(list.flatMap((m) => m.skills)).map((s) => ({ id: s, label: s }))],
    };
  })();
  const shown = (() => {
    const q = query.trim().toLowerCase();
    return (mentors ?? [])
      .filter((m) => track === "all" || m.trackCode === track)
      .filter((m) => skill === "all" || m.skills.includes(skill))
      .filter((m) => !q || `${m.fullName} ${m.title} ${m.skills.join(" ")}`.toLowerCase().includes(q))
      .sort((a, b) =>
        sort === "rating" ? b.rating - a.rating : sort === "experience" ? b.yearsOfExperience - a.yearsOfExperience : a.fullName.localeCompare(b.fullName),
      );
  })();

  /**
   * Choosing a mentor in a track without one applies at once; changing the mentor is a request the admin approves
   * (the mentor changes only then).
   */
  async function makeMyMentor(m: Mentor) {
    setError(null);
    setNotice(null);
    const changing = mine.some((a) => a.mentor.trackCode === m.trackCode);
    const question = changing
      ? t("Send a request to change your {track} mentor to {name}? Your mentor changes once the admin approves.", { track: trackName(m.trackCode), name: m.fullName })
      : t("Make {name} your {track} mentor?", { name: m.fullName, track: trackName(m.trackCode) });
    if (!window.confirm(question)) return;
    try {
      const my = await chooseMentor(m.id);
      setMine(my.currents);
      setPending(my.pendingRequests ?? []);
      setNotice(changing ? t("Your request was sent. Waiting for admin approval.") : t("{name} is now your mentor.", { name: m.fullName }));
      const ids = new Set(my.currents.map((c) => c.mentor.id));
      setMentors((list) => list?.map((x) => ({ ...x, isMyMentor: ids.has(x.id) })) ?? list);
      setProfile(null);
    } catch (e) {
      setError(errorMessage(e, "We couldn't choose this mentor. Please try again."));
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

  async function cancel(s: MentorSession) {
    setError(null);
    try {
      await cancelSession(s.id);
      setSessions((list) => list.filter((x) => x.id !== s.id));
    } catch (e) {
      setError(errorMessage(e, "We couldn't cancel this session. Please try again."));
    }
  }

  return (
    <div className="relative min-w-0 flex-1 pb-8 pe-3 sm:pe-4 lg:absolute lg:inset-0 lg:overflow-y-auto lg:pb-[calc(var(--u)*2)] lg:ps-[var(--hl)] lg:pe-[calc(var(--u)*1.6)] lg:pt-[calc(var(--u)*6.5)]">
      <div style={{ fontSize: "clamp(11px, calc(var(--u) * 1.05), 16px)" }}>
        {/* ---------- Title, features and your mentors ---------- */}
        <div className="grid gap-[1.2em] lg:grid-cols-[1fr_minmax(0,38em)]">
          <section className="flex flex-col justify-between gap-[1.2em] rounded-[1.6em] bg-white/35 p-[1.4em] backdrop-blur-sm">
            <div>
              <h1 className="text-[2.6em] font-extrabold leading-tight text-[#14365a]">{t("Choose Your Mentor")}</h1>
              <p className="mt-[0.3em] text-[0.95em] text-[#14365a]">{t("Track your journey, achievements and growth")}</p>
            </div>
            <ul className="grid gap-[0.8em] rounded-[1.4em] bg-white p-[1em] shadow-[0_6px_22px_rgba(20,54,90,0.07)] sm:grid-cols-3">
              {FEATURES.map((f) => (
                <li key={f.title} className="flex items-center gap-[0.7em]">
                  <span className={`grid h-[2.2em] w-[2.2em] shrink-0 place-items-center rounded-[0.6em] ${f.color}`}>
                    <f.icon className="h-[1.1em] w-[1.1em]" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.85em] font-bold text-[#14365a]">{t(f.title)}</span>
                    <span className="block text-[0.7em] text-[#14365a]/70">{t(f.text)}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="your-mentor" className="rounded-[1.6em] bg-white p-[1.2em] shadow-[0_6px_22px_rgba(20,54,90,0.07)]">
            <h2 id="your-mentor" className="text-[1.3em] font-extrabold text-[#14365a]">
              {mine.length > 1 ? t("Your Mentors") : t("Your Mentor")}
            </h2>
            {!mentors ? (
              <LoaderCircle className="mx-auto my-[2em] h-[2em] w-[2em] animate-spin text-[#12939b]" />
            ) : mine.length === 0 ? (
              <p className="mt-[0.8em] text-[0.95em] text-[#14365a]/75">{t("You don't have a mentor yet. Choose one below.")}</p>
            ) : mine.length === 1 ? (
              <div className="mt-[0.6em] flex flex-wrap items-center gap-[1.2em]">
                <Avatar mentor={mine[0].mentor} className="h-[9em] w-[9em]" />
                <div className="min-w-0 flex-1">
                  <Availability text={mine[0].mentor.availability} />
                  <div className="mt-[0.5em]">
                    <Rating value={mine[0].mentor.rating} />
                  </div>
                  <p className="mt-[0.2em] text-[1.35em] font-bold text-[#14365a]">{mine[0].mentor.fullName}</p>
                  <p className="text-[1em] text-[#14365a]">{t(mine[0].mentor.title)}</p>
                  <p className="text-[0.9em] text-[#14365a]/75">{t("{track} mentor", { track: trackName(mine[0].mentor.trackCode) })}</p>
                </div>
                <div className="flex flex-col gap-[0.5em]">
                  {mine[0].mentor.skills.slice(0, 3).map((s) => (
                    <Chip key={s}>{s}</Chip>
                  ))}
                  <button
                    type="button"
                    onClick={() => setChatWith(mine[0].mentor)}
                    className="flex h-[2.4em] items-center justify-center gap-[0.4em] rounded-[0.6em] bg-[#12939b] px-[1em] text-[0.85em] font-semibold text-white hover:bg-[#0f7c83]"
                  >
                    <MessageCircle className="h-[1.1em] w-[1.1em]" /> {t("Message")}
                  </button>
                </div>
              </div>
            ) : (
              <ul className="mt-[0.6em] grid gap-[0.6em]">
                {mine.map((a) => (
                  <li key={a.mentor.id} className="flex items-center gap-[0.8em]">
                    <Avatar mentor={a.mentor} className="h-[3.6em] w-[3.6em]" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[1em] font-bold text-[#14365a]">{a.mentor.fullName}</p>
                      <p className="truncate text-[0.8em] text-[#14365a]/75">{t(a.mentor.title)}</p>
                    </div>
                    <span className="rounded-full bg-[#eaf3fb] px-[0.7em] py-[0.2em] text-[0.75em] font-bold text-[#14365a]">
                      {trackName(a.mentor.trackCode)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setChatWith(a.mentor)}
                      aria-label={t("Message {name}", { name: a.mentor.fullName })}
                      className="grid h-[2.2em] w-[2.2em] place-items-center rounded-full bg-[#e3f6fb] text-[#12939b] hover:bg-[#d2eef5]"
                    >
                      <MessageCircle className="h-[1.1em] w-[1.1em]" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {pending.map((p) => (
              <p key={p.id} className="mt-[0.8em] flex items-center gap-[0.5em] rounded-[0.8em] bg-[#fff4d6] px-[0.9em] py-[0.6em] text-[0.85em] font-semibold text-[#8a5a00]">
                <Hourglass className="h-[1.1em] w-[1.1em] shrink-0" />
                {t("Your request to change to {name} is waiting for admin approval.", { name: p.requestedMentor.fullName })}
              </p>
            ))}

            {sessions.length > 0 && (
              <div className="mt-[1em] border-t border-[#e8eef5] pt-[0.8em]">
                <h3 className="text-[0.9em] font-bold text-[#14365a]">{t("Your sessions")}</h3>
                <ul className="mt-[0.4em] grid gap-[0.4em]">
                  {sessions.map((s) => (
                    <li key={s.id} className="flex items-center gap-[0.6em] rounded-[0.8em] bg-[#e9f7f4] px-[0.8em] py-[0.5em] text-[0.85em] text-[#14365a]">
                      <CalendarCheck className="h-[1.2em] w-[1.2em] shrink-0 text-[#12939b]" />
                      <span className="min-w-0 flex-1">
                        <span className="font-bold">{s.type === "OneToOne" ? t("1:1 session") : t("Group session")}</span>{" "}
                        {t("with {name}", { name: s.mentor.fullName })} · {sessionTime(s.startsUtc)}
                      </span>
                      <button type="button" onClick={() => cancel(s)} className="text-[0.85em] font-semibold text-[#b83232] hover:underline">
                        {t("Cancel")}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>

        {/* ---------- Mentors of your tracks, and the selected mentor ---------- */}
        <section aria-label={t("Mentors")} className="mt-[1.2em] rounded-[1.6em] bg-white p-[1.2em] shadow-[0_6px_22px_rgba(20,54,90,0.07)]">
          <div className="flex flex-wrap items-center gap-[0.8em]">
            <label className="relative min-w-[14em] flex-1">
              <Search className="pointer-events-none absolute start-[1em] top-1/2 h-[1.1em] w-[1.1em] -translate-y-1/2 text-[#14365a]/55" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("Search a mentor...")}
                aria-label={t("Search a mentor")}
                className="h-[2.9em] w-full rounded-[0.9em] border border-[#e1e8f0] bg-white ps-[2.8em] pe-[1em] text-[0.9em] text-[#14365a] outline-none placeholder:text-[#14365a]/45 focus:ring-2 focus:ring-[#12939b]/30"
              />
            </label>
            <Select label={t("Skill")} value={skill} onChange={setSkill} options={options.skills} />
            <Select label={t("Track")} value={track} onChange={setTrack} options={options.tracks} />
            <span className="ms-auto flex items-center gap-[0.6em] text-[0.9em] text-[#14365a]">
              {t("Sort by")} <Select label={t("Sort by")} value={sort} onChange={setSort} options={SORTS} />
            </span>
          </div>

          {(error || loadError) && (
            <p role="alert" className="mt-[1em] rounded-[0.8em] bg-[#fdecec] px-[1em] py-[0.6em] text-[0.85em] font-semibold text-[#b83232]">
              {error ?? loadError}
            </p>
          )}
          {notice && !error && (
            <p role="status" className="mt-[1em] rounded-[0.8em] bg-[#e3f6ee] px-[1em] py-[0.6em] text-[0.85em] font-semibold text-[#1f7a4a]">{notice}</p>
          )}
          {!mentors && !loadError && <LoaderCircle className="mx-auto my-[3em] h-[2em] w-[2em] animate-spin text-[#12939b]" />}

          <div className="mt-[1em] grid items-start gap-[1em] xl:grid-cols-[1fr_minmax(0,27em)]">
            <ul className="grid gap-[0.9em] md:grid-cols-2">
              {mentors && shown.length === 0 && <p className="py-[3em] text-center text-[0.95em] text-[#14365a]/65 md:col-span-2">{t("No mentor matches these filters.")}</p>}
              {shown.map((m) => (
                <li
                  key={m.id}
                  className={`flex flex-col rounded-[1.2em] border p-[1em] ${m.id === selectedId ? "border-[#14365a] ring-2 ring-[#14365a]/15" : "border-[#e8eef5]"}`}
                >
                  <div className="flex items-center gap-[1em]">
                    <Avatar mentor={m} className="h-[7.5em] w-[7.5em]" />
                    <div className="min-w-0">
                      <Availability text={m.availability} />
                      <div className="mt-[0.5em]">
                        <Rating value={m.rating} />
                      </div>
                      <p className="mt-[0.2em] truncate text-[1.2em] font-bold text-[#14365a]">{m.fullName}</p>
                      <p className="text-[0.9em] text-[#14365a]">{t(m.title)}</p>
                      <p className="text-[0.8em] text-[#14365a]/70">
                        {trackName(m.trackCode)} · {t("{n} years", { n: m.yearsOfExperience })}{m.isMyMentor ? ` · ${t("Your mentor")}` : ""}
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
                      {t("View Profile")}
                    </button>
                    {m.isMyMentor ? (
                      <button
                        type="button"
                        onClick={() => setChatWith(m)}
                        className="flex h-[2.8em] items-center justify-center gap-[0.4em] rounded-[0.6em] bg-[#12939b] text-[0.95em] font-semibold text-white hover:bg-[#0f7c83]"
                      >
                        <MessageCircle className="h-[1.1em] w-[1.1em]" /> {t("Message")}
                      </button>
                    ) : pendingFor(m) ? (
                      <span className="flex h-[2.8em] items-center justify-center gap-[0.4em] rounded-[0.6em] bg-[#fff4d6] px-[0.4em] text-center text-[0.8em] font-semibold leading-tight text-[#8a5a00]">
                        <Hourglass className="h-[1.1em] w-[1.1em] shrink-0" /> {t("Waiting for admin approval")}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedId(m.id);
                          void makeMyMentor(m);
                        }}
                        className="h-[2.8em] rounded-[0.6em] bg-[#14365a] text-[0.95em] font-semibold text-white hover:bg-[#0f2a47]"
                      >
                        {t("Select Mentor")}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {selected && (
              <BookingPanel
                key={selected.id}
                mentor={selected}
                pending={pendingFor(selected)}
                onMakeMine={() => makeMyMentor(selected)}
                onBooked={(s) => setSessions((list) => [...list, s].sort((a, b) => a.startsUtc.localeCompare(b.startsUtc)))}
              />
            )}
          </div>
        </section>
      </div>

      {chatWith && (
        <DirectChat
          key={chatWith.id}
          me="student"
          partner={{ id: chatWith.id, name: chatWith.fullName, photoUrl: mentorAvatar(chatWith).src, subtitle: t("{track} mentor", { track: trackName(chatWith.trackCode) }) }}
          load={getMentorMessages}
          send={sendMentorMessage}
          markRead={markMentorMessagesRead}
          onClose={() => setChatWith(null)}
        />
      )}

      {profile && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t("Mentor profile")}
          className="fixed inset-0 z-[70] grid place-items-center bg-[#14365a]/40 p-4"
          onClick={(e) => e.target === e.currentTarget && setProfile(null)}
        >
          <div className="w-full max-w-lg rounded-[24px] bg-white p-6 text-[#14365a] shadow-2xl">
            {profile === "loading" ? (
              <LoaderCircle className="mx-auto my-10 size-8 animate-spin text-[#12939b]" />
            ) : (
              <>
                <div className="flex items-start gap-4">
                  <Avatar mentor={profile.mentor} className="size-24" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xl font-bold">{profile.mentor.fullName}</p>
                    <p className="text-sm">{t(profile.mentor.title)}</p>
                    <div className="mt-1 text-base">
                      <Rating value={profile.mentor.rating} />
                    </div>
                  </div>
                  <button type="button" onClick={() => setProfile(null)} aria-label={t("Close")} className="grid size-9 place-items-center rounded-full hover:bg-slate-100">
                    <X className="size-5" />
                  </button>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-[#14365a]/85">{profile.mentor.bio}</p>
                <dl className="mt-4 grid gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Briefcase className="size-4 text-[#12939b]" /> {t("{n} years experience", { n: profile.mentor.yearsOfExperience })} · {trackName(profile.mentor.trackCode)}
                  </div>
                  <div className="flex items-center gap-2">
                    <MessagesSquare className="size-4 text-[#12939b]" /> {t(profile.mentor.availability)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Languages className="size-4 text-[#12939b]" /> {profile.mentor.languages.map((l) => t(l)).join(t(", "))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="size-4 text-[#12939b]" />{" "}
                    {profile.currentStudents === 1 ? t("Mentoring 1 student now") : t("Mentoring {n} students now", { n: profile.currentStudents })}
                  </div>
                </dl>
                <div className="mt-4 flex flex-wrap gap-1.5 text-base">
                  {profile.mentor.skills.map((s) => (
                    <Chip key={s}>{s}</Chip>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(profile.mentor.id);
                    setProfile(null);
                  }}
                  className="mt-6 h-11 w-full rounded-xl bg-[#14365a] text-sm font-semibold text-white hover:bg-[#0f2a47]"
                >
                  {t("Book a session")}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Figma "Selected Mentor": the session type, a day and a time from the mentor's slots, then Book Session. */
function BookingPanel({ mentor, pending, onMakeMine, onBooked }: { mentor: Mentor; pending: boolean; onMakeMine: () => Promise<void>; onBooked: (s: MentorSession) => void }) {
  const t = useT();
  const [slots, setSlots] = useState<MentorSlots | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const [type, setType] = useState<SessionType>("OneToOne");
  const [page, setPage] = useState(0);
  const [day, setDay] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [making, setMaking] = useState(false);
  const [booked, setBooked] = useState<MentorSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getMentorSlots(mentor.id).then(
      (s) => active && setSlots(s),
      (e) => active && setFailed(errorMessage(e, "We couldn't load this mentor's times.")),
    );
    return () => {
      active = false;
    };
  }, [mentor.id]);

  const days = [...new Set((slots?.slots ?? []).map((s) => dayKey(s.startsUtc)))];
  const pageDays = days.slice(page * DAYS_SHOWN, page * DAYS_SHOWN + DAYS_SHOWN);
  const chosenDay = day && days.includes(day) ? day : (pageDays[0] ?? null);
  const times = (slots?.slots ?? []).filter((s) => dayKey(s.startsUtc) === chosenDay);
  const free = (s: MentorSlots["slots"][number]) => !s.bookedByMe && (type === "OneToOne" ? s.oneToOneAvailable : s.groupSpotsLeft > 0);
  const firstOfPage = (slots?.slots ?? []).find((s) => dayKey(s.startsUtc) === pageDays[0]);

  async function book() {
    if (!time) return;
    setBusy(true);
    setError(null);
    try {
      const s = await bookSession(mentor.id, time, type);
      setBooked(s);
      onBooked(s);
      setSlots(await getMentorSlots(mentor.id));
      setTime(null);
    } catch (e) {
      setError(errorMessage(e, "We couldn't book this session. Please try again."));
      setSlots(await getMentorSlots(mentor.id).catch(() => slots));
    } finally {
      setBusy(false);
    }
  }

  return (
    <aside aria-label={t("Selected mentor")} className="rounded-[1.2em] border border-[#e8eef5] p-[1.2em] text-[#14365a] xl:sticky xl:top-0">
      <h2 className="text-[1.25em] font-extrabold">{t("Selected Mentor")}</h2>
      <div className="mt-[0.8em] flex items-center gap-[1em]">
        <Avatar mentor={mentor} className="h-[7.5em] w-[7.5em]" />
        <div className="min-w-0">
          <Availability text={mentor.availability} />
          <div className="mt-[0.5em]">
            <Rating value={mentor.rating} />
          </div>
          <p className="mt-[0.2em] text-[1.25em] font-bold">{mentor.fullName}</p>
          <p className="text-[0.9em]">{t(mentor.title)}</p>
          <p className="text-[0.8em] text-[#14365a]/70">{trackName(mentor.trackCode)}</p>
        </div>
      </div>
      <p className="mt-[0.8em] text-[0.85em] leading-snug text-[#14365a]/85">{mentor.bio}</p>
      <div className="mt-[0.6em] flex flex-wrap gap-[0.4em]">
        {mentor.skills.slice(0, 3).map((s) => (
          <Chip key={s}>{s}</Chip>
        ))}
      </div>
      {pending && (
        <p className="mt-[0.8em] flex items-center gap-[0.4em] text-[0.85em] font-semibold text-[#8a5a00]">
          <Hourglass className="h-[1em] w-[1em]" /> {t("Waiting for admin approval")}
        </p>
      )}
      {!mentor.isMyMentor && !pending && (
        <button
          type="button"
          disabled={making}
          onClick={async () => {
            setMaking(true);
            await onMakeMine();
            setMaking(false);
          }}
          className="mt-[0.8em] text-[0.85em] font-semibold text-[#12939b] hover:underline disabled:opacity-60"
        >
          {making ? t("Saving…") : t("Make {name} my {track} mentor", { name: mentor.fullName.split(" ")[0], track: trackName(mentor.trackCode) })}
        </button>
      )}

      <h3 className="mt-[1.2em] text-[1em] font-bold">{t("Session Type")}</h3>
      <div className="mt-[0.5em] grid grid-cols-2 gap-[0.6em]">
        {(
          [
            { id: "OneToOne", icon: User, title: t("1:1 Session"), text: t("{n} min, just you", { n: slots?.durationMinutes ?? 45 }) },
            { id: "Group", icon: Users, title: t("Group Session"), text: t("Up to {n} students", { n: slots?.groupCapacity ?? 5 }) },
          ] as const
        ).map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={type === o.id}
            onClick={() => {
              setType(o.id);
              setTime(null);
            }}
            className={`flex items-center gap-[0.6em] rounded-[0.8em] border px-[0.8em] py-[0.7em] text-start ${
              type === o.id ? "border-[#12939b] bg-[#e3f6fb]" : "border-transparent bg-[#f2f5f8] hover:bg-[#e9eef3]"
            }`}
          >
            <o.icon className="h-[1.4em] w-[1.4em] shrink-0" />
            <span className="min-w-0">
              <span className="block text-[0.85em] font-bold">{o.title}</span>
              <span className="block text-[0.7em] text-[#14365a]/70">{o.text}</span>
            </span>
          </button>
        ))}
      </div>

      <h3 className="mt-[1.2em] text-[1em] font-bold">{t("Choose Date & Time")}</h3>
      {failed && <p className="mt-[0.5em] text-[0.85em] text-[#b83232]">{failed}</p>}
      {!slots && !failed && <LoaderCircle className="mx-auto my-[1.5em] h-[1.6em] w-[1.6em] animate-spin text-[#12939b]" />}
      {slots && days.length === 0 && <p className="mt-[0.5em] text-[0.85em] text-[#14365a]/70">{t("This mentor has no session times yet.")}</p>}
      {slots && days.length > 0 && (
        <>
          <div className="mt-[0.5em] rounded-[1em] border border-[#e8eef5] p-[0.8em]">
            <div className="flex items-center justify-between">
              <button
                type="button"
                aria-label={t("Earlier days")}
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                className="grid h-[2em] w-[2em] place-items-center rounded-full hover:bg-[#f2f5f8] disabled:opacity-30"
              >
                <ChevronLeft className="h-[1.1em] w-[1.1em]" />
              </button>
              <span className="text-[0.95em] font-semibold">{firstOfPage ? dayParts(firstOfPage.startsUtc).month : ""}</span>
              <button
                type="button"
                aria-label={t("Later days")}
                disabled={(page + 1) * DAYS_SHOWN >= days.length}
                onClick={() => setPage(page + 1)}
                className="grid h-[2em] w-[2em] place-items-center rounded-full hover:bg-[#f2f5f8] disabled:opacity-30"
              >
                <ChevronRight className="h-[1.1em] w-[1.1em]" />
              </button>
            </div>
            <div className="mt-[0.6em] grid grid-cols-5 gap-[0.4em]">
              {pageDays.map((d) => {
                const first = slots.slots.find((s) => dayKey(s.startsUtc) === d)!;
                const parts = dayParts(first.startsUtc);
                return (
                  <button
                    key={d}
                    type="button"
                    aria-pressed={d === chosenDay}
                    onClick={() => {
                      setDay(d);
                      setTime(null);
                    }}
                    className={`rounded-[0.6em] border py-[0.4em] text-center ${
                      d === chosenDay ? "border-[#14365a] bg-[#14365a] text-white" : "border-[#e1e8f0] hover:bg-[#f2f5f8]"
                    }`}
                  >
                    <span className="block text-[0.7em]">{parts.weekday}</span>
                    <span className="block text-[1em] font-bold">{parts.day}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-[0.8em] grid grid-cols-3 gap-[0.5em]">
            {times.map((s) => (
              <button
                key={s.startsUtc}
                type="button"
                disabled={!free(s)}
                aria-pressed={time === s.startsUtc}
                onClick={() => setTime(s.startsUtc)}
                title={s.bookedByMe ? t("You booked this time") : !free(s) ? t("Not available") : undefined}
                className={`rounded-[0.6em] border py-[0.55em] text-[0.8em] font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${
                  time === s.startsUtc ? "border-[#14365a] bg-[#14365a] text-white" : "border-[#e1e8f0] hover:bg-[#f2f5f8]"
                }`}
              >
                {timeLabel(s.startsUtc)}
                {s.bookedByMe && <span className="block text-[0.8em]">{t("Booked")}</span>}
                {!s.bookedByMe && type === "Group" && s.groupSpotsLeft > 0 && (
                  <span className="block text-[0.8em] font-normal">{t("{n} places", { n: s.groupSpotsLeft })}</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}

      {error && (
        <p role="alert" className="mt-[0.8em] rounded-[0.6em] bg-[#fdecec] px-[0.8em] py-[0.5em] text-[0.8em] font-semibold text-[#b83232]">
          {error}
        </p>
      )}
      {booked && (
        <p role="status" className="mt-[0.8em] flex items-start gap-[0.5em] rounded-[0.6em] bg-[#e6f6ec] px-[0.8em] py-[0.6em] text-[0.85em] text-[#1b5e36]">
          <CircleCheck className="mt-[0.1em] h-[1.1em] w-[1.1em] shrink-0" />
          <span>
            {booked.type === "OneToOne" ? t("You have a 1:1 session with") : t("You have a group session with")} <b>{booked.mentor.fullName}</b>{" "}
            {t("on")} <b>{sessionTime(booked.startsUtc)}</b>.
          </span>
        </p>
      )}
      <button
        type="button"
        disabled={!time || busy}
        onClick={book}
        className="mt-[1em] flex h-[3em] w-full items-center justify-center gap-[0.5em] rounded-[0.8em] bg-[#14365a] text-[1em] font-semibold text-white hover:bg-[#0f2a47] disabled:opacity-50"
      >
        {busy && <LoaderCircle className="h-[1.1em] w-[1.1em] animate-spin" />}
        {t("Book Session")}
      </button>
    </aside>
  );
}
