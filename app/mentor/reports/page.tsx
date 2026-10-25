import { Suspense } from "react";
import Reports from "@/components/mentor/area/Reports";

/** M8 · Reports (design of 26 Oct 2026); ?report=1 opens "Report to Admin", ?report={id} shows that report's reply. */
export default function MentorReportsPage() {
  return (
    <Suspense>
      <Reports />
    </Suspense>
  );
}
