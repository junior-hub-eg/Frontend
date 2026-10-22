import type { Metadata } from "next";
import { getT } from "@/lib/i18n/server";
import { Suspense } from "react";
import { InternshipsPortal } from "@/components/Interns/InternshipsPortal";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("My Applications | Junior Hub"),
    description: t("Track your internship applications and interview stages."),
  };
}

export default function MyApplicationsPage() {
  return (
    <div className="flex flex-col bg-white">
      <Suspense fallback={null}>
        <InternshipsPortal initialTab="applications" />
      </Suspense>
    </div>
  );
}
