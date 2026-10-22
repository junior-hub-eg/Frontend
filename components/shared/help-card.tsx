"use client";

import { Flag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useT } from "@/lib/i18n/client";

export function HelpCard() {
  const t = useT();
  return (
    <Card className="flex items-center gap-3 bg-gradient-to-r from-background to-primary/10 p-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
        <Flag className="h-4 w-4" />
      </span>
      <div>
        <p className="text-xs font-semibold">{t("Need Help?")}</p>
        <p className="text-[10px] leading-4 text-muted-foreground">
          {t("Contact Your School If You Don't Have Code Or It's Not Working.")}
        </p>
      </div>
    </Card>
  );
}