"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  CircleAlert,
  CircleCheck,
  ClipboardCheck,
  ExternalLink,
  Flag,
  Hourglass,
  ListChecks,
  LoaderCircle,
  Package,
  Target,
  UserRound,
  Users,
} from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { useI18n, useT } from "@/lib/i18n/client";
import { dateLocale } from "@/lib/i18n/translate";
import { getProjectBrief, LINK_LABEL, ROLE_LABEL, STATUS_LABEL, type BriefMember, type ProjectBrief } from "@/lib/projects-api";
import { CatalogLinks, ProjectLogo } from "@/components/learner/ProjectCatalogParts";
import { cn } from "@/lib/utils";

function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn("min-w-0 rounded-2xl border border-[#e3ece9] bg-white p-4 shadow-sm", className)}>{children}</section>;
}

function Chip({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-[#f1f5f7] px-2 py-1 text-[10px] font-medium">
      <span className="text-[#1B2D54]/60">{icon}</span>
      {children}
    </span>
  );
}

/** One numbered section of the PRD; hidden when the admin left it empty. */
function Section({ n, icon, title, children }: { n: number; icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="min-w-0 border-t border-[#eef2f1] pt-4 first:border-t-0 first:pt-0">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#c9efe9] text-[#14757d]">{icon}</span>
        <span className="text-[#1B2D54]/40">{n}.</span> {title}
      </h2>
      <div className="mt-2 ps-9 text-[12px] leading-relaxed text-[#1B2D54]/85">{children}</div>
    </section>
  );
}

function Bullets({ items, ordered = false }: { items: string[]; ordered?: boolean }) {
  const List = ordered ? "ol" : "ul";
  return (
    <List className={cn("flex flex-col gap-1.5", ordered ? "list-decimal ps-4" : "")}>
      {items.map((item, i) => (
        <li key={i} className={ordered ? "" : "flex gap-2"}>
          {!ordered && <span aria-hidden className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-[#14757d]" />}
          {/* The admin may number the lines already; the list numbers them. */}
          <span>{ordered ? item.replace(/^\d+[.)]\s*/, "") : item}</span>
        </li>
      ))}
    </List>
  );
}

const lines = (text: string) => text.split("\n").map((l) => l.trim()).filter(Boolean);

const day = (iso: string) => new Date(iso).toLocaleDateString(dateLocale("en-US"), { month: "short", day: "numeric", year: "numeric" });

/**
 * The project as a PRD (27 Oct 2026, GET /student/projects/{id}/brief): overview, goals, users, use cases,
 * requirements, deliverables and acceptance criteria the admin wrote, the project's links, and the links each teammate
 * submits with whether they are in and whether the teammate handed in their work.
 */
export default function ProjectBriefPage() {
  const t = useT();
  const { projectId } = useParams<{ projectId: string }>();
  const [brief, setBrief] = useState<ProjectBrief | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getProjectBrief(projectId).then(
      (b) => active && setBrief(b),
      (e) => active && setError(errorMessage(e, "We couldn't load this project. Please try again.")),
    );
    return () => {
      active = false;
    };
  }, [projectId]);

  if (!brief) {
    return (
      <div className="grid flex-1 place-items-center p-10 pt-24 lg:ps-[calc(var(--sb)+1.5rem)]" role={error ? "alert" : "status"}>
        {error ? (
          <p className="text-sm font-semibold text-[#b83232]">
            {error}{" "}
            <Link href="/learner/projects/all" className="underline">
              {t("All my projects")}
            </Link>
          </p>
        ) : (
          <LoaderCircle className="size-8 animate-spin text-[#12939b]" aria-label={t("Loading")} />
        )}
      </div>
    );
  }
  return <BriefView brief={brief} />;
}

function BriefView({ brief }: { brief: ProjectBrief }) {
  const { t, dir } = useI18n();
  const sections: { icon: ReactNode; title: string; body: ReactNode; show: boolean }[] = [
    {
      icon: <Flag aria-hidden className="size-3.5" />,
      title: t("Overview & problem"),
      body: <p className="whitespace-pre-line">{brief.problem}</p>,
      show: !!brief.problem.trim(),
    },
    { icon: <Target aria-hidden className="size-3.5" />, title: t("Goals"), body: <Bullets items={brief.goals} />, show: brief.goals.length > 0 },
    {
      icon: <Users aria-hidden className="size-3.5" />,
      title: t("Target users"),
      body: (
        <div className="flex flex-wrap gap-1.5">
          {brief.targetUsers.map((u) => (
            <span key={u} className="rounded-full bg-[#e4f1fb] px-2.5 py-1 text-[11px] font-medium text-[#14757d]">
              {u}
            </span>
          ))}
        </div>
      ),
      show: brief.targetUsers.length > 0,
    },
    {
      icon: <UserRound aria-hidden className="size-3.5" />,
      title: t("Use cases"),
      body: (
        <div className="flex flex-col gap-3">
          {brief.useCases.length > 0 && <Bullets items={brief.useCases} />}
          {brief.detailedUseCases.map((u) => (
            <article key={u.id} className="rounded-xl bg-[#f6f9f8] p-3">
              <p className="flex flex-wrap items-center gap-2 text-[12px] font-semibold">
                {u.title}
                <span className="rounded bg-white px-1.5 py-0.5 text-[9px] font-medium text-[#14757d]">{u.actor}</span>
                {u.role && <span className="rounded bg-white px-1.5 py-0.5 text-[9px] font-medium">{t(ROLE_LABEL[u.role] ?? u.role)}</span>}
              </p>
              {u.description && <p className="mt-1 text-[11px]">{u.description}</p>}
              {u.preconditions && (
                <p className="mt-1 text-[11px] text-[#1B2D54]/70">
                  <b className="font-semibold">{t("Before")}:</b> {u.preconditions}
                </p>
              )}
              {lines(u.mainFlow).length > 0 && (
                <div className="mt-2 text-[11px]">
                  <p className="font-semibold">{t("Steps")}</p>
                  <Bullets items={lines(u.mainFlow)} ordered />
                </div>
              )}
              {lines(u.acceptanceCriteria).length > 0 && (
                <div className="mt-2 text-[11px]">
                  <p className="font-semibold">{t("Done when")}</p>
                  <Bullets items={lines(u.acceptanceCriteria)} />
                </div>
              )}
            </article>
          ))}
        </div>
      ),
      show: brief.useCases.length > 0 || brief.detailedUseCases.length > 0,
    },
    {
      icon: <ListChecks aria-hidden className="size-3.5" />,
      title: t("Requirements (user stories)"),
      body: <Bullets items={brief.requirements} ordered />,
      show: brief.requirements.length > 0,
    },
    {
      icon: <Package aria-hidden className="size-3.5" />,
      title: t("Deliverables"),
      body: <Bullets items={brief.deliverables} />,
      show: brief.deliverables.length > 0,
    },
    {
      icon: <ClipboardCheck aria-hidden className="size-3.5" />,
      title: t("Acceptance criteria"),
      body: (
        <ul className="flex flex-col gap-1.5">
          {brief.acceptanceCriteria.map((c, i) => (
            <li key={i} className="flex gap-2">
              <CircleCheck aria-hidden className="mt-0.5 size-3.5 shrink-0 text-[#22a559]" />
              <span>{c}</span>
            </li>
          ))}
        </ul>
      ),
      show: brief.acceptanceCriteria.length > 0,
    },
  ];
  const shown = sections.filter((s) => s.show);
  const me = brief.members.find((m) => m.isMe);
  const handedIn = brief.members.filter((m) => m.submittedUtc).length;

  return (
    <div
      dir={dir}
      className="relative isolate flex min-h-0 min-w-0 w-full flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto bg-[#f6f9f8] px-4 pb-6 pt-24 font-[family-name:var(--font-poppins)] text-[#1B2D54] lg:ps-[calc(var(--sb)+1.5rem)] lg:pe-6"
    >
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[440px] [mask-image:linear-gradient(to_bottom,black_60%,transparent)]">
        <Image src="/images/learner/projects/background.png" alt="" fill priority sizes="100vw" className="object-cover object-top" />
      </div>

      <header className="flex min-w-0 items-center gap-3">
        <Link
          href={`/learner/projects/${encodeURIComponent(brief.squadId)}`}
          aria-label={t("Back to the project")}
          className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#1B2D54]/70 text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12939b]/40"
        >
          <ArrowLeft aria-hidden className="size-4 rtl:rotate-180" />
        </Link>
        <div className="min-w-0">
          <h1 className="text-xl font-bold">{t("Project brief (PRD)")}</h1>
          <p className="truncate text-[11px] text-[#1B2D54]/70">{brief.title}</p>
        </div>
      </header>

      <Card className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
        <ProjectLogo src={brief.logoUrl} title={brief.title} className="size-16 text-2xl" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold">{brief.title}</h2>
            <span className="rounded-full bg-[#dff5e8] px-2 py-0.5 text-[10px] font-medium text-[#22a559]">{t(STATUS_LABEL[brief.status])}</span>
          </div>
          <p className="mt-1 text-[12px] leading-snug text-[#1B2D54]/75">{brief.description}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Chip icon={<Users aria-hidden className="size-3" />}>{t("Squad: {name}", { name: brief.squadName })}</Chip>
            <Chip icon={<Target aria-hidden className="size-3" />}>{t("{level} level", { level: t(brief.level) })}</Chip>
            {brief.teamSize > 0 && <Chip icon={<Users aria-hidden className="size-3" />}>{t("{n} members", { n: brief.teamSize })}</Chip>}
            {brief.durationWeeks ? (
              <Chip icon={<Hourglass aria-hidden className="size-3" />}>{t("{n} weeks", { n: brief.durationWeeks })}</Chip>
            ) : null}
            {brief.dueUtc && <Chip icon={<CalendarClock aria-hidden className="size-3" />}>{t("Due {date}", { date: day(brief.dueUtc) })}</Chip>}
          </div>
          {brief.techStack.length > 0 && (
            <p className="mt-2 text-[11px] text-[#1B2D54]/70">
              <b className="font-semibold">{t("Tech stack")}:</b> {brief.techStack.join(" · ")}
            </p>
          )}
          <CatalogLinks links={brief.links} className="mt-3" />
        </div>
      </Card>

      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <Card className="flex flex-col gap-4">
          {shown.length === 0 ? (
            <p className="text-[12px] text-[#1B2D54]/60">{t("The brief of this project is not written yet. Your monitor will share the details.")}</p>
          ) : (
            shown.map((s, i) => (
              <Section key={s.title} n={i + 1} icon={s.icon} title={s.title}>
                {s.body}
              </Section>
            ))
          )}
        </Card>

        <div className="flex min-w-0 flex-col gap-4">
          <Card>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">{t("Links to submit")}</h2>
              <span className="text-[10px] font-semibold text-[#14757d]">
                {t("{n} of {total} handed in", { n: handedIn, total: brief.members.length })}
              </span>
            </div>
            <p className="mt-1 text-[10px] text-[#1B2D54]/60">{t("Every teammate shares these links before handing in the project.")}</p>
            <ul className="mt-3 flex flex-col gap-2.5">
              {[...brief.members].sort((a, b) => Number(b.isMe) - Number(a.isMe)).map((m) => (
                <MemberLinks key={m.studentId} member={m} />
              ))}
            </ul>
            {me && brief.status === "InProgress" && (
              <Link
                href="/learner/interns/internship"
                className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#14757d] to-[#1B2D54] px-4 py-2 text-[11px] font-semibold text-white shadow-sm hover:opacity-90"
              >
                {t("Add my links")}
              </Link>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function MemberLinks({ member }: { member: BriefMember }) {
  const t = useT();
  const required = member.links.filter((l) => l.required);
  const missing = required.filter((l) => !l.url).length;
  return (
    <li className={cn("rounded-xl p-3", member.isMe ? "bg-[#e9f7f5] ring-1 ring-[#14757d]/20" : "bg-[#f6f9f8]")}>
      <div className="flex items-center gap-2">
        <span className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-[11px] font-bold text-[#14757d]">
          {member.photoUrl ? (
            <Image src={member.photoUrl} alt="" fill sizes="32px" className="object-cover" />
          ) : (
            member.fullName.charAt(0)
          )}
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-[12px] font-semibold">
            {member.fullName} {member.isMe && <span className="text-[10px] font-medium text-[#14757d]">({t("You")})</span>}
          </p>
          <p className="text-[10px] text-[#1B2D54]/60">{t(ROLE_LABEL[member.role] ?? member.role)}</p>
        </div>
        {member.submittedUtc ? (
          <span className="shrink-0 rounded-full bg-[#dff5e8] px-2 py-0.5 text-[9px] font-semibold text-[#22a559]">{t("Handed in")}</span>
        ) : missing > 0 ? (
          <span className="shrink-0 rounded-full bg-[#fdeedb] px-2 py-0.5 text-[9px] font-semibold text-[#e08a1e]">
            {t("{n} missing", { n: missing })}
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-[#e4f1fb] px-2 py-0.5 text-[9px] font-semibold text-[#2f6fc4]">{t("Links ready")}</span>
        )}
      </div>
      <ul className="mt-2 flex flex-col gap-1">
        {member.links.map((l, i) => (
          <li key={`${l.kind}-${i}`} className="flex min-w-0 items-center gap-2 text-[11px]">
            {l.url ? (
              <CircleCheck aria-hidden className="size-3.5 shrink-0 text-[#22a559]" />
            ) : (
              <CircleAlert aria-hidden className="size-3.5 shrink-0 text-[#e08a1e]" />
            )}
            <span className="shrink-0 font-medium">{t(LINK_LABEL[l.kind]?.label ?? l.kind)}</span>
            {l.url ? (
              <a href={l.url} target="_blank" rel="noopener noreferrer" dir="ltr" className="ms-auto inline-flex min-w-0 items-center gap-1 truncate text-[#14757d] hover:underline">
                <span className="truncate">{l.url.replace(/^https?:\/\//, "")}</span>
                <ExternalLink aria-hidden className="size-3 shrink-0" />
              </a>
            ) : (
              <span className="ms-auto text-[10px] text-[#e08a1e]">{t("Not shared yet")}</span>
            )}
          </li>
        ))}
      </ul>
    </li>
  );
}
