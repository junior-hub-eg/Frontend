/**
 * AI concept videos of the teacher's "AI Integration" page (backend TeachingAiControllers, 30 Oct 2026): the AI summarizes a
 * short video once, suggests 3 ways to link it to the teacher's subject, and writes a 2-question Quick Check on the link the
 * teacher approved; the teacher publishes it to some of their classes.
 */
import { api } from "@/lib/api-client";
import type { SchoolSubject } from "@/lib/teacher-api";

export type ConceptLanguage = "ar" | "en";

export interface ConceptVideo {
  id: string;
  key: string;
  /** English; translate with t(). */
  title: string;
  videoUrl: string;
  minutes: number;
  /** The teacher can use it now (status "Open"). */
  available: boolean;
  /** "Locked" until the teacher publishes the video before it; "ComingSoon" while it has no transcript. */
  status: "Open" | "Locked" | "ComingSoon";
}

export interface ConceptClass {
  id: string;
  name: string;
  grade: number;
}

/** "What it is", "How it works" or "Where it's used" (translate the title with t()). */
export interface SummaryPoint {
  title: string;
  text: string;
}

export interface TeacherConceptLesson {
  id: string;
  video: ConceptVideo;
  subject: SchoolSubject;
  grade: number;
  language: ConceptLanguage;
  summary: SummaryPoint[];
  linkText: string;
  fromAi: boolean;
  questions: { question: string; options: string[]; answerIndex: number; explanation: string }[];
  /** XP for a fully right Quick Check. */
  xp: number;
  published: boolean;
  classes: ConceptClass[];
  /** Students who answered the Quick Check. */
  answered: number;
  createdUtc: string;
  publishedUtc: string | null;
}

export interface ConceptVideosPage {
  videos: ConceptVideo[];
  /** The teacher's subjects: the ones a video can be linked to. */
  subjects: SchoolSubject[];
  grades: number[];
  classes: ConceptClass[];
  xp: number;
  /** Published lessons, newest first. */
  lessons: TeacherConceptLesson[];
}

export const getConceptVideos = () => api.get<ConceptVideosPage>("/api/v1/teacher/concept-videos");

export const getConceptSummary = (videoId: string, language: ConceptLanguage) =>
  api.get<{ videoId: string; language: ConceptLanguage; points: SummaryPoint[] }>(
    `/api/v1/teacher/concept-videos/${videoId}/summary?language=${language}`,
  );

/** `avoid`: the ideas already shown, so "Suggest new ideas" gives new ones. */
export const suggestConceptIdeas = (videoId: string, subject: SchoolSubject, language: ConceptLanguage, avoid: string[] = []) =>
  api.post<{ videoId: string; subject: SchoolSubject; grade: number; ideas: string[] }>(
    `/api/v1/teacher/concept-videos/${videoId}/link-ideas`,
    { subject, language, avoid },
  );

/** The approved link: the AI writes the Quick Check and the lesson is kept as a draft for the preview. */
export const approveConceptLink = (videoId: string, subject: SchoolSubject, linkText: string, fromAi: boolean, language: ConceptLanguage) =>
  api.post<TeacherConceptLesson>(`/api/v1/teacher/concept-videos/${videoId}/lessons`, { subject, linkText, fromAi, language });

export const publishConceptLesson = (lessonId: string, classIds: string[]) =>
  api.post<TeacherConceptLesson>(`/api/v1/teacher/concept-lessons/${lessonId}/publish`, { classIds });
