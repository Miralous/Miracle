<template>
  <div
    class="vp-doc layout beforeDocs"
    v-if="frontmatter.title"
    "
  >

    <div class="textArea card-style" >
        
    <div v-if="frontmatter.image" class="image-container">
      <img
        :src="image"
      />
    </div>
    <div class="textPlace">
      <div class="meta-bar">
        <ClientOnly v-if="frontmatter.published">
          <div class="meta-item">
            <Icon
              class="icon"
              :icon="globalConfig.icon.calendar || 'lucide:pencil'"
            />
            <span>{{ formatRelativeDate(frontmatter.published) }}</span>
          </div>
        </ClientOnly>

        <ClientOnly v-if="frontmatter.updated">
          <div class="meta-item">
            <Icon
              class="icon"
              :icon="globalConfig.icon.time || 'lucide:clock'"
            />
            <span>{{ formatRelativeDate(frontmatter.updated) }}</span>
          </div>
        </ClientOnly>

        <div class="meta-item" v-if="frontmatter.category">
          <Icon class="icon" :icon="globalConfig.icon.categoryMeta" />
          <a
            class="hover-link"
            :href="`/archives?category=${frontmatter.category}`"
            >{{ frontmatter.category }}</a
          >
        </div>
        <div v-if="postInfo?.wordCount" class="meta-item hideOnPhone">
          <Icon class="icon" :icon="globalConfig.icon.words" />
          <span
            >{{ postInfo.wordCount }}
            {{ globalConfig.lang.words || "字" }}</span
          >
        </div>

        <div v-if="frontmatter.origin" class="meta-item">
          <Icon class="icon" :icon="globalConfig.icon.link" />
          <a class="hover-link" :href="frontmatter.origin" target="_blank">{{
            formatUrl(frontmatter.origin)
          }}</a>
        </div>
      </div>

      <h1 class="title">
        {{ frontmatter.title }}
      </h1>
    </div>
    </div>

    <div class="desc-box" v-if="frontmatter.description">
      <p class="desc"><Icon :icon="globalConfig.icon.sparcle" style="margin-right: calc(var(--vp-gap) / 1.5); position: relative; top: -1px;"/>{{ frontmatter.description }}</p>
    </div>
  </div>
</template>

<script setup>
import { useData } from "vitepress";
import { formatRelativeDate } from "../../utils/formatRelativeDate";
import { globalConfig } from "#config";
import { formatUrl } from "../../utils/formatUrl";
import { useCardHover } from "../../utils/useCardHover";
import { data as posts } from "../../data/posts.data";

const { page } = useData();
const frontmatter = page.value?.frontmatter || {};
const postInfo = posts.find((p) => p.filePath === page.value?.filePath);

const image = frontmatter.image

const tags = Array.isArray(frontmatter.tags)
  ? frontmatter.tags
  : [frontmatter.tags];

const { handleMouseMove, handleMouseEnter, handleMouseLeave } = useCardHover();
</script>

<style scoped>
div.vp-doc.layout.beforeDocs {
  display: block;
  z-index: 9999;
  margin-bottom: 30px;
}

/* 头图样式保持 */
.image-container img {
  width: 100% !important;
  height: 40vh !important;
  object-fit: cover;
  background-repeat: no-repeat;
  border-radius: var(--vp-border-radius-1) var(--vp-border-radius-1) 0 0;
  transition: all var(--vp-transition-time);
  box-shadow: var(--vp-shadow);
}

/* 🌟 卡片整体样式 */
.card-style {
  background-color: var(
    --vp-c-bg-soft
  ); /* 匹配 Vitepress 的柔和背景色，浅色灰，深色暗 */
  border-radius: var(--vp-border-radius-1); /* 圆角 */
}

/* 调整移动端间距 */
@media screen and (max-width: 600px) {
  .card-style {
  }
}

/* 顶部元数据栏 */
.meta-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 4px calc(var(--vp-gap) * 1.25);
  margin-bottom: 28px;
  span, a {
  color: var(--vp-c-text-2); /* 柔和的次级文字颜色 */
  opacity: .8;}
  font-size: 14.5px;
   * {font-weight: 400 !important;}
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 重置 Icon 的背景和大小，使其变得极简 */
.meta-item .icon {
  width: 16px;
  height: 16px;
  opacity: 0.8;
}

.hover-link {
    color: var(--vp-c-text-1);
    &:hover {
        opacity: 1 !important;
        color: var(--vp-c-brand-1) !important;
    }
}
.separator {
  margin: 0 4px;
  opacity: 0.4;
}

/* 📰 标题样式 */
.title {
  font-size: 2.2rem;
  font-weight: 700;
  line-height: 1.4;
  color: var(--vp-c-text-1);
  /* 使用衬线体来模拟图片里的优雅质感 */
  font-family: var(--vp-font-family-title);
  letter-spacing: 0.5px;
}

/* ✨ 描述区域样式 */
.desc-box {
  display: flex;
  align-items: flex-start;
  gap: var(--vp-gap);
  padding: 0 calc(var(--vp-gap) / 2);
  color: var(--vp-c-text-3);
  opacity: .8;
}

.iconify {
    opacity: 1 !important;
}

p.desc {
  font-size: 15px;
  line-height: 1.7;
  font-weight: 400;
}

.textPlace {
    
  padding: calc(var(--vp-gap) * 1.5); /* 增加留白 */
}

@media screen and (max-width: 700px) {
    .hideOnPhone {
        display: none;
    }
}
</style>
