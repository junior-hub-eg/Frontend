"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useParams } from "next/navigation";
import { CheckCircle2, Clock, LoaderCircle, School, UsersRound } from "lucide-react";
import { ApiError, errorMessage } from "@/lib/api-client";
import { useAuth } from "@/lib/auth/auth-context";
import { joinClass, rememberJoin, type StudentClass } from "@/lib/class-join";
import { useI18n } from "@/lib/i18n/client";

type State = { kind: "joining" } | { kind: "done"; c: StudentClass } | { kind: "already" } | { kind: "error"; message: string };

/**
 * A teacher's invite link: a signed-in student joins the class at once (or waits for the teacher to accept); anyone
 * else signs in or creates a student account first and comes back here.
 */
export default function JoinClassPage() {
  const { t, dir } = useI18n();
  const { code } = useParams<{ code: string }>();
  const { user } = useAuth();
  const [state, setState] = useState<State | null>(null);
  const started = useRef(false);
  const cleanCode = decodeURIComponent(code ?? "").trim().toUpperCase();

  useEffect(() => {
    if (user?.role !== "learner" || started.current) return;
    started.current = true;
    setState({ kind: "joining" });
    joinClass(cleanCode).then(
      (c) => setState({ kind: "done", c }),
      (e) =>
        setState(
          e instanceof ApiError && (e.code === "ALREADY_IN_CLASS" || e.code === "ALREADY_ASKED")
            ? { kind: "already" }
            : { kind: "error", message: errorMessage(e) },
        ),
    );
  }, [user, cleanCode]);

  const card = "mx-auto max-w-md rounded-3xl bg-white p-7 text-center shadow-[0_24px_70px_rgba(20,54,90,0.15)]";
  const button = "inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold";

  return (
    <main dir={dir} className="grid min-h-svh place-items-center bg-[linear-gradient(180deg,#d9f3ff_0%,#f6fbff_60%)] px-4 py-10 font-[family-name:var(--font-poppins)] text-[#1B2D54]">
      <div className={card}>
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#c9efe9] text-[#14757d]">
          <UsersRound className="size-7" />
        </span>
        <h1 className="mt-4 text-xl font-bold">{t("Join a class")}</h1>
        <p className="mt-1 text-sm text-[#1B2D54]/70">{t("Your teacher invited you to a class on Junior Hub.")}</p>
        <p dir="ltr" className="mx-auto mt-4 w-fit rounded-xl bg-[#eef2f1] px-4 py-2 font-mono text-lg font-bold tracking-[0.3em] text-[#14757d]">
          {cleanCode}
        </p>

        {!user ? (
          <div className="mt-6 grid gap-2">
            <Link href={"/login" as Route} onClick={() => rememberJoin(cleanCode)} className={`${button} bg-[#14757d] text-white`}>
              {t("Sign in to join")}
            </Link>
            <Link href={"/register" as Route} onClick={() => rememberJoin(cleanCode)} className={`${button} bg-[#eef2f1]`}>
              {t("Create a student account")}
            </Link>
            <p className="mt-1 text-xs text-[#1B2D54]/60">{t("After you sign in, you come back here and join the class.")}</p>
          </div>
        ) : user.role !== "learner" ? (
          <p className="mt-6 rounded-xl bg-[#fff8ef] p-3 text-sm text-[#8a4b12]">{t("Only a student account can join a class. Sign in with your student account.")}</p>
        ) : state?.kind === "done" ? (
          <div className="mt-6">
            {state.c.status === "Active" ? (
              <p className="flex items-center justify-center gap-2 text-sm font-semibold text-[#11704a]">
                <CheckCircle2 className="size-5" />
                {t("You joined class {name}.", { name: state.c.name })}
              </p>
            ) : (
              <p className="flex items-center justify-center gap-2 text-sm font-semibold text-[#a8740a]">
                <Clock className="size-5" />
                {t("Request sent. Your teacher will accept you into class {name} soon.", { name: state.c.name })}
              </p>
            )}
            <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-[#1B2D54]/60">
              <School className="size-4" /> {state.c.schoolName} • {t("Grade {grade}", { grade: state.c.grade })}
            </p>
            <Link href={"/learner/ai-curriculum/classes" as Route} className={`${button} mt-5 bg-[#14757d] text-white`}>
              {t("Go to my classes")}
            </Link>
          </div>
        ) : state?.kind === "already" ? (
          <div className="mt-6">
            <p className="text-sm font-semibold text-[#14757d]">{t("You are already in this class, or your request is waiting.")}</p>
            <Link href={"/learner/ai-curriculum/classes" as Route} className={`${button} mt-5 bg-[#14757d] text-white`}>
              {t("Go to my classes")}
            </Link>
          </div>
        ) : state?.kind === "error" ? (
          <p role="alert" className="mt-6 rounded-xl bg-[#fdecec] p-3 text-sm text-[#c81e1e]">{state.message}</p>
        ) : (
          <p role="status" className="mt-6 flex justify-center">
            <LoaderCircle className="size-6 animate-spin text-[#14757d]" />
          </p>
        )}
      </div>
    </main>
  );
}
