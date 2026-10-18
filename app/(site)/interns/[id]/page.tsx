import type { Metadata } from "next";
import { InternshipDetailView } from "@/components/Interns/InternshipDetailView";

export const metadata: Metadata = {
  title: "Internship Details | Junior Hub",
  description: "View internship responsibilities, assessment status, and reviews.",
};

export default async function InternshipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <InternshipDetailView id={id} />;
}
