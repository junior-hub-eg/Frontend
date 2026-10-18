import { cn } from "@/lib/utils";

const PALETTE = ["bg-[#DBF4F1] text-[#12939b]", "bg-[#DCEAFB] text-[#2563EB]", "bg-[#FBEEDC] text-[#C2780C]", "bg-[#F0E4FB] text-[#7C3AED]", "bg-[#FBE1E3] text-[#D1365A]"];

/** Initials avatar (no mentor photos in the design assets yet). */
export function MentorAvatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
  const color = PALETTE[name.length % PALETTE.length];

  return (
    <span aria-hidden className={cn("grid shrink-0 place-items-center rounded-full text-sm font-semibold", color, className ?? "size-12")}>
      {initials}
    </span>
  );
}
