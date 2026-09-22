import { PlaceholderPage } from "@/components/shared/placeholder-page";

export default function AdminModerationPage() {
  return (
    <PlaceholderPage
      title="مراجعة الشات"
      description="مراجعة الرسائل المُبلّغ عنها أو اللي فيها بيانات شخصية (PII) قبل الوصول — أولوية أمان قصوى"
      waitingOn="PII Filter Service (Sprint 5 AI) + Chat moderation queue API"
      prdSection="§8"
    />
  );
}
