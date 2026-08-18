<template>
  <div class="vp-doc beforeDocs" v-if="frontmatter.title">
    <article class="article-header">
      <div v-if="frontmatter.image" class="img-container">
        <img :src="image" alt="" />
      </div>

      <div class="body">
        <div class="meta">
          <ClientOnly v-if="frontmatter.published">
            <span class="meta-item">
              <Icon :icon="globalConfig.icon.calendar" />
              {{ formatRelativeDate(frontmatter.published) }}
            </span>
          </ClientOnly>

          <ClientOnly v-if="frontmatter.updated">
            <span class="meta-item hideOnPhone">
              <Icon :icon="globalConfig.icon.time" />
              {{ formatRelativeDate(frontmatter.updated) }}
            </span>
          </ClientOnly>

          <a
            v-if="frontmatter.category"
            class="category"
            :href="`/archives?category=${frontmatter.category}`"
          >
            <Icon :icon="globalConfig.icon.categoryMeta" />
            {{ frontmatter.category }}
          </a>

          <span v-if="postInfo?.wordCount" class="meta-item hideOnPhone">
            <Icon :icon="globalConfig.icon.words" />
            {{ postInfo.wordCount }} {{ globalConfig.lang.words || "字" }}
          </span>

          <a
            v-if="frontmatter.origin"
            class="meta-item origin"
            :href="frontmatter.origin"
            target="_blank"
          >
            <Icon :icon="globalConfig.icon.link" />
            {{ formatUrl(frontmatter.origin) }}
          </a>
        </div>

        <h1 class="title">{{ frontmatter.title }}</h1>

        <p v-if="frontmatter.description" class="desc">
          {{ frontmatter.description }}
        </p>
      </div>
    </article>
  </div>
</template>

<script setup>
import { useData } from "vitepress";
import { formatRelativeDate } from "../../utils/format/formatRelativeDate";
import { globalConfig } from "#config";
import { formatUrl } from "../../utils/format/formatUrl";
import { data as posts } from "../../data/posts.data";

const { page } = useData();
const frontmatter = page.value?.frontmatter || {};
const postInfo = posts.find((p) => p.filePath === page.value?.filePath);

const image = frontmatter.image;
</script>

<style scoped>
div.vp-doc.beforeDocs {
  display: block;
  margin-bottom: calc(var(--vp-gap) * 2.5);
}

/* 卡片：与其他 Miracle 卡片一致 */
.article-header {
  position: relative;
  z-index: 1;
  border: 1px solid var(--vp-c-divider);
  border-radius: var(--vp-border-radius-1);
  background-color: var(--vp-c-bg);
  box-shadow: var(--vp-shadow);
  overflow: hidden;
  transition: all var(--vp-transition-time);
}

/* 头图 */
.img-container img {
  width: 100%;
  height: 300px;
  object-fit: cover;
  display: block;
  border-bottom: 1px solid var(--vp-c-divider);
}

.body {
  padding: 20px 25px 25px;
}

/* 重置 vp-doc 对链接的下划线渐变 */
.article-header a {
  background: none;
  padding: 0;
  text-decoration: none;
  border-radius: 0;
}

/* 元数据行 */
.meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px calc(var(--vp-gap) * 1.25);
  margin-bottom: calc(var(--vp-gap) * 0.75);
  font-size: 13px;
  font-weight: 500;
  color: var(--vp-c-text-3);
  opacity: 0.8;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

/* 分类 chip，与 postCard 一致 */
a.category {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border-radius: var(--vp-border-radius-1);
  color: var(--vp-c-text-2);
  opacity: 0.8;
}

a.category:hover,
a.origin:hover {
  color: var(--vp-c-text-1);
  opacity: 1;
}

a.origin {
  color: var(--vp-c-text-3);
}

/* 标题 */
.title {
  margin: 0;
  font-size: clamp(1.6rem, 4vw, 2.2rem);
  line-height: 1.3;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-title);
  transition: all var(--vp-transition-time);
}

/* 描述 */
.desc {
  margin: calc(var(--vp-gap) * 0.75) 0 0;
  font-size: 14px;
  line-height: 1.7;
  font-weight: 400;
  color: var(--vp-c-text-3);
  opacity: 0.8;
}

@media screen and (max-width: 700px) {
  .hideOnPhone {
    display: none;
  }

  .img-container img {
    height: 200px;
  }

  .body {
    padding: 20px;
  }
}
</style>
