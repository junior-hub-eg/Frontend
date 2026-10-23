import { MentorShell } from "@/components/mentor/MentorShell";

export default function MentorLayout({ children }: { children: React.ReactNode }) {
  return <MentorShell>{children}</MentorShell>;
}
