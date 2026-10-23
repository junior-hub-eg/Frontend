"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { AdminBody, AdminHero, AdminPage } from "./page-parts";

const ROLES = [
  { id: "admin", name: "System Admin", meta: "Full Access - 3 Users" },
  { id: "mentor", name: "Mentor / Instructor", meta: "Course & Squad Access - 12 Users" },
  { id: "content", name: "Content Manager", meta: "Curriculum & Assignments - 4 Users" },
];

const AREAS = ["Student Management", "Squads", "Mentors", "System Settings"];

export default function RolesPage() {
  const t = useT();
  const [areas, setAreas] = useState(AREAS);

  return (
    <AdminPage>
      <AdminHero>
        <h1 className="text-[2.4em] font-bold leading-tight text-[#0f7378]">{t("User Roles & Permissions")}</h1>

        <div className="mt-[1.2em] flex justify-end">
          {/* TODO: open the "new role" form / call the API */}
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

        <ul className="mx-auto mt-[0.6em] grid max-w-[60em] gap-[1.2em] md:grid-cols-2">
          {ROLES.map((r, i) => (
            <li
              key={r.id}
              className={`rounded-[1.1em] border border-white/50 bg-white/55 px-[1.1em] py-[0.8em] backdrop-blur-[3px] ${
                i === 2 ? "md:col-span-2 md:w-[56%] md:justify-self-center" : ""
              }`}
            >
              <h2 className="text-[1.45em] font-medium leading-tight text-[#0b1b2b]">{t(r.name)}</h2>
              <p className="mt-[0.2em] text-[0.95em] text-[#2f7bf0]">{r.meta}</p>
            </li>
          ))}
        </ul>
      </AdminHero>

      <AdminBody>
        <section className="mx-auto max-w-[46em] rounded-[1.5em] bg-white p-[1em] shadow-[0_6px_22px_rgba(20,54,90,0.07)]">
          {areas.length === 0 ? (
            <p className="px-[1em] py-[1.2em] text-center text-[0.8em] text-[#14365a]/60">{t("No permissions left.")}</p>
          ) : (
            <ul className="space-y-[0.7em]">
              {areas.map((a) => (
                <li key={a} className="flex items-center gap-[0.6em] rounded-[0.7em] bg-[#f3f5f8] px-[1em] py-[0.7em]">
                  <span className="text-[0.8em] font-medium text-[#0b1b2b]">{t(a)}</span>
                  <span className="ml-auto flex items-center gap-[0.8em]">
                    <button type="button" className="rounded-[0.4em] bg-[#d3eef3] px-[0.8em] py-[0.15em] text-[0.65em] font-semibold text-[#23809a] hover:opacity-80">
                      {t("View")}
                    </button>
                    <button type="button" className="text-[0.65em] font-medium text-[#f0b019] hover:opacity-80">
                      {t("Edit")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAreas((list) => list.filter((x) => x !== a))}
                      className="rounded-full bg-[#fbc9cf] px-[1.1em] py-[0.25em] text-[0.65em] font-semibold text-[#d6455a] hover:opacity-80"
                    >
                      {t("Delete")}
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </AdminBody>
    </AdminPage>
  );
}