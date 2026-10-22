"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@/lib/types";
import { APP_NAME } from "@/lib/constants";
import { NAV_BY_ROLE } from "@/components/layout/nav-config";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/client";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";

export function AppShell({ role, children }: { role: UserRole; children: React.ReactNode }) {
  const t = useT();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const items = NAV_BY_ROLE[role];

  return (
    <div className="flex min-h-full flex-1">
      <aside className="hidden w-64 shrink-0 flex-col border-e border-border bg-muted/40 p-4 md:flex">
        <Link href="/" className="mb-6 px-2 text-lg font-semibold text-primary">
          {t(APP_NAME)}
        </Link>
        <LanguageSwitcher className="mb-4 px-2 text-sm font-medium" />
        <nav className="flex flex-1 flex-col gap-1">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                pathname === item.href ? "bg-primary/10 text-primary" : "text-foreground"
              )}
            >
              {t(item.label)}
            </Link>
          ))}
        </nav>
        <div className="border-t border-border pt-3 text-sm">
          <p className="font-medium">{user?.firstName ?? role}</p>
          <p className="text-muted-foreground">{user?.email}</p>
          <Button variant="ghost" size="sm" className="mt-2 w-full justify-start px-2" onClick={logout}>
            {t("Log out")}
          </Button>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border p-4 md:hidden">
          <span className="font-semibold text-primary">{t(APP_NAME)}</span>
          <LanguageSwitcher className="text-sm font-medium" />
          <Button variant="ghost" size="sm" onClick={logout}>
            {t("Log out")}
          </Button>
        </header>
        <main className="flex flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
