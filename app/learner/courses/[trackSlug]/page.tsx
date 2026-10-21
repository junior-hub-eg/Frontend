import TrackDetailPage from "@/components/learner/TrackDetailPage";

export default async function Page({ params }: { params: Promise<{ trackSlug: string }> }) {
  const { trackSlug } = await params;
  return <TrackDetailPage slug={trackSlug} />;
}