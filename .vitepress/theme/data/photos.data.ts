import { existsSync, readFileSync, statSync } from "fs";
import path from "path";
import { defineLoader } from "vitepress";
import exifr from "exifr";

export interface Photo {
  fileName: string;
  category: string;
  path: string;
  metadata?: Record<string, string>;
  visibleMetaKeys?: string[];
}

export let data: Photo[];

function formatExposureTime(value: number | undefined): string {
  if (!value || value <= 0) return "";
  if (value >= 1) return `${value}s`;
  const denom = Math.round(1 / value);
  return `1/${denom}s`;
}

function formatAperture(value: number | undefined): string {
  if (!value) return "";
  const fixed = value.toFixed(1);
  return `f/${fixed.replace(/\.0$/, "")}`;
}

function formatModel(make: string | undefined, model: string | undefined): string {
  const cleanMake = make?.trim();
  const cleanModel = model?.trim();
  if (cleanMake && cleanModel) {
    if (cleanModel.toLowerCase().startsWith(cleanMake.toLowerCase())) {
      return cleanModel;
    }
    return `${cleanMake} ${cleanModel}`;
  }
  return cleanModel || cleanMake || "";
}

async function extractMetadata(
  filePath: string,
  keys: string[],
): Promise<{ metadata: Record<string, string>; visibleMetaKeys: string[] }> {
  const metadata: Record<string, string> = {};
  const visibleMetaKeys: string[] = [];

  if (!keys.length) return { metadata, visibleMetaKeys };

  try {
    const buffer = readFileSync(filePath);
    const raw = await exifr.parse(buffer, {
      tiff: true,
      exif: true,
      ifd0: true,
      gps: false,
    });
    if (!raw) return { metadata, visibleMetaKeys };

    for (const key of keys) {
      let value = "";
      switch (key) {
        case "Model":
          value = formatModel(raw.Make, raw.Model);
          break;
        case "ISO":
          if (raw.ISO) value = `ISO ${raw.ISO}`;
          else if (raw.ISOSpeedRatings) value = `ISO ${raw.ISOSpeedRatings}`;
          break;
        case "ExposureTime":
          value = formatExposureTime(raw.ExposureTime);
          break;
        case "ApertureValue":
          if (raw.FNumber) value = formatAperture(raw.FNumber);
          else if (raw.ApertureValue) value = formatAperture(raw.ApertureValue);
          break;
        default:
          if (raw[key] !== undefined && raw[key] !== null) {
            value = String(raw[key]);
          }
      }
      if (value) {
        metadata[key] = value;
        visibleMetaKeys.push(key);
      }
    }
  } catch {
    // 读取或解析失败时静默忽略，保留空 metadata
  }

  return { metadata, visibleMetaKeys };
}

export default defineLoader({
  watch: ["public/data/photos/**/*", "public/data/photos.json"],

async load(files) {
    const { globalConfig } = await import("#config");
    const abbrKeys: string[] = globalConfig?.abbreviated_metadata ?? [];
    const detailKeys: string[] = (globalConfig as any)?.detail_metadata ?? [];
    const metaKeys: string[] = [...new Set([...abbrKeys, ...detailKeys])];

    const result: Photo[] = [];
    const seenPaths = new Set<string>();

    for (const file of files) {
      if (file.endsWith(".json")) continue;

      const stats = statSync(file);
      if (!stats.isFile()) continue;

      const relativePath = path.relative("public/data/photos", file);
      const parts = relativePath.split(path.sep);
      if (parts.length < 2) continue;

      const category = parts[0];
      const fileName = parts[parts.length - 1];

      const photoPath = `/data/photos/${category}/${fileName}`;
      if (seenPaths.has(photoPath)) continue;
      seenPaths.add(photoPath);

      const { metadata, visibleMetaKeys } = await extractMetadata(file, metaKeys);
      result.push({
        fileName,
        category,
        path: photoPath,
        metadata,
        visibleMetaKeys,
      });
    }

    const jsonPath = path.resolve(process.cwd(), "public/data/photos.json");
    if (existsSync(jsonPath)) {
      const raw = readFileSync(jsonPath, "utf-8");
      const jsonData = JSON.parse(raw);

      for (const [category, items] of Object.entries(jsonData)) {
        if (!Array.isArray(items)) continue;
        for (const item of items) {
          const photoPath = item.url;
          if (!photoPath || seenPaths.has(photoPath)) continue;
          seenPaths.add(photoPath);

          result.push({
            fileName: item.name ?? photoPath.split("/").pop() ?? "",
            category,
            path: photoPath,
            metadata: {},
            visibleMetaKeys: [],
          });
        }
      }
    }

    return result;
  },
});
