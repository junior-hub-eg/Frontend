"use client";

import { useRouter } from "next/navigation";
import { checkActivation, type ActivationKey } from "@/lib/auth/account-api";
import { activationState } from "@/lib/auth/auth-flow-storage";
import { ApiError, errorMessage } from "@/lib/api-client";

/**
 * Step 1 of school activation, shared by the code and link pages: check the key, keep the details for
 * the next steps and go on, or show the "not valid" page. Returns an error message to show in place,
 * or null when it navigated away.
 */
export function useActivationCheck() {
  const router = useRouter();

  return async function check(key: ActivationKey): Promise<string | null> {
    try {
      const details = await checkActivation(key);
      activationState.set({ key, details });
      router.push("/details-check");
      return null;
    } catch (e) {
      if (e instanceof ApiError && e.code === "ACTIVATION_INVALID") {
        router.push("/code-error");
        return null;
      }
      if (e instanceof ApiError && e.code === "VALIDATION_FAILED") return Object.values(e.fieldErrors)[0] ?? errorMessage(e);
      return errorMessage(e);
    }
  };
}
