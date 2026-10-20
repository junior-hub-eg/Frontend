"use client";

import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { ApiError } from "@/lib/api-client";
import { getSquad } from "@/lib/interns-api";
import InternshipProgress from "./InternshipProgress";
import SquadMatchmaking from "./SquadMatchmaking";

/**
 * Entry of the Internship: a student without a squad joins one first (matchmaking, then "Get Ready");
 * everyone else goes straight to the squad's Internship Progress.
 */
/** LOCAL ONLY (NEXT_PUBLIC_SKIP_AUTH=true): with no backend, show the "Join Your Squad" screen instead of an error. */
const PREVIEW = process.env.NEXT_PUBLIC_SKIP_AUTH === "true" && process.env.NODE_ENV !== "production";

export default function InternshipGate() {
  const [state, setState] = useState<"loading" | "no-squad" | "squad">("loading");

  useEffect(() => {
    let active = true;
    getSquad().then(
      () => active && setState("squad"),
      // Any other error is shown by the progress page itself.
      (e) => active && setState((e instanceof ApiError && e.code === "NO_SQUAD") || PREVIEW ? "no-squad" : "squad")
    );
    return () => {
      active = false;
    };
  }, []);

  if (state === "no-squad") return <SquadMatchmaking />;
  if (state === "squad") return <InternshipProgress />;
  return <LoaderCircle className="mx-auto mt-[20vh] h-8 w-8 animate-spin text-[#14365a]" aria-label="Loading" />;
}
