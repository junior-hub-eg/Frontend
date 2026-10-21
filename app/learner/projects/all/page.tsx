"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CircleCheck,
  Folder,
  GitBranch,
  ListChecks,
  LoaderCircle,
  Play,
  Server,
  Palette,
  Triangle,
  User,
  Users,
} from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { mentorAvatar } from "@/lib/avatars";
import { getMyProjects, LINK_LABEL, projectDuration, ROLE_LABEL, STATUS_LABEL, type ProjectLinkKind, type ProjectSummary } from "@/lib/projects-api";
import { cn } from "@/lib/utils";


const LINK_ICONS: Record<ProjectLinkKind, ReactNode> = {
  Figma: <Palette aria-hidden className="size-3" />,
  GitHub: <GitBranch aria-hidden className="size-3" />,
  LiveSite: <Triangle aria-hidden className="size-3" />,
  Api: <Server aria-hidden className="size-3" />,
  Demo: <Play aria-hidden className="size-3" />,
  TestReport: <ListChecks aria-hidden className="size-3" />,
};

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

function Row({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2 text-[10px]">
      <span className="shrink-0 text-[#1B2D54]/60">{icon}</span>
      <span className="w-12 shrink-0 text-[#1B2D54]/60">{label}</span>
      <span className="truncate font-medium">{value}</span>
    </div>
  );
}

/** Every project of the student (GET /student/projects), the current one first. */
export default function AllProjectsPage() {
  const [list, setList] = useState<ProjectSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getMyProjects().then(
      (d) => active && setList(d.projects),
      (e) => active && setError(errorMessage(e, "We couldn't load your projects. Please try again.")),
    );
    return () => {
      active = false;
    };
  }, []);

  if (!list) {
    return (
      <div className="grid flex-1 place-items-center p-10 pt-24 lg:pl-[calc(var(--sb)+1.5rem)]" role={error ? "alert" : "status"}>
        {error ? <p className="text-sm font-semibold text-[#b83232]">{error}</p> : <LoaderCircle className="size-8 animate-spin text-[#12939b]" aria-label="Loading" />}
      </div>
    );
  }

  const PROJECTS = list.map((p) => ({
    id: p.id,
    name: p.title,
    status: STATUS_LABEL[p.status],
    squad: p.squadName,
    role: ROLE_LABEL[p.role] ?? p.role,
    duration: projectDuration(p),
    progress: p.progressPercent,
    tasks: p.myTasksDone,
    // One chip per kind of link the student shared.
    links: [...new Set(p.links.map((l) => l.kind))],
    mentor: p.monitor?.fullName ?? "No monitor yet",
    mentorAvatar: p.monitor ? mentorAvatar(p.monitor.id) : null,
  }));

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

      <header className="flex min-w-0 items-center gap-3">
        <Link
          href="/learner/projects"
          aria-label="Back to My Projects"
          className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#1B2D54]/70 text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12939b]/40"
        >
          <ArrowLeft aria-hidden className="size-4" />
        </Link>
        <div className="min-w-0">
          <h1 className="text-xl font-bold">All My Projects</h1>
          <p className="text-[11px] text-[#1B2D54]/70">
            You worked on {PROJECTS.length} {PROJECTS.length === 1 ? "project" : "projects"}
          </p>
        </div>
      </header>

      <div className="grid min-w-0 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {PROJECTS.map((p) => {
          const active = p.status === "Active";
          return (
            <section
              key={p.id}
              className="flex min-w-0 flex-col gap-3 rounded-2xl border border-[#e3ece9] bg-white p-4 shadow-sm"
            >
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#e4f1fb] text-[#14757d]">
                  <Folder aria-hidden className="size-4" />
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-xs font-semibold">{p.name}</h2>
                  <span
                    className={cn(
                      "mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-medium",
                      active ? "bg-[#dff5e8] text-[#22a559]" : "bg-[#e4f1fb] text-[#14757d]"
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn("size-1.5 rounded-full", active ? "bg-[#22a559]" : "bg-[#14757d]")}
                    />
                    {p.status}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Row icon={<Users aria-hidden className="size-3" />} label="Squad" value={p.squad} />
                <Row icon={<User aria-hidden className="size-3" />} label="Role" value={p.role} />
                <Row icon={<CalendarDays aria-hidden className="size-3" />} label="Duration" value={p.duration} />
              </div>

              <div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-[#1B2D54]/60">Project progress</span>
                  <span className="font-semibold">{p.progress}%</span>
                </div>
                <div
                  className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#c9efe9]"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={p.progress}
                >
                  <div className="h-full rounded-full bg-[#14757d]" style={{ width: `${p.progress}%` }} />
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-[#dff5e8] px-3 py-2 text-[10px] font-medium">
                <CircleCheck aria-hidden className="size-3.5 text-[#22a559]" />
                {p.tasks} tasks completed by you
              </div>

              <div className="flex flex-wrap gap-1.5">
                {p.links.map((l) => (
                  <span
                    key={l}
                    className="inline-flex items-center gap-1 rounded-md bg-[#e4f1fb] px-2 py-1 text-[9px] font-medium"
                  >
                    {LINK_ICONS[l]}
                    {LINK_LABEL[l].label}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                {p.mentorAvatar && (
                  <span className="relative size-7 shrink-0 overflow-hidden rounded-full" style={{ backgroundColor: p.mentorAvatar.bg }}>
                    <Image src={p.mentorAvatar.src} alt={p.mentor} fill sizes="28px" className="object-cover" />
                  </span>
                )}
                <div className="min-w-0 leading-tight">
                  <p className="text-[9px] text-[#1B2D54]/60">Monitor</p>
                  <p className="truncate text-[11px] font-semibold">{p.mentor}</p>
                </div>
              </div>

              <Link
                href={`/learner/projects/${p.id}` as Route}
                className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#14757d] to-[#1B2D54] px-4 py-2 text-[11px] font-semibold text-white shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12939b]/40"
              >
                View details
                <ArrowRight aria-hidden className="size-3.5" />
              </Link>
            </section>
          );
        })}
      </div>

      <section className="min-w-0 rounded-2xl border border-[#e3ece9] bg-white p-5 shadow-sm">
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
      </section>
    </div>
  );
}