"use client";

import { useState } from "react";
import { ExternalLink, Play } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { youTubeCover, youTubeEmbed, youTubeId } from "@/lib/youtube";
import { cn } from "@/lib/utils";

/** The video id of a TikTok link (tiktok.com/@user/video/123...), or null for any other URL. */
function tikTokId(url: string): string | null {
  return url.match(/tiktok\.com\/(?:@[\w.-]+\/video|embed(?:\/v2)?|player\/v1)\/(\d{8,25})/)?.[1] ?? null;
}

/**
 * A short vertical video (a YouTube Short or a TikTok) next to a lesson's video. It shows a cover and loads the player
 * only on play, so it plays with sound everywhere; a link opens it on its own site when the player cannot load.
 */
export default function ShortEmbed({ url, title, className }: { url: string; title: string; className?: string }) {
  const t = useT();
  const [playing, setPlaying] = useState(false);
  const yt = youTubeId(url);
  const tt = yt ? null : tikTokId(url);
  if (!yt && !tt) return null;

  const src = yt
    ? youTubeEmbed(yt).replace("loop=1", "loop=0")
    : `https://www.tiktok.com/player/v1/${tt}?${new URLSearchParams({ autoplay: "1", music_info: "1", description: "1", rel: "0" })}`;
  const open = yt ? `https://www.youtube.com/shorts/${yt}` : url;

  return (
    <figure className={cn("mx-auto w-full max-w-[17em]", className)}>
      <div className="relative aspect-[9/16] w-full overflow-hidden rounded-[1.1em] bg-black shadow-[0_0.6em_1.6em_rgba(20,54,90,0.18)]">
        {playing ? (
          <iframe
            src={src}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            className="absolute inset-0 size-full border-0"
          />
        ) : (
          <button type="button" onClick={() => setPlaying(true)} aria-label={t("Play video")} className="group absolute inset-0 grid place-items-center">
            {yt ? (
              // eslint-disable-next-line @next/next/no-img-element -- a remote YouTube cover
              <img src={youTubeCover(yt)} alt="" className="absolute inset-0 size-full object-cover opacity-90" />
            ) : (
              <span aria-hidden className="absolute inset-0 bg-gradient-to-br from-[#25f4ee]/40 via-[#14365a] to-[#fe2c55]/50" />
            )}
            <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
            <span className="relative grid size-[3.6em] place-items-center rounded-full bg-white/25 ring-1 ring-white/60 backdrop-blur-sm transition-transform group-hover:scale-110">
              <Play className="ms-[0.15em] size-[1.5em] fill-white text-white" />
            </span>
            <span className="absolute inset-x-0 bottom-0 p-[0.9em] text-start">
              <span className="block text-[0.6em] font-bold uppercase tracking-wide text-white/75">{t("Short video")}</span>
              <span dir="auto" className="mt-[0.2em] block text-[0.85em] font-extrabold leading-tight text-white">
                {title}
              </span>
            </span>
          </button>
        )}
      </div>
      <figcaption className="mt-[0.4em] text-center">
        <a href={open} target="_blank" rel="noreferrer" className="inline-flex items-center gap-[0.3em] text-[0.75em] font-semibold text-[#0f7a81] hover:underline">
          <ExternalLink className="size-[1em]" />
          {yt ? t("Watch on YouTube") : t("Watch on TikTok")}
        </a>
      </figcaption>
    </figure>
  );
}
