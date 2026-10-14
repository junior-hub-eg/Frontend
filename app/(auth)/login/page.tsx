"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth/auth-context";
import { ROLE_HOME } from "@/lib/constants";
import { subscribe, getDemoCredentialsSnapshot, getServerCredentialsSnapshot } from "@/lib/auth/mock-auth";

const schema = z.object({
  email: z.string().email("إيميل غير صحيح"),
  password: z.string().min(1, "الباسورد مطلوب"),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const demoAccounts = useSyncExternalStore(subscribe, getDemoCredentialsSnapshot, getServerCredentialsSnapshot);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  function onSubmit(values: FormValues) {
    try {
      setError(null);
      const user = login(values.email, values.password);
      router.push(ROLE_HOME[user.role] as Route);
    } catch (e) {
      setError(e instanceof Error ? e.message : "حصل خطأ غير متوقع");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>تسجيل الدخول</CardTitle>
        <CardDescription>ادخل بياناتك للمتابعة في Junior Hub</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {error && (
          <Alert variant="danger" role="alert">
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">الإيميل</Label>
            <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} />
            {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">الباسورد</Label>
            <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
            {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
          </div>
          <Button type="submit" disabled={isSubmitting} className="mt-2">
            دخول
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          مستخدم جديد؟{" "}
          <Link href="/register" className="font-medium text-primary">
            سجل حساب طالب
          </Link>
        </p>
        {process.env.NODE_ENV !== "production" && demoAccounts.length > 0 && (
          <Alert>
            <p className="mb-1 font-medium">حسابات تجريبية (باسورد demo):</p>
            <ul className="space-y-0.5">
              {demoAccounts.map((acc) => (
                <li key={acc.email}>
                  {acc.role}: {acc.email}
                </li>
              ))}
            </ul>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
