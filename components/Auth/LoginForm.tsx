"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { AuthButton } from "./AuthButton";
import { AuthField } from "./AuthField";
import { AuthHeading } from "./AuthHeading";
import { PasswordField } from "./PasswordField";
import { authStyles } from "./auth-styles";
import { useAuth } from "@/lib/auth/auth-context";
import { ROLE_HOME } from "@/lib/constants";
import { ApiError, errorMessage } from "@/lib/api-client";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

/** Shown after another auth page sends the student here with ?notice=… */
const NOTICES: Record<string, string> = {
  activated: "Your account is ready. Sign in with your new password.",
  verified: "Your email is confirmed. Sign in to start learning.",
  reset: "Your password has been changed. Sign in with your new password.",
};

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const notice = NOTICES[params.get("notice") ?? ""];
  const [error, setError] = useState<{ message: string; unconfirmedEmail?: string } | null>(null);
  const {
    register,
    handleSubmit,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: params.get("email") ?? "", rememberMe: false },
  });

  async function onSubmit(values: FormValues) {
    try {
      setError(null);
      const user = await login(values.email, values.password, values.rememberMe);
      router.push(ROLE_HOME[user.role] as Route);
    } catch (e) {
      if (e instanceof ApiError && e.code === "VALIDATION_FAILED") {
        Object.entries(e.fieldErrors).forEach(([field, message]) =>
          setFieldError(field as keyof FormValues, { message })
        );
        return;
      }
      const unconfirmed = e instanceof ApiError && e.code === "EMAIL_NOT_CONFIRMED";
      setError({ message: errorMessage(e), unconfirmedEmail: unconfirmed ? values.email : undefined });
    }
  }

  return (
    <>
      <AuthHeading title="Welcome Back!" subtitle="Sign in to continue to your account" />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className={authStyles.form}>
        {notice && !error && <Alert variant="success">{notice}</Alert>}
        {error && (
          <Alert variant="danger">
            {error.message}{" "}
            {error.unconfirmedEmail && (
              <Link
                href={`/verify-otp?email=${encodeURIComponent(error.unconfirmedEmail)}&from=signup` as Route}
                className={authStyles.link}
              >
                Enter the code
              </Link>
            )}
          </Alert>
        )}

        <AuthField
          label="Email"
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <PasswordField
          label="Password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />

        <div className={`flex items-center justify-between ${authStyles.smallText}`}>
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" className="size-3.5 accent-[#12939b]" {...register("rememberMe")} />
            Remember me
          </label>
          <Link href="/forgot-password" className={authStyles.link}>
            Forgot password?
          </Link>
        </div>

        <AuthButton type="submit" disabled={isSubmitting}>
          Sign in
        </AuthButton>
      </form>

      <p className={`mt-4 text-center ${authStyles.smallText}`}>
        Don&apos;t have an account?{" "}
        <Link href="/register" className={authStyles.link}>
          Sign up
        </Link>
      </p>
    </>
  );
}
