import { AdminPage, PageHero } from "./AdminPage";
import { MentorStats } from "./MentorStats";
import { MentorsTable } from "./MentorsTable";

export default function AdminMentors() {
  return (
    <AdminPage>
      {/* The hero is taller at the bottom so the table card can sit on top of it */}
      <PageHero title="Mentors Management" contentClassName="pb-[7em]">
        <MentorStats className="mt-[1.6em]" />
      </PageHero>

      <div className="relative z-10 mx-auto -mt-[5.5em] w-full lg:w-[80%]">
        <MentorsTable />
      </div>
    </AdminPage>
  );
}