"use client";

import { useMemo, useState } from "react";
import { BadgeCheck, CheckCheck, ClipboardList, LoaderCircle, SlidersHorizontal, UserCheck, UsersRound } from "lucide-react";

import { APPROVALS_CHANGED, approveSignup, getApprovals, rejectSignup, type AdminApproval } from "@/lib/admin-api";
import { errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { AdminDialog } from "./AdminPageFrame";
import { LoadState, useAdminData } from "./admin-data";
import ApprovalInspector from "./approvals/ApprovalInspector";
import ApprovalQueue from "./approvals/ApprovalQueue";
import ApprovalTabs from "./approvals/ApprovalTabs";
import ResolutionVelocity from "./approvals/ResolutionVelocity";
import { MOCK_APPROVAL_ITEMS } from "./approvals/approvalsMock";
import type { ApprovalTab, Priority, QueueItem } from "./approvals/types";
import { AdminSurface } from "./page-parts";
import StatTile from "./StatTile";

const PAGE_SIZE = 5;

const SUBJECT_LABEL: Record<AdminApproval["subjects"][number], string> = {
  Math: tk("Mathematics"),
  Science: tk("Science"),
  Physics: tk("Physics"),
  Language: tk("Language"),
};

const RANK: Record<Priority, number> = { urgent: 0, medium: 1, normal: 2 };

type T = ReturnType<typeof useT>;

function ago(iso: string) {
  const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));

  if (mins < 60) return `${mins}m ago`;

  const hours = Math.round(mins / 60);

  if (hours < 48) return `${hours}h ago`;

  return `${Math.round(hours / 24)}d ago`;
}

/** A real mentor / teacher sign-up becomes one row of the queue. */
function signupToItem(a: AdminApproval, t: T): QueueItem {
  const isMentor = a.role === "Mentor";

  return {
    id: a.id,
    source: "api",
    kind: "signup",
    priority: "normal",
    name: a.fullName,
    subtitle: isMentor ? t("Mentor Applicant") : t("Teacher Applicant"),
    note: a.phone ? `${a.email} · ${a.phone}` : a.email,
    typeLabel: isMentor ? t("Mentor Onboarding") : t("Teacher Onboarding"),
    context: (isMentor ? a.trackName : a.schoolName) ?? "—",
    submitted: ago(a.createdUtc),
    sla: t("Under Initial Review"),
    primaryLabel: t("Approve"),
    inspector: {
      ticket: `#SU-${a.id.replace(/-/g, "").slice(0, 4).toUpperCase()}`,
      idLabel: a.email,
      chips: [isMentor ? t("Monitor / Mentor") : t("Teacher")],
      cards: isMentor
        ? [
            { label: "Track", value: a.trackName ? t(a.trackName) : "—" },
            { label: "Job title", value: a.title ?? "—" },
            { label: "Experience", value: t("{count} years", { count: a.yearsOfExperience ?? 0 }) },
          ]
        : [
            { label: "School", value: a.schoolName ?? "—" },
            { label: "Subjects", value: a.subjects.map((s) => t(SUBJECT_LABEL[s])).join(" · ") || "—" },
            { label: "Grades", value: a.grades.join(", ") || "—" },
          ],
      approveLabel: t("Approve & Notify"),
    },
  };
}

/** Monitors and teachers who signed up wait here until the admin approves or rejects them (real API).
 *  The other request types are mock data for now (see approvals/approvalsMock.ts). */
export default function AdminApprovals() {
  const t = useT();
  const approvals = useAdminData(getApprovals, tk("We couldn't load the sign-ups. Please try again."));

  const [tab, setTab] = useState<ApprovalTab>("all");
  const [priority, setPriority] = useState<Priority | "all">("all");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [resolved, setResolved] = useState<Set<string>>(new Set()); // mock rows that were handled
  const [busyId, setBusyId] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [declining, setDeclining] = useState<QueueItem | null>(null);
  const [reason, setReason] = useState("");

  const queue = useMemo(() => {
    const api = (approvals.data ?? []).map((a) => signupToItem(a, t));
    const mock = MOCK_APPROVAL_ITEMS.filter((m) => !resolved.has(m.id));

    return [...api, ...mock].sort((a, b) => RANK[a.priority] - RANK[b.priority]);
  }, [approvals.data, resolved, t]);

  // Everything except the tab: the tab counts are computed on this.
  const base = useMemo(() => (priority === "all" ? queue : queue.filter((r) => r.priority === priority)), [queue, priority]);

  const counts = useMemo<Record<ApprovalTab, number>>(
    () => ({
      all: base.length,
      squad: base.filter((r) => r.kind === "squad").length,
      session: base.filter((r) => r.kind === "session").length,
      milestone: base.filter((r) => r.kind === "milestone").length,
      certificate: base.filter((r) => r.kind === "certificate").length,
      signup: base.filter((r) => r.kind === "signup").length,
    }),
    [base],
  );

  const filtered = useMemo(() => (tab === "all" ? base : base.filter((r) => r.kind === tab)), [base, tab]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const selected = queue.find((r) => r.id === selectedId) ?? pageRows[0] ?? null;
  const selectedCount = queue.filter((r) => checked.has(r.id)).length;

  const urgent = queue.filter((r) => r.priority === "urgent").length;

  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev);

      if (next.has(id)) next.delete(id);
      else next.add(id);

      return next;
    });

  const toggleVisible = () =>
    setChecked((prev) => {
      const next = new Set(prev);
      const all = pageRows.every((r) => next.has(r.id));

      for (const r of pageRows) {
        if (all) next.delete(r.id);
        else next.add(r.id);
      }

      return next;
    });

  function dropSignup(id: string) {
    approvals.setData((list) => list?.filter((a) => a.id !== id) ?? null);
    window.dispatchEvent(new Event(APPROVALS_CHANGED)); // the sidebar count
  }

  const fail = (e: unknown) => setError(errorMessage(e, tk("We couldn't save the change. Please try again.")));

  /** Returns true when the request was approved. */
  async function approveOne(item: QueueItem) {
    try {
      if (item.source === "api") {
        await approveSignup(item.id);
        dropSignup(item.id);
      } else {
        // TODO(api): squad / session / milestone / certificate approvals.
        setResolved((prev) => new Set(prev).add(item.id));
      }

      return true;
    } catch (e) {
      fail(e);

      return false;
    }
  }

  async function approve(item: QueueItem) {
    setBusyId(item.id);
    setError(null);
    setDone(null);

    if (await approveOne(item)) {
      setDone(
        item.source === "api"
          ? t("{name} is approved and can sign in now.", { name: item.name })
          : t("Approved: {name}", { name: item.name }),
      );
    }

    setBusyId(null);
  }

  async function bulkApprove() {
    const targets = queue.filter((r) => checked.has(r.id));

    if (targets.length === 0) return;

    setBusyId("bulk");
    setError(null);
    setDone(null);

    let ok = 0;

    for (const item of targets) {
      if (await approveOne(item)) ok++;
    }

    setChecked(new Set());
    setDone(t("{count} requests approved.", { count: ok }));
    setBusyId(null);
  }

  const openDecline = (item: QueueItem) => {
    setReason("");
    setError(null);
    setDeclining(item);
  };

  async function confirmDecline() {
    const item = declining;

    if (!item) return;

    setBusyId(item.id);
    setError(null);

    try {
      if (item.source === "api") {
        await rejectSignup(item.id, reason.trim());
        dropSignup(item.id);
      } else {
        // TODO(api): decline for the other request types.
        setResolved((prev) => new Set(prev).add(item.id));
      }

      setDone(t("{name} was rejected.", { name: item.name }));
      setDeclining(null);
    } catch (e) {
      fail(e);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AdminSurface>
      <div className="space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-[#dff3f9] px-3 py-1 text-[0.66rem] font-bold uppercase tracking-wider text-[#0a7f99]">
              <span className="size-1.5 rounded-full bg-[#06b6d4]" />
              {t("Live Queue Monitor")}
            </p>
            <h1 className="mt-2 text-[1.9rem] font-extrabold leading-tight text-[#0d2a45]">
              {t("Pending Requests & Approvals")}
            </h1>
            <p className="mt-1 max-w-xl text-[0.85rem] text-[#14365a]/70">
              {t(
                "Review, verify, and resolve administrative requests, squad join applications, mentor allocations, and capstone approvals across active cohorts.",
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* TODO(api): approval policies screen does not exist yet. */}
            <button
              type="button"
              disabled
              title={t("Coming soon")}
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[0.78rem] font-semibold text-[#14365a] shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              <SlidersHorizontal className="size-4 text-[#12676b]" /> {t("Approval Policies")}
            </button>

            <button
              type="button"
              onClick={bulkApprove}
              disabled={selectedCount === 0 || busyId !== null}
              className="flex items-center gap-2 rounded-xl bg-[#06b6d4] px-4 py-2.5 text-[0.78rem] font-semibold text-white shadow-sm hover:bg-[#0597b1] disabled:opacity-50"
            >
              {busyId === "bulk" ? <LoaderCircle className="size-4 animate-spin" /> : <CheckCheck className="size-4" />}
              {t("Bulk Approve Selected")}
              <span className="rounded-full bg-white/25 px-2 py-0.5 text-[0.66rem] font-bold">{selectedCount}</span>
            </button>
          </div>
        </header>

        {done && (
          <p role="status" className="rounded-xl bg-[#d7efe6] px-4 py-2.5 text-[0.82rem] font-semibold text-[#12676b]">
            {done}
          </p>
        )}

        {error && !declining && (
          <p role="alert" className="rounded-xl bg-[#fdecec] px-4 py-2.5 text-[0.82rem] font-semibold text-[#b83232]">
            {error}
          </p>
        )}

        <section aria-label={t("Queue statistics")} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            label={t("Total Pending")}
            icon={<ClipboardList className="size-4" />}
            value={String(queue.length)}
            badge={`${urgent} ${t("Urgent")}`}
            badgeClass="bg-[#ffe1e4] text-[#c0263f]"
            hint={t("Requires immediate triage")}
          />
          <StatTile
            label={t("Student Requests")}
            icon={<UsersRound className="size-4" />}
            value={String(counts.squad).padStart(2, "0")}
            badge={t("in review")}
            badgeClass="bg-[#e8eef4] text-[#14365a]/70"
            hint={t("Squad joins & track transfers")}
          />
          <StatTile
            label={t("Mentor Allocations")}
            icon={<UserCheck className="size-4" />}
            value={String(counts.session).padStart(2, "0")}
            badge={t("Slots Open")}
            badgeClass="bg-[#e3e9ff] text-[#3b3fb0]"
            hint={t("Coaching session requests")}
          />
          <StatTile
            label={t("Project Sign-offs")}
            icon={<BadgeCheck className="size-4" />}
            value={String(counts.milestone).padStart(2, "0")}
            badge={t("Milestone")}
            badgeClass="bg-[#e3e9ff] text-[#3b3fb0]"
            hint={t("Capstone sprint transitions")}
          />
        </section>

        <ApprovalTabs
          tab={tab}
          onTab={(v) => {
            setTab(v);
            setPage(1);
          }}
          counts={counts}
        />

        {/* While the sign-ups load (or fail) the mock rows are already shown. */}
        {!approvals.data && <LoadState error={approvals.error} onRetry={approvals.reload} />}

        <div className="grid items-start gap-5 2xl:grid-cols-[minmax(0,1fr)_26rem]">
          <div className="min-w-0">
            <ApprovalQueue
              rows={pageRows}
              total={filtered.length}
              page={safePage}
              pageSize={PAGE_SIZE}
              onPage={(p) => setPage(Math.min(Math.max(1, p), pageCount))}
              selectedId={selected?.id ?? null}
              onSelect={setSelectedId}
              checked={checked}
              onToggle={toggle}
              onToggleVisible={toggleVisible}
              selectedCount={selectedCount}
              priority={priority}
              onPriority={(v) => {
                setPriority(v);
                setPage(1);
              }}
              onRefresh={approvals.reload}
              busyId={busyId}
              onApprove={approve}
              onDecline={openDecline}
            />
          </div>

          <div className="min-w-0 space-y-5">
            <ApprovalInspector
              item={selected}
              busy={!!selected && busyId === selected.id}
              locked={busyId !== null}
              onApprove={approve}
              onDecline={openDecline}
            />
            <ResolutionVelocity />
          </div>
        </div>
      </div>

      <AdminDialog open={!!declining} title="Decline request" onClose={() => setDeclining(null)}>
        <div className="space-y-3 text-sm">
          <p className="text-[0.8rem]">
            {declining ? t("Decline the request from {name}?", { name: declining.name }) : null}
          </p>

          <label className="grid gap-1 text-[0.8rem]">
            <span className="font-semibold">
              {declining?.source === "api" ? t("Reason (optional, sent by email)") : t("Reason (optional)")}
            </span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
              rows={3}
              className="rounded-lg border border-[#d5dee8] px-3 py-2 outline-none focus:border-[#06b6d4]"
            />
          </label>

          {error && (
            <p role="alert" className="text-[0.75rem] font-medium text-[#b83232]">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setDeclining(null)}
              className="rounded-lg border border-[#cfe0ee] px-4 py-2 text-[0.75rem] font-semibold hover:bg-[#eef4fa]"
            >
              {t("Cancel")}
            </button>
            <button
              type="button"
              onClick={confirmDecline}
              disabled={busyId !== null}
              className="inline-flex items-center gap-2 rounded-lg bg-[#b83232] px-4 py-2 text-[0.75rem] font-semibold text-white disabled:opacity-50"
            >
              {busyId !== null && <LoaderCircle className="size-3.5 animate-spin" />}
              {t("Decline")}
            </button>
          </div>
        </div>
      </AdminDialog>
    </AdminSurface>
  );
}