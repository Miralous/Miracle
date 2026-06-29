<script setup lang="ts">
import { globalConfig } from "#config";
import { computed, onMounted, onUnmounted, ref } from "vue";
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

const formatToMMDD = (timestamp: number) => {
  const d = new Date(timestamp);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}/${dd}`;
};

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
          <span class="time-text">
            {{ isMounted ? formatToMMDD(item.timestamp) : "..." }}
          </span>
          <div class="timeline-content-box">
            <span class="timeline-text-content">
              {{ item.title }}
            </span>
          </div>
        </component>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

.year-timeline-content {
  display: flex;
  flex-direction: column;
}

.timeline-item {
  display: flex;
  position: relative;
  padding: 0.6rem 0 0.6rem 90px;
  border-radius: var(--vp-border-radius-3);
  text-decoration: none !important;
  color: inherit;
  transition: all var(--vp-transition-time);
  cursor: default;
  font-weight: 400;

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

.timeline-item::after {
  content: "";
  position: absolute;
  left: 65px;
  top: 0;
  bottom: 0;
  width: 1px;
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

.timeline-item::before {
  content: "";
  position: absolute;
  left: 66px;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--line-color);
  transition: all var(--vp-transition-time);
  z-index: 2;
}

.timeline-item:hover::before {
  transform: translate(-50%, -50%) scale(1.3);
}

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
  font-weight: 400;
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
  position: absolute;
  left: 0px;
  top: 50%;
  transform: translateY(-50%);
  width: 45px;
  text-align: right;
  font-size: var(--vp-font-size-meta);
  color: var(--vp-c-text-3);
  opacity: 0.8;
  font-family: var(--vp-font-family-base);
  font-variant-numeric: tabular-nums;
  text-transform: uppercase;
  letter-spacing: var(--vp-font-letter-spacing-meta);
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

.year {
  margin-top: 30px;
  line-height: 1.1;
  font-size: 100px;
  position: relative;
  top: 30px;
  font-weight: 400 !important;
  font-family: var(--vp-font-family-display);
  color: var(--vp-c-gutter);
  opacity: 0.7;
  z-index: -1;
  mask-image: linear-gradient(var(--vp-c-gutter) 20%, transparent);
  text-transform: var(--vp-title-uppercase);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .timeline-item {
    padding: 0.8rem 1rem 0.8rem 28px;
    flex-direction: column;
  }
  .timeline-item::after {
    left: 13px;
  }
  .year-timeline-content .timeline-item:first-child::after {
    top: 1.25rem;
  }
  .year-timeline-content .timeline-item:last-child::after {
    bottom: calc(100% - 1.25rem);
  }
  .timeline-item::before {
    left: 14px;
    top: 1.25rem;
  }
  .time-text {
    position: relative;
    transform: none;
    top: auto;
    left: auto;
    width: auto;
    text-align: left;
    margin-bottom: 0.3rem;
    line-height: 1;
  }
  .timeline-content-box {
    padding-right: 0;
  }
}
</style>
