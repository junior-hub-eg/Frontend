/**
 * MOCK mentor data for the Mentorship pages (app/(site)/monitor/*), taken from the Figma.
 * Replace with the Mentors API once the backend contract ships.
 */
export type SessionFormat = "Free Intro Call (15m)" | "Deep Dive 1-on-1 (45m)" | "Monthly Apprenticeship";

export interface Mentor {
  id: string;
  name: string;
  /** Photo from the Figma. Most already have the green "online" dot drawn in. */
  photo: string;
  photoHasDot: boolean;
  role: string;
  company: string;
  years: number;
  bio: string;
  rating: number;
  reviews: number;
  sessions: number;
  /** USD per 45-minute session. */
  price: number;
  /** Next free slot, for example "Tomorrow, 2:00 PM" or "Thursday". */
  nextSlot: string;
  technologies: string[];
  /** Filter groups the mentor matches. */
  techGroups: string[];
  focus: string[];
  formats: SessionFormat[];
  /** Booking page profile card. */
  headline: string;
  specialty: string;
  expertiseTags: string[];
  studentsCoached: string;
  responseTime: string;
}

export const SESSION_FORMATS: SessionFormat[] = ["Free Intro Call (15m)", "Deep Dive 1-on-1 (45m)", "Monthly Apprenticeship"];
export const TECH_GROUPS = [
  "React / Next.js",
  "Python / Django / FastApi",
  "TypeScript & Node.js",
  "AWS & Cloud Infrastructure",
  "PyTorch / Machine Learning",
  "Go / Rust Microservices",
  "Flutter / React Native",
] as const;
export const FOCUS = [
  "Code Review & PR Critique",
  "System Design & Scalability",
  "Mock Technical Interviews",
  "Portfolio & Capstone Review",
  "Junior-to-Mid Transition",
] as const;
export const EXPERIENCE = [
  { id: "5-8", label: "5–8 yrs", min: 5, max: 8 },
  { id: "8-12", label: "8–12 yrs", min: 8, max: 12 },
  { id: "12+", label: "12+ yrs", min: 12, max: 99 },
] as const;
export const MAX_RATE = 150;

export const MENTORS: Mentor[] = [
  {
    id: "sarah-chen",
    photo: "/images/Landing%20Page/Mentorship/Container.png",
    photoHasDot: true,
    name: "Sarah Chen",
    role: "Senior Full Stack Engineer",
    company: "Stripe",
    years: 7,
    bio: "Specializing in robust React architectures, scalable distributed systems and clean APIs for real products.",
    rating: 4.9,
    reviews: 84,
    sessions: 128,
    price: 45,
    nextSlot: "Tomorrow, 2:00 PM",
    technologies: ["React", "TypeScript", "GraphQL", "System Design"],
    techGroups: ["React / Next.js", "TypeScript & Node.js"],
    focus: ["Code Review & PR Critique", "System Design & Scalability"],
    formats: ["Free Intro Call (15m)", "Deep Dive 1-on-1 (45m)"],
    headline: "Staff Engineer @ Stripe",
    specialty: "Core Infrastructure & Global Payment Rails",
    expertiseTags: ["Distributed Systems", "Go", "React / TypeScript", "Microservices"],
    studentsCoached: "140+ teens & kids",
    responseTime: "< 2 hour",
  },
  {
    id: "marcus-vance",
    photo: "/images/Landing%20Page/Mentorship/Container-4.png",
    photoHasDot: true,
    name: "Marcus Vance",
    role: "Principal ML Engineer (ex-Meta)",
    company: "DeepMind",
    years: 10,
    bio: "Passionate about training LLMs, PyTorch model deployment, and computer vision projects you can explain.",
    rating: 5.0,
    reviews: 112,
    sessions: 210,
    price: 60,
    nextSlot: "Thursday",
    technologies: ["Python", "PyTorch", "LLMs", "Computer Vision"],
    techGroups: ["Python / Django / FastApi", "PyTorch / Machine Learning"],
    focus: ["System Design & Scalability", "Mock Technical Interviews"],
    formats: ["Deep Dive 1-on-1 (45m)", "Monthly Apprenticeship"],
    headline: "Principal ML Engineer @ DeepMind",
    specialty: "Large Language Models & Computer Vision",
    expertiseTags: ["PyTorch", "LLMs", "Python", "Computer Vision"],
    studentsCoached: "200+ teens & kids",
    responseTime: "< 4 hours",
  },
  {
    id: "elena-rostova",
    photo: "/images/Landing%20Page/Mentorship/Container-3.png",
    photoHasDot: true,
    name: "Elena Rostova",
    role: "Lead Backend Architect",
    company: "Shopify",
    years: 9,
    bio: "High-throughput concurrency, Go microservices, distributed queues with Kafka and cloud deployments on AWS.",
    rating: 4.9,
    reviews: 67,
    sessions: 94,
    price: 50,
    nextSlot: "Friday",
    technologies: ["Golang", "Kubernetes", "Kafka", "AWS"],
    techGroups: ["Go / Rust Microservices", "AWS & Cloud Infrastructure"],
    focus: ["System Design & Scalability", "Junior-to-Mid Transition"],
    formats: ["Free Intro Call (15m)", "Deep Dive 1-on-1 (45m)"],
    headline: "Lead Backend Architect @ Shopify",
    specialty: "Commerce Platform & Event Streaming",
    expertiseTags: ["Go", "Kubernetes", "Kafka", "AWS"],
    studentsCoached: "90+ teens & kids",
    responseTime: "< 3 hours",
  },
  {
    id: "david-kim",
    photo: "/images/Landing%20Page/Mentorship/AB6AXuC6YROxp2BQf4PTEesydJWbo1R1COfRQYIqS2xB-QFnJQ0v1hwyp1_IwjgRrKhNNzCGo5xmvdkBoI_I_6fMRdT6bSaqsFiKWjKWJpqzIuBZtfUdDop9MdTLU7c26f5Xs9DZSycQD7-OrWTZ9s244YIKjso7OFz7DJ_U1xnD64y2irk_FnxVM8UKkQt0LE-9QlsRCRRUBoG1GmCYADLkOlZ05RbEzNoDY3snSuGavAaUgtGQPtN2.png",
    photoHasDot: false,
    name: "David Kim",
    role: "Staff Mobile Engineer",
    company: "Airbnb",
    years: 8,
    bio: "Cross-platform mobile optimization with React Native and native iOS Swift, from first screen to the store.",
    rating: 4.8,
    reviews: 93,
    sessions: 145,
    price: 40,
    nextSlot: "Today, 5:00 PM",
    technologies: ["React Native", "Swift", "Kotlin", "Performance"],
    techGroups: ["Flutter / React Native", "TypeScript & Node.js"],
    focus: ["Portfolio & Capstone Review", "Code Review & PR Critique"],
    formats: ["Free Intro Call (15m)", "Deep Dive 1-on-1 (45m)", "Monthly Apprenticeship"],
    headline: "Staff Mobile Engineer @ Airbnb",
    specialty: "Cross-platform Apps & Performance",
    expertiseTags: ["React Native", "Swift", "Kotlin", "Performance"],
    studentsCoached: "150+ teens & kids",
    responseTime: "< 1 hour",
  },
  {
    id: "amara-okafor",
    photo: "/images/Landing%20Page/Mentorship/Container-5.png",
    photoHasDot: true,
    name: "Amara Okafor",
    role: "Senior Product Designer & Frontend Lead",
    company: "Figma",
    years: 6,
    bio: "Bridging UI engineering with refined product design. Design tokens, accessible components and polished pages.",
    rating: 5.0,
    reviews: 74,
    sessions: 118,
    price: 45,
    nextSlot: "Saturday",
    technologies: ["UI/UX", "TailwindCSS", "Accessibility", "Next.js"],
    techGroups: ["React / Next.js"],
    focus: ["Portfolio & Capstone Review", "Junior-to-Mid Transition"],
    formats: ["Free Intro Call (15m)", "Deep Dive 1-on-1 (45m)"],
    headline: "Senior Product Designer @ Figma",
    specialty: "Design Systems & Accessible Interfaces",
    expertiseTags: ["UI/UX", "Design Tokens", "Accessibility", "Next.js"],
    studentsCoached: "120+ teens & kids",
    responseTime: "< 2 hour",
  },
  {
    id: "tariq-al-mansoor",
    photo: "/images/Landing%20Page/Mentorship/Container-2.png",
    photoHasDot: true,
    name: "Tariq Al-Mansoor",
    role: "Staff DevOps & Cloud Security Lead",
    company: "Datadog",
    years: 11,
    bio: "Specialized in infrastructure as code, Terraform automation, zero-trust cloud security and CI/CD pipelines.",
    rating: 4.9,
    reviews: 51,
    sessions: 88,
    price: 55,
    nextSlot: "Wednesday",
    technologies: ["Terraform", "Docker", "CI/CD", "Security"],
    techGroups: ["AWS & Cloud Infrastructure", "Go / Rust Microservices"],
    focus: ["Mock Technical Interviews", "System Design & Scalability"],
    formats: ["Deep Dive 1-on-1 (45m)", "Monthly Apprenticeship"],
    headline: "Staff DevOps Lead @ Datadog",
    specialty: "Cloud Security & Infrastructure as Code",
    expertiseTags: ["Terraform", "Docker", "CI/CD", "Security"],
    studentsCoached: "80+ teens & kids",
    responseTime: "< 3 hours",
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
  /** Shown under the price, for example "per 45m" or "first session". */
  priceNote: string;
  popular?: boolean;
}

export const SESSION_TYPES: SessionType[] = [
  {
    id: "build",
    title: "Build & Fix My Project",
    description: "Bring your Scratch game, Roblox script, Python mini-game, or website and fix it together.",
    price: 25,
    minutes: 45,
    priceNote: "per 45m",
    popular: true,
  },
  {
    id: "learn",
    title: "Learn a New Skill",
    description: "Step-by-step interactive lesson (Python basics, HTML/CSS website, and more).",
    price: 30,
    minutes: 45,
    priceNote: "per 45m",
  },
  {
    id: "intro",
    title: "Quick Intro & Idea Chat",
    description: "Say hello, explore exciting project possibilities, and see if {mentor} is the right fit.",
    price: 0,
    minutes: 20,
    priceNote: "first session",
  },
];
