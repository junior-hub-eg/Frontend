"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth/auth-context";

const STAGES = [
  { title: "الكورسات", href: "/learner/courses", desc: "شاهد الفيديوهات وحل الكويزات لكل مسار" },
  { title: "AI Interview", href: "/learner/ai-interview", desc: "قيّم جاهزيتك بالثلاث مراحل" },
  { title: "المشاريع", href: "/learner/projects", desc: "اشتغل مع فريق حقيقي بعد ما تعدي البوابة" },
  { title: "البروفايل", href: "/learner/profile", desc: "تاريخ مهامك وتقييمات المونيتور" },
] as const;

export default function LearnerDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 md:p-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">أهلاً {user?.firstName} 👋</h1>
        <p className="mt-1 text-muted-foreground">رحلتك من التعلم لحد التوظيف — خطوة خطوة</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAGES.map((stage) => (
          <Link key={stage.href} href={stage.href}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <Badge variant="primary" className="w-fit">
                  المرحلة
                </Badge>
                <CardTitle className="mt-2">{stage.title}</CardTitle>
                <CardDescription>{stage.desc}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">
          البيانات هنا هتتربط بالـ Learning Phase API (Sprint 2) و AI Interview Session API (Sprint 3) بمجرد ما يبقوا
          جاهزين.
        </CardContent>
      </Card>
    </div>
  );
}
