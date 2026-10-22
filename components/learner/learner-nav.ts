import type { Route } from "next";
import {
  Brain,
  FileBadge,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { tk } from "@/lib/i18n/translate";

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
    label: tk("Dashboard"),
    href: "/learner/dashboard" as Route,
    icon: LayoutDashboard,
    matches: ["/learner/interns"],
  },
  { label: tk("AI Curriculum"), href: "/learner/ai-curriculum" as Route, icon: Brain },
  { label: tk("Recruitment Practice"), href: "/learner/recruitment-practice" as Route, icon: FileText },
];

/** Group 2 (below the divider in the Figma). */
export const LEARNER_NAV_SECONDARY: LearnerNavItem[] = [
  { label: tk("My Projects"), href: "/learner/projects" as Route, icon: FolderOpen },
  { label: tk("Certification"), href: "/learner/certification" as Route, icon: FileBadge },
  { label: tk("Settings"), href: "/learner/profile" as Route, icon: Settings },
];