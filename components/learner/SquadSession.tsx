"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Poppins } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CircleCheck, Dices, LoaderCircle, UserRound } from "lucide-react";
import { ApiError, errorMessage } from "@/lib/api-client";
import { avatarOrDefault, mentorAvatar } from "@/lib/avatars";
import { getSquad, type Squad, type SquadMember, type SquadRole } from "@/lib/interns-api";
import { useLiveChannel } from "@/lib/live-channel";
import { ROLE_TITLE } from "./interns-data";

const IMG = "/images/Intern";
const DASHBOARD = "/learner/interns/internship";

/** Same font as the learner shell (the portal is outside it). */
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

const glass =
  "rounded-[20px] border border-white/70 bg-gradient-to-r from-[#c8eef8]/75 to-[#a6dfda]/60 shadow-[0_10px_30px_rgba(20,54,90,0.12)] backdrop-blur-md";

/** How long the cube rolls before the project shows, and how long the project shows before the dashboard opens. */
const ROLL_MS = 2600;
const START_IN_SECONDS = 8;
/** Teammates join from their own devices: look again every few seconds when the live channel is not connected. */
const POLL_MS = 5000;

/** The cube rolls once per squad on this device; afterwards the page shows the project straight away. */
const seenKey = (squadId: string) => `jh.cube-rolled.${squadId}`;
function hasSeenRoll(squadId: string) {
  try {
    return window.localStorage.getItem(seenKey(squadId)) === "1";
  } catch {
    return false;
  }
}
function rememberRoll(squadId: string) {
  try {
    window.localStorage.setItem(seenKey(squadId), "1");
  } catch {
    // Private mode: the cube may roll again next time, which is fine.
  }
}

function Avatar({ src, bg, size = "h-[9.5em] w-[9.5em]" }: { src: string; bg?: string; size?: string }) {
  return (
    <span className={`relative shrink-0 overflow-hidden rounded-full ${size}`} style={bg ? { backgroundColor: bg } : undefined}>
      <Image src={src} alt="" fill sizes="170px" className="object-cover" />
    </span>
  );
}

/** One teammate: avatar, name and role. */
function MemberCard({ member, index }: { member: SquadMember; index: number }) {
  const a = avatarOrDefault(member.photoUrl, index);
  return (
    <li className={`${glass} jh-pop-in flex items-center gap-[0.8em] p-[0.6em]`} style={{ animation: "jh-pop-in 0.4s ease-out" }}>
      <Avatar src={a.src} bg={a.bg} size="h-[7.5em] w-[7.5em]" />
      <div className="min-w-0 leading-snug">
        <p className="text-[1.3em] font-bold text-[#14365a]">{member.fullName}</p>
        <p className="mt-[0.3em] text-[0.95em] text-[#14365a]">{ROLE_TITLE[member.role]}</p>
        <p className="mt-[0.2em] flex items-center gap-[0.3em] text-[0.9em] font-bold text-[#1f9d5b]">
          <CircleCheck className="h-[1em] w-[1em]" aria-hidden /> Joined
        </p>
      </div>
    </li>
  );
}

/** A free seat the project still needs. */
function OpenSeatCard({ role }: { role: SquadRole }) {
  return (
    <li className="flex items-center gap-[0.8em] rounded-[20px] border-2 border-dashed border-white/80 bg-white/25 p-[0.6em] backdrop-blur-sm">
      <span className="grid h-[7.5em] w-[7.5em] shrink-0 place-items-center rounded-full bg-white/40 text-[#14365a]/40">
        <UserRound className="h-[3.2em] w-[3.2em]" aria-hidden />
      </span>
      <div className="min-w-0 leading-snug">
        <p className="text-[1.1em] font-bold text-[#14365a]/75">Waiting for a {ROLE_TITLE[role]}</p>
        <p className="mt-[0.3em] text-[0.85em] text-[#14365a]/60">This seat fills when a {ROLE_TITLE[role]} of your level joins.</p>
      </div>
    </li>
  );
}

/** A 3D cube with the dice on every face: it floats while waiting and rolls when the project is picked. */
function Cube({ rolling }: { rolling: boolean }) {
  const faces = ["rotateY(0deg)", "rotateY(90deg)", "rotateY(180deg)", "rotateY(-90deg)", "rotateX(90deg)", "rotateX(-90deg)"];
  return (
    <div className="h-[5.5em] w-[5.5em] [perspective:24em]" aria-hidden>
      <div
        className="jh-cube relative h-full w-full [transform-style:preserve-3d]"
        style={{
          animation: rolling ? `jh-cube-roll ${ROLL_MS}ms cubic-bezier(0.2, 0.7, 0.3, 1) forwards` : "jh-cube-float 4s ease-in-out infinite",
        }}
      >
        {faces.map((f) => (
          <span
            key={f}
            className="absolute inset-0 grid place-items-center rounded-[0.9em] border-2 border-white bg-gradient-to-br from-[#4f9cf0] to-[#14365a] text-white shadow-inner"
            style={{ transform: `${f} translateZ(2.75em)` }}
          >
            <Dices className="h-[2.6em] w-[2.6em]" strokeWidth={1.6} />
          </span>
        ))}
      </div>
    </div>
  );
}

type Phase = "waiting" | "rolling" | "revealed";

/**
 * Figma centre card. While seats are free it shows how many are taken; when the last one is taken the cube rolls by
 * itself, then the squad's project shows and the dashboard opens.
 */
function ProjectCard({
  squad,
  phase,
  startIn,
  className = "",
}: {
  squad: Squad;
  phase: Phase;
  startIn: number | null;
  className?: string;
}) {
  const taken = squad.members.length;
  const total = Math.max(squad.seatsTotal, taken);
  return (
    <section aria-live="polite" className={`${glass} flex min-h-[16em] flex-col items-center justify-center gap-[0.7em] p-[1.2em] text-center ${className}`}>
      {phase !== "revealed" && <Cube rolling={phase === "rolling"} />}
      {phase === "revealed" ? (
        <div className="jh-pop-in flex flex-col items-center gap-[0.5em]" style={{ animation: "jh-pop-in 0.5s ease-out" }}>
          <p className="text-[0.85em] font-bold uppercase tracking-wide text-[#14365a]/70">Your squad&apos;s project</p>
          <h2 className="text-[1.5em] font-extrabold leading-tight text-[#14365a]">{squad.projectTitle}</h2>
          {squad.projectDescription && <p className="line-clamp-5 text-[0.85em] text-[#14365a]/80">{squad.projectDescription}</p>}
          <Link
            href={DASHBOARD}
            className="mt-[0.4em] rounded-[0.8em] bg-[#4f9cf0] px-[1.4em] py-[0.7em] text-[0.95em] font-extrabold tracking-wide text-[#14365a] shadow-[0_6px_18px_rgba(47,127,214,0.45)] hover:bg-[#3d8ce6]"
          >
            START INTERNSHIP
          </Link>
          {startIn !== null && <p className="text-[0.8em] text-[#14365a]/70">Opening your project in {startIn} sec…</p>}
        </div>
      ) : phase === "rolling" ? (
        <p className="text-[1.15em] font-bold text-[#14365a]">Your squad is complete! Rolling your project…</p>
      ) : (
        <>
          <p className="text-[1.15em] font-bold text-[#14365a]">Waiting for your squad</p>
          <p className="text-[0.85em] text-[#14365a]/75">
            {taken} of {total} seats taken. The cube rolls by itself and picks your {squad.level} project when the squad is complete.
          </p>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={taken}
            className="h-[0.55em] w-full max-w-[16em] overflow-hidden rounded-full bg-white/70"
          >
            <div className="h-full rounded-full bg-[#2fa59b] transition-[width] duration-500" style={{ width: `${(taken * 100) / Math.max(total, 1)}%` }} />
          </div>
          {squad.seats.length > 0 && (
            <ul className="mt-[0.2em] flex flex-wrap justify-center gap-[0.35em]">
              {squad.seats.map((s) => (
                <li
                  key={s.role}
                  className={`rounded-full px-[0.6em] py-[0.1em] text-[0.72em] font-bold ${
                    s.filled >= s.needed ? "bg-[#d7f5e4] text-[#1f9d5b]" : "bg-white/70 text-[#14365a]/70"
                  }`}
                >
                  {ROLE_TITLE[s.role]} {s.filled}/{s.needed}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

const noopSubscribe = () => () => {};

/**
 * The squad page (decisions of 22 Oct 2026): the monitor, the student and the teammates who joined, with the free seats.
 * When every seat is taken the cube rolls by itself, reveals the squad's project (the same for everyone) and opens the
 * Internship dashboard.
 */
export default function SquadSession() {
  const router = useRouter();
  // Rendered into <body>: the shell's <main> is its own stacking context, so a fixed layer inside it stays under the sidebar.
  const isClient = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [squad, setSquad] = useState<Squad | null>(null);
  const [noSquad, setNoSquad] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("waiting");
  /** Seconds before the dashboard opens, right after the cube rolled; null when the student came back later. */
  const [startIn, setStartIn] = useState<number | null>(null);
  const phaseRef = useRef<Phase>("waiting");

  /** Takes the latest squad; the first time it is complete, rolls the cube (once per device) and then shows the project. */
  const apply = useCallback((s: Squad) => {
    setSquad(s);
    if (!s.projectRevealed || phaseRef.current !== "waiting") return;
    if (hasSeenRoll(s.id)) {
      phaseRef.current = "revealed";
      setPhase("revealed");
      return;
    }
    phaseRef.current = "rolling";
    setPhase("rolling");
    window.setTimeout(() => {
      rememberRoll(s.id);
      phaseRef.current = "revealed";
      setPhase("revealed");
      setStartIn(START_IN_SECONDS);
    }, ROLL_MS);
  }, []);

  const reload = useCallback(
    () =>
      getSquad().then(apply, (e) => {
        if (e instanceof ApiError && e.code === "NO_SQUAD") setNoSquad(true);
        else setLoadError(errorMessage(e, "We couldn't load your squad. Please try again."));
      }),
    [apply],
  );

  useEffect(() => {
    void reload();
  }, [reload]);

  const waiting = !!squad && !squad.projectRevealed;
  // A teammate joined or the project was revealed: load the squad again.
  const live = useLiveChannel({ SquadUpdated: () => void reload() }, waiting);

  useEffect(() => {
    if (!waiting || live) return;
    const timer = window.setInterval(() => void getSquad().then(apply, () => {}), POLL_MS);
    return () => window.clearInterval(timer);
  }, [waiting, live, apply]);

  // Right after the reveal, count down and open the project's dashboard.
  useEffect(() => {
    if (startIn === null) return;
    if (startIn <= 0) {
      router.push(DASHBOARD);
      return;
    }
    const timer = window.setTimeout(() => setStartIn((n) => (n === null ? n : n - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [startIn, router]);

  const me = squad?.members.find((m) => m.isMe) ?? null;
  const meIndex = squad?.members.findIndex((m) => m.isMe) ?? 0;
  const myAvatar = avatarOrDefault(me?.photoUrl, meIndex);
  // The project's monitor (a mentor picked for the squad), not the student's own mentor.
  const monitor = squad?.monitor ?? null;

  // Teammates who joined, then the seats still free (one card per free seat).
  type Slot = { kind: "member"; member: SquadMember; index: number } | { kind: "open"; role: SquadRole; key: string };
  const slots: Slot[] = [
    ...(squad?.members ?? []).map((m, i) => ({ kind: "member" as const, member: m, index: i })).filter((s) => !s.member.isMe),
    ...(squad && !squad.projectRevealed
      ? squad.seats.flatMap((s) =>
          Array.from({ length: Math.max(0, s.needed - s.filled) }, (_, i) => ({ kind: "open" as const, role: s.role, key: `${s.role}-${i}` })),
        )
      : []),
  ];
  const half = Math.ceil(slots.length / 2);
  const columns = [slots.slice(0, half), slots.slice(half)];

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
            <h1 className="px-[3.5em] text-center text-[2.6em] font-semibold leading-tight text-[#14365a]">
              {squad ? `Meet ${squad.name}` : "Meet Your Squad"}
            </h1>
          </div>

          {loadError && <p className={`${glass} mx-auto mt-[1em] max-w-[47em] p-[1em] text-center text-[#b83232]`}>{loadError}</p>}
          {noSquad && (
            <div className={`${glass} mx-auto mt-[1em] flex max-w-[47em] flex-col items-center gap-[0.6em] p-[1em] text-center text-[0.95em] text-[#14365a]`}>
              <p>You&apos;re not in a squad yet.</p>
              <Link href={DASHBOARD} className="font-bold text-[#12939b] underline">
                Join a squad
              </Link>
            </div>
          )}
          {!squad && !noSquad && !loadError && <LoaderCircle className="mx-auto mt-[4em] h-[2.4em] w-[2.4em] animate-spin text-[#14365a]" />}

          {squad && me && (
            <div className="mx-auto mt-[1.2em] grid max-w-[47em] gap-[1em] md:grid-cols-[15em_1fr]">
              {/* Monitor */}
              <section className={`${glass} flex flex-col items-center p-[1em] text-center md:items-start md:text-left`}>
                <h2 className="text-[1.3em] font-bold text-[#14365a]">Your Monitor</h2>
                {monitor ? (
                  <>
                    <Avatar src={mentorAvatar(monitor).src} bg={mentorAvatar(monitor).bg} size="mt-[0.5em] h-[10em] w-[10em] self-center" />
                    <p className="mt-[0.8em] text-[1.05em] font-bold text-[#14365a]">{monitor.fullName}</p>
                    <p className="text-[0.85em] text-[#14365a]">{monitor.title}</p>
                  </>
                ) : (
                  <p className="mt-[0.8em] text-[0.95em] leading-snug text-[#14365a]/80">Your squad&apos;s monitor will show here.</p>
                )}
              </section>

              {/* You */}
              <section className={`${glass} flex flex-col justify-center p-[1em]`}>
                <h2 className="text-[1.3em] font-bold text-[#14365a]">You</h2>
                <div className="mt-[0.5em] flex items-center gap-[0.8em]">
                  <Avatar src={myAvatar.src} bg={myAvatar.bg} size="h-[8em] w-[8em]" />
                  <div className="min-w-0 leading-snug">
                    <p className="text-[1.35em] font-bold text-[#14365a]">{me.fullName}</p>
                    <p className="mt-[0.3em] text-[0.95em] text-[#14365a]">{ROLE_TITLE[me.role]}</p>
                    <p className="mt-[0.2em] text-[0.95em] font-bold text-[#14365a]">{squad.level} level</p>
                    <p className="mt-[0.2em] flex items-center gap-[0.3em] text-[0.95em] font-bold text-[#1f9d5b]">
                      <CircleCheck className="h-[1.1em] w-[1.1em]" aria-hidden /> In the squad
                    </p>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Squad: teammates and free seats on both sides of the cube (Figma) */}
          {squad && (
            <div className="mx-auto mt-[1em] grid max-w-[64em] items-start gap-[1em] lg:grid-cols-3">
              <ProjectCard squad={squad} phase={phase} startIn={startIn} className="order-first lg:order-2 lg:self-center" />
              {columns.map((column, c) => (
                <ul key={c} className={`grid content-start gap-[1em] ${c === 0 ? "lg:order-1" : "lg:order-3"}`}>
                  {column.map((slot) =>
                    slot.kind === "member" ? (
                      <MemberCard key={slot.member.studentId} member={slot.member} index={slot.index} />
                    ) : (
                      <OpenSeatCard key={slot.key} role={slot.role} />
                    ),
                  )}
                </ul>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
