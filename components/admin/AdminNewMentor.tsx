"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { createMentor, getAdminTracks } from "@/lib/admin-api";
import { ApiError, errorMessage } from "@/lib/api-client";
import { MENTOR_AVATARS } from "@/lib/avatars";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { AdminPage, PageHero } from "./AdminPage";
import { LoadState, useAdminData } from "./admin-data";

/** Same rule as the backend (PasswordRules): 8+ characters, letters and numbers, and a special character. */
const schema = z.object({
  fullName: z.string().trim().min(1, tk("Full name is required.")).max(100),
  email: z.string().trim().min(1, tk("Email is required.")).email(tk("Enter a valid email address.")),
  password: z
    .string()
    .min(8, tk("Use at least 8 characters."))
    .refine((p) => /[a-z]/i.test(p) && /\d/.test(p), tk("Use letters and numbers."))
    .refine((p) => /[^a-z0-9]/i.test(p), tk("Include a special character, for example ! @ # $.")),
  title: z.string().trim().min(1, tk("Title is required.")).max(100),
  trackCode: z.string().min(1, tk("Choose a track.")),
  photoUrl: z.string(),
});
type FormValues = z.infer<typeof schema>;

const input = "w-full rounded-[0.5em] border border-[#d5dee8] bg-white px-[0.8em] py-[0.5em] outline-none focus:border-[#1d6fe0]";

/** The admin adds a mentor with a login: the mentor signs in on /login with this email and password. */
export default function AdminNewMentor() {
  const t = useT();
  const router = useRouter();
  const tracks = useAdminData(getAdminTracks, tk("We couldn't load the tracks. Please try again."));
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", email: "", password: "", title: "", trackCode: "", photoUrl: MENTOR_AVATARS[0].src },
  });
  const photo = useWatch({ control, name: "photoUrl" });

  async function onSubmit(values: FormValues) {
    setError(null);
    try {
      const mentor = await createMentor(values);
      router.push(`/admin/mentors/${mentor.id}` as Route);
    } catch (e) {
      if (e instanceof ApiError && e.code === "VALIDATION_FAILED") {
        Object.entries(e.fieldErrors).forEach(([field, message]) => setFieldError(field as keyof FormValues, { message }));
        return;
      }
      setError(errorMessage(e, tk("We couldn't add the mentor. Please try again.")));
    }
  }

  const field = (name: keyof FormValues, label: string, el: React.ReactNode) => (
    <label className="grid gap-[0.3em] text-[0.85em]">
      <span className="font-semibold text-[#14365a]">{label}</span>
      {el}
      {errors[name] && <span className="text-[0.9em] text-[#b83232]">{t(errors[name]!.message ?? "")}</span>}
    </label>
  );

  return (
    <AdminPage>
      <PageHero title={t("Add Mentor")} contentClassName="pb-[3em]" pictureTop>
        <Link href={"/admin/mentors" as Route} className="mt-[0.8em] inline-flex items-center gap-[0.4em] text-[0.85em] font-semibold text-[#14365a] hover:underline">
          <ArrowLeft className="size-[1em] rtl:rotate-180" /> {t("All mentors")}
        </Link>
      </PageHero>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mx-auto mt-[1.5em] grid w-full max-w-[40em] gap-[1em] rounded-[1.1em] bg-white p-[1.4em] shadow-[0_6px_22px_rgba(20,54,90,0.07)]"
      >
        {error && <p role="alert" className="rounded-[0.6em] bg-[#fdecec] px-[0.9em] py-[0.6em] text-[0.85em] font-semibold text-[#b83232]">{error}</p>}
        {field("fullName", t("Full Name"), <input className={input} autoComplete="off" {...register("fullName")} />)}
        {field("title", t("Job title"), <input className={input} placeholder={t("For example Senior Frontend Engineer")} {...register("title")} />)}
        {field(
          "trackCode",
          t("Track"),
          tracks.data ? (
            <select className={input} {...register("trackCode")}>
              <option value="">{t("Choose a track")}</option>
              {tracks.data.tracks.map((tr) => (
                <option key={tr.code} value={tr.code}>
                  {tr.name}
                </option>
              ))}
            </select>
          ) : (
            <LoadState error={tracks.error} onRetry={tracks.reload} className="py-[0.5em]" />
          ),
        )}
        {field("email", t("Email"), <input className={input} type="email" autoComplete="off" dir="ltr" {...register("email")} />)}
        {field(
          "password",
          t("Password"),
          <input className={input} type="password" autoComplete="new-password" dir="ltr" {...register("password")} />,
        )}

        <fieldset className="grid gap-[0.4em] text-[0.85em]">
          <legend className="mb-[0.3em] font-semibold text-[#14365a]">{t("Picture")}</legend>
          <div className="flex flex-wrap gap-[0.5em]">
            {MENTOR_AVATARS.map((a) => (
              <button
                key={a.src}
                type="button"
                onClick={() => setValue("photoUrl", a.src)}
                aria-pressed={photo === a.src}
                aria-label={t("Picture {n}", { n: MENTOR_AVATARS.indexOf(a) + 1 })}
                className={`relative size-[3em] overflow-hidden rounded-full ring-offset-2 ${photo === a.src ? "ring-2 ring-[#1d6fe0]" : ""}`}
                style={{ backgroundColor: a.bg }}
              >
                <Image src={a.src} alt="" fill sizes="48px" className="object-cover object-top" />
              </button>
            ))}
          </div>
        </fieldset>

        <p className="text-[0.8em] text-[#5b6b7c]">{t("The mentor signs in on the main sign-in page with this email and password.")}</p>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-fit items-center gap-[0.4em] rounded-[0.5em] bg-[#1d6fe0] px-[1.4em] py-[0.6em] text-[0.85em] font-semibold text-white disabled:opacity-50"
        >
          {isSubmitting && <LoaderCircle className="size-[1em] animate-spin" />} {t("Add Mentor")}
        </button>
      </form>
    </AdminPage>
  );
}
