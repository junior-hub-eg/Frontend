import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  Clock3,
  FileText,
  Gauge,
  RotateCw,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

const SKILLS = [
  "Figma basics",
  "User empathy",
  "Wireframing",
  "Clear written rationale",
  "Accessibility fundamentals",
  "Information Architecture",
];

const RESPONSIBILITIES = [
  {
    icon: "◎",
    title: "Heuristic Audits",
    description:
      "Conduct structured heuristic audits of core web flows, identifying friction points, cognitive fatigue, and navigation inconsistencies.",
  },
  {
    icon: "▧",
    title: "Wireframe Iterations",
    description:
      "Create low-fidelity wireframes and layout iterations that directly solve documented user confusion in complex onboarding sequences.",
  },
  {
    icon: "▱",
    title: "Document Rationale",
    description:
      "Document clear, evidence-based usability rationales for architectural decisions, avoiding vague opinion-driven design assumptions.",
  },
  {
    icon: "▣",
    title: "Present Proposed Changes",
    description:
      "Present proposed interface solutions with clarity and precision, preparing executive summaries for both technical and non-technical stakeholders.",
  },
];

const PARAMETERS = [
  { icon: Clock3, label: "Time Limit", value: "Untimed (45m est.)" },
  { icon: FileText, label: "Deliverable Format", value: "Interactive Canvas" },
  { icon: Gauge, label: "Rubric Version", value: "Apex v2.8 (2025)" },
  { icon: RotateCw, label: "Allowed Retakes", value: "Unlimited" },
];

function PanelHeading({ children }: { children: string }) {
  return (
    <h2 className="border-l-2 border-[#12939b] pl-2 text-[13px] font-semibold leading-tight text-[#087f87] sm:text-sm">
      {children}
    </h2>
  );
}

export function RecruitmentOpportunity() {
  return (
    <main className="flex-1 bg-[radial-gradient(ellipse_at_95%_0%,rgba(219,240,237,0.72),transparent_25%)]">
      <div className="mx-auto max-w-[1760px] px-5 pb-10 pt-6 sm:px-8 lg:px-12">
        <Link
          href="/recruitment"
          className="inline-flex items-center gap-2 py-2 text-xs font-medium text-[#1b2a5c] transition-colors hover:text-[#12939b] sm:text-sm"
        >
          <ArrowLeft size={13} aria-hidden />
          Back to Opportunities
        </Link>

        <section className="mt-3 rounded-xl bg-[#e8f3f1] p-4 sm:p-6" aria-labelledby="opportunity-title">
          <div className="grid items-start gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
            <div>
              <h1 id="opportunity-title" className="flex items-center gap-2 text-2xl font-bold text-[#07858c] sm:text-3xl">
                <Sparkles size={24} fill="currentColor" aria-hidden />
                Junior UI/UX Designer
              </h1>
              <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-medium sm:text-xs">
                <span className="rounded-full bg-[#f5ddff] px-3 py-1.5 text-[#a333c3]">✦ UI/UX Design</span>
                <span className="rounded-full bg-white px-3 py-1.5 text-[#087f87]">◉ Entry-Level</span>
                <span className="rounded-full bg-[#d6f2ed] px-3 py-1.5 text-[#087f87]">◷ Estimated time: ~45 mins</span>
                <span className="rounded-full bg-[#f5ddff] px-3 py-1.5 text-[#a333c3]">▣ Practice Simulation</span>
              </div>
            </div>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <Link
                href="/recruitment/junior-ui-ux-designer/apply"
                className="inline-flex items-center gap-2 rounded-md bg-[#128b91] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0e747a]"
              >
                Apply Now <ArrowUpRight size={16} aria-hidden />
              </Link>
              <span className="text-[10px] text-[#334155] sm:text-xs">◷ &nbsp;Self-paced • Instant review rubric</span>
            </div>
          </div>

          <div className="mt-4 flex gap-3 rounded-lg bg-white px-4 py-3 text-[10px] leading-relaxed text-[#334155] sm:text-xs">
            <ShieldCheck className="mt-0.5 shrink-0 text-[#078f96]" size={18} aria-hidden />
            <p>
              <span className="font-semibold text-[#07858c]">Educational Simulation Notice</span>
              <br />
              This is a realistic practice module designed to prepare you for hiring challenges. Submissions do not
              constitute real employment applications with Apex Cloud Systems Inc. All exercises reflect genuine
              enterprise expectations to evaluate product empathy and decision rationale safely.
            </p>
          </div>
        </section>

        <div className="mt-4 grid gap-4 sm:grid-cols-[2fr_1fr]">
          <div className="flex flex-col gap-4">
            <section className="rounded-xl border border-[#b9d9d8] bg-white p-6">
              <PanelHeading>Role Overview</PanelHeading>
              <div className="mt-3 space-y-3 text-xs leading-relaxed text-[#334155] sm:text-sm">
                <p>
                  As a simulated Junior UI/UX Designer at Apex Cloud, join the Core Identity &amp; Platform team.
                  Apex Cloud builds dashboards for DevOps engineers at 1,200+ enterprise clients. Your challenge is
                  to improve usability across complex systems.
                </p>
                <p>
                  Users juggle multi-tiered IAM permissions, server metrics, and provisioning workflows. Your task is
                  to uncover cognitive friction, clarify system states, and create intuitive navigation that helps
                  non-technical administrators complete important security configurations with confidence.
                </p>
                <p>
                  Collaborate with a simulated Product Manager, Lead Engineer, and Compliance Lead to turn an
                  ambiguous project brief into structured wireframes supported by clear qualitative rationale.
                </p>
              </div>
            </section>

            <section className="rounded-xl border border-[#b9d9d8] bg-white p-6">
              <PanelHeading>Responsibilities</PanelHeading>
              <p className="mt-3 text-xs leading-relaxed text-[#334155] sm:text-sm">
                You will be assessed on how effectively and thoughtfully you execute the following tasks during the
                active simulation phase:
              </p>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {RESPONSIBILITIES.map((item) => (
                  <article key={item.title} className="min-h-[132px] rounded-lg bg-[#f4f4f5] p-4">
                    <span
                      className="mb-2 grid size-6 place-items-center rounded bg-[#d7efeb] text-xs font-semibold text-[#07858c]"
                      aria-hidden
                    >
                      {item.icon}
                    </span>
                    <h3 className="text-sm font-semibold leading-tight text-[#07858c]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-[#334155]">{item.description}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className="flex flex-col gap-4">
            <section className="rounded-xl border border-[#b9d9d8] bg-white p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-[#1b2a5c]">
                <span className="text-[#536579]" aria-hidden>☷</span> Required Skills
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-[#64748b]">
                Core competencies activated in this problem-solving trial:
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {SKILLS.map((skill) => (
                  <li key={skill} className="rounded-full bg-[#d5f0eb] px-2.5 py-1.5 text-[10px] leading-none text-[#087f87]">
                    {skill}
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl border border-[#b9d9d8] bg-white p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-[#1b2a5c]">
                <UserRound size={12} aria-hidden /> Assessing Team Lead
              </h2>
              <div className="mt-3 flex items-center gap-3">
                <div className="grid size-12 shrink-0 place-items-center rounded-full bg-[#dcedea] text-[#087f87]">
                  <UserRound size={24} aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="flex items-center gap-1 text-xs font-semibold text-[#1b2a5c]">
                    Elena Vasquez (Simulated)
                    <BadgeCheck size={14} className="shrink-0 text-[#078f96]" aria-label="Verified simulated assessor" />
                  </p>
                  <p className="text-[10px] leading-tight text-[#64748b]">Design System Architect at Apex</p>
                  <p className="text-[10px] leading-tight text-[#07858c]">Automated Rubric Oversight</p>
                </div>
              </div>
              <blockquote className="mt-3 rounded-md bg-[#f1f1f3] px-3 py-2 text-[10px] italic leading-relaxed text-[#475569]">
                “We look for juniors who explain why they&apos;ve built a trade-off rather than jumping straight to
                polished aesthetics.”
              </blockquote>
            </section>

            <section className="rounded-xl border border-[#b9d9d8] bg-white p-5">
              <h2 className="text-sm font-semibold text-[#1b2a5c]">Simulation Parameters</h2>
              <dl className="mt-4 space-y-4">
                {PARAMETERS.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="grid grid-cols-[1fr_auto] items-center gap-3 text-xs">
                    <dt className="flex items-center gap-2 text-[#475569]">
                      <Icon size={14} className="text-[#078f96]" aria-hidden />
                      {label}
                    </dt>
                    <dd className="text-right font-medium text-[#334155]">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
