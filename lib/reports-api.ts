/**
 * Report trends, Excel exports and the e-mailed report schedule for the mentor (monitor) and the teacher.
 * Trends come in weekly buckets for the chosen range, plus totals for this range and the one before it.
 */
import { api, downloadFile } from "@/lib/api-client";

export type ReportLang = "en" | "ar";

export interface TrendsResponse<K extends string> {
  from: string;
  to: string;
  bucket: "Week";
  series: { start: string; values: Record<K, number | null> }[];
  current: Record<K, number | null>;
  previous: Record<K, number | null>;
}

export const MENTOR_TREND_KEYS = ["tasksDone", "storyPoints", "activeMembers", "reviews", "sessionsCompleted", "chatMessages"] as const;
export type MentorTrendKey = (typeof MENTOR_TREND_KEYS)[number];
export type MentorTrends = TrendsResponse<MentorTrendKey>;

export const TEACHER_TREND_KEYS = ["activeStudents", "lessonsPassed", "assignmentsSubmitted", "averageScore"] as const;
export type TeacherTrendKey = (typeof TEACHER_TREND_KEYS)[number];
export type TeacherTrends = TrendsResponse<TeacherTrendKey>;

function query(params: Record<string, string | undefined>) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
  return q.toString();
}

export const getMentorTrends = (squadId: string | undefined, from: string, to: string) =>
  api.get<MentorTrends>(`/api/v1/monitor/reports/trends?${query({ squadId, from, to })}`);

export const exportMentorExcel = (squadId: string | undefined, from: string, to: string, lang: ReportLang) =>
  downloadFile(`/api/v1/monitor/reports/export?${query({ squadId, from, to, lang })}`, `mentor-report-${from}-${to}-${lang}.xlsx`);

export const getTeacherTrends = (classId: string | undefined, from: string, to: string) =>
  api.get<TeacherTrends>(`/api/v1/teacher/progress/trends?${query({ classId, from, to })}`);

export const exportTeacherExcel = (classId: string | undefined, from: string, to: string, lang: ReportLang) =>
  downloadFile(`/api/v1/teacher/progress/export?${query({ classId, from, to, lang })}`, `progress-report-${from}-${to}-${lang}.xlsx`);

export interface ReportSchedule {
  enabled: boolean;
  frequency: "Weekly" | "Monthly";
  /** 0 = Sunday … 6 = Saturday (weekly). */
  dayOfWeek: number;
  /** 1-28 (monthly). */
  dayOfMonth: number;
  language: ReportLang;
  email: string | null;
  lastSentUtc: string | null;
  nextSendUtc: string | null;
}

export type ReportScheduleInput = Omit<ReportSchedule, "email" | "lastSentUtc" | "nextSendUtc">;

export const getReportSchedule = () => api.get<ReportSchedule>("/api/v1/me/report-schedule");
export const saveReportSchedule = (schedule: ReportScheduleInput) => api.put<ReportSchedule>("/api/v1/me/report-schedule", schedule);
export const sendReportNow = () => api.post<void>("/api/v1/me/report-schedule/send-now");
