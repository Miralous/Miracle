<script setup lang="ts">
import { onMounted, onUnmounted, computed } from "vue";
import { globalConfig } from "#config";
import { columnCount, updateColumns } from "#theme/utils/dynamicColumns";

function shuffle<T>(array: T[]): T[] {
  return array
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

const allRandomPhotos = shuffle(globalConfig.photos || []);

// 2. 根据动态列数截取数组，确保正好只有一行
const singleRowPhotos = computed(() => {
  return allRandomPhotos.slice(0, columnCount.value);
});

onMounted(() => {
  updateColumns();
  window.addEventListener("resize", updateColumns);
});

onUnmounted(() => {
  window.removeEventListener("resize", updateColumns);
});
</script>

<template>
  <div class="allPhotos">
    <ClientOnly>
      <div class="songs-grid">
        <!-- 3. 使用 singleRowPhotos 遍历 -->
        <div
          v-for="photo in singleRowPhotos"
          :key="photo.path"
          class="photo-card"
        >
          <PostCard
            :image="photo.path"
            :url="photo.path"
            :description="photo.fileName"
            :metadata="photo.metadata"
            :visibleMetaKeys="photo.visibleMetaKeys"
            meta="false"
          />
        </div>
      </div>
    </ClientOnly>
  </div>
</template>

<style scoped>
.songs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--vp-gap);
  align-items: flex-start;
  width: 100%;
}

.photo-card {
  width: 100%;
}
</style>
