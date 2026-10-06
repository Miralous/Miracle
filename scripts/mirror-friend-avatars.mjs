import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "public", "data", "friends");
const OUT_DIR = path.join(ROOT, "public", "friends");

const MAX_EDGE = 320;
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const TIMEOUT_MS = 20000;
const CONCURRENCY = 5;
const USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const MIME_EXT = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
  "image/x-icon": ".ico",
  "image/vnd.microsoft.icon": ".ico",
};

function hashOf(url) {
  return createHash("sha1").update(url).digest("hex");
}

function isImage(buffer) {
  if (buffer.length < 12) return false;
  const starts = (bytes, offset = 0) =>
    bytes.every((byte, index) => buffer[offset + index] === byte);

  if (starts([0x89, 0x50, 0x4e, 0x47])) return true;
  if (starts([0xff, 0xd8, 0xff])) return true;
  if (starts([0x47, 0x49, 0x46, 0x38])) return true;
  if (starts([0x00, 0x00, 0x01, 0x00])) return true;
  if (starts([0x52, 0x49, 0x46, 0x46]) && starts([0x57, 0x45, 0x42, 0x50], 8))
    return true;
  if (starts([0x66, 0x74, 0x79, 0x70], 4)) return true;

  const head = buffer.subarray(0, 512).toString("utf-8").trimStart();
  return head.startsWith("<svg") || head.startsWith("<?xml");
}

function extensionFor(url, mimeType) {
  const fromMime =
    MIME_EXT[(mimeType || "").split(";")[0].trim().toLowerCase()];
  if (fromMime) return fromMime;

  const pathname = safePathname(url);
  const fromPath = pathname && path.extname(pathname).toLowerCase();
  if (fromPath && Object.values(MIME_EXT).includes(fromPath)) return fromPath;

  return ".png";
}

function safePathname(url) {
  try {
    return new URL(url).pathname;
  } catch {
    return "";
  }
}

async function fetchBuffer(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": USER_AGENT,
        accept: "image/*,*/*;q=0.8",
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return {
      buffer: Buffer.from(await response.arrayBuffer()),
      mimeType: response.headers.get("content-type") || "",
    };
  } finally {
    clearTimeout(timer);
  }
}

function proxyUrl(url) {
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}`;
}

async function optimize(buffer) {
  try {
    const sharp = (await import("sharp")).default;
    const output = await sharp(buffer)
      .rotate()
      .resize({
        width: MAX_EDGE,
        height: MAX_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toBuffer();
    return { buffer: output, extension: ".webp" };
  } catch {
    return null;
  }
}

async function mirror(url) {
  const hash = hashOf(url);
  const cached = readdirSync(OUT_DIR).find((name) => name.startsWith(hash));
  if (cached) {
    const filePath = path.join(OUT_DIR, cached);
    if (Date.now() - statSync(filePath).mtimeMs < MAX_AGE_MS) {
      return `/friends/${cached}`;
    }
  }

  const errors = [];
  for (const candidate of [url, proxyUrl(url)]) {
    try {
      const { buffer, mimeType } = await fetchBuffer(candidate);
      if (!isImage(buffer)) throw new Error("response is not an image");

      const optimized = await optimize(buffer);
      const finalBuffer = optimized ? optimized.buffer : buffer;
      const extension = optimized
        ? optimized.extension
        : extensionFor(url, mimeType);

      for (const name of readdirSync(OUT_DIR)) {
        if (name.startsWith(hash)) unlinkSync(path.join(OUT_DIR, name));
      }
      writeFileSync(path.join(OUT_DIR, `${hash}${extension}`), finalBuffer);
      return `/friends/${hash}${extension}`;
    } catch (error) {
      errors.push(`${candidate}: ${error.message}`);
    }
  }

  throw new Error(errors.join(" | "));
}

async function pool(tasks, limit) {
  let cursor = 0;
  const workers = Array.from({ length: limit }, async () => {
    while (cursor < tasks.length) {
      const task = tasks[cursor++];
      await task();
    }
  });
  await Promise.all(workers);
}

async function main() {
  const urls = new Set();
  for (const name of readdirSync(DATA_DIR)) {
    if (!name.endsWith(".json")) continue;
    const content = JSON.parse(
      readFileSync(path.join(DATA_DIR, name), "utf-8"),
    );
    if (typeof content.img === "string" && /^https?:\/\//.test(content.img)) {
      urls.add(content.img);
    }
  }

  if (!urls.size) return;

  mkdirSync(OUT_DIR, { recursive: true });

  const expected = new Set();
  const tasks = [...urls].map((url) => async () => {
    expected.add(hashOf(url));
    try {
      const localPath = await mirror(url);
      console.log(`[avatars] ${localPath} <- ${url}`);
    } catch (error) {
      console.warn(`[avatars] keep remote, ${url} (${error.message})`);
    }
  });

  await pool(tasks, CONCURRENCY);

  for (const name of readdirSync(OUT_DIR)) {
    const known = [...expected].some((hash) => name.startsWith(hash));
    if (!known) unlinkSync(path.join(OUT_DIR, name));
  }

  const mirrored = readdirSync(OUT_DIR).length;
  console.log(`[avatars] ${mirrored}/${urls.size} mirrored locally`);
}

main().catch((error) => {
  console.warn(`[avatars] mirror step skipped: ${error.message}`);
});
