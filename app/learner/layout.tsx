import { RoleLayout } from "@/components/layout/role-layout";

export default function LearnerLayout({ children }: { children: React.ReactNode }) {
  return <RoleLayout role="learner">{children}</RoleLayout>;
}
