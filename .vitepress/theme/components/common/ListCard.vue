<script setup lang="ts">
interface ListItem {
  icon?: string;
  label: string;
  value?: string;
  link?: string;
  state?: "complete" | "incomplete" | "checked" | "unchecked";
}

withDefaults(
  defineProps<{
    items: ListItem[];
    itemAlign?: "center" | "flex-start";
    iconSize?: string;
    labelBold?: boolean;
    valueEllipsis?: boolean;
    hoverable?: boolean;
  }>(),
  {
    itemAlign: "center",
    iconSize: "1.2em",
    labelBold: false,
    valueEllipsis: false,
    hoverable: false,
  },
);

defineEmits<{
  itemClick: [item: ListItem, index: number];
}>();
</script>

<template>
  <div class="list-card">
    <component
      :is="item.link ? 'a' : 'div'"
      v-for="(item, index) in items"
      :key="index"
      class="list-item"
      :class="{
        checked: item.state === 'checked',
        hoverable,
      }"
      :style="{ alignItems: itemAlign }"
      :href="item.link || undefined"
      :target="item.link ? '_blank' : undefined"
      :rel="item.link ? 'noopener noreferrer' : undefined"
      @click="$emit('itemClick', item, index)"
    >
      <Icon
        v-if="item.icon"
        :icon="item.icon"
        class="item-icon"
        :class="{
          check: item.state === 'checked' || item.state === 'unchecked',
          muted: item.state === 'incomplete',
        }"
        :style="{ fontSize: iconSize }"
      />
      <span
        class="item-label"
        :class="{
          bold: labelBold,
          complete: item.state === 'complete',
          'check-label': item.state === 'checked' || item.state === 'unchecked',
          checked: item.state === 'checked',
          unchecked: item.state === 'unchecked',
        }"
      >
        {{ item.label }}
      </span>
      <span
        v-if="item.value"
        class="item-value"
        :class="{ ellipsis: valueEllipsis }"
      >
        {{ item.value }}
      </span>
    </component>
  </div>
</template>

<style scoped>
.list-card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--vp-c-divider);
  box-shadow: var(--vp-shadow);
  border-radius: var(--vp-border-radius-1);
  padding: 15px 15px;
  gap: calc(var(--vp-gap) / 4);
}

.list-card.padded {
  padding: 20px;
}

.list-card.confirm {
  gap: calc(var(--vp-gap) / 2);
}

.list-card.confirm .list-item {
  padding: 10px 15px;
}

.list-item {
  display: flex;
  gap: var(--vp-gap);
  padding: 7px 15px;
  border-radius: var(--vp-border-radius-2);
  text-decoration: none;
  transition: all var(--vp-transition-time);
  color: inherit;
  .item-icon,
  .item-label {
    color: var(--vp-c-text-1) !important;
  }
}

.list-item.hoverable {
  cursor: pointer;
}

.list-item.hoverable:hover {
  background-color: var(--vp-c-bg-soft);
}

.item-icon {
  flex-shrink: 0;
}

.item-icon.muted {
  color: var(--vp-c-text-2);
}

.item-icon.check {
  margin-top: 1px;
  color: var(--vp-c-text-3);
}

.list-item.checked .item-icon {
  color: var(--vp-c-brand-2);
}

.item-label.bold {
  font-weight: 600;
}

.item-label.complete {
  color: var(--vp-c-text-3);
  opacity: 0.8;
  text-decoration: line-through;
}

.item-label.check-label {
  line-height: 1.6;
}

.item-label.checked {
  color: var(--vp-c-text-1);
  transition: all var(--vp-transition-time);
}

.item-label.unchecked {
  color: var(--vp-c-text-2);
  transition: all var(--vp-transition-time);
}

.item-value {
  color: var(--vp-c-text-2);
  transition: all var(--vp-transition-time);
  user-select: text;
}

.item-value.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
