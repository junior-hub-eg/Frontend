import { CourseCatalog } from "@/components/Courses/CourseCatalog";
import { landingFont } from "@/components/Landing/font";

/**
 * Public Courses page (the navbar links here). Header and footer come from app/(site)/layout.tsx.
 * Opening a track or lesson goes to /learner/courses/... which requires login (proxy.ts).
 */
export default function CoursesPage() {
  return (
    <div className={`${landingFont.variable} flex flex-1 flex-col bg-[#F7FBFA] px-6 py-8 font-[family-name:var(--font-poppins)] md:px-10`}>
      <CourseCatalog />
    </div>
  );
}
