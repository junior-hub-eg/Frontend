"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Poppins } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CircleCheck, ClipboardPaste, Link2, LoaderCircle, Star, X } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { useAuth } from "@/lib/auth/auth-context";
import { getSquad } from "@/lib/interns-api";
import { getHub } from "@/lib/hub-api";
import { chooseMentor, getMentors, type Mentor } from "@/lib/mentorship-api";
import { ROLE_TITLE } from "./interns-data";

const IMG = "/images/Intern";

/** Same font as the learner shell (the portal is outside it). */
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

type Person = { name: string; role?: string; avatar: string; bg: string };

/** The Figma avatars, given to the student and teammates in order (no photos yet). */
const MENTOR_AVATAR = `${IMG}/Circle.png`;
const ME_AVATAR = { avatar: `${IMG}/Static-Characters.png`, bg: "#ffc107" };
const AVATARS = [
  { avatar: `${IMG}/image.png`, bg: "#ffc107" },
  { avatar: `${IMG}/Image%20copy.png`, bg: "#f6f1d6" },
  { avatar: `${IMG}/Image%20copy%202.png`, bg: "#2a8a1f" },
  { avatar: `${IMG}/image%20copy%203.png`, bg: "#c98a5e" },
  { avatar: `${IMG}/Image%20copy%204.png`, bg: "#e0157e" },
  { avatar: `${IMG}/Image%20copy%205.png`, bg: "#fbf59c" },
];

/** "Senior Frontend Engineer" -> seniority "Senior" (bold in the Figma) and the rest. */
function splitTitle(title: string) {
  const [first, ...rest] = title.split(" ");
  return /^(Senior|Lead|Principal|Staff|Junior)$/.test(first) ? { seniority: first, title: rest.join(" ") } : { seniority: "", title };
}

type Lobby = {
  mentor: { name: string; seniority: string; title: string } | null;
  me: { name: string; role?: string } | null;
  teammates: Person[];
};

/** The student's mentor (hub) and squad (interns API). Nothing is made up: missing parts stay empty. */
async function loadLobby(): Promise<Lobby> {
  const [hub, squad] = await Promise.all([getHub().catch(() => null), getSquad().catch(() => null)]);
  const mentor = hub?.mentorship.mentor;
  const me = squad?.members.find((m) => m.isMe);
  return {
    mentor: mentor ? { name: mentor.fullName, ...splitTitle(mentor.title) } : null,
    me: me ? { name: me.fullName, role: ROLE_TITLE[me.role] } : null,
    teammates: (squad?.members ?? [])
      .filter((m) => !m.isMe)
      .map((m, i) => ({ ...AVATARS[i % AVATARS.length], name: m.fullName, role: ROLE_TITLE[m.role] })),
  };
}

const glass =
  "rounded-[20px] border border-white/70 bg-gradient-to-r from-[#c8eef8]/75 to-[#a6dfda]/60 shadow-[0_10px_30px_rgba(20,54,90,0.12)] backdrop-blur-md";

/** A Figma file, prototype or design link. */
function isFigmaLink(value: string) {
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" && (url.hostname === "figma.com" || url.hostname.endsWith(".figma.com"));
  } catch {
    return false;
  }
}

function Avatar({ src, bg, size = "h-[9.5em] w-[9.5em]" }: { src: string; bg?: string; size?: string }) {
  return (
    <span className={`relative shrink-0 overflow-hidden rounded-full ${size}`} style={bg ? { backgroundColor: bg } : undefined}>
      <Image src={src} alt="" fill sizes="170px" className="object-cover" />
    </span>
  );
}

/** The mentors to choose from (GET /mentors, the track in focus by default), each with Choose. */
function MentorPicker({
  currentName,
  onClose,
  onChosen,
}: {
  currentName: string | null;
  onClose: () => void;
  onChosen: (mentor: Mentor) => void;
}) {
  const [mentors, setMentors] = useState<Mentor[] | null>(null);
  const [all, setAll] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getMentors({ all })
      .then((m) => active && setMentors(m))
      .catch((e) => active && setError(errorMessage(e, "We couldn't load the mentors. Please try again later.")));
    return () => {
      active = false;
    };
  }, [all]);

  async function choose(mentor: Mentor) {
    setSaving(mentor.id);
    setError(null);
    try {
      await chooseMentor(mentor.id);
      onChosen(mentor);
    } catch (e) {
      setError(errorMessage(e, "We couldn't save your mentor. Please try again."));
      setSaving(null);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-[#14365a]/40 p-4" role="dialog" aria-modal="true" aria-label="Choose your mentor">
      <div className={`${glass} max-h-[85vh] w-full max-w-[52em] overflow-y-auto bg-white/90 p-[1.2em]`}>
        <div className="flex items-center gap-[0.8em]">
          <h2 className="text-[1.5em] font-bold text-[#14365a]">Choose your mentor</h2>
          <label className="ml-auto flex items-center gap-[0.4em] text-[0.85em] text-[#14365a]">
            <input type="checkbox" checked={all} onChange={(e) => setAll(e.target.checked)} className="accent-[#12939b]" />
            Show all tracks
          </label>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-[2.2em] w-[2.2em] place-items-center rounded-full hover:bg-[#14365a]/10">
            <X className="h-[1.2em] w-[1.2em] text-[#14365a]" />
          </button>
        </div>

        {error && <p role="alert" className="mt-[0.8em] rounded-[0.8em] bg-[#fdecec] px-[1em] py-[0.5em] text-[0.85em] font-semibold text-[#b83232]">{error}</p>}
        {!mentors && !error && <LoaderCircle className="mx-auto mt-[2em] h-[2em] w-[2em] animate-spin text-[#12939b]" aria-label="Loading" />}
        {mentors?.length === 0 && <p className="mt-[1em] text-[0.9em] text-[#14365a]/70">No mentors for your track yet. Try “Show all tracks”.</p>}

        <ul className="mt-[1em] grid gap-[0.8em] sm:grid-cols-2">
          {mentors?.map((m) => {
            const current = m.isMyMentor || m.fullName === currentName;
            return (
              <li key={m.id} className="flex flex-col rounded-[1.2em] border border-white bg-white p-[1em] shadow-[0_6px_18px_rgba(20,54,90,0.08)]">
                <div className="flex items-center gap-[0.8em]">
                  <Avatar src={MENTOR_AVATAR} size="h-[4em] w-[4em]" />
                  <div className="min-w-0">
                    <p className="text-[1.05em] font-bold text-[#14365a]">{m.fullName}</p>
                    <p className="text-[0.8em] text-[#14365a]/75">{m.title}</p>
                    <p className="mt-[0.2em] flex items-center gap-[0.3em] text-[0.75em] text-[#14365a]/70">
                      <Star className="h-[1em] w-[1em] fill-[#f5a623] text-[#f5a623]" /> {m.rating.toFixed(1)} · {m.yearsOfExperience} yrs · {m.trackCode}
                    </p>
                  </div>
                </div>
                <p className="mt-[0.6em] line-clamp-2 text-[0.8em] leading-snug text-[#14365a]/75">{m.bio}</p>
                <button
                  type="button"
                  disabled={current || saving !== null}
                  onClick={() => choose(m)}
                  className={`mt-[0.8em] h-[2.6em] rounded-[0.8em] text-[0.9em] font-extrabold tracking-wide transition-colors disabled:cursor-default ${
                    current ? "bg-[#2fb36b]/15 text-[#1f9d5b]" : "bg-[#4f9cf0] text-[#14365a] hover:bg-[#3d8ce6] disabled:opacity-60"
                  }`}
                >
                  {current ? "Your mentor" : saving === m.id ? "Saving…" : "Choose"}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

const noopSubscribe = () => () => {};

export default function MentorshipLobby() {
  // Rendered into <body>: the shell's <main> is its own stacking context, so a fixed layer inside it stays under the sidebar.
  const isClient = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const { user } = useAuth();
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [picking, setPicking] = useState(false);
  useEffect(() => {
    let active = true;
    loadLobby().then((l) => active && setLobby(l));
    return () => {
      active = false;
    };
  }, []);
  const mentor = lobby?.mentor ?? null;
  const teammates = lobby?.teammates ?? [];
  const myName = lobby?.me?.name ?? (user ? [user.firstName, user.lastName].filter(Boolean).join(" ") : "");
  const myRole = lobby?.me?.role;

  const [link, setLink] = useState("");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function paste() {
    try {
      const text = await navigator.clipboard.readText();
      setLink(text.trim());
      setError(null);
    } catch {
      setError("We couldn't read your clipboard. Paste the link with Ctrl+V or ⌘V.");
    }
  }

  function markReady() {
    if (!isFigmaLink(link)) {
      setError("Paste a Figma link (https://www.figma.com/...) first.");
      return;
    }
    // TODO(backend): save the link for the session and tell the squad (no endpoint yet).
    setError(null);
    setReady(true);
  }

  if (!isClient) return null;

  return createPortal(
    // Full screen over the learner shell, like the Figma (no sidebar or top bar on this page).
    <div dir="ltr" className={`${poppins.className} fixed inset-0 z-50 bg-[#bfe4f7]`} style={{ fontSize: "clamp(11px, 1.05vw, 16px)" }}>
      {/* The park stays put behind the whole page; only the content layer scrolls */}
      <Image src={`${IMG}/bg-park.png`} alt="" fill priority sizes="100vw" className="pointer-events-none object-cover" />

      <div className="absolute inset-0 overflow-y-auto">
        <div className="relative mx-auto max-w-[72em] px-4 pb-10 pt-6 sm:px-6">
          <div className="relative flex items-center justify-center py-[1em]">
            <Link
              href="/learner/dashboard"
              aria-label="Back to the dashboard"
              className="absolute left-0 grid h-[3em] w-[3em] place-items-center rounded-[0.8em] bg-[#6c86ad]/80 text-white shadow-md hover:bg-[#5a759d]"
            >
              <ArrowLeft className="h-[1.6em] w-[1.6em]" />
            </Link>
            <h1 className="px-[3.5em] text-center text-[2.6em] font-semibold leading-tight text-[#14365a]">Paste Your Links To Get Ready</h1>
          </div>

          {/* Mentor and you */}
          <div className="mx-auto mt-[1.2em] grid max-w-[47em] gap-[1em] md:grid-cols-[15em_1fr]">
            <section className={`${glass} flex flex-col items-center p-[1em] text-center md:items-start md:text-left`}>
              <h2 className="text-[1.3em] font-bold text-[#14365a]">Your Mentor</h2>
              {mentor ? (
                <>
                  <Avatar src={MENTOR_AVATAR} size="mt-[0.5em] h-[10em] w-[10em] self-center" />
                  <p className="mt-[0.8em] text-[1.05em] font-bold text-[#14365a]">{mentor.name}</p>
                  <p className="text-[0.85em] text-[#14365a]">
                    {mentor.seniority && <span className="font-bold">{mentor.seniority} </span>}
                    {mentor.title}
                  </p>
                </>
              ) : (
                <p className="mt-[0.8em] flex-1 text-[0.95em] leading-snug text-[#14365a]/80">
                  {lobby ? "You haven't chosen a mentor yet." : "Loading…"}
                </p>
              )}
              <button
                type="button"
                onClick={() => setPicking(true)}
                disabled={!lobby}
                className="mt-[0.8em] h-[2.5em] w-full rounded-[0.8em] bg-[#4f9cf0] text-[0.9em] font-extrabold tracking-wide text-[#14365a] shadow-[0_6px_18px_rgba(47,127,214,0.35)] hover:bg-[#3d8ce6] disabled:opacity-60"
              >
                {mentor ? "Change" : "Choose"}
              </button>
            </section>

            <section className={`${glass} p-[1em]`}>
              <h2 className="text-[1.3em] font-bold text-[#14365a]">You</h2>
              <div className="mt-[0.5em] flex items-center gap-[0.8em]">
                <Avatar src={ME_AVATAR.avatar} bg={ME_AVATAR.bg} size="h-[10em] w-[10em]" />
                <div className="min-w-0 leading-snug">
                  <p className="text-[1.35em] font-bold text-[#14365a]">{myName}</p>
                  {myRole && <p className="mt-[0.4em] text-[0.95em] text-[#14365a]">{myRole}</p>}
                  {ready && (
                    <p className="mt-[0.3em] flex items-center gap-[0.3em] text-[0.95em] font-bold text-[#1f9d5b]">
                      <CircleCheck className="h-[1.1em] w-[1.1em]" /> Ready
                    </p>
                  )}
                </div>
              </div>

              <form
                className="mt-[0.8em] flex items-center gap-[0.6em]"
                onSubmit={(e) => {
                  e.preventDefault();
                  markReady();
                }}
              >
                <label className="flex min-w-0 flex-1 items-center gap-[0.6em] rounded-full border border-white/80 bg-white/45 py-[0.4em] pl-[1em] pr-[0.4em]">
                  <Link2 className="h-[1.2em] w-[1.2em] shrink-0 text-[#14365a]" aria-hidden />
                  <input
                    value={link}
                    onChange={(e) => {
                      setLink(e.target.value);
                      setReady(false);
                      setError(null);
                    }}
                    placeholder="Paste Figma Link...."
                    aria-label="Figma link"
                    className="min-w-0 flex-1 bg-transparent text-[0.9em] text-[#14365a] outline-none placeholder:text-[#14365a]/80"
                  />
                  <button
                    type="button"
                    onClick={paste}
                    aria-label="Paste from clipboard"
                    className="grid h-[2em] w-[2.4em] shrink-0 place-items-center rounded-full bg-[#4f9cf0]/45 text-[#14365a] hover:bg-[#4f9cf0]/60"
                  >
                    <ClipboardPaste className="h-[1em] w-[1em]" />
                  </button>
                </label>
                <button
                  type="submit"
                  className={`h-[2.7em] shrink-0 rounded-[0.8em] px-[1.2em] text-[0.95em] font-extrabold tracking-wide shadow-[0_6px_18px_rgba(47,127,214,0.45)] transition-colors ${
                    ready ? "bg-[#2fb36b] text-white" : "bg-[#4f9cf0] text-[#14365a] hover:bg-[#3d8ce6]"
                  }`}
                >
                  {ready ? "READY ✓" : "READY"}
                </button>
              </form>
              {error && (
                <p role="alert" className="mt-[0.5em] text-[0.8em] font-semibold text-[#b83232]">
                  {error}
                </p>
              )}
            </section>
          </div>

          {/* Squad */}
          {lobby && teammates.length === 0 && (
            <p className={`${glass} mx-auto mt-[1em] max-w-[47em] p-[1em] text-center text-[0.95em] text-[#14365a]`}>
              You&apos;re not in a squad yet. Your teammates will show here once you join one.
            </p>
          )}
          <ul className="mx-auto mt-[1em] grid max-w-[64em] gap-[1em] md:grid-cols-2">
            {teammates.map((t, i) => (
              <li key={i} className={`${glass} flex items-center gap-[0.8em] p-[0.6em]`}>
                <Avatar src={t.avatar} bg={t.bg} />
                <div className="min-w-0 leading-snug">
                  <p className="text-[1.35em] font-bold text-[#14365a]">{t.name}</p>
                  <p className="mt-[0.4em] text-[0.95em] text-[#14365a]">{t.role}</p>
                  <p className="mt-[0.3em] text-[0.95em] font-bold text-[#14365a]">Not Ready</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {picking && (
        <MentorPicker
          currentName={mentor?.name ?? null}
          onClose={() => setPicking(false)}
          onChosen={(m) => {
            setPicking(false);
            setLobby((l) => (l ? { ...l, mentor: { name: m.fullName, ...splitTitle(m.title) } } : l));
          }}
        />
      )}
    </div>,
    document.body,
  );
}
