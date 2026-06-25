<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, watch } from "vue";
import { globalConfig } from "#config";
import { generateGrid } from "../../utils/generateGrid";
import { columnCount, updateColumns } from "../../utils/dynamicColumns";
import PostCard from "../article/postCard.vue";

// 引入同款负面状态 Hook
import { useDeepHideNegative } from "../../utils/useDeepHideNegative";

const props = defineProps<{ maxItems?: number }>();

// negative 状态
const { showNegative, pendingTimer, hasShownByShortcut, initDeepHideListener } =
  useDeepHideNegative();

// 🔥 键盘监听：S 延迟 1s 解锁
const handleKeydown = (e: KeyboardEvent) => {
  if (!globalConfig.deepHideNegative) return;

  if (e.key.toLowerCase() !== "s") return;

  if (hasShownByShortcut.value) return;
  if (pendingTimer.value) return;

  pendingTimer.value = window.setTimeout(() => {
    showNegative.value = true;
    hasShownByShortcut.value = true;
    pendingTimer.value = null;
  }, 1000);
};

// 🛑 新增 keyup 监听：如果用户在 1s 内松开了 S 键，则取消解锁，防止误触
const handleKeyup = (e: KeyboardEvent) => {
  if (e.key.toLowerCase() === "s" && pendingTimer.value) {
    clearTimeout(pendingTimer.value);
    pendingTimer.value = null;
  }
};

// 同步状态
watch(showNegative, (val) => {
  if (globalConfig.deepHideNegative && val) {
    hasShownByShortcut.value = true;
  }
});

let cleanup: (() => void) | undefined;

onMounted(() => {
  cleanup = initDeepHideListener();
  updateColumns();
  window.addEventListener("resize", updateColumns);
  window.addEventListener("keydown", handleKeydown);
  window.addEventListener("keyup", handleKeyup); // ✅ 绑定 keyup 移除定时器
});

onBeforeUnmount(() => {
  cleanup?.();
  window.removeEventListener("resize", updateColumns);
  window.removeEventListener("keydown", handleKeydown);
  window.removeEventListener("keyup", handleKeyup); // ✅ 移除 keyup 监听
});

// 🔹 瀑布流数据，按年份分组，动态列数
const groupedMoments = computed(() => {
  const validMoments = globalConfig.moments.filter(
    (moment: any) =>
      !globalConfig.deepHideNegative || showNegative.value || !moment.negative,
  );

  const grid = generateGrid(
    validMoments,
    props.maxItems,
    (item: any) =>
      item.date ? new Date(item.date).getFullYear().toString() : "all",
    columnCount.value,
  );

  return grid.sort((a, b) => {
    if (a.key === "all") return 1;
    if (b.key === "all") return -1;
    return Number(b.key) - Number(a.key);
  });
});
</script>

<template>
  <div v-for="group in groupedMoments" :key="group.key">
    <h1 class="year">{{ group.key }}</h1>
    <div class="posts-grid">
      <div
        v-for="(col, colIndex) in group.columns"
        :key="colIndex"
        class="column"
      >
        <div v-for="moment in col" :key="moment.fileName">
          <!-- ✅ 关键改动：将 :key 移到了正确的循环外层，并向子组件传递了 :negative="moment.negative" -->
          <PostCard
            :description="moment.content"
            :originDate="moment.date"
            :image="moment.image"
            :negative="moment.negative"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.posts-grid {
  display: flex;
  gap: var(--vp-gap);
  margin-bottom: 24px;
}
.column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--vp-gap);
}
.momentImage {
  width: 100%;
  max-height: 180px;
  object-fit: cover;
  margin-bottom: 1rem;
  border-radius: var(--vp-border-radius-3);
}
.post-card {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 1.25rem 0;
  border-bottom: 1px solid var(--vp-c-divider);
  transition: opacity var(--vp-transition-time);
}
.post-card:hover {
  opacity: 0.7;
}
.textPlace {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.meta {
  margin-top: auto;
  font-size: var(--vp-font-size-meta);
  font-weight: 400;
  color: var(--vp-c-text-3);
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: var(--vp-font-letter-spacing-meta);
}
.content {
  color: var(--vp-c-text-1);
  font-weight: 400;
  font-size: 1rem;
  line-height: 1.7;
  margin-bottom: 6px;
  transition: all var(--vp-transition-time);
}
.diary:hover .content {
  color: var(--vp-c-brand-1);
}
.year {
  margin-top: 30px;
  line-height: 1.1;
  font-size: 100px;
  position: relative;
  top: 30px;
  font-weight: 400;
  font-family: var(--vp-font-family-display);
  color: var(--vp-c-gutter);
  opacity: 0.7;
  z-index: -1;
  mask-image: linear-gradient(var(--vp-c-gutter) 20%, transparent);
  text-transform: uppercase;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
span.at {
  opacity: 0.5;
}
</style>
