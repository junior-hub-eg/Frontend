import InternshipGate from "@/components/learner/InternshipGate";

/** Students without a squad join one first; everyone else sees the squad's Internship Progress. */
export default function InternshipPage() {
  return <InternshipGate />;
}
