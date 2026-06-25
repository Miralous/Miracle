<script setup lang="ts">
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
  font-family: var(--vp-font-family-base);
  letter-spacing: 0.04em;
  transition: color var(--vp-transition-time);
  padding: 0.35rem 0;
  color: var(--vp-c-text-2);
  text-decoration: none;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.tag:hover:not(.active),
.tag:hover:not(.active) .name,
.tag:hover:not(.active) .count,
.tag:hover:not(.active) .anchor,
.tag:hover:not(.active) :deep(svg) {
  color: var(--vp-c-brand-1);
}

.active,
.active .name,
.active .count,
.active .anchor,
.active :deep(svg) {
  color: var(--vp-c-brand-1);
}

.name {
  font-weight: 500;
  transition: color var(--vp-transition-time);
}

.count {
  margin-left: 12px;
  opacity: 0.7;
  transition: color var(--vp-transition-time);
}
.anchor {
  opacity: 0.4;
  margin-right: 4px;
  transition: color var(--vp-transition-time);
}

/* negative 样式 */
.tag.negative.active,
.tag.negative.active .name,
.tag.negative.active .count,
.tag.negative.active .anchor,
.tag.negative.active :deep(svg),
.tag.negative:hover,
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
  transition: color var(--vp-transition-time);
}

:deep(a svg) {
  opacity: 0.4;
  margin-right: 10px;
}
</style>
