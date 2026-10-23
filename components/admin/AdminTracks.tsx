"use client";

import { getAdminTracks } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { AdminPage, PageHero } from "./AdminPage";
import { TrackStats } from "./TrackStats";
import { TrackCard } from "./TrackCard";
import { LoadState, useAdminData } from "./admin-data";

export default function AdminTracks() {
  const t = useT();
  const page = useAdminData(getAdminTracks, tk("We couldn't load the tracks. Please try again."));
  const tracks = page.data?.tracks ?? [];
  const firstRow = tracks.slice(0, 3); // sit on the hero
  const rest = tracks.slice(3); // below

  return (
    <AdminPage>
      <PageHero title={t("Track Management")} contentClassName="pb-0">
        <TrackStats stats={page.data?.stats ?? null} className="mt-[1.6em] lg:w-[85%]" />

        {page.data ? (
          <div className="relative -mb-[3.2em] mt-[1.6em] grid gap-[1.4em] sm:grid-cols-2 lg:grid-cols-3">
            {firstRow.map((tr) => (
              <TrackCard key={tr.id} track={tr} />
            ))}
          </div>
        ) : (
          <LoadState error={page.error} onRetry={page.reload} className="pb-[1.5em]" />
        )}
      </PageHero>

      <div className="mx-auto mt-[5em] w-full lg:w-[90%]">
        <div className="grid gap-[1.4em] sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((tr) => (
            <TrackCard key={tr.id} track={tr} />
          ))}
        </div>
      </div>
    </AdminPage>
  );
}
