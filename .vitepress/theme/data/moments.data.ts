import { readFileSync } from "fs";
import path from "path";
import { defineLoader, createMarkdownRenderer } from "vitepress";
import matter from "gray-matter";

export interface Moment {
  fileName: string;
  date: string;
  time: string;
  content: string;
  image?: string;
  negative?: boolean;
}

let data: Moment[];

export { data };

export default defineLoader({
  watch: "public/data/moments/*.md",
  async load(files) {
    const config = (globalThis as any).VITEPRESS_CONFIG;
    const md = await createMarkdownRenderer(
      config.srcDir,
      config.markdown,
      config.site.base,
      config.logger,
    );

    return files
      .map((file) => {
        const fileName = path.basename(file);
        const { data: frontmatter, content } = matter(
          readFileSync(file, "utf-8"),
        );
        return {
          fileName,
          date: frontmatter.date,
          time: frontmatter.time,
          content: md.render(content.trim()),
          image: frontmatter.image,
          negative: frontmatter.negative ?? false,
        };
      })
      .sort(
        (a, b) =>
          Date.parse(`${b.date} ${b.time}`) - Date.parse(`${a.date} ${a.time}`),
      );
  },
});
