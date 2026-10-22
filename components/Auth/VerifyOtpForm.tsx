"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Alert } from "@/components/ui/alert";
import { AuthButton } from "./AuthButton";
import { AuthHeading } from "./AuthHeading";
import { BackButton } from "./BackButton";
import { OtpInput } from "./OtpInput";
import { authStyles } from "./auth-styles";
import { confirmEmail, resendCode, verifyResetCode } from "@/lib/auth/account-api";
import { resetTokenState } from "@/lib/auth/auth-flow-storage";
import { errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";

/** The backend's OneTimeCodes:DemoCode in the Development and Demo environments; no email is sent there. */
const DEMO_OTP_CODE = "123456";

const RESEND_SECONDS = 30;

const schema = z.object({
  code: z.string().regex(/^\d{6}$/, tk("Enter the 6-digit code")),
});
type FormValues = z.infer<typeof schema>;

/** Used after sign-up (?from=signup) and after "Forgot password" (?from=reset). Reads ?email=… from the URL. */
export function VerifyOtpForm() {
  const t = useT();
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const fromSignup = params.get("from") === "signup";

  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { code: "" } });

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [secondsLeft]);

  async function onSubmit(values: FormValues) {
    try {
      setError(null);
      if (fromSignup) {
        await confirmEmail(email, values.code);
        router.push(`/login?notice=verified&email=${encodeURIComponent(email)}` as Route);
      } else {
        const { resetToken } = await verifyResetCode(email, values.code);
        resetTokenState.set(resetToken, email);
        router.push("/reset-password");
      }
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  async function handleResend() {
    try {
      setError(null);
      await resendCode(email, fromSignup ? "Signup" : "PasswordReset");
      reset({ code: "" });
      setInfo(t("A new code has been sent to your email."));
      setSecondsLeft(RESEND_SECONDS);
    } catch (e) {
      setInfo(null);
      setError(errorMessage(e));
    }
  }

  const backHref: Route = fromSignup ? "/register" : "/forgot-password";

  if (!email) {
    return (
      <>
        <BackButton href={backHref} />
        <AuthHeading title={t("Verify Your Email")} />
        <Alert variant="warning" className="mt-4">
          {t("We couldn't find your email.")}{" "}
          <Link href="/forgot-password" className={authStyles.link}>
            {t("Start again")}
          </Link>
        </Alert>
      </>
    );
  }

  return (
    <>
      <BackButton href={backHref} />
      <AuthHeading
        title={t("Verify Your Email")}
        subtitle={t("We've sent a 6-digit code to your email. Enter it below to continue.")}
      />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className={authStyles.form}>
        {error && <Alert variant="danger">{error}</Alert>}
        {info && !error && <Alert variant="success">{info}</Alert>}

        <div>
          <Controller
            name="code"
            control={control}
            render={({ field }) => <OtpInput value={field.value} onChange={field.onChange} hasError={!!errors.code} />}
          />
          {errors.code && (
            <p role="alert" className="mt-1 px-1 text-xs text-danger">
              {t(errors.code.message ?? "")}
            </p>
          )}
        </div>

        <p className={`text-center ${authStyles.smallText}`}>
          {t("Didn't receive the code?")}{" "}
          {secondsLeft > 0 ? (
            <span className="text-[#1b2a5c]/60">{t("Resend in {n}s", { n: secondsLeft })}</span>
          ) : (
            <button type="button" onClick={handleResend} className={authStyles.link}>
              {t("Resend")}
            </button>
          )}
        </p>

        <AuthButton type="submit" disabled={isSubmitting}>
          {t("Verify Code")}
        </AuthButton>

        {process.env.NODE_ENV !== "production" && (
          <p className="text-center text-xs text-[#1b2a5c]/60">{t("Demo code: {code}", { code: DEMO_OTP_CODE })}</p>
        )}
      </form>
    </>
  );
}
