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
import { MOCK_OTP_CODE, sendOtp, verifyOtp } from "@/lib/auth/mock-auth";

const RESEND_SECONDS = 30;

const schema = z.object({
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});
type FormValues = z.infer<typeof schema>;

/** Used after sign-up (?from=signup) and after "Forgot password" (?from=reset). Reads ?email=… from the URL. */
export function VerifyOtpForm() {
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

  function onSubmit(values: FormValues) {
    try {
      setError(null);
      verifyOtp(email, values.code);
      // TODO: after "Forgot password" the next step should be a "Reset password" page (not designed yet).
      router.push("/login");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    }
  }

  function handleResend() {
    sendOtp(email);
    reset({ code: "" });
    setError(null);
    setInfo("A new code has been sent to your email.");
    setSecondsLeft(RESEND_SECONDS);
  }

  const backHref: Route = fromSignup ? "/register" : "/forgot-password";

  if (!email) {
    return (
      <>
        <BackButton href={backHref} />
        <AuthHeading title="Verify Your Email" />
        <Alert variant="warning" className="mt-4">
          We couldn&apos;t find your email.{" "}
          <Link href="/forgot-password" className={authStyles.link}>
            Start again
          </Link>
        </Alert>
      </>
    );
  }

  return (
    <>
      <BackButton href={backHref} />
      <AuthHeading
        title="Verify Your Email"
        subtitle="We've sent a 6-digit code to your email. Enter it below to continue."
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
              {errors.code.message}
            </p>
          )}
        </div>

        <p className={`text-center ${authStyles.smallText}`}>
          Didn&apos;t receive the code?{" "}
          {secondsLeft > 0 ? (
            <span className="text-[#1b2a5c]/60">Resend in {secondsLeft}s</span>
          ) : (
            <button type="button" onClick={handleResend} className={authStyles.link}>
              Resend
            </button>
          )}
        </p>

        <AuthButton type="submit" disabled={isSubmitting}>
          Verify Code
        </AuthButton>

        {process.env.NODE_ENV !== "production" && (
          <p className="text-center text-xs text-[#1b2a5c]/60">Demo code: {MOCK_OTP_CODE}</p>
        )}
      </form>
    </>
  );
}
