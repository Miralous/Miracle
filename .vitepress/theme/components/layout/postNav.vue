<script setup lang="ts">
import { computed } from "vue";
import { useData } from "vitepress";
import { data as posts } from "../../data/posts.data";
import { globalConfig } from "#config";
import { useCardHover } from "../../utils/composables/useCardHover";
const { handleMouseMove, handleMouseEnter, handleMouseLeave } = useCardHover();

const { page } = useData();

const currentIndex = computed(() =>
  posts.findIndex((p) => p.filePath === page.value?.filePath),
);

// 仅文章页展示：当前页面必须是 posts 下的文章
const isPost = computed(() => currentIndex.value >= 0);

// 文章按发布时间从新到旧排列：
// 上一篇 = 更新的文章（列表上方），下一篇 = 更旧的文章（列表下方）
const prevPost = computed(() =>
  isPost.value && currentIndex.value > 0 ? posts[currentIndex.value - 1] : null,
);
const nextPost = computed(() =>
  isPost.value && currentIndex.value < posts.length - 1
    ? posts[currentIndex.value + 1]
    : null,
);
</script>

<template>
  <nav v-if="isPost" class="post-nav">
    <a
      v-if="prevPost"
      class="post-nav-card prev"
      :href="prevPost.url"
      @mouseenter="handleMouseEnter"
      @mousemove="handleMouseMove"
      @mouseleave="handleMouseLeave"
    >
      <div class="post-nav-label">
        <Icon :icon="globalConfig.icon.prev" />
        <span>{{ globalConfig.lang.previousPost }}</span>
      </div>
      <div class="post-nav-title">{{ prevPost.title }}</div>
    </a>
    <div v-else class="post-nav-card prev disabled" aria-hidden="true">
      <div class="post-nav-label">
        <Icon :icon="globalConfig.icon.prev" />
        <span>{{ globalConfig.lang.previousPost }}</span>
      </div>
    </div>

    <a
      v-if="nextPost"
      class="post-nav-card next"
      :href="nextPost.url"
      @mouseenter="handleMouseEnter"
      @mousemove="handleMouseMove"
      @mouseleave="handleMouseLeave"
    >
      <div class="post-nav-label">
        <span>{{ globalConfig.lang.nextPost }}</span>
        <Icon :icon="globalConfig.icon.next" />
      </div>
      <div class="post-nav-title">{{ nextPost.title }}</div>
    </a>
    <div v-else class="post-nav-card next disabled" aria-hidden="true">
      <div class="post-nav-label">
        <span>{{ globalConfig.lang.nextPost }}</span>
        <Icon :icon="globalConfig.icon.next" />
      </div>
    </div>
  </nav>
</template>

<style scoped>
.post-nav {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--vp-gap);
  margin: calc(var(--vp-gap) * 2) 0 0;
}

.post-nav-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: var(--vp-border-radius-1);
  background-color: var(--vp-c-bg);
  box-shadow: var(--vp-shadow);
  transition: all var(--vp-transition-time);
}

a.post-nav-card:hover {
  border-color: var(--vp-c-brand-2);
  box-shadow: var(--vp-shadow-brand);
}

.post-nav-card.next {
  text-align: right;
}

.post-nav-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--vp-c-text-3);
  opacity: 0.8;
}

.post-nav-card.next .post-nav-label {
  justify-content: flex-end;
}

.post-nav-title {
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-title);
  font-size: 16px;
  font-weight: 600;
  line-height: 1.5;
  transition: color var(--vp-transition-time);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

a.post-nav-card:hover .post-nav-title {
  color: var(--vp-c-brand-2);
}

.post-nav-card.disabled {
  opacity: 0.4;
  cursor: default;
  pointer-events: none;
}

@media screen and (max-width: 700px) {
  .post-nav {
    grid-template-columns: 1fr;
  }
}
</style>
