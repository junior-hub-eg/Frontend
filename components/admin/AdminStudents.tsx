import { AdminPage, PageHero } from "./AdminPage";
import { StatCards } from "./StatCards";
import { StudentsTable } from "./StudentsTable";

export default function AdminStudents() {
  return (
    <AdminPage>
      <PageHero title="Students Management" contentClassName="pb-[1.8em]">
        <StatCards className="mt-[1.2em]" />
      </PageHero>

      {/* The table is narrower than the cards and centered, like the design */}
      <div className="mx-auto mt-[2.5em] w-full lg:w-[76%]">
        <StudentsTable />
      </div>
    </AdminPage>
  );
}