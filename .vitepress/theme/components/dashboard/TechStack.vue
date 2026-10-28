<template>
  <div class="tech-grid">
    <TagChip
      v-for="stack in stacks"
      @mouseenter="handleMouseEnter"
      @mousemove="handleMouseMove"
      @mouseleave="handleMouseLeave"
      :key="stack.name"
      :label="stack.name"
    >
      <template #icon>
        <img :src="stack.icon" alt="" class="tech-icon" />
      </template>
    </TagChip>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { withBase } from "vitepress";
import { useCardHover } from "#theme/utils/composables/useCardHover";
const { handleMouseMove, handleMouseEnter, handleMouseLeave } = useCardHover();
import { globalConfig } from "#config";

const stacks = ref(globalConfig.homePage.stacks);

// 使用本地图标，避免第三方 CDN 不可用导致图标加载失败
stacks.value = stacks.value.map((stack) => ({
  ...stack,
  icon: withBase(`/icons/techstack/${stack.icon}.svg`),
}));

// 自动按首字母排序
stacks.value.sort((a, b) => a.name.localeCompare(b.name));
</script>

<style scoped>
.tech-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--vp-gap);
  align-items: flex-start;
}

.tech-icon {
  width: 18px;
  height: 18px;
  margin-right: var(--vp-gap);
}
</style>
