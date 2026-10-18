import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";

const TESTIMONIALS = [
  {
    quote: "Junior Hub helped me go from zero knowledge to building real projects. The mentors are amazing!",
    name: "Lina S.",
    role: "Marketing Intern",
    rating: 5,
  },
  {
    quote: "The AI assessment showed me exactly what I need to improve, and the learning path is super clear.",
    name: "Jason M.",
    role: "Software Engineering Intern",
    rating: 5,
  },
  {
    quote: "The team was welcoming and inclusive, creating an environment where I felt comfortable asking questions and contributing ideas.",
    name: "Priya K.",
    role: "Design Intern",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[#12939b]">REAL STORIES</p>
            <h2 className="mt-2 text-3xl font-bold text-[#1b2a5c]">What Learners Say</h2>
          </div>
          <Link href="/courses" className="flex items-center gap-1 text-sm font-semibold text-[#12939b] hover:underline">
            View All Tracks <ArrowRight size={14} />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {TESTIMONIALS.map(({ quote, name, role, rating }) => (
            <div key={name} className="flex flex-col gap-4 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
              <div className="flex gap-0.5 text-[#12939b]">
                {Array.from({ length: rating }).map((_, i) => (
                  <Star key={i} size={15} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-[#1b2a5c]/75">&ldquo;{quote}&rdquo;</p>
              <div className="mt-auto flex items-center gap-3 pt-2">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#1b2a5c] text-xs font-semibold text-white">
                  {name.charAt(0)}
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-[#1b2a5c]">{name}</p>
                  <p className="text-xs text-[#1b2a5c]/55">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
