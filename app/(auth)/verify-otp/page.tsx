import { Suspense } from "react";
import { VerifyOtpForm } from "@/components/Auth/VerifyOtpForm";

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={null}>
      <VerifyOtpForm />
    </Suspense>
  );
}
