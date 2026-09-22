import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-10 text-center">
      <h1 className="text-3xl font-semibold">الصفحة مش موجودة</h1>
      <p className="text-muted-foreground">الرابط ده مش موجود أو اتغيّر.</p>
      <Link href="/">
        <Button>ارجع للرئيسية</Button>
      </Link>
    </div>
  );
}
