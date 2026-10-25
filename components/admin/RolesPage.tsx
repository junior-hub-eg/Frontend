"use client";

import { useState } from "react";
import { History, IdCard, RefreshCw, SlidersHorizontal, UserPlus, Plus } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { getAdminRoles, updateAdminRolePermissions, type AdminRole, type RolePermission } from "@/lib/admin-api";
import { BTN_PRIMARY, BTN_SECONDARY, AdminSurface, PageHeader, StatCard, StatGrid } from "./page-parts";
import { LoadState, useAdminData } from "./admin-data";
import { MOCK_ROLES_STATS } from "./dashboardMock";
import { RoleTabs } from "./roles/RoleTabs";
import { PermissionsMatrix, type Right } from "./roles/PermissionsMatrix";
import { AssignedAdministrators } from "./roles/AssignedAdministrators";
import { PermissionAuditEvents } from "./roles/PermissionAuditEvents";

export default function RolesPage() {
  const t = useT();
  const { data, error, reload, setData } = useAdminData(getAdminRoles, tk("Could not load the roles."));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const roles: AdminRole[] = data ?? [];
  const selected = roles.find((r) => r.id === selectedId) ?? roles[0];
  const custom = roles.filter((r) => !r.isSystemRole).length;

  /** Every click on View / Edit / Delete is saved at once (same as before). */
  async function toggle(area: string, right: Right) {
    if (!selected || saving) return;
    const permissions: RolePermission[] = selected.permissions.map((p) => (p.area === area ? { ...p, [right]: !p[right] } : p));
    const before = roles;
    setData(roles.map((r) => (r.id === selected.id ? { ...r, permissions } : r)));
    setSaving(true);
    setSaveError(null);
    try {
      const saved = await updateAdminRolePermissions(selected, permissions);
      setData((list) => (list ?? []).map((r) => (r.id === saved.id ? { ...r, permissions: saved.permissions } : r)));
    } catch (e) {
      setData(before);
      setSaveError(errorMessage(e, t("Could not save the permissions.")));
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminSurface>
      <PageHeader
        eyebrow={t("Admin / Console / Roles & Permissions")}
        title={t("Roles & Permissions")}
        description={t("Configure granular access controls, administrative privileges, and security matrix across platform roles.")}
        actions={
          <>
            <button type="button" className={BTN_SECONDARY}><History className="size-[1em]" /> {t("Security Audit Log")}</button>
            <button type="button" className={BTN_PRIMARY}><Plus className="size-[1em]" /> {t("Create Custom Role")}</button>
          </>
        }
      />

      <StatGrid busy={!data}>
        <StatCard label={t("Total Roles")} icon={IdCard} value={data ? String(roles.length).padStart(2, "0") : "—"} badge={data ? `${roles.length - custom} ${t("System")}` : undefined} badgeTone="neutral" hint={data ? `${custom} ${t("Custom configurations")}` : undefined} />
        <StatCard label={t("Active Users Assigned")} icon={UserPlus} tone="violet" value={MOCK_ROLES_STATS.users.toLocaleString()} badge={t("100% Assigned")} hint={t("Active credentials")} />
        <StatCard label={t("Custom Roles")} icon={SlidersHorizontal} tone="green" value={data ? String(custom).padStart(2, "0") : "—"} badge={t("Tailored")} badgeTone="neutral" hint={t("Specific access scopes")} />
        <StatCard label={t("Permission Changes")} icon={RefreshCw} tone="amber" value={MOCK_ROLES_STATS.changes} badge={t("Last 30 Days")} badgeTone="neutral" hint={t("Signed with MFA")} />
      </StatGrid>

      {!data ? (
        <LoadState error={error} onRetry={reload} />
      ) : (
        selected && (
          <>
            <RoleTabs roles={roles} selectedId={selected.id} onSelect={setSelectedId} />
            <PermissionsMatrix role={selected} saving={saving} error={saveError} onToggle={toggle} onDiscard={reload} />
            <div className="grid items-start gap-[1.2em] lg:grid-cols-2">
              <AssignedAdministrators />
              <PermissionAuditEvents />
            </div>
          </>
        )
      )}
    </AdminSurface>
  );
}