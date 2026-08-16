import { h, nextTick } from "vue";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { inBrowser } from "vitepress";
import { handleEasterEgg } from "./utils/composables/easterEgg";
import { enhanceAppWithTabs } from "vitepress-plugin-tabs/client";

import "./styles/style.css";
import "./styles/color.css";
import "./styles/monochrome.css";
import "./utils/rainbow";

import beforeDocs from "./components/layout/beforeDocs.vue";
import Comments from "./components/layout/afterDocs.vue";

import { registerComponents } from "./registerComponents";
import { applyCssVars } from "./applyCssVars";
import { globalConfig } from "#config";

let didMount = false;

// 页面切换过渡：重新触发 fadeUp，与主页文字 banner 入场一致。
// 主页自身已有错落 banner 动画，跳过容器动画避免叠加。
async function applyPageTransition(href: string) {
  if (new URL(href, location.origin).pathname === "/") return;
  await nextTick();
  const content = document.querySelector("#VPContent");
  if (!content) return;
  content.classList.remove("page-enter");
  // 强制回流，确保动画在每次路由切换时都能重新触发
  void content.offsetWidth;
  content.classList.add("page-enter");
}
/* =========================
 * Theme Export
 * ========================= */

export default {
  extends: DefaultTheme,

  Layout: () =>
    h(DefaultTheme.Layout, null, {
      "doc-before": () => h(beforeDocs),
      "doc-after": () => h("div", null, [h(Comments)]),
    }),

  enhanceApp({ app, router }) {
    enhanceAppWithTabs(app);
    registerComponents(app);
    if (!inBrowser) return;

    // 首次加载（整页刷新）在 mount 前不会触发 onAfterRouteChange，
    // 且 #VPContent 尚未渲染。在根组件挂载完成后补一次入场动画。
    app.mixin({
      mounted() {
        if (this.$root !== this || didMount) return;
        didMount = true;
        applyPageTransition(location.href);
      },
    });

    const init = async () => {
      applyCssVars();
    };

    // 首次加载
    init();

    // 路由切换
    router.onAfterRouteChange = async (href) => {
      init();
      await applyPageTransition(href);
    };

    // 彩蛋监听
    document.addEventListener("keydown", ({ code }) => handleEasterEgg(code));
  },
} satisfies Theme;
