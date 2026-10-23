import { account } from "./ar/account";
import { admin } from "./ar/admin";
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
import { recruitment } from "./ar/recruitment";

/** Arabic translations, keyed by the English text. `node scripts/i18n-check.mjs` lists missing ones. */
export const ar: Record<string, string> = {
  ...common,
  ...landing,
  ...auth,
  ...errors,
  ...backend,
  ...learner,
  ...courses,
  ...mentors,
  ...internship,
  ...recruitment,
  ...math,
  ...account,
  ...interns,
  ...lesson,
  ...calendar,
  ...admin,
};
