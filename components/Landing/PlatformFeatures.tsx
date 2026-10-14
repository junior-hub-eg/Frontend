import Image from "next/image";
import { Lightbulb, Route, ShieldCheck, UserCheck, Rocket } from "lucide-react";

const FEATURES = [
  { title: "Learn Your Way", subtitle: "Short Videos, Quizzes, and Real Projects", icon: Route },
  { title: "Get Experts Guidance", subtitle: "Choose Mentor and receive Report", icon: UserCheck },
  { title: "Explore Real Opportunities", subtitle: "Internships and Career Simulation", icon: Rocket },
  { title: "A safe Supportive Environment", subtitle: "Built For students aged 12-18", icon: ShieldCheck },
];

export function PlatformFeatures() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#E9F7F4] to-[#DCEAFB]">
          <Image
            src="/images/Auth/students.png"
            alt="A Junior Hub student"
            fill
            sizes="(max-width: 1024px) 80vw, 24rem"
            className="object-contain object-bottom"
          />
          <span className="absolute left-6 top-6 grid size-11 place-items-center rounded-full bg-white text-amber-500 shadow-md">
            <Lightbulb size={20} />
          </span>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-wide text-[#12939b]">MORE THAN JUST COURSES</p>
          <h2 className="mt-2 text-3xl font-bold text-[#1b2a5c]">
            A Platform Built <br className="hidden sm:block" />
            for Your Future
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-[#1b2a5c]/65">
            Junior Hub is not just a course library. It&apos;s a complete learning pipeline designed to help you
            discover, grow, and reach real opportunities in the tech world.
          </p>

          <ul className="mt-8 flex flex-col gap-5">
            {FEATURES.map(({ title, subtitle, icon: Icon }) => (
              <li key={title} className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#E9F7F4] text-[#12939b]">
                  <Icon size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#1b2a5c]">{title}</p>
                  <p className="text-xs text-[#1b2a5c]/60">{subtitle}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
