import { AdminPage, PageHero } from "./AdminPage";
import { SquadCard, type Squad } from "./SquadCard";

const TRACK = "UI\\UX Design Track";

const SQUADS: Squad[] = [
  { id: 1, name: "Squad Beta", status: "Active", track: TRACK, mentor: "Ali Samy", progress: 95, students: 5, capacity: 6 },
  { id: 2, name: "Squad Alpha", status: "Active", track: TRACK, mentor: "Ahmed Ali", progress: 95, students: 5, capacity: 6 },
  { id: 3, name: "Squad Hunter", status: "Pending", track: TRACK, mentor: "Adel Wael", progress: 95, students: 5, capacity: 6 },
  { id: 4, name: "Squad Delta", status: "Pending", track: TRACK, mentor: "Noha Wael", progress: 95, students: 5, capacity: 6 },
  { id: 5, name: "Squad Delta", status: "Completed", track: TRACK, mentor: "Ahmed Nader", progress: 95, students: 5, capacity: 6 },
  { id: 6, name: "Squad Update", status: "Active", track: TRACK, mentor: "Ahmed Nader", progress: 95, students: 5, capacity: 6 },
  { id: 7, name: "Squad Alpha", status: "Active", track: TRACK, mentor: "Ahmed Nader", progress: 95, students: 5, capacity: 6 },
  { id: 8, name: "Squad Alpha", status: "Active", track: TRACK, mentor: "Ahmed Nader", progress: 95, students: 5, capacity: 6 },
];

export default function AdminSquads() {
  const featured = SQUADS.slice(0, 2); // sit on the hero (about 54% of the width, centered)
  const rest = SQUADS.slice(2); // two rows of three (about 85% of the width)

  return (
    <AdminPage>
      <PageHero title="Squads Management" contentClassName="pb-0">
        <div className="relative -mb-[2.8em] mt-[1.4em] grid gap-[1.6em] sm:grid-cols-2 lg:mx-auto lg:w-[66%]">
          {featured.map((s) => (
            <SquadCard key={s.id} squad={s} />
          ))}
        </div>
      </PageHero>

      <div className="mx-auto mt-[4.2em] w-full lg:w-[85%]">
        <div className="grid gap-[1.6em] sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((s) => (
            <SquadCard key={s.id} squad={s} />
          ))}
        </div>
      </div>
    </AdminPage>
  );
}