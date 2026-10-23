"use client";

import { getAdminMentors } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { AdminPage, PageHero } from "./AdminPage";
import { MentorStats } from "./MentorStats";
import { MentorsTable } from "./MentorsTable";
import { LoadState, useAdminData } from "./admin-data";

export default function AdminMentors() {
  const t = useT();
  const page = useAdminData(getAdminMentors, tk("We couldn't load the mentors. Please try again."));

  return (
    <AdminPage>
      {/* The hero is taller at the bottom so the table card can sit on top of it */}
      <PageHero title={t("Mentors Management")} contentClassName="pb-[7em]">
        <MentorStats stats={page.data?.stats ?? null} className="mt-[1.6em]" />
      </PageHero>

      <div className="relative z-10 mx-auto -mt-[5.5em] w-full lg:w-[80%]">
        {page.data ? (
          <MentorsTable mentors={page.data.mentors} />
        ) : (
          <div className="rounded-[1.1em] bg-white p-[1.2em] shadow-[0_6px_22px_rgba(20,54,90,0.1)]">
            <LoadState error={page.error} onRetry={page.reload} />
          </div>
        )}
      </div>
    </AdminPage>
  );
}
