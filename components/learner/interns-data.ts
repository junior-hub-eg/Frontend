"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, errorMessage } from "@/lib/api-client";
import { avatarOrDefault } from "@/lib/avatars";
import {
  getLeaderboard,
  getSprint,
  getSquad,
  getTasks,
  type Leaderboard,
  type Squad,
  type SquadRole,
  type Sprint,
  type TaskBoard,
} from "@/lib/interns-api";

/** The student's chosen avatar, or a default from the same avatar pack, by their place in the squad. */
export function avatarFor(photoUrl: string | null, index: number) {
  const a = avatarOrDefault(photoUrl, index);
  return { src: a.src, bg: a.bg };
}

/** Place of each student in the squad, so a student has the same avatar everywhere. */
export function memberIndex(squad: Squad | null): Map<string, number> {
  return new Map((squad?.members ?? []).map((m, i) => [m.studentId, i]));
}

export const ROLE_TITLE: Record<SquadRole, string> = {
  Frontend: "Front-end Developer",
  Backend: "Back-end Developer",
  UIUX: "UI/UX Designer",
  AI: "AI Engineer",
  Testing: "QA Tester",
  Data: "Data Analyst",
  Mobile: "Mobile Developer",
  Gaming: "Game Developer",
};

/** Task tags, coloured like the Figma (Backend red, Frontend orange). */
export const ROLE_TAG: Record<SquadRole, { label: string; bg: string; text: string }> = {
  Frontend: { label: "Frontend", bg: "#ffdcc8", text: "#c2571a" },
  Backend: { label: "Backend", bg: "#fbd5d5", text: "#b83232" },
  UIUX: { label: "UI/UX", bg: "#fbd5ea", text: "#b8327a" },
  AI: { label: "AI", bg: "#e6dcfb", text: "#6b2fd1" },
  Testing: { label: "Testing", bg: "#d7f5e4", text: "#1f9d5b" },
  Data: { label: "Data", bg: "#dcecfb", text: "#2f7fd6" },
  Mobile: { label: "Mobile", bg: "#fff1c9", text: "#a86a00" },
  Gaming: { label: "Gaming", bg: "#e1e4ea", text: "#14365a" },
};

function friendly(e: unknown) {
  if (e instanceof ApiError && e.code === "NO_SQUAD") return "You are not in a squad yet. Your school will add you to one soon.";
  if (e instanceof ApiError && e.code === "NO_ACTIVE_SPRINT") return "Your squad has no sprint running right now.";
  return errorMessage(e, "We couldn't load your squad. Please try again.");
}

/** The student's squad only (dashboard teammates). */
export function useSquad() {
  const [squad, setSquad] = useState<Squad | null>(null);

  useEffect(() => {
    let active = true;
    getSquad()
      .then((s) => active && setSquad(s))
      .catch(() => active && setSquad(null));
    return () => {
      active = false;
    };
  }, []);

  return squad;
}

type Loaded =
  | { squad: Squad; sprint: Sprint; board: TaskBoard; leaderboard: Leaderboard }
  | { error: string };

async function loadAll(): Promise<Loaded> {
  try {
    const [squad, sprint, board, leaderboard] = await Promise.all([getSquad(), getSprint(), getTasks(), getLeaderboard()]);
    return { squad, sprint, board, leaderboard };
  } catch (e) {
    return { error: friendly(e) };
  }
}

/** Everything the Internship page shows. reload() fetches it again, for example after moving a task. */
export function useInterns() {
  const [squad, setSquad] = useState<Squad | null>(null);
  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [board, setBoard] = useState<TaskBoard | null>(null);
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apply = useCallback((result: Loaded) => {
    if ("error" in result) return setError(result.error);
    setSquad(result.squad);
    setSprint(result.sprint);
    setBoard(result.board);
    setLeaderboard(result.leaderboard);
    setError(null);
  }, []);

  const reload = useCallback(() => loadAll().then(apply), [apply]);

  useEffect(() => {
    let active = true;
    loadAll().then((result) => active && apply(result));
    return () => {
      active = false;
    };
  }, [apply]);

  return { squad, sprint, board, leaderboard, error, reload };
}
