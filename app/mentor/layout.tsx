import { RoleLayout } from "@/components/layout/role-layout";

export default function MentorLayout({ children }: { children: React.ReactNode }) {
  return <RoleLayout role="mentor">{children}</RoleLayout>;
}
