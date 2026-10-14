import { Briefcase, GraduationCap, Layers, Users } from "lucide-react";

const STATS = [
  { icon: Users, value: "5,000+", label: "Young Learners" },
  { icon: Layers, value: "20+", label: "Learning Tracks" },
  { icon: GraduationCap, value: "500+", label: "Expert Mentors" },
  { icon: Briefcase, value: "100+", label: "Partner Companies" },
];

export function Stats() {
  return (
    <section className="mx-auto -mt-8 max-w-6xl px-6 lg:px-10">
      <div className="grid grid-cols-2 gap-6 rounded-2xl bg-[#E9F7F4] px-8 py-8 shadow-sm sm:grid-cols-4 sm:divide-x sm:divide-[#12939b]/15">
        {STATS.map(({ icon: Icon, value, label }) => (
          <div key={label} className="flex items-center gap-3 sm:px-4 sm:first:pl-0">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-[#12939b]">
              <Icon size={20} />
            </span>
            <div className="leading-tight">
              <p className="text-xl font-bold text-[#1b2a5c]">{value}</p>
              <p className="text-xs text-[#1b2a5c]/60">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
