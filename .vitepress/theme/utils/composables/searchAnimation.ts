/**
 * 搜索框（VPLocalSearchBox）出现与收起动画。
 *
 * 出现：由 CSS `searchShellIn` / `searchBackdropIn` 在挂载时自动播放。
 * 收起：VitePress 内部使用 `v-if` 卸载组件，无法直接播放离场动画，
 * 这里通过 MutationObserver 捕获被移除的节点，重新挂载并播放离场动画，
 * 动画结束后再将其移除。
 */

const SEARCH_SELECTOR = ".VPLocalSearchBox";
const LEAVING_CLASS = "search-leaving";

let observer: MutationObserver | null = null;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function leaveTimeout() {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--vp-search-animation-time")
    .trim();
  const seconds = Number.parseFloat(raw);
  return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 + 60 : 310;
}

function clearLeaving() {
  document
    .querySelectorAll<HTMLElement>(`.${LEAVING_CLASS}`)
    .forEach((el) => el.remove());
}

function playLeave(node: HTMLElement) {
  clearLeaving();
  node.classList.add(LEAVING_CLASS);
  document.body.appendChild(node);
  window.setTimeout(() => node.remove(), leaveTimeout());
}

export function setupSearchAnimation() {
  if (observer || typeof window === "undefined" || prefersReducedMotion())
    return;

  observer = new MutationObserver((mutations) => {
    for (const { addedNodes, removedNodes } of mutations) {
      for (const node of addedNodes) {
        if (
          node instanceof HTMLElement &&
          node.matches(SEARCH_SELECTOR) &&
          !node.classList.contains(LEAVING_CLASS)
        ) {
          clearLeaving();
        }
      }

      for (const node of removedNodes) {
        if (
          node instanceof HTMLElement &&
          node.matches(SEARCH_SELECTOR) &&
          !node.classList.contains(LEAVING_CLASS)
        ) {
          playLeave(node);
        }
      }
    }
  });

  observer.observe(document.body, { childList: true });
}
