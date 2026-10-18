import { redirect } from "next/navigation";

/** The dashboard moved to /learner/dashboard, where students land after signing in. */
export default function InternDashboardPage() {
  redirect("/learner/dashboard");
}
