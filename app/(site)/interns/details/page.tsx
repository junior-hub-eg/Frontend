import type { Metadata } from "next";
import { getT } from "@/lib/i18n/server";
import { InternshipDetailView } from "@/components/Interns/InternshipDetailView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("Internship Details | Junior Hub"),
    description: t("View internship responsibilities, assessment status, and reviews."),
  };
}

export default function DetailsAliasPage() {
  return <InternshipDetailView id="ui-ux-design-intern" />;
}
