/** Students Directory of the teacher (backend GET /api/v1/teacher/students). */
import { api } from "@/lib/api-client";
import type { ClassStudentStatus, Gender } from "@/lib/teacher-api";

export interface DirectoryStudent {
  studentId: string;
  fullName: string;
  email: string;
  photoUrl: string | null;
  gender: Gender | null;
  classId: string;
  className: string;
  grade: number;
  lessonsDone: number;
  lessonsTotal: number;
  problemsSolved: number;
  problemsTotal: number;
  /** 0-100; null before any graded work. */
  mastery: number | null;
  timeSpentMinutes: number;
  lastActiveUtc: string | null;
  status: ClassStudentStatus;
}

export interface StudentsDirectory {
  stats: { total: number; needsAssistance: number; onTrack: number; topQuartile: number; averageMastery: number | null };
  students: DirectoryStudent[];
}

export const getStudentsDirectory = (classId?: string) =>
  api.get<StudentsDirectory>(`/api/v1/teacher/students${classId ? `?classId=${encodeURIComponent(classId)}` : ""}`);
