import { api } from "@/lib/api-client";

/** Recruitment Practice (US-36 to US-40): practice jobs at fictional companies, always a simulation. */

export type ApplicationStatus = "Applied" | "InterviewPassed" | "InterviewNotPassed";

export interface CertificateRef {
  code: string;
  issuedUtc: string;
}

export interface MyApplication {
  status: ApplicationStatus;
  appliedUtc: string;
  attempts: number;
  bestScorePercent: number | null;
  certificate: CertificateRef | null;
}

export interface PracticeJob {
  id: string;
  companyName: string;
  role: string;
  trackCode: string;
  trackName: string;
  level: string;
  skills: string[];
  description: string;
  isSimulation: boolean;
  /** In a track the student learns (listed first). */
  inMyTracks: boolean;
  /** Null until the student applies. */
  myApplication: MyApplication | null;
}

export interface JobList {
  isSimulation: boolean;
  label: string;
  disclaimer: string;
  jobs: PracticeJob[];
}

export interface InterviewQuestion {
  id: string;
  prompt: string;
  options: string[];
}

export interface JobDetail {
  job: PracticeJob;
  disclaimer: string;
  /** Empty until the student applies. */
  questions: InterviewQuestion[];
}

export interface InterviewAnswer {
  questionId: string;
  prompt: string;
  options: string[];
  chosen: number;
  correctOptionIndex: number;
  correct: boolean;
  feedback: string;
}

export interface InterviewResult {
  attemptNo: number;
  scorePercent: number;
  passed: boolean;
  passPercent: number;
  xpAwarded: number;
  totalXp: number;
  results: InterviewAnswer[];
  certificate: CertificateRef | null;
  /** On a pass: "Simulation completed. This is not a job offer." */
  disclaimer: string | null;
}

export interface Certificate {
  code: string;
  studentName: string;
  role: string;
  companyName: string;
  trackName: string;
  scorePercent: number;
  issuedUtc: string;
  isSimulation: boolean;
  disclaimer: string;
}

export const getPracticeJobs = () => api.get<JobList>("/api/v1/recruitment/jobs");
export const getPracticeJob = (id: string) => api.get<JobDetail>(`/api/v1/recruitment/jobs/${id}`);
export const applyToPracticeJob = (id: string) => api.post<JobDetail>(`/api/v1/recruitment/jobs/${id}/apply`);
export const submitPracticeInterview = (id: string, answers: number[]) =>
  api.post<InterviewResult>(`/api/v1/recruitment/jobs/${id}/interview`, { answers });
export const getMyCertificates = () => api.get<Certificate[]>("/api/v1/student/certificates");
export const verifyCertificate = (code: string) => api.get<Certificate>(`/api/v1/recruitment/certificates/${encodeURIComponent(code)}`);
