"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowRight, Briefcase, ClipboardList, Info, LoaderCircle, MessagesSquare, Trophy } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { getPracticeJobs, type JobList, type PracticeJob } from "@/lib/recruitment-api";
import { ApplicationBadge, Chip, CompanyMark, RecruitmentFrame, SimulationBadge } from "./recruitment-ui";

const STEPS = [
  { icon: Briefcase, title: "Pick a job", text: "Practice jobs at made-up companies" },
  { icon: ClipboardList, title: "Apply", text: "Send your application in one click" },
  { icon: MessagesSquare, title: "Interview", text: "Answer 5 questions, 60% passes" },
  { icon: Trophy, title: "Certificate", text: "Get a practice certificate and XP" },
];

function JobCard({ job }: { job: PracticeJob }) {
  const href = `/learner/recruitment-practice/${job.id}` as Route;
  const action =
    job.myApplication?.status === "InterviewPassed"
      ? "View result"
      : job.myApplication?.status === "InterviewNotPassed"
        ? "Try again"
        : job.myApplication
          ? "Start interview"
          : "View and apply";

  return (
    <article className="relative flex flex-col gap-[0.9em] rounded-[1.4em] border border-[#e3e9f0] bg-white p-[1.2em] transition hover:shadow-lg hover:shadow-[#14365a]/5">
      <div className="flex items-start gap-[0.9em]">
        <CompanyMark name={job.companyName} className="h-[2.6em] w-[2.6em]" />
        <div className="min-w-0 flex-1">
          <h3 className="text-[1.05em] font-bold leading-snug text-[#14365a]">{job.role}</h3>
          <p className="text-[0.85em] text-[#14365a]/70">{job.companyName}</p>
        </div>
        <ApplicationBadge application={job.myApplication} />
      </div>

      <div className="flex flex-wrap gap-[0.4em]">
        <span className="rounded-[0.5em] bg-[#e4f7f4] px-[0.6em] py-[0.3em] text-[0.75em] font-bold text-[#0f7a81]">{job.trackName}</span>
        <span className="rounded-[0.5em] bg-[#d5f2de] px-[0.6em] py-[0.3em] text-[0.75em] font-semibold text-[#1f7a45]">{job.level}</span>
        {job.skills.map((s) => (
          <Chip key={s}>{s}</Chip>
        ))}
      </div>

      <p className="line-clamp-3 text-[0.85em] leading-relaxed text-[#14365a]/85">{job.description}</p>

      <Link
        href={href}
        className="mt-auto flex items-center justify-center gap-[0.4em] rounded-[0.8em] bg-[#14365a] px-[1em] py-[0.7em] text-[0.85em] font-semibold text-white transition hover:bg-[#0f2a47] after:absolute after:inset-0 after:content-['']"
      >
        {action} <ArrowRight className="h-[1.1em] w-[1.1em]" />
      </Link>
    </article>
  );
}

function JobGrid({ jobs }: { jobs: PracticeJob[] }) {
  return (
    <div className="grid gap-[1em] md:grid-cols-2 xl:grid-cols-3">
      {jobs.map((j) => (
        <JobCard key={j.id} job={j} />
      ))}
    </div>
  );
}

/** US-36: Recruitment Practice, the practice jobs with the student's tracks first. Always a simulation (BR-12). */
export default function RecruitmentPracticePage() {
  const [list, setList] = useState<JobList | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getPracticeJobs().then(
      (l) => active && setList(l),
      (e) => active && setError(errorMessage(e, "We couldn't load the practice jobs. Please try again.")),
    );
    return () => {
      active = false;
    };
  }, []);

  const mine = list?.jobs.filter((j) => j.inMyTracks) ?? [];
  const others = list?.jobs.filter((j) => !j.inMyTracks) ?? [];

  return (
    <RecruitmentFrame>
      <section className="flex flex-col gap-[0.6em]">
        <SimulationBadge />
        <h1 className="text-[2.3em] font-extrabold leading-tight text-[#14365a]">Recruitment Practice</h1>
        <p className="max-w-[40em] text-[0.95em] leading-snug text-[#14365a]">
          Practise applying for a job and passing an interview, so you are ready for the real thing one day.
        </p>
        <p className="flex items-center gap-[0.5em] self-start rounded-[0.8em] bg-[#fff6e8] px-[0.9em] py-[0.5em] text-[0.85em] font-semibold text-[#a86a00]">
          <Info className="h-[1.1em] w-[1.1em] shrink-0" /> {list?.disclaimer ?? "Practice only. These are not real jobs."}
        </p>
      </section>

      <ol className="mt-[1.6em] grid gap-[0.8em] sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map(({ icon: Icon, title, text }, i) => (
          <li key={title} className="flex items-center gap-[0.8em] rounded-[1.2em] border border-[#e3e9f0] bg-white p-[0.9em]">
            <span className="grid h-[2.4em] w-[2.4em] shrink-0 place-items-center rounded-full bg-[#e4f7f4] text-[#0f7a81]">
              <Icon className="h-[1.2em] w-[1.2em]" />
            </span>
            <span className="min-w-0">
              <span className="block text-[0.85em] font-bold text-[#14365a]">
                {i + 1}. {title}
              </span>
              <span className="block text-[0.75em] text-[#14365a]/70">{text}</span>
            </span>
          </li>
        ))}
      </ol>

      {error && (
        <p role="alert" className="mt-[1.5em] rounded-[0.9em] bg-[#fdecec] px-[1em] py-[0.7em] text-[0.9em] font-semibold text-[#b83232]">
          {error}
        </p>
      )}
      {!list && !error && <LoaderCircle className="mx-auto my-[4em] h-[2em] w-[2em] animate-spin text-[#12939b]" aria-label="Loading" />}

      {list && mine.length > 0 && (
        <section className="mt-[2em]">
          <h2 className="mb-[0.8em] text-[1.3em] font-extrabold text-[#14365a]">For your tracks</h2>
          <JobGrid jobs={mine} />
        </section>
      )}
      {list && others.length > 0 && (
        <section className="mt-[2em]">
          <h2 className="mb-[0.8em] text-[1.3em] font-extrabold text-[#14365a]">{mine.length > 0 ? "Other tracks" : "Practice jobs"}</h2>
          <JobGrid jobs={others} />
        </section>
      )}
    </RecruitmentFrame>
  );
}
