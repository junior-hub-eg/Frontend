import Image from "next/image";
import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { Curl } from "@/components/Auth/AuthDecorations";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#E9F7F4]">
      <Image
        src="/images/Landing%20Page/Group-3.png"
        alt=""
        width={38}
        height={38}
        className="pointer-events-none absolute left-[32%] top-16 opacity-80"
        aria-hidden
      />
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

        <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
          <Image
            src="/images/Landing%20Page/Group%205.png"
            alt="Two Junior Hub students — AI Assessment, Real Projects, Mentorship"
            width={754}
            height={565}
            priority
            sizes="(max-width: 1024px) 90vw, 45vw"
            className="h-auto w-full"
          />
          <Image
            src="/images/Landing%20Page/Group-2.png"
            alt=""
            width={150}
            height={142}
            className="pointer-events-none absolute -top-10 left-1/3 w-20 opacity-90 sm:w-28"
            aria-hidden
          />
        </div>
      </div>
    </section>
  );
}
