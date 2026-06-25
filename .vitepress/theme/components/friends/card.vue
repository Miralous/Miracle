<script setup lang="ts">
import { globalConfig } from "#config";

interface CardProps {
  title: string;
  link?: string;
  desc?: string;
  img?: string;
  folder?: string;
  type?: string;
}

const props = withDefaults(defineProps<CardProps>(), {
  title: "",
  link: "",
  desc: "",
  img: "",
  folder: "",
  type: "",
});
</script>

<template>
  <div
    class="card"
  >
    <a
      :href="props.link"
      :target="props.type == 'square' ? '' : '_blank'"
      class="card-link"
      :rel="props.type == 'follow' ? undefined : 'nofollow'"
    >
      <div class="cardInfo" :class="props.type">
        <div
          class="img-container"
          v-if="
            props.img && props.folder !== 'unable' && props.folder !== 'Unable'
          "
        >
          <img class="img" :src="props.img" :class="props.type" />
        </div>
        <div class="textInfo">
          <div class="title">{{ props.title }}</div>
          <div class="details">
            <Icon
              :icon="globalConfig.icon.singer"
              v-if="props.type == 'square'"
              style="margin-right: 4px"
            />{{ props.desc }}
          </div>
        </div>
      </div>
    </a>
  </div>
</template>

<style scoped>
.card {
  border-bottom: 1px solid var(--vp-c-divider);
  transition: opacity var(--vp-transition-time);
}

.card:hover {
  opacity: 0.7;
}
.card:hover .title {
  color: var(--vp-c-brand-2);
}

.cardInfo {
  padding: 1rem 0;
  display: flex;
  flex-direction: row;
  gap: var(--vp-gap);
}

.title {
  color: var(--vp-c-text-1);
  font-size: 1.15rem;
  line-height: 1.35;
  font-weight: var(--vp-font-weight-card-title);
  font-family: var(--vp-font-family-display);
  margin: 0;
  transition: color var(--vp-transition-time);
}

.details {
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
  line-height: 1.6;
}
.img-container {
  aspect-ratio: 1;
  margin-right: 5px;
  width: 48px;
  height: 48px;
  align-self: center !important;
}

.img {
  border-radius: 100%;
}
.img.square {
  border-radius: var(--vp-border-radius-3);
}

.textInfo {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
  height: 100%;
}
</style>
