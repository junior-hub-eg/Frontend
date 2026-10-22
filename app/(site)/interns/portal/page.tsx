import type { Metadata } from "next";
import { getT } from "@/lib/i18n/server";
import { Suspense } from "react";
import { InternshipsPortal } from "@/components/Interns/InternshipsPortal";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("Internships Portal | Junior Hub"),
    description: t("Available internships with job readiness score and filter sidebar."),
  };
}

export default function InternsPortalPage() {
  return (
    <div className="flex flex-col bg-white">
      <Suspense fallback={null}>
        <InternshipsPortal initialTab="available" />
      </Suspense>
    </div>
  );
}
