import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { InternshipsPortal } from "@/components/Interns/InternshipsPortal";

export const metadata: Metadata = {
  title: "My Applications | Junior Hub",
  description: "Track your internship applications and interview stages.",
};

export default function MyApplicationsPage() {
  return (
    <div className="flex flex-col bg-white">
      {/* Top Breadcrumb */}
      <div className="border-b border-black/5 bg-slate-50 px-6 py-2.5">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-xs">
          <Link
            href="/interns"
            className="inline-flex items-center gap-1.5 font-semibold text-[#12939b] hover:underline"
          >
            <ArrowLeft size={13} />
            <span>العودة للصفحة الأولى (Landing Page)</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#1b2a5c]">الصفحة 3: My Applications</span>
          </div>
        </div>
      </div>

      <Suspense fallback={<div className="py-12 text-center text-sm">Loading applications...</div>}>
        <InternshipsPortal initialTab="applications" />
      </Suspense>
    </div>
  );
}
