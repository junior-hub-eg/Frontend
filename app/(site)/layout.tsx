import type { ReactNode } from "react";
import { LandingFooter } from "@/components/Landing/Footer";
import { LandingHeader } from "@/components/Landing/Header";
import { landingFont } from "@/components/Landing/font";

/**
 * The public site (home, courses, monitor, interns, recruitment, about, policies): one nav bar, one footer and the
 * Poppins font for every page, so the header looks and sits the same everywhere. The header stays at the top while
 * scrolling. Auth pages and the learner area have their own layouts.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${landingFont.variable} flex min-h-full flex-1 flex-col font-[family-name:var(--font-poppins)]`}>
      <LandingHeader />
      <main className="flex flex-1 flex-col">{children}</main>
      <LandingFooter />
    </div>
  );
}
