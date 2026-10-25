/** Announcements from the admin, for the signed-in person's role (backend AnnouncementsController). */
import { api } from "@/lib/api-client";

export type AnnouncementAudience = "Everyone" | "Students" | "Mentors" | "Teachers";

export interface Announcement {
  id: string;
  title: string;
  body: string;
  audience: AnnouncementAudience;
  /** Only students of this track see it; null for all. */
  trackCode: string | null;
  trackName: string | null;
  isPinned: boolean;
  expiresUtc: string | null;
  createdUtc: string;
  updatedUtc: string;
}

/** The ones shown now: pinned first, newest first; drafts and scheduled ones are left out by the backend. */
export const getMyAnnouncements = () => api.get<Announcement[]>("/api/v1/announcements");
