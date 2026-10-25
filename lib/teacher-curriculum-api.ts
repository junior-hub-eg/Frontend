/**
 * The teacher's curriculum tree (Unit -> Lesson -> Problem) and its editors (TeacherController, "curriculum").
 * Shapes follow the backend records in JuniorHub.Application/Teachers/TeacherCurriculumAndGradebookHandlers.cs.
 */
import { api } from "@/lib/api-client";
import type { SchoolSubject } from "@/lib/teacher-api";

/** "Published" or "Draft" (free text on the backend; these are the two the UI sets). */
export type CurriculumStatus = "Published" | "Draft" | (string & {});
/** "Beginner" | "Intermediate" | "Advanced" (free text on the backend). */
export type ProblemDifficulty = "Beginner" | "Intermediate" | "Advanced" | (string & {});

export interface CurriculumProblem {
  id: string;
  lessonId: string;
  titleAr: string;
  titleEn: string;
  statementAr: string;
  statementEn: string;
  difficulty: ProblemDifficulty;
  topic: string;
  /** JSON array of { order, textAr, textEn }. */
  stepsJson: string;
  answer: string;
  /** JSON array of strings. */
  acceptedFormatsJson: string;
  /** JSON array of strings. */
  hintsJson: string;
  simulationType: string | null;
  simulationParamsJson: string | null;
  orderIndex: number;
}

export interface CurriculumLesson {
  id: string;
  unitId: string;
  titleAr: string;
  titleEn: string;
  summaryAr: string | null;
  summaryEn: string | null;
  orderIndex: number;
  status: CurriculumStatus;
  problems: CurriculumProblem[];
}

export interface CurriculumUnit {
  id: string;
  subject: string;
  grade: number;
  titleAr: string;
  titleEn: string;
  descriptionAr: string | null;
  descriptionEn: string | null;
  orderIndex: number;
  status: CurriculumStatus;
  lessons: CurriculumLesson[];
}

export interface NewCurriculumUnit {
  subject: SchoolSubject;
  grade: number;
  titleAr: string;
  titleEn: string;
  descriptionAr: string | null;
  descriptionEn: string | null;
  orderIndex: number;
}

export interface UpdateCurriculumUnit {
  titleAr: string;
  titleEn: string;
  descriptionAr: string | null;
  descriptionEn: string | null;
  orderIndex: number;
  status: CurriculumStatus;
}

export interface NewCurriculumLesson {
  unitId: string;
  titleAr: string;
  titleEn: string;
  summaryAr: string | null;
  summaryEn: string | null;
  orderIndex: number;
}

export interface UpdateCurriculumLesson {
  titleAr: string;
  titleEn: string;
  summaryAr: string | null;
  summaryEn: string | null;
  orderIndex: number;
  status: CurriculumStatus;
}

export type SaveCurriculumProblem = Omit<CurriculumProblem, "id" | "lessonId">;
export type NewCurriculumProblem = SaveCurriculumProblem & { lessonId: string };

const BASE = "/api/v1/teacher/curriculum";

export const getCurriculum = (subject?: SchoolSubject, grade?: number) => {
  const q = new URLSearchParams();
  if (subject) q.set("subject", subject);
  if (grade != null) q.set("grade", String(grade));
  const qs = q.toString();
  return api.get<CurriculumUnit[]>(`${BASE}${qs ? `?${qs}` : ""}`);
};

export const createCurriculumUnit = (body: NewCurriculumUnit) => api.post<CurriculumUnit>(`${BASE}/units`, body);
export const updateCurriculumUnit = (id: string, body: UpdateCurriculumUnit) => api.put<CurriculumUnit>(`${BASE}/units/${id}`, body);

export const createCurriculumLesson = (body: NewCurriculumLesson) => api.post<CurriculumLesson>(`${BASE}/lessons`, body);
export const updateCurriculumLesson = (id: string, body: UpdateCurriculumLesson) => api.put<CurriculumLesson>(`${BASE}/lessons/${id}`, body);

export const createCurriculumProblem = (body: NewCurriculumProblem) => api.post<CurriculumProblem>(`${BASE}/problems`, body);
export const updateCurriculumProblem = (id: string, body: SaveCurriculumProblem) =>
  api.put<CurriculumProblem>(`${BASE}/problems/${id}`, body);
