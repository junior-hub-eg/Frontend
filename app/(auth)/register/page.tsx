"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { registerLearner } from "@/lib/auth/mock-auth";

const schema = z.object({
  firstName: z.string().min(1, "الاسم مطلوب"),
  lastName: z.string().optional(),
  email: z.string().email("إيميل غير صحيح"),
  password: z.string().min(6, "٦ حروف على الأقل"),
  age: z.coerce.number().min(11, "السن المسموح من ١١ لـ ١٨").max(18, "السن المسموح من ١١ لـ ١٨"),
  guardianEmail: z.string().email("إيميل ولي الأمر غير صحيح"),
});
type FormInput = z.input<typeof schema>;
type FormValues = z.output<typeof schema>;

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormValues>({ resolver: zodResolver(schema) });

  function onSubmit(values: FormValues) {
    try {
      setError(null);
      registerLearner(values);
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "حصل خطأ غير متوقع");
    }
  }

  if (done) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>تمام، الحساب اتعمل</CardTitle>
          <CardDescription>خطوة واحدة باقية قبل ما تقدر تدخل</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Alert>
            بعتنا لولي أمرك طلب موافقة (بيانات + التواصل مع المونيتور). الحساب هيتفعّل بمجرد ما يوافق من صفحة{" "}
            <Link href="/guardian-consent" className="font-medium text-primary">
              موافقة ولي الأمر
            </Link>
            .
          </Alert>
          <p className="text-xs text-muted-foreground">
            (نسخة تجريبية: الموافقة هنا بتتعمل يدوي من نفس المتصفح بدل الإيميل الحقيقي، لحد ما يبقى فيه Auth API من
            الباك إند)
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>حساب طالب جديد</CardTitle>
        <CardDescription>الأعمار من ١١ لـ ١٨ سنة — هيحتاج موافقة ولي الأمر بعد التسجيل</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {error && <Alert variant="danger">{error}</Alert>}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="firstName">الاسم الأول</Label>
              <Input id="firstName" {...register("firstName")} />
              {errors.firstName && <p className="text-xs text-danger">{errors.firstName.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lastName">الاسم الأخير</Label>
              <Input id="lastName" {...register("lastName")} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">الإيميل</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">الباسورد</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="age">السن</Label>
            <Input id="age" type="number" min={11} max={18} {...register("age")} />
            {errors.age && <p className="text-xs text-danger">{errors.age.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="guardianEmail">إيميل ولي الأمر</Label>
            <Input id="guardianEmail" type="email" {...register("guardianEmail")} />
            {errors.guardianEmail && <p className="text-xs text-danger">{errors.guardianEmail.message}</p>}
          </div>
          <Button type="submit" disabled={isSubmitting} className="mt-2">
            إنشاء الحساب
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          عندك حساب بالفعل؟{" "}
          <Link href="/login" className="font-medium text-primary">
            سجل دخول
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
