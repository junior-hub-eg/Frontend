import DiscoveryInterview from "@/components/learner/DiscoveryInterview";
import { LearnerPageFrame } from "@/components/learner/LearnerPageFrame";
import type { DiscoveryPath } from "@/lib/learning-api";

const PATHS: DiscoveryPath[] = ["KnowsTrack", "Unsure", "Exploring"];

export default async function DiscoveryPage({ searchParams }: { searchParams: Promise<{ path?: string; fresh?: string; track?: string }> }) {
  const { path, fresh, track } = await searchParams;
  const chosen = PATHS.find((p) => p === path) ?? "Unsure";
  return (
    <LearnerPageFrame>
      <DiscoveryInterview path={chosen} fresh={fresh === "1"} trackCode={chosen === "KnowsTrack" ? track : undefined} />
    </LearnerPageFrame>
  );
}
