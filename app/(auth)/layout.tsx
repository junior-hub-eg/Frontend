import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-muted/40 p-6">
      <div className="flex w-full max-w-md flex-col gap-6">
        <Link href="/" className="text-center text-xl font-semibold text-primary">
          {APP_NAME}
        </Link>
        {children}
      </div>
    </div>
  );
}
