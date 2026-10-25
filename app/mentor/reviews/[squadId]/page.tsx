import ReviewScreen from "@/components/mentor/area/ReviewScreen";

/** M4 · Review screen: the work, each student's scores and the squad decision; ?round= shows a past round. */
export default async function MentorReviewPage({ params, searchParams }: { params: Promise<{ squadId: string }>; searchParams: Promise<{ round?: string }> }) {
  const { squadId } = await params;
  const { round } = await searchParams;
  return <ReviewScreen squadId={squadId} round={round ? Number(round) || undefined : undefined} />;
}
