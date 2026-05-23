export function getSongId(url: string): string {
  if (!url) return "";
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get("id") || "";
  } catch (e) {
    // 如果 url 不是标准 URL，尝试用正则匹配
    const match = url.match(/[?&]id=(\d+)/);
    return match ? match[1] : "";
  }
}
