import type { Route } from "next";
import type { UserRole } from "@/lib/types";
import { tk } from "@/lib/i18n/translate";

export interface NavItem {
  label: string;
  href: Route;
}

export const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  learner: [
    { label: tk("Home"), href: "/learner/dashboard" },
    { label: tk("Courses"), href: "/learner/courses" },
    { label: tk("AI Interview"), href: "/learner/ai-interview" },
    { label: tk("Projects"), href: "/learner/projects" },
    { label: tk("Profile"), href: "/learner/profile" },
  ],
  guardian: [{ label: tk("Guardian dashboard"), href: "/guardian/dashboard" }],
  teacher: [{ label: tk("Home"), href: "/teacher/dashboard" }],
  mentor: [{ label: tk("Monitored students"), href: "/mentor/dashboard" }],
};
