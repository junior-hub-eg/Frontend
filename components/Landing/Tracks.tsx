import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TRACK_COLORS } from "./colors";

const TRACKS = [
  {
    title: "UI/UX Design",
    subtitle: "Design Digital Experience",
    icon: "/images/Landing%20Page/Group.png",
    colors: TRACK_COLORS.mint,
  },
  {
    title: "Frontend",
    subtitle: "Web Development",
    icon: "/images/Landing%20Page/emojione-v1_laptop-computer.png",
    colors: TRACK_COLORS.blue,
  },
  {
    title: "Mobile Development",
    subtitle: "Create Mobile Apps",
    icon: "/images/Landing%20Page/Vector.png",
    colors: TRACK_COLORS.tan,
  },
  {
    title: "Data Science",
    subtitle: "& Data analysis",
    icon: "/images/Landing%20Page/fluent_data-histogram-16-filled.png",
    colors: TRACK_COLORS.rose,
  },
  {
    title: "AI",
    subtitle: "Explore Intelligent systems",
    icon: "/images/Landing%20Page/Group%20copy.png",
    colors: TRACK_COLORS.purple,
  },
  {
    title: "Backend",
    subtitle: "Development",
    icon: "/images/Landing%20Page/at-icons_server.png",
    colors: TRACK_COLORS.teal,
  },
];

export function Tracks() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wide text-[#12939b]">EXPLORE YOUR INTERESTS</p>
          <h2 className="mt-2 text-3xl font-bold text-[#1b2a5c]">Learning Tracks</h2>
          <p className="mt-2 max-w-md text-sm text-[#1b2a5c]/60">
            Choose a track and start building real skills with hands-on content, mentorship, and projects.
          </p>
        </div>
        <Link href="/courses" className="flex items-center gap-1 text-sm font-semibold text-[#12939b] hover:underline">
          View All Tracks <ArrowRight size={14} />
        </Link>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
        {TRACKS.map(({ title, subtitle, icon, colors }) => (
          <div key={title} className="flex flex-col gap-4 rounded-2xl p-5" style={{ backgroundColor: colors.bg }}>
            <span className="grid size-10 place-items-center rounded-xl bg-white p-2">
              <Image src={icon} alt="" width={28} height={28} className="h-auto w-full object-contain" />
            </span>
            <div>
              <p className="text-sm font-semibold text-[#1b2a5c]">{title}</p>
              <p className="text-xs text-[#1b2a5c]/60">{subtitle}</p>
            </div>
            <button
              className="mt-2 grid size-7 place-items-center self-start rounded-full border border-[#1b2a5c]/15 text-[#1b2a5c] transition-colors hover:bg-white"
              aria-label={`Explore ${title}`}
            >
              <ArrowRight size={13} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
