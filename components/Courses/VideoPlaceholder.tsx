import { Maximize2, Play, Volume2 } from "lucide-react";

/** Static stand-in for the lesson video until the real player / content API is connected. */
export function VideoPlaceholder({ title }: { title: string }) {
  return (
    <div
      role="img"
      aria-label={`Video placeholder for ${title}`}
      className="relative flex aspect-video w-full flex-col justify-between overflow-hidden rounded-2xl bg-linear-to-br from-[#1b2a5c] to-[#14757d] p-4 text-white"
    >
      <span className="w-fit rounded-md bg-white/15 px-2 py-0.5 text-[10px] font-medium">Video preview</span>
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-white/20 backdrop-blur-sm">
          <Play size={24} className="fill-white" />
        </span>
        <p className="text-sm font-semibold">Lesson video placeholder</p>
        <p className="max-w-xs text-[11px] text-white/70">The video player will appear here once the lesson content is connected.</p>
      </div>
      <div className="flex items-center gap-3 text-[10px]">
        <Play aria-hidden size={12} className="fill-white" />
        <span>0:00</span>
        <span className="h-1 flex-1 rounded-full bg-white/25">
          <span className="block h-full w-1/4 rounded-full bg-white" />
        </span>
        <span>12:00</span>
        <Volume2 aria-hidden size={13} />
        <Maximize2 aria-hidden size={13} />
      </div>
    </div>
  );
}
