<script setup lang="ts">
import { globalConfig } from "#config";
</script>

<template>
  <div class="first-page">
    <div class="hero-content">
      <p class="hero-author">{{ globalConfig.author }}</p>
      <h1 class="hero-title">{{ globalConfig.title }}</h1>
      <div class="hero-divider"></div>
      <p class="hero-desc">{{ globalConfig.description }}</p>
    </div>

    <div class="scroll-indicator">
      <span class="scroll-text">Scroll</span>
      <div class="scroll-line"></div>
    </div>
  </div>
</template>

<style scoped>
.first-page {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 90vh;
  padding: 14vh 14vw;
  overflow: hidden;
  background: radial-gradient(circle at 100% 0%, var(--vp-c-bg-soft, transparent) 0%, transparent 50%);
}

.hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 1200px;
  width: 100%;
}

.hero-author {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  letter-spacing: 0.4em;
  text-transform: uppercase;
  margin-bottom: 2.5rem;
  animation: fadeUp 1s ease-out both;
}

.hero-author::before {
  content: "";
  width: 3rem;
  height: 1px;
  background-color: var(--vp-c-text-2);
  margin-right: 1.5rem;
  opacity: 0.6;
}

.hero-title {
  font-family: "Playfair Display", "Noto Serif SC", "Songti SC", "STSong", serif;
  font-size: clamp(3.5rem, 8vw, 7.5rem);
  font-weight: 300;
  line-height: 1.1;
  letter-spacing: 0.02em;
  color: var(--vp-c-text-1);
  margin: 0 0 0 -0.05em;
  animation: fadeUp 1s ease-out 0.2s both;
}

.hero-divider {
  width: 1px;
  height: 5rem;
  background-color: var(--vp-c-text-1);
  margin: 3.5rem 0 3.5rem 1rem;
  opacity: 0.2;
  animation: scaleY 1s ease-out 0.4s both;
  transform-origin: top;
}

.hero-desc {
  font-size: clamp(1.05rem, 1.5vw, 1.15rem);
  color: var(--vp-c-text-2);
  font-weight: 300;
  line-height: 2.2;
  letter-spacing: 0.06em;
  max-width: 550px;
  margin: 0 0 0 1rem;
  animation: fadeUp 1s ease-out 0.6s both;
}

.scroll-indicator {
  position: absolute;
  right: 6vw;
  bottom: 8vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  z-index: 10;
  animation: fadeUp 1s ease-out 1s both;
}

.scroll-text {
  writing-mode: vertical-rl;
  font-size: 0.65rem;
  letter-spacing: 0.4em;
  color: var(--vp-c-text-2);
  text-transform: uppercase;
  font-weight: 300;
}

.scroll-line {
  width: 1px;
  height: 80px;
  background-color: var(--vp-c-text-1);
  opacity: 0.2;
  position: relative;
  overflow: hidden;
}

.scroll-line::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--vp-c-text-1);
  animation: scrollDrop 2s cubic-bezier(0.77, 0, 0.175, 1) infinite;
}

.first-page::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 150px;
  background: linear-gradient(to bottom, transparent, var(--vp-c-bg));
  backdrop-filter: var(--vp-blur);
  -webkit-backdrop-filter: var(--vp-blur);
  mask: linear-gradient(to bottom, transparent, var(--vp-c-bg));
  -webkit-mask: linear-gradient(to bottom, transparent, var(--vp-c-bg));
  pointer-events: none;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleY {
  from {
    opacity: 0;
    transform: scaleY(0);
  }
  to {
    opacity: 0.2;
    transform: scaleY(1);
  }
}

@keyframes scrollDrop {
  0% {
    transform: translateY(-100%);
  }
  50% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(100%);
  }
}

@media (max-width: 768px) {
  .first-page {
    padding: 8rem 8vw;
  }
  
  .hero-author::before {
    width: 1.5rem;
    margin-right: 1rem;
  }
  
  .hero-divider {
    height: 3.5rem;
    margin: 2.5rem 0 2.5rem 0.5rem;
  }
  
  .hero-desc {
    margin: 0 0 0 0.5rem;
  }

  .scroll-indicator {
    right: 4vw;
    transform: scale(0.8);
    transform-origin: bottom right;
  }
}
</style>