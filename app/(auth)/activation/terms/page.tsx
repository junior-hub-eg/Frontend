"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { ChevronRight, FileText, ShieldCheck } from "lucide-react";
import { AuthButton } from "@/components/Auth/AuthButton";
import { AuthHeading } from "@/components/Auth/AuthHeading";
import { AuthPanel } from "@/components/shared/auth-panel";
import { AuthStepper } from "@/components/shared/auth-stepper";

const policies = [
  {
    href: "/terms" as Route,
    title: "Terms of Service",
    description: "Read the Terms of Using Junior Hub",
    icon: FileText,
  },
  {
    href: "/privacy" as Route,
    title: "Privacy Policy",
    description: "Learn How We Protect Your Data",
    icon: ShieldCheck,
  },
];

export default function ActivationTermsPage() {
  const [agreed, setAgreed] = useState(false);
  const router = useRouter();

  function handleContinue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (agreed) router.push("/register" as Route);
  }

  return (
    <AuthPanel>
      <div className="space-y-5">
        <AuthStepper current={4} />

        <div className="text-center">
          <AuthHeading
            title="Confirm Your Details"
            subtitle="Type The Code Provided By School."
          />
        </div>

        <div className="space-y-3">
          {policies.map(({ href, title, description, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex min-h-[64px] items-center gap-3 rounded-2xl border border-[#e6e9eb] px-3 py-2.5 transition-colors hover:border-[#12939b]/50 hover:bg-[#f8fbfb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12939b]"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#128d91] text-white">
                <Icon aria-hidden="true" className="size-[18px]" strokeWidth={2.4} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-[#1b2a5c]">{title}</span>
                <span className="mt-0.5 block text-[10px] leading-4 text-[#53647a]">{description}</span>
              </span>
              <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-[#1b2a5c]" />
            </Link>
          ))}
        </div>

        <form onSubmit={handleContinue} className="space-y-4">
          <label className="flex cursor-pointer items-start gap-2.5 text-[11px] leading-[1.4] text-[#40506a]">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(event) => setAgreed(event.target.checked)}
              className="mt-0.5 size-4 shrink-0 accent-[#12939b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#12939b]"
            />
            <span>
              I have read and agree to the Terms of Service and Privacy Policy.
            </span>
          </label>

          <AuthButton type="submit" disabled={!agreed}>
            Continue
          </AuthButton>
        </form>
      </div>
    </AuthPanel>
  );
}
