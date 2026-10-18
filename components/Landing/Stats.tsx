import { Briefcase, GraduationCap, Layers, Users } from "lucide-react";

const STATS = [
  { icon: Users, value: "5,000+", label: "Young Learners" },
  { icon: Layers, value: "20+", label: "Learning Tracks" },
  { icon: GraduationCap, value: "500+", label: "Expert Mentors" },
  { icon: Briefcase, value: "100+", label: "Partner Companies" },
];

export function Stats() {
  return (
    <section className="relative z-10 mx-auto -mt-4 w-full max-w-7xl px-5 sm:-mt-6 sm:px-6 lg:-mt-5 lg:px-10">
      <div className="grid grid-cols-2 items-center gap-y-5 rounded-[22px] bg-[#EAF9F7] px-5 py-6 sm:grid-cols-4 sm:gap-y-0 sm:px-6 sm:py-7 lg:rounded-[24px] lg:px-8">
        {STATS.map(({ icon: Icon, value, label }, index) => (
          <div
            key={label}
            className={`flex items-center justify-center gap-3 sm:justify-start sm:px-4 lg:px-5 ${
              index === 2
                ? "sm:border-l sm:border-[#C7DEDF]"
                : ""
            }`}
          >
            <Icon
              size={30}
              className="shrink-0 text-[#128B91]"
              strokeWidth={1.8}
              aria-hidden="true"
            />

            <div className="min-w-0 leading-tight">
              <p className="whitespace-nowrap text-xl font-bold text-[#1B2A5C] sm:text-2xl lg:text-[25px]">
                {value}
              </p>

              <p className="mt-1 whitespace-nowrap text-[10px] text-[#1B2A5C] sm:text-[11px] lg:text-xs">
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
