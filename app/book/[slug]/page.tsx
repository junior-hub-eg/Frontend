"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CalendarDays, LoaderCircle, MapPin, School } from "lucide-react";
import { api, errorMessage } from "@/lib/api-client";
import { useI18n } from "@/lib/i18n/client";
import { dateLocale } from "@/lib/i18n/translate";
import type { SchoolSubject } from "@/lib/teacher-api";
import { SUBJECT_LABEL } from "@/components/teacher/teacher-ui";

interface PublicTeacher {
  fullName: string;
  school: string;
  subjects: SchoolSubject[];
  officeLocation: string | null;
  officeHours: { title: string; location: string | null; startUtc: string; endUtc: string }[];
}

/** A teacher's booking link (Calendar and Settings): their office hours in the next two weeks. Open without signing in. */
export default function TeacherBookingPage() {
  const { t, dir } = useI18n();
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<PublicTeacher | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api.get<PublicTeacher>(`/api/v1/public/teachers/${encodeURIComponent(slug)}`).then(
      (d) => active && setData(d),
      (e) => active && setError(errorMessage(e)),
    );
    return () => {
      active = false;
    };
  }, [slug]);

  const time = (iso: string) => new Date(iso).toLocaleTimeString(dateLocale(), { hour: "numeric", minute: "2-digit" });

  return (
    <main dir={dir} className="min-h-svh bg-[linear-gradient(180deg,#d9f3ff_0%,#f6fbff_60%)] px-4 py-10 font-[family-name:var(--font-poppins)] text-[#1B2D54]">
      <div className="mx-auto max-w-xl rounded-3xl bg-white p-6 shadow-[0_24px_70px_rgba(20,54,90,0.15)]">
        <Link href="/" className="text-[11px] font-extrabold tracking-wide text-[#14365a]">
          JUNIOR HUB
        </Link>
        {error ? (
          <p role="alert" className="mt-6 text-sm font-semibold text-[#c81e1e]">{error}</p>
        ) : !data ? (
          <p role="status" className="mt-10 flex justify-center">
            <LoaderCircle className="size-6 animate-spin text-[#14757d]" />
          </p>
        ) : (
          <>
            <h1 className="mt-4 text-2xl font-bold">{data.fullName}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-[#1B2D54]/70">
              <School className="size-4 text-[#14757d]" /> {data.school}
              {data.subjects.map((s) => (
                <span key={s} className="rounded-full bg-[#c9efe9] px-2 py-0.5 text-[10px] font-semibold text-[#14757d]">
                  {t(SUBJECT_LABEL[s])}
                </span>
              ))}
            </p>
            {data.officeLocation && (
              <p dir="auto" className="mt-2 flex items-center gap-2 text-[12px]">
                <MapPin className="size-4 text-[#14757d]" /> {data.officeLocation}
              </p>
            )}
            <h2 className="mt-6 flex items-center gap-2 text-sm font-semibold">
              <CalendarDays className="size-4 text-[#14757d]" /> {t("Office hours in the next two weeks")}
            </h2>
            {data.officeHours.length === 0 ? (
              <p className="mt-3 text-[12px] text-[#1B2D54]/60">{t("No office hours scheduled yet. Message your teacher from your page.")}</p>
            ) : (
              <ul className="mt-3 grid gap-2">
                {data.officeHours.map((h) => (
                  <li key={h.startUtc} className="rounded-xl border border-[#e3ece9] p-3">
                    <p dir="auto" className="text-[12px] font-semibold">{h.title}</p>
                    <p className="mt-0.5 text-[11px] text-[#1B2D54]/70">
                      {new Date(h.startUtc).toLocaleDateString(dateLocale(), { weekday: "long", day: "numeric", month: "short" })} •{" "}
                      <span dir="ltr">
                        {time(h.startUtc)} – {time(h.endUtc)}
                      </span>
                      {h.location && <span dir="auto"> • {h.location}</span>}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-6 text-[11px] text-[#1B2D54]/60">{t("Come during office hours, or sign in and message your teacher to set a time.")}</p>
          </>
        )}
      </div>
    </main>
  );
}
