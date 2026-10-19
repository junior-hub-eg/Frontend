"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  // Back to the page the user came from; straight to the home page when there is none.
  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push("/");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-10 text-center">
      <h1 className="text-3xl font-semibold">الصفحة مش موجودة</h1>
      <p className="text-muted-foreground">الرابط ده مش موجود أو اتغيّر.</p>
      <Button type="button" onClick={goBack}>
        ارجع للصفحة اللي كنت فيها
      </Button>
    </div>
  );
}
