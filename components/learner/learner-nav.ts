import type { Route } from "next";
import {
  Brain,
  ChartPie,
  FileBadge,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface LearnerNavItem {
  label: string;
  href: Route;
  icon: LucideIcon;
  /** Other paths that also mark this item as active. */
  matches?: string[];
}

/** Group 1 (top of the sidebar). Courses / Mentorship / Internship open from the scene. */
export const LEARNER_NAV_MAIN: LearnerNavItem[] = [
  {
    label: "Dashboard",
    href: "/learner/dashboard" as Route,
    icon: LayoutDashboard,
    matches: ["/learner/interns"],
  },
  { label: "AI Curriculum", href: "/learner/ai-curriculum" as Route, icon: Brain },
  { label: "Recruitment Practice", href: "/learner/recruitment-practice" as Route, icon: FileText },
];

/** Group 2 (below the divider in the Figma). */
export const LEARNER_NAV_SECONDARY: LearnerNavItem[] = [
  { label: "My Projects", href: "/learner/projects" as Route, icon: FolderOpen },
  { label: "Progress", href: "/learner/progress" as Route, icon: ChartPie },
  { label: "Certification", href: "/learner/certification" as Route, icon: FileBadge },
  { label: "Settings", href: "/learner/profile" as Route, icon: Settings },
];