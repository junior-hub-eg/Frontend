import { Suspense } from "react";
import MyStudents from "@/components/mentor/area/MyStudents";

/** M5 · My students (design of 26 Oct 2026). */
export default function MentorStudentsPage() {
  return (
    <Suspense>
      <MyStudents />
    </Suspense>
  );
}
