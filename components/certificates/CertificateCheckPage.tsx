"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, LoaderCircle, Printer, XCircle } from "lucide-react";
import { ApiError } from "@/lib/api-client";
import { verifyCertificate, type Certificate } from "@/lib/recruitment-api";
import { CertificateDocument } from "./CertificateDocument";
import { useT } from "@/lib/i18n/client";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";

type State = { status: "loading" } | { status: "found"; certificate: Certificate } | { status: "missing" } | { status: "error" };

/**
 * /certificates/{code}: anyone can check a practice certificate, and the student can print it or save it as a PDF
 * (the browser's print dialog). Only the certificate is printed.
 */
export default function CertificateCheckPage({ code }: { code: string }) {
  const t = useT();
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let active = true;
    verifyCertificate(code).then(
      (certificate) => active && setState({ status: "found", certificate }),
      (e) => active && setState({ status: e instanceof ApiError && e.status === 404 ? "missing" : "error" }),
    );
    return () => {
      active = false;
    };
  }, [code]);

  return (
    <main className="min-h-screen bg-[#f2f7fb] px-4 py-8 text-[#14365a] print:bg-white print:p-0">
      <div className="mx-auto max-w-3xl">
        <div className="mb-3 flex justify-end print:hidden">
          <LanguageSwitcher className="text-sm font-medium text-[#14365a]/80" />
        </div>
        {state.status === "loading" && <LoaderCircle className="mx-auto my-24 size-8 animate-spin text-[#12939b]" aria-label={t("Loading")} />}

        {state.status === "found" && (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
              <p className="flex items-center gap-2 rounded-full bg-[#d8f0df] px-4 py-1.5 text-sm font-bold text-[#1f7a43]">
                <CheckCircle2 className="size-4" /> {t("This certificate is genuine")}
              </p>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-2 rounded-xl bg-[#14365a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0f2a47]"
              >
                <Printer className="size-4" /> {t("Print or save as PDF")}
              </button>
            </div>
            <div className="text-[15px] sm:text-[17px]">
              <CertificateDocument certificate={state.certificate} />
            </div>
          </>
        )}

        {(state.status === "missing" || state.status === "error") && (
          <section className="mx-auto mt-16 flex max-w-md flex-col items-center gap-3 rounded-3xl bg-white p-8 text-center shadow-sm">
            <XCircle className="size-10 text-[#c0392b]" aria-hidden />
            <h1 className="text-xl font-extrabold">{state.status === "missing" ? t("No certificate with this code") : t("We couldn't check this code")}</h1>
            <p className="text-sm text-[#14365a]/75">
              {state.status === "missing" ? (
                <>
                  {t("We could not find")} <span className="font-mono font-bold">{code.toUpperCase()}</span>. {t("Check the code and try again.")}
                </>
              ) : (
                t("Please check your connection and try again.")
              )}
            </p>
            <Link href="/" className="mt-2 text-sm font-semibold text-[#0f7a81] hover:underline">
              {t("Go to Junior Hub")}
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}
