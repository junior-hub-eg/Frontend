/**
 * Joining a squad ("Intern matchmaking").
 *
 * TODO(backend): confirm this endpoint with the .NET team. lib/interns-api.ts has no "join" call yet
 * (squads were created by the school). The backend should place the student in a squad with teammates of the
 * other roles and give the squad a random project, then return the squad. Until it exists the Join button shows
 * the error from the API.
 */
import { api } from "@/lib/api-client";
import type { Squad } from "@/lib/interns-api";

export const joinSquad = () => api.post<Squad>("/api/v1/interns/squad/join");
