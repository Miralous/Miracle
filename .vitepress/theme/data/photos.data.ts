import { existsSync, mkdirSync, readFileSync, statSync } from "fs";
import path from "path";
import { defineLoader } from "vitepress";
import exifr from "exifr";
import { globalConfig } from "#config";

export interface Photo {
  fileName: string;
  category: string;
  path: string;
  metadata?: Record<string, string>;
  visibleMetaKeys?: string[];
}

export let data: Photo[];

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".tiff", ".tif", ".gif"]);

function formatExposureTime(value: number | undefined): string {
  if (!value || value <= 0) return "";
  if (value >= 1) return `${value}s`;
  const denom = Math.round(1 / value);
  return `1/${denom}s`;
}

async function formatAddress(lat: number | undefined, lon: number | undefined): Promise<string> {
  if (!lat || !lon || !globalConfig.EXIF_GPS) return "";
  try {
    console.log(`Fetching address for lat=${lat}, lon=${lon}`);
    const response = await fetch(`https://latlonconvaddr.emnasop.cn/?lat=${lat}&lon=${lon}`);
    //源api为https://cn.apihz.cn/api/other/jwjuhe2.php?id={id}&key={key}&lon={纬度}&lat={经度}
    //也可替换为nominatim
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    if(data.code !== 200) {
      throw new Error(`API error: ${data.code}`);
    }
    if(!data.nation || !data.province || !data.county) {//不包括data.city，可能是直辖市。为直辖市时市名在province字段中，city字段为空
      throw new Error(`Incomplete address data: ${JSON.stringify(data)}`);
    }
    const address = `${data.nation}${data.province}${data.city}${data.county}`;
    return address;
  } catch {
    return "";
  }
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
      gps: true,
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
        case "GPS":
          if (raw.latitude && raw.longitude) {
            const lat = raw.latitude;
            const lon = raw.longitude;
            value = await formatAddress(lat, lon);
          }
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

    const convertEnabled = globalConfig?.convert_photos === true;
    const convertFormat = globalConfig?.convert_photos_format ?? "webp";
    const convertQuality = globalConfig?.convert_photos_quality ?? 80;
    const targetExt = `.${convertFormat}`;
    const outputDir = path.resolve(process.cwd(), "public/data/convertphotos");
    if (convertEnabled) {
      mkdirSync(outputDir, { recursive: true });
    }

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
      let fileName = parts[parts.length - 1];
      let photoPath = `/data/photos/${category}/${fileName}`;

      if (convertEnabled) {
        const sourceExt = path.extname(file).toLowerCase();
        if (IMAGE_EXTENSIONS.has(sourceExt)) {
          const baseName = path.parse(file).name;
          const convertedFileName = `${baseName}${targetExt}`;
          const convertedFilePath = path.join(outputDir, convertedFileName);

          if (!existsSync(convertedFilePath)) {
            try {
              const sharp = (await import("sharp")).default;
              console.log(`Converting ${fileName} to ${convertFormat}...`);
              await sharp(file)
                .withMetadata()
                .toFormat(convertFormat as "avif" | "webp", {
                  quality: convertQuality,
                })
                .toFile(convertedFilePath);
              console.log(`  -> ${convertedFileName}`);
            } catch (err) {
              console.error(`Failed to convert ${fileName}:`, err);
            }
          }

          if (existsSync(convertedFilePath)) {
            photoPath = `/data/convertphotos/${convertedFileName}`;
            fileName = convertedFileName;
          }
        }
      }
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
