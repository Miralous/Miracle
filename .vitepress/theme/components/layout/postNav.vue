<script setup lang="ts">
import { computed } from "vue";
import { useData } from "vitepress";
import { Icon } from "@iconify/vue";
import { data as posts } from "../../data/posts.data";
import { globalConfig } from "#config";

const { page } = useData();

// 过滤掉 negative 文章（始终过滤）
const visiblePosts = computed(() => posts.filter((p) => !p.negative));

// 当前文章在可见列表中的索引
const currentIndex = computed(() =>
  visiblePosts.value.findIndex((p) => p.filePath === page.value?.filePath),
);

// 上一篇
const prevPost = computed(() => {
  if (currentIndex.value < 0 || currentIndex.value >= visiblePosts.value.length - 1) {
    return null;
  }
  return visiblePosts.value[currentIndex.value + 1];
});

// 下一篇
const nextPost = computed(() => {
  if (currentIndex.value <= 0) {
    return null;
  }
  return visiblePosts.value[currentIndex.value - 1];
});

// 是否显示导航（至少有一方存在）
const showNav = computed(() => prevPost.value || nextPost.value);
</script>

<template>
  <nav v-if="showNav" class="post-nav">
    <div class="nav-links">
      <a v-if="prevPost" :href="prevPost.url" class="nav-link nav-prev">
        <span class="nav-arrow">
          <Icon :icon="globalConfig.icon.prev || 'ph:caret-left-bold'" />
        </span>
        <span class="nav-label">{{ globalConfig.lang.prevArticle }}</span>
        <span class="nav-title">{{ prevPost.title }}</span>
      </a>

      <div v-if="prevPost && nextPost" class="nav-divider"></div>

      <a v-if="nextPost" :href="nextPost.url" class="nav-link nav-next">
        <span class="nav-title">{{ nextPost.title }}</span>
        <span class="nav-label">{{ globalConfig.lang.nextArticle }}</span>
        <span class="nav-arrow">
          <Icon :icon="globalConfig.icon.next || 'ph:caret-right-bold'" />
        </span>
      </a>
    </div>
  </nav>
</template>

<style scoped>
.post-nav {
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid var(--vp-c-divider);
}

.nav-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  padding: 16px 20px;
  border-radius: var(--vp-border-radius-1);
  background-color: var(--vp-c-bg-soft);
  text-decoration: none;
  transition:
    background-color 0.15s,
    border-color 0.15s;
  border: 1px solid transparent;
}

.nav-link:hover {
  background-color: var(--vp-c-bg-mute);
  border-color: var(--vp-c-divider);
}

.nav-prev {
  justify-content: flex-start;
  text-align: left;
}

.nav-next {
  justify-content: flex-end;
  text-align: right;
}

.nav-arrow {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--vp-c-text-2);
  font-size: 20px;
}

.nav-link:hover .nav-arrow {
  color: var(--vp-c-brand-1);
}

.nav-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.nav-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

/* 分隔线（当两者都存在时） */
.nav-divider {
  display: none;
}

/* 当只有一方时，让该链接占满宽度 */
.nav-links:not(:has(.nav-divider)) .nav-link {
  max-width: 100%;
}

@media (max-width: 600px) {
  .nav-links {
    flex-direction: column;
  }

  .nav-link {
    justify-content: flex-start !important;
    text-align: left !important;
  }

  .nav-next {
    flex-direction: row;
  }

  .nav-next .nav-arrow {
    order: 3;
  }

  .nav-next .nav-label {
    order: 1;
  }

  .nav-next .nav-title {
    order: 2;
    text-align: left;
  }
}
</style>
