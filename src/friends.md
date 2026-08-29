---
layout: home
footer: false
title: Friends
---

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import { generateGrid } from "#theme/utils/generateGrid";
import { columnCount, updateColumns } from "#theme/utils/composables/dynamicColumns";
import { useCardHover } from "#theme/utils/composables/useCardHover";
import { globalConfig } from "#config";

const friendWeights: Record<string, number> = globalConfig.friendWeights;
const multiSelect = globalConfig.features.multiSelect;

const defaultImg = "https://pic2.zhimg.com/50/v2-cc1a32fcb444fc9d5e23f2ee078dc6e1_720w.jpg?source=1940ef5c";

const { friends } = globalConfig;

const { handleMouseMove, handleMouseEnter, handleMouseLeave } = useCardHover();

const selectedFolders = ref<string[]>([]);
const showSiteInfo = ref(false);

const siteInfo = {
  name: globalConfig.informations.author,
  avatar: globalConfig.informations.avatar,
  desc: globalConfig.informations.description,
  link: globalConfig.informations.url,
};

const toggleSiteInfo = () => {
  showSiteInfo.value = !showSiteInfo.value;
};

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const foldersFromUrl = urlParams
    .getAll("folder")
    .map((f) => f.trim())
    .filter(Boolean);
  selectedFolders.value = multiSelect
    ? foldersFromUrl
    : foldersFromUrl.slice(0, 1);

  updateColumns();
  window.addEventListener("resize", updateColumns);
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", updateColumns);
});

const isUnable = (folder: string) => folder.toLowerCase() === "unable";

const folders = computed(() => {
  const set = new Set<string>();
  friends.forEach((friend) => {
    const folder = friend.folder ?? "friends";
    set.add(folder);
  });
  return Array.from(set).sort((a, b) => {
    const wa = friendWeights[a] ?? 0;
    const wb = friendWeights[b] ?? 0;
    if (wa === wb) return a.localeCompare(b);
    return wa - wb;
  });
});

const folderCounts = computed(() => {
  const counts: Record<string, number> = {};
  friends.forEach((friend) => {
    const folder = friend.folder ?? "friends";
    counts[folder] = (counts[folder] || 0) + 1;
  });
  return counts;
});

const groupedFriends = computed(() => {
  const selected = selectedFolders.value.map((f) => f.toLowerCase());
  const filtered = friends.filter((friend) => {
    const folder = (friend.folder ?? "friends").toLowerCase();
    if (!selected.length) return !isUnable(folder);
    return selected.includes(folder);
  });

  const raw = generateGrid(
    filtered,
    undefined,
    (friend) => friend.folder ?? "friends",
    columnCount.value
  );

  return raw.sort((a, b) => {
    const wa = friendWeights[a.key] ?? 0;
    const wb = friendWeights[b.key] ?? 0;
    if (wa === wb) return a.key.localeCompare(b.key);
    return wa - wb;
  });
});

const handleFolderClick = (folder: string) => {
  const selected = selectedFolders.value;

  if (multiSelect) {
    selectedFolders.value = selected.includes(folder)
      ? selected.filter((f) => f !== folder)
      : [...selected, folder];
  } else {
    selectedFolders.value = selected[0] === folder ? [] : [folder];
  }

  const url = new URL(window.location.href);
  url.searchParams.delete("folder");
  selectedFolders.value.forEach((f) => url.searchParams.append("folder", f));
  window.history.pushState({}, "", url);
};


  const handleClick = () => {

    const url = `/add-link`;
    
    // 当前窗口跳转
    window.location.href = url;
    
    // 或者在新标签页打开
    // window.open(url, '_blank');
  }
</script>

<div class="allFriend">
  <h1 class="year">{{ globalConfig.lang.friends }}</h1>
  <ClientOnly>
    <div class="friend-content">
      <div class="tags">
        <TagChip
          class="hide-phone add-link"
          :label="globalConfig.lang.addLink"
          green=true
          v-if="globalConfig.features.allowWorkflowAddFriendLink"
          @click="handleClick"
          @mouseenter="handleMouseEnter"
          @mousemove="handleMouseMove"
          @mouseleave="handleMouseLeave"
        >
        <template #icon>
          <Icon :icon="globalConfig.icon.add" />
        </template>
        </TagChip>
        <TagChip
          v-for="folder in folders"
          :key="folder"
          :label="folder"
          :count="folderCounts[folder]"
          :active="selectedFolders.includes(folder)"
          @click="handleFolderClick(folder)"
          @mouseenter="handleMouseEnter"
          @mousemove="handleMouseMove"
          @mouseleave="handleMouseLeave"
        />
      </div>
      <div v-for="group in groupedFriends" :key="group.key" style="margin-bottom: 32px;">
        <h1 class="year">{{ group.key }}</h1>
        <div class="friends-grid">
          <div
            v-for="(col, colIndex) in group.columns"
            :key="colIndex"
            class="column"
          >
            <div v-for="friend in col" :key="friend.link" class="friend-card">
              <FriendCard
                :title="friend.title"
                :link="friend.link"
                :desc="friend.desc"
                :img="friend.folder === 'unable' ? defaultImg : (friend.img ?? defaultImg)"
                :folder="friend.folder"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </ClientOnly>
</div>

<style scoped>
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--vp-gap);
  margin-bottom: 30px;
}
.friends-grid {
  display: flex;
  gap: var(--vp-gap);
}
.column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--vp-gap);
}

@media (max-width: 767px) {
  .hide-phone {
    display: none !important;
  }
}
</style>
