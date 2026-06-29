<template>
  <a
    v-if="lastMoment"
    class="last-moment"
    href="/moments"
  >
    <div class="content">
      <span class="text">
        {{ lastMoment && lastMoment.content ? lastMoment.content : "" }}
      </span>
      <span class="datetime">
        {{
          lastMoment && lastMoment.date
            ? formatRelativeDate(lastMoment.date)
            : ""
        }}
      </span>
    </div>
  </a>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { formatRelativeDate } from "../../utils/formatRelativeDate";
import { globalConfig } from "#config";
import { useDeepHideNegative } from "../../utils/useDeepHideNegative";

interface Moment {
  date: string;
  time: string;
  content: string;
  negative?: boolean;
}

const { moments } = globalConfig;
const { showNegative } = useDeepHideNegative();

// 动态计算最新的 moment
const lastMoment = computed<Moment | null>(() => {
  // 过滤出应当显示的 moments
  const validMoments = (moments as Moment[]).filter(
    (m) => !globalConfig.deepHideNegative || showNegative.value || !m.negative,
  );

  // 返回过滤后的第一个（即最新的一条），如果没有则返回 null
  return validMoments[0] || null;
});
</script>

<style scoped>
.last-moment {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 1.25rem 0;
  margin-bottom: var(--vp-gap);
  border-bottom: 1px solid var(--vp-c-divider);
  text-decoration: none;
  overflow: hidden;
  white-space: nowrap;
  transition: opacity var(--vp-transition-time);
}

.last-moment:hover {
  opacity: 0.7;
}
.last-moment:hover .text {
  color: var(--vp-c-brand-2);
}

.content {
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 100%;
  overflow: hidden;
  justify-content: flex-start;
}

.text {
  font-weight: 400;
  font-family: var(--vp-font-family-display);
  color: var(--vp-c-text-1);
  letter-spacing: 0.02em;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  transition: color var(--vp-transition-time);
}

.datetime {
  flex-shrink: 0;
  font-size: var(--vp-font-size-meta);
  color: var(--vp-c-text-3);
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: var(--vp-font-letter-spacing-meta);
}
</style>
