/**
 * Tracks, Track Discovery and lessons (backend TracksController, DiscoveryController, LessonsController,
 * StudentController). Errors are thrown as ApiError with the backend's code.
 */
import { api } from "@/lib/api-client";

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
