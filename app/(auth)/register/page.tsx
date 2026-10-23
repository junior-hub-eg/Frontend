"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Briefcase, Clock, Mail, Phone, User } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { AuthButton } from "@/components/Auth/AuthButton";
import { AuthField } from "@/components/Auth/AuthField";
import { GenderField } from "@/components/Auth/GenderField";
import { AuthHeading } from "@/components/Auth/AuthHeading";
import { PasswordField } from "@/components/Auth/PasswordField";
import { authStyles } from "@/components/Auth/auth-styles";
import { ChipsField, RoleField, SelectField } from "@/components/Auth/RoleField";
import {
  getSignupOptions,
  register as registerAccount,
  type SchoolSubject,
  type SignupOptions,
  type SignupRole,
} from "@/lib/auth/account-api";
import { passwordSchema } from "@/lib/auth/password-rules";
import { ApiError, errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";

/** School subjects, in the backend's order. */
const SUBJECT_LABEL: Record<SchoolSubject, string> = {
  Math: tk("Mathematics"),
  Science: tk("Science"),
  Physics: tk("Physics"),
  Language: tk("Language"),
};

const schema = z
  .object({
    role: z.enum(["Student", "Mentor", "Teacher"]),
    fullName: z.string().trim().min(2, tk("Full name is required")),
    phone: z.string().regex(/^\+?[0-9\s-]{8,15}$/, tk("Enter a valid phone number")),
    email: z.string().min(1, tk("Email is required")).email(tk("Invalid email address")),
    password: passwordSchema,
    gender: z.enum(["Male", "Female"], { message: tk("Choose boy or girl") }),
    // Monitor (Mentor role)
    trackCode: z.string(),
    title: z.string(),
    yearsOfExperience: z.string(),
    // Teacher
    schoolId: z.string(),
    subjects: z.array(z.enum(["Math", "Science", "Physics", "Language"])),
    grades: z.array(z.number()),
  })
  .superRefine((v, ctx) => {
    const need = (path: keyof typeof v, message: string) => ctx.addIssue({ code: "custom", path: [path], message });
    if (v.role === "Mentor") {
      if (!v.trackCode) need("trackCode", tk("Choose a track."));
      if (!v.title.trim()) need("title", tk("Title is required."));
      const years = Number(v.yearsOfExperience);
      if (v.yearsOfExperience.trim() === "" || !Number.isInteger(years) || years < 0 || years > 60)
        need("yearsOfExperience", tk("Years of experience is 0 to 60."));
    }
    if (v.role === "Teacher") {
      if (!v.schoolId) need("schoolId", tk("Choose your school."));
      if (v.subjects.length === 0) need("subjects", tk("Choose at least one subject."));
      if (v.grades.length === 0) need("grades", tk("Choose at least one grade."));
    }
  });
type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const t = useT();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<SignupOptions | null>(null);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  // The form scrolls inside the card; bring a server error at the top into view.
  const errorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (error) errorRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [error]);
  const {
    register,
    control,
    handleSubmit,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: "Student", trackCode: "", title: "", yearsOfExperience: "", schoolId: "", subjects: [], grades: [] },
  });
  const role = useWatch({ control, name: "role" });

  // Tracks, schools, subjects and grades, for monitors and teachers.
  useEffect(() => {
    if (role === "Student" || options) return;
    let active = true;
    getSignupOptions().then(
      (o) => active && setOptions(o),
      (e) => active && setOptionsError(errorMessage(e)),
    );
    return () => {
      active = false;
    };
  }, [role, options]);

  async function onSubmit(values: FormValues) {
    try {
      setError(null);
      const common = { fullName: values.fullName, phone: values.phone, email: values.email, password: values.password, gender: values.gender };
      const { email } = await registerAccount(
        values.role === "Mentor"
          ? { ...common, role: "Mentor", trackCode: values.trackCode, title: values.title.trim(), yearsOfExperience: Number(values.yearsOfExperience) }
          : values.role === "Teacher"
            ? { ...common, role: "Teacher", schoolId: values.schoolId, subjects: values.subjects, grades: values.grades }
            : common,
      );
      // Monitors and teachers wait for the admin after the email code; the verify page tells them.
      const approval = values.role === "Student" ? "" : "&approval=1";
      router.push(`/verify-otp?email=${encodeURIComponent(email)}&from=signup${approval}` as Route);
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
        {error && (
          <div ref={errorRef}>
            <Alert variant="danger">{error}</Alert>
          </div>
        )}

        <Controller
          control={control}
          name="role"
          render={({ field }) => <RoleField value={field.value as SignupRole} onChange={field.onChange} />}
        />

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
          render={({ field }) => (
            <GenderField
              value={field.value}
              onChange={field.onChange}
              error={errors.gender?.message}
              label={role === "Student" ? undefined : t("Gender")}
            />
          )}
        />

        {role !== "Student" && optionsError && <Alert variant="danger">{optionsError}</Alert>}

        {role === "Mentor" && (
          <>
            <SelectField label={t("Track")} error={errors.trackCode?.message} disabled={!options} {...register("trackCode")}>
              <option value="">{options ? t("Choose a track") : t("Loading...")}</option>
              {options?.tracks.map((tr) => (
                <option key={tr.code} value={tr.code}>
                  {t(tr.name)}
                </option>
              ))}
            </SelectField>
            <AuthField
              label={t("Job title")}
              icon={Briefcase}
              placeholder={t("For example Senior Frontend Engineer")}
              error={errors.title?.message}
              {...register("title")}
            />
            <AuthField
              label={t("Years of experience")}
              icon={Clock}
              type="number"
              inputMode="numeric"
              min={0}
              max={60}
              placeholder="5"
              error={errors.yearsOfExperience?.message}
              {...register("yearsOfExperience")}
            />
          </>
        )}

        {role === "Teacher" && (
          <>
            <SelectField label={t("School")} error={errors.schoolId?.message} disabled={!options} {...register("schoolId")}>
              <option value="">{options ? t("Choose your school") : t("Loading...")}</option>
              {options?.schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.city ? `${s.name} — ${s.city}` : s.name}
                </option>
              ))}
            </SelectField>
            <Controller
              control={control}
              name="subjects"
              render={({ field }) => (
                <ChipsField
                  label={t("Subjects you teach")}
                  options={options?.subjects ?? []}
                  value={field.value}
                  onChange={field.onChange}
                  render={(s) => t(SUBJECT_LABEL[s])}
                  error={errors.subjects?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="grades"
              render={({ field }) => (
                <ChipsField
                  label={t("Grades you teach")}
                  options={options?.grades ?? []}
                  value={field.value}
                  onChange={field.onChange}
                  render={(g) => String(g)}
                  error={errors.grades?.message}
                />
              )}
            />
          </>
        )}

        {role !== "Student" && (
          <p className={`rounded-xl bg-[#fdf6e3] px-3 py-2 ${authStyles.smallText}`}>
            {t("After you confirm your email, the Junior Hub admin reviews your account. We will email you when you can sign in.")}
          </p>
        )}

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
