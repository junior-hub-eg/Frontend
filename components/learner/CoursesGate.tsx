"use client";

import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { getCurrentDiscovery, getTracks, type InterviewState, type TrackSummary } from "@/lib/learning-api";
import { LearnerPageFrame } from "./LearnerPageFrame";
import CoursesPage from "./CoursesPage";
import FindYourTrack from "./FindYourTrack";

type State =
  | { kind: "loading" }
  | { kind: "find"; tracks: TrackSummary[]; inProgress: InterviewState | null }
  | { kind: "courses" };

async function load(): Promise<State> {
  try {
    const [tracks, current] = await Promise.all([getTracks(), getCurrentDiscovery().catch(() => null)]);
    if (tracks.some((t) => t.isLearning)) return { kind: "courses" };
    return { kind: "find", tracks, inProgress: current?.status === "InProgress" ? current.inProgress : null };
  } catch {
    // Without the API, still show the catalog rather than a blank page.
    return { kind: "courses" };
  }
}

/** Courses in the dashboard: "Find your track" until the student has a track, then the catalog. */
export default function CoursesGate() {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    let active = true;
    load().then((s) => active && setState(s));
    return () => {
      active = false;
    };
  }, []);

  if (state.kind === "courses") return <CoursesPage />;
  return (
    <LearnerPageFrame>
      {state.kind === "loading" ? (
        <div className="grid flex-1 place-items-center bg-[#fbfdff] p-10" role="status" aria-label="Loading">
          <LoaderCircle className="size-8 animate-spin text-[#12939b]" />
        </div>
      ) : (
        <FindYourTrack tracks={state.tracks} inProgress={state.inProgress} />
      )}
    </LearnerPageFrame>
  );
}
