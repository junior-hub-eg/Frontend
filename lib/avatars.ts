/**
 * The cartoon avatars a student can choose (backend PUT /api/v1/me/avatar accepts these keys only).
 * The backend stores the image path as the student's photoUrl.
 */
export interface Avatar {
  key: string;
  label: string;
  src: string;
  /** Circle colour behind the transparent character, from the Figma. */
  bg: string;
}

export const AVATARS: Avatar[] = [
  { key: "boy-laughing", label: "Laughing boy", src: "/images/avatars/boy-laughing.png", bg: "#ffc107" },
  { key: "boy-blue-cap", label: "Boy with a blue cap", src: "/images/avatars/boy-blue-cap.png", bg: "#ffc107" },
  { key: "girl-orange", label: "Girl in orange", src: "/images/avatars/girl-orange.png", bg: "#f6f1d6" },
  { key: "boy-thinking", label: "Thinking boy", src: "/images/avatars/boy-thinking.png", bg: "#2a8a1f" },
  { key: "girl-purple-cap", label: "Girl with a purple cap", src: "/images/avatars/girl-purple-cap.png", bg: "#c98a5e" },
  { key: "girl-dumbbells", label: "Girl with dumbbells", src: "/images/avatars/girl-dumbbells.png", bg: "#e0157e" },
  { key: "boy-reading", label: "Boy reading", src: "/images/avatars/boy-reading.png", bg: "#fbf59c" },
];

/** The catalogue avatar for a stored photoUrl, if it is one. */
export function catalogueAvatar(photoUrl: string | null | undefined): Avatar | undefined {
  return photoUrl ? AVATARS.find((a) => a.src === photoUrl) : undefined;
}

/** The avatar to draw: the chosen one, or a default picked by position so a list looks varied. */
export function avatarOrDefault(photoUrl: string | null | undefined, index = 0): Avatar {
  return catalogueAvatar(photoUrl) ?? AVATARS[((index % AVATARS.length) + AVATARS.length) % AVATARS.length];
}
