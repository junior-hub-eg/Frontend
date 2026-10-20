"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { AuthPanel } from "@/components/shared/auth-panel";
import { AuthStepper } from "@/components/shared/auth-stepper";
import { AuthButton } from "./AuthButton";
import { AuthField } from "./AuthField";
import { GenderField } from "./GenderField";
import { PasswordField } from "./PasswordField";
import { PasswordRuleList } from "./PasswordRuleList";
import { completeActivation } from "@/lib/auth/account-api";
import { activationState, useActivationState } from "@/lib/auth/auth-flow-storage";
import { PASSWORD_RULES } from "@/lib/auth/password-rules";
import { ApiError, errorMessage } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { Gender } from "@/lib/avatars";

const NAVY = "text-[#1B2D54]";

/** Step 3 of school activation: the email comes from the school, the student chooses a password. */
export default function CreateLogin() {
  const router = useRouter();
  const state = useActivationState();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // The activation code and details come from step 1; without them, start again.
  useEffect(() => {
    if (state === null) router.replace("/activation");
  }, [state, router]);

  const allRulesOk = PASSWORD_RULES.every((rule) => rule.test(password));
  const mismatch = confirm.length > 0 && confirm !== password;
  const canContinue = !!state && allRulesOk && confirm.length > 0 && !mismatch && gender !== null && !submitting;

  async function handleContinue() {
    if (!canContinue || !state || !gender) return;
    setSubmitting(true);
    setError(null);
    try {
      const { email } = await completeActivation(state.key, password, confirm, gender);
      activationState.clear();
      router.push(`/login?notice=activated&email=${encodeURIComponent(email)}` as Route);
    } catch (e) {
      if (e instanceof ApiError && (e.code === "ACTIVATION_INVALID" || e.code === "ACTIVATION_USED")) {
        activationState.clear();
        if (e.code === "ACTIVATION_INVALID") {
          router.push("/code-error");
          return;
        }
      }
      setError(e instanceof ApiError && e.code === "VALIDATION_FAILED" ? Object.values(e.fieldErrors)[0] : errorMessage(e));
      setSubmitting(false);
    }
  }

  return (
    <AuthPanel>
      <AuthStepper
        current={3}
        total={4}
        className="mx-auto w-[77%] gap-[clamp(6px,1cqw,10px)] [&>span]:h-[clamp(4px,0.6cqw,6px)] [&>span]:bg-[#c9efe9] [&>span:nth-child(-n+3)]:bg-[#14757d]"
      />

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          void handleContinue();
        }}
        className="flex flex-col gap-[clamp(10px,1.8cqw,18px)]"
      >
        <div className="text-center">
          <h1 className={cn("text-[length:clamp(20px,2.5cqw,28px)] font-semibold leading-tight", NAVY)}>
            Create Your Login
          </h1>
          <p className={cn("mt-1 text-[length:clamp(11px,1.4cqw,16px)] font-normal leading-tight", NAVY)}>
            Choose A Password And Tell Us Who You Are.
          </p>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <div className="flex flex-col gap-[clamp(8px,1.4cqw,14px)] [&>div>div:first-child]:py-[clamp(9px,1.4cqw,14px)] [&_label]:text-[#1B2D54] [&_svg]:text-[#1B2D54]">
          <AuthField label="Email" icon={Mail} type="email" value={state?.details.email ?? ""} readOnly className="text-[#6b7280]" />

          <PasswordField
            label="Password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <PasswordField
            label="Confirm Password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={mismatch ? "Passwords don't match" : undefined}
          />
        </div>

        <PasswordRuleList password={password} />

        <GenderField value={gender} onChange={setGender} />

        <AuthButton type="submit" disabled={!canContinue}>
          {submitting ? "Saving..." : "Continue"}
        </AuthButton>
      </form>
    </AuthPanel>
  );
}
