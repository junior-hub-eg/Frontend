import Image from "next/image";
import { Award, FlaskConical } from "lucide-react";
import type { Certificate } from "@/lib/recruitment-api";

const day = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

/**
 * A practice certificate as a document (US-40): who, which practice job, the score, the date and the code.
 * It always says it is a simulation and not a job offer (BR-12). Sized in em so it scales with its container.
 */
export function CertificateDocument({ certificate }: { certificate: Certificate }) {
  return (
    <article
      aria-label={`Practice certificate ${certificate.code}`}
      className="relative overflow-hidden rounded-[1.4em] border-[0.25em] border-[#12939b]/50 bg-white p-[2.4em] text-center text-[#14365a] shadow-[0_10px_40px_rgba(20,54,90,0.08)] print:shadow-none"
    >
      <div aria-hidden className="pointer-events-none absolute inset-[0.8em] rounded-[1em] border border-dashed border-[#12939b]/30" />
      <div className="relative">
        <Image src="/images/Auth/logo.png" alt="Junior Hub" width={180} height={48} className="mx-auto h-auto w-[9em]" />
        <p className="mt-[1.4em] inline-flex items-center gap-[0.35em] rounded-full bg-[#fff1d6] px-[0.9em] py-[0.25em] text-[0.75em] font-bold uppercase tracking-wide text-[#a86a00]">
          <FlaskConical className="h-[1.1em] w-[1.1em]" aria-hidden /> Simulation
        </p>
        <h2 className="mt-[0.6em] text-[0.85em] font-bold uppercase tracking-[0.3em] text-[#0f7a81]">Certificate of practice</h2>
        <Award className="mx-auto mt-[0.8em] h-[3em] w-[3em] text-[#f5a623]" aria-hidden />

        <p className="mt-[0.8em] text-[0.95em]">This certifies that</p>
        <p className="mt-[0.2em] text-[2.2em] font-extrabold leading-tight">{certificate.studentName}</p>
        <p className="mx-auto mt-[0.6em] max-w-[30em] text-[1em] leading-relaxed">
          completed the practice interview for <b>{certificate.role}</b> at {certificate.companyName}, a made-up company, with a score of{" "}
          <b>{certificate.scorePercent}%</b>.
        </p>

        <dl className="mx-auto mt-[1.4em] grid max-w-[30em] grid-cols-3 gap-[0.8em] text-[0.8em]">
          <div>
            <dt className="text-[#14365a]/60">Track</dt>
            <dd className="font-bold">{certificate.trackName}</dd>
          </div>
          <div>
            <dt className="text-[#14365a]/60">Date</dt>
            <dd className="font-bold">{day(certificate.issuedUtc)}</dd>
          </div>
          <div>
            <dt className="text-[#14365a]/60">Code</dt>
            <dd className="font-mono font-bold tracking-wider">{certificate.code}</dd>
          </div>
        </dl>

        <p className="mx-auto mt-[1.4em] max-w-[30em] rounded-[0.7em] bg-[#fff6e8] px-[1em] py-[0.5em] text-[0.85em] font-bold text-[#a86a00]">
          {certificate.disclaimer}
        </p>
      </div>
    </article>
  );
}
