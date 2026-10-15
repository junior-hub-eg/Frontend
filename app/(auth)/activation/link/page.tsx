"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ClipboardPaste, Link2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthPanel } from "@/components/shared/auth-panel";
import { AuthStepper } from "@/components/shared/auth-stepper";
import { HelpCard } from "@/components/shared/help-card";
import { useActivationCheck } from "@/lib/auth/use-activation-check";

const schema = z.object({
  link: z.string().min(1, "Paste the activation link").url("Enter a valid link"),
});
type FormValues = z.infer<typeof schema>;

export default function LinkActivationPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const check = useActivationCheck();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { link: "" } });

  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      setValue("link", text.trim(), { shouldValidate: true });
    } catch {
      /* clipboard permission denied */
    }
  }

  async function onSubmit(values: FormValues) {
    setServerError(null);
    const message = await check({ link: values.link });
    if (message) setServerError(message);
  }

  return (
    <AuthPanel>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <AuthStepper current={1} />

        <div className="text-center">
          <h1 className="text-xl font-bold tracking-tight">Enter Activation Link</h1>
          <p className="mt-1 text-xs text-muted-foreground">Paste The Link Provided By School.</p>
        </div>

        {serverError && <Alert variant="danger">{serverError}</Alert>}

        <div className="space-y-1.5">
          <Label htmlFor="link">Link</Label>
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
            <Input
              id="link"
              dir="ltr"
              placeholder="https://juniorhub.com/activate/xxxxxxxx"
              aria-invalid={!!errors.link}
              className="pl-9 pr-10"
              {...register("link")}
            />
            <button
              type="button"
              onClick={pasteFromClipboard}
              aria-label="Paste link"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
            >
              <ClipboardPaste className="h-4 w-4" />
            </button>
          </div>
          {errors.link && <p className="text-xs text-danger">{errors.link.message}</p>}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-primary to-[#14365a] hover:opacity-90"
        >
          {isSubmitting ? "Checking..." : "Continue"}
        </Button>

        <HelpCard />
      </form>
    </AuthPanel>
  );
}