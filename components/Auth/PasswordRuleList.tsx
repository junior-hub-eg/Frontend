import { Check, X } from "lucide-react";
import { PASSWORD_RULES } from "@/lib/auth/password-rules";
import { cn } from "@/lib/utils";

function RuleIcon({ state }: { state: "idle" | "ok" | "bad" }) {
  const Icon = state === "bad" ? X : Check;
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-[clamp(12px,1.5cqw,15px)] shrink-0 items-center justify-center rounded-full text-white",
        state === "ok" && "bg-[#22a559]",
        state === "bad" && "bg-[#e23b3b]",
        state === "idle" && "bg-[#cfd5d4]"
      )}
    >
      <Icon className="size-[65%]" strokeWidth={3.5} />
    </span>
  );
}

/** The password rules with a live tick or cross, as on the Create login design. */
export function PasswordRuleList({ password, className }: { password: string; className?: string }) {
  return (
    <ul className={cn("flex flex-col gap-[clamp(4px,0.7cqw,7px)] text-[length:clamp(9px,1.1cqw,11px)] text-[#1B2D54]", className)}>
      {PASSWORD_RULES.map((rule) => {
        const state = password.length === 0 ? "idle" : rule.test(password) ? "ok" : "bad";
        return (
          <li key={rule.id} className="flex items-center gap-2">
            <RuleIcon state={state} />
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
