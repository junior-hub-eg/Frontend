"use client";

import { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Poppins } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CircleCheck, ClipboardPaste, Link2 } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";

const IMG = "/images/Intern";

/** Same font as the learner shell (the portal is outside it). */
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

/** MOCK squad for the session lobby (Figma "Paste Your Links To Get Ready"). Replace with the squad and mentor APIs. */
const MENTOR = { name: "Mohammed Yasser", title: "UI/UX Designer", seniority: "Senior", avatar: `${IMG}/Circle.png` };
const ME = { name: "Mohammed Yasser", role: "UI/UX Designer", level: 4, avatar: `${IMG}/Static-Characters.png`, bg: "#ffc107" };
const TEAMMATES = [
  { name: "Aisha Khan", role: "Product Manager", level: 5, avatar: `${IMG}/image.png`, bg: "#ffc107" },
  { name: "Aisha Khan", role: "Product Manager", level: 5, avatar: `${IMG}/Image%20copy.png`, bg: "#f6f1d6" },
  { name: "Carlos Mendez", role: "Front-end Developer", level: 3, avatar: `${IMG}/Image%20copy%202.png`, bg: "#2a8a1f" },
  { name: "Carlos Mendez", role: "Front-end Developer", level: 3, avatar: `${IMG}/image%20copy%203.png`, bg: "#c98a5e" },
  { name: "Lina Nguyen", role: "Data Scientist", level: 6, avatar: `${IMG}/Image%20copy%204.png`, bg: "#e0157e" },
  { name: "Lina Nguyen", role: "Data Scientist", level: 6, avatar: `${IMG}/Image%20copy%205.png`, bg: "#fbf59c" },
];

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

const noopSubscribe = () => () => {};

export default function MentorshipLobby() {
  // Rendered into <body>: the shell's <main> is its own stacking context, so a fixed layer inside it stays under the sidebar.
  const isClient = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const { user } = useAuth();
  const myName = user ? [user.firstName, user.lastName].filter(Boolean).join(" ") : ME.name;

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
    <div dir="ltr" className={`${poppins.className} fixed inset-0 z-50 overflow-y-auto`} style={{ fontSize: "clamp(11px, 1.05vw, 16px)" }}>
      <Image src={`${IMG}/bg-park.png`} alt="" fill priority sizes="100vw" className="fixed -z-10 object-cover" />

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
            <Avatar src={MENTOR.avatar} size="mt-[0.5em] h-[10em] w-[10em] self-center" />
            <p className="mt-[0.8em] text-[1.05em] font-bold text-[#14365a]">{MENTOR.name}</p>
            <p className="text-[0.85em] text-[#14365a]">
              <span className="font-bold">{MENTOR.seniority}</span> {MENTOR.title}
            </p>
          </section>

          <section className={`${glass} p-[1em]`}>
            <h2 className="text-[1.3em] font-bold text-[#14365a]">You</h2>
            <div className="mt-[0.5em] flex items-center gap-[0.8em]">
              <Avatar src={ME.avatar} bg={ME.bg} size="h-[10em] w-[10em]" />
              <div className="min-w-0 leading-snug">
                <p className="text-[1.35em] font-bold text-[#14365a]">{myName}</p>
                <p className="mt-[0.4em] text-[0.95em] text-[#14365a]">{ME.role}</p>
                <p className="mt-[0.3em] text-[0.95em] font-bold text-[#14365a]">Level {ME.level}</p>
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
        <ul className="mx-auto mt-[1em] grid max-w-[64em] gap-[1em] md:grid-cols-2">
          {TEAMMATES.map((t, i) => (
            <li key={i} className={`${glass} flex items-center gap-[0.8em] p-[0.6em]`}>
              <Avatar src={t.avatar} bg={t.bg} />
              <div className="min-w-0 leading-snug">
                <p className="text-[1.35em] font-bold text-[#14365a]">{t.name}</p>
                <p className="mt-[0.4em] text-[0.95em] text-[#14365a]">{t.role}</p>
                <p className="mt-[0.3em] text-[0.95em] font-bold text-[#14365a]">Level {t.level}</p>
                <p className="mt-[0.3em] text-[0.95em] font-bold text-[#14365a]">Not Ready</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>,
    document.body,
  );
}
