import { Suspense } from "react";
import Calendar from "@/components/mentor/area/Calendar";

/** M6 · Calendar and Availability (design of 26 Oct 2026). */
export default function MentorCalendarPage() {
  return (
    <Suspense>
      <Calendar />
    </Suspense>
  );
}
