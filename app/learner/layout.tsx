import type { ReactNode } from "react";
import { LearnerLayoutClient } from "@/components/learner/LearnerLayoutClient";

export default function LearnerLayout({ children }: { children: ReactNode }) {
  return <LearnerLayoutClient>{children}</LearnerLayoutClient>;
}