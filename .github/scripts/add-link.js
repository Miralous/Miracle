import fs from "fs";

const body = process.env.ISSUE_BODY || "";

// 提取新的英文表单字段内容
const title = (body.match(/### Website title\s+([^\n]+)/) || [])[1]?.trim();
const desc =
  (body.match(/### Website description\s+([^\n]+)/) || [])[1]?.trim() || "";
const link = (body.match(/### Website URL\s+([^\n]+)/) || [])[1]?.trim();
const img = (body.match(/### Avatar URL\s+([^\n]+)/) || [])[1]?.trim() || "";

// 检查必填项
if (!title || !link) {
  console.error("Missing required fields (Website title or Website URL)");
  process.exit(1);
}

const dir = "public/data/friends";
fs.mkdirSync(dir, { recursive: true });

// 检查所有已有友链 JSON 文件中是否已存在相同链接
for (const file of fs.readdirSync(dir)) {
  if (!file.endsWith(".json")) continue;
  const existing = JSON.parse(fs.readFileSync(`${dir}/${file}`, "utf8"));
  if (existing.link === link) {
    console.log("Link already exists, skipping");
    process.exit(0);
  }
}

// 用域名作为文件名，例如 android99.com.json
let domain;
try {
  domain = new URL(link).hostname;
} catch {
  console.error("Invalid Website URL");
  process.exit(1);
}

const filePath = `${dir}/${domain}.json`;

const entry = {
  title,
  link,
  desc,
  img,
};

fs.writeFileSync(filePath, JSON.stringify(entry, null, 2), "utf8");
console.log(`Added: ${title} -> ${filePath}`);
