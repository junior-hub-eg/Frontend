import Image from "next/image";
import Link from "next/link";
import { Brain, PlayCircle, Sparkle, Users } from "lucide-react";
import { Curl } from "@/components/Auth/AuthDecorations";

function FloatingCard({
  icon,
  title,
  subtitle,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  className?: string;
}) {
  return (
    <div
      className={`absolute flex items-center gap-2.5 rounded-xl bg-white px-3.5 py-2.5 shadow-[0_8px_24px_rgba(27,42,92,0.12)] ${className ?? ""}`}
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#E9F7F4] text-[#12939b]">{icon}</span>
      <span className="leading-tight">
        <span className="block text-xs font-semibold text-[#1b2a5c]">{title}</span>
        <span className="block text-[11px] text-[#1b2a5c]/60">{subtitle}</span>
      </span>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#E9F7F4]">
      <Sparkle className="absolute left-[30%] top-10 text-[#12939b]/40" size={22} aria-hidden />
      <Sparkle className="absolute left-[34%] top-20 text-[#12939b]/30" size={14} aria-hidden />
      <Curl className="absolute left-0 top-24 w-10 -scale-x-100 opacity-60" aria-hidden />

      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:px-10 lg:py-24">
        <div>
          <span className="inline-block rounded-full bg-white px-4 py-1.5 text-xs font-semibold tracking-wide text-[#1b2a5c]/70 shadow-sm">
            YOUR FUTURE STARTS HERE
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-[1.1] text-[#1b2a5c] sm:text-5xl">
            Discover Your <span className="text-[#12939b]">Interests</span>.
            <br />
            Build Your <span className="text-[#12939b]">Future</span>.
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[#1b2a5c]/70">
            Explore technology tracks, learn through short videos, connect with mentors, and experience the world of
            internships and recruitment.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/courses"
              className="rounded-full bg-[#12939b] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0f7a81]"
            >
              Explore Courses →
            </Link>
            <button className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ff6fa8] to-[#7c5cfc] px-5 py-3 text-sm font-semibold text-white shadow-md">
              <PlayCircle size={18} /> How It Works
            </button>
          </div>
        </div>

        <div className="relative mx-auto h-[360px] w-full max-w-md lg:h-[440px] lg:max-w-none">
          <Image
            src="/images/Auth/students.png"
            alt="Two Junior Hub students"
            fill
            priority
            sizes="(max-width: 1024px) 80vw, 40vw"
            className="object-contain object-bottom"
          />
          <FloatingCard
            icon={<Brain size={16} />}
            title="AI Assessment"
            subtitle="Personalized path just for you"
            className="left-0 top-4 sm:left-4"
          />
          <FloatingCard
            icon={<Users size={16} />}
            title="Real Projects"
            subtitle="Build with a team"
            className="right-0 top-0 sm:right-2"
          />
          <FloatingCard
            icon={<Users size={16} />}
            title="Mentorship"
            subtitle="Learn From Experts"
            className="right-0 top-1/2 sm:-right-4"
          />
        </div>
      </div>
    </section>
  );
}
