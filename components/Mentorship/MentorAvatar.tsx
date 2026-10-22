import Image from "next/image";
import { cn } from "@/lib/utils";

const PALETTE = ["bg-[#DBF4F1] text-[#12939b]", "bg-[#DCEAFB] text-[#2563EB]", "bg-[#FBEEDC] text-[#C2780C]", "bg-[#F0E4FB] text-[#7C3AED]", "bg-[#FBE1E3] text-[#D1365A]"];

/** The mentor's photo, or their initials; with the green "online" dot from the Figma. */
export function MentorAvatar({
  name,
  photo,
  photoHasDot = false,
  className,
  online = false,
}: {
  name: string;
  photo?: string;
  photoHasDot?: boolean;
  className?: string;
  online?: boolean;
}) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
  const color = PALETTE[name.length % PALETTE.length];

  return (
    <span aria-hidden className={cn("relative grid shrink-0 place-items-center rounded-full text-sm font-semibold", !photo && color, className ?? "size-12")}>
      {photo ? <Image src={photo} alt="" fill sizes="64px" className="object-contain" /> : initials}
      {online && !(photo && photoHasDot) && (
        <span className="absolute bottom-0 end-0 size-3 rounded-full bg-[#2fc39b] ring-2 ring-white" />
      )}
    </span>
  );
}
