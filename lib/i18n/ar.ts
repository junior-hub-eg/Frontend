import { auth } from "./ar/auth";
import { backend } from "./ar/backend";
import { common } from "./ar/common";
import { courses } from "./ar/courses";
import { errors } from "./ar/errors";
import { landing } from "./ar/landing";
import { learner } from "./ar/learner";

/** Arabic translations, keyed by the English text. `node scripts/i18n-check.mjs` lists missing ones. */
export const ar: Record<string, string> = {
  ...common,
  ...landing,
  ...auth,
  ...errors,
  ...backend,
  ...learner,
  ...courses,
};
