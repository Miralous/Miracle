---
layout: home
footer: false
---

<script setup lang="ts">
import { ref, onMounted, computed, onBeforeUnmount, nextTick } from 'vue';
import { generateGrid } from "#theme/utils/generateGrid";
import { columnCount, updateColumns } from "#theme/utils/dynamicColumns";
import { globalConfig } from "#config";

const playlist = ref<any[]>([]);
const selectedSinger = ref<string | null>(null);

// 默认图片
const defaultImg = "https://pic2.zhimg.com/50/v2-cc1a32fcb444fc9d5e23f2ee078dc6e1_720w.jpg?source=1940ef5c";

onMounted(async () => {
  // 初始化选中标签（刷新页面时保持状态）
  const urlParams = new URLSearchParams(window.location.search);
  const singerFromUrl = urlParams.get("singer")?.trim();
  if (singerFromUrl) selectedSinger.value = singerFromUrl;

  // 获取歌单数据
  try {
    const response = await fetch(`${globalConfig.netease.metingApi}/?type=playlist&id=${globalConfig.netease.musicList}`);
    const data = await response.json();
    playlist.value = data;
    console.log('歌单数据:', playlist.value);
  } catch (error) {
    console.error('获取歌单失败:', error);
  }

  updateColumns();
  window.addEventListener("resize", updateColumns);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateColumns);
});

// 打乱数组
function shuffle(array: any[]) {
  return array
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

// 🔹 歌手标签列表（随机显示 20 个）
const singers = computed(() => {
  const set = new Set<string>();
  playlist.value.forEach(song => {
    if (song.artist && song.artist.includes('/')) {
      song.artist.split('/').forEach(a => set.add(a.trim()));
    } else {
      set.add(song.artist || "Unknown Artist");
    }
  });

  const allSingers = Array.from(set);
  const shuffled = allSingers
    .map(a => ({ a, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ a }) => a);

    if(globalConfig.netease.musicSlice == 0) {
        return shuffled;
    } else {
  return shuffled.slice(0, globalConfig.netease.musicSlice);

    }
});

const groupedByArtist = computed(() => {
  const filterSinger = selectedSinger.value?.trim().toLowerCase();
  const visibleSingers = singers.value.map(s => s.toLowerCase()); 
  const processedItems: Array<{ artist: string; song: any }> = [];

  playlist.value.forEach(song => {
    if (!song.artist) return;

    // ✨ 核心修正：如果 song 本身没有 id，但是有 url，我们就强行提取并赋值给它
    if (!song.id && song.url) {
      song.id = getSongId(song.url);
    }

    const artists = song.artist.split('/').map(a => a.trim());
    artists.forEach(artist => {
      const artistLower = artist.toLowerCase();

      if (visibleSingers.includes(artistLower)) {
        if (!filterSinger || artistLower === filterSinger) {
          processedItems.push({ artist, song });
        }
      }
    });
  });

  return shuffle(generateGrid(
    processedItems,
    undefined,
    (item) => item.artist,
    columnCount.value
  ));
});



// 🔹 点击标签
const handleSingerClick = (singer: string) => {
  selectedSinger.value = singer || null;

  const url = new URL(window.location.href);
  if (singer) url.searchParams.set("singer", singer);
  else url.searchParams.delete("singer");
  window.history.pushState({}, "", url);
};

import {getSongId} from "#theme/utils/getSongId"
</script>

<h1 class="artist">{{ globalConfig.lang.artists }}</h1>
<div class="tags">
  <TagChip
    @click="handleSingerClick('')"
    :active="!selectedSinger"
    :label="globalConfig.lang.allArtists"
  />
  <TagChip
    v-for="singer in singers"
    :key="singer"
    @click="handleSingerClick(singer)"
    :active="selectedSinger === singer"
    :label="singer"
  />
</div>

<div class="allSongs">
  <ClientOnly>
    <div v-for="group in groupedByArtist" :key="group.key" style="margin-bottom: 32px;">
      <h1 class="artist">{{ group.key }}</h1>
      <div class="songs-grid">
        <div
          v-for="(col, colIndex) in group.columns"
          :key="colIndex"
          class="column"
        >
          <div v-for="item in col" :key="item.song.url" class="song-card">
            <FriendCard
              :title="item.song.name"
              :link="'/player?id=' + item.song.id"
              type="square"
              :desc="item.song.artist"
              :img="item.song.pic || defaultImg"
            />
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

.songs-grid {
  display: flex;
  gap: var(--vp-gap);
}
.column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--vp-gap);
}
.artist {
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
