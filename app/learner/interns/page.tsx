import { LearnerShell } from "@/components/learner/learner-shell";
import InternDashboard from "@/components/learner/InternDashboard";

export default function LearnerPreviewPage() {
  return (
    <LearnerShell
      userName="Mohammed Yasser"
      userEmail="mohammed@example.com"
      userAvatar="/images/Intern/char-boy-glasses.png"
      activeHref="/learner/dashboard"
    >
      <InternDashboard firstName="Mohammed" />
    </LearnerShell>
  );
}