"use client";
import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Phone, User } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { AuthButton } from "@/components/Auth/AuthButton";
import { AuthField } from "@/components/Auth/AuthField";
import { GenderField } from "@/components/Auth/GenderField";
import { AuthHeading } from "@/components/Auth/AuthHeading";
import { PasswordField } from "@/components/Auth/PasswordField";
import { authStyles } from "@/components/Auth/auth-styles";
import { register as registerAccount } from "@/lib/auth/account-api";
import { passwordSchema } from "@/lib/auth/password-rules";
import { ApiError, errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";

const schema = z.object({
  fullName: z.string().trim().min(2, tk("Full name is required")),
  phone: z.string().regex(/^\+?[0-9\s-]{8,15}$/, tk("Enter a valid phone number")),
  email: z.string().min(1, tk("Email is required")).email(tk("Invalid email address")),
  password: passwordSchema,
  gender: z.enum(["Male", "Female"], { message: tk("Choose boy or girl") }),
});
type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const t = useT();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    try {
      setError(null);
      const { email } = await registerAccount(values);
      router.push(`/verify-otp?email=${encodeURIComponent(email)}&from=signup` as Route);
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

  return (
    <>
      <AuthHeading title={t("Join Our Community")} subtitle={t("Create your account to start Learning, Training")} />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className={authStyles.form}>
        {error && <Alert variant="danger">{error}</Alert>}

        <AuthField
          label={t("Full Name")}
          icon={User}
          autoComplete="name"
          placeholder={t("Your full name")}
          error={errors.fullName?.message}
          {...register("fullName")}
        />
        <AuthField
          label={t("Phone Number")}
          icon={Phone}
          type="tel"
          autoComplete="tel"
          placeholder="01XXXXXXXXX"
          error={errors.phone?.message}
          {...register("phone")}
        />
        <AuthField
          label={t("Email")}
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <PasswordField
          label={t("Password")}
          autoComplete="new-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />
        <Controller
          control={control}
          name="gender"
          render={({ field }) => <GenderField value={field.value} onChange={field.onChange} error={errors.gender?.message} />}
        />

        <p className={authStyles.smallText}>
          {t("Have an account?")}{" "}
          <Link href="/login" className={authStyles.link}>
            {t("Login")}
          </Link>
        </p>

        <AuthButton type="submit" disabled={isSubmitting}>
          {t("Sign up")}
        </AuthButton>
      </form>
    </>
  );
}
