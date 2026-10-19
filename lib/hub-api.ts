/** The services hub after login (backend GET /api/v1/hub, FR-HUB-01). */
import { api } from "@/lib/api-client";

export interface Hub {
  firstName: string;
  totalXp: number;
  streakDays: number;
  courses: {
    hasTrack: boolean;
    track: { code: string; name: string } | null;
    /** Beginner, Intermediate or Advanced in the track in focus. */
    level: string | null;
    progressPercent: number | null;
  };
  mentorship: { mentor: { id: string; fullName: string; title: string; photoUrl: string } | null };
  interns: { squad: { id: string; name: string } | null };
}

export const getHub = () => api.get<Hub>("/api/v1/hub");
