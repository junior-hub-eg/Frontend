"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/api-client";

/** Loads once on mount (and on reload): the data, the error (with its HTTP status and code), and whether it is loading. */
export function useApi<T>(load: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<{ status: number; code?: string; requestId?: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  });
  const key = JSON.stringify(deps);

  const reload = useCallback(() => {
    let active = true;
    setLoading(true);
    setError(null);
    loadRef.current().then(
      (value) => {
        if (!active) return;
        setData(value);
        setLoading(false);
      },
      (e: unknown) => {
        if (!active) return;
        const api = e instanceof ApiError ? e : null;
        const problem = api?.problem as { traceId?: string } | undefined;
        setError({ status: api?.status ?? 0, code: api?.code, requestId: problem?.traceId?.split("-")[1]?.slice(0, 8) ?? null });
        setLoading(false);
      },
    );
    return () => {
      active = false;
    };
    // The caller's deps decide when to load again (see `key`).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Loading starts after the first render, so the state changes happen in the request's callbacks.
  useEffect(() => {
    let cancel = () => {};
    const timer = setTimeout(() => (cancel = reload()), 0);
    return () => {
      clearTimeout(timer);
      cancel();
    };
  }, [reload]);
  return { data, setData, error, loading, reload };
}
