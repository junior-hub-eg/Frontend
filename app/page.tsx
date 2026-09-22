import Link from "next/link";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";

const PIPELINE = ["اتعلم", "اتقيّم", "اتوجّه بمنتور", "اشتغل في فريق", "اتوظّف"];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10 bg-muted/40 px-6 py-24 text-center">
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">{APP_NAME}</h1>
        <p className="mx-auto max-w-xl text-lg text-muted-foreground">
          منصة تحول خريجي البرامج التعليمية لمحترفين جاهزين للشغل — تقييم بالذكاء الاصطناعي، توجيه من منتورز حقيقيين،
          وتجربة فريق عمل فعلية.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
        {PIPELINE.map((step, i) => (
          <span key={step} className="flex items-center gap-2">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">{step}</span>
            {i < PIPELINE.length - 1 && <span>←</span>}
          </span>
        ))}
      </div>
      <div className="flex gap-3">
        <Link href="/register">
          <Button size="lg">سجل كطالب</Button>
        </Link>
        <Link href="/login">
          <Button size="lg" variant="outline">
            تسجيل الدخول
          </Button>
        </Link>
      </div>
    </div>
  );
}
