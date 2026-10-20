import type { Route } from "next";
import { redirect } from "next/navigation";

/** The interview moved to /learner/ai-interview; old links keep their query. */
export default async function DiscoveryPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const query = new URLSearchParams(await searchParams).toString();
  redirect(`/learner/ai-interview${query ? `?${query}` : ""}` as Route);
}
