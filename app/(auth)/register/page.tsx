"use client";
import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Phone, User } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { AuthButton } from "@/components/Auth/AuthButton";
import { AuthField } from "@/components/Auth/AuthField";
import { AuthHeading } from "@/components/Auth/AuthHeading";
import { PasswordField } from "@/components/Auth/PasswordField";
import { authStyles } from "@/components/Auth/auth-styles";
import { registerLearner, sendOtp } from "@/lib/auth/mock-auth";

const schema = z.object({
  fullName: z.string().trim().min(2, "Full name is required"),
  phone: z.string().regex(/^\+?[0-9\s-]{8,15}$/, "Enter a valid phone number"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "At least 6 characters"),
});
type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  function onSubmit(values: FormValues) {
    try {
      setError(null);
      const [firstName, ...rest] = values.fullName.trim().split(/\s+/);
      registerLearner({
        firstName,
        lastName: rest.join(" ") || undefined,
        email: values.email,
        phone: values.phone,
        password: values.password,
      });
      sendOtp(values.email);
      router.push(`/verify-otp?email=${encodeURIComponent(values.email)}&from=signup` as Route);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <>
      <AuthHeading title="Join Our Community" subtitle="Create your account to start Learning, Training" />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className={authStyles.form}>
        {error && <Alert variant="danger">{error}</Alert>}

        <AuthField
          label="Full Name"
          icon={User}
          autoComplete="name"
          placeholder="Your full name"
          error={errors.fullName?.message}
          {...register("fullName")}
        />
        <AuthField
          label="Phone Number"
          icon={Phone}
          type="tel"
          autoComplete="tel"
          placeholder="01XXXXXXXXX"
          error={errors.phone?.message}
          {...register("phone")}
        />
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
          autoComplete="new-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />

        <p className={authStyles.smallText}>
          Have an account?{" "}
          <Link href="/login" className={authStyles.link}>
            Login
          </Link>
        </p>

        <AuthButton type="submit" disabled={isSubmitting}>
          Sign up
        </AuthButton>
      </form>
    </>
  );
}
