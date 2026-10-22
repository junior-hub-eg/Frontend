"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, Presentation, School, User } from "lucide-react";
import { AuthPanel } from "@/components/shared/auth-panel";
import { AuthStepper } from "@/components/shared/auth-stepper";
import { AuthButton } from "./AuthButton";
import { AuthField } from "./AuthField";
import { useActivationState } from "@/lib/auth/auth-flow-storage";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/client";

// TODO: replace with the real school contact (email, phone, or support URL)
const CONTACT_HREF = "mailto:support@juniorhub.com";

const NAVY = "text-[#1B2D54]";
const VALUE_GREY = "text-[#6b7280]";

/** Step 2 of school activation: the details the school registered, from the activation check. */
export default function DetailsCheck() {
  const t = useT();
  const router = useRouter();
  const state = useActivationState();

  // The details come from step 1; without them, start again.
  useEffect(() => {
    if (state === null) router.replace("/activation");
  }, [state, router]);

  if (!state) return null;
  const details = state.details;

  return (
    <AuthPanel>
      <AuthStepper
        current={2}
        total={4}
        className="mx-auto w-[77%] gap-[clamp(6px,1cqw,10px)] [&>span]:h-[clamp(4px,0.6cqw,6px)] [&>span]:bg-[#c9efe9] [&>span:nth-child(-n+2)]:bg-[#14757d]"
      />

      <div className="flex flex-col gap-[clamp(10px,1.8cqw,18px)]">
        <div className="text-center">
          <h1 className={cn("text-[length:clamp(20px,2.5cqw,28px)] font-semibold leading-tight", NAVY)}>
            {t("Confirm Your Details")}
          </h1>
          <p className={cn("mt-1 text-[length:clamp(11px,1.4cqw,16px)] font-normal leading-tight", NAVY)}>
            {t("Check The Details Your School Registered.")}
          </p>
        </div>

        <div className="flex flex-col gap-[clamp(8px,1.4cqw,14px)] [&>div>div:first-child]:py-[clamp(9px,1.4cqw,14px)] [&_label]:text-[#1B2D54] [&_svg]:text-[#1B2D54]">
          <AuthField label={t("Full Name")} icon={User} value={details.fullName} readOnly className={VALUE_GREY} />
          <AuthField label={t("School")} icon={School} value={details.school} readOnly className={VALUE_GREY} />
          <AuthField label={t("Grade")} icon={ClipboardList} value={t("Grade {n}", { n: details.grade })} readOnly className={VALUE_GREY} />
          <AuthField label={t("Class")} icon={Presentation} value={details.className} readOnly className={VALUE_GREY} />
        </div>

        <div className="flex flex-col gap-[clamp(8px,1.2cqw,12px)]">
          <AuthButton type="button" onClick={() => router.push("/create-login")}>
            {t("Looks Correct")}
          </AuthButton>

          {/* Only the school can correct these details. */}
          <a
            href={CONTACT_HREF}
            className={cn(
              "flex h-[clamp(44px,5.4cqw,52px)] w-full items-center justify-center rounded-xl border border-[#12939b] bg-white",
              "text-[length:clamp(12px,1.6cqw,15px)] font-semibold transition-colors hover:bg-[#12939b]/10",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12939b]/40",
              NAVY
            )}
          >
            {t("Something is incorrect?")}
          </a>
        </div>
      </div>
    </AuthPanel>
  );
}
