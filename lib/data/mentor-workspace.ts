/**
 * Demo data for the mentor workspace screens (Figma: "Mentor - Home & Setup" and the pages after it).
 * There is no backend for sessions / availability / feedback / messages yet, so the screens read from here.
 * When the API lands, replace these constants with calls in lib/mentor-api.ts and keep the types.
 */
import { tk } from "@/lib/i18n/translate";

export type SessionStatus = "Upcoming" | "Completed" | "NoShow";

export interface MentorSession {
  id: string;
  studentId: string;
  student: string;
  initials: string;
  track: string;
  date: string; // "Tue, March 18"
  time: string; // "4:00-4:45 PM"
  status: SessionStatus;
  topic: string;
  agenda: string;
  meetingLink: string;
}

export const MENTOR_SESSIONS: MentorSession[] = [
  {
    id: "s1",
    studentId: "sara-hassan",
    student: "Sara Hassan",
    initials: "SH",
    track: "Frontend",
    date: "Tue, March 18",
    time: "4:00-4:45 PM",
    status: "Upcoming",
    topic: tk("Learning-index and follow-up"),
    agenda: tk("Review the responsive layouts exercise and plan the next two weeks of practice."),
    meetingLink: "https://meet.juniorhub.demo/mentor-alex",
  },
  {
    id: "s2",
    studentId: "omar-ali",
    student: "Omar Ali",
    initials: "OA",
    track: "Data Analysis",
    date: "Thu, March 20",
    time: "5:30-6:15 PM",
    status: "Upcoming",
    topic: tk("Data cleaning walkthrough"),
    agenda: tk("Go through the cleaning steps on the sales dataset and discuss common mistakes."),
    meetingLink: "https://meet.juniorhub.demo/mentor-alex",
  },
  {
    id: "s3",
    studentId: "lina-mostafa",
    student: "Lina Mostafa",
    initials: "LM",
    track: "UI/UX Design",
    date: "Mon, March 10",
    time: "3:00-3:45 PM",
    status: "Completed",
    topic: tk("Portfolio feedback"),
    agenda: tk("Feedback on the case study structure."),
    meetingLink: "https://meet.juniorhub.demo/mentor-alex",
  },
  {
    id: "s4",
    studentId: "youssef-nabil",
    student: "Youssef Nabil",
    initials: "YN",
    track: "Backend",
    date: "Fri, March 7",
    time: "6:00-6:45 PM",
    status: "NoShow",
    topic: tk("API basics"),
    agenda: tk("Intro to REST endpoints."),
    meetingLink: "https://meet.juniorhub.demo/mentor-alex",
  },
];

export interface MentorStudent {
  id: string;
  name: string;
  initials: string;
  track: string;
  progressTitle: string;
  progress: number;
  completedLessons: number;
  pendingTasks: number;
  recent: { title: string; when: string; done: boolean }[];
  nextSteps: string[];
  badges: string[];
}

export const MENTOR_STUDENTS: MentorStudent[] = [
  {
    id: "sara-hassan",
    name: "Sara Hassan",
    initials: "SH",
    track: "Frontend",
    progressTitle: tk("Responsive Web Foundations"),
    progress: 72,
    completedLessons: 18,
    pendingTasks: 2,
    recent: [
      { title: tk("CSS Flexbox Essentials"), when: tk("Completed 2 days ago"), done: true },
      { title: tk("Responsive Breakpoints"), when: tk("Completed 4 days ago"), done: true },
      { title: tk("Accessible Navigation"), when: tk("In progress"), done: false },
    ],
    nextSteps: [tk("Finish the layout challenge"), tk("Book a follow-up session")],
    badges: [tk("Layout Starter"), tk("HTML/CSS Foundations")],
  },
  {
    id: "omar-ali",
    name: "Omar Ali",
    initials: "OA",
    track: "Data Analysis",
    progressTitle: tk("Data Cleaning Basics"),
    progress: 58,
    completedLessons: 14,
    pendingTasks: 2,
    recent: [
      { title: tk("Handling Missing Values"), when: tk("Completed yesterday"), done: true },
      { title: tk("Pivot Tables"), when: tk("Completed 3 days ago"), done: true },
      { title: tk("Normalizing Datasets"), when: tk("In progress"), done: false },
    ],
    nextSteps: [tk("Finish the cleaning exercise")],
    badges: [tk("Data Starter"), tk("Cleanup Pro")],
  },
];

export interface AvailabilityDay {
  key: string;
  label: string;
  short: string;
  slots: { time: string; booked?: boolean }[];
}

export const WEEK_AVAILABILITY: AvailabilityDay[] = [
  { key: "mon", label: tk("Monday"), short: tk("Mon"), slots: [{ time: "4:00 PM", booked: true }] },
  { key: "tue", label: tk("Tuesday"), short: tk("Tue"), slots: [{ time: "4:00 PM" }, { time: "5:30 PM", booked: true }] },
  { key: "wed", label: tk("Wednesday"), short: tk("Wed"), slots: [] },
  { key: "thu", label: tk("Thursday"), short: tk("Thu"), slots: [{ time: "5:30 PM" }, { time: "7:00 PM" }] },
  { key: "fri", label: tk("Friday"), short: tk("Fri"), slots: [] },
  { key: "sat", label: tk("Saturday"), short: tk("Sat"), slots: [{ time: "11:00 AM" }] },
  { key: "sun", label: tk("Sunday"), short: tk("Sun"), slots: [] },
];

export interface FeedbackItem {
  id: string;
  student: string;
  initials: string;
  track: string;
  rating: number;
  comment: string;
}

export const MENTOR_FEEDBACK: FeedbackItem[] = [
  { id: "f1", student: "Sara H.", initials: "SH", track: "Frontend mentorship", rating: 5, comment: tk("Alex explained responsive layouts in a way that finally clicked for me.") },
  { id: "f2", student: "Lina M.", initials: "LM", track: "UI/UX Design mentorship", rating: 4.5, comment: tk("The portfolio feedback was specific and easy to act on.") },
  { id: "f3", student: "Omar A.", initials: "OA", track: "Data Analysis mentorship", rating: 5, comment: tk("Clear steps, and always patient with my questions.") },
];

export interface Conversation {
  id: string;
  student: string;
  initials: string;
  track: string;
  preview: string;
  time: string;
  unread: number;
  messages: { id: string; from: "student" | "mentor"; text: string; time: string }[];
}

export const MENTOR_CONVERSATIONS: Conversation[] = [
  {
    id: "c1",
    student: "Sara Hassan",
    initials: "SH",
    track: "Frontend",
    preview: tk("I think I finished the layout you suggested."),
    time: "10:42",
    unread: 1,
    messages: [
      { id: "m1", from: "student", text: tk("Hi Alex! I think I finished the layout you suggested."), time: "10:40" },
      { id: "m2", from: "mentor", text: tk("Great work, Sara. Can you share the link before our session?"), time: "10:41" },
      { id: "m3", from: "student", text: tk("Sure, I'll send it in a minute."), time: "10:42" },
    ],
  },
  {
    id: "c2",
    student: "Omar Ali",
    initials: "OA",
    track: "Data Analysis",
    preview: tk("Thank you, that helps a lot."),
    time: "Yesterday",
    unread: 1,
    messages: [
      { id: "m4", from: "mentor", text: tk("Try handling the missing values before you merge the tables."), time: "Yesterday" },
      { id: "m5", from: "student", text: tk("Thank you, that helps a lot."), time: "Yesterday" },
    ],
  },
  {
    id: "c3",
    student: "Lina Mostafa",
    initials: "LM",
    track: "UI/UX Design",
    preview: tk("The new case study is ready for review."),
    time: "Mon",
    unread: 0,
    messages: [{ id: "m6", from: "student", text: tk("The new case study is ready for review."), time: "Mon" }],
  },
];

export const MENTOR_NOTIFICATIONS = [
  { id: "n1", title: tk("Session reminder"), body: tk("Sara Hassan - tomorrow at 4:00 PM"), href: "/mentor/sessions/s1" },
  { id: "n2", title: tk("New message from Sara"), body: tk("Sent a link before your session"), href: "/mentor/messages" },
  { id: "n3", title: tk("Availability saved"), body: tk("Your weekly slots are up to date"), href: "/mentor/availability" },
  { id: "n4", title: tk("New feedback received"), body: tk("A student left a 5-star rating"), href: "/mentor/feedback" },
];
