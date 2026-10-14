import type { ReactNode } from "react";
import AuthLayout from "@/components/Auth/AuthLayout"; // استيراد المكون الخاص بكِ

interface AuthRouteLayoutProps {
  children: ReactNode;
}

export default function AuthRouteLayout({
  children,
}: AuthRouteLayoutProps) {
  return <AuthLayout>{children}</AuthLayout>; // استخدام AuthLayout هنا بدلاً من الـ Fragment الفارغة
}