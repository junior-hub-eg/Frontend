import { notFound } from "next/navigation";
import { landingFont } from "@/components/Landing/font";
import { BookingFlow } from "@/components/Mentorship/BookingFlow";
import { getMentor } from "@/lib/data/mentors";

// Header and footer come from app/(site)/layout.tsx — don't add them here.
export default async function BookMentorPage({ params }: { params: Promise<{ mentorId: string }> }) {
  const { mentorId } = await params;
  const mentor = getMentor(mentorId);
  if (!mentor) notFound();

  return (
    <div className={`${landingFont.variable} flex flex-1 flex-col bg-[#F7FBFA] font-[family-name:var(--font-poppins)]`}>
      <BookingFlow mentor={mentor} />
    </div>
  );
}
