// ../../utils/miracleSrc.ts
import { globalConfig } from "#config";

export interface Friend {
  title: string;
  link: string;
  desc?: string;
  id: string;
  sourceId: string;
  img: string;
}

export interface LoaderResult {
  friends: Friend[];
  trueNum: boolean;
}

interface RemoteSiteItem {
  url: string;
  id: string;
}

// 💡 1. 关键修改：改用 /raw 路径，让代理直接返回原汁原味的数据，而不是包装后的 JSON
const CORS_PROXY = "https://api.allorigins.win/raw?url=";

export async function getMiracleData(): Promise<LoaderResult> {
  const src = globalConfig.miracle.src;
  let trueNum = false;

  try {
    // 💡 2. 关键修改：使用 encodeURIComponent 编码目标参数，防止 URL 内部的冒号斜杠破坏代理结构
    const listProxyUrl = `${CORS_PROXY}${encodeURIComponent(src)}`;
    const response = await fetch(listProxyUrl, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(
        `Failed to fetch site list, status code: ${response.status}`,
      );
    }

    // 此时拿到的是纯净的数组数据
    const siteItems: RemoteSiteItem[] = await response.json();

    const configUrlClean = globalConfig.url?.endsWith("/")
      ? globalConfig.url.slice(0, -1)
      : globalConfig.url;

    const matchedItem = siteItems.find((item) => {
      const itemUrlClean = item?.url?.endsWith("/")
        ? item.url.slice(0, -1)
        : item?.url;
      return itemUrlClean === configUrlClean;
    });

    if (matchedItem) {
      trueNum = String(matchedItem.id) === String(globalConfig.miracle.id);
    }

    // 2. 核心优化：通过 map 返回 promise 数组，包裹 CORS 代理
    const fetchPromises = siteItems.map(async (item) => {
      const baseUrl = item?.url;
      const currentSourceId = item?.id;
      if (!baseUrl) return null;

      const cleanBaseUrl = baseUrl.endsWith("/")
        ? baseUrl.slice(0, -1)
        : baseUrl;

      // 目标数据的真实 URL
      const targetUrl = `${cleanBaseUrl}/data.json`;

      // 💡 3. 关键修改：同样对 data.json 的真实地址进行严格编码
      const proxyUrl = `${CORS_PROXY}${encodeURIComponent(targetUrl)}`;

      try {
        const dataResponse = await fetch(proxyUrl, { cache: "no-store" });
        if (!dataResponse.ok) return null;

        // 此时拿到的是纯净的站点 data.json 对象
        const siteData = await dataResponse.json();

        return {
          title: siteData.title || "",
          desc: siteData.description || "",
          link: cleanBaseUrl,
          img: siteData.favicon || "",
          id: siteData.id,
          sourceId: currentSourceId || "",
        };
      } catch (err: any) {
        console.error(
          `[Client] Error fetching via proxy ${proxyUrl}:`,
          err.message,
        );
        return null;
      }
    });

    // 3. 等待全部响应完毕，并过滤掉请求失败的 null 节点
    const resolvedResults = await Promise.all(fetchPromises);
    const validFriends = resolvedResults.filter(
      (item): item is Friend => item !== null,
    );

    return {
      friends: validFriends,
      trueNum: trueNum,
    };
  } catch (error: any) {
    console.error("[Client] Global error caught:", error.message);
    return {
      friends: [],
      trueNum: false,
    };
  }
}
