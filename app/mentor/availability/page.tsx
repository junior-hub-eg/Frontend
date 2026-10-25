import { redirect } from "next/navigation";

/** Availability is a tab of the calendar since the design of 26 Oct 2026. */
export default function MentorAvailabilityPage() {
  redirect("/mentor/calendar?tab=availability");
}
