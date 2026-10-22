"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Circle, ClipboardCheck, ExternalLink, LoaderCircle, MessageSquareWarning, RotateCcw } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { useAuth } from "@/lib/auth/auth-context";
import type { ProjectStatus } from "@/lib/interns-api";
import { getMonitoredSquad, getMonitoredSquads, reviewProject, type MonitoredSquad } from "@/lib/monitor-api";

const STATUS: Record<ProjectStatus["status"], { label: string; className: string }> = {
  InReview: { label: "Waiting for your review", className: "bg-[#fff1d6] text-[#a86a00]" },
  InProgress: { label: "Squad is working", className: "bg-[#e3eefd] text-[#2f6fc4]" },
  Completed: { label: "Completed", className: "bg-[#d8f0df] text-[#1f7a43]" },
};

const ROLE: Record<string, string> = {
  Frontend: "Front-end Developer",
  Backend: "Back-end Developer",
  UIUX: "UI/UX Designer",
  AI: "AI Engineer",
  Testing: "QA Tester",
  Data: "Data Analyst",
  Mobile: "Mobile Developer",
  Gaming: "Game Developer",
};

const when = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Africa/Cairo" });

/** A mentor's account (decision of 21 Oct 2026): the squads they monitor, and reviewing a submitted project. */
export default function MonitorDashboard() {
  const { user } = useAuth();
  const [squads, setSquads] = useState<ProjectStatus[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load(keep?: string) {
    try {
      const list = await getMonitoredSquads();
      setSquads(list);
      setSelected((s) => keep ?? s ?? list[0]?.squadId ?? null);
    } catch (e) {
      setError(errorMessage(e, "We couldn't load your squads. Please try again."));
    }
  }

  useEffect(() => {
    let active = true;
    getMonitoredSquads().then(
      (list) => {
        if (!active) return;
        setSquads(list);
        setSelected(list[0]?.squadId ?? null);
      },
      (e) => active && setError(errorMessage(e, "We couldn't load your squads. Please try again.")),
    );
    return () => {
      active = false;
    };
  }, []);

  const waiting = squads?.filter((s) => s.status === "InReview").length ?? 0;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6 text-[#14365a]" dir="ltr">
      <header>
        <h1 className="text-3xl font-extrabold">Hi {user?.firstName ?? "there"}, your squads</h1>
        <p className="mt-1 text-sm text-[#14365a]/70">
          {squads ? (waiting ? `${waiting} ${waiting === 1 ? "project is" : "projects are"} waiting for your review.` : "No project is waiting for your review.") : "Loading…"}
        </p>
      </header>

      {error && <p role="alert" className="rounded-xl bg-[#fdecec] px-4 py-2 text-sm font-semibold text-[#b83232]">{error}</p>}
      {!squads && !error && <LoaderCircle className="mx-auto my-16 size-8 animate-spin text-[#12939b]" />}
      {squads && squads.length === 0 && (
        <p className="rounded-2xl border border-dashed border-[#cfdcda] bg-white px-5 py-10 text-center text-sm text-[#14365a]/60">
          You don&apos;t monitor a squad yet. When a squad is formed, it may get you as its monitor.
        </p>
      )}

      {squads && squads.length > 0 && (
        <div className="grid items-start gap-5 lg:grid-cols-[18rem_1fr]">
          <ul className="grid gap-2">
            {squads.map((s) => (
              <li key={s.squadId}>
                <button
                  type="button"
                  onClick={() => setSelected(s.squadId)}
                  aria-pressed={s.squadId === selected}
                  className={`w-full rounded-2xl border bg-white p-4 text-start shadow-sm transition-colors ${
                    s.squadId === selected ? "border-[#14365a] ring-2 ring-[#14365a]/10" : "border-[#e3ecea] hover:border-[#12939b]"
                  }`}
                >
                  <span className="block text-sm font-bold">{s.squadName}</span>
                  <span className="block text-xs text-[#14365a]/70">
                    {s.projectTitle} · {s.level}
                  </span>
                  <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${STATUS[s.status].className}`}>
                    {STATUS[s.status].label}
                  </span>
                  {s.status === "InProgress" && (
                    <span className="ms-2 text-[11px] text-[#14365a]/60">
                      {s.submitted}/{s.members} submitted
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>

          {selected && <SquadReview key={selected} squadId={selected} onReviewed={() => load(selected)} />}
        </div>
      )}
    </div>
  );
}

function SquadReview({ squadId, onReviewed }: { squadId: string; onReviewed: () => void }) {
  const [squad, setSquad] = useState<MonitoredSquad | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [sending, setSending] = useState<"Approved" | "ChangesRequested" | null>(null);

  useEffect(() => {
    let active = true;
    getMonitoredSquad(squadId).then(
      (s) => active && setSquad(s),
      (e) => active && setError(errorMessage(e, "We couldn't load this squad.")),
    );
    return () => {
      active = false;
    };
  }, [squadId]);

  async function review(decision: "Approved" | "ChangesRequested") {
    setSending(decision);
    setError(null);
    try {
      await reviewProject(squadId, decision, feedback.trim());
      setFeedback("");
      setSquad(await getMonitoredSquad(squadId));
      onReviewed();
    } catch (e) {
      setError(errorMessage(e, "We couldn't save your review. Please try again."));
    } finally {
      setSending(null);
    }
  }

  if (!squad) return error ? <p className="text-sm text-[#b83232]">{error}</p> : <LoaderCircle className="mx-auto my-16 size-8 animate-spin text-[#12939b]" />;
  const { project } = squad;
  const canReview = project.status === "InReview";

  return (
    <section className="flex flex-col gap-5 rounded-3xl border border-[#e3ecea] bg-white p-6 shadow-sm">
      <div>
        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${STATUS[project.status].className}`}>{STATUS[project.status].label}</span>
        <h2 className="mt-2 text-2xl font-extrabold">{project.projectTitle}</h2>
        <p className="text-sm text-[#14365a]/70">
          {project.squadName} · {project.level} level · {project.submitted}/{project.members} submitted
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[#14365a]/85">{squad.projectDescription}</p>
      </div>

      <ul className="grid gap-3 md:grid-cols-2">
        {squad.members.map((m) => (
          <li key={m.studentId} className="rounded-2xl border border-[#e8eef5] p-4">
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-bold">{m.fullName}</p>
                <p className="text-xs text-[#14365a]/65">{ROLE[m.role] ?? m.role}</p>
              </div>
              {m.submittedUtc ? (
                <span className="flex items-center gap-1 rounded-full bg-[#d8f0df] px-2 py-0.5 text-[11px] font-bold text-[#1f7a43]">
                  <CheckCircle2 className="size-3.5" /> Submitted
                </span>
              ) : (
                <span className="rounded-full bg-[#eef2f7] px-2 py-0.5 text-[11px] font-semibold text-[#14365a]/60">Not submitted</span>
              )}
            </div>
            {m.links.length > 0 ? (
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {m.links.map((l, i) => (
                  <li key={i}>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 rounded-full bg-[#eaf3fb] px-2.5 py-1 text-xs font-semibold hover:bg-[#dbeaf8]"
                    >
                      {l.kind === "LiveSite" ? "Live site" : l.kind === "Api" ? "API" : l.kind === "TestReport" ? "Test report" : l.kind}
                      <ExternalLink className="size-3" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-xs text-[#14365a]/55">No links yet</p>
            )}
            {m.tasks.length > 0 && (
              <ul className="mt-3 grid gap-1 text-xs">
                {m.tasks.map((t, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    {t.status === "Done" ? <CheckCircle2 className="size-3.5 text-[#2fb36b]" /> : <Circle className="size-3.5 text-[#14365a]/30" />}
                    <span className="min-w-0 flex-1 truncate">{t.title}</span>
                    <span className="text-[#14365a]/50">{t.status === "ToDo" ? "To Do" : t.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>

      {project.status !== "Completed" && (
        <div className="rounded-2xl bg-[#f4f8fc] p-4">
          <h3 className="flex items-center gap-2 text-base font-bold">
            <ClipboardCheck className="size-5 text-[#12939b]" /> Your review
          </h3>
          {!canReview && <p className="mt-1 text-xs text-[#14365a]/65">You can review once every member submitted their work.</p>}
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            disabled={!canReview || sending !== null}
            rows={4}
            maxLength={2000}
            placeholder="What went well, and what should the squad change?"
            aria-label="Your review"
            className="mt-3 w-full resize-none rounded-xl border border-[#e1e8f0] bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-[#12939b]/30 disabled:opacity-60"
          />
          {error && <p role="alert" className="mt-2 text-xs font-semibold text-[#b83232]">{error}</p>}
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={!canReview || !feedback.trim() || sending !== null}
              onClick={() => review("Approved")}
              className="flex items-center gap-2 rounded-xl bg-[#14365a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0f2a47] disabled:opacity-50"
            >
              {sending === "Approved" ? <LoaderCircle className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />} Approve: the project is done
            </button>
            <button
              type="button"
              disabled={!canReview || !feedback.trim() || sending !== null}
              onClick={() => review("ChangesRequested")}
              className="flex items-center gap-2 rounded-xl border border-[#f08a00] px-5 py-2.5 text-sm font-semibold text-[#a86a00] hover:bg-[#fff6e8] disabled:opacity-50"
            >
              {sending === "ChangesRequested" ? <LoaderCircle className="size-4 animate-spin" /> : <RotateCcw className="size-4" />} Request changes
            </button>
          </div>
        </div>
      )}

      {project.reviews.length > 0 && (
        <div>
          <h3 className="text-base font-bold">Reviews</h3>
          <ul className="mt-2 grid gap-2">
            {project.reviews.map((r, i) => (
              <li key={i} className={`rounded-xl p-3 text-sm ${r.decision === "Approved" ? "bg-[#e6f6ec]" : "bg-[#fff6e8]"}`}>
                <p className="flex items-center gap-1.5 text-xs font-bold">
                  {r.decision === "Approved" ? <CheckCircle2 className="size-4 text-[#1f9d5b]" /> : <MessageSquareWarning className="size-4 text-[#f08a00]" />}
                  {r.decision === "Approved" ? "Approved" : "Changes requested"} · {when(r.createdUtc)}
                </p>
                <p className="mt-1 leading-relaxed">{r.feedback}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
