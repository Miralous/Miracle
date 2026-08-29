import fs from "fs";

const body = process.env.ISSUE_BODY || "";

// ========== 检查配置 ==========
const configPath = "config.ts";

if (!fs.existsSync(configPath)) {
  console.error(`Config file not found: ${configPath}`);
  process.exit(1);
}

const configContent = fs.readFileSync(configPath, "utf8");
const allowMatch = configContent.match(
  /allowWorkflowAddFriendLink\s*[:=]\s*(true|false)/,
);

if (!allowMatch || allowMatch[1] !== "true") {
  console.error(
    "globalConfig.allowWorkflowAddFriendLink is not enabled. Aborting.",
  );
  process.exit(1);
}

// ========== 提取表单字段 ==========
const title = (body.match(/### Website title\s+([^\n]+)/) || [])[1]?.trim();
const desc =
  (body.match(/### Website description\s+([^\n]+)/) || [])[1]?.trim() || "";
const link = (body.match(/### Website URL\s+([^\n]+)/) || [])[1]?.trim();
const img = (body.match(/### Avatar URL\s+([^\n]+)/) || [])[1]?.trim() || "";
const github =
  (body.match(/### GitHub Username\s+([^\n]+)/) || [])[1]?.trim() || "";

// 检查必填项
if (!title || !link || !github) {
  console.error("Missing required fields.");
  process.exit(1);
}

// ========== 写入友链 JSON ==========
const dir = "public/data/friends";
fs.mkdirSync(dir, { recursive: true });

// 检查是否已存在相同链接
for (const file of fs.readdirSync(dir)) {
  if (!file.endsWith(".json")) continue;
  const existing = JSON.parse(fs.readFileSync(`${dir}/${file}`, "utf8"));
  if (existing.link === link) {
    console.log("Link already exists, skipping");
    process.exit(0);
  }
}

// 使用域名作为文件名
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
  github,
};

fs.writeFileSync(filePath, JSON.stringify(entry, null, 2), "utf8");
console.log(`Added ${title} to ${filePath}`);
