import type { Route } from "next";
import {
  FileCheck,
  FileText,
  FolderOpen,
  Globe,
  LayoutDashboard,
  Settings,
  Target,
  type LucideIcon,
} from "lucide-react";

export interface LearnerNavItem {
  label: string;
  href: Route;
  icon: LucideIcon;
}

/** Group 1 (top of the sidebar). Courses / Mentorship / Internship open from the scene. */
export const LEARNER_NAV_MAIN: LearnerNavItem[] = [
  { label: "Dashboard", href: "/learner/dashboard" as Route, icon: LayoutDashboard },
  { label: "AI Curriculum", href: "/learner/ai-interview" as Route, icon: Globe },
  { label: "Recruitment Practice", href: "/learner/recruitment-practice" as Route, icon: FileText },
];

/** Group 2 (below the divider in the Figma). */
export const LEARNER_NAV_SECONDARY: LearnerNavItem[] = [
  { label: "My Projects", href: "/learner/projects" as Route, icon: FolderOpen },
  { label: "Progress", href: "/learner/progress" as Route, icon: Target },
  { label: "Certification", href: "/learner/certification" as Route, icon: FileCheck },
  { label: "Settings", href: "/learner/profile" as Route, icon: Settings },
];