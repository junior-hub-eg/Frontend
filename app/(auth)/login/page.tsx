"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
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
import { PasswordField } from "@/components/Auth/PasswordField";
import { authStyles } from "@/components/Auth/auth-styles";
import { useAuth } from "@/lib/auth/auth-context";
import { ROLE_HOME } from "@/lib/constants";
import { subscribe, getDemoCredentialsSnapshot, getServerCredentialsSnapshot } from "@/lib/auth/mock-auth";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const demoAccounts = useSyncExternalStore(subscribe, getDemoCredentialsSnapshot, getServerCredentialsSnapshot);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { rememberMe: false } });

  function onSubmit(values: FormValues) {
    try {
      setError(null);
      const user = login(values.email, values.password);
      router.push(ROLE_HOME[user.role] as Route);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <>
      <AuthHeading title="Welcome Back!" subtitle="Sign in to continue to your account" />

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
