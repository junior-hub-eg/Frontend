export function InternsStepper() {
  const steps = [
    {
      num: 1,
      title: "Apply & Assessment",
      desc: "Submit your application and complete the technical assessment",
    },
    {
      num: 2,
      title: "Team Matching",
      desc: "Get matched with the right squad and Senior Team Leader",
    },
    {
      num: 3,
      title: "Work & Learn",
      desc: "Contribute weekly, receive code reviews, and ship PRs",
    },
    {
      num: 4,
      title: "Get Certified",
      desc: "Complete your internship and receive a verified certificate",
    },
  ];

  return (
    <section id="how-it-works" className="bg-white py-6">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="relative overflow-hidden rounded-[24px] border border-black/5 bg-[#F8FBFA] p-6 lg:p-8">
          <div className="grid items-center gap-8 lg:grid-cols-12">
            {/* Left intro label */}
            <div className="lg:col-span-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#12939b]">
                WHY CHOOSE US
              </span>
              <h3 className="mt-1 text-base font-bold text-[#1b2a5c] sm:text-lg">
                Weekly Sprints/ Real codes & PRs
              </h3>
              <p className="mt-1 text-xs text-[#1b2a5c]/60">Follow a clear path</p>
            </div>

            {/* Stepper items */}
            <div className="relative lg:col-span-9">
              {/* Connecting line on desktop */}
              <div
                className="pointer-events-none absolute left-[12%] right-[12%] top-4 -z-0 hidden h-[2px] bg-dashed border-t-2 border-dashed border-[#1b2a5c]/20 lg:block"
                aria-hidden
              />

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
                {steps.map(({ num, title, desc }) => (
                  <div key={num} className="relative z-10 flex flex-col items-center text-center">
                    {/* Number Circle */}
                    <div className="grid size-9 place-items-center rounded-full bg-[#1b2a5c] text-xs font-bold text-white shadow-sm ring-4 ring-white">
                      {num}
                    </div>

                    <h4 className="mt-3 text-xs font-bold text-[#1b2a5c] sm:text-sm">{title}</h4>
                    <p className="mt-1 max-w-[190px] text-[11px] leading-relaxed text-[#1b2a5c]/65">
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
