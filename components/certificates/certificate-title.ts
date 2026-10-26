import type { Certificate } from "@/lib/recruitment-api";

type T = (key: string, values?: Record<string, string | number>) => string;

/** A certificate's title in the page's language: "HTML · Beginner Level" becomes "HTML · المستوى مبتدئ". */
export function certificateTitle(c: Certificate, t: T): string {
  const level = c.kind === "CourseLevel" ? c.role.match(/^(.*) · (Beginner|Intermediate|Advanced) Level$/) : null;
  return level ? t("{course} · {level} level", { course: level[1], level: t(level[2]) }) : t(c.role);
}

/** The heading of an admin-signed certificate, by its kind. */
export const SIGNED_HEADING: Record<string, string> = {
  CourseLevel: "Certificate of course completion",
  TrackCompletion: "Certificate of completion",
  Capstone: "Capstone certificate",
};
