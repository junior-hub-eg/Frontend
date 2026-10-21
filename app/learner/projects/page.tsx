"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  ChevronRight,
  CircleCheck,
  Folder,
  GitBranch,
  ListChecks,
  LoaderCircle,
  Play,
  Server,
  Palette,
  Target,
  Triangle,
  User,
  Users,
} from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import {
  getMyProject,
  getMyProjects,
  LINK_LABEL,
  ROLE_LABEL,
  sprintDates,
  STATUS_LABEL,
  type MyProjects,
  type ProjectDetail,
  type ProjectLinkKind,
} from "@/lib/projects-api";
import { cn } from "@/lib/utils";


const OPPORTUNITIES = [
  {
    title: "Internships",
    href: "/learner/interns",
    image: "/images/learner/projects/opportunity-internships.png",
  },
  {
    title: "Recruitment",
    href: "/learner/recruitment-practice",
    image: "/images/learner/projects/opportunity-recruitment.png",
  },
];


function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <section className={cn("min-w-0 rounded-2xl border border-[#e3ece9] bg-white p-4 shadow-sm", className)}>
      {children}
    </section>
  );
}

function InfoTile({
  icon,
  label,
  value,
  className,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 items-center gap-3 rounded-xl px-3 py-2.5", className)}>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/80 text-[#1B2D54]">
        {icon}
      </span>
      <div className="min-w-0 leading-tight">
        <p className="text-[10px] text-[#1B2D54]/60">{label}</p>
        <p className="truncate text-xs font-semibold">{value}</p>
      </div>
    </div>
  );
}

function PrimaryButton({ href, children }: { href: Route; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#14757d] to-[#1B2D54] px-4 py-2 text-[11px] font-semibold text-white shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12939b]/40"
    >
      {children}
    </Link>
  );
}

const LINK_ICONS: Record<ProjectLinkKind, ReactNode> = {
  Figma: <Palette aria-hidden className="size-3.5" />,
  GitHub: <GitBranch aria-hidden className="size-3.5" />,
  LiveSite: <Triangle aria-hidden className="size-3.5" />,
  Api: <Server aria-hidden className="size-3.5" />,
  Demo: <Play aria-hidden className="size-3.5" />,
  TestReport: <ListChecks aria-hidden className="size-3.5" />,
};

/** My Projects: the current project from GET /student/projects and its sprint from GET /student/projects/{id}. */
export default function MyProjectsPage() {
  const [data, setData] = useState<{ list: MyProjects; detail: ProjectDetail | null } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getMyProjects()
      .then(async (list) => ({ list, detail: list.current ? await getMyProject(list.current.id) : null }))
      .then(
        (d) => active && setData(d),
        (e) => active && setError(errorMessage(e, "We couldn't load your projects. Please try again.")),
      );
    return () => {
      active = false;
    };
  }, []);

  if (!data) {
    return (
      <div className="grid flex-1 place-items-center p-10 pt-24 lg:pl-[calc(var(--sb)+1.5rem)]" role={error ? "alert" : "status"}>
        {error ? <p className="text-sm font-semibold text-[#b83232]">{error}</p> : <LoaderCircle className="size-8 animate-spin text-[#12939b]" aria-label="Loading" />}
      </div>
    );
  }
  return <MyProjectsView list={data.list} detail={data.detail} />;
}

function MyProjectsView({ list, detail }: { list: MyProjects; detail: ProjectDetail | null }) {
  const current = list.current;
  const IN_SQUAD = current !== null;
  const ALL_PROJECTS_COUNT = list.projects.length;
  const PROJECT = {
    id: current?.id ?? "",
    name: current?.title ?? "",
    status: current ? STATUS_LABEL[current.status] : "",
    description: current?.description ?? "",
    squad: current?.squadName ?? "",
    role: current ? (ROLE_LABEL[current.role] ?? current.role) : "",
    tasksCompleted: current?.myTasksDone ?? 0,
  };
  const SPRINT = {
    name: detail?.sprint?.name ?? "No sprint yet",
    dates: detail?.sprint ? sprintDates(detail.sprint) : "",
    done: detail?.sprint?.tasksDone ?? 0,
    total: detail?.sprint?.tasksTotal ?? 0,
  };
  const CONTRIBUTION = { mine: current?.myTasksDone ?? 0, squad: current?.tasksDone ?? 0 };
  const WORK_LINKS = (current?.links ?? []).map((l, i) => ({
    key: `${l.kind}-${i}`,
    label: LINK_LABEL[l.kind].label,
    note: LINK_LABEL[l.kind].note,
    href: l.url,
    icon: LINK_ICONS[l.kind],
  }));
  const percent = SPRINT.total ? Math.round((SPRINT.done / SPRINT.total) * 1000) / 10 : 0;
  const hasProjects = ALL_PROJECTS_COUNT > 0;

  return (
    <div
      dir="ltr"
      className="relative isolate flex min-h-0 min-w-0 w-full flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto bg-[#f6f9f8] px-4 pb-6 pt-24 font-[family-name:var(--font-poppins)] text-[#1B2D54] lg:pl-[calc(var(--sb)+1.5rem)] lg:pr-6"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[440px] [mask-image:linear-gradient(to_bottom,black_60%,transparent)]"
      >
        <Image
          src="/images/learner/projects/background.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-top"
        />
      </div>
      <header className="min-w-0">
        <h1 className="text-xl font-bold">My Projects</h1>
        <p className="mt-1 text-[11px] text-[#1B2D54]/70">
          Track your current project, your squad and the work you&apos;ve delivered.
        </p>
      </header>

      {IN_SQUAD ? (
        <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
          {/* Current project */}
          <Card className="flex min-w-0 flex-col gap-4">
            <h2 className="text-sm font-semibold">Current Project</h2>

            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
              <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-[#c9efe9] text-[#14757d]">
                <BrainCircuit aria-hidden className="size-8" strokeWidth={1.6} />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold">{PROJECT.name}</h3>
                  <span className="flex items-center gap-1 rounded-full bg-[#dff5e8] px-2 py-0.5 text-[10px] font-medium text-[#22a559]">
                    <span aria-hidden className="size-1.5 rounded-full bg-[#22a559]" />
                    {PROJECT.status}
                  </span>
                </div>
                <p className="mt-1 text-[11px] leading-snug text-[#1B2D54]/70">{PROJECT.description}</p>
              </div>

              <PrimaryButton href={`/learner/projects/${PROJECT.id}` as Route}>
                Continue Working
                <ArrowRight aria-hidden className="size-3.5" />
              </PrimaryButton>
            </div>

            <div className="grid min-w-0 gap-3 sm:grid-cols-3">
              <InfoTile
                icon={<Users aria-hidden className="size-4" />}
                label="Squad"
                value={PROJECT.squad}
                className="bg-[#e4f1fb]"
              />
              <InfoTile
                icon={<User aria-hidden className="size-4" />}
                label="Your role"
                value={PROJECT.role}
                className="bg-[#fdeedb]"
              />
              <InfoTile
                icon={<CircleCheck aria-hidden className="size-4" />}
                label="Your tasks"
                value={`${PROJECT.tasksCompleted} tasks completed`}
                className="bg-[#dff5e8]"
              />
            </div>
            <div className="min-w-0 rounded-xl bg-[#f3f5f5] p-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#c9efe9] text-[#14757d]">
                  <Target aria-hidden className="size-4" />
                </span>
                <div className="min-w-0 leading-tight">
                  <p className="text-xs font-semibold">{SPRINT.name}</p>
                  <p className="text-[10px] text-[#1B2D54]/60">{SPRINT.dates}</p>
                </div>
                <div className="ml-auto shrink-0 text-right leading-tight">
                  <p className="text-lg font-bold">{percent}%</p>
                  <p className="text-[10px] text-[#1B2D54]/60">
                    {SPRINT.done} of {SPRINT.total} tasks done
                  </p>
                </div>
              </div>

              <div
                className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#c9efe9]"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
              >
                <div className="h-full rounded-full bg-[#14757d]" style={{ width: `${percent}%` }} />
              </div>
            </div>
          </Card>

          <div className="flex min-w-0 flex-col gap-4">
            <Card>
              <h2 className="text-sm font-semibold">Your Contribution</h2>
              <div className="mt-3 flex items-center gap-3">
                <p className="text-4xl font-bold text-[#14757d]">{CONTRIBUTION.mine}</p>
                <div className="min-w-0 leading-tight">
                  <p className="text-xs font-semibold">tasks completed by you</p>
                  <p className="text-[10px] text-[#1B2D54]/60">
                    of the squad&apos;s {CONTRIBUTION.squad} completed tasks
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-sm font-semibold">Work Links</h2>
              <ul className="mt-3 flex flex-col gap-2">
                {WORK_LINKS.length === 0 && (
                  <li>
                    <Link href="/learner/interns/session" className="text-xs font-semibold text-[#14757d] hover:underline">
                      + Add your links
                    </Link>
                  </li>
                )}
                {WORK_LINKS.map((link) => (
                  <li key={link.key}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-w-0 items-center gap-3 rounded-xl bg-[#e9f7f5] px-3 py-2.5 transition-colors hover:bg-[#d9f0ec]"
                    >
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white text-[#14757d]">
                        {link.icon}
                      </span>
                      <div className="min-w-0 leading-tight">
                        <p className="text-xs font-semibold">{link.label}</p>
                        <p className="text-[10px] text-[#1B2D54]/60">{link.note}</p>
                      </div>
                      <ArrowRight aria-hidden className="ml-auto size-3.5 shrink-0" />
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="flex min-w-0 flex-col items-center gap-3 px-6 py-10 text-center">
          <span className="flex size-24 items-center justify-center rounded-full bg-[#e4f1fb]/70">
            <span className="flex size-16 items-center justify-center rounded-2xl bg-white text-[#14757d] shadow-md">
              <Users aria-hidden className="size-8" strokeWidth={1.6} />
            </span>
          </span>
          <h2 className="text-lg font-bold">You&apos;re not in a squad yet</h2>
          <p className="max-w-md text-[11px] text-[#1B2D54]/70">
            Join a squad from Internship to start working on a project with your team.
          </p>
          <PrimaryButton href={"/learner/interns" as Route}>
            Join a squad
            <ArrowRight aria-hidden className="size-3.5" />
          </PrimaryButton>
        </Card>
      )}

      <Card className="flex min-w-0 items-center gap-4 p-5">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#e4f1fb] text-[#14757d]">
          <Folder aria-hidden className="size-7" strokeWidth={1.6} />
        </span>
        <div className="min-w-0 leading-tight">
          <h2 className="text-sm font-semibold">All My Projects</h2>
          <p className="mt-1 text-xs font-semibold text-[#14757d]">
            {hasProjects
              ? `You worked on ${ALL_PROJECTS_COUNT} ${ALL_PROJECTS_COUNT === 1 ? "project" : "projects"}`
              : "You haven't worked on any projects yet"}
          </p>
          <p className="mt-1 text-[10px] text-[#1B2D54]/60">
            View your current and previous projects in one place.
          </p>
        </div>
        {hasProjects && (
          <Link
            href="/learner/projects/all"
            aria-label="View all projects"
            className="ml-auto flex size-9 shrink-0 items-center justify-center rounded-full bg-[#1B2D54] text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12939b]/40"
          >
            <ChevronRight aria-hidden className="size-4" />
          </Link>
        )}
      </Card>

      <Card className="min-w-0 p-5">
        <h2 className="text-sm font-semibold">Opportunities</h2>
        <div className="mt-3 grid min-w-0 gap-4 md:grid-cols-2">
          {OPPORTUNITIES.map((item) => (
            <Link
              key={item.title}
              href={item.href as Route}
              aria-label={`Explore ${item.title}`}
              className="block min-w-0 overflow-hidden rounded-xl transition-transform hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12939b]/40"
            >
              <Image src={item.image} alt="" width={610} height={142} className="h-auto w-full" />
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}