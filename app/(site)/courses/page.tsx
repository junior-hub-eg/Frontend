import { CoursesLanding } from "@/components/Courses/CoursesLanding";
import { landingFont } from "@/components/Landing/font";

/**
 * Public Courses page (the navbar links here). Header and footer come from app/(site)/layout.tsx.
 * Opening a track or lesson goes to /learner/courses/... which requires login (proxy.ts).
 */
export default function CoursesPage() {
  return (
    <div className={`${landingFont.variable} flex flex-1 flex-col bg-white font-[family-name:var(--font-poppins)]`}>
      <CoursesLanding />
    </div>
  );
}
