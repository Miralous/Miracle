<script setup lang="ts">
import { computed } from "vue";
import { data as posts } from "../../data/posts.data";
import { data as moments } from "../../data/moments.data";
import { data as photos } from "../../data/photos.data";
import { data as friends } from "../../data/friends.data";
import { globalConfig } from "#config";
import { getRunningTime } from "../../utils/getRunningTime";

// ─── 基础统计 ──────────────────────────────────────────────

const totalPosts = computed(() => posts.length);
const totalWords = computed(() =>
  posts.reduce((sum, p) => sum + (p.wordCount ?? 0), 0),
);
const totalReadingTime = computed(() =>
  posts.reduce((sum, p) => sum + (p.readingTime ?? 0), 0),
);
const avgWords = computed(() =>
  totalPosts.value > 0 ? Math.round(totalWords.value / totalPosts.value) : 0,
);

// 最长 / 最短文章
const sortedByWords = computed(() =>
  [...posts]
    .filter((p) => p.wordCount != null)
    .sort((a, b) => (b.wordCount ?? 0) - (a.wordCount ?? 0)),
);
const longestPost = computed(() => sortedByWords.value[0] ?? null);
const shortestPost = computed(
  () => sortedByWords.value[sortedByWords.value.length - 1] ?? null,
);

// ─── 分类统计 ──────────────────────────────────────────────

const categories = computed(() => {
  const map: Record<string, number> = {};
  posts.forEach((p) => {
    const c = p.category || "Uncategorized";
    map[c] = (map[c] || 0) + 1;
  });
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
});

// ─── 标签统计 ──────────────────────────────────────────────

const tags = computed(() => {
  const map: Record<string, number> = {};
  posts.forEach((p) => {
    (p.tags || []).forEach((t) => {
      map[t] = (map[t] || 0) + 1;
    });
  });
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
});

// ─── 其他统计 ──────────────────────────────────────────────

const totalMoments = computed(() => moments.length);
const totalPhotos = computed(() => photos.length);
const totalFriends = computed(() => friends.length);
const runningDays = computed(() => getRunningTime(globalConfig.dateCreated));
</script>

<template>
  <div class="statistics">
    <!-- 文章统计 -->
    <h2>
      <Icon :icon="globalConfig.icon.recentPosts" />
      {{ globalConfig.lang.posts }}
    </h2>
    <div class="stats-grid">
      <div
        class="stat-card"
      >
        <div class="stat-icon">
          <Icon :icon="globalConfig.icon.category" />
        </div>
        <div class="stat-body">
          <span class="stat-value">{{ totalPosts }}</span>
          <span class="stat-label">{{ globalConfig.lang.posts }}</span>
        </div>
      </div>

      <div
        class="stat-card"
      >
        <div class="stat-icon">
          <Icon :icon="globalConfig.icon.wordCount" />
        </div>
        <div class="stat-body">
          <span class="stat-value">{{ totalWords.toLocaleString() }}</span>
          <span class="stat-label">{{ globalConfig.lang.words }}</span>
        </div>
      </div>

      <div
        class="stat-card"
      >
        <div class="stat-icon">
          <Icon :icon="globalConfig.icon.moment" />
        </div>
        <div class="stat-body">
          <span class="stat-value">{{ totalReadingTime }}</span>
          <span class="stat-label">{{ globalConfig.lang.minutes }}</span>
        </div>
      </div>

      <div
        class="stat-card"
      >
        <div class="stat-icon">
          <Icon :icon="globalConfig.icon.average" />
        </div>
        <div class="stat-body">
          <span class="stat-value">{{ avgWords.toLocaleString() }}</span>
          <span class="stat-label"
            >{{ globalConfig.lang.words }}/{{ globalConfig.lang.posts }}</span
          >
        </div>
      </div>
    </div>

    <!-- 最长 / 最短文章 -->
    <div class="stats-grid two">
      <div
        class="stat-card extended"
        v-if="longestPost"
      >
        <div class="stat-icon">
          <Icon :icon="globalConfig.icon.sparcle" />
        </div>
        <div class="stat-body">
          <span class="stat-label">Longest</span>
          <span class="stat-value small">
            <a :href="longestPost.url" class="stat-link">{{
              longestPost.title
            }}</a>
          </span>
          <span class="stat-meta"
            >{{ longestPost.wordCount?.toLocaleString() }}
            {{ globalConfig.lang.words }}</span
          >
        </div>
      </div>

      <div
        class="stat-card extended"
        v-if="shortestPost"
      >
        <div class="stat-icon">
          <Icon :icon="globalConfig.icon.sparcle" />
        </div>
        <div class="stat-body">
          <span class="stat-label">Shortest</span>
          <span class="stat-value small">
            <a :href="shortestPost.url" class="stat-link">{{
              shortestPost.title
            }}</a>
          </span>
          <span class="stat-meta"
            >{{ shortestPost.wordCount?.toLocaleString() }}
            {{ globalConfig.lang.words }}</span
          >
        </div>
      </div>
    </div>

    <!-- 分类概览 -->
    <h2>
      <Icon :icon="globalConfig.icon.category" />
      {{ globalConfig.lang.categories }}
    </h2>
    <div class="tag-grid">
      <TagChip
        v-for="[cat, count] in categories"
        :key="cat"
        :label="cat"
        :count="count"
        :href="`/archives?category=${encodeURIComponent(cat)}`"
      >
        <template #icon>
          <Icon :icon="globalConfig.icon.category" />
        </template>
      </TagChip>
    </div>

    <!-- 标签概览 -->
    <h2>
      <Icon :icon="globalConfig.icon.tag" />
      {{ globalConfig.lang.tags }}
    </h2>
    <div class="tag-grid">
      <TagChip
        v-for="[tag, count] in tags"
        :key="tag"
        :label="tag"
        :count="count"
        :href="`/tags?tag=${encodeURIComponent(tag)}`"
      >
        <template #icon>
          <Icon :icon="globalConfig.icon.tag" />
        </template>
      </TagChip>
    </div>

    <!-- 站点统计 -->
    <h2>
      <Icon :icon="globalConfig.icon.about" />
      {{ globalConfig.lang.dashboard }}
    </h2>
    <div class="stats-grid">
      <div
        class="stat-card"
      >
        <div class="stat-icon">
          <Icon :icon="globalConfig.icon.moment" />
        </div>
        <div class="stat-body">
          <span class="stat-value">{{ totalMoments }}</span>
          <span class="stat-label">{{ globalConfig.lang.moments }}</span>
        </div>
      </div>

      <div
        class="stat-card"
      >
        <div class="stat-icon">
          <Icon :icon="globalConfig.icon.photos" />
        </div>
        <div class="stat-body">
          <span class="stat-value">{{ totalPhotos }}</span>
          <span class="stat-label">{{ globalConfig.lang.photos }}</span>
        </div>
      </div>

      <div
        class="stat-card"
      >
        <div class="stat-icon">
          <Icon :icon="globalConfig.icon.friends" />
        </div>
        <div class="stat-body">
          <span class="stat-value">{{ totalFriends }}</span>
          <span class="stat-label">{{ globalConfig.lang.friends }}</span>
        </div>
      </div>

      <div
        class="stat-card"
      >
        <div class="stat-icon">
          <Icon :icon="globalConfig.icon.siteAge" />
        </div>
        <div class="stat-body">
          <span class="stat-value">{{ runningDays }}</span>
          <span class="stat-label">{{ globalConfig.lang.days }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.statistics {
  width: 100%;
}

.statistics h2 {
  display: flex;
  align-items: center;
  margin: 32px 0 20px;
  font-family: var(--vp-font-family-display);
  font-weight: 400;
  font-size: 1.25rem;
  letter-spacing: 0.04em;
  line-height: 1.4;
  border-top: none !important;
}

.statistics h2:first-child {
  margin-top: 10px;
}

.statistics h2:before {
  content: "";
  display: block;
  width: var(--vp-decorative-line-width);
  height: 1px;
  background-color: var(--vp-c-text-2);
  margin-right: 1.25rem;
  opacity: 0.5;
  border: none;
  border-radius: 0;
}

/* ── 网格 ── */

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--vp-gap);
  margin-bottom: var(--vp-gap);
}

.stats-grid.two {
  grid-template-columns: 1fr 1fr;
}

@media (max-width: 640px) {
  .stats-grid.two {
    grid-template-columns: 1fr;
  }
}

/* ── 统计文本行 ── */

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 1.25rem 0;
  border-bottom: 1px solid var(--vp-c-divider);
  transition: opacity var(--vp-transition-time);
}

.stat-card:hover {
  opacity: 0.7;
}

.stat-card.extended {
  flex-direction: row;
  align-items: flex-start;
}

.stat-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--vp-c-brand-1);
  font-size: 20px;
}

.stat-body {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.stat-value {
  font-size: 28px;
  font-weight: 500;
  line-height: 1.2;
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-display);
}

.stat-value.small {
  font-size: 16px;
  font-weight: 400;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stat-link {
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition: color var(--vp-transition-time);
}

.stat-card:hover .stat-link {
  color: var(--vp-c-brand-2);
}

.stat-label {
  font-size: var(--vp-font-size-meta);
  color: var(--vp-c-text-3);
  opacity: 0.8;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: var(--vp-font-letter-spacing-meta);
}

.stat-meta {
  font-size: var(--vp-font-size-meta);
  color: var(--vp-c-text-3);
  opacity: 0.6;
  margin-top: 2px;
  font-family: var(--vp-font-family-base);
}

/* ── 胶囊网格 ── */

.tag-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--vp-gap);
  margin-bottom: 8px;
}

h2 > .iconify {
  margin-right: 8px;
}
</style>
