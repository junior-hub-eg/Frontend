"use client";

import { useState } from "react";
import { ExternalLink, Play } from "lucide-react";

import { useT } from "@/lib/i18n/client";
import { youTubeCover, youTubeEmbed, youTubeWatch } from "@/lib/youtube";

/**
 * A lesson's YouTube Short. It shows the cover with a play button and loads the player on the click, so it plays
 * with sound in every browser (Safari and blockers stop players that start on their own). A link opens the Short
 * on YouTube when the player cannot load.
 */
export default function ShortPlayer({ id, title }: { id: string; title: string }) {
  const t = useT();
  const [started, setStarted] = useState(false);

  return (
    <>
      {started ? (
        <iframe
          src={youTubeEmbed(id)}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 size-full border-0 bg-black"
        />
      ) : (
        <button
          type="button"
          onClick={() => setStarted(true)}
          aria-label={t("Play video")}
          className="group absolute inset-0 grid place-items-center bg-black"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- a remote YouTube cover, no resizing needed */}
          <img src={youTubeCover(id)} alt="" className="absolute inset-0 size-full object-cover opacity-90" />
          <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
          <span className="relative grid size-[4.2em] place-items-center rounded-full bg-white/25 ring-1 ring-white/60 backdrop-blur-sm transition-transform group-hover:scale-110">
            <Play className="size-[1.7em] fill-white text-white" />
          </span>
          <span className="absolute inset-x-0 bottom-0 p-[1em] text-start">
            <span className="block text-[0.6em] font-bold uppercase tracking-wide text-white/70">{t("Short video")}</span>
            <span dir="auto" className="mt-[0.2em] block text-[0.95em] font-extrabold leading-tight text-white">
              {title}
            </span>
          </span>
        </button>
      )}

      <a
        href={youTubeWatch(id)}
        target="_blank"
        rel="noopener noreferrer"
        className={`absolute top-[0.7em] z-10 inline-flex ${started ? "left-1/2 -translate-x-1/2" : "end-[0.7em]"} items-center gap-[0.35em] rounded-full bg-black/55 px-[0.8em] py-[0.35em] text-[0.6em] font-semibold text-white backdrop-blur-sm hover:bg-black/70`}
      >
        <ExternalLink className="size-[1.1em]" />
        {t("Watch on YouTube")}
      </a>
    </>
  );
}
