// Powered by Copilot
import { globalConfig } from "#config";
const r = globalConfig.styles.color.rainbow;
let hueTimer: number | null = null;

// 定义本地存储的 key
const STORAGE_KEY = "persistent-rainbow-hue";

function getCurrentHue() {
  // 1. 优先从 localStorage 中读取历史进度
  const savedHue = localStorage.getItem(STORAGE_KEY);
  if (savedHue !== null) {
    const parsedSaved = Number(savedHue);
    if (Number.isFinite(parsedSaved)) return parsedSaved;
  }

  // 2. 如果没有缓存，再读取 CSS 变量或使用默认值
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue("--hue")
    .trim();
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 280;
}

function updateHue() {
  const hue = (getCurrentHue() + r.speed) % 360;
  // 更新 DOM 上的 CSS 变量
  document.documentElement.style.setProperty("--hue", hue.toString());
  // 3. 同步保存到 localStorage
  localStorage.setItem(STORAGE_KEY, hue.toString());
}

function startHueCycle() {
  if (hueTimer !== null) return;
  updateHue();
  hueTimer = window.setInterval(updateHue, 100);
}

function stopHueCycle() {
  if (hueTimer === null) return;
  window.clearInterval(hueTimer);
  hueTimer = null;
}

// 4. 初始化：页面加载时立即应用缓存或默认的 hue，防止动画开始前出现色彩闪烁
const initialHue = getCurrentHue();
document.documentElement.style.setProperty("--hue", initialHue.toString());

if (r.enabled == true) {
  startHueCycle();
} else {
  stopHueCycle();
}
