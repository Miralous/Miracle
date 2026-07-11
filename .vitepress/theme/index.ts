import { h } from "vue";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { inBrowser } from "vitepress";
import { handleEasterEgg } from "./utils/easterEgg";
import { enhanceAppWithTabs } from "vitepress-plugin-tabs/client";

import "./styles/style.css";
import "./styles/color.css";
import "./utils/rainbow";

import beforeDocs from "./components/layout/beforeDocs.vue";
import PostNav from "./components/layout/postNav.vue";
import Comments from "./components/layout/afterDocs.vue";

import { registerComponents } from "./configs/registerComponents";
import { applyCssVars } from "./configs/applyCssVars";
import { globalConfig } from "#config";
/* =========================
 * Theme Export
 * ========================= */

export default {
  extends: DefaultTheme,

  Layout: () =>
    h(DefaultTheme.Layout, null, {
      "doc-before": () => h(beforeDocs),
      "doc-after": () => h('div', null, [h(PostNav), h(Comments)]),
    }),

  enhanceApp({ app, router }) {
    enhanceAppWithTabs(app);
    registerComponents(app);
    if (!inBrowser) return;

    const init = async () => {
      if (globalConfig.styles.color.preset === "catppuccin") {
        await import("./styles/theme/ctp.css");
      }
      applyCssVars();
    };

    // 首次加载
    init();

    // 路由切换
    router.onAfterRouteChange = init;

    // 彩蛋监听
    document.addEventListener("keydown", ({ code }) => handleEasterEgg(code));
  },
} satisfies Theme;
