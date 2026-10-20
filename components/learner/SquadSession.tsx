"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Poppins } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CircleCheck, ClipboardPaste, Dices, ExternalLink, Link2, LoaderCircle } from "lucide-react";
import { ApiError, errorMessage } from "@/lib/api-client";
import { avatarOrDefault, mentorAvatar } from "@/lib/avatars";
import { getHub } from "@/lib/hub-api";
import { getSquad, getSquadLinks, saveMyLinks, type SquadLinks, type SquadMemberLinks, type WorkLinkKind } from "@/lib/interns-api";
import { XP_PER_LEVEL } from "./dashboard-cards";
import { ROLE_TITLE } from "./interns-data";

const IMG = "/images/Intern";

/** Same font as the learner shell (the portal is outside it). */
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

const KIND: Record<WorkLinkKind, { label: string; placeholder: string }> = {
  Figma: { label: "Figma", placeholder: "Paste Figma link...." },
  GitHub: { label: "GitHub", placeholder: "Paste GitHub repo link...." },
  LiveSite: { label: "Live site", placeholder: "Paste Vercel / live site link...." },
  Api: { label: "API", placeholder: "Paste server / Swagger link...." },
  Demo: { label: "Demo", placeholder: "Paste demo link...." },
  TestReport: { label: "Test report", placeholder: "Paste test report link...." },
};

const level = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1;

const glass =
  "rounded-[20px] border border-white/70 bg-gradient-to-r from-[#c8eef8]/75 to-[#a6dfda]/60 shadow-[0_10px_30px_rgba(20,54,90,0.12)] backdrop-blur-md";

function Avatar({ src, bg, size = "h-[9.5em] w-[9.5em]" }: { src: string; bg?: string; size?: string }) {
  return (
    <span className={`relative shrink-0 overflow-hidden rounded-full ${size}`} style={bg ? { backgroundColor: bg } : undefined}>
      <Image src={src} alt="" fill sizes="170px" className="object-cover" />
    </span>
  );
}

function memberAvatar(m: SquadMemberLinks, i: number) {
  return avatarOrDefault(m.photoUrl, i + 1);
}

function LinkChips({ member }: { member: SquadMemberLinks }) {
  if (member.links.length === 0) return null;
  return (
    <ul className="mt-[0.4em] flex flex-wrap gap-[0.4em]">
      {member.links.map((l) => (
        <li key={l.kind}>
          <a
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-[0.3em] rounded-full bg-white/70 px-[0.7em] py-[0.2em] text-[0.8em] font-semibold text-[#14365a] hover:bg-white"
          >
            {KIND[l.kind].label} <ExternalLink className="h-[0.9em] w-[0.9em]" />
          </a>
        </li>
      ))}
    </ul>
  );
}

/** One teammate: avatar, role, level, ready state and the links they shared. */
function MemberCard({ member, index }: { member: SquadMemberLinks; index: number }) {
  const a = memberAvatar(member, index);
  return (
    <li className={`${glass} flex items-center gap-[0.8em] p-[0.6em]`}>
      <Avatar src={a.src} bg={a.bg} />
      <div className="min-w-0 leading-snug">
        <p className="text-[1.35em] font-bold text-[#14365a]">{member.fullName}</p>
        <p className="mt-[0.3em] text-[0.95em] text-[#14365a]">{ROLE_TITLE[member.role]}</p>
        <p className="mt-[0.2em] text-[0.95em] font-bold text-[#14365a]">Level {level(member.totalXp)}</p>
        <p className={`mt-[0.2em] text-[0.95em] font-bold ${member.ready ? "text-[#1f9d5b]" : "text-[#14365a]"}`}>{member.ready ? "Ready" : "Not Ready"}</p>
        <LinkChips member={member} />
      </div>
    </li>
  );
}

/**
 * Figma centre card. While the squad is getting ready it shows how many are ready; once everyone is ready it counts
 * down ("Your Project will be Ready in 3 sec..") and then reveals the squad's project with a button to start.
 */
function ProjectCard({
  ready,
  total,
  countdown,
  project,
  className = "",
}: {
  ready: number;
  total: number;
  countdown: number | null;
  project: { title: string; description: string } | null;
  className?: string;
}) {
  return (
    <section aria-live="polite" className={`${glass} flex min-h-[14em] flex-col items-center justify-center gap-[0.6em] p-[1.2em] text-center ${className}`}>
      <Dices className="h-[3.4em] w-[3.4em] text-[#14365a]" strokeWidth={1.6} aria-hidden />
      {project ? (
        <>
          <p className="text-[0.85em] font-bold uppercase tracking-wide text-[#14365a]/70">Your project is ready</p>
          {project.title && <h2 className="text-[1.4em] font-extrabold leading-tight text-[#14365a]">{project.title}</h2>}
          {project.description && <p className="line-clamp-4 text-[0.85em] text-[#14365a]/80">{project.description}</p>}
          <Link
            href="/learner/interns/internship"
            className="mt-[0.4em] rounded-[0.8em] bg-[#4f9cf0] px-[1.4em] py-[0.7em] text-[0.95em] font-extrabold tracking-wide text-[#14365a] shadow-[0_6px_18px_rgba(47,127,214,0.45)] hover:bg-[#3d8ce6]"
          >
            START INTERNSHIP
          </Link>
        </>
      ) : countdown !== null ? (
        <p className="text-[1.15em] font-bold text-[#14365a]">
          Your Project will be Ready in {countdown > 0 ? countdown : "…"} sec..
        </p>
      ) : (
        <>
          <p className="text-[1.15em] font-bold text-[#14365a]">Waiting for your squad</p>
          <p className="text-[0.85em] text-[#14365a]/75">
            {ready} of {total} ready. Paste your links and press READY — your project appears when everyone is ready.
          </p>
        </>
      )}
    </section>
  );
}

const noopSubscribe = () => () => {};

/** Figma "Paste Your Links To Get Ready": the mentor and the squad, each member sharing the links of their role. */
export default function SquadSession() {
  // Rendered into <body>: the shell's <main> is its own stacking context, so a fixed layer inside it stays under the sidebar.
  const isClient = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [squad, setSquad] = useState<SquadLinks | null>(null);
  const [noSquad, setNoSquad] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mentor, setMentor] = useState<{ id: string; fullName: string; title: string } | null | undefined>(undefined);
  const [drafts, setDrafts] = useState<Partial<Record<WorkLinkKind, string>>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** 3, 2, 1, 0 while the project is being "rolled" once the whole squad is ready; null before that. */
  const [countdown, setCountdown] = useState<number | null>(null);
  const [project, setProject] = useState<{ title: string; description: string } | null>(null);

  /** Starts the project countdown the first time every member is ready. */
  function startIfAllReady(s: SquadLinks) {
    if (s.members.length > 0 && s.members.every((m) => m.ready)) setCountdown((c) => (c === null ? 3 : c));
  }

  useEffect(() => {
    let active = true;
    getHub()
      .then((h) => active && setMentor(h.mentorship.mentor))
      .catch(() => active && setMentor(null));
    getSquadLinks()
      .then((s) => {
        if (!active) return;
        setSquad(s);
        startIfAllReady(s);
        const me = s.members.find((m) => m.isMe);
        setDrafts(Object.fromEntries((me?.links ?? []).map((l) => [l.kind, l.url])));
      })
      .catch((e) => {
        if (!active) return;
        if (e instanceof ApiError && e.code === "NO_SQUAD") setNoSquad(true);
        else setLoadError(errorMessage(e, "We couldn't load your squad. Please try again."));
      });
    return () => {
      active = false;
    };
  }, []);

  const me = squad?.members.find((m) => m.isMe) ?? null;
  const others = squad?.members.filter((m) => !m.isMe) ?? [];
  const meIndex = squad?.members.findIndex((m) => m.isMe) ?? 0;
  const myAvatar = avatarOrDefault(me?.photoUrl, meIndex);
  const dirty = me ? me.kinds.some((k) => (drafts[k] ?? "") !== (me.links.find((l) => l.kind === k)?.url ?? "")) : false;

  const hasSquad = squad !== null;
  const allReady = !!squad && squad.members.length > 0 && squad.members.every((m) => m.ready);

  // Teammates paste their links on their own devices: look again every few seconds until everyone is ready.
  useEffect(() => {
    if (!hasSquad || allReady) return;
    const timer = window.setInterval(() => {
      getSquadLinks().then(
        (s) => {
          setSquad(s);
          startIfAllReady(s);
        },
        () => {}
      );
    }, 5000);
    return () => window.clearInterval(timer);
  }, [hasSquad, allReady]);

  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    const timer = window.setTimeout(() => setCountdown((c) => (c === null ? c : c - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  // The countdown is over: the project comes with the squad.
  useEffect(() => {
    if (countdown !== 0 || project) return;
    let active = true;
    getSquad().then(
      (sq) => active && setProject({ title: sq.projectTitle, description: sq.projectDescription }),
      () => active && setProject({ title: "", description: "" })
    );
    return () => {
      active = false;
    };
  }, [countdown, project]);

  const half = Math.ceil(others.length / 2);
  const leftColumn = others.slice(0, half);
  const rightColumn = others.slice(half);

  async function paste(kind: WorkLinkKind) {
    try {
      const text = (await navigator.clipboard.readText()).trim();
      setDrafts((d) => ({ ...d, [kind]: text }));
      setError(null);
    } catch {
      setError("We couldn't read your clipboard. Paste the link with Ctrl+V or ⌘V.");
    }
  }

  async function save() {
    if (!me) return;
    setSaving(true);
    setError(null);
    try {
      const s = await saveMyLinks(me.kinds.map((k) => ({ kind: k, url: (drafts[k] ?? "").trim() })));
      setSquad(s);
      startIfAllReady(s);
    } catch (e) {
      const fields = e instanceof ApiError ? e.problem?.errors : undefined;
      setError(fields ? Object.values(fields).flat()[0] : errorMessage(e, "We couldn't save your links. Please try again."));
    } finally {
      setSaving(false);
    }
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

          {loadError && <p className={`${glass} mx-auto mt-[1em] max-w-[47em] p-[1em] text-center text-[#b83232]`}>{loadError}</p>}
          {noSquad && (
            <p className={`${glass} mx-auto mt-[1em] max-w-[47em] p-[1em] text-center text-[0.95em] text-[#14365a]`}>
              You&apos;re not in a squad yet. Your teammates will show here once you join one.
            </p>
          )}
          {!squad && !noSquad && !loadError && <LoaderCircle className="mx-auto mt-[4em] h-[2.4em] w-[2.4em] animate-spin text-[#14365a]" />}

          {me && (
            <div className="mx-auto mt-[1.2em] grid max-w-[47em] gap-[1em] md:grid-cols-[15em_1fr]">
              {/* Mentor */}
              <section className={`${glass} flex flex-col items-center p-[1em] text-center md:items-start md:text-left`}>
                <h2 className="text-[1.3em] font-bold text-[#14365a]">Your Mentor</h2>
                {mentor ? (
                  <>
                    <Avatar src={mentorAvatar(mentor.id).src} bg={mentorAvatar(mentor.id).bg} size="mt-[0.5em] h-[10em] w-[10em] self-center" />
                    <p className="mt-[0.8em] text-[1.05em] font-bold text-[#14365a]">{mentor.fullName}</p>
                    <p className="text-[0.85em] text-[#14365a]">{mentor.title}</p>
                  </>
                ) : (
                  <p className="mt-[0.8em] text-[0.95em] leading-snug text-[#14365a]/80">
                    {mentor === undefined ? "Loading…" : "You don't have a mentor yet."}{" "}
                    {mentor === null && (
                      <Link href="/learner/mentorship" className="font-bold underline">
                        Choose one
                      </Link>
                    )}
                  </p>
                )}
              </section>

              {/* You */}
              <section className={`${glass} p-[1em]`}>
                <h2 className="text-[1.3em] font-bold text-[#14365a]">You</h2>
                <div className="mt-[0.5em] flex items-center gap-[0.8em]">
                  <Avatar src={myAvatar.src} bg={myAvatar.bg} size="h-[8em] w-[8em]" />
                  <div className="min-w-0 leading-snug">
                    <p className="text-[1.35em] font-bold text-[#14365a]">{me.fullName}</p>
                    <p className="mt-[0.3em] text-[0.95em] text-[#14365a]">{ROLE_TITLE[me.role]}</p>
                    <p className="mt-[0.2em] text-[0.95em] font-bold text-[#14365a]">Level {level(me.totalXp)}</p>
                    {me.ready && (
                      <p className="mt-[0.2em] flex items-center gap-[0.3em] text-[0.95em] font-bold text-[#1f9d5b]">
                        <CircleCheck className="h-[1.1em] w-[1.1em]" /> Ready
                      </p>
                    )}
                  </div>
                </div>

                <form
                  className="mt-[0.8em] flex flex-col gap-[0.5em]"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void save();
                  }}
                >
                  {me.kinds.map((k) => (
                    <label key={k} className="flex min-w-0 items-center gap-[0.6em] rounded-full border border-white/80 bg-white/45 py-[0.4em] pl-[1em] pr-[0.4em]">
                      <Link2 className="h-[1.2em] w-[1.2em] shrink-0 text-[#14365a]" aria-hidden />
                      <input
                        value={drafts[k] ?? ""}
                        onChange={(e) => {
                          setDrafts((d) => ({ ...d, [k]: e.target.value }));
                          setError(null);
                        }}
                        placeholder={KIND[k].placeholder}
                        aria-label={`${KIND[k].label} link`}
                        className="min-w-0 flex-1 bg-transparent text-[0.9em] text-[#14365a] outline-none placeholder:text-[#14365a]/80"
                      />
                      <button
                        type="button"
                        onClick={() => paste(k)}
                        aria-label={`Paste the ${KIND[k].label} link`}
                        className="grid h-[2em] w-[2.4em] shrink-0 place-items-center rounded-full bg-[#4f9cf0]/45 text-[#14365a] hover:bg-[#4f9cf0]/60"
                      >
                        <ClipboardPaste className="h-[1em] w-[1em]" />
                      </button>
                    </label>
                  ))}
                  <button
                    type="submit"
                    disabled={saving || (!dirty && me.ready)}
                    className={`h-[2.7em] self-end rounded-[0.8em] px-[1.4em] text-[0.95em] font-extrabold tracking-wide shadow-[0_6px_18px_rgba(47,127,214,0.45)] transition-colors disabled:cursor-default ${
                      me.ready && !dirty ? "bg-[#2fb36b] text-white" : "bg-[#4f9cf0] text-[#14365a] hover:bg-[#3d8ce6]"
                    }`}
                  >
                    {saving ? "SAVING…" : me.ready && !dirty ? "READY ✓" : "READY"}
                  </button>
                </form>
                {error && (
                  <p role="alert" className="mt-[0.5em] text-[0.8em] font-semibold text-[#b83232]">
                    {error}
                  </p>
                )}
              </section>
            </div>
          )}

          {/* Squad: teammates on both sides of the project card (Figma) */}
          {squad && (
            <div className="mx-auto mt-[1em] grid max-w-[64em] items-start gap-[1em] lg:grid-cols-3">
              <ProjectCard
                ready={squad.members.filter((m) => m.ready).length}
                total={squad.members.length}
                countdown={countdown}
                project={project}
                className="order-first lg:order-2 lg:self-center"
              />
              <ul className="grid content-start gap-[1em] lg:order-1">
                {leftColumn.map((t) => (
                  <MemberCard key={t.studentId} member={t} index={squad.members.indexOf(t)} />
                ))}
              </ul>
              <ul className="grid content-start gap-[1em] lg:order-3">
                {rightColumn.map((t) => (
                  <MemberCard key={t.studentId} member={t} index={squad.members.indexOf(t)} />
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
