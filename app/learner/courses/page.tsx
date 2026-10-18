import { CourseCatalog } from "@/components/Courses/CourseCatalog";
import { landingFont } from "@/components/Landing/font";

export default function CoursesPage() {
  return (
    <div className={`${landingFont.variable} flex flex-1 flex-col bg-[#F7FBFA] p-6 font-[family-name:var(--font-poppins)] md:p-10`}>
      <CourseCatalog />
    </div>
  );
}
