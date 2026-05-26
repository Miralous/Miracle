import { existsSync, readFileSync, statSync } from "fs";
import path from "path";
import { defineLoader } from "vitepress";

export interface Photo {
  fileName: string;
  category: string;
  path: string;
}

export let data: Photo[];

export default defineLoader({
  watch: ["public/data/photos/**/*", "public/data/photos.json"],

  load(files) {
    const result: Photo[] = [];
    const seenPaths = new Set<string>();

    // 处理所有匹配到的文件，但跳过 JSON 文件
    for (const file of files) {
      // 1. 跳过 JSON 文件本身
      if (file.endsWith(".json")) continue;

      const stats = statSync(file);
      if (!stats.isFile()) continue;

      const relativePath = path.relative("public/data/photos", file);
      const parts = relativePath.split(path.sep);
      if (parts.length < 2) continue; // 确保至少是 category/filename 结构

      const category = parts[0];
      const fileName = parts[parts.length - 1]; // 取最后一个部分作为文件名

      const photoPath = `/data/photos/${category}/${fileName}`;
      if (seenPaths.has(photoPath)) continue;
      seenPaths.add(photoPath);

      result.push({ fileName, category, path: photoPath });
    }

    // 读取 photos.json 并合并
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
          });
        }
      }
    }

    return result;
  },
});
