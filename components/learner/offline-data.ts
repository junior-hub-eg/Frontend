import type { LessonSummary } from "@/lib/learning-api";

export type OfflineLesson = LessonSummary & { concept: string };

/** Slug -> track code. Adjust to match your real track codes. */
export const toCode = (slug: string) => slug.trim().toUpperCase().replace(/[-\s]+/g, "_");

export const NAMES: Record<string, string> = {
  UI_UX: "UI/UX Design",
  WEB: "Web Development",
  DATA: "Data Analysis",
};

const prettify = (s: string) => s.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const trackName = (slug: string) => NAMES[toCode(slug)] ?? prettify(slug);

const TOPICS = [
  ["Getting started", "Understand the basics and the core vocabulary."],
  ["Core concepts", "Learn the main ideas and how they connect."],
  ["Hands-on practice", "Apply what you learned in a small project."],
] as const;

/** Local demo lessons used when the API is unavailable. */
export function offlineLessons(name: string): OfflineLesson[] {
  return TOPICS.map(
    ([title, concept], i) =>
      ({
        id: `offline-${i + 1}`,
        title: `${title}: ${name}`,
        concept,
        durationSeconds: 0,
        status: "Available",
        hasSchoolLink: false,
      }) as unknown as OfflineLesson,
  );
}

export type OfflineQuestion = {
  id: string;
  prompt: string;
  options: string[];
  /** Index of the correct option. */
  answer: number;
  help: string;
};

/** Local demo quiz used when the API is unavailable. */
export const offlineQuiz = (name: string): OfflineQuestion[] => [
  {
    id: "q1",
    prompt: `What is the main goal of ${name}?`,
    options: ["Make products easy and useful", "Make products colorful only", "Write more code", "Reduce the team size"],
    answer: 0,
    help: "Think about who will use the product and what they need.",
  },
  {
    id: "q2",
    prompt: "Which one is a core vocabulary term designers use?",
    options: ["Wireframe", "Compiler", "Firewall", "Kernel"],
    answer: 0,
    help: "A wireframe is a simple layout sketch of a screen.",
  },
  {
    id: "q3",
    prompt: "What makes a design have good usability?",
    options: ["Users reach their goal quickly", "It has many animations", "It uses many fonts", "It hides the menu"],
    answer: 0,
    help: "Good usability means users can finish tasks easily and without confusion.",
  },
];