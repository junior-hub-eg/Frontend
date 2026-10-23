import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";

const AVATAR = "/images/Intern/char-boy-glasses.png"; // replace with the real mentor pictures

type Status = "Active" | "On Leave" | "Pending";

const MENTORS: { id: number; name: string; track: string; squad: string; status: Status; avatar: string }[] = [
  { id: 1, name: "Mohammed Yasser", track: "Frontend Development", squad: "Squad Alpha", status: "Active", avatar: AVATAR },
  { id: 2, name: "Sarah Ahmed", track: "Backend Development", squad: "Squad Beta", status: "On Leave", avatar: AVATAR },
  { id: 3, name: "Amr Hassan", track: "Data Science", squad: "Squad Gamma", status: "Active", avatar: AVATAR },
  { id: 4, name: "Nada Ali", track: "UX/UI Design", squad: "Squad Delta", status: "Pending", avatar: AVATAR },
];

const STATUS_STYLE: Record<Status, string> = {
  Active: "bg-[#e6ebf1] text-[#5b6b7c]",
  "On Leave": "bg-[#e6ebf1] text-[#5b6b7c]",
  Pending: "bg-[#e6ebf1] text-[#5b6b7c]",
};

export function MentorsTable() {
  return (
    <section className="rounded-[1.1em] bg-white p-[1.2em] shadow-[0_6px_22px_rgba(20,54,90,0.1)]">
      <header className="flex flex-wrap items-center justify-between gap-[0.8em]">
        <h2 className="text-[1.05em] font-bold text-[#14365a]">Mentors Overview</h2>
        <Link
          href={"/admin/mentors/new" as Route}
          className="rounded-[0.5em] bg-[#1d6fe0] px-[1.2em] py-[0.55em] text-[0.75em] font-semibold text-white shadow-sm hover:bg-[#1659b8]"
        >
          + Add Mentor
        </Link>
      </header>

      <div className="mt-[1em] overflow-x-auto rounded-[0.7em] border border-[#e6edf3]">
        <table className="w-full min-w-[40em] text-left text-[0.8em]">
          <thead>
            <tr className="bg-[#f4f7fb] text-[0.85em] text-[#5b6b7c]">
              <th className="px-[1.1em] py-[0.7em] font-medium">Mentor Name</th>
              <th className="px-[1.1em] py-[0.7em] font-medium">Track</th>
              <th className="px-[1.1em] py-[0.7em] font-medium">Squad</th>
              <th className="px-[1.1em] py-[0.7em] font-medium">Status</th>
              <th className="px-[1.1em] py-[0.7em] text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="text-[#14365a]">
            {MENTORS.map((m) => (
              <tr key={m.id} className="border-t border-[#e6edf3] hover:bg-[#f9fbfd]">
                <td className="px-[1.1em] py-[0.7em]">
                  <span className="flex items-center gap-[0.7em] font-semibold">
                    <span className="relative size-[2em] shrink-0 overflow-hidden rounded-full bg-[#ffc531]">
                      <Image src={m.avatar} alt="" fill sizes="32px" className="origin-top scale-[2.1] object-cover object-top" />
                    </span>
                    {m.name}
                  </span>
                </td>
                <td className="px-[1.1em] py-[0.7em] text-[#5b6b7c]">{m.track}</td>
                <td className="px-[1.1em] py-[0.7em] text-[#5b6b7c]">{m.squad}</td>
                <td className="px-[1.1em] py-[0.7em]">
                  <span className={`rounded-full px-[0.8em] py-[0.2em] text-[0.85em] font-medium ${STATUS_STYLE[m.status]}`}>
                    {m.status}
                  </span>
                </td>
                <td className="px-[1.1em] py-[0.7em] text-right">
                  <Link
                    href={`/admin/mentors/${m.id}` as Route}
                    className="rounded-[0.5em] border border-[#d5dee8] px-[0.9em] py-[0.35em] text-[0.85em] font-medium hover:bg-[#eef4fa]"
                  >
                    View Profile
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}