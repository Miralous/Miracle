import { globalConfig } from "#config";

const TTL = 60 * 60 * 1000; // 1 hour

// Fetch the netease playlist with a 1h localStorage cache (same pattern as Projects.vue)
export async function getPlaylist(): Promise<any[]> {
  const musicList = globalConfig.netease.musicList;
  const cacheKey = `music_playlist_${musicList}`;
  const cacheTimeKey = cacheKey + "_time";

  let cached: string | null = null;
  let cachedTime: string | null = null;
  try {
    cached = localStorage.getItem(cacheKey);
    cachedTime = localStorage.getItem(cacheTimeKey);
  } catch {}

  // fresh cache
  if (cached && cachedTime && Date.now() - Number(cachedTime) < TTL) {
    return JSON.parse(cached);
  }

  try {
    const res = await fetch(
      `${globalConfig.netease.metingApi}/?type=playlist&id=${musicList}`,
    );
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("Invalid playlist data");
    try {
      localStorage.setItem(cacheKey, JSON.stringify(data));
      localStorage.setItem(cacheTimeKey, Date.now().toString());
    } catch {}
    return data;
  } catch (e) {
    // stale cache fallback
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }
    throw e;
  }
}
