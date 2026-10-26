"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { youTubeEmbed, youTubeId } from "@/lib/youtube";
import { cn } from "@/lib/utils";

/**
 * A lesson video from a link: a YouTube video shows its cover and loads the player on play (with a "Watch on YouTube"
 * link for when it cannot load); any other link plays as a video file.
 */
export default function VideoEmbed({ url, title, className }: { url: string; title: string; className?: string }) {
  const t = useT();
  const [playing, setPlaying] = useState(false);
  const id = youTubeId(url);

  if (!id)
    return (
      <video controls preload="metadata" src={url} className={cn("aspect-video w-full rounded-xl bg-black", className)}>
        {t("Your browser can't play this video.")}
      </video>
    );

  return (
    <div className={className}>
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
        {playing ? (
          <iframe
            src={youTubeEmbed(id).replace("loop=1", "loop=0")}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            className="absolute inset-0 size-full"
          />
        ) : (
          <button type="button" onClick={() => setPlaying(true)} aria-label={t("Play video")} className="group absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" className="size-full object-cover opacity-85" />
            <span className="absolute left-1/2 top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#0b6b70]/90 text-white ring-4 ring-white/40 transition group-hover:scale-105">
              <Play aria-hidden className="ms-0.5 size-6 fill-white" />
            </span>
          </button>
        )}
      </div>
      <a href={`https://www.youtube.com/watch?v=${id}`} target="_blank" rel="noreferrer" className="mt-1.5 inline-block text-[10px] font-semibold text-[#0b6b70] hover:underline">
        {t("Watch on YouTube")}
      </a>
    </div>
  );
}
