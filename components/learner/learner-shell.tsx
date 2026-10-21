"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Poppins } from "next/font/google";
import { AlignLeft, Award, Bell, Check, ChevronDown, LoaderCircle, Search, X } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { AVATARS, EMOTIONS, GENDERS, avatarOf, avatarOrDefault, charactersFor, type Avatar, type Gender } from "@/lib/avatars";
import { cn } from "@/lib/utils";
import { LearnerSidebar } from "./learner-sidebar";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

interface LearnerShellProps {
  userName: string;
  userEmail?: string;
  /** The chosen avatar (lib/avatars.ts); a default one when empty. */
  userPhotoUrl?: string | null;
  /** Boy or girl: only that gender's avatars can be picked. Empty for a student from before the question. */
  userGender?: Gender | null;
  /** Saves another catalogue avatar. Without it the menu has no "Change avatar". */
  onChangeAvatar?: (avatarKey: string) => Promise<unknown>;
  /** Saves boy or girl, once, for a student who has none yet. */
  onSetGender?: (gender: Gender) => Promise<unknown>;
  levelLabel?: string;
  trackLabel?: string;
  onLogout?: () => void;
  activeHref?: string;
  /** The student has no track yet: the sidebar links stay locked until Find your track is done. */
  navLocked?: boolean;
  children: ReactNode;
}

export function LearnerShell({
  userName,
  userEmail,
  userPhotoUrl,
  userGender,
  onChangeAvatar,
  onSetGender,
  levelLabel,
  trackLabel,
  onLogout,
  activeHref,
  navLocked = false,
  children,
}: LearnerShellProps) {
  const pathname = usePathname();
  const current = activeHref ?? pathname;
  const [collapsed, setCollapsed] = useState(false); // desktop: icons only
  const [mobileOpen, setMobileOpen] = useState(false); // mobile/tablet: expanded drawer
  const [menuOpen, setMenuOpen] = useState(false);
  const [pickingAvatar, setPickingAvatar] = useState(false);
  const avatar = avatarOrDefault(userPhotoUrl, 0, userGender);

  function toggleSidebar() {
    if (window.matchMedia("(min-width: 1024px)").matches) setCollapsed((c) => !c);
    else setMobileOpen((o) => !o);
  }
  const closeMobile = () => setMobileOpen(false);

  const frameVars = {
    "--fw": "calc(100vw - 1.5rem)",
    "--fh": "calc(100svh - 1.5rem)",
    "--sw": "min(var(--fw), calc(var(--fh) * 1.40625))",
    "--u": "calc(var(--sw) / 100)",
    "--c": "min(calc(var(--fw) / 100), calc((var(--fh) - 90px) / 50.08))",
    "--t": "max(0px, calc(var(--c) * 70.7 - var(--fh) - 90px))",
    "--sb": collapsed ? "calc(var(--u) * 8.3)" : "calc(var(--u) * 19.4)",
    "--cx": "calc((100% + var(--sb)) / 2)",
    // left edge right next to the sidebar (search bar + greeting use this)
    "--hl": "calc(var(--sb) + var(--u) * 2)",
    "--bgw": "max(var(--fw), calc(var(--fh) * 1.40625))",
    "--bgh": "calc(var(--bgw) / 1.40625)",
  } as CSSProperties;

  return (
    <div dir="ltr" className={cn(poppins.className, "min-h-screen bg-[#eaf4fb] lg:h-svh lg:overflow-hidden lg:p-1")}>
      <div
        style={frameVars}
        className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-[#8fd0f5] via-[#bfe4f7] to-[#e6f6fc] lg:h-full lg:min-h-0 lg:rounded-[28px] lg:shadow-[0_24px_70px_rgba(20,54,90,0.22)]"
      >
        {mobileOpen && (
          <button
            type="button"
            aria-label="Close menu"
            onClick={closeMobile}
            className="absolute inset-0 z-20 bg-black/30 lg:hidden"
          />
        )}

        <LearnerSidebar activeHref={current} collapsed={collapsed} mobileOpen={mobileOpen} onNavigate={closeMobile} locked={navLocked} />

        {/* ---------- Top bar ---------- */}
        <header className="relative z-40 flex items-center gap-3 py-4 pl-[4rem] pr-4 lg:absolute lg:left-[var(--hl)] lg:right-[calc(var(--u)*1.6)] lg:top-[3.8%] lg:gap-[1.2em] lg:p-0 lg:transition-[left] lg:duration-300 lg:[font-size:clamp(9px,var(--u),16px)]">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
            className={cn(
              "grid h-[2.7em] w-[2.7em] shrink-0 place-items-center rounded-full backdrop-blur transition-colors",
              collapsed ? "bg-white/70 text-[#14365a] lg:bg-[#14365a] lg:text-white" : "bg-white/70 text-[#14365a]",
            )}
          >
            <AlignLeft className="h-[1.2em] w-[1.2em]" />
          </button>

          <form role="search" onSubmit={(e) => e.preventDefault()} className="relative hidden max-w-[34em] flex-1 sm:block">
            <Search className="pointer-events-none absolute left-[1em] top-1/2 h-[1.1em] w-[1.1em] -translate-y-1/2 text-[#14365a]/60" />
            <input
              type="search"
              placeholder="Search anything...."
              className="h-[2.8em] w-full rounded-full border border-white/70 bg-white/55 pl-[3em] pr-[5em] text-[0.95em] text-[#14365a] outline-none backdrop-blur placeholder:text-[#14365a]/55 focus:ring-2 focus:ring-[#12939b]/40"
            />
            <kbd className="pointer-events-none absolute right-[0.7em] top-1/2 -translate-y-1/2 rounded-full bg-[#4a9df8]/25 px-[0.8em] py-[0.25em] font-sans text-[0.8em] font-semibold text-[#2f7fd6]">
              ⌘K
            </kbd>
          </form>

          <button
            type="button"
            className="flex h-[2.8em] items-center gap-[0.5em] rounded-full border border-white/70 bg-white/55 px-[1em] text-[0.95em] font-medium text-[#14365a] backdrop-blur"
          >
            EN <ChevronDown className="h-[1em] w-[1em]" />
          </button>

          <div className="ml-auto flex items-center gap-[1.2em]">
            <button
              type="button"
              aria-label="Notifications"
              title="Notifications"
              className="grid h-[2.8em] w-[2.8em] place-items-center rounded-full border border-white/70 bg-white/55 text-[#14365a] backdrop-blur"
            >
              <Bell className="h-[1.2em] w-[1.2em]" />
            </button>

            {/* The track in focus and the student's level in it; hidden until the student has a track */}
            {(levelLabel || trackLabel) && (
              <div className="hidden h-[2.8em] items-center gap-[0.6em] rounded-full border border-white/70 bg-white/55 px-[1em] text-[0.95em] font-semibold text-[#14365a] backdrop-blur md:flex">
                <Award className="h-[1.3em] w-[1.3em] text-[#14365a]" />
                {levelLabel && <span>{levelLabel}</span>}
                {trackLabel && <span className="ml-[0.6em] font-bold">{trackLabel}</span>}
              </div>
            )}

            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-expanded={menuOpen}
                className="flex h-[2.8em] items-center gap-[0.7em] rounded-full border border-white/70 bg-white/55 pl-[0.3em] pr-[1em] text-[0.95em] font-medium text-[#14365a] backdrop-blur"
              >
                <span
                  className="relative h-[2.2em] w-[2.2em] shrink-0 overflow-hidden rounded-full ring-2 ring-white"
                  style={{ backgroundColor: avatar.bg }}
                >
                  <Image src={avatar.src} alt={avatar.label} fill sizes="40px" className="object-cover" />
                </span>
                <span className="hidden sm:inline">{userName}</span>
                <ChevronDown className="h-[1em] w-[1em]" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-white/60 bg-white p-1 text-base shadow-lg">
                  {userEmail && <p className="truncate px-3 py-2 text-[11px] text-slate-500">{userEmail}</p>}
                  {onChangeAvatar && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setPickingAvatar(true);
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left text-xs text-[#14365a] hover:bg-slate-100"
                    >
                      Change avatar
                    </button>
                  )}
                  {onLogout && (
                    <button
                      type="button"
                      onClick={onLogout}
                      className="w-full rounded-lg px-3 py-2 text-left text-xs text-[#14365a] hover:bg-slate-100"
                    >
                      Log out
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {pickingAvatar && onChangeAvatar && (
          <AvatarPicker
            current={avatar}
            gender={userGender ?? null}
            onClose={() => setPickingAvatar(false)}
            onChoose={onChangeAvatar}
            onSetGender={onSetGender}
          />
        )}

        {/* ---------- Content: fills the whole frame on desktop ---------- */}
        <main className="relative flex flex-col pl-[4rem] lg:absolute lg:inset-0 lg:z-0 lg:pl-0">{children}</main>
      </div>
    </div>
  );
}

/**
 * Pick a character of your gender, then one of its faces; the chosen avatar is saved on the student's profile.
 * A student with no gender yet (from before the question) answers "boy or girl" first, once.
 */
export function AvatarPicker({
  current,
  gender,
  onClose,
  onChoose,
  onSetGender,
}: {
  current: Avatar;
  gender: Gender | null;
  onClose: () => void;
  onChoose: (avatarKey: string) => Promise<unknown>;
  onSetGender?: (gender: Gender) => Promise<unknown>;
}) {
  const [picked, setPicked] = useState(current.character);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const askGender = gender === null && !!onSetGender;
  const characters = charactersFor(gender);
  const character = characters.some((c) => c.id === picked) ? picked : characters[0].id;
  const faces = AVATARS.filter((a) => a.character === character);

  async function chooseGender(g: Gender) {
    setSaving(g);
    setError(null);
    try {
      await onSetGender!(g);
    } catch (e) {
      setError(errorMessage(e, "We couldn't save that. Please try again."));
    }
    setSaving(null);
  }

  async function choose(key: string) {
    if (key === current.key) return onClose();
    setSaving(key);
    setError(null);
    try {
      await onChoose(key);
      onClose();
    } catch (e) {
      setError(errorMessage(e, "We couldn't save your avatar. Please try again."));
      setSaving(null);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-[#14365a]/40 p-4" role="dialog" aria-modal="true" aria-label="Choose your avatar">
      <div className="flex max-h-[calc(100dvh-2rem)] w-full max-w-xl flex-col rounded-[24px] border border-white bg-white p-6 shadow-2xl">
        <div className="flex items-center">
          <h2 className="text-xl font-bold text-[#14365a]">Choose your avatar</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="ml-auto grid size-9 place-items-center rounded-full hover:bg-slate-100">
            <X className="size-5 text-[#14365a]" />
          </button>
        </div>
        {error && <p role="alert" className="mt-3 rounded-xl bg-[#fdecec] px-3 py-2 text-xs font-semibold text-[#b83232]">{error}</p>}

        {askGender ? (
          <>
            <h3 className="mt-5 text-sm font-semibold text-[#14365a]/80">First, are you a boy or a girl?</h3>
            <p className="mt-1 text-xs text-[#14365a]/60">We only ask once, to show you the right avatars.</p>
            <ul className="mt-4 grid grid-cols-2 gap-4">
              {GENDERS.map((g) => (
                <li key={g.id}>
                  <button
                    type="button"
                    disabled={saving !== null}
                    onClick={() => chooseGender(g.id)}
                    className="flex w-full flex-col items-center gap-2 rounded-2xl border border-[#e3ebf3] p-4 transition-colors hover:border-[#12939b] disabled:opacity-60"
                  >
                    <span className="relative block size-24 overflow-hidden rounded-full" style={{ backgroundColor: g.avatar.bg }}>
                      <Image src={g.avatar.src} alt="" fill sizes="96px" className="object-cover" />
                    </span>
                    <span className="flex items-center gap-1.5 font-semibold text-[#14365a]">
                      {saving === g.id && <LoaderCircle className="size-4 animate-spin" />}
                      {g.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <h3 className="mt-5 text-sm font-semibold text-[#14365a]/80">1. Pick your character</h3>
            <ul className={`mt-3 grid grid-cols-4 gap-3 ${characters.length > 4 ? "sm:grid-cols-8" : "sm:px-10"}`}>
              {characters.map((c) => {
                const face = avatarOf(c.id);
                const selected = c.id === character;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      disabled={saving !== null}
                      onClick={() => setPicked(c.id)}
                      aria-label={c.label}
                      aria-pressed={selected}
                      className={`relative mx-auto block aspect-square w-full max-w-[64px] overflow-hidden rounded-full ring-[3px] transition-transform hover:scale-105 disabled:opacity-60 ${
                        selected ? "ring-[#12939b]" : "ring-transparent"
                      }`}
                      style={{ backgroundColor: c.bg }}
                    >
                      <Image src={face.src} alt="" fill sizes="64px" className="object-cover" />
                    </button>
                  </li>
                );
              })}
            </ul>

            <h3 className="mt-6 text-sm font-semibold text-[#14365a]/80">2. Pick your face</h3>
            <ul className="-mx-1 mt-3 grid grid-cols-4 gap-x-3 gap-y-4 overflow-y-auto px-1 pb-1 pt-1">
              {faces.map((a) => {
                const selected = a.key === current.key;
                const emotion = EMOTIONS.find((e) => e.id === a.emotion)?.label ?? a.emotion;
                return (
                  <li key={a.key}>
                    <button
                      type="button"
                      disabled={saving !== null}
                      onClick={() => choose(a.key)}
                      aria-label={a.label}
                      aria-pressed={selected}
                      className="group flex w-full flex-col items-center gap-1 disabled:opacity-60"
                    >
                      <span
                        className={`relative block aspect-square w-full max-w-[88px] overflow-hidden rounded-full ring-4 transition-transform group-hover:scale-105 ${
                          selected ? "ring-[#12939b]" : "ring-transparent"
                        }`}
                        style={{ backgroundColor: a.bg }}
                      >
                        <Image src={a.src} alt="" fill sizes="88px" className="object-cover" />
                        {(selected || saving === a.key) && (
                          <span className="absolute bottom-1 right-1 grid size-6 place-items-center rounded-full bg-[#12939b] text-white">
                            {saving === a.key ? <LoaderCircle className="size-4 animate-spin" /> : <Check className="size-4" />}
                          </span>
                        )}
                      </span>
                      <span className="text-[11px] font-medium text-[#14365a]/80">{emotion}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
