"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { AuthPanel } from "@/components/shared/auth-panel";
import { AuthStepper } from "@/components/shared/auth-stepper";
import { AuthButton } from "./AuthButton";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/client";

// TODO: replace with the real school contact (email, phone, or support URL)
const CONTACT_HREF = "mailto:support@juniorhub.com";

export default function CodeError() {
  const t = useT();
  const router = useRouter();

  return (
    <AuthPanel>
      {/* Step 1 of 4: short, centered, rounded segments like the Figma design */}
      <AuthStepper
        current={1}
        total={4}
        className="mx-auto w-[77%] gap-[clamp(6px,1cqw,10px)] [&>span]:h-[clamp(4px,0.6cqw,6px)] [&>span]:bg-[#c9efe9] [&>span:first-child]:bg-[#14757d]"
      />

      {/* Big gap under the stepper, like the Figma design */}
<div className="mt-[clamp(14px,3.6cqw,34px)] flex flex-col items-center text-center">        {/* Error icon: pale ring + red circle + white X */}
        <span
          aria-hidden
          className="flex size-[clamp(52px,7.6cqw,70px)] items-center justify-center rounded-full bg-[#ffd9d6]"
        >
          <span className="flex size-[72%] items-center justify-center rounded-full bg-[#ff5a52] text-white">
            <X className="size-[55%]" strokeWidth={3} />
          </span>
        </span>

        <h1
          role="alert"
          className="mt-[clamp(16px,3.4cqw,32px)] text-[length:clamp(19px,2.7cqw,25px)] font-semibold leading-tight text-[#8f0a0a]"
        >
          {t("This Code Is not Valid")}
        </h1>

        {/* Full panel width, so only "Expired" wraps to the second line */}
       <p className="mt-1 w-full max-w-[90%] text-[length:clamp(10px,1.3cqw,12px)] leading-snug text-[#1b2a5c]">
  {t("The Activation Code You Entered Is Incorrect Or Has Expired")}
</p>

        <div className="mt-[clamp(16px,3.1cqw,30px)] flex w-full flex-col gap-[clamp(8px,1.2cqw,12px)]">
          <AuthButton type="button" onClick={() => router.back()}>
            {t("Try Again")}
          </AuthButton>

          <a
            href={CONTACT_HREF}
            className={cn(
              "flex h-[clamp(44px,5.4cqw,52px)] w-full items-center justify-center rounded-xl border border-[#12939b] bg-white",
              "text-[length:clamp(12px,1.6cqw,15px)] font-semibold text-[#1b2a5c] transition-colors hover:bg-[#12939b]/10",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12939b]/40"
            )}
          >
            {t("Contact School")}
          </a>
        </div>
      </div>
    </AuthPanel>
  );
}
