import type { ReactNode } from "react";
import AuthLayout from "@/components/Auth/AuthLayout"; 

interface AuthRouteLayoutProps {
  children: ReactNode;
}

export default function AuthRouteLayout({
  children,
}: AuthRouteLayoutProps) {
  return <AuthLayout>{children}</AuthLayout>; 
}