import { notFound } from "next/navigation";
import { LandingFooter } from "@/components/Landing/Footer";
import { LandingHeader } from "@/components/Landing/Header";
import { landingFont } from "@/components/Landing/font";
import { BookingFlow } from "@/components/Mentorship/BookingFlow";
import { getMentor } from "@/lib/data/mentors";

export default async function BookMentorPage({ params }: { params: Promise<{ mentorId: string }> }) {
  const { mentorId } = await params;
  const mentor = getMentor(mentorId);
  if (!mentor) notFound();

  return (
    <div className={`${landingFont.variable} flex min-h-full flex-1 flex-col font-[family-name:var(--font-poppins)]`}>
      <LandingHeader activeHref="/monitor" />
      <main className="flex-1 bg-[#F7FBFA]">
        <BookingFlow mentor={mentor} />
      </main>
      <LandingFooter />
    </div>
  );
}
