<script setup lang="ts">
interface CardProps {
  url: string;
  text?: string;
  icon: string;
}

const props = withDefaults(defineProps<CardProps>(), {
  url: "",
  text: "",
  icon: "",
});

function getFileName(url: string) {
  const parts = url.split("/");
  return parts[parts.length - 1];
}
</script>

<template>
  <a :href="url" target="_blank" class="nocss file-chip">
    <Icon :icon="props.icon"></Icon>
    <span>{{ text ? text : getFileName(url) }}</span>
  </a>
</template>

<style scoped>
a.file-chip {
  background-color: var(--vp-c-bg);
  padding: 2px calc(var(--vp-gap) * 1.5);
  margin: 0 2px;
  border-radius: var(--vp-border-radius-1);
  border: 1px solid var(--vp-c-divider);
  box-shadow: var(--vp-shadow-tag);
  transition: all var(--vp-transition-time);
  display: inline-flex;
  align-items: center;
  vertical-align: baseline;
  color: var(--vp-c-text-1);

  .iconify {
    margin-right: 5px;
    color: var(--vp-c-text-2);
  }

  span {
    font-weight: 500;
    color: var(--vp-c-text-1);
  }

  &:hover {
    border-color: var(--vp-c-brand-2);
    box-shadow: var(--vp-shadow-brand-tag);

    span,
    .iconify {
      color: var(--vp-c-brand-1);
    }
  }
}
</style>
