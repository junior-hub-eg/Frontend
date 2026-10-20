"use client";

import { useEffect, useRef } from "react";
import { Code2, X } from "lucide-react";

interface ChooseTrackDialogProps {
  open: boolean;
  trackTitle: string;
  /** Saving the choice: the confirm button waits. */
  busy?: boolean;
  onCancel: () => void;
  /** "I'm new to it": start the track at Beginner. */
  onConfirm: () => void;
  /** "I know some": take the placement test to find the level. */
  onPlacement: () => void;
}

/** Modal built on the native <dialog> element (focus trap + Esc handled by the browser). */
/** Starting a track (decision of 21 Oct 2026): know some of it (placement test) or start from Beginner. */
export function ChooseTrackDialog({ open, trackTitle, busy = false, onCancel, onConfirm, onPlacement }: ChooseTrackDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onCancel();
      }}
      aria-labelledby="choose-track-title"
      className="m-auto w-[min(92vw,420px)] rounded-2xl p-0 shadow-2xl backdrop:bg-[#1b2a5c]/40 backdrop:backdrop-blur-sm"
    >
      <div className="relative flex flex-col items-center px-7 py-8 text-center">
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close"
          className="absolute right-3 top-3 grid size-7 place-items-center rounded-full text-[#1b2a5c]/60 hover:bg-[#E9F7F4]"
        >
          <X size={14} />
        </button>
        <span aria-hidden className="grid size-12 place-items-center rounded-full bg-[#E9F7F4] text-[#12939b]">
          <Code2 size={22} />
        </span>
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-wide text-[#12939b]">Choose your track</p>
        <h2 id="choose-track-title" className="mt-1 text-xl font-bold text-[#1b2a5c]">
          {trackTitle}
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-[#1b2a5c]/70">
          How much do you know about {trackTitle}? You also get a {trackTitle} mentor, and you keep your other tracks.
        </p>
        <div className="mt-6 grid w-full gap-3">
          <button
            type="button"
            onClick={onPlacement}
            disabled={busy}
            className="rounded-xl border border-[#12939b] px-4 py-3 text-left text-xs text-[#1b2a5c] hover:bg-[#E9F7F4] disabled:opacity-60"
          >
            <span className="block text-sm font-bold">I know some {trackTitle}</span>
            Answer 6 quick technical questions and start at your level.
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="rounded-xl bg-linear-to-r from-[#14757d] to-[#1b2a5c] px-4 py-3 text-left text-xs text-white hover:opacity-90 disabled:opacity-60"
          >
            <span className="block text-sm font-bold">{busy ? "Saving…" : "I'm new to it"}</span>
            Start from the Beginner lessons.
          </button>
          <button type="button" onClick={onCancel} className="mt-1 text-xs font-semibold text-[#12939b] hover:underline">
            Cancel
          </button>
        </div>
      </div>
    </dialog>
  );
}
