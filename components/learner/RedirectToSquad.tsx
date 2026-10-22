"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

/** The squad page with the cube: where a student waits until every seat is taken and the project is revealed. */
export const SQUAD_PAGE = "/learner/interns/session";

/** The Internship dashboard is closed until the squad's project is revealed (PROJECT_NOT_READY): go to the squad page. */
export default function RedirectToSquad() {
  const router = useRouter();
  useEffect(() => {
    router.replace(SQUAD_PAGE);
  }, [router]);
  return <LoaderCircle className="mx-auto mt-[20vh] h-8 w-8 animate-spin text-[#14365a]" aria-label="Opening your squad" />;
}
