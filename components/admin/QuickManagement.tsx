import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { ArrowRight, ClipboardCheck, UsersRound } from "lucide-react";

const QM_IMG = "/images/admin/quick-management.png";
const PR_IMG = "/images/admin/pending reviews.png";

const QUICK = [
  {
    icon: UsersRound,
    title: "Squads",
    desc: "Review team progress, assign mentors, and monitor sprint updates",
    cta: "Manage Now",
    href: "/admin/squads",
    img: QM_IMG,
    imgLeft: "30%",
    bg: "linear-gradient(100deg,#eaf6f4 0%,#d9efec 42%,#1d6b73 72%,#17375a 100%)",
  },
  {
    icon: ClipboardCheck,
    title: "Pending Reviews",
    desc: "Approve new student registrations and squad submissions.",
    cta: "Explore",
    href: "/admin/reviews",
    img: PR_IMG,
    imgLeft: "33%",
    bg: "linear-gradient(100deg,#eef6fa 0%,#dcecf3 40%,#1b6670 72%,#17375a 100%)",
  },
];

export function QuickManagement() {
  return (
    <section className="mb-[1.2em] mt-[1.1em] rounded-[1.3em] bg-white p-[1em] pt-[0.9em] shadow-[0_6px_22px_rgba(20,54,90,0.07)]">
      <h2 className="text-[0.9em] font-bold text-[#0b1b2b]">Quick Management</h2>
      <div className="mt-[0.6em] grid gap-[1.6em] xl:grid-cols-2 xl:gap-[1em]">
        {QUICK.map((q) => (
          <article
            key={q.title}
            className="relative mt-[1.2em] h-[10.5em] min-w-0 sm:h-[8em] xl:mt-0 xl:h-[7.4em]"
            style={{ ["--l" as string]: q.imgLeft }}
          >
            <div aria-hidden className="absolute inset-0 rounded-[1em]" style={{ background: q.bg }} />

            {/* Picture: bigger than the card, pops out of the top */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-[16%] bottom-0 left-[58%] w-[40%] sm:left-[var(--l)] sm:w-[36%]"
            >
              <Image
                src={q.img}
                alt=""
                fill
                sizes="(max-width: 640px) 40vw, 20vw"
                className="object-contain object-bottom"
              />
            </div>

            <div className="relative z-10 flex h-full max-w-[58%] flex-col justify-center pl-[1.1em] sm:max-w-[34%]">
              <p className="flex items-center gap-[0.45em] text-[0.85em] font-bold text-[#0b1b2b] sm:text-[0.8em]">
                <q.icon className="size-[1.15em] shrink-0 text-[#0f7378]" /> {q.title}
              </p>
              <p className="mt-[0.35em] text-[0.7em] leading-snug text-[#14365a]/80 sm:text-[0.62em]">{q.desc}</p>
              <Link
                href={q.href as Route}
                className="mt-[0.6em] inline-flex w-fit items-center gap-[0.5em] rounded-full bg-gradient-to-r from-[#0f5f6a] to-[#14365a] px-[1.1em] py-[0.35em] text-[0.7em] font-semibold text-white shadow-md hover:opacity-90 sm:text-[0.62em]"
              >
                {q.cta} <ArrowRight className="size-[1.1em]" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}