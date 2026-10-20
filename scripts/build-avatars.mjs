// Turns the full-size avatar pack (design-assets/avatars-source, not in git) into the small WebP files
// the site serves from public/images/avatars. Run it again after the pack changes:
//   node scripts/build-avatars.mjs
// The character and emotion lists must match lib/avatars.ts and the backend's ChangeAvatarHandler.
import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SOURCE = "design-assets/avatars-source";
const OUT = "public/images/avatars";
const SIZE = 384;

/** Students choose from the young characters: id -> folder in the pack. */
const STUDENTS = {
  "boy-1": "Male/person 1",
  "boy-2": "Male/person 7",
  "boy-3": "Male/person 4",
  "boy-4": "Male/person 10",
  "girl-1": "Female/person 1",
  "girl-2": "Female/person 7",
  "girl-3": "Female/person 4",
  "girl-4": "Female/person 10",
};

/** Mentors are the grown-ups, always smiling. */
const MENTORS = {
  "man-1": "Male/person 2",
  "man-2": "Male/person 8",
  "man-3": "Male/person 5",
  "man-4": "Male/person 11",
  "man-5": "Male/person 3",
  "man-6": "Male/person 9",
  "man-7": "Male/person 6",
  "man-8": "Male/person 12",
  "woman-1": "Female/person 2",
  "woman-2": "Female/person 8",
  "woman-3": "Female/person 5",
  "woman-4": "Female/person 11",
  "woman-5": "Female/person 3",
  "woman-6": "Female/person 9",
  "woman-7": "Female/person 6",
  "woman-8": "Female/person 12",
};

/** "Emotion=In love.png" -> "in-love" */
const emotionOf = (file) => file.match(/Emotion=(.+)\.png$/)[1].toLowerCase().replace(/\s+/g, "-");

async function convert(from, to) {
  await sharp(from).resize(SIZE, SIZE).webp({ quality: 82, alphaQuality: 90 }).toFile(to);
}

await mkdir(path.join(OUT, "mentors"), { recursive: true });
let count = 0;

for (const [id, folder] of Object.entries(STUDENTS)) {
  for (const file of await readdir(path.join(SOURCE, folder))) {
    if (!file.endsWith(".png")) continue;
    await convert(path.join(SOURCE, folder, file), path.join(OUT, `${id}-${emotionOf(file)}.webp`));
    count++;
  }
}

for (const [id, folder] of Object.entries(MENTORS)) {
  const smile = (await readdir(path.join(SOURCE, folder))).find((f) => f.endsWith("Emotion=Smile.png"));
  await convert(path.join(SOURCE, folder, smile), path.join(OUT, "mentors", `${id}.webp`));
  count++;
}

console.log(`Wrote ${count} avatars to ${OUT}`);
