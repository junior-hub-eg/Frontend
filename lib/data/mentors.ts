/**
 * MOCK mentor data for the Mentorship pages (app/monitor/*).
 * Replace with the Mentors API once the backend contract ships.
 */
export interface Mentor {
  id: string;
  name: string;
  role: string;
  company: string;
  bio: string;
  rating: number;
  reviews: number;
  sessions: number;
  /** USD per 30-minute session. */
  price: number;
  expertise: string[];
  technologies: string[];
  focus: string[];
  availableThisWeek: boolean;
}

export const EXPERTISE = ["Frontend", "Backend", "Mobile", "Data & AI", "UI/UX"] as const;
export const TECHNOLOGIES = ["React", "TypeScript", "Python", "Node.js", "Figma", "Flutter", "SQL", "TensorFlow"] as const;
export const FOCUS = ["Project review", "Career guidance", "Interview prep", "Portfolio feedback"] as const;

export const MENTORS: Mentor[] = [
  {
    id: "sarah-chen",
    name: "Sarah Chen",
    role: "Senior Frontend Engineer",
    company: "Cloud Engineering Group",
    bio: "Helps young builders ship their first real websites and understand how modern frontend teams work.",
    rating: 4.9,
    reviews: 128,
    sessions: 340,
    price: 40,
    expertise: ["Frontend", "UI/UX"],
    technologies: ["React", "TypeScript", "Figma"],
    focus: ["Project review", "Career guidance"],
    availableThisWeek: true,
  },
  {
    id: "marcus-vance",
    name: "Marcus Vance",
    role: "Backend Engineer",
    company: "Northwind Labs",
    bio: "Explains APIs, databases and servers with simple examples, then guides you through a small project.",
    rating: 4.8,
    reviews: 96,
    sessions: 275,
    price: 35,
    expertise: ["Backend"],
    technologies: ["Python", "Node.js", "SQL"],
    focus: ["Project review", "Interview prep"],
    availableThisWeek: true,
  },
  {
    id: "elena-rostova",
    name: "Elena Rostova",
    role: "Product Designer",
    company: "Studio Lumen",
    bio: "Teaches design thinking, wireframes and how to present your work so people remember it.",
    rating: 4.9,
    reviews: 112,
    sessions: 301,
    price: 30,
    expertise: ["UI/UX"],
    technologies: ["Figma"],
    focus: ["Portfolio feedback", "Career guidance"],
    availableThisWeek: false,
  },
  {
    id: "david-kim",
    name: "David Kim",
    role: "Mobile Developer",
    company: "Appsmith Studio",
    bio: "Walks you from your first screen to a working mobile app you can run on your own phone.",
    rating: 4.7,
    reviews: 74,
    sessions: 198,
    price: 45,
    expertise: ["Mobile"],
    technologies: ["Flutter", "TypeScript"],
    focus: ["Project review", "Portfolio feedback"],
    availableThisWeek: true,
  },
  {
    id: "amara-okafor",
    name: "Amara Okafor",
    role: "Data Scientist",
    company: "Insight Works",
    bio: "Makes data approachable: cleaning, charts and the questions worth asking about a dataset.",
    rating: 4.8,
    reviews: 87,
    sessions: 226,
    price: 38,
    expertise: ["Data & AI"],
    technologies: ["Python", "SQL"],
    focus: ["Career guidance", "Interview prep"],
    availableThisWeek: true,
  },
  {
    id: "tariq-al-mansoor",
    name: "Tariq Al-Mansoor",
    role: "AI Engineer",
    company: "Vector Labs",
    bio: "Introduces machine learning with hands-on notebooks and responsible-AI habits from day one.",
    rating: 4.9,
    reviews: 69,
    sessions: 154,
    price: 50,
    expertise: ["Data & AI", "Backend"],
    technologies: ["Python", "TensorFlow"],
    focus: ["Project review", "Interview prep"],
    availableThisWeek: false,
  },
];

export function getMentor(id: string): Mentor | undefined {
  return MENTORS.find((m) => m.id === id);
}

export interface SessionType {
  id: string;
  title: string;
  description: string;
  /** USD, 0 = free. */
  price: number;
  minutes: number;
  popular?: boolean;
}

export const SESSION_TYPES: SessionType[] = [
  { id: "build", title: "Build & Fix My Project", description: "Work on your own project together and get unstuck.", price: 25, minutes: 30, popular: true },
  { id: "learn", title: "Learn a New Skill", description: "A guided mini-lesson on a topic you pick.", price: 30, minutes: 30 },
  { id: "intro", title: "Quick Intro & Idea Chat", description: "Meet your mentor and talk through your ideas.", price: 0, minutes: 15 },
];
