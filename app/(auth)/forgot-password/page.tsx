"use client";

import { useState } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { AuthButton } from "@/components/Auth/AuthButton";
import { AuthField } from "@/components/Auth/AuthField";
import { AuthHeading } from "@/components/Auth/AuthHeading";
import { BackButton } from "@/components/Auth/BackButton";
import { authStyles } from "@/components/Auth/auth-styles";
import { forgotPassword } from "@/lib/auth/account-api";
import { errorMessage } from "@/lib/api-client";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    try {
      setError(null);
      // The same answer whether or not the email has an account, so the next page always opens.
      const { email } = await forgotPassword(values.email);
      router.push(`/verify-otp?email=${encodeURIComponent(email)}&from=reset` as Route);
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  return (
    <>
      <BackButton href="/login" />
      <AuthHeading title="Forgot Your Password?" subtitle="Enter your email and we'll send you a verification code" />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className={authStyles.form}>
        {error && <Alert variant="danger">{error}</Alert>}

        <AuthField
          label="Email"
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <AuthButton type="submit" disabled={isSubmitting}>
          Send Code
        </AuthButton>
      </form>
    </>
  );
}
