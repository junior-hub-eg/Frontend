"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { getAdminRoles, updateAdminRolePermissions, type AdminRole, type RolePermission } from "@/lib/admin-api";
import { AdminBody, AdminHero, AdminPage } from "./page-parts";
import { LoadState, useAdminData } from "./admin-data";

type Right = "canView" | "canEdit" | "canDelete";

/** Each permission button: its label, and its colors when the role has it. */
const RIGHTS: { key: Right; label: string; on: string }[] = [
  { key: "canView", label: tk("View"), on: "rounded-[0.4em] bg-[#d3eef3] px-[0.8em] py-[0.15em] font-semibold text-[#23809a]" },
  { key: "canEdit", label: tk("Edit"), on: "rounded-[0.4em] bg-[#fdf0cf] px-[0.8em] py-[0.15em] font-semibold text-[#c48a06]" },
  { key: "canDelete", label: tk("Delete"), on: "rounded-full bg-[#fbc9cf] px-[1.1em] py-[0.25em] font-semibold text-[#d6455a]" },
];
const OFF = "rounded-[0.4em] border border-dashed border-[#c9d2dc] px-[0.8em] py-[0.15em] font-medium text-[#14365a]/45";

export default function RolesPage() {
  const t = useT();
  const { data, error, reload, setData } = useAdminData(getAdminRoles, tk("Could not load the roles."));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const roles: AdminRole[] = data ?? [];
  const selected = roles.find((r) => r.id === selectedId) ?? roles[0];

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
    <AdminPage>
      <AdminHero>
        <h1 className="text-[2.4em] font-bold leading-tight text-[#0f7378]">{t("User Roles & Permissions")}</h1>

        <div className="mt-[1.2em] flex justify-end">
          <button
            type="button"
            className="inline-flex items-center gap-[0.6em] rounded-full bg-[#14365a] px-[1.2em] py-[0.45em] text-[0.8em] font-semibold text-white shadow-md hover:bg-[#0f2a47]"
          >
            {t("Add New Role")}
            <span className="grid size-[1.4em] place-items-center rounded-full bg-[#3b8cf0]">
              <Plus className="size-[1em]" strokeWidth={3} />
            </span>
          </button>
        </div>

        {!data ? (
          <LoadState error={error} onRetry={reload} className="mx-auto mt-[0.6em] max-w-[60em]" />
        ) : (
          <ul className="mx-auto mt-[0.6em] grid max-w-[60em] gap-[1.2em] md:grid-cols-2">
            {roles.map((r, i) => {
              const on = r.id === selected?.id;
              return (
                <li key={r.id} className={i === roles.length - 1 && roles.length % 2 === 1 ? "md:col-span-2 md:w-[56%] md:justify-self-center" : ""}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => setSelectedId(r.id)}
                    className={`w-full rounded-[1.1em] border px-[1.1em] py-[0.8em] text-start backdrop-blur-[3px] transition-colors ${
                      on ? "border-[#2f7bf0] bg-white/85" : "border-white/50 bg-white/55 hover:bg-white/70"
                    }`}
                  >
                    <span className="block text-[1.45em] font-medium leading-tight text-[#0b1b2b]">{t(r.name)}</span>
                    <span className="mt-[0.2em] block text-[0.95em] text-[#2f7bf0]">{r.meta}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </AdminHero>

      <AdminBody>
        {selected && (
          <section className="mx-auto max-w-[46em] rounded-[1.5em] bg-white p-[1em] shadow-[0_6px_22px_rgba(20,54,90,0.07)]">
            <h2 className="px-[0.4em] pb-[0.7em] text-[0.85em] font-bold text-[#0b1b2b]">{t("Permissions of {role}", { role: t(selected.name) })}</h2>
            {saveError && <p role="alert" className="mb-[0.7em] rounded-[0.6em] bg-[#fdecec] px-[1em] py-[0.5em] text-[0.75em] font-semibold text-[#b83232]">{saveError}</p>}
            {selected.permissions.length === 0 ? (
              <p className="px-[1em] py-[1.2em] text-center text-[0.8em] text-[#14365a]/60">{t("No permissions left.")}</p>
            ) : (
              <ul className="space-y-[0.7em]">
                {selected.permissions.map((p) => (
                  <li key={p.area} className="flex items-center gap-[0.6em] rounded-[0.7em] bg-[#f3f5f8] px-[1em] py-[0.7em]">
                    <span className="text-[0.8em] font-medium text-[#0b1b2b]">{t(p.area)}</span>
                    <span className="ms-auto flex items-center gap-[0.8em]">
                      {RIGHTS.map((right) => (
                        <button
                          key={right.key}
                          type="button"
                          aria-pressed={p[right.key]}
                          aria-label={`${t(right.label)} - ${t(p.area)}`}
                          disabled={saving}
                          onClick={() => toggle(p.area, right.key)}
                          className={`text-[0.65em] hover:opacity-80 disabled:cursor-wait ${p[right.key] ? right.on : OFF}`}
                        >
                          {t(right.label)}
                        </button>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </AdminBody>
    </AdminPage>
  );
}
