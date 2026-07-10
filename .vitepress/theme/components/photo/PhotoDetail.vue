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

function loadPhoto() {
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category") || "";
  const file = params.get("file") || "";

  const photos: PhotoData[] = (globalConfig as any).photos || [];
  const found = photos.find(
    (p: PhotoData) => p.category === category && p.fileName === file
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
      <a class="back-link" href="/photos">
        <Icon icon="ph:arrow-left-duotone" />
        <span>{{ lg.backToPhotos || "Back to Photos" }}</span>
      </a>

      <div class="image-section">
        <img :src="photo.path" :alt="photo.fileName" />
      </div>

      <div v-if="hasExif" class="info-section">
        <div class="info-card">
          <h2 class="photo-title">{{ photo.fileName }}</h2>
          <div class="meta-list">
            <div class="meta-item">
              <span class="meta-label">{{ lg.category || "Category" }}</span>
              <span class="meta-value">{{ photo.category }}</span>
            </div>

            <div
              v-for="key in displayMetaKeys"
              :key="key"
              class="meta-item"
            >
              <span class="meta-label">{{ lg[key] || key }}</span>
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
  gap: 6px;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
  transition: color var(--vp-transition-time);
  text-decoration: none;
  white-space: nowrap;
}

.back-link:hover {
  color: var(--vp-c-brand-1);
}

/* --- Info Card --- */
.info-card {
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-border);
  border-radius: var(--vp-border-radius-2);
  padding: var(--vp-card-padding);
  box-shadow: var(--vp-shadow);
}

.photo-title {
  font-family: var(--vp-font-family-display);
  font-size: 1.25rem;
  font-weight: 400;
  color: var(--vp-c-text-1);
  margin: 0 0 1.5rem 0;
  word-break: break-all;
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
  font-size: var(--vp-font-size-meta);
  text-transform: uppercase;
  letter-spacing: var(--vp-font-letter-spacing-meta);
  color: var(--vp-c-text-3);
  font-weight: var(--vp-font-weight-body);
}

.meta-value {
  font-family: var(--vp-font-family-display);
  font-size: 1.1rem;
  font-weight: 400;
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
    box-shadow: 10px 10px 15px rgba(0, 0, 0, 0.3);
  }

  .dark .image-section img {
    box-shadow: 10px 10px 15px rgba(0, 0, 0, 0.5);
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
    padding: 1rem 0 0 5%;
  }

  .image-section {
    width: 90%;
    margin: 0.75rem 5%;
  }

  .image-section img {
    width: 100%;
    height: auto;
    display: block;
    box-shadow: var(--vp-shadow);
  }

  .dark .image-section img {
    box-shadow: 10px 10px 15px rgba(0, 0, 0, 0.5);
  }

  .no-exif .image-section {
    width: 95%;
    margin: 1rem 2.5%;
  }

  .info-section {
    width: 94%;
    margin: 1.25rem 3% 3rem;
  }
}
</style>
