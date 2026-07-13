<script setup lang="ts">
import { useCardHover } from "../../utils/useCardHover";

defineProps<{
  label?: string;
  count?: string | number | null;
  active?: boolean;
  negative?: boolean;
  href?: string;
  showAnchor?: boolean;
  anchorIcon?: string;
}>();

defineEmits<{
  click: [event: Event];
  mouseenter: [event: MouseEvent];
  mousemove: [event: MouseEvent];
  mouseleave: [event: MouseEvent];
}>();
</script>

<template>
  <component
    :is="href ? 'a' : 'span'"
    :href="href || undefined"
    class="tag"
    :class="{ active, negative }"
    @click="$emit('click', $event)"
    @mouseenter="$emit('mouseenter', $event)"
    @mousemove="$emit('mousemove', $event)"
    @mouseleave="$emit('mouseleave', $event)"
  >
    <slot name="icon" />
    <span v-if="showAnchor" class="anchor">{{ anchorIcon }}</span>
    <span class="name"
      ><slot>{{ label }}</slot></span
    >
    <span v-if="count !== null && count !== undefined" class="count">{{
      count
    }}</span>
  </component>
</template>

<style scoped>
.tag {
  font-family: var(--vp-use-mono);
  text-transform: var(--vp-title-uppercase);
  transition: all var(--vp-transition-time);
  padding: 12px 24px;
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: var(--vp-border-radius-1);
  box-shadow: var(--vp-shadow);
  text-decoration: none;
  font-size: 16px;
  margin: 0;
  will-change: transform;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.tag:hover:not(.active) {
  border-color: var(--vp-c-brand-1);
}

.tag:hover:not(.active) .name,
.tag:hover:not(.active) .count,
.tag:hover:not(.active) .anchor,
.tag:hover:not(.active) :deep(svg) {
  color: var(--vp-c-brand-2);
}

.active {
  border-color: var(--vp-c-brand-1);
  box-shadow: var(--vp-shadow-brand);
}

.active .name,
.active .count,
.active .anchor,
.active :deep(svg) {
  color: var(--vp-c-brand-2);
}

.name {
  font-weight: 600;
  transition: all var(--vp-transition-time);
}

.count {
  margin-left: 12px;
  border-radius: 100%;
  opacity: 0.7;
  transition: all var(--vp-transition-time);
}
.anchor {
  opacity: 0.4;
  margin-right: 4px;
  transition: all var(--vp-transition-time);
}

/* negative 样式 */
.tag.negative.active,
.tag.negative:hover {
  border-color: var(--vp-c-yellow-1);
  box-shadow: var(--vp-shadow-negative) !important;
}

.tag.negative.active .name,
.tag.negative.active .count,
.tag.negative.active .anchor,
.tag.negative.active :deep(svg),
.tag.negative:hover .name,
.tag.negative:hover .count,
.tag.negative:hover .anchor,
.tag.negative:hover :deep(svg) {
  color: var(--vp-c-yellow-1);
}

/* Icon 样式 */
:deep(svg) {
  margin-left: 0px !important;
  margin-right: 10px;
  color: var(--vp-c-text-3);
  opacity: 0.6;
  transition: all var(--vp-transition-time);
}

:deep(a svg) {
  opacity: 0.4;
  margin-right: 10px;
}
</style>
