<script setup lang="ts">
import { globalConfig } from "#config";
</script>

<template>
  <div
    class="first-page"
    :style="{
      backgroundImage: `url(${globalConfig.homePage.modules.banner.imgurl})`,
    }"
  ></div>
</template>

<style scoped>
.first-page {
  position: relative; /* 1. 为伪元素提供定位基准 */
  height: calc(var(--vp-image-home-vh-height) - var(--vp-nav-height));
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  overflow: hidden; /* 避免遮罩溢出 */
}

/* 底部模糊+颜色过渡遮罩 */
.first-page::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 150px; /* 模糊和渐变的区域高度，可以根据喜好调整 */

  /* 1. 颜色过渡：从透明到背景色 */
  background: linear-gradient(to bottom, transparent, var(--vp-c-bg));

  /* 2. 背景模糊：使用你指定的变量 */
  backdrop-filter: var(--vp-blur);
  -webkit-backdrop-filter: var(--vp-blur); /* 兼容 Safari */

  /* 3. 关键：让模糊效果也呈现渐变过渡，避免模糊边缘太生硬 */
  mask: linear-gradient(to bottom, transparent, var(--vp-c-bg));
  -webkit-mask: linear-gradient(to bottom, transparent, var(--vp-c-bg));

  pointer-events: none; /* 防止阻挡下方元素的点击事件 */
}
</style>
