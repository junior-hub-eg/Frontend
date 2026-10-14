import Image from "next/image";
import Link from "next/link";

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
