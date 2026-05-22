<script setup lang="ts">
import { globalConfig } from "#config";
import { computed, onMounted, onUnmounted, ref } from "vue";
import { formatRelativeDate } from "../../utils/formatRelativeDate";
import { useDeepHideNegative } from "../../utils/useDeepHideNegative";
import { data as postsData } from "#theme/data/posts.data";

const momentsData = globalConfig.moments;

const { showNegative, initDeepHideListener } = useDeepHideNegative();

interface CombinedTimelineItem {
  id: string;
  type: "post" | "moment";
  title: string;
  dateString: string;
  timestamp: number;
  url?: string;
  negative?: boolean;
}

const isMounted = ref(false);

onMounted(() => {
  isMounted.value = true;
  const cleanup = initDeepHideListener();
  onUnmounted(() => {
    if (cleanup) cleanup();
  });
});

const sortedTimeline = computed<CombinedTimelineItem[]>(() => {
  const normalizedPosts = postsData.map((post) => ({
    id: post.url,
    type: "post" as const,
    title: post.title,
    dateString: post.originDate,
    timestamp: Date.parse(post.originDate),
    url: post.url,
    negative: post.negative,
  }));

  const normalizedMoments = momentsData.map((moment) => {
    const fullDateStr = moment.time
      ? `${moment.date} ${moment.time}`
      : moment.date;
    return {
      id: moment.fileName,
      type: "moment" as const,
      title: moment.content,
      dateString: fullDateStr,
      timestamp: Date.parse(fullDateStr),
      negative: moment.negative,
    };
  });

  const combined = [...normalizedPosts, ...normalizedMoments];

  const filtered = combined.filter((item) => {
    if (globalConfig.deepHideNegative && !showNegative.value) {
      return !item.negative;
    }
    return true;
  });

  return filtered.sort((a, b) => b.timestamp - a.timestamp);
});

// 辅助函数：精准映射出对应节点的 CSS 变量名
const getLineColorVar = (item?: CombinedTimelineItem) => {
  if (!item) return "";
  return `var(--line-color-${item.type}${item.negative ? "-negative" : ""})`;
};
</script>

<template>
  <div class="timeline-wrapper">
    <component
      :is="item.type === 'post' ? 'a' : 'div'"
      v-for="(item, index) in sortedTimeline"
      :key="item.id"
      :href="item.type === 'post' ? item.url : undefined"
      class="timeline-item"
      :class="[item.type, { 'is-negative': item.negative }]"
      :style="{
        '--prev-color':
          getLineColorVar(sortedTimeline[index - 1]) || getLineColorVar(item),
        '--next-color':
          getLineColorVar(sortedTimeline[index + 1]) || getLineColorVar(item),
      }"
    >
      <div class="timeline-content-box">
        <span class="timeline-text-content">
          {{ item.title }}
        </span>
        <span class="time-text">
          {{ isMounted ? formatRelativeDate(item.dateString) : "..." }}
        </span>
      </div>
    </component>
  </div>
</template>

<style scoped>
* {
  font-weight: 500 !important;
}
.timeline-wrapper {
  display: flex;
  flex-direction: column;
  margin: 2rem 0;
  border-left: none;
}

.timeline-item {
  display: flex;
  position: relative;
  padding: 0.6rem 0 0.6rem 45px;
  border-radius: var(--vp-border-radius-3);
  text-decoration: none !important;
  color: inherit;
  transition: all var(--vp-transition-time);
  cursor: default;

  /* 基础颜色池 */
  --line-color-post: var(--vp-c-brand-1);
  --line-color-post-negative: var(--vp-c-red-1);
  --line-color-moment: var(--vp-c-gray-1);
  --line-color-moment-negative: var(--vp-c-yellow-1);

  /* 默认当前节点颜色 */
  --line-color: var(--line-color-post);
}
.dark .timeline-item {
  --line-color-moment: var(--vp-c-text-3);
}

/* 动态覆盖当前节点的纯色变量 */
.timeline-item.moment {
  --line-color: var(--line-color-moment);
}
.timeline-item.post.is-negative {
  --line-color: var(--line-color-post-negative);
}
.timeline-item.moment.is-negative {
  --line-color: var(--line-color-moment-negative);
}

.timeline-item.post {
  cursor: pointer;
}

.timeline-item:hover {
  background-color: var(--vp-c-bg-soft);
}
.timeline-item.post:hover {
  background-color: var(--vp-c-brand-soft);
}

.timeline-item.is-negative:hover {
  background-color: var(--vp-c-yellow-soft) !important;
}
.timeline-item.post.is-negative:hover {
  background-color: var(--vp-c-red-soft) !important;
}

/* ⚡ 轴线（通过满高 + color-mix 边界色彩融合，完美收官） */
.timeline-item::after {
  content: "";
  position: absolute;
  left: 20px;
  top: 0; /* 🚀 顶天 */
  bottom: 0; /* 🚀 立地，保证绝对不会出现任何物理断层 */
  width: 2px;
  opacity: 0.5;
  z-index: 1;

  /* 🎨 核心色彩计算：
     利用 color-mix 动态算出跟上一个节点、下一个节点在碰撞边界处的“完美过渡中间色”
  */
  --boundary-prev: color-mix(in srgb, var(--prev-color), var(--line-color));
  --boundary-next: color-mix(in srgb, var(--line-color), var(--next-color));

  /* ✨ 完美的双向流动渐变：
     - [0% 到 50%]：由边界交汇色平滑流入自己的小圆点。
     - [50% 到 100%]：由小圆点平滑流出到下一个边界交汇色。
     由于 A 卡片的 boundary-next 变量在数学上等同于 B 卡片的 boundary-prev，两片碰头处的颜色像素级一致！
  */
  background: linear-gradient(
    to bottom,
    var(--boundary-prev) 0%,
    var(--line-color) 50%,
    var(--boundary-next) 100%
  );
}

/* ⚡ 首尾边界裁剪（防止第一项向上冒尖，最后一项向下漏尾巴） */
.timeline-wrapper .timeline-item:first-child::after {
  top: 50%;
  background: linear-gradient(
    to bottom,
    var(--line-color) 0%,
    var(--boundary-next) 100%
  );
}
.timeline-wrapper .timeline-item:last-child::after {
  bottom: 50%;
  background: linear-gradient(
    to bottom,
    var(--boundary-prev) 0%,
    var(--line-color) 100%
  );
}

/* ⚡ 小圆点 */
.timeline-item::before {
  content: "";
  position: absolute;
  left: 21px;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--line-color);
  transition: all var(--vp-transition-time);
  z-index: 2; /* 圆点稳稳压在轴线交汇处上方 */
}

.timeline-item:hover::before {
  transform: translate(-50%, -50%) scale(1.3);
}

/* ==========================================================================
   ⚡ 布局结构
   ========================================================================== */
.timeline-content-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;
  gap: 1.5rem;
  min-width: 0;
  padding-right: 1rem;
}

.timeline-text-content {
  color: var(--vp-c-text-1);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
  transition: all var(--vp-transition-time);
}

.timeline-item.post:hover .timeline-text-content {
  color: var(--vp-c-brand-1);
}

.timeline-item.is-negative.post:hover .timeline-text-content {
  color: var(--vp-c-red-1) !important;
}

.timeline-item.is-negative.moment:hover .timeline-text-content {
  color: var(--vp-c-yellow-1) !important;
}

.time-text {
  font-size: 0.875rem;
  color: var(--vp-c-text-3);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  flex-shrink: 0;
}

.timeline-item.is-negative .timeline-text-content {
  color: var(--vp-c-text-3) !important;
  opacity: 0.5;
}
.timeline-item.is-negative:hover .timeline-text-content {
  opacity: 0.8;
}
</style>
