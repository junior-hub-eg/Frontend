import { RoleLayout } from "@/components/layout/role-layout";

export default function GuardianLayout({ children }: { children: React.ReactNode }) {
  return <RoleLayout role="guardian">{children}</RoleLayout>;
}
