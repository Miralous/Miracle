<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  nextTick,
  onMounted,
  onBeforeUnmount,
} from "vue";
import { Icon } from "@iconify/vue";
import PostCard from "./postCard.vue";
import { generateGrid } from "../../utils/generateGrid";
import { columnCount, updateColumns } from "../../utils/dynamicColumns";
import { data as posts } from "../../data/posts.data";
import { globalConfig } from "#config";

const props = defineProps({
  maxItems: {
    type: Number,
    default: 0,
  },
});

// =========================
// URL tag
// =========================
const urlParams = new URLSearchParams(window.location.search);
const selectedTag = ref(urlParams.get("tag"));

// =========================
// 🔥 DeepHide Negative
// =========================
import { useDeepHideNegative } from "../../utils/useDeepHideNegative";

const { showNegative, pendingTimer, hasShownByShortcut, initDeepHideListener } =
  useDeepHideNegative();

// =========================
// articles
// =========================
const articles = ref(
  posts.filter((post) => showNegative.value || !post.negative),
);

const updateArticles = () => {
  let filtered = posts.filter((post) => showNegative.value || !post.negative);

  // tag filter
  if (selectedTag.value) {
    filtered = filtered.filter((post) =>
      post.tags?.includes(selectedTag.value!),
    );
  }

  // limit
  if (props.maxItems > 0) {
    filtered = filtered.slice(0, props.maxItems);
  }

  articles.value = filtered;
};

// =========================
// watchers
// =========================
watch(() => props.maxItems, updateArticles);
watch(selectedTag, () => nextTick(updateArticles));
watch(showNegative, () => nextTick(updateArticles));

// =========================
// lifecycle
// =========================
onMounted(() => {
  const cleanup = initDeepHideListener();

  updateColumns();
  window.addEventListener("resize", updateColumns);

  updateArticles();

  onBeforeUnmount(() => {
    cleanup?.();
    window.removeEventListener("resize", updateColumns);
  });
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", updateColumns);
  window.removeEventListener("keydown", handleKeydown);
});

// =========================
// grid grouping
// =========================
const groupedArticles = computed(() => {
  const grid = generateGrid(
    articles.value,
    undefined,
    (post) => new Date(post.originDate).getFullYear().toString(),
    columnCount.value,
  );

  return grid.sort((a, b) => Number(b.key) - Number(a.key));
});

// =========================
// tags
// =========================
const tags = computed(() => {
  const allTags = new Set<string>();

  posts.forEach((post) => {
    if (!showNegative.value && post.negative) return;

    (post.tags || []).forEach((tag) => {
      allTags.add(tag.trim());
    });
  });

  return Array.from(allTags);
});

const hasNegativePosts = computed(() => {
  return posts.some((post) => post.negative);
});

const tagCounts = computed(() => {
  const counts: Record<string, number> = {};

  posts.forEach((post) => {
    if (!showNegative.value && post.negative) return;

    (post.tags || []).forEach((tag) => {
      const t = tag.trim();
      counts[t] = (counts[t] || 0) + 1;
    });
  });

  return counts;
});

// =========================
// tag click
// =========================
const handleTagClick = (tag: string) => {
  const url = new URL(window.location.href);

  if (selectedTag.value === tag) {
    selectedTag.value = null;
    url.searchParams.delete("tag");
  } else {
    selectedTag.value = tag;
    url.searchParams.set("tag", tag);
  }

  window.history.pushState({}, "", url);
};

// =========================
// 🔥 DeepHide trigger (S key)
// =========================
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

// toggle
const toggleNegative = () => {
  showNegative.value = !showNegative.value;
};

// =========================
// UI logic (same pattern as categories page)
// =========================
const showNegativeButton = computed(() => {
  if (globalConfig.deepHideNegative) {
    return hasNegativePosts.value && hasShownByShortcut.value;
  }
  return hasNegativePosts.value;
});

// sync unlock state
watch(showNegative, (val) => {
  if (globalConfig.deepHideNegative && val) {
    hasShownByShortcut.value = true;
  }
});

// =========================
</script>

<template>
  <div>
    <h1 class="year">{{ globalConfig.lang.tags }}</h1>

    <!-- Tags -->
    <div class="tags">
      <TagChip
        href="/archives"
        :label="globalConfig.lang.categories"
      >
        <template #icon>
          <Icon :icon="globalConfig.icon.category" />
        </template>
      </TagChip>

      <!-- negative button -->
      <TagChip
        v-if="showNegativeButton"
        negative
        @click="toggleNegative"
        :active="showNegative"
        :label="globalConfig.lang.negative"
      >
        <template #icon>
          <Icon :icon="globalConfig.icon.negative" />
        </template>
      </TagChip>

      <!-- tags -->
      <TagChip
        v-for="tag in tags"
        :key="tag"
        @click="handleTagClick(tag)"
        :active="selectedTag === tag"
        :label="tag"
        :count="tagCounts[tag]"
        anchorIcon="#"
        showAnchor
      />
    </div>

    <!-- posts -->
    <div v-for="group in groupedArticles" :key="group.key">
      <h1 class="year">{{ group.key }}</h1>

      <div class="posts-grid">
        <div
          v-for="(col, colIndex) in group.columns"
          :key="colIndex"
          class="column"
        >
          <div v-for="post in col" :key="post.url" class="post-card">
            <PostCard
              :image="post.image"
              :url="post.url"
              :title="post.title"
              :description="post.description"
              :category="post.category"
              :originDate="post.originDate"
              :negative="post.negative"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url("./style.css");
</style>
