<script setup lang="ts">
import { computed } from "vue";
import { globalConfig } from "#config";
import { formatRelativeDate } from "../../utils/formatRelativeDate";

interface CardProps {
  title?: string;
  url?: string;
  description?: string;
  category?: string;
  originDate?: string;
  image?: string;
  type?: string;
  negative?: boolean;
  meta?: string;
}

const props = withDefaults(defineProps<CardProps>(), {
  title: "",
  url: "",
  description: "",
  category: "",
  originDate: "",
  image: "",
  type: "",
  negative: false,
  meta: "true",
});

// 计算最终跳转链接
const clink = computed(() => {
  if (props.type === "project" && props.category) {
    return `https://github.com/${props.category}`;
  }
  return props.url || "";
});

// 处理换行符
const descriptionText = computed(() => {
  if (!props.description) return "";
  return props.description
    .replace(/\\\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n");
});

// 判断是否可点击
const isClickable = computed(() => !!clink.value);
</script>

<template>
  <!-- 用 a 或 div 动态渲染 -->
  <!-- ✅ 关键改动：动态绑定 class，当 props.negative 为真时添加 'is-negative' 类 -->
  <component
    :is="isClickable ? 'a' : 'div'"
    :href="isClickable ? url : undefined"
    :type="props.type"
    class="diary"
    :class="{ 'is-negative': props.negative }"
  >
    <!-- ✅ 优化：删除了原本代码中重复嵌套了一层的 v-if="props.image" -->
    <div v-if="props.image" class="img-container">
      <img :src="props.image" />
    </div>

    <div class="textPlace">
      <p class="title" v-if="props.title">{{ props.title }}</p>

      <!-- 支持换行 -->
      <p
        class="details"
        v-if="props.description && props.title"
        :style="props.meta === 'true' ? 'margin: 0 0 10px 0' : 'margin:0'"
      >
        {{ descriptionText }}
      </p>
      <p
        class="details notitle"
        v-else-if="props.description"
        :style="props.meta === 'true' ? 'margin: 0 0 10px 0' : 'margin:0'"
      >
        {{ descriptionText }}
      </p>

      <div class="meta" v-if="props.meta === 'true'">
        <!-- 分类显示 -->
        <template v-if="props.category">
          <a v-if="props.type === 'project'" class="category" :href="clink">
            <Icon :icon="globalConfig.icon.friends" />
            {{ props.category }}
          </a>

          <a
            v-else
            class="category"
            :href="`/archives?category=${props.category}`"
            :style="
              props.negative
                ? 'background-color: var(--vp-c-warning-soft);'
                : ''
            "
          >
            <span v-if="props.negative" style="color: var(--vp-c-warning-1)">
              <Icon
                :icon="globalConfig.icon.negative"
                style="color: var(--vp-c-warning-1)"
              />
              {{ props.category }}
            </span>
            <span v-else>
              <Icon :icon="globalConfig.icon.new" />
              {{ props.category }}
            </span>
          </a>
        </template>

        <span class="date">
          <Icon
            v-if="!props.category"
            :icon="globalConfig.icon.calendar"
            style="margin-right: 3px; bottom: 0px"
          />
          {{ props.originDate ? formatRelativeDate(props.originDate) : "" }}
        </span>
      </div>
    </div>
  </component>
</template>

<style scoped>
.img-container img {
  width: 100%;
  max-height: 180px;
  object-fit: cover;
  margin-bottom: 1rem;
  border-radius: var(--vp-border-radius-3);
}

.iconify {
  position: relative;
  bottom: 1px;
}

.diary {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.25rem 0;
  border-bottom: 1px solid var(--vp-c-divider);
  transition: opacity var(--vp-transition-time);
}

.diary[type="project"] .title {
  text-transform: var(--vp-title-uppercase);
  font-family: var(--vp-font-family-display);
}

.diary:hover {
  opacity: 0.7;
}
.diary:hover .title {
  color: var(--vp-c-brand-1);
}

/* Negative posts: dashed bottom border */
.diary.is-negative {
  border-bottom-style: dashed;
  border-bottom-color: var(--vp-c-yellow-1);
}
.diary.is-negative:hover {
  opacity: 0.8;
}
.diary.is-negative:hover .title {
  color: var(--vp-c-yellow-1);
}

.textPlace {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.meta {
  margin-top: auto;
  font-size: var(--vp-font-size-meta);
  color: var(--vp-c-text-3);
  opacity: 0.8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: var(--vp-font-weight-body);
  text-transform: uppercase;
  letter-spacing: var(--vp-font-letter-spacing-meta);
  display: flex;
  align-items: center;
  gap: 8px;
}

.title {
  margin-bottom: 8px !important;
  color: var(--vp-c-text-1);
  font-size: 1.15rem;
  line-height: 1.35;
  font-weight: var(--vp-font-weight-card-title);
  font-family: var(--vp-font-family-display);
  margin: 0;
  text-transform: none;
  letter-spacing: 0.02em;
  transition: color var(--vp-transition-time);
}

.details {
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
  line-height: 1.7;
  white-space: pre-line;
  overflow-wrap: break-word;
  font-weight: var(--vp-font-weight-body);
}

.notitle {
  font-size: 0.95rem;
}

.category {
  margin-right: 5px;
  color: var(--vp-c-text-2);
  font-size: var(--vp-font-size-meta);
  text-transform: uppercase;
  letter-spacing: var(--vp-font-letter-spacing-meta);
}
.category:hover {
  color: var(--vp-c-text-1);
}
</style>
