"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Mail, X } from "lucide-react";
import { AuthPanel } from "@/components/shared/auth-panel";
import { AuthStepper } from "@/components/shared/auth-stepper";
import { AuthButton } from "./AuthButton";
import { AuthField } from "./AuthField";
import { PasswordField } from "./PasswordField";
import { cn } from "@/lib/utils";

const EMAIL = "hamada.yasser@gmail.com";

const NAVY = "text-[#1B2D54]";

const RULES = [
  { id: "length", label: "At Least 8 Characters", test: (p: string) => p.length >= 8 },
  { id: "mix", label: "Use Letters & Numbers", test: (p: string) => /[A-Za-z]/.test(p) && /\d/.test(p) },
  { id: "special", label: "Include Special Characters (! ^ # ! @ $)", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

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

export default function CreateLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const results = RULES.map((rule) => ({ ...rule, ok: rule.test(password) }));
  const allRulesOk = results.every((r) => r.ok);
  const mismatch = confirm.length > 0 && confirm !== password;
  const canContinue = allRulesOk && confirm.length > 0 && !mismatch;

  function handleContinue() {
    if (!canContinue) return;
    router.push("/login");
  }

  return (
    <AuthPanel>
      <AuthStepper
        current={3}
        total={4}
        className="mx-auto w-[77%] gap-[clamp(6px,1cqw,10px)] [&>span]:h-[clamp(4px,0.6cqw,6px)] [&>span]:bg-[#c9efe9] [&>span:nth-child(-n+3)]:bg-[#14757d]"
      />

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          handleContinue();
        }}
        className="flex flex-col gap-[clamp(10px,1.8cqw,18px)]"
      >
        <div className="text-center">
          <h1 className={cn("text-[length:clamp(20px,2.5cqw,28px)] font-semibold leading-tight", NAVY)}>
            Create Your Login
          </h1>
          <p className={cn("mt-1 text-[length:clamp(11px,1.4cqw,16px)] font-normal leading-tight", NAVY)}>
            Type The Code Provided By School.
          </p>
        </div>

        <div className="flex flex-col gap-[clamp(8px,1.4cqw,14px)] [&>div>div:first-child]:py-[clamp(9px,1.4cqw,14px)] [&_label]:text-[#1B2D54] [&_svg]:text-[#1B2D54]">
          <AuthField label="Email" icon={Mail} type="email" value={EMAIL} readOnly className="text-[#6b7280]" />

          <PasswordField
            label="Password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <PasswordField
            label="Password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={mismatch ? "Passwords don't match" : undefined}
          />
        </div>

        <ul className={cn("flex flex-col gap-[clamp(4px,0.7cqw,7px)] text-[length:clamp(9px,1.1cqw,11px)]", NAVY)}>
          {results.map((rule) => {
            const state = password.length === 0 ? "idle" : rule.ok ? "ok" : "bad";
            return (
              <li key={rule.id} className="flex items-center gap-2">
                <RuleIcon state={state} />
                {rule.label}
              </li>
            );
          })}
        </ul>

        <AuthButton type="submit" disabled={!canContinue}>
          Continue
        </AuthButton>
      </form>
    </AuthPanel>
  );
}
