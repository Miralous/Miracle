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
import { useCardHover } from "#theme/utils/useCardHover";
const { handleMouseMove, handleMouseEnter, handleMouseLeave } = useCardHover();
import { globalConfig } from "#config";

const stacks = ref(globalConfig.homePage.stacks);

// 动态生成完整 URL
stacks.value = stacks.value.map((stack) => ({
  ...stack,
  icon: `https://jsd-proxy.ygxz.in/gh/devicons/devicon/icons/${stack.icon}/${stack.icon}-original.svg`,
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
