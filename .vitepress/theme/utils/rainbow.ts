// Powered by Copilot
import { globalConfig } from "#config";
const r = globalConfig.styles.color.rainbow;
let hueTimer: number | null = null;

const STORAGE_KEY = "persistent-rainbow-hue";

// Helper to safely read localStorage only in the browser
function getSavedHue(): number | null {
  if (import.meta.env.SSR) return null; // ⬅️ skip on server
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      const parsed = Number(saved);
      return Number.isFinite(parsed) ? parsed : null;
    }
  } catch (e) {
    // localStorage might be blocked (e.g., in some iframes)
  }
  return null;
}

function getCurrentHue(): number {
  // 1. Try the saved hue from localStorage
  const saved = getSavedHue();
  if (saved !== null) return saved;

  // 2. If no saved value, read the CSS variable (only in browser)
  if (!import.meta.env.SSR) {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue("--hue")
      .trim();
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }

  // 3. Fallback default
  return 280;
}

function updateHue() {
  // updateHue is only called in the browser (see startHueCycle guard)
  const hue = (getCurrentHue() + r.speed) % 360;
  document.documentElement.style.setProperty("--hue", hue.toString());
  // Save to localStorage (browser only – we’re already guarded)
  try {
    localStorage.setItem(STORAGE_KEY, hue.toString());
  } catch (e) {}
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

// Initialize only on the client side
if (!import.meta.env.SSR) {
  const initialHue = getCurrentHue();
  document.documentElement.style.setProperty("--hue", initialHue.toString());

  if (r.enabled == true) {
    startHueCycle();
  } else {
    stopHueCycle();
  }
}
