---
layout: home
footer: false
---

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import { generateGrid } from "#theme/utils/generateGrid";
import { columnCount, updateColumns } from "#theme/utils/dynamicColumns";
import { useCardHover } from "#theme/utils/useCardHover";
import { globalConfig } from "#config";

const friendWeights: Record<string, number> = globalConfig.friendWeights;
const multiSelect = globalConfig.multiSelect;

const defaultImg = "https://pic2.zhimg.com/50/v2-cc1a32fcb444fc9d5e23f2ee078dc6e1_720w.jpg?source=1940ef5c";

const { friends } = globalConfig;

const { handleMouseMove, handleMouseEnter, handleMouseLeave } = useCardHover();

const selectedFolders = ref<string[]>([]);
const showSiteInfo = ref(false);

const siteInfo = {
  name: globalConfig.author,
  avatar: globalConfig.homePage.avatar,
  desc: globalConfig.description,
  link: globalConfig.url,
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
    if (!isUnable(folder)) set.add(folder);
  });
  return Array.from(set).sort((a, b) => {
    const wa = friendWeights[a] ?? 0;
    const wb = friendWeights[b] ?? 0;
    if (wa === wb) return a.localeCompare(b);
    return wa - wb;
  });
});

const groupedFriends = computed(() => {
  const selected = selectedFolders.value.map((f) => f.toLowerCase());
  const filtered = friends.filter((friend) => {
    if (!selected.length) return true;
    return selected.includes((friend.folder ?? "friends").toLowerCase());
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
</script>

<div class="allFriend">
  <h1 class="year">{{ globalConfig.lang.friends }}</h1>
  <ClientOnly>
    <div class="friend-content">
      <div class="tags">
        <TagChip
          class="hide-phone"
          :label="globalConfig.lang.siteInfo"
          :active="showSiteInfo"
          @click="toggleSiteInfo"
          @mouseenter="handleMouseEnter"
          @mousemove="handleMouseMove"
          @mouseleave="handleMouseLeave"
        >
        <template #icon>
          <Icon :icon="globalConfig.icon.info" />
        </template>
        </TagChip>
        <TagChip
          v-for="folder in folders"
          :key="folder"
          :label="folder"
          :active="selectedFolders.includes(folder)"
          @click="handleFolderClick(folder)"
          @mouseenter="handleMouseEnter"
          @mousemove="handleMouseMove"
          @mouseleave="handleMouseLeave"
        />
      </div>
      <div v-if="showSiteInfo" class="site-info-card" 
          @mouseenter="handleMouseEnter"
          @mousemove="handleMouseMove"
          @mouseleave="handleMouseLeave">
        <img :src="siteInfo.avatar" :alt="siteInfo.name" class="site-info-avatar" />
        <div class="site-info-body">
          <a :href="siteInfo.link" target="_blank" rel="noopener" class="site-info-link">
            {{ siteInfo.link }}
          </a>
          <span class="site-info-name">{{ siteInfo.name }}</span>
          <span class="site-info-desc">{{ siteInfo.desc }}</span>
        </div>
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
.site-info-card {
  display: flex;
  align-items: center;
  gap: calc(var(--vp-gap) *2);
  padding: 25px;
  margin-bottom: 30px;
  border: 1px solid var(--vp-c-divider);
  border-radius: var(--vp-border-radius-1);
  background-color: var(--vp-c-bg);
  box-shadow: var(--vp-shadow);
  transition: all var(--vp-transition-time);
}
.site-info-card:hover {
  border-color: var(--vp-c-brand-2);
  box-shadow: var(--vp-shadow-brand);
}
.site-info-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
.site-info-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  * {
    user-select:text !important;
  }
}
.site-info-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.site-info-desc {
  font-size: 14px;
  color: var(--vp-c-text-2);
}
.site-info-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--vp-c-text-3);
  opacity: 0.8;
  transition: all var(--vp-transition-time);
}
.site-info-link:hover {
  color: var(--vp-c-brand-1);
  opacity: 1;
}

@media (max-width: 767px) {
  .hide-phone {
    display: none !important;
  }
}
</style>
