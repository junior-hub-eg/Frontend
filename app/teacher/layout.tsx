import { RoleLayout } from "@/components/layout/role-layout";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return <RoleLayout role="teacher">{children}</RoleLayout>;
}
