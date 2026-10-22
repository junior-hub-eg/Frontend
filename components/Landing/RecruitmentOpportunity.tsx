import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Brush,
  CalendarCheck,
  Clock3,
  Columns3,
  FileDown,
  GraduationCap,
  Gauge,
  Presentation,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  SquarePen,
  Timer,
  Zap,
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
    icon: Search,
    title: "Heuristic Audits",
    description:
      "Conduct structured heuristic audits of core web flows, identifying friction points, cognitive fatigue, and navigation inconsistencies.",
  },
  {
    icon: Columns3,
    title: "Wireframe Iterations",
    description:
      "Create low-fidelity wireframes and layout iterations that directly solve documented user confusion in complex onboarding sequences.",
  },
  {
    icon: SquarePen,
    title: "Document Rationale",
    description:
      "Document clear, evidence-based usability rationales for architectural decisions, avoiding vague opinion-driven design assumptions.",
  },
  {
    icon: Presentation,
    title: "Present Proposed Changes",
    description:
      "Present proposed interface solutions with clarity and precision, preparing executive summaries for both technical and non-technical stakeholders.",
  },
];

const PARAMETERS = [
  { icon: Clock3, label: "Time Limit", value: "Untimed (45m est.)", highlight: false },
  { icon: FileDown, label: "Deliverable Format", value: "Interactive Canvas", highlight: false },
  { icon: Gauge, label: "Rubric Version", value: "Apex v2.8 (2025)", highlight: false },
  { icon: RefreshCw, label: "Allowed Retakes", value: "Unlimited", highlight: true },
];

function PanelHeading({ children }: { children: string }) {
  return (
    <h2 className="border-s-4 border-[#12939b] ps-2.5 text-2xl font-semibold leading-tight text-[#0f8a90]">{children}</h2>
  );
}

export function RecruitmentOpportunity() {
  return (
    <div className="flex-1 bg-[radial-gradient(ellipse_at_95%_0%,rgba(219,240,237,0.72),transparent_25%)]">
      <div className="mx-auto max-w-[1440px] px-5 pb-20 pt-8 sm:px-8 lg:px-[72px]">
        <Link
          href="/recruitment"
          className="inline-flex items-center gap-3 py-2 text-xl font-medium text-[#1b2a5c] transition-colors hover:text-[#12939b]"
        >
          <ArrowLeft size={20} aria-hidden />
          Back to Opportunities
        </Link>

        <section className="mt-12 rounded-2xl bg-[#e8f3f1] px-6 pb-6 pt-8 sm:px-12" aria-labelledby="opportunity-title">
          <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_auto]">
            <div>
              <h1 id="opportunity-title" className="flex items-center gap-2 text-3xl font-bold text-[#0f8a90] sm:text-[38px]">
                <Zap size={30} fill="currentColor" aria-hidden />
                Junior UI/UX Designer
              </h1>
              <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#f5ddff] px-3 py-1.5 text-[#a333c3]">
                  <Brush size={14} aria-hidden /> UI/UX Design
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[#1b2a5c]">
                  <GraduationCap size={14} aria-hidden /> Entry-Level
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#d6f2ed] px-3 py-1.5 text-[#087f87]">
                  <Clock3 size={14} aria-hidden /> Estimated time: ~45 mins
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#f5ddff] px-3 py-1.5 text-[#a333c3]">
                  <CalendarCheck size={14} aria-hidden /> Practice Simulation
                </span>
              </div>
            </div>
            <div className="flex flex-col items-start gap-4 sm:items-end">
              <Link
                href="/recruitment/junior-ui-ux-designer/apply"
                className="inline-flex h-[50px] items-center gap-2 rounded-md bg-[#128b91] px-8 text-xl font-semibold text-white transition-colors hover:bg-[#0e747a]"
              >
                Apply Now <ArrowRight size={20} aria-hidden />
              </Link>
              <span className="inline-flex items-center gap-2 text-sm text-[#334155]">
                <Timer size={16} aria-hidden /> Self-paced • Instant review rubric
              </span>
            </div>
          </div>

          <div className="mt-5 flex gap-3 rounded-2xl bg-white px-5 py-4 text-[#334155]">
            <ShieldCheck className="mt-1 shrink-0 text-[#0f8a90]" size={22} aria-hidden />
            <div>
              <p className="text-xl font-semibold text-[#0f8a90]">Educational Simulation Notice</p>
              <p className="mt-1 text-base leading-[1.15]">
                This is a realistic practice module designed to prepare you for hiring challenges. Submissions do not
                constitute real employment applications with Apex Cloud Systems Inc. All exercises reflect genuine
                enterprise expectations to evaluate product empathy and decision rationale safely.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="flex flex-col gap-4">
            <section className="rounded-2xl border border-[#b9d9d8] bg-white px-9 py-8">
              <PanelHeading>Role Overview</PanelHeading>
              <div className="mt-3 space-y-4 text-base leading-6 text-[#334155]">
                <p>
                  As a simulated Junior UI/UX Designer at Apex Cloud, you will embed into the Core Identity &amp;
                  Platform team. Apex Cloud powers critical infrastructure management dashboards for DevOps engineers
                  across 1,200+ enterprise clients. In this assessment challenge, you will tackle real-world pain points
                  that occur when complex systems meet everyday usability constraints.
                </p>
                <p>
                  Our enterprise users frequently juggle multi-tiered IAM permission trees, server metric monitors, and
                  provisioning workflows. Your mission is not to decorate interfaces with visual flair, but rather to
                  distill cognitive friction, clarify system states, and craft intuitive navigation paths that empower
                  non-technical administrators to complete high-impact security configurations without anxiety.
                </p>
                <p>
                  Throughout this simulated scenario, you will collaborate with cross-functional simulated personas
                  (including a Staff Product Manager, Lead Engineer, and Compliance Lead) to translate ambiguous project
                  briefs into structured UI wireframes backed by clear qualitative rationale.
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-[#b9d9d8] bg-white px-9 py-8">
              <PanelHeading>Responsibilities</PanelHeading>
              <p className="mt-3 text-base leading-6 text-[#334155]">
                You will be assessed on how effectively and thoughtfully you execute the following tasks during the
                active simulation phase:
              </p>
              <div className="mt-10 grid grid-cols-1 gap-x-11 gap-y-3 sm:grid-cols-2">
                {RESPONSIBILITIES.map(({ icon: Icon, title, description }) => (
                  <article key={title} className="rounded-lg bg-[#f4f4f5] p-3">
                    <span className="grid size-7 place-items-center rounded-md bg-[#d7efeb] text-[#0f8a90]" aria-hidden>
                      <Icon size={15} />
                    </span>
                    <h3 className="mt-2 text-lg font-medium leading-tight text-[#0f8a90]">{title}</h3>
                    <p className="mt-2 text-sm leading-[18px] text-[#334155]">{description}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className="flex flex-col gap-6">
            <section className="rounded-2xl border border-[#b9d9d8] bg-white px-5 py-6">
              <h2 className="flex items-center gap-2.5 text-lg font-medium text-[#1b2a5c]">
                <SlidersHorizontal size={18} className="text-[#536579]" aria-hidden /> Required Skills
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#475569]">Core competencies activated in this problem-solving trial:</p>
              <ul className="mt-4 flex flex-wrap gap-2.5">
                {SKILLS.map((skill) => (
                  <li key={skill} className="rounded-md bg-[#d5f0eb] px-2.5 py-1.5 text-xs leading-none text-[#087f87]">
                    {skill}
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl border border-[#b9d9d8] bg-white px-6 py-5">
              <h2 className="flex items-center justify-between text-lg font-semibold text-[#1b2a5c]">
                Assessing Team Lead
                <BadgeCheck size={20} className="text-[#0f8a90]" aria-label="Verified simulated assessor" />
              </h2>
              <div className="mt-3 flex items-center gap-3">
                <div
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-[#dcedea] text-sm font-semibold text-[#087f87]"
                  aria-hidden
                >
                  EV
                </div>
                <div className="min-w-0">
                  <p className="text-base font-semibold leading-tight text-[#1b2a5c]">Elena Vance (Simulated)</p>
                  <p className="text-sm leading-tight text-[#334155]">Design System Architect @ Apex</p>
                  <p className="text-xs leading-tight text-[#087f87]">Automated Rubric Overseer</p>
                </div>
              </div>
              <blockquote className="mt-3 rounded-md bg-[#e9e9eb] px-3 py-2.5 text-xs leading-relaxed text-[#334155]">
                &quot;We look for juniors who explain the &apos;why&apos; behind UI trade-offs rather than jumping
                straight to polished aesthetics.&quot;
              </blockquote>
            </section>

            <section className="rounded-2xl border border-[#b9d9d8] bg-white px-8 py-8">
              <h2 className="text-lg font-semibold text-[#1b2a5c]">Simulation Parameters</h2>
              <dl className="mt-6 space-y-5">
                {PARAMETERS.map(({ icon: Icon, label, value, highlight }) => (
                  <div key={label} className="grid grid-cols-[1fr_auto] items-center gap-4 text-base">
                    <dt className="flex items-center gap-2.5 whitespace-nowrap text-[#334155]">
                      <Icon size={17} className="text-[#0f8a90]" aria-hidden />
                      {label}
                    </dt>
                    <dd className={highlight ? "font-medium text-[#0f8a90]" : "text-[#1b2a5c]"}>{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
