<template>
  <div class="first-page"></div>
  <ClientOnly>
    <div class="friend-grid">
      <TagChip
        v-for="friend in friends"
        :key="friend.title"
        :label="friend.title"
        :href="friend.link"
      >
        <template #icon>
          <img :src="friend.img" alt="" class="friend-icon" />
        </template>
      </TagChip>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { globalConfig } from "#config";

function shuffle(array: any[]) {
  return array
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

const friends = shuffle(
  globalConfig.friends
    .filter((friend) => friend.folder !== "unable")
    .filter((friend) => friend.folder !== "Unable")
    .map((friend) => ({
      ...friend,
      img:
        friend.img ||
        "https://pic2.zhimg.com/50/v2-cc1a32fcb444fc9d5e23f2ee078dc6e1_720w.jpg?source=1940ef5c",
    })),
);
</script>

<style scoped>
.friend-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--vp-gap);
}

.friend-icon {
  width: 18px;
  height: 18px;
  margin-right: var(--vp-gap);
  border-radius: 50%;
}
</style>
