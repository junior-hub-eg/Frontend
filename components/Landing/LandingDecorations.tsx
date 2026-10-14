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