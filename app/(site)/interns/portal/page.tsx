import type { Metadata } from "next";
import { Suspense } from "react";
import { InternshipsPortal } from "@/components/Interns/InternshipsPortal";

export const metadata: Metadata = {
  title: "Internships Portal | Junior Hub",
  description: "Available internships with job readiness score and filter sidebar.",
};

export default function InternsPortalPage() {
  return (
    <div className="flex flex-col bg-white">
      <Suspense fallback={<div className="py-12 text-center text-sm">Loading portal...</div>}>
        <InternshipsPortal initialTab="available" />
      </Suspense>
    </div>
  );
}
