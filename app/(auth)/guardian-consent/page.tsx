"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { decideConsent, getPendingConsentsForGuardianEmail } from "@/lib/auth/mock-auth";
import type { GuardianConsent, User } from "@/lib/types";

const schema = z.object({ guardianEmail: z.string().email("إيميل غير صحيح") });
type FormValues = z.infer<typeof schema>;

export default function GuardianConsentPage() {
  const [pending, setPending] = useState<{ consent: GuardianConsent; learner?: User }[] | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  function onSubmit(values: FormValues) {
    setPending(getPendingConsentsForGuardianEmail(values.guardianEmail));
  }

  function handleDecision(consentId: string, decision: "granted" | "revoked") {
    decideConsent(consentId, decision);
    setPending((prev) => (prev ? prev.filter((p) => p.consent.id !== consentId) : prev));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>موافقة ولي الأمر</CardTitle>
        <CardDescription>
          الأمان جزء أساسي من المنصة — الحساب، جمع البيانات، والتواصل مع المونيتور كلهم محتاجين موافقتك (PRD §8)
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="guardianEmail">إيميلك (اللي اتسجل وقت تسجيل الطالب)</Label>
            <Input id="guardianEmail" type="email" {...register("guardianEmail")} />
            {errors.guardianEmail && <p className="text-xs text-danger">{errors.guardianEmail.message}</p>}
          </div>
          <Button type="submit">عرض الطلبات</Button>
        </form>

        {pending && pending.length === 0 && <Alert>مفيش طلبات موافقة معلّقة على الإيميل ده.</Alert>}

        {pending && pending.length > 0 && (
          <div className="flex flex-col gap-3">
            {pending.map(({ consent, learner }) => (
              <div key={consent.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="font-medium">{learner?.firstName ?? "طالب"}</p>
                  <p className="text-xs text-muted-foreground">{learner?.email}</p>
                  <Badge variant="warning" className="mt-1">
                    {consent.consentType}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleDecision(consent.id, "granted")}>
                    موافق
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDecision(consent.id, "revoked")}>
                    رفض
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
