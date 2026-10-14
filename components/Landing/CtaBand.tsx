import Link from "next/link";
import { Curl } from "@/components/Auth/AuthDecorations";

export function CtaBand() {
  return (
    <section className="relative overflow-hidden bg-[#1b2a5c] py-16">
      <Curl className="absolute -left-2 top-4 w-16 rotate-12 opacity-20 [&_path]:stroke-white" aria-hidden />
      <Curl className="absolute -right-2 bottom-2 w-16 -rotate-12 opacity-20 [&_path]:stroke-white" aria-hidden />

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
