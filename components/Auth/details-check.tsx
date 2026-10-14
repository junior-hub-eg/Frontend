"use client";

import { useRouter } from "next/navigation";
import { ClipboardList, Presentation, School, User } from "lucide-react";
import { AuthPanel } from "@/components/shared/auth-panel";
import { AuthStepper } from "@/components/shared/auth-stepper";
import { AuthButton } from "./AuthButton";
import { AuthField } from "./AuthField";
import { cn } from "@/lib/utils";

const DETAILS = {
  fullName: "Mohammed Yasser",
  school: "Ahmed Maher Primary School",
  grade: "Grade 9",
  className: "9A",
};

const NAVY = "text-[#1B2D54]";
const VALUE_GREY = "text-[#6b7280]";

export default function DetailsCheck() {
  const router = useRouter();

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
            Confirm Your Details
          </h1>
          <p className={cn("mt-1 text-[length:clamp(11px,1.4cqw,16px)] font-normal leading-tight", NAVY)}>
            Type The Code Provided By School.
          </p>
        </div>

        <div className="flex flex-col gap-[clamp(8px,1.4cqw,14px)] [&>div>div:first-child]:py-[clamp(9px,1.4cqw,14px)] [&_label]:text-[#1B2D54] [&_svg]:text-[#1B2D54]">
          <AuthField label="Full Name" icon={User} value={DETAILS.fullName} readOnly className={VALUE_GREY} />
          <AuthField label="School" icon={School} value={DETAILS.school} readOnly className={VALUE_GREY} />
          <AuthField label="Grade" icon={ClipboardList} value={DETAILS.grade} readOnly className={VALUE_GREY} />
          <AuthField label="Class" icon={Presentation} value={DETAILS.className} readOnly className={VALUE_GREY} />
        </div>

        <div className="flex flex-col gap-[clamp(8px,1.2cqw,12px)]">
          <AuthButton type="button" onClick={() => router.push("/login")}>
            Looks Correct
          </AuthButton>

          <button
            type="button"
            onClick={() => router.back()}
            className={cn(
              "flex h-[clamp(44px,5.4cqw,52px)] w-full items-center justify-center rounded-xl border border-[#12939b] bg-white",
              "text-[length:clamp(12px,1.6cqw,15px)] font-semibold transition-colors hover:bg-[#12939b]/10",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12939b]/40",
              NAVY
            )}
          >
            Something is incorrect?
          </button>
        </div>
      </div>
    </AuthPanel>
  );
}
