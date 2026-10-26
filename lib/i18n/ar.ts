import { account } from "./ar/account";
import { auth } from "./ar/auth";
import { backend } from "./ar/backend";
import { calendar } from "./ar/calendar";
import { common } from "./ar/common";
import { courses } from "./ar/courses";
import { errors } from "./ar/errors";
import { internship } from "./ar/internship";
import { interns } from "./ar/interns";
import { landing } from "./ar/landing";
import { math } from "./ar/math";
import { learner } from "./ar/learner";
import { lesson } from "./ar/lesson";
import { mentors } from "./ar/mentors";
import { mentorWorkspace } from "./ar/mentor-workspace";
import { recruitment } from "./ar/recruitment";
import { teacher } from "./ar/teacher";
import { students } from "./ar/students";
import { curriculum } from "./ar/curriculum";
import { assignments } from "./ar/assignments";
import { teacherWorkspace } from "./ar/teacher-workspace";
import { myClasses } from "./ar/my-classes";
import { teacherMessages } from "./ar/teacher-messages";
import { teacherCalendar } from "./ar/teacher-calendar";
import { teacherProgress } from "./ar/teacher-progress";
import { grammarCoach } from "./ar/grammar-coach";
import { teacherGrammar } from "./ar/teacher-grammar";
import { mentorArea } from "./ar/mentor-area";
import { reportKit } from "./ar/report-kit";
import { projectBrief } from "./ar/project-brief";
import { chat } from "./ar/chat";

/** Arabic translations, keyed by the English text. `node scripts/i18n-check.mjs` lists missing ones. */
export const ar: Record<string, string> = {
  // First, so the older dictionaries keep their own wording for the texts they share.
  ...chat,
  ...mentorArea,
  ...common,
  ...landing,
  ...auth,
  ...errors,
  ...backend,
  ...learner,
  ...courses,
  ...mentors,
  ...mentorWorkspace,
  ...internship,
  ...recruitment,
  ...math,
  ...account,
  ...interns,
  ...lesson,
  ...calendar,
  ...teacher,
  ...students,
  ...curriculum,
  ...assignments,
  ...teacherWorkspace,
  ...myClasses,
  ...teacherMessages,
  ...teacherCalendar,
  ...teacherProgress,
  ...grammarCoach,
  ...teacherGrammar,
  ...reportKit,
  ...projectBrief,
};
