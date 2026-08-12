<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { globalConfig } from "#config";
import { Icon } from "@iconify/vue";

interface PhotoData {
  fileName: string;
  category: string;
  path: string;
  metadata?: Record<string, string>;
  visibleMetaKeys?: string[];
}

const photo = ref<PhotoData | null>(null);
const notFound = ref(false);

const lg = globalConfig.lang;

const detailKeys: string[] = (globalConfig as any).detail_metadata || [];
const abbrKeys: string[] = (globalConfig as any).abbreviated_metadata || [];
const metaKeys: string[] = detailKeys.length ? detailKeys : abbrKeys;

const displayMetaKeys = computed(() => {
  if (!photo.value) return [];
  return metaKeys.filter((key) => !!photo.value!.metadata?.[key]);
});

const hasExif = computed(() => displayMetaKeys.value.length > 0);

const metaIcons: Record<string, string> =
  (globalConfig as any).icon?.meta || {};
const fallbackMetaIcon = "ph:info-duotone";

function metaIcon(key: string): string {
  return metaIcons[key] || fallbackMetaIcon;
}

function loadPhoto() {
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category") || "";
  const file = params.get("file") || "";

  const photos: PhotoData[] = (globalConfig as any).photos || [];
  const found = photos.find(
    (p: PhotoData) => p.category === category && p.fileName === file,
  );

  if (found) {
    photo.value = found;
  } else {
    notFound.value = true;
  }
}

onMounted(() => {
  loadPhoto();
});
</script>

<template>
  <div class="photo-detail" :class="{ 'no-exif': !hasExif }">
    <div v-if="notFound" class="not-found">
      <p>Photo not found.</p>
      <a href="/photos">{{ lg.backToPhotos || "Back to Photos" }}</a>
    </div>

    <template v-else-if="photo">
      <div class="image-section">
        <img :src="photo.path" :alt="photo.fileName" />
      </div>

      <div v-if="hasExif" class="info-section">
        <div class="info-card">
          <h2 class="photo-title">{{ photo.fileName }}</h2>
          <div class="meta-list">
            <div class="meta-item">
              <span class="meta-label">
                <Icon :icon="metaIcon('Category')" />
                {{ lg.category || "Category" }}
              </span>
              <span class="meta-value">{{ photo.category }}</span>
            </div>

            <div v-for="key in displayMetaKeys" :key="key" class="meta-item">
              <span class="meta-label">
                <Icon :icon="metaIcon(key)" />
                {{ lg[key] || key }}
              </span>
              <span class="meta-value">{{ photo.metadata?.[key] }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.photo-detail {
  width: 100%;
}

/* --- Not Found --- */
.not-found {
  text-align: center;
  padding: 6rem 2rem;
}

.not-found p {
  font-size: 1.2rem;
  color: var(--vp-c-text-2);
  margin-bottom: 1rem;
}

.not-found a {
  color: var(--vp-c-brand-1);
  font-weight: 500;
}

/* --- Back Link --- */
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--vp-use-mono);
  text-transform: var(--vp-title-uppercase);
  font-size: 13px;
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: var(--vp-border-radius-1);
  padding: 8px 16px;
  box-shadow: var(--vp-shadow);
  text-decoration: none;
  transition: all var(--vp-transition-time);
  white-space: nowrap;
}

.back-link :deep(svg) {
  color: var(--vp-c-text-3);
  opacity: 0.6;
  transition: all var(--vp-transition-time);
}

.back-link:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-2);
}

.back-link:hover :deep(svg) {
  color: var(--vp-c-brand-2);
  opacity: 1;
}

/* --- Info Card --- */
.info-card {
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: var(--vp-border-radius-1);
  padding: 25px;
  box-shadow: var(--vp-shadow);
}

.photo-title {
  font-family: var(--vp-font-family-title);
  font-weight: 700;
  font-size: 24px;
  color: var(--vp-c-text-1);
  margin: 0 0 1.5rem 0;
  word-break: break-all;
  border-top: 0;
  padding: 0;
}

.meta-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.meta-label {
  display: flex;
  align-items: center;
  gap: 6px;
  text-transform: var(--vp-title-uppercase);
  font-size: 13px;
  color: var(--vp-c-text-3);
  opacity: 0.8;
}

.meta-label :deep(svg) {
  color: var(--vp-c-text-3);
  opacity: 0.6;
}

.meta-value {
  font-size: 1.1rem;
  color: var(--vp-c-text-1);
  line-height: 1.5;
}

/* ================================
   Desktop (>= 1000px)
   - Container pinned to viewport below nav bar
   - Image fixed left, info section scrolls right
   ================================ */
@media (min-width: 1000px) {
  .photo-detail {
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    bottom: 0;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .back-link {
    position: fixed;
    top: calc(64px + 1rem);
    left: calc((100% - 420px) * 0.06);
    z-index: 10;
  }

  .image-section {
    position: fixed;
    top: calc((100% + 64px) / 2);
    transform: translateY(-50%);
    width: calc((100% - 420px) * 0.88);
    margin: 0 calc((100% - 420px) * 0.06 + 420px) 0 calc((100% - 420px) * 0.06);
  }

  .image-section img {
    max-width: 100%;
    max-height: calc(100vh - 64px - 4rem);
    display: block;
    margin: 0 auto;
    box-shadow: var(--vp-shadow);
  }

  .no-exif .image-section {
    top: calc(64px + 50%);
    width: 80vw;
    max-width: 1200px;
    left: 50%;
    margin: 0;
    transform: translate(-50%, -50%);
  }

  .info-section {
    width: 400px;
    margin-left: calc(100% - 420px);
    padding: 10px 10px 10px 0;
    min-height: calc(100vh - 64px);
  }
}

/* ================================
   Mobile (< 1000px)
   ================================ */
@media (max-width: 999px) {
  .back-link {
    display: flex;
    justify-content: center;
    margin: 1rem 5% 0;
  }

  .image-section {
    width: 90%;
    margin: 0.75rem 5%;
    background-color: var(--vp-c-bg);
    border: 1px solid var(--vp-c-divider);
    border-radius: var(--vp-border-radius-1);
    box-shadow: var(--vp-shadow);
    padding: 12px;
  }

  .image-section img {
    width: 100%;
    height: auto;
    display: block;
    border-radius: var(--vp-border-radius-2);
  }

  .info-section {
    width: 90%;
    margin: 0rem 5% 3rem;
  }
}
</style>
