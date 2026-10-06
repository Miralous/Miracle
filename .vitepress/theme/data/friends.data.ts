import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import path from "path";
import { defineLoader } from "vitepress";

export interface Friend {
  fileName: string;
  title: string;
  link?: string;
  desc?: string;
  img?: string;
  folder?: string;
}

let data: Friend[];

export { data };

const AVATAR_DIR = path.resolve(process.cwd(), "public/friends");
const AVATAR_EXTENSIONS = [
  ".webp",
  ".png",
  ".jpg",
  ".jpeg",
  ".avif",
  ".gif",
  ".svg",
  ".ico",
];

function localAvatar(url?: string): string | undefined {
  if (!url || !/^https?:\/\//.test(url)) return undefined;

  const hash = createHash("sha1").update(url).digest("hex");
  for (const extension of AVATAR_EXTENSIONS) {
    const file = path.join(AVATAR_DIR, `${hash}${extension}`);
    if (existsSync(file)) return `/friends/${hash}${extension}`;
  }

  return undefined;
}

export default defineLoader({
  watch: ["public/data/friends/*.json", "public/friends/*"],
  load(files) {
    return files
      .filter((file) => file.endsWith(".json"))
      .map((file) => {
        const fileName = path.basename(file);
        const content = JSON.parse(readFileSync(file, "utf-8"));
        const img = localAvatar(content.img) ?? content.img;
        return { fileName, ...content, img };
      });
  },
});
