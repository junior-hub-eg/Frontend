import Image from "next/image";
import Link from "next/link";
import { Curl } from "@/components/Auth/AuthDecorations";
import { Sparkle } from "./LandingDecorations";

export function CtaBand() {
  return (
    <section className="relative overflow-hidden bg-[#1b2a5c] py-16">
      <Image
        src="/images/Landing%20Page/Group%20172.png"
        alt=""
        width={419}
        height={277}
        className="pointer-events-none absolute bottom-0 left-0 w-40 opacity-90 sm:w-56"
        aria-hidden
      />
      <Image
        src="/images/Landing%20Page/Group%20173.png"
        alt=""
        width={450}
        height={277}
        className="pointer-events-none absolute bottom-0 right-0 w-40 opacity-90 sm:w-56"
        aria-hidden
      />

      {/* Small decorations (positions follow the Figma) */}
      <Curl className="pointer-events-none absolute left-[15%] top-[6%] hidden h-20 w-11 md:block" />
      <Curl className="pointer-events-none absolute right-[11%] top-[3%] hidden h-20 w-11 scale-x-[-1] md:block" />
      <Sparkle className="pointer-events-none absolute left-[26%] top-[26%] hidden h-7 w-7 text-[#12939b] md:block" />
      <Sparkle className="pointer-events-none absolute left-[24%] top-[42%] hidden h-5 w-5 text-[#12939b] md:block" />
      <Sparkle className="pointer-events-none absolute bottom-[14%] left-[34%] hidden h-5 w-5 text-[#12939b] md:block" />
      <Sparkle className="pointer-events-none absolute right-[27%] top-[18%] hidden h-6 w-6 text-[#12939b] md:block" />
      <Sparkle className="pointer-events-none absolute bottom-[42%] right-[28%] hidden h-6 w-6 text-[#12939b] md:block" />

      <div className="relative mx-auto max-w-2xl px-6 text-center">
        <h2 className="text-3xl font-bold text-white">Ready to Build Your Future?</h2>
        <p className="mt-3 text-sm text-white/70">
          Join Junior Hub today and start your journey from learning to real opportunities.
        </p>
        <Link
          href="/login"
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#12939b] px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0f7a81]"
        >
          Log in →
        </Link>
      </div>
    </section>
  );
}