"use client";

import { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Poppins } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Dices, LoaderCircle, PartyPopper, Users } from "lucide-react";
import { ApiError, errorMessage } from "@/lib/api-client";
import { DEFAULT_AVATARS } from "@/lib/avatars";
import { joinSquad, type LevelProgress } from "@/lib/interns-api";
import { useI18n } from "@/lib/i18n/client";

const IMG = "/images/Intern";
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const noopSubscribe = () => () => {};

const glass =
  "rounded-[20px] border border-white/70 bg-gradient-to-r from-[#c8eef8]/75 to-[#a6dfda]/60 shadow-[0_10px_30px_rgba(20,54,90,0.12)] backdrop-blur-md";

/**
 * First thing a student without a squad sees when opening the Internship: join a squad (teammates from other roles)
 * and get a random project. After joining they go to "Paste Your Links To Get Ready" (/learner/interns/session).
 */
export default function SquadMatchmaking({ level = null }: { level?: LevelProgress | null }) {
  const { t, dir } = useI18n();
  const router = useRouter();
  const isClient = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function join() {
    setJoining(true);
    setError(null);
    try {
      await joinSquad();
      router.push("/learner/interns/session");
    } catch (e) {
      // Already in a squad (for example from another tab): just continue.
      if (e instanceof ApiError && e.code === "ALREADY_IN_SQUAD") return router.push("/learner/interns/session");
      setError(errorMessage(e, "We couldn't find a squad for you right now. Please try again."));
      setJoining(false);
    }
  }

  if (!isClient) return null;

  return createPortal(
    <div dir={dir} className={`${poppins.className} fixed inset-0 z-50 bg-[#bfe4f7]`} style={{ fontSize: "clamp(11px, 1.05vw, 16px)" }}>
      <Image src={`${IMG}/bg-park.png`} alt="" fill priority sizes="100vw" className="pointer-events-none object-cover" />

      <div className="absolute inset-0 overflow-y-auto">
        <div className="relative mx-auto max-w-[72em] px-4 pb-10 pt-6 sm:px-6">
          <div className="relative flex items-center justify-center py-[1em]">
            <Link
              href="/learner/dashboard"
              aria-label={t("Back to the dashboard")}
              className="absolute start-0 grid h-[3em] w-[3em] place-items-center rounded-[0.8em] bg-[#6c86ad]/80 text-white shadow-md hover:bg-[#5a759d]"
            >
              <ArrowLeft className="h-[1.6em] w-[1.6em]" />
            </Link>
            <h1 className="px-[3.5em] text-center text-[2.6em] font-semibold leading-tight text-[#14365a]">{t("Congratulations!")}</h1>
          </div>

          <section className={`${glass} mx-auto mt-[1.5em] flex max-w-[34em] flex-col items-center gap-[1em] p-[2em] text-center`}>
            <ul className="flex -space-x-[0.9em]" aria-hidden>
              {DEFAULT_AVATARS.slice(0, 5).map((a) => (
                <li key={a.key} className="relative h-[4.6em] w-[4.6em] overflow-hidden rounded-full border-[0.2em] border-white" style={{ backgroundColor: a.bg }}>
                  <Image src={a.src} alt="" fill sizes="80px" className="object-cover" />
                </li>
              ))}
            </ul>

            <PartyPopper className="h-[2.6em] w-[2.6em] text-[#f5a623]" aria-hidden />
            <h2 className="text-[1.6em] font-bold text-[#14365a]">
              {level ? t("You finished the {level} level of {track}", { level: t(level.level), track: t(level.trackName) }) : t("You finished your level")}
            </h2>
            <p className="max-w-[26em] text-[1em] leading-relaxed text-[#14365a]/85">
              {t("Now join a squad and build a real project. We'll place you with students of your level from other tracks, with a monitor, and give your squad a random project that fits your level. Then you share your links, get ready, and start.")}
            </p>

            <div className="flex items-center gap-[1.4em] text-[0.9em] font-semibold text-[#14365a]">
              <span className="flex items-center gap-[0.4em]">
                <Users className="h-[1.3em] w-[1.3em]" aria-hidden /> {t("A squad of teammates")}
              </span>
              <span className="flex items-center gap-[0.4em]">
                <Dices className="h-[1.3em] w-[1.3em]" aria-hidden /> {t("A random project")}
              </span>
            </div>

            <button
              type="button"
              onClick={join}
              disabled={joining}
              className="mt-[0.4em] flex h-[3em] items-center gap-[0.6em] rounded-[0.8em] bg-[#4f9cf0] px-[2em] text-[1em] font-extrabold tracking-wide text-[#14365a] shadow-[0_6px_18px_rgba(47,127,214,0.45)] transition-colors hover:bg-[#3d8ce6] disabled:cursor-default disabled:opacity-80"
            >
              {joining ? (
                <>
                  <LoaderCircle className="h-[1.3em] w-[1.3em] animate-spin" aria-hidden /> {t("FINDING YOUR SQUAD…")}
                </>
              ) : (
                t("JOIN A SQUAD")
              )}
            </button>

            {error && (
              <p role="alert" className="text-[0.85em] font-semibold text-[#b83232]">
                {error}
              </p>
            )}
          </section>
        </div>
      </div>
    </div>,
    document.body,
  );
}
