<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount } from "vue";
import { generateGrid } from "#theme/utils/generateGrid";
import { columnCount, updateColumns } from "#theme/utils/dynamicColumns";
import { globalConfig } from "#config";

const contributors = globalConfig.contributors;

const defaultImg =
  "https://pic2.zhimg.com/50/v2-cc1a32fcb444fc9d5e23f2ee078dc6e1_720w.jpg?source=1940ef5c";

onMounted(() => {
  updateColumns();
  window.addEventListener("resize", updateColumns);
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", updateColumns);
});

const groupedContributors = computed(() =>
  generateGrid(
    contributors,
    undefined,
    (contributor) => contributor.role ?? "Contributors",
    columnCount.value,
  ),
);
</script>

<template>
  <div class="banner" style="user-select: none !important">
    Miracle<span>Designed by Miralous</span>
  </div>
  <div class="allContributors">
    <ClientOnly>
      <div
        v-for="group in groupedContributors"
        :key="group.key"
        style="margin-bottom: 32px"
      >
        <h1 class="year">{{ group.key }}</h1>
        <div class="contributors-grid">
          <div
            v-for="(col, colIndex) in group.columns"
            :key="colIndex"
            class="column"
          >
            <div
              v-for="contributor in col"
              :key="contributor.title"
              class="contributor-card"
            >
              <FriendCard
                :title="contributor.title"
                :link="contributor.link"
                :desc="contributor.desc"
                :img="contributor.img ?? defaultImg"
              />
            </div>
          </div>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>

<style scoped>
.banner {
  display: block;
  line-height: 48px;
  background: linear-gradient(
    25deg,
    var(--vp-c-bg-elv),
    var(--vp-c-bg-soft),
    var(--vp-c-bg),
    var(--vp-c-bg)
  );
  border-radius: 0px var(--vp-border-radius-1) var(--vp-border-radius-1);
  font-weight: 500;
  font-size: 48px;
  padding: 300px 30px 30px;
  font-family: var(--vp-font-family-title);
  span {
    display: block;
    font-size: 18px;
    line-height: 24px;
    opacity: 0.6;
  }
}
.contributors-grid {
  display: flex;
  gap: var(--vp-gap);
}
.column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--vp-gap);
}
.year {
  margin-top: 30px;
  line-height: 110px;
  font-size: 100px;
  position: relative;
  top: 30px;
  font-weight: bold;
  color: var(--vp-c-gutter);
  opacity: 0.7;
  z-index: -1;
  mask-image: linear-gradient(var(--vp-c-gutter) 20%, transparent);
  text-transform: var(--vp-title-uppercase);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
