"use client";

import Link from "next/link";
import type { Route } from "next";
import { ArrowRight, Bell, CalendarDays, CheckCircle2, ChevronRight, Clock, MessageSquare, ShieldCheck, Star, User, Users } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useT } from "@/lib/i18n/client";
import { getMonitorConversations, getMonitorHome } from "@/lib/monitor-api";
import { tk } from "@/lib/i18n/translate";
import { Avatar, Card, Eyebrow, Pill, ghostBtn, primaryBtn } from "./mentor-ui";
import { LoadState, initialsOf, sessionDate, sessionTime, shortTime, useMentorData } from "./mentor-data";

const loadHome = () => Promise.all([getMonitorHome(), getMonitorConversations()]);
const SESSION_TYPE: Record<string, string> = { OneToOne: tk("1:1 session"), Group: tk("Group session") };

export default function MentorHome() {
  const t = useT();
  const { user } = useAuth();
  const { data, error, reload } = useMentorData(loadHome, tk("Could not load your dashboard."));

  if (!data) return <LoadState error={error} onRetry={reload} />;
  const [home, conversations] = data;
  const upcoming = home.nextSessions;
  const unread = conversations.filter((c) => c.unread > 0);

  const stats = [
    { icon: CalendarDays, label: t("Upcoming sessions"), value: String(home.upcomingSessionsWeek), hint: t("{n} today", { n: home.upcomingSessionsToday }) },
    { icon: Users, label: t("Assigned students"), value: String(home.totalStudents), hint: t("Assigned to you") },
    { icon: Bell, label: t("Pending actions"), value: String(home.pendingReviews), hint: t("Session follow-up") },
    { icon: Star, label: t("Student rating"), value: home.overallRating.toFixed(1), hint: t("Out of 5") },
  ];

  const quick = [
    { icon: CalendarDays, label: t("Manage Availability"), href: "/mentor/availability" },
    { icon: User, label: t("Edit Profile"), href: "/mentor/profile" },
    { icon: Star, label: t("View Feedback"), href: "/mentor/feedback" },
    { icon: MessageSquare, label: t("Open Messages"), href: "/mentor/messages" },
  ];

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>{t("Dashboard")}</Eyebrow>
          <h1 className="mt-1 text-3xl font-bold">{t("Good morning, {name}.", { name: user?.firstName ?? "" })}</h1>
          <p className="mt-1 text-sm text-[#14305a]/65">{t("Here is what is happening across your mentorship workspace today.")}</p>
        </div>
        <Link href={"/mentor/availability" as Route} className={primaryBtn}>
          <CalendarDays className="size-4" /> {t("Manage Availability")}
        </Link>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <span className="grid size-8 place-items-center rounded-lg bg-[#e3f4f1] text-[#0f8f8c]">
              <s.icon className="size-4" />
            </span>
            <p className="mt-3 text-xs text-[#14305a]/60">{s.label}</p>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-[0.7rem] text-[#14305a]/50">{s.hint}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
        <div className="flex flex-col gap-4">
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <Eyebrow>{t("Your schedule")}</Eyebrow>
                <h2 className="text-lg font-bold">{t("Upcoming sessions")}</h2>
              </div>
              <Link href={"/mentor/sessions" as Route} className="flex items-center gap-1 text-xs font-semibold text-[#0f8f8c]">
                {t("View All Sessions")} <ArrowRight className="size-3.5 rtl:rotate-180" />
              </Link>
            </div>
            {upcoming.length === 0 && <p className="py-8 text-center text-sm text-[#14305a]/60">{t("No upcoming sessions")}</p>}
            <ul className="mt-3 divide-y divide-[#e6efed]">
              {upcoming.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center gap-4 py-3">
                  <Avatar initials={initialsOf(s.studentName)} />
                  <div className="min-w-[8rem] flex-1">
                    <p className="text-sm font-semibold">{s.studentName}</p>
                    <p className="text-xs text-[#14305a]/60">{t(SESSION_TYPE[s.type] ?? s.type)}</p>
                  </div>
                  <div className="text-xs text-[#14305a]/70">
                    <p className="flex items-center gap-1.5"><CalendarDays className="size-3.5 text-[#0f8f8c]" /> {sessionDate(s.startsUtc)}</p>
                    <p className="mt-1 flex items-center gap-1.5"><Clock className="size-3.5 text-[#0f8f8c]" /> {sessionTime(s.startsUtc, s.durationMinutes)}</p>
                  </div>
                  <Pill>{t("Upcoming")}</Pill>
                  <Link href={`/mentor/sessions/${s.id}` as Route} className={`${ghostBtn} !px-3 !py-1.5 text-xs`}>{t("View Details")}</Link>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <div className="flex items-start justify-between">
              <div>
                <Eyebrow>{t("Recent activity")}</Eyebrow>
                <h2 className="text-lg font-bold">{t("Student progress")}</h2>
              </div>
              <Link href={"/mentor/messages" as Route} className="flex items-center gap-1 text-xs font-semibold text-[#0f8f8c]">
                {t("Open Messages")} <ArrowRight className="size-3.5 rtl:rotate-180" />
              </Link>
            </div>
            {home.recentActivity.length === 0 && <p className="py-8 text-center text-sm text-[#14305a]/60">{t("No activity from your students this week.")}</p>}
            <ul className="mt-3 divide-y divide-[#e6efed]">
              {home.recentActivity.slice(0, 6).map((a, i) => (
                <li key={`${a.studentId}-${a.occurredUtc}-${i}`}>
                  <Link href={`/mentor/students/${a.studentId}` as Route} className="flex items-center gap-3 py-3">
                    <Avatar initials={initialsOf(a.studentName)} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">{a.detail ?? a.eventType}</span>
                      <span className="block text-xs text-[#14305a]/60">{a.studentName} - {shortTime(a.occurredUtc)}</span>
                    </span>
                    <CheckCircle2 className="size-4 text-[#0f8f8c]" />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <Eyebrow>{t("Attention")}</Eyebrow>
                <h2 className="text-lg font-bold">{t("Needs a quick look")}</h2>
              </div>
              <Pill tone="navy">{t("Needs attention")}</Pill>
            </div>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href={"/mentor/messages" as Route} className="flex items-center gap-3 rounded-xl bg-[#f2faf8] p-3">
                  <MessageSquare className="size-4 text-[#0f8f8c]" />
                  <span className="min-w-0 flex-1 text-xs">
                    <span className="block font-semibold">{t("{n} unread messages", { n: home.unreadMessages })}</span>
                    {unread.length > 0 && <span className="block text-[#14305a]/60">{unread.map((c) => c.partnerName.split(" ")[0]).join(" & ")} {t("are waiting for a reply")}</span>}
                  </span>
                  <ChevronRight className="size-4 rtl:rotate-180" />
                </Link>
              </li>
              <li className="flex items-center gap-3 rounded-xl bg-[#f2faf8] p-3">
                <ShieldCheck className="size-4 text-[#0f8f8c]" />
                <span className="text-xs">
                  <span className="block font-semibold">{t("No open disputes")}</span>
                  <span className="block text-[#14305a]/60">{t("There are no sessions issues to review")}</span>
                </span>
              </li>
              <li>
                <Link href={"/mentor/squads" as Route} className="flex items-center gap-3 rounded-xl bg-[#f2faf8] p-3">
                  <Users className="size-4 text-[#0f8f8c]" />
                  <span className="min-w-0 flex-1 text-xs">
                    <span className="block font-semibold">{t("Squad projects")}</span>
                    <span className="block text-[#14305a]/60">{t("Review the projects of the squads you monitor")}</span>
                  </span>
                  <ChevronRight className="size-4 rtl:rotate-180" />
                </Link>
              </li>
            </ul>
          </Card>

          <Card>
            <Eyebrow>{t("Shortcuts")}</Eyebrow>
            <h2 className="text-lg font-bold">{t("Quick actions")}</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {quick.map((q) => (
                <Link key={q.href} href={q.href as Route} className="flex items-center gap-2 rounded-xl bg-[#e9f7f4] p-3 text-xs font-semibold hover:bg-[#dcf1ec]">
                  <q.icon className="size-4 shrink-0 text-[#0f8f8c]" />
                  <span className="min-w-0 flex-1">{q.label}</span>
                  <ChevronRight className="size-3.5 rtl:rotate-180" />
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
