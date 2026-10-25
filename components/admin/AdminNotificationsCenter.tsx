"use client";

import { useState } from "react";
import { Bell, CalendarClock, CircleCheck, History, Plus, TriangleAlert } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { BTN_PRIMARY, BTN_SECONDARY, AdminSurface, PageHeader, StatCard, StatGrid } from "./page-parts";
import { MOCK_BROADCASTS, MOCK_NOTIF_STATS as S } from "./dashboardMock";
import { NotificationFilters, type NotifTab } from "./notifications/NotificationFilters";
import { BroadcastTable } from "./notifications/BroadcastTable";
import { QuickComposer } from "./notifications/QuickComposer";
import { AudienceEngagement } from "./notifications/AudienceEngagement";

// TODO(api): replace the mock with the broadcast API. (Your own inbox stays in NotificationsPage.tsx.)
export default function AdminNotificationsCenter() {
  const t = useT();
  const [tab, setTab] = useState<NotifTab>("all");
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const items = MOCK_BROADCASTS.filter(
    (b) =>
      (tab === "all" || (tab === "sent" && b.status === "delivered") || (tab === "scheduled" && b.status === "scheduled") || (tab === "drafts" && b.status === "draft")) &&
      (!q || [b.title, b.meta, b.audience].some((s) => s.toLowerCase().includes(q))),
  );

  return (
    <AdminSurface>
      <PageHeader
        eyebrow={t("Broadcast Operations • Multi-channel relay")}
        title={t("Notifications Center")}
        description={t("Compose, broadcast, and schedule targeted system alerts, sprint reminders, and platform updates across students, squads, and mentors.")}
        actions={
          <>
            <button type="button" className={BTN_SECONDARY}><History className="size-[1em]" /> {t("Broadcast History")}</button>
            <button type="button" className={BTN_PRIMARY}><Plus className="size-[1em]" /> {t("Compose Notification")}</button>
          </>
        }
      />

      <StatGrid>
        <StatCard label={t("Total Notifications")} icon={Bell} value={S.total.toLocaleString()} badge="+18%" hint={t("vs last cohort")} />
        <StatCard label={t("Scheduled")} icon={CalendarClock} tone="violet" value={S.scheduled} hint={t("pending release")} />
        <StatCard label={t("Sent / Delivered")} icon={CircleCheck} tone="green" value={S.sent.toLocaleString()} badge="98.6%" hint={t("delivery rate")} />
        <StatCard label={t("Failed Deliveries")} icon={TriangleAlert} tone="red" value={S.failed} badge={t("Requires retry")} badgeTone="down" hint={t("bounce & push drops")} />
      </StatGrid>

      <div className="grid items-start gap-[1.2em] xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="grid min-w-0 gap-[1em]">
          <NotificationFilters tab={tab} onTab={setTab} query={query} onQuery={setQuery} onReset={() => { setTab("all"); setQuery(""); }} />
          <BroadcastTable items={items} />
        </div>
        <div className="grid min-w-0 gap-[1.2em]">
          <QuickComposer />
          <AudienceEngagement />
        </div>
      </div>
    </AdminSurface>
  );
}