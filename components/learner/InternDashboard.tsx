"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { useAuth } from "@/lib/auth/auth-context";
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

const BUILDINGS: (Item & {
  label: string;
  href: string;
  z: string;
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
    label: "Mentorship",
    href: "/learner/mentorship",
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

export default function InternDashboard() {
  const { user } = useAuth();
  const squad = useSquad();
  const me = squad?.members.find((m) => m.isMe);
  const firstName = user?.firstName ?? me?.firstName ?? "";
  const teammates = (squad?.members ?? []).map((m, i) => {
    const avatar = avatarFor(m.photoUrl, i);
    return { name: m.fullName, avatar: avatar.src, bg: avatar.bg };
  });

  return (
    <>
      {/* Mobile and tablet */}
      <div className="pb-8 pl-3 pr-4 sm:pl-4 sm:pr-6 lg:hidden">
        <Greeting firstName={firstName} />

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
              className="group relative z-10 block cursor-pointer rounded-3xl focus-visible:outline focus-visible:outline-4 focus-visible:outline-[#6b2fd1]"
            >
              <Image
                src={b.src}
                alt={b.label}
                width={b.w}
                height={b.h}
                sizes="(max-width: 1024px) 48vw, 0px"
                className="pointer-events-none h-auto w-full drop-shadow-[0_14px_16px_rgba(13,43,90,0.22)] transition-transform duration-200 group-hover:-translate-y-1"
              />
            </Link>
          ))}
        </div>

        <TeammatesPanel
          teammates={teammates}
          className="mt-5"
        />
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

        <Greeting
          firstName={firstName}
          scaled
          className="absolute z-40 max-w-[calc(var(--u)*50)] transition-[left] duration-300"
          style={{
            left: "var(--hl)",
            top: "min(calc(var(--fh) * 0.11), calc(var(--c) * 20.62 - var(--t) - var(--u) * 6.6))",
          }}
        />

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
            className={`group absolute ${b.z} block cursor-pointer rounded-3xl transition-[left] duration-300 focus-visible:outline focus-visible:outline-4 focus-visible:outline-[#6b2fd1]`}
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