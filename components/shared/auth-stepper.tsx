import { cn } from "@/lib/utils";

interface AuthStepperProps {
  total?: number;
  current: number;
  className?: string;
}

export function AuthStepper({ total = 4, current, className }: AuthStepperProps) {
  return (
    <div
      className={cn("flex gap-2", className)}
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current}
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={cn("h-[3px] flex-1 rounded-full", i < current ? "bg-primary" : "bg-border")}
        />
      ))}
    </div>
  );
}