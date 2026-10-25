/** Announcements from the admin, for the signed-in person's role (backend AnnouncementsController). */
import { api } from "@/lib/api-client";
import type { Announcement } from "@/lib/admin-api";

export type { Announcement };

/** The ones shown now: pinned first, newest first; drafts and scheduled ones are left out by the backend. */
export const getMyAnnouncements = () => api.get<Announcement[]>("/api/v1/announcements");
