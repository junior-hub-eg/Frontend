"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { BookOpen, Users } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { getHub } from "@/lib/hub-api";
import { getTrackLessons, getTracks } from "@/lib/learning-api";
import { DailyChallengeCard, LevelCard, NextSessionCard, RewardsButton } from "./dashboard-cards";
import { avatarFor, useSquad } from "./interns-data";
import { TeammatesPanel } from "./teammates-panel";

type Item = {
  src: string;
  w: number;
  h: number;
  left: number;
  top: number;
  width: number;
  z?: string;
};

const IMG = "/images/Intern";
const BG = `${IMG}/bg-park.png`;

const CENTER = 59.7;
const VK = 100 / 1.40625 / 100;

/**
 * The Figma names on two signs differ from the baked-in images ("Mentorship", "Coursers"): a label in the sign's
 * colours covers them. Positions are % of the image.
 */
type Sign = { label: string; icon: typeof Users; left: number; top: number; width: number; height: number };

const BUILDINGS: (Item & {
  label: string;
  href: string;
  z: string;
  sign?: Sign;
})[] = [
  {
    label: "My Progress",
    href: "/learner/interns/progress",
    src: `${IMG}/building-progress.png`,
    w: 559,
    h: 376,
    left: 16.2,
    top: 29,
    width: 40.8,
    z: "z-10",
  },
  {
    label: "Internship",
    href: "/learner/interns/internship",
    src: `${IMG}/building-internship.png`,
    w: 535,
    h: 388,
    left: 63.2,
    top: 29.3,
    width: 37.1,
    z: "z-10",
  },
  {
    label: "My Mentor",
    href: "/learner/mentorship",
    sign: { label: "My Mentor", icon: Users, left: 26.4, top: 21.3, width: 37.8, height: 12 },
    src: `${IMG}/building-mentorship.png`,
    w: 624,
    h: 408,
    left: 14.2,
    top: 59.6,
    width: 43.3,
    z: "z-30",
  },
  {
    label: "Courses",
    href: "/learner/courses",
    sign: { label: "Courses", icon: BookOpen, left: 37.7, top: 20, width: 32, height: 11.1 },
    src: `${IMG}/building-courses.png`,
    w: 626,
    h: 425,
    left: 57.7,
    top: 59.3,
    width: 39.1,
    z: "z-30",
  },
];

const CHARACTERS: Item[] = [
  {
    src: `${IMG}/char-boy-glasses-2.png`,
    w: 278,
    h: 418,
    left: 37.6,
    top: 27.3,
    width: 18.7,
  },
  {
    src: `${IMG}/char-boy-glasses.png`,
    w: 187,
    h: 474,
    left: 48.3,
    top: 23.6,
    width: 12.2,
  },
  {
    src: `${IMG}/char-girl.png`,
    w: 256,
    h: 380,
    left: 53.7,
    top: 29.3,
    width: 17.3,
  },
];


function SignLabel({ sign }: { sign: Sign }) {
  const Icon = sign.icon;
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute flex items-center justify-center gap-[0.35em] rounded-[0.4em] bg-gradient-to-b from-[#004372] to-[#013a66] font-semibold text-white transition-transform duration-200 group-hover:-translate-y-1.5"
      style={{
        left: `${sign.left}%`,
        top: `${sign.top}%`,
        width: `${sign.width}%`,
        height: `${sign.height}%`,
        fontSize: "4.6cqw",
      }}
    >
      <Icon className="h-[1.05em] w-[1.05em] shrink-0" strokeWidth={2} />
      {sign.label}
    </span>
  );
}

function sceneStyle(i: Item): CSSProperties {
  return {
    left: `calc(var(--cx) + var(--c) * ${i.left - CENTER})`,
    top: `calc(var(--c) * ${i.top * VK} - var(--t))`,
    width: `calc(var(--c) * ${i.width})`,
  };
}

const bgStyle: CSSProperties = {
  width: "var(--bgw)",
  height: "var(--bgh)",
  left: "clamp(calc(var(--fw) - var(--bgw)), calc(var(--cx) - var(--c) * 5 - var(--bgw) * 0.547), 0px)",
  top: "clamp(calc(var(--fh) - var(--bgh)), calc(var(--c) * 46.22 - var(--t) - var(--bgh) * 0.65), 0px)",
};

const MOBILE_BG: CSSProperties = {
  width: "200%",
  left: "-59.4%",
  top: "-41.2%",
  aspectRatio: "1440 / 1024",
};

const MOBILE_CHARS: Item[] = [
  {
    src: `${IMG}/char-boy-glasses-2.png`,
    w: 278,
    h: 418,
    left: 15.8,
    top: 10.5,
    width: 37.4,
    z: "z-10",
  },
  {
    src: `${IMG}/char-girl.png`,
    w: 256,
    h: 380,
    left: 48,
    top: 14.3,
    width: 34.6,
    z: "z-10",
  },
  {
    src: `${IMG}/char-boy-glasses.png`,
    w: 187,
    h: 474,
    left: 37.2,
    top: 3.5,
    width: 24.4,
    z: "z-20",
  },
];

function Greeting({
  firstName,
  className = "",
  style,
  scaled = false,
}: {
  firstName: string;
  className?: string;
  style?: CSSProperties;
  scaled?: boolean;
}) {
  return (
    <div className={className} style={style}>
      <h1
        className={`font-extrabold leading-tight text-[#14365a] ${
          scaled
            ? "text-[clamp(1.1rem,calc(var(--u)*2.65),2.6rem)]"
            : "text-3xl sm:text-4xl"
        }`}
      >
        <span className="bg-gradient-to-r from-[#2fb5a6] to-[#2a8fb8] bg-clip-text text-transparent">
          Good morning
        </span>
        , {firstName}
      </h1>

      <p
        className={`font-medium text-[#14365a] ${
          scaled
            ? "text-[clamp(0.7rem,calc(var(--u)*1.2),1.1rem)]"
            : "mt-1 text-sm sm:text-base"
        }`}
      >
        Ready to learn new something today?
      </p>
    </div>
  );
}

/** The track in focus, the student's level in it and the share of its lessons done. */
type TrackFocus = { track: string; level: string; progressPercent: number };

/**
 * From the hub; if the hub fails, from the track in focus and its lessons, so the card still shows the track.
 * Progress is done ÷ all lessons of the track, one decimal, like the hub.
 */
async function loadTrackFocus(): Promise<TrackFocus | null> {
  try {
    const { courses } = await getHub();
    return courses.track && courses.level
      ? { track: courses.track.name, level: courses.level, progressPercent: courses.progressPercent ?? 0 }
      : null;
  } catch {
    const tracks = await getTracks();
    const code = (tracks.find((t) => t.isFocus) ?? tracks.find((t) => t.isLearning))?.code;
    if (!code) return null;
    const track = await getTrackLessons(code);
    const lessons = track.modules.flatMap((m) => m.lessons);
    const done = lessons.filter((l) => l.status === "Done").length;
    return {
      track: track.trackName,
      level: track.level,
      progressPercent: lessons.length ? Math.round((done / lessons.length) * 1000) / 10 : 0,
    };
  }
}

export default function InternDashboard() {
  const { user } = useAuth();
  const squad = useSquad();
  const me = squad?.members.find((m) => m.isMe);
  const firstName = user?.firstName ?? me?.firstName ?? "";
  const teammates = (squad?.members ?? []).map((m, i) => {
    const avatar = avatarFor(m.photoUrl, i);
    return { name: m.fullName, role: m.role, isMe: m.isMe, avatar: avatar.src, bg: avatar.bg };
  });
  const [focus, setFocus] = useState<TrackFocus | null>(null);

  useEffect(() => {
    let active = true;
    loadTrackFocus().then(
      (f) => active && setFocus(f),
      () => {}
    );
    return () => {
      active = false;
    };
  }, []);

  const levelCard = (className?: string) =>
    focus && <LevelCard track={focus.track} level={focus.level} progressPercent={focus.progressPercent} className={className} />;

  return (
    <>
      {/* Mobile and tablet */}
      <div className="pb-8 pl-3 pr-4 sm:pl-4 sm:pr-6 lg:hidden">
        <Greeting firstName={firstName} />
        <div className="mt-4 grid gap-3 text-[14px] sm:grid-cols-2">
          {levelCard()}
          <DailyChallengeCard />
          <NextSessionCard />
        </div>

        <div className="relative mx-auto mt-4 aspect-[4/3] w-full max-w-[720px] overflow-hidden rounded-[28px]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute"
            style={MOBILE_BG}
          >
            <Image
              src={BG}
              alt=""
              fill
              sizes="150vw"
              className="object-cover"
            />
          </div>

          {MOBILE_CHARS.map((c) => (
            <Image
              key={c.src}
              src={c.src}
              alt=""
              aria-hidden="true"
              width={c.w}
              height={c.h}
              sizes="40vw"
              className={`pointer-events-none absolute h-auto drop-shadow-[0_10px_10px_rgba(13,43,90,0.3)] ${c.z}`}
              style={{
                left: `${c.left}%`,
                top: `${c.top}%`,
                width: `${c.width}%`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 mt-5 grid grid-cols-2 gap-3 sm:gap-5">
          {BUILDINGS.map((b) => (
            <Link
              key={b.label}
              href={b.href as Route}
              aria-label={b.label}
              className="group relative z-10 block cursor-pointer rounded-3xl [container-type:inline-size] focus-visible:outline focus-visible:outline-4 focus-visible:outline-[#6b2fd1]"
            >
              <Image
                src={b.src}
                alt={b.label}
                width={b.w}
                height={b.h}
                sizes="(max-width: 1024px) 48vw, 0px"
                className="pointer-events-none h-auto w-full drop-shadow-[0_14px_16px_rgba(13,43,90,0.22)] transition-transform duration-200 group-hover:-translate-y-1"
              />
              {b.sign && <SignLabel sign={b.sign} />}
            </Link>
          ))}
        </div>

        <TeammatesPanel
          teammates={teammates}
          className="mt-5"
        />
        <RewardsButton className="mt-5 flex justify-end text-[14px]" />
      </div>

      {/* Desktop */}
      <div className="absolute inset-0 hidden lg:block">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute transition-[left,top] duration-300"
          style={bgStyle}
        >
          <Image
            src={BG}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>

        <div
          className="absolute z-40 transition-[left] duration-300"
          style={{
            left: "var(--hl)",
            top: "min(calc(var(--fh) * 0.11), calc(var(--c) * 20.62 - var(--t) - var(--u) * 6.6))",
            fontSize: "clamp(9px, calc(var(--u) * 1.05), 16px)",
          }}
        >
          <div className="flex items-start gap-[1.4em]">
            <Greeting firstName={firstName} scaled className="w-fit max-w-[calc(var(--u)*25)]" />
            {levelCard("mt-[0.2em] w-[22em]")}
          </div>
          <DailyChallengeCard className="mt-[1.2em] w-[20em]" />
          <NextSessionCard className="mt-[0.8em] w-[20em]" />
        </div>

        <div
          className="absolute bottom-[calc(var(--u)*1.6)] right-[calc(var(--u)*1.6)] z-40"
          style={{ fontSize: "clamp(9px, calc(var(--u) * 1.05), 16px)" }}
        >
          <RewardsButton />
        </div>

        <TeammatesPanel
          fluid
          teammates={teammates}
          className="absolute right-[calc(var(--u)*1.6)] top-[9.8%] z-40"
        />

        {BUILDINGS.map((b) => (
          <Link
            key={b.label}
            href={b.href as Route}
            aria-label={b.label}
            className={`group absolute ${b.z} block cursor-pointer rounded-3xl transition-[left] duration-300 [container-type:inline-size] focus-visible:outline focus-visible:outline-4 focus-visible:outline-[#6b2fd1]`}
            style={sceneStyle(b)}
          >
            <Image
              src={b.src}
              alt={b.label}
              width={b.w}
              height={b.h}
              sizes="40vw"
              className="pointer-events-none h-auto w-full drop-shadow-[0_18px_22px_rgba(13,43,90,0.25)] transition-transform duration-200 group-hover:-translate-y-1.5"
            />
            {b.sign && <SignLabel sign={b.sign} />}
          </Link>
        ))}

        {CHARACTERS.map((c, i) => (
          <Image
            key={c.src}
            src={c.src}
            alt=""
            aria-hidden="true"
            width={c.w}
            height={c.h}
            priority
            sizes="20vw"
            className={`pointer-events-none absolute z-20 h-auto drop-shadow-[0_10px_10px_rgba(13,43,90,0.3)] transition-[left] duration-300 ${
              i === 1 ? "lg:z-30" : ""
            }`}
            style={sceneStyle(c)}
          />
        ))}
      </div>
    </>
  );
}