/** The video id of a YouTube link (watch, shorts, embed or youtu.be), or null for any other URL. */
export function youTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:shorts\/|embed\/|watch\?(?:.*&)?v=)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}

/**
 * Embed URL started by the student's click, so it plays with sound in every browser (Safari blocks autoplay
 * and some blockers stop youtube-nocookie.com, so the normal youtube.com player is used).
 */
export const youTubeEmbed = (id: string) =>
  `https://www.youtube.com/embed/${id}?${new URLSearchParams({
    autoplay: "1",
    loop: "1",
    playlist: id,
    playsinline: "1",
    rel: "0",
  })}`;

/** The vertical cover picture of a Short. */
export const youTubeCover = (id: string) => `https://i.ytimg.com/vi/${id}/oar2.jpg`;

/** The Short on YouTube itself, for when the player cannot load. */
export const youTubeWatch = (id: string) => `https://www.youtube.com/shorts/${id}`;
