/** The video id of a YouTube link (watch, shorts, embed or youtu.be), or null for any other URL. */
export function youTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:shorts\/|embed\/|watch\?(?:.*&)?v=)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}

/** Embed URL that plays muted and loops, like a reel; the student unmutes in the player. */
export const youTubeEmbed = (id: string, autoplay = true) =>
  `https://www.youtube-nocookie.com/embed/${id}?${new URLSearchParams({
    autoplay: autoplay ? "1" : "0",
    mute: "1",
    loop: "1",
    playlist: id,
    playsinline: "1",
    rel: "0",
    modestbranding: "1",
  })}`;
