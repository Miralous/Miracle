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
  globalIndex: number;
}

interface YearGroup {
  year: string;
  items: CombinedTimelineItem[];
}

const isMounted = ref(false);

onMounted(() => {
  isMounted.value = true;
  const cleanup = initDeepHideListener();
  onUnmounted(() => {
    if (cleanup) cleanup();
  });
});

const sortedFlatTimeline = computed(() => {
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

const groupedTimeline = computed<YearGroup[]>(() => {
  const groups: Record<string, CombinedTimelineItem[]> = {};

  sortedFlatTimeline.value.forEach((item, index) => {
    const year = new Date(item.timestamp).getFullYear().toString();

    if (!groups[year]) {
      groups[year] = [];
    }

    groups[year].push({
      ...item,
      globalIndex: index,
    });
  });

  return Object.keys(groups)
    .sort((a, b) => Number(b) - Number(a))
    .map((year) => ({
      year,
      items: groups[year],
    }));
});

const getLineColorVar = (item?: CombinedTimelineItem) => {
  if (!item) return "";
  return `var(--line-color-${item.type}${item.negative ? "-negative" : ""})`;
};
</script>

<template>
  <div class="timeline-wrapper">
    <div v-for="group in groupedTimeline" :key="group.year" class="year-group">
      <h1 class="year">{{ group.year }}</h1>

      <div class="year-timeline-content">
        <component
          :is="item.type === 'post' ? 'a' : 'div'"
          v-for="item in group.items"
          :key="item.id"
          :href="item.type === 'post' ? item.url : undefined"
          class="timeline-item"
          :class="[item.type, { 'is-negative': item.negative }]"
          :style="{
            '--prev-color':
              getLineColorVar(sortedFlatTimeline[item.globalIndex - 1]) ||
              getLineColorVar(item),
            '--next-color':
              getLineColorVar(sortedFlatTimeline[item.globalIndex + 1]) ||
              getLineColorVar(item),
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
    </div>
  </div>
</template>

<style scoped>
* {
  font-weight: 500 !important;
}
.timeline-wrapper {
  display: flex;
  flex-direction: column;
  border-left: none;
}

.year-group {
  position: relative;
  display: flex;
  flex-direction: column;
}

/* 纯净的内容包裹区 */
.year-timeline-content {
  display: flex;
  flex-direction: column;
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

  --line-color-post: var(--vp-c-brand-1);
  --line-color-post-negative: var(--vp-c-red-1);
  --line-color-moment: var(--vp-c-gray-1);
  --line-color-moment-negative: var(--vp-c-yellow-1);

  --line-color: var(--line-color-post);
}
.dark .timeline-item {
  --line-color-moment: var(--vp-c-text-3);
}

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

/* ⚡ 轴线基础样式 */
.timeline-item::after {
  content: "";
  position: absolute;
  left: 20px;
  top: 0;
  bottom: 0;
  width: 2px;
  opacity: 0.5;
  z-index: 1;

  --boundary-prev: color-mix(in srgb, var(--prev-color), var(--line-color));
  --boundary-next: color-mix(in srgb, var(--line-color), var(--next-color));

  background: linear-gradient(
    to bottom,
    var(--boundary-prev) 0%,
    var(--line-color) 50%,
    var(--boundary-next) 100%
  );
}

/* ⚡ 黄金修复点：在纯净容器下，使用 :first-child 和 :last-child 完美收尾
   每一年的第一条和最后一项会绝对精准地缩回圆点心，中途绝不断开！
*/
.year-timeline-content .timeline-item:first-child::after {
  top: 50%;
  background: linear-gradient(
    to bottom,
    var(--line-color) 0%,
    var(--boundary-next) 100%
  );
}
.year-timeline-content .timeline-item:last-child::after {
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
  z-index: 2;
}

.timeline-item:hover::before {
  transform: translate(-50%, -50%) scale(1.3);
}

/* ==========================================================================
    布局结构
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

/* 年份样式保持原样 */
.year {
  margin-top: 30px;
  line-height: 110px;
  font-size: 100px;
  position: relative;
  top: 30px;
  font-weight: bold !important;
  color: var(--vp-c-gutter);
  opacity: 0.7;
  z-index: -1;
  mask-image: linear-gradient(var(--vp-c-gutter) 20%, transparent);
  text-transform: var(--vp-title-uppercase);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
