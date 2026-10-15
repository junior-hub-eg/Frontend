"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Alert } from "@/components/ui/alert";
import { AuthButton } from "./AuthButton";
import { AuthHeading } from "./AuthHeading";
import { BackButton } from "./BackButton";
import { PasswordField } from "./PasswordField";
import { PasswordRuleList } from "./PasswordRuleList";
import { authStyles } from "./auth-styles";
import { resetPassword } from "@/lib/auth/account-api";
import { resetTokenState, useResetTicket } from "@/lib/auth/auth-flow-storage";
import { passwordSchema } from "@/lib/auth/password-rules";
import { ApiError, errorMessage } from "@/lib/api-client";

const schema = z
  .object({ password: passwordSchema, confirmPassword: z.string().min(1, "Confirm your new password") })
  .refine((v) => v.password === v.confirmPassword, { path: ["confirmPassword"], message: "Passwords don't match" });
type FormValues = z.infer<typeof schema>;

/**
 * The last step of "Forgot password", after the email code was verified.
 * Not in the Figma designs yet: built from the same pieces as the other auth pages.
 */
export function ResetPasswordForm() {
  const router = useRouter();
  const ticket = useResetTicket();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const password = useWatch({ control, name: "password" }) ?? "";

  async function onSubmit(values: FormValues) {
    if (!ticket) return;
    try {
      setError(null);
      const { email } = await resetPassword(ticket.token, values.password, values.confirmPassword);
      resetTokenState.clear();
      router.push(`/login?notice=reset&email=${encodeURIComponent(email)}` as Route);
    } catch (e) {
      if (e instanceof ApiError && e.code === "VALIDATION_FAILED") {
        Object.entries(e.fieldErrors).forEach(([field, message]) =>
          setFieldError(field as keyof FormValues, { message })
        );
        return;
      }
      setError(errorMessage(e));
    }
  }

  if (ticket === undefined) return null;

  if (ticket === null) {
    return (
      <>
        <BackButton href="/forgot-password" />
        <AuthHeading title="Reset Your Password" />
        <Alert variant="warning" className="mt-4">
          This reset has expired.{" "}
          <Link href="/forgot-password" className={authStyles.link}>
            Ask for a new code
          </Link>
        </Alert>
      </>
    );
  }

  return (
    <>
      <BackButton href="/forgot-password" />
      <AuthHeading title="Reset Your Password" subtitle={`Choose a new password for ${ticket.email}`} />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className={authStyles.form}>
        {error && <Alert variant="danger">{error}</Alert>}

        <PasswordField
          label="New Password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <PasswordField
          label="Confirm New Password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
        <PasswordRuleList password={password} />

        <AuthButton type="submit" disabled={isSubmitting}>
          Save New Password
        </AuthButton>
      </form>
    </>
  );
}
