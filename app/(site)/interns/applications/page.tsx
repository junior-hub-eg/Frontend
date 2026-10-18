import type { Metadata } from "next";
import { Suspense } from "react";
import { InternshipsPortal } from "@/components/Interns/InternshipsPortal";

export const metadata: Metadata = {
  title: "My Applications | Junior Hub",
  description: "Track your internship applications and interview stages.",
};

export default function MyApplicationsPage() {
  return (
    <div className="flex flex-col bg-white">
      <Suspense fallback={<div className="py-12 text-center text-sm">Loading applications...</div>}>
        <InternshipsPortal initialTab="applications" />
      </Suspense>
    </div>
  );
}
