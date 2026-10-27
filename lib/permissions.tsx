"use client";

/**
 * What the admin's Roles & Permissions matrix lets the signed-in mentor, teacher or student use (27 Oct 2026, backend
 * GET /api/v1/me/permissions). A page turned off disappears from the sidebar, and opening it shows a notice; the API
 * refuses it anyway (403 PERMISSION_DENIED). While the answer loads, or when it fails, everything stays visible.
 */
import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Lock } from "lucide-react";
import { api } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";

export interface PagePermission {
  area: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canExport: boolean;
}

interface MyPermissions {
  role: string;
  permissions: PagePermission[];
}

/** One request per page load; a new sign-in or a reload asks again. */
let pending: Promise<MyPermissions | null> | null = null;

function load(): Promise<MyPermissions | null> {
  pending ??= api.get<MyPermissions>("/api/v1/me/permissions").catch(() => {
    pending = null; // try again on the next page
    return null;
  });
  return pending;
}

/** The pages the role may not open (canView off), or an empty set while loading. */
export function useClosedPages(): ReadonlySet<string> {
  const [closed, setClosed] = useState<ReadonlySet<string>>(() => new Set());
  useEffect(() => {
    let active = true;
    // Ask again when the tab comes back, so a change the admin made shows without a reload.
    const refresh = () => {
      pending = null;
      void load().then((p) => active && p && setClosed(new Set(p.permissions.filter((x) => !x.canView).map((x) => x.area))));
    };
    void load().then((p) => active && p && setClosed(new Set(p.permissions.filter((x) => !x.canView).map((x) => x.area))));
    const onVisible = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      active = false;
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
  return closed;
}

/** A page of a dashboard and the matrix module it belongs to. */
export interface PageArea {
  href: string;
  area: string;
}

/** The module of the current page: the longest matching href. */
export function areaOf(pathname: string, pages: readonly PageArea[]): string | undefined {
  return [...pages]
    .filter((p) => pathname === p.href || pathname.startsWith(`${p.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.area;
}

/** Shows the page, or a notice when the admin turned it off for this role. */
export function PageGate({ pages, closed, children }: { pages: readonly PageArea[]; closed: ReadonlySet<string>; children: ReactNode }) {
  const t = useT();
  const pathname = usePathname();
  const area = areaOf(pathname, pages);
  if (!area || !closed.has(area)) return <>{children}</>;
  return (
    <div className="grid min-h-[50vh] place-items-center p-6">
      <div className="max-w-md rounded-2xl bg-white/90 p-6 text-center shadow-[0_6px_22px_rgba(20,54,90,0.08)]">
        <Lock className="mx-auto mb-3 size-8 text-[#14365a]" />
        <h1 className="text-lg font-bold text-[#0b1b2b]">{t("This page is turned off")}</h1>
        <p className="mt-1 text-sm text-[#5b6b7c]">{t("The admin has turned this page off for your account. Ask the admin if you need it.")}</p>
      </div>
    </div>
  );
}
