import type { Route } from "next";
import {
  Bot,
  Brain,
  FileBadge,
  FileText,
  FolderOpen,
  LayoutDashboard,
  MessageCircle,
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
  /** Its module of the Roles & Permissions matrix (Student role); none = always open. */
  area?: string;
}

/** Group 1 (top of the sidebar). Courses / Mentorship / Internship open from the scene. */
export const LEARNER_NAV_MAIN: LearnerNavItem[] = [
  {
    label: tk("Dashboard"),
    href: "/learner/dashboard" as Route,
    icon: LayoutDashboard,
    matches: ["/learner/interns"],
  },
  { label: tk("AI Curriculum"), href: "/learner/ai-curriculum" as Route, icon: Brain, area: "AI Curriculum" },
  // The track-discovery interview with Alice, any time (27 Oct 2026); before, only Settings linked to it.
  { label: tk("AI Interview"), href: "/learner/ai-interview" as Route, icon: Bot, area: "AI Interview", matches: ["/learner/courses/discovery"] },
  { label: tk("Recruitment Practice"), href: "/learner/recruitment-practice" as Route, icon: FileText, area: "Recruitment Practice" },
  { label: tk("Messages"), href: "/learner/messages" as Route, icon: MessageCircle, area: "Messages" },
];

/** Group 2 (below the divider in the Figma). */
export const LEARNER_NAV_SECONDARY: LearnerNavItem[] = [
  { label: tk("My Projects"), href: "/learner/projects" as Route, icon: FolderOpen, area: "My Projects" },
  { label: tk("Certification"), href: "/learner/certification" as Route, icon: FileBadge, area: "Certification" },
  { label: tk("Settings"), href: "/learner/profile" as Route, icon: Settings },
];
/** Every student page that belongs to a module of the matrix, with the pages that open from the scene. */
export const LEARNER_PAGES: { href: string; area: string }[] = [
  ...[...LEARNER_NAV_MAIN, ...LEARNER_NAV_SECONDARY].flatMap((n) =>
    n.area ? [{ href: n.href as string, area: n.area }, ...(n.matches ?? []).map((m) => ({ href: m, area: n.area! }))] : [],
  ),
  { href: "/learner/courses", area: "Courses" },
  { href: "/learner/placement", area: "Courses" },
  { href: "/learner/mentorship", area: "Mentorship" },
  { href: "/learner/interns", area: "Internship" },
];
