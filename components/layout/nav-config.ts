import type { Route } from "next";
import type { UserRole } from "@/lib/types";

export interface NavItem {
  label: string;
  href: Route;
}

export const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  learner: [
    { label: "الرئيسية", href: "/learner/dashboard" },
    { label: "الكورسات", href: "/learner/courses" },
    { label: "AI Interview", href: "/learner/ai-interview" },
    { label: "المشاريع", href: "/learner/projects" },
    { label: "البروفايل", href: "/learner/profile" },
  ],
  guardian: [{ label: "لوحة ولي الأمر", href: "/guardian/dashboard" }],
  mentor: [{ label: "الطلاب المتابَعين", href: "/mentor/dashboard" }],
  admin: [
    { label: "الرئيسية", href: "/admin/dashboard" },
    { label: "المشاريع", href: "/admin/projects" },
    { label: "المنتورز", href: "/admin/mentors" },
    { label: "مراجعة الشات", href: "/admin/moderation" },
  ],
};
