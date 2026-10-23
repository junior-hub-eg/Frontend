"use client";

import { getAdminMentors, getAdminSquads, type AdminSquad } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { AdminPage, PageHero } from "./AdminPage";
import { SquadCard } from "./SquadCard";
import { LoadState, useAdminData } from "./admin-data";

export default function AdminSquads() {
  const t = useT();
  const squads = useAdminData(getAdminSquads, tk("We couldn't load the squads. Please try again."));
  const mentors = useAdminData(getAdminMentors, tk("We couldn't load the mentors. Please try again."));
  const active = mentors.data?.mentors.filter((m) => m.isActive) ?? null;

  function replace(updated: AdminSquad) {
    squads.setData((list) => list?.map((s) => (s.id === updated.id ? updated : s)) ?? null);
  }

  const list = squads.data ?? [];
  const featured = list.slice(0, 2); // sit on the hero (about 54% of the width, centered)
  const rest = list.slice(2); // rows of three (about 85% of the width)

  return (
    <AdminPage>
      <PageHero title={t("Squads Management")} contentClassName="pb-0">
        {squads.data ? (
          <div className="relative -mb-[2.8em] mt-[1.4em] grid gap-[1.6em] sm:grid-cols-2 lg:mx-auto lg:w-[66%]">
            {featured.map((s) => (
              <SquadCard key={s.id} squad={s} mentors={active} onChanged={replace} />
            ))}
          </div>
        ) : (
          <LoadState error={squads.error} onRetry={squads.reload} className="pb-[1.5em]" />
        )}
      </PageHero>

      <div className="mx-auto mt-[4.2em] w-full lg:w-[85%]">
        {squads.data && list.length === 0 && <p className="text-center text-[0.9em] text-[#8a97a6]">{t("No squads yet.")}</p>}
        {mentors.error && <LoadState error={mentors.error} onRetry={mentors.reload} className="mb-[1em]" />}
        <div className="grid gap-[1.6em] sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((s) => (
            <SquadCard key={s.id} squad={s} mentors={active} onChanged={replace} />
          ))}
        </div>
      </div>
    </AdminPage>
  );
}
