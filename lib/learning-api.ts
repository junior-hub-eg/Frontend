/**
 * Tracks, Track Discovery and lessons (backend TracksController, DiscoveryController, LessonsController,
 * StudentController). Errors are thrown as ApiError with the backend's code.
 */
import { api, API_BASE_URL } from "@/lib/api-client";

export type TrackLevel = "Beginner" | "Intermediate" | "Advanced";
/** KnowsTrack: "I know what I want", Exploring: "I have no idea", Unsure: the normal interview. */
export type DiscoveryPath = "KnowsTrack" | "Unsure" | "Exploring";

export interface TrackSummary {
  code: string;
  name: string;
  shortDescription: string;
  iconKey: string;
  hasLessons: boolean;
  videoCount: number;
  recommendation: { rank: number; matchPercent: number; level: TrackLevel; reason: string } | null;
  isLearning: boolean;
  isFocus: boolean;
}

export interface SelectTrackResult {
  focus: string;
  level: TrackLevel;
  changed: boolean;
  learning: string[];
}

export const getTracks = () => api.get<TrackSummary[]>("/api/v1/tracks");
export const selectTrack = (trackCode: string) => api.put<SelectTrackResult>("/api/v1/student/track", { trackCode });

export interface DiscoveryQuestion {
  orderIndex: number;
  text: string;
  audioBase64: string | null;
  audioMimeType: string | null;
}

export interface InterviewState {
  interviewId: string;
  resumed: boolean;
  maxQuestions: number;
  maxMinutes: number;
  answeredCount: number;
  canFinishNow: boolean;
  question: DiscoveryQuestion;
  path: DiscoveryPath;
}

export interface AnswerResult {
  answered: { orderIndex: number; transcript: string } | null;
  nextQuestion: DiscoveryQuestion | null;
  finished: boolean;
  canFinishNow: boolean;
  /** The voice answer could not be understood: ask for a typed one. */
  retryAsText: boolean;
}

export interface Recommendation {
  rank: number;
  trackCode: string;
  trackName: string;
  matchPercent: number;
  reason: string;
  level: TrackLevel;
  levelReason: string;
}

export interface DiscoveryResult {
  interviewId: string;
  summary: string | null;
  recommendations: Recommendation[];
  completedUtc: string;
}

export interface CurrentDiscovery {
  /** None, InProgress or Completed. */
  status: string;
  inProgress: InterviewState | null;
  result: DiscoveryResult | null;
}

const BASE = "/api/v1/discovery/interviews";

export const startInterview = (path: DiscoveryPath, startAgain = false, trackCode?: string) =>
  api.post<InterviewState>(BASE, { path, startAgain, trackCode });
export const getCurrentDiscovery = () => api.get<CurrentDiscovery>(`${BASE}/current`);
export const answerTyped = (id: string, orderIndex: number, text: string) =>
  api.post<AnswerResult>(`${BASE}/${id}/answers`, { orderIndex, text });

export function answerVoice(id: string, orderIndex: number, audio: Blob) {
  const form = new FormData();
  form.set("orderIndex", String(orderIndex));
  form.set("audio", audio, `answer.${audio.type.includes("ogg") ? "ogg" : audio.type.includes("mp4") ? "mp4" : "webm"}`);
  return api.postForm<AnswerResult>(`${BASE}/${id}/answers`, form);
}

export const finishInterview = (id: string) => api.post<DiscoveryResult>(`${BASE}/${id}/finish`);
export const abandonInterview = (id: string) => api.post<void>(`${BASE}/${id}/abandon`);

/* ---------- Track pages: videos, track quiz and lessons ---------- */

/** Route segment for a track: its code in lower case (/learner/courses/frontend). */
export const trackPath = (code: string) => `/learner/courses/${code.toLowerCase()}`;
export const lessonPath = (code: string, lessonId: string) => `${trackPath(code)}/lessons/${lessonId}`;

export interface TrackVideo {
  id: string;
  title: string;
  fileUrl: string;
  posterUrl: string | null;
  durationSeconds: number;
  watchedPercent: number;
  completed: boolean;
}

/** A question without its answer. */
export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
}

export interface TrackDetail {
  code: string;
  name: string;
  shortDescription: string;
  iconKey: string;
  hasLessons: boolean;
  isLearning: boolean;
  videos: TrackVideo[];
  /** Unlocked once a video of the track is completed. */
  quiz: { unlocked: boolean; passed: boolean; questions: QuizQuestion[] };
}

export type LessonStatus = "NotStarted" | "InProgress" | "Done";

export interface LessonSummary {
  id: string;
  title: string;
  concept: string;
  level: TrackLevel;
  durationSeconds: number;
  status: LessonStatus;
  hasSchoolLink: boolean;
}

export interface TrackLessons {
  trackCode: string;
  trackName: string;
  level: TrackLevel;
  hasLessons: boolean;
  /** The first unfinished lesson from the student's starting level. */
  nextLessonId: string | null;
  modules: { id: string; title: string; lessons: LessonSummary[] }[];
}

export interface VideoProgress {
  videoId: string;
  watchedPercent: number;
  completed: boolean;
  xpAwarded: number;
  totalXp: number;
}

export interface TrackQuizResult {
  score: number;
  total: number;
  passed: boolean;
  xpAwarded: number;
  totalXp: number;
  results: { questionId: string; chosenOptionIndex: number; correctOptionIndex: number; correct: boolean; explanation: string }[];
}

export const getTrack = (code: string) => api.get<TrackDetail>(`/api/v1/tracks/${encodeURIComponent(code)}`);
export const getTrackLessons = (code: string) => api.get<TrackLessons>(`/api/v1/tracks/${encodeURIComponent(code)}/lessons`);
export const recordVideoProgress = (code: string, videoId: string, percent: number) =>
  api.put<VideoProgress>(`/api/v1/tracks/${encodeURIComponent(code)}/videos/${videoId}/progress`, { percent });
export const submitTrackQuiz = (code: string, answers: number[]) =>
  api.post<TrackQuizResult>(`/api/v1/tracks/${encodeURIComponent(code)}/quiz-attempts`, { answers });

export type LessonStep = "SchoolLink" | "Video" | "TryIt";

export interface LessonProgress {
  /** SchoolLink, Video, TryIt, Quiz or Done. */
  currentStep: string;
  schoolLinkDone: boolean;
  videoDone: boolean;
  tryItDone: boolean;
  quizAttempts: number;
  done: boolean;
}

export interface Badge {
  code: string;
  name: string;
  iconKey: string;
}

export interface SchoolLink {
  subject: string;
  grade: number;
  unit: string;
  schoolLessonTitle: string;
  cardHeadline: string;
  schoolExample: string;
  bridgeText: string;
  graphSpec: string | null;
  badge: Badge;
}

export interface Lesson {
  id: string;
  title: string;
  concept: string;
  level: TrackLevel;
  trackCode: string;
  moduleTitle: string;
  videoUrl: string;
  durationSeconds: number;
  xpReward: number;
  /** JavaScript the student runs in the browser; it should print expectedOutput. */
  /** null for lessons with no code to run (design, testing…): no Try it step. */
  tryIt: { starterCode: string; expectedOutput: string } | null;
  /** Only when the lesson links to a school lesson of the student's grade. */
  schoolLink: SchoolLink | null;
  questions: (QuizQuestion & { isSchoolLinked: boolean })[];
  progress: LessonProgress;
}

export interface LessonQuizResult {
  results: { questionId: string; correct: boolean; helpIfWrong: string | null }[];
  lessonDone: boolean;
  xpAwarded: number;
  totalXp: number;
  /** The badge earned now, or null. */
  badge: Badge | null;
  progress: LessonProgress;
}

export const getLesson = (id: string) => api.get<Lesson>(`/api/v1/lessons/${id}`);
export const completeLessonStep = (id: string, step: LessonStep) => api.put<LessonProgress>(`/api/v1/lessons/${id}/steps/${step}`);
export const submitLessonQuiz = (id: string, answers: number[]) =>
  api.post<LessonQuizResult>(`/api/v1/lessons/${id}/quiz-attempts`, { answers });

/** Media paths from the API (/media/...) are served by the backend. */
export const mediaUrl = (path: string) => (/^https?:\/\//.test(path) ? path : `${API_BASE_URL}${path}`);

/* ---------- Achievements (StudentController) ---------- */

export interface Achievements {
  totalXp: number;
  streakDays: number;
  badges: { code: string; name: string; type: string; iconKey: string; earnedUtc: string }[];
}

export const getAchievements = () => api.get<Achievements>("/api/v1/student/achievements");

/* ---------- Placement test ("I know my track") ---------- */

export interface PlacementTest {
  trackCode: string;
  trackName: string;
  questions: QuizQuestion[];
}

export interface PlacementResult {
  trackCode: string;
  trackName: string;
  /** Where the student starts in the track. */
  level: TrackLevel;
  score: number;
  total: number;
  results: { questionId: string; correct: boolean; correctOptionIndex: number; explanation: string }[];
  /** The track is now in focus at this level. */
  track: SelectTrackResult;
}

export const getPlacementTest = (code: string) => api.get<PlacementTest>(`/api/v1/tracks/${encodeURIComponent(code)}/placement`);
export const submitPlacementTest = (code: string, answers: number[]) =>
  api.post<PlacementResult>(`/api/v1/tracks/${encodeURIComponent(code)}/placement`, { answers });

/* ---------- Courses with levels (decision of 21 Oct 2026) ---------- */

export type CourseStatus = "Locked" | "Open" | "Done";
/** Skipped: below the student's level from the placement test, open to review. */
export type LevelStatus = "Locked" | "Open" | "Done" | "Skipped";

export interface CourseLevel {
  level: TrackLevel;
  status: LevelStatus;
  lessons: { id: string; title: string; durationSeconds: number; status: LessonStatus }[];
  /** 0 when the level has no exam yet. */
  examQuestions: number;
  examPassed: boolean;
}

export interface Course {
  id: string;
  title: string;
  summary: string;
  iconKey: string;
  status: CourseStatus;
  levels: CourseLevel[];
}

export interface TrackCourses {
  trackCode: string;
  trackName: string;
  /** The student's level in the track (from the placement test or the interview). */
  level: TrackLevel;
  courses: Course[];
}

export interface LevelExam {
  trackCode: string;
  courseId: string;
  courseTitle: string;
  level: TrackLevel;
  questions: QuizQuestion[];
}

export interface LevelExamResult {
  score: number;
  total: number;
  passed: boolean;
  xpAwarded: number;
  totalXp: number;
  results: { questionId: string; correct: boolean; correctOptionIndex: number; explanation: string }[];
}

export const getTrackCourses = (code: string) => api.get<TrackCourses>(`/api/v1/tracks/${encodeURIComponent(code)}/courses`);
const examPath = (code: string, courseId: string, level: string) =>
  `/api/v1/tracks/${encodeURIComponent(code)}/courses/${courseId}/levels/${level}/exam`;
export const getLevelExam = (code: string, courseId: string, level: string) => api.get<LevelExam>(examPath(code, courseId, level));
export const submitLevelExam = (code: string, courseId: string, level: string, answers: number[]) =>
  api.post<LevelExamResult>(examPath(code, courseId, level), { answers });

export const coursePath = (code: string, courseId: string) => `${trackPath(code)}/course/${courseId}`;
/** Level 1, 2 and 3 in the pages, Beginner / Intermediate / Advanced in the API. */
export const LEVEL_NUMBER: Record<TrackLevel, number> = { Beginner: 1, Intermediate: 2, Advanced: 3 };
