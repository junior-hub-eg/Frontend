/**
 * MOCK course / track content for the learner Courses pages.
 * Replace with the Learning Phase API (Sprint 2 backend) when it ships.
 */
export type CourseCategory = "ui-ux" | "frontend" | "backend" | "mobile" | "data" | "qa" | "product";
export type CourseLevel = "Beginner" | "Intermediate";
export type CourseTheme = "pink" | "blue" | "mint";
export type TrackIcon = "palette" | "monitor" | "smartphone" | "chart" | "brain";

export const COURSE_CATEGORIES: { id: "all" | CourseCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "ui-ux", label: "UI/UX" },
  { id: "frontend", label: "Frontend" },
  { id: "backend", label: "Backend" },
  { id: "mobile", label: "Mobile" },
  { id: "data", label: "Data analysis" },
  { id: "qa", label: "Quality Assurance" },
  { id: "product", label: "Product Management" },
];

export const INSTRUCTORS = ["Ahmed Yasser", "Sara Hassan", "Omar Khaled"] as const;

interface Browsable {
  category: CourseCategory;
  level: CourseLevel;
  hours: number;
  instructor: (typeof INSTRUCTORS)[number];
  students: number;
}

export interface FeaturedCourse extends Browsable {
  id: string;
  title: string;
  tag: string;
  description: string;
  lessons: number;
  trackSlug: string;
  theme: CourseTheme;
}

export interface TrackCard extends Browsable {
  slug: string;
  title: string;
  subtitle: string;
  icon: TrackIcon;
  color: "mint" | "blue" | "tan" | "rose" | "purple";
}

export const FEATURED_COURSES: FeaturedCourse[] = [
  {
    id: "ux-fundamentals",
    title: "UI/UX Fundamentals",
    tag: "UI/UX Design",
    description: "Learn how to research users, sketch ideas and design simple, friendly interfaces.",
    hours: 16,
    lessons: 24,
    students: 12200,
    category: "ui-ux",
    level: "Beginner",
    instructor: "Ahmed Yasser",
    trackSlug: "ui-ux-design",
    theme: "pink",
  },
  {
    id: "intro-ml",
    title: "Intro to Machine Learning",
    tag: "Data Science",
    description: "Learn foundational machine learning algorithms and work with real data sets.",
    hours: 18,
    lessons: 28,
    students: 13500,
    category: "data",
    level: "Intermediate",
    instructor: "Sara Hassan",
    trackSlug: "ai",
    theme: "blue",
  },
  {
    id: "frontend-foundations",
    title: "Frontend Foundations",
    tag: "Frontend",
    description: "Build your first web pages with HTML and CSS, then make them interactive.",
    hours: 14,
    lessons: 22,
    students: 9800,
    category: "frontend",
    level: "Beginner",
    instructor: "Omar Khaled",
    trackSlug: "frontend",
    theme: "mint",
  },
];

export const TRACK_CARDS: TrackCard[] = [
  { slug: "ui-ux-design", title: "UI/UX Design", subtitle: "Design Digital Experience", icon: "palette", color: "mint", category: "ui-ux", level: "Beginner", hours: 16, instructor: "Ahmed Yasser", students: 12200 },
  { slug: "frontend", title: "Frontend", subtitle: "Web Development", icon: "monitor", color: "blue", category: "frontend", level: "Beginner", hours: 14, instructor: "Omar Khaled", students: 9800 },
  { slug: "mobile-development", title: "Mobile Development", subtitle: "Create Mobile Apps", icon: "smartphone", color: "tan", category: "mobile", level: "Intermediate", hours: 20, instructor: "Omar Khaled", students: 6400 },
  { slug: "data-science", title: "Data Science", subtitle: "& Data analysis", icon: "chart", color: "rose", category: "data", level: "Intermediate", hours: 18, instructor: "Sara Hassan", students: 8100 },
  { slug: "ai", title: "AI", subtitle: "Explore Intelligent systems", icon: "brain", color: "purple", category: "data", level: "Intermediate", hours: 18, instructor: "Sara Hassan", students: 13500 },
];

export interface Lesson {
  id: string;
  title: string;
  summary: string;
}

export interface Track {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  objectives: string[];
  lessons: Lesson[];
}

function makeTrack(slug: string, title: string, description: string, tags: string[], objectives: string[]): Track {
  return {
    slug,
    title,
    description,
    tags,
    objectives,
    lessons: [
      { id: "foundations", title: `${title} Foundations`, summary: `Meet the essential ideas and vocabulary used throughout the ${title} track.` },
      { id: "plan-your-project", title: `Plan Your First ${title} Project`, summary: "Turn a simple idea into a clear plan before you start building." },
      { id: "build-and-practice", title: `Build with ${title}`, summary: "Apply the core concepts in a guided practical activity." },
    ],
  };
}

export const TRACKS_BY_SLUG: Record<string, Track> = Object.fromEntries(
  [
    makeTrack("ui-ux-design", "UI/UX Design", "Explore how research, structure, visual hierarchy, and thoughtful interaction come together in digital products.", ["User research", "Wireframes", "Interface design"], ["Understand user needs", "Organize clear layouts", "Explain design decisions"]),
    makeTrack("frontend", "Frontend", "Learn how structure, styling, and interaction come together to create web pages that people enjoy using.", ["HTML", "CSS", "Interactive pages"], ["Structure web content", "Style responsive layouts", "Build core interactions"]),
    makeTrack("mobile-development", "Mobile Development", "Discover how mobile apps are planned, designed, and built for the devices people carry every day.", ["Mobile UI", "Navigation", "Native basics"], ["Understand mobile patterns", "Build simple screens", "Test on a real device"]),
    makeTrack("data-science", "Data Science", "Learn how to collect, clean, and explore data to find useful answers and tell clear stories.", ["Data cleaning", "Charts", "Insights"], ["Clean a small dataset", "Read and build charts", "Explain what the data says"]),
    makeTrack("ai", "AI", "Get a friendly introduction to how intelligent systems learn, and how to use them responsibly.", ["Machine learning", "Prompts", "Responsible AI"], ["Understand how models learn", "Write clear prompts", "Spot the limits of AI"]),
  ].map((t) => [t.slug, t])
);

export function getTrack(slug: string): Track | undefined {
  return TRACKS_BY_SLUG[slug];
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  /** Index into `options`. */
  correct: number;
}

/** Same illustrative quiz for every lesson ("no required passing threshold" in the design). */
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  { id: "q1", prompt: "Which HTML element represents the main heading?", options: ["<p>", "<h1>", "<button>", "<img>"], correct: 1 },
  { id: "q2", prompt: "What should every opening heading tag include?", options: ["A matching closing tag", "A database", "A video file", "A chart"], correct: 0 },
  { id: "q3", prompt: "Which attribute gives an image a text description?", options: ["src", "href", "alt", "class"], correct: 2 },
];

export const QUIZ_TAKEAWAYS = ["Use meaningful HTML elements.", "Match opening and closing tags.", "Build one clear section at a time."];

export const TUTOR = { name: "Ahmed Yasser", initials: "AY" };
