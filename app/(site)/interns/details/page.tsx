import type { Metadata } from "next";
import { InternshipDetailView } from "@/components/Interns/InternshipDetailView";

export const metadata: Metadata = {
  title: "Internship Details | Junior Hub",
  description: "View internship responsibilities, assessment status, and reviews.",
};

export default function DetailsAliasPage() {
  return <InternshipDetailView id="ui-ux-design-intern" />;
}
