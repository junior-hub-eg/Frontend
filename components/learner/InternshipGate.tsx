"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Poppins } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, LoaderCircle, Lock, PartyPopper } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { getInternshipAccess, type InternshipAccess, type LevelProgress } from "@/lib/interns-api";
import InternshipProgress from "./InternshipProgress";
import SquadMatchmaking from "./SquadMatchmaking";

/** LOCAL ONLY (NEXT_PUBLIC_SKIP_AUTH=true): with no backend, show the "Join Your Squad" screen instead of an error. */
const PREVIEW = process.env.NEXT_PUBLIC_SKIP_AUTH === "true" && process.env.NODE_ENV !== "production";

const IMG = "/images/Intern";
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const noopSubscribe = () => () => {};
const glass =
  "rounded-[20px] border border-white/70 bg-gradient-to-r from-[#c8eef8]/75 to-[#a6dfda]/60 shadow-[0_10px_30px_rgba(20,54,90,0.12)] backdrop-blur-md";

/** The Internship before the level is finished (decision of 21 Oct 2026): what is left, and back to the lessons. */
function LockedInternship({ level, lastProject }: { level: LevelProgress | null; lastProject?: InternshipAccess["lastProject"] }) {
  const isClient = useSyncExternalStore(noopSubscribe, () => true, () => false);
  if (!isClient) return null;
  return createPortal(
    <div dir="ltr" className={`${poppins.className} fixed inset-0 z-50 bg-[#bfe4f7]`} style={{ fontSize: "clamp(11px, 1.05vw, 16px)" }}>
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
            <h1 className="px-[3.5em] text-center text-[2.6em] font-semibold leading-tight text-[#14365a]">Internship</h1>
          </div>

          {lastProject && (
            <section className={`${glass} mx-auto mt-[1.5em] flex max-w-[34em] flex-col items-center gap-[0.6em] p-[1.6em] text-center text-[#14365a]`}>
              <PartyPopper className="h-[2.4em] w-[2.4em] text-[#f5a623]" aria-hidden />
              <h2 className="text-[1.4em] font-bold">Your project was approved!</h2>
              <p className="text-[0.95em] text-[#14365a]/85">
                {lastProject.squadName} finished <b>{lastProject.projectTitle}</b>
                {level ? ` and you moved up to the ${level.level} level.` : "."}
              </p>
              {lastProject.feedback && (
                <blockquote className="w-full rounded-[0.9em] bg-white/70 p-[0.9em] text-left text-[0.9em] leading-relaxed">
                  “{lastProject.feedback}”
                  {lastProject.monitorName && <span className="mt-[0.3em] block text-[0.85em] font-semibold">— {lastProject.monitorName}, your monitor</span>}
                </blockquote>
              )}
            </section>
          )}

          <section className={`${glass} mx-auto mt-[1.5em] flex max-w-[34em] flex-col items-center gap-[1em] p-[2em] text-center text-[#14365a]`}>
            <span className="grid h-[4.5em] w-[4.5em] place-items-center rounded-full bg-[#14365a] text-white shadow-lg">
              <Lock className="h-[2em] w-[2em]" />
            </span>
            <h2 className="text-[1.6em] font-bold">
              {level?.basis === "Course" && level.courseTitle
                ? `Finish ${level.courseTitle} to unlock the Internship`
                : "Finish your first course to unlock the Internship"}
            </h2>
            {level ? (
              <>
                <p className="max-w-[26em] text-[1em] leading-relaxed text-[#14365a]/85">
                  {level.basis === "Course"
                    ? `Finish all 3 levels of ${level.courseTitle ?? "your first course"}, the first ${level.trackName} course. Then you join a squad with students from other tracks and build a real project together.`
                    : `Watch a ${level.trackName} video and pass the track quiz. Then you join a squad with students of your level from other tracks and build a real project together.`}
                </p>
                <div className="w-full max-w-[24em]">
                  <div className="flex justify-between text-[0.85em] font-semibold">
                    <span>
                      {level.trackName} · {level.basis === "Course" ? level.courseTitle : level.level}
                    </span>
                    <span>{level.percent}%</span>
                  </div>
                  <div
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={level.percent}
                    className="mt-[0.4em] h-[0.6em] overflow-hidden rounded-full bg-white/70"
                  >
                    <div className="h-full rounded-full bg-[#2fa59b]" style={{ width: `${level.percent}%` }} />
                  </div>
                  {level.basis === "Course" && (
                    <p className="mt-[0.3em] text-[0.8em] text-[#14365a]/70">
                      {level.done} of {level.total} levels done
                    </p>
                  )}
                </div>
                <Link
                  href="/learner/courses"
                  className="mt-[0.4em] rounded-[0.8em] bg-[#4f9cf0] px-[2em] py-[0.8em] text-[1em] font-extrabold tracking-wide text-[#14365a] shadow-[0_6px_18px_rgba(47,127,214,0.45)] hover:bg-[#3d8ce6]"
                >
                  CONTINUE LEARNING
                </Link>
              </>
            ) : (
              <p className="text-[1em] text-[#14365a]/85">Choose a track and finish its first level to join a squad.</p>
            )}
          </section>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/**
 * Entry of the Internship (decision of 21 Oct 2026): locked until the student finishes their level; then a
 * congratulations screen to join a squad (matchmaking, then "Get Ready"); in a squad, the squad's Internship Progress.
 */
export default function InternshipGate() {
  const [access, setAccess] = useState<InternshipAccess | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getInternshipAccess().then(
      (a) => active && setAccess(a),
      (e) =>
        active &&
        (PREVIEW
          ? setAccess({ inSquad: false, open: true, level: null })
          : setError(errorMessage(e, "We couldn't open the Internship. Please try again."))),
    );
    return () => {
      active = false;
    };
  }, []);

  if (error) return <p className="mx-auto mt-[20vh] max-w-md text-center font-semibold text-[#14365a]">{error}</p>;
  if (!access) return <LoaderCircle className="mx-auto mt-[20vh] h-8 w-8 animate-spin text-[#14365a]" aria-label="Loading" />;
  if (access.inSquad) return <InternshipProgress />;
  if (!access.open) return <LockedInternship level={access.level} lastProject={access.lastProject} />;
  return <SquadMatchmaking level={access.level} />;
}
