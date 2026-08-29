import fs from "fs";

const issueUser = process.env.ISSUE_USER || "";
const issueBody = process.env.ISSUE_BODY || "";

if (
  !issueBody.includes("- [x]") ||
  !issueBody.includes("I confirm that I want to delete")
) {
  console.error("Confirmation checkbox not checked.");
  process.exit(1);
}

if (!issueUser) {
  console.error("Missing issue user.");
  process.exit(1);
}

const dir = "public/data/friends";
if (!fs.existsSync(dir)) {
  console.error("Friends directory not found.");
  process.exit(1);
}

// ========== 检查配置 ==========
const configPath = "config.ts";

if (!fs.existsSync(configPath)) {
  console.error(`Config file not found: ${configPath}`);
  process.exit(1);
}

const configContent = fs.readFileSync(configPath, "utf8");
const allowMatch = configContent.match(
  /allowWorkflowConfigFriendLink\s*[:=]\s*(true|false)/,
);

if (!allowMatch || allowMatch[1] !== "true") {
  console.error(
    "globalConfig.allowWorkflowConfigFriendLink is not enabled. Aborting.",
  );
  process.exit(1);
}

const files = fs.readdirSync(dir).filter((file) => file.endsWith(".json"));
let matchedFiles = [];

for (const file of files) {
  const filePath = `${dir}/${file}`;
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (data.github && data.github.toLowerCase() === issueUser.toLowerCase()) {
    matchedFiles.push(filePath);
  }
}

if (matchedFiles.length === 0) {
  console.error(`No friend link found for GitHub user: ${issueUser}`);
  process.exit(1);
}

if (matchedFiles.length > 1) {
  console.error(
    `Multiple friend links found for GitHub user: ${issueUser}. Please resolve manually.`,
  );
  process.exit(1);
}

// 删除匹配的文件
fs.unlinkSync(matchedFiles[0]);
console.log(`Deleted friend link file: ${matchedFiles[0]}`);
