"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  CalendarDays,
  CircleCheck,
  Clock,
  GitBranch,
  ListChecks,
  LoaderCircle,
  Play,
  Server,
  Palette,
  Star,
  Target,
  Triangle,
  User,
  Users,
} from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { mentorAvatar } from "@/lib/avatars";
import {
  getMyProject,
  LINK_LABEL,
  projectDuration,
  ROLE_LABEL,
  sprintDates,
  STATUS_LABEL,
  type ProjectDetail,
  type ProjectLinkKind,
} from "@/lib/projects-api";
import { cn } from "@/lib/utils";


type TaskStatus = "Done" | "In Review" | "In Progress" | "To Do";

const TASK_STATUS: Record<string, TaskStatus> = { Done: "Done", Review: "In Review", InProgress: "In Progress", ToDo: "To Do" };

const STATUS_STYLES: Record<TaskStatus, string> = {
  Done: "bg-[#dff5e8] text-[#22a559]",
  "In Review": "bg-[#fdeedb] text-[#e08a1e]",
  "In Progress": "bg-[#e4f1fb] text-[#2f6fc4]",
  "To Do": "bg-[#e8ebf2] text-[#1B2D54]",
};

const LINK_ICONS: Record<ProjectLinkKind, ReactNode> = {
  Figma: <Palette aria-hidden className="size-3.5" />,
  GitHub: <GitBranch aria-hidden className="size-3.5" />,
  LiveSite: <Triangle aria-hidden className="size-3.5" />,
  Api: <Server aria-hidden className="size-3.5" />,
  Demo: <Play aria-hidden className="size-3.5" />,
  TestReport: <ListChecks aria-hidden className="size-3.5" />,
};

function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <section className={cn("min-w-0 rounded-2xl border border-[#e3ece9] bg-white p-4 shadow-sm", className)}>
      {children}
    </section>
  );
}

function Chip({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-[#f1f5f7] px-2 py-1 text-[10px] font-medium">
      <span className="text-[#1B2D54]/60">{icon}</span>
      {children}
    </span>
  );
}

function StatTile({
  icon,
  label,
  value,
  className,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 items-center gap-2.5 rounded-xl px-3 py-2.5", className)}>
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/80 text-[#1B2D54]">
        {icon}
      </span>
      <div className="min-w-0 leading-tight">
        <p className="text-[9px] text-[#1B2D54]/60">{label}</p>
        <p className="text-sm font-bold">{value}</p>
      </div>
    </div>
  );
}

/** One of the student's projects (GET /student/projects/{id}): sprint, the student's tasks, monitor and links. */
export default function ProjectDetailsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [detail, setDetail] = useState<ProjectDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getMyProject(projectId).then(
      (d) => active && setDetail(d),
      (e) => active && setError(errorMessage(e, "We couldn't load this project. Please try again.")),
    );
    return () => {
      active = false;
    };
  }, [projectId]);

  if (!detail) {
    return (
      <div className="grid flex-1 place-items-center p-10 pt-24 lg:pl-[calc(var(--sb)+1.5rem)]" role={error ? "alert" : "status"}>
        {error ? (
          <p className="text-sm font-semibold text-[#b83232]">
            {error}{" "}
            <Link href="/learner/projects/all" className="underline">
              All my projects
            </Link>
          </p>
        ) : (
          <LoaderCircle className="size-8 animate-spin text-[#12939b]" aria-label="Loading" />
        )}
      </div>
    );
  }
  return <ProjectDetailsView detail={detail} />;
}

function ProjectDetailsView({ detail }: { detail: ProjectDetail }) {
  const p = detail.project;
  const PROJECT = {
    name: p.title,
    status: STATUS_LABEL[p.status],
    description: p.description,
    squad: p.squadName,
    role: ROLE_LABEL[p.role] ?? p.role,
    startDate: projectDuration(p),
  };
  const SPRINT = {
    name: detail.sprint?.name ?? "No sprint yet",
    dates: detail.sprint ? sprintDates(detail.sprint) : "",
    daysLeft: detail.sprint?.daysLeft ?? 0,
    done: detail.sprint?.tasksDone ?? 0,
    total: detail.sprint?.tasksTotal ?? 0,
    storyPoints: detail.sprint?.storyPointsTotal ?? 0,
  };
  const TASKS = detail.myTasks.map((t) => ({
    id: t.id,
    title: t.title,
    tag: t.sprintName,
    points: t.storyPoints,
    status: TASK_STATUS[t.status] ?? "To Do",
  }));
  const avatar = p.monitor ? mentorAvatar(p.monitor) : null;
  const MENTOR = { name: p.monitor?.fullName ?? "No monitor yet", title: p.monitor?.title ?? "", skills: p.monitor?.skills.slice(0, 3) ?? [] };
  const WORK_LINKS = p.links.map((l, i) => ({
    key: `${l.kind}-${i}`,
    label: LINK_LABEL[l.kind].label,
    note: LINK_LABEL[l.kind].note,
    href: l.url,
    icon: LINK_ICONS[l.kind],
  }));

  const percent = SPRINT.total ? Math.round((SPRINT.done / SPRINT.total) * 1000) / 10 : 0;
  const remaining = SPRINT.total - SPRINT.done;
  const completedByYou = TASKS.filter((t) => t.status === "Done").length;

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
          href="/learner/projects/all"
          aria-label="Back to all projects"
          className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#1B2D54]/70 text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12939b]/40"
        >
          <ArrowLeft aria-hidden className="size-4" />
        </Link>
        <div className="min-w-0">
          <h1 className="text-xl font-bold">Project Details</h1>
          <p className="truncate text-[11px] text-[#1B2D54]/70">{PROJECT.name}</p>
        </div>
      </header>
      <Card className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
        <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-[#c9efe9] text-[#14757d]">
          <BrainCircuit aria-hidden className="size-8" strokeWidth={1.6} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold">{PROJECT.name}</h2>
            <span className="flex items-center gap-1 rounded-full bg-[#dff5e8] px-2 py-0.5 text-[10px] font-medium text-[#22a559]">
              <span aria-hidden className="size-1.5 rounded-full bg-[#22a559]" />
              {PROJECT.status}
            </span>
          </div>
          <p className="mt-1 text-[11px] leading-snug text-[#1B2D54]/70">{PROJECT.description}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Chip icon={<Users aria-hidden className="size-3" />}>Squad: {PROJECT.squad}</Chip>
            <Chip icon={<User aria-hidden className="size-3" />}>Your role: {PROJECT.role}</Chip>
            <Chip icon={<CalendarDays aria-hidden className="size-3" />}>{PROJECT.startDate}</Chip>
          </div>
        </div>

        {p.isCurrent && (
        <Link
          href="/learner/interns/internship"
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#14757d] to-[#1B2D54] px-4 py-2 text-[11px] font-semibold text-white shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12939b]/40"
        >
          Continue Working
          <ArrowRight aria-hidden className="size-3.5" />
        </Link>
        )}
      </Card>

      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
        {/* Left column */}
        <div className="flex min-w-0 flex-col gap-4">
          {/* Sprint */}
          <Card className="flex flex-col gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#c9efe9] text-[#14757d]">
                <Target aria-hidden className="size-4" />
              </span>
              <div className="min-w-0 leading-tight">
                <p className="text-xs font-semibold">{SPRINT.name}</p>
                <p className="text-[10px] text-[#1B2D54]/60">{SPRINT.dates}</p>
              </div>
              <span className="ml-1 hidden items-center gap-1 rounded-md bg-[#f1f5f7] px-2 py-1 text-[9px] font-medium sm:inline-flex">
                <Clock aria-hidden className="size-3 text-[#1B2D54]/60" />
                {SPRINT.daysLeft} days left
              </span>
              <div className="ml-auto shrink-0 text-right leading-tight">
                <p className="text-lg font-bold">{percent}%</p>
                <p className="text-[10px] text-[#1B2D54]/60">
                  {SPRINT.done} of {SPRINT.total} tasks done
                </p>
              </div>
            </div>

            <div
              className="h-1.5 w-full overflow-hidden rounded-full bg-[#c9efe9]"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
            >
              <div className="h-full rounded-full bg-[#14757d]" style={{ width: `${percent}%` }} />
            </div>

            <div className="grid min-w-0 grid-cols-2 gap-3 md:grid-cols-4">
              <StatTile
                icon={<ListChecks aria-hidden className="size-3.5" />}
                label="Total Tasks"
                value={SPRINT.total}
                className="bg-[#e4f1fb]"
              />
              <StatTile
                icon={<CircleCheck aria-hidden className="size-3.5" />}
                label="Completed"
                value={SPRINT.done}
                className="bg-[#dff5e8]"
              />
              <StatTile
                icon={<Clock aria-hidden className="size-3.5" />}
                label="Remaining"
                value={remaining}
                className="bg-[#fde6e6]"
              />
              <StatTile
                icon={<Star aria-hidden className="size-3.5" />}
                label="Story Points"
                value={SPRINT.storyPoints}
                className="bg-[#fdf3cf]"
              />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Your Tasks</h2>
              <span className="text-[10px] font-semibold text-[#14757d]">
                {completedByYou} completed by you
              </span>
            </div>

            <ul className="mt-3 flex flex-col gap-2">
              {TASKS.length === 0 && <li className="text-[11px] text-[#1B2D54]/60">No tasks assigned to you in this project yet.</li>}
              {TASKS.map((task) => (
                <li
                  key={task.id}
                  className="flex min-w-0 items-center gap-3 rounded-lg bg-[#f3f5f5] px-3 py-2.5"
                >
                  <p className="min-w-0 flex-1 truncate text-[11px] font-medium">{task.title}</p>
                  <span className="shrink-0 rounded bg-[#e4f1fb] px-1.5 py-0.5 text-[9px] font-medium text-[#14757d]">
                    {task.tag}
                  </span>
                  <span className="w-9 shrink-0 text-[9px] text-[#1B2D54]/60">{task.points} pts</span>
                  <span
                    className={cn(
                      "w-16 shrink-0 rounded-md py-0.5 text-center text-[9px] font-semibold",
                      STATUS_STYLES[task.status]
                    )}
                  >
                    {task.status}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <Card>
            <h2 className="text-sm font-semibold">Project Monitor</h2>
            <div className="mt-3 flex items-center gap-3">
              {avatar && (
                <span className="relative size-14 shrink-0 overflow-hidden rounded-full" style={{ backgroundColor: avatar.bg }}>
                  <Image src={avatar.src} alt={MENTOR.name} fill sizes="56px" className="object-cover" />
                </span>
              )}
              <div className="min-w-0 leading-tight">
                <p className="text-xs font-semibold">{MENTOR.name}</p>
                <p className="mt-0.5 text-[10px] text-[#1B2D54]/60">{MENTOR.title}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {MENTOR.skills.map((s) => (
                <span key={s} className="rounded-md bg-[#e4f1fb] px-2 py-1 text-[9px] font-medium text-[#14757d]">
                  {s}
                </span>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-sm font-semibold">Work Links</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {WORK_LINKS.length === 0 && <li className="text-[11px] text-[#1B2D54]/60">No links shared in this project.</li>}
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
    </div>
  );
}