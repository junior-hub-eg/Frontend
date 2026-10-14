import Link from "next/link";
import type { Route } from "next";
import { ChevronRight, KeyRound, Link2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AuthPanel } from "@/components/shared/auth-panel";
import { HelpCard } from "@/components/shared/help-card";

const options = [
  {
    href: "/activation/link" as Route,
    title: "I Have An Activation Link",
    desc: "Open The Link From Your School",
    icon: Link2,
    tint: "bg-primary/15 text-primary",
  },
  {
    href: "/activation/code" as Route,
    title: "I Have An Activation Code",
    desc: "Enter The Code Manually",
    icon: KeyRound,
    tint: "bg-violet-100 text-violet-600",
  },
];

export default function ActivationPage() {
  return (
    <AuthPanel>
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Activate Your Account</h1>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Activate Your Account Today To Access Exclusive Features And Begin Your Journey Immediately.
          </p>
        </div>

        <div className="space-y-3">
          {options.map(({ href, title, desc, icon: Icon, tint }) => (
            <Link key={title} href={href} className="block">
              <Card className="flex items-center gap-3 p-3 transition-colors hover:border-primary/40">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tint}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="flex-1">
                  <span className="block text-xs font-semibold">{title}</span>
                  <span className="block text-[10px] text-muted-foreground">{desc}</span>
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Card>
            </Link>
          ))}
        </div>

        <HelpCard />
      </div>
    </AuthPanel>
  );
}