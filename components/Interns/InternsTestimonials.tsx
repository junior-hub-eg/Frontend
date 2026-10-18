import Image from "next/image";
import { Star } from "lucide-react";

interface TestimonialItem {
  name: string;
  role: string;
  avatar: string;
  quote: string;
  rotationClass: string;
}

const TESTIMONIALS: TestimonialItem[] = [
  {
    name: "Alex P.",
    role: "Frontend Intern",
    avatar: "/images/Intern/char-boy-glasses.png",
    quote:
      "The internship changed my career path! The hands-on experience with real projects, which makes learning practical and engaging!",
    rotationClass: "lg:-rotate-3 hover:rotate-0",
  },
  {
    name: "Imani M.",
    role: "Software Engineering Intern",
    avatar: "/images/Intern/char-girl.png",
    quote:
      "I appreciated the mentorship from senior engineers. Their guidance helped our team grow both technically and professionally.",
    rotationClass: "lg:scale-105 hover:scale-110",
  },
  {
    name: "Priya R.",
    role: "DevOps Intern",
    avatar: "/images/Intern/char-boy-glasses-2.png",
    quote:
      "The team was welcoming and inclusive. The weekly syncs and code reviews were a great learning experience. Highly recommend taking this!",
    rotationClass: "lg:rotate-3 hover:rotate-0",
  },
];

export function InternsTestimonials() {
  return (
    <section className="overflow-hidden bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {/* Header */}
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-[#12939b]">
            TESTIMONIALS & REVIEWS
          </span>
          <h2 className="mt-2 text-3xl font-extrabold text-[#1b2a5c] sm:text-4xl">
            What Our Interns Say
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-xs leading-relaxed text-[#1b2a5c]/65 sm:text-sm">
            Real stories from learners who started their journey with us and achieved real results.
            Read their experiences and start your own journey.
          </p>
        </div>

        {/* 3 Angled / Tilted Cards Layout */}
        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-6">
          {TESTIMONIALS.map(({ name, role, avatar, quote, rotationClass }) => (
            <div
              key={name}
              className={`flex flex-col justify-between rounded-[24px] border border-black/8 bg-white p-6 shadow-md transition-all duration-300 ${rotationClass}`}
            >
              <div>
                {/* 5 Yellow Stars */}
                <div className="flex gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>

                {/* Quote */}
                <p className="mt-4 text-xs leading-relaxed text-[#1b2a5c]/80 sm:text-sm">
                  &ldquo;{quote}&rdquo;
                </p>
              </div>

              {/* Author */}
              <div className="mt-6 flex items-center gap-3 border-t border-black/5 pt-4">
                <div className="relative size-10 overflow-hidden rounded-full border border-[#12939b]/20 bg-slate-100 shadow-xs">
                  <Image src={avatar} alt={name} fill className="object-cover" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1b2a5c] sm:text-sm">{name}</h4>
                  <p className="text-[11px] text-[#1b2a5c]/55">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
