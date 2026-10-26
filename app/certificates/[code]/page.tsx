import type { Metadata } from "next";
import CertificateCheckPage from "@/components/certificates/CertificateCheckPage";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("Certificate · Junior Hub") };
}

export default async function CertificatePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <CertificateCheckPage code={decodeURIComponent(code)} />;
}
