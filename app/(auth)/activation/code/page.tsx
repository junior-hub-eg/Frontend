"use client";

import { useRef, useState } from "react";
import { z } from "zod";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthPanel } from "@/components/shared/auth-panel";
import { AuthStepper } from "@/components/shared/auth-stepper";
import { HelpCard } from "@/components/shared/help-card";

const CODE_LENGTH = 6;
const codeSchema = z.string().length(CODE_LENGTH, `Enter the full ${CODE_LENGTH}-character code`);

export default function CodeActivationPage() {
  const [values, setValues] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  function handleChange(index: number, raw: string) {
    const char = raw.slice(-1).toUpperCase();
    setValues((prev) => prev.map((v, i) => (i === index ? char : v)));
    if (char && index < CODE_LENGTH - 1) refs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !values[index] && index > 0) refs.current[index - 1]?.focus();
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text").replace(/\s/g, "").toUpperCase().slice(0, CODE_LENGTH);
    if (!text) return;
    e.preventDefault();
    setValues(Array.from({ length: CODE_LENGTH }, (_, i) => text[i] ?? ""));
    refs.current[Math.min(text.length, CODE_LENGTH - 1)]?.focus();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = codeSchema.safeParse(values.join(""));
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      // TODO: call the activation endpoint with parsed.data
    } catch {
      setError("Invalid or expired code. Please contact your school.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPanel>
      <form onSubmit={onSubmit} className="space-y-5">
        <AuthStepper current={1} />

        <div className="text-center">
          <h1 className="text-xl font-bold tracking-tight">Enter Activation Code</h1>
          <p className="mt-1 text-xs text-muted-foreground">Type The Code Provided By School.</p>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <div className="flex items-center justify-center gap-2" dir="ltr">
          {values.map((value, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                ref={(el) => {
                  refs.current[i] = el;
                }}
                value={value}
                maxLength={1}
                inputMode="text"
                autoComplete="one-time-code"
                aria-label={`Code character ${i + 1}`}
                aria-invalid={!!error}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                className="h-10 w-10 px-0 text-center font-semibold"
              />
              {i === 2 && <span className="mx-1 h-6 w-px bg-border" />}
            </div>
          ))}
        </div>

        <Button
          type="submit"
          disabled={loading || values.join("").length < CODE_LENGTH}
          className="w-full bg-gradient-to-r from-primary to-[#14365a] hover:opacity-90"
        >
          {loading ? "Checking..." : "Continue"}
        </Button>

        <HelpCard />
      </form>
    </AuthPanel>
  );
}