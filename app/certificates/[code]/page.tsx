import type { Metadata } from "next";
import CertificateCheckPage from "@/components/certificates/CertificateCheckPage";

export const metadata: Metadata = { title: "Practice certificate · Junior Hub" };

export default async function CertificatePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <CertificateCheckPage code={decodeURIComponent(code)} />;
}
