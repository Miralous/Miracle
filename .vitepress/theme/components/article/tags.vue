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
import PostCard from "../common/postCard.vue";
import { generateGrid } from "../../utils/generateGrid";
import { useCardHover } from "../../utils/composables/useCardHover";
import { columnCount, updateColumns } from "../../utils/composables/dynamicColumns";
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
const multiSelect = globalConfig.features.multiSelect;
const selectedTags = ref<string[]>(
  urlParams
    .getAll("tag")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, multiSelect ? undefined : 1),
);

// =========================
// 🔥 DeepHide Negative
// =========================
import { useDeepHideNegative } from "../../utils/composables/useDeepHideNegative";

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
  if (selectedTags.value.length) {
    filtered = filtered.filter((post) =>
      selectedTags.value.some((t) => post.tags?.includes(t)),
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
watch(selectedTags, () => nextTick(updateArticles));
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
  const selected = selectedTags.value;

  if (multiSelect) {
    selectedTags.value = selected.includes(tag)
      ? selected.filter((t) => t !== tag)
      : [...selected, tag];
  } else {
    selectedTags.value = selected[0] === tag ? [] : [tag];
  }

  const url = new URL(window.location.href);
  url.searchParams.delete("tag");
  selectedTags.value.forEach((t) => url.searchParams.append("tag", t));
  window.history.pushState({}, "", url);
};

// =========================
// 🔥 DeepHide trigger (S key)
// =========================
const handleKeydown = (e: KeyboardEvent) => {
  if (!globalConfig.features.deepHideNegative) return;
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
  if (globalConfig.features.deepHideNegative) {
    return hasNegativePosts.value && hasShownByShortcut.value;
  }
  return hasNegativePosts.value;
});

// sync unlock state
watch(showNegative, (val) => {
  if (globalConfig.features.deepHideNegative && val) {
    hasShownByShortcut.value = true;
  }
});

// =========================
// hover
// =========================
const { handleMouseMove, handleMouseEnter, handleMouseLeave } = useCardHover();
</script>

<template>
  <div>
    <h1 class="year">{{ globalConfig.lang.tags }}</h1>

    <!-- Tags -->
    <div class="tags">
      <TagChip
        href="/archives"
        @mouseenter="handleMouseEnter"
        @mousemove="handleMouseMove"
        @mouseleave="handleMouseLeave"
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
        @mouseenter="handleMouseEnter"
        @mousemove="handleMouseMove"
        @mouseleave="handleMouseLeave"
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
        @mouseenter="handleMouseEnter"
        @mousemove="handleMouseMove"
        @mouseleave="handleMouseLeave"
        :active="selectedTags.includes(tag)"
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
@import url("../common/postCard.css");
</style>
