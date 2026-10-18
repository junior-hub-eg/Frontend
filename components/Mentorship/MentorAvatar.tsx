import { cn } from "@/lib/utils";

const PALETTE = ["bg-[#DBF4F1] text-[#12939b]", "bg-[#DCEAFB] text-[#2563EB]", "bg-[#FBEEDC] text-[#C2780C]", "bg-[#F0E4FB] text-[#7C3AED]", "bg-[#FBE1E3] text-[#D1365A]"];

/** Initials avatar (no mentor photos in the design assets yet), with the green "online" dot from the Figma. */
export function MentorAvatar({ name, className, online = false }: { name: string; className?: string; online?: boolean }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
  const color = PALETTE[name.length % PALETTE.length];

  return (
    <span aria-hidden className={cn("relative grid shrink-0 place-items-center rounded-full text-sm font-semibold", color, className ?? "size-12")}>
      {initials}
      {online && <span className="absolute bottom-0 right-0 size-3 rounded-full bg-[#2fc39b] ring-2 ring-white" />}
    </span>
  );
}
