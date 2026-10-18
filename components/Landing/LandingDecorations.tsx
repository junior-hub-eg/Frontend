import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement>;

/** Four-point outlined star (the small "sparkle" in the Figma). Colour via text-* class. */
export function Sparkle(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 1.5 C12.8 7.5 16.5 11.2 22.5 12 C16.5 12.8 12.8 16.5 12 22.5 C11.2 16.5 7.5 12.8 1.5 12 C7.5 11.2 11.2 7.5 12 1.5 Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Spiky circle made of radiating lines. Colour via text-* class. */
export function SpikeBurst(props: Props) {
  const rays = Array.from({ length: 28 }, (_, i) => (i * 360) / 28);
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" {...props}>
      <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
        {rays.map((deg) => (
          <line key={deg} x1="24" y1="9" x2="24" y2="2" transform={`rotate(${deg} 24 24)`} />
        ))}
      </g>
    </svg>
  );
}

/** Facebook "f" glyph. Colour via text-* class. */
export function FacebookIcon(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M15 8.5h2V5.5h-2c-2.2 0-4 1.8-4 4v2H9v3h2v6h3v-6h2.2l.8-3H14v-2c0-.55.45-1 1-1Z" />
    </svg>
  );
}

/** WhatsApp phone-in-bubble glyph. Colour via text-* class. */
export function WhatsAppIcon(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 3.5a8.4 8.4 0 0 0-7.2 12.7L3.5 20.5l4.4-1.2A8.4 8.4 0 1 0 12 3.5Zm0 1.8a6.6 6.6 0 0 1 5.6 10.1 6.6 6.6 0 0 1-9.7 2.1l-.3-.2-2.4.6.6-2.3-.2-.3A6.6 6.6 0 0 1 12 5.3Zm-2.9 3.3c-.2 0-.4.1-.6.3-.2.2-.7.7-.7 1.6 0 1 .7 1.9.8 2 .1.2 1.4 2.2 3.5 3 .5.2.9.3 1.2.4.5.2 1 .1 1.3-.1.4-.2.7-.7.8-1.1.1-.3.1-.6.1-.7-.1-.1-.2-.2-.5-.3l-1.4-.7c-.2-.1-.4-.1-.5.1l-.6.7c-.1.1-.2.2-.4.1-.2-.1-.8-.3-1.5-.9-.6-.5-1-1.2-1.1-1.4-.1-.2 0-.3.1-.4l.3-.4c.1-.1.1-.2.2-.4 0-.1 0-.3 0-.4l-.6-1.5c-.2-.4-.3-.4-.5-.4h-.5Z" />
    </svg>
  );
}

/** Instagram camera glyph. Colour via text-* class. */
export function InstagramIcon(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3.8" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16.7" cy="7.3" r="1" fill="currentColor" />
    </svg>
  );
}