"use client";

import { useEffect, useRef } from "react";
import { Code2, X } from "lucide-react";

interface ChooseTrackDialogProps {
  open: boolean;
  trackTitle: string;
  onCancel: () => void;
  onConfirm: () => void;
}

/** Modal built on the native <dialog> element (focus trap + Esc handled by the browser). */
export function ChooseTrackDialog({ open, trackTitle, onCancel, onConfirm }: ChooseTrackDialogProps) {
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
          {trackTitle} will become your active learning track. You can explore its lessons and continue from the Courses overview.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[#12939b] px-5 py-2 text-xs font-semibold text-[#12939b] hover:bg-[#E9F7F4]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-linear-to-r from-[#14757d] to-[#1b2a5c] px-5 py-2 text-xs font-semibold text-white hover:opacity-90"
          >
            Confirm Track
          </button>
        </div>
      </div>
    </dialog>
  );
}
