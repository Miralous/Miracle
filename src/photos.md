---
layout: home
footer: false
title: Photos
---

<script setup lang="ts">
import { ref, onMounted, computed, onBeforeUnmount } from "vue";
import { generateGrid } from "#theme/utils/generateGrid";
import {globalConfig} from "#config"
import { columnCount, updateColumns } from "#theme/utils/dynamicColumns";
import { useCardHover } from "#theme/utils/useCardHover";
import { data as photos } from "#theme/data/photos.data";

const { handleMouseMove, handleMouseEnter, handleMouseLeave } = useCardHover();

const multiSelect = globalConfig.features.multiSelect;
const selectedCategories = ref<string[]>([]);
const onlyWithExif = ref(false);

onMounted(() => {
  // 初始化选中标签（刷新页面时保持状态）
  const urlParams = new URLSearchParams(window.location.search);
  const categoriesFromUrl = urlParams
    .getAll("category")
    .map((c) => c.trim())
    .filter(Boolean);
  selectedCategories.value = multiSelect
    ? categoriesFromUrl
    : categoriesFromUrl.slice(0, 1);

  updateColumns();
  window.addEventListener("resize", updateColumns);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateColumns);
});

// 分类标签列表（EXIF 筛选激活时，隐藏没有任何 EXIF 图片的分类）
const categories = computed(() => {
  const set = new Set<string>();

  photos.forEach((photo) => {
    if (onlyWithExif.value && !(photo.visibleMetaKeys?.length)) return;
    set.add(photo.category || "Uncategorized");
  });

  return Array.from(set).sort((a, b) => a.localeCompare(b));
});

// 按分类分组
const groupedByCategory = computed(() => {
  const filters = selectedCategories.value.map((c) => c.toLowerCase());

  const processedItems = photos.filter((photo) => {
    if (onlyWithExif.value && !(photo.visibleMetaKeys?.length)) return false;

    const category = (photo.category || "Uncategorized").toLowerCase();

    if (!filters.length) return true;
    return filters.includes(category);
  });

  return generateGrid(
    processedItems,
    undefined,
    (item) => item.category || "Uncategorized",
    columnCount.value
  );
});

const toggleExifFilter = () => {
  onlyWithExif.value = !onlyWithExif.value;
};

// 点击标签（再次点击取消选中）
const handleCategoryClick = (category: string) => {
  const selected = selectedCategories.value;

  if (multiSelect) {
    selectedCategories.value = selected.includes(category)
      ? selected.filter((c) => c !== category)
      : [...selected, category];
  } else {
    selectedCategories.value = selected[0] === category ? [] : [category];
  }

  const url = new URL(window.location.href);
  url.searchParams.delete("category");
  selectedCategories.value.forEach((c) =>
    url.searchParams.append("category", c),
  );
  window.history.pushState({}, "", url);
};
</script>

<h1 class="artist">{{globalConfig.lang.photos}}</h1>

<div class="tags">
  <TagChip
    :label="globalConfig.lang.onlyWithExif"
    :active="onlyWithExif"
    @click="toggleExifFilter"
    @mouseenter="handleMouseEnter"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
  >
    <template #icon>
      <Icon :icon="globalConfig.icon.exif" />
    </template>
  </TagChip>
  <TagChip
    v-for="category in categories"
    :key="category"
    @click="handleCategoryClick(category)"
    :active="selectedCategories.includes(category)"
    @mouseenter="handleMouseEnter"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
    :label="category"
  />
</div>

<div class="allPhotos">
  <ClientOnly>
    <div
      v-for="group in groupedByCategory"
      :key="group.key"
      style="margin-bottom: 32px;"
    >
      <h1 class="artist">{{ group.key }}</h1>
      <div class="songs-grid">
        <div
          v-for="(col, colIndex) in group.columns"
          :key="colIndex"
          class="column"
        >
          <div
            v-for="photo in col"
            :key="photo.path"
            class="photo-card"
          >
            <PostCard
              :image="photo.path"
              :url="'/photo-detail?category=' + encodeURIComponent(photo.category) + '&file=' + encodeURIComponent(photo.fileName)"
              :description="photo.fileName"
              :metadata="photo.metadata"
              :visibleMetaKeys="photo.visibleMetaKeys"
              meta=false
            />
          </div>
        </div>
      </div>
    </div>
  </ClientOnly>
</div>

<style scoped>
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--vp-gap);
  margin-bottom: 30px;
}

.songs-grid {
  display: flex;
  gap: var(--vp-gap);
}

.column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--vp-gap);
}
</style>