"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/lib/types";
import * as mockAuth from "@/lib/auth/mock-auth";

if (typeof window !== "undefined") {
  mockAuth.seedDemoUsers();
}

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => User;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const user = useSyncExternalStore(mockAuth.subscribe, mockAuth.getCurrentUserSnapshot, mockAuth.getServerUserSnapshot);

  function login(email: string, password: string) {
    return mockAuth.login(email, password);
  }

  function logout() {
    mockAuth.logout();
    router.push("/login");
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
