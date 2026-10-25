import { Suspense } from "react";
import SquadDetail from "@/components/mentor/area/SquadDetail";

/** M3 · Squad detail (design of 26 Oct 2026). */
export default async function MentorSquadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense>
      <SquadDetail id={id} />
    </Suspense>
  );
}
