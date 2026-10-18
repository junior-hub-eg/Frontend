/**
 * State carried between the steps of a multi-page auth flow, in sessionStorage so it is gone when the
 * tab closes. Holds no password; the activation code and reset token are single-use and short-lived.
 */
"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { ActivationDetails, ActivationKey } from "@/lib/auth/account-api";

const ACTIVATION_KEY = "jh_activation";
const RESET_TOKEN_KEY = "jh_reset_token";

export interface ActivationState {
  key: ActivationKey;
  details: ActivationDetails;
}

function read<T>(name: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(name);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(name: string, value: unknown | null) {
  if (typeof window === "undefined") return;
  if (value === null) window.sessionStorage.removeItem(name);
  else window.sessionStorage.setItem(name, JSON.stringify(value));
}

const subscribeNothing = () => () => {};

/**
 * Reads a stored value during render. Undefined while rendering on the server and hydrating
 * (sessionStorage is not readable yet), then the value, or null when there is none.
 */
function useStored<T>(name: string): T | null | undefined {
  const raw = useSyncExternalStore(
    subscribeNothing,
    () => {
      try {
        return window.sessionStorage.getItem(name) ?? "";
      } catch {
        return "";
      }
    },
    () => undefined
  );
  return useMemo(() => {
    if (raw === undefined) return undefined;
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }, [raw]);
}

export const useActivationState = () => useStored<ActivationState>(ACTIVATION_KEY);
export const useResetTicket = () => useStored<{ token: string; email: string }>(RESET_TOKEN_KEY);

export const activationState = {
  get: () => read<ActivationState>(ACTIVATION_KEY),
  set: (state: ActivationState) => write(ACTIVATION_KEY, state),
  clear: () => write(ACTIVATION_KEY, null),
};

export const resetTokenState = {
  get: () => read<{ token: string; email: string }>(RESET_TOKEN_KEY),
  set: (token: string, email: string) => write(RESET_TOKEN_KEY, { token, email }),
  clear: () => write(RESET_TOKEN_KEY, null),
};
