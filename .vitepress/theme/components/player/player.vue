<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick, h } from "vue";
// prepared
import { globalConfig } from "#config";

interface PlayerProps {
  id: string;
}

const props = withDefaults(defineProps<PlayerProps>(), {
  id: "",
});

// vars
const currentId = ref(props.id);
const api = globalConfig.netease.metingApi;
const list = globalConfig.netease.musicList;
const autoplay = globalConfig.netease.autoplay ?? true;
// 支持从配置中读取歌单 id 列表（兼容字符串 id 数组 或 对象数组 { id: ... }）
async function getListIds(){
  try {
    const date = await fetch(`${api}/?type=playlist&id=${list}`)
    return Array.isArray(date)
      ? date.map((it: any) => (typeof it === "string" ? it : it.url.match(/\d+$/)?.[0] || ""))
      : [];
  } catch (e) {
    console.error("getListIds失败:", e);
    return [];
  }
};
// 如果配置是歌单 id（非数组），则获取歌单曲目
const playlistTracks = ref<SongData[]>([]);

const loadPlaylist = async () => {
  try {
    if (Array.isArray(list) && list.length > 0) {
      // 支持直接在配置中写入完整曲目列表或 id 列表
      playlistTracks.value = list.map((it: any) =>
        typeof it === "string" ? ({ id: it } as SongData) : it,
      );
    } else if (list) {
      const res = await fetch(`${api}/?type=playlist&id=${list}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        playlistTracks.value = data;
      }
    }
  } catch (e) {
    console.error("加载歌单失败:", e);
  }
};

// Interfaces
interface SongData {
  name: string;
  artist: string;
  url: string;
  pic: string;
  lrc: string;
  id?: string;
}

interface LyricLine {
  time: number;
  text: string;
  pairlyric?: string;
  romanizationslyric?: string;
  etext: { Duration: number; start: number; end: number; text: string }[];
}

// State
let maindate: any;
const song = ref<SongData | null>(null);
const lyrics = ref<LyricLine[]>([]);
const isLoading = ref(true);

// Audio & Playback State
const audioRef = ref<HTMLAudioElement | null>(null);
const lyricsContainerRef = ref<HTMLElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);

const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const isTrial = ref(false); // 30秒试听标记

// 音频可视化相关变量
let audioContext: (AudioContext & { close?: () => void }) | null = null;
let analyser: AnalyserNode | null = null;
let sourceNode: MediaElementAudioSourceNode | null = null;
let bufferLength = 0;
let dataArray: Uint8Array | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let visualizerFrameId = 0;

async function YrcToJson(musicid: string, meta: any) {
  function prpdl(yrc: any, timesec: number) {
    const timeTagRegex = /\[(\d+):(\d+)(?:[.:](\d+))?\](.*)/;
    let pairif = false;
    let romaif = false;
    let pairtext = "";
    let min_pairtime = 1;
    let min_romatime = 1;
    if (yrc.tlyric.lyric) {
      const pairlyrics = yrc.tlyric.lyric
        .split("\n")
        .filter((item: string) => timeTagRegex.test(item));
      for (let i = 0; i < pairlyrics.length; i++) {
        let lyricMatch = pairlyrics[i].match(timeTagRegex);
        if (!lyricMatch) continue;
        let text = lyricMatch[4];
        const decimal = lyricMatch[3]
          ? lyricMatch[3].toString().length === 2
            ? parseInt(lyricMatch[3]) / 100
            : parseInt(lyricMatch[3]) / 1000
          : 0;
        let timesecp =
          parseInt(lyricMatch[1]) * 60 + parseInt(lyricMatch[2]) + decimal;
        if (min_pairtime > Math.abs(timesec - timesecp)) {
          min_pairtime = Math.abs(timesec - timesecp);
          pairtext = text.replace("//", "");
        }
      }
      pairif = true;
    }
    let romatext = "";
    if (yrc.romalrc.lyric) {
      const romalyrics = yrc.romalrc.lyric
        .split("\n")
        .filter((item: string) => timeTagRegex.test(item));
      for (let i = 0; i < romalyrics.length; i++) {
        let lyricMatch = romalyrics[i].match(timeTagRegex);
        if (!lyricMatch) continue;
        let text = lyricMatch[4];
        const decimal = lyricMatch[3]
          ? lyricMatch[3].toString().length === 2
            ? parseInt(lyricMatch[3]) / 100
            : parseInt(lyricMatch[3]) / 1000
          : 0;
        let timesecp =
          parseInt(lyricMatch[1]) * 60 + parseInt(lyricMatch[2]) + decimal;
        if (min_romatime > Math.abs(timesec - timesecp)) {
          min_romatime = Math.abs(timesec - timesecp);
          romatext = text;
        }
      }
      romaif = true;
    }
    return { pairtext, pairif, romatext, romaif };
  }
  const timeTagRegex = /\[(\d+):(\d+)(?:[.:](\d+))?\](.*)/;
  const zqTagRegex = /\[(\d+),(\d+)?\](.*)/;
  const regex = /\((\d+),(\d+),(\d+)\)(.*?)(?=\(\d+,\d+,\d+\)|$)/g;
  const response = await fetch(
    `https://cors.emnasop.cn/api/lyric?id=${musicid}`,
  );
  //暂时的cors代理
  console.log(response);
  const datae = await response.json();
  console.log(datae);
  const yrc = datae;
  let json: any = {
    metadata: { zq: false, m: 2, CLXIIIid: "", nolyric: true },
    lyrics: [],
  };
  if (!yrc.yrc && !yrc.tlyric) {
    //没有歌词（大概率纯音乐）
    json.metadata.CLXIIIid = musicid;
    json.metadata.nolyric = true;
    return json;
  }
  let pdjg = { pairtext: "", pairif: false, romatext: "", romaif: false };
  if (yrc.yrc && yrc.yrc.lyric) {
    yrc.yrc.lyric = yrc.yrc.lyric.replace(/^\uFEFF/, "");
    const lyrics = yrc.yrc.lyric.split("\n");
    for (const lyric of lyrics) {
      let lyricMatch = lyric.match(zqTagRegex);
      let text;
      let timesec;
      if (!lyricMatch) continue;
      text = lyricMatch[3];
      timesec = lyricMatch[1] / 1000;
      let eljson = [];
      if (text.includes("(") && text.includes(")")) {
        let ttt;
        while ((ttt = regex.exec(lyric)) !== null) {
          const Duration = parseInt(ttt[2]) / 1000;
          const start = parseInt(ttt[1]) / 1000;
          const totalSecondsEnd = (parseInt(ttt[1]) + parseInt(ttt[2])) / 1000;
          const texte = ttt[4];
          eljson.push({
            Duration: Duration,
            start: start,
            end: totalSecondsEnd,
            text: texte,
          });
        }
        if (eljson[eljson.length - 1].text == "&nbsp;") eljson.pop();
        json.metadata.zq = eljson.length > 0;
      }
      text = text.replace(/\(\d+,\d+,\d+\)/g, "");
      pdjg = prpdl(yrc, timesec);
      json.lyrics.push({
        time: timesec,
        text: text,
        etext: eljson,
        pairlyric: pdjg.pairtext,
        romanizationslyric: pdjg.romatext,
      });
    }
  } else if (yrc.lrc.lyric) {
    //没有逐字/词歌词
    let lyrics = yrc.lrc.lyric
      .split("\n")
      .filter((item: string) => timeTagRegex.test(item));
    for (const lyric of lyrics) {
      let lyricMatch = lyric.match(timeTagRegex);
      const decimal = lyricMatch[3]
        ? lyricMatch[3].toString().length === 2
          ? parseInt(lyricMatch[3]) / 100
          : parseInt(lyricMatch[3]) / 1000
        : 0;
      let timesec =
        parseInt(lyricMatch[1]) * 60 + parseInt(lyricMatch[2]) + decimal;
      pdjg = prpdl(yrc, timesec);
      json.lyrics.push({
        time: timesec,
        text: lyricMatch[4],
        pairlyric: pdjg.pairtext,
        romanizationslyric: pdjg.romatext,
      });
    }
  } else {
    json.metadata.nolyric = true;
  }
  json.metadata.nolyric = json.lyrics.length === 0;
  json.metadata.CLXIIIid = musicid;
  json.metadata.ti = meta.name;
  json.metadata.ar = meta.artist;
  json.metadata.roma = pdjg.romaif;
  json.metadata.pair = pdjg.pairif;
  console.log(json);
  return json;
}

// 判断是否为纯音乐/无歌词
const hasLyrics = computed(() => {
  if (lyrics.value.length === 0) return false;
  const fullText = lyrics.value.map((l) => l.text).join(" ");
  return !fullText.includes("纯音乐") && !fullText.includes("请欣赏");
});

// 获取数据
const fetchMusicData = async () => {
  try {
    isLoading.value = true;
    // 优先使用已加载的歌单数据（playlist API 返回的对象已包含 url/pic/lrc 等）
    if (playlistTracks.value.length > 0) {
      console.log(playlistTracks.value);
      const track = playlistTracks.value.find(
        (t) => String(t.id) === String(currentId.value),
      );
      if (track) {
        song.value = track as SongData;
        maindate = await YrcToJson(currentId.value, song.value);
        lyrics.value = maindate.lyrics;
        mediaSession()
        return;
      }
    }

    // 回退到单曲查询
    const res = await fetch(`${api}/?type=song&id=${currentId.value}`);
    const data = await res.json();

    if (Array.isArray(data) && data.length > 0) {
      song.value = data[0];
      maindate = await YrcToJson(currentId.value, song.value);
      lyrics.value = maindate.lyrics;
      mediaSession()
    }
  } catch (error) {
    console.error("获取音乐数据失败:", error);
  } finally {
    isLoading.value = false;
  }
};
function mediaSession() {
  if ("mediaSession" in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: song.value?.name || "Unknown Title",
      artist: song.value?.artist || "Unknown Artist",
      //album: song.value?.album || "Unknown Album", 部分meting接口没有返回专辑信息，暂不使用
      artwork: [
      {
        src: song.value?.pic || "",
        sizes: "1400x1400",
        type: "image/jpeg"
      }
      ]
    });
  }
}
// 播放控制
const togglePlay = () => {
  if (!audioRef.value) return;

  if (isPlaying.value) {
    audioRef.value.pause();
  } else {
    audioRef.value.play();
  }
  isPlaying.value = !isPlaying.value;
};

const tryAutoplay = async () => {
  if (!audioRef.value || !autoplay) return;
  try {
    await audioRef.value.play();
    isPlaying.value = true;
  } catch (error) {
    isPlaying.value = false;
  }
};

function onTimeUpdate() {
  if (audioRef.value) {
    currentTime.value = audioRef.value.currentTime;
  }
  requestAnimationFrame(() => onTimeUpdate());
}

const onLoadedMetadata = async () => {
  if (audioRef.value) {
    duration.value = audioRef.value.duration;
    // 如果音频长度<=61秒，判定为试听版 (部分VIP歌曲 Meting 只返回 60s)
    if (duration.value <= 61) {
      isTrial.value = true;
    }
    await tryAutoplay();
    draw();
  }
};

const onAudioEnded = () => {
  currentTime.value = 0;
  isPlaying.value = false;
  const playlistLength =
    playlistTracks.value.length > 0
      ? playlistTracks.value.length
      : getListIds().length;
  if (playlistLength > 1) {
    nextSong();
  }
};

// 进度条交互
const seekAudio = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const time = parseFloat(target.value);
  if (audioRef.value) {
    audioRef.value.currentTime = time;
    currentTime.value = time;
  }
};

// 计算当前高亮的歌词索引
const currentLyricIndex = computed(() => {
  if (lyrics.value.length === 0) return -1;
  for (let i = lyrics.value.length - 1; i >= 0; i--) {
    if (currentTime.value >= lyrics.value[i].time) {
      return i;
    }
  }
  return 0;
});
function document_title_change() {
  const main_title = `${song.value?.name || "Unknown Title"} - ${song.value?.artist || "Unknown Artist"} | ${globalConfig.author}'s Music Player`;
	if (document.hidden == true && audioRef.value && !audioRef.value.paused) {
		if(currentLyricIndex.value !== -1 && document.title !== lyrics.value[currentLyricIndex.value].text){
			document.title = lyrics.value[currentLyricIndex.value].text;
		}
	}else if (document.title !== main_title){
		document.title = main_title;
	}
}
let activeEl: HTMLElement | null = null;
// 监听当前歌词索引的变化，平滑滚动
watch(currentLyricIndex, async (newIndex) => {
  if (newIndex !== -1 && lyricsContainerRef.value) {
    console.log(dataArray)
    await nextTick();
    const container = lyricsContainerRef.value;
    activeEl = container.querySelector(".lyric-line.active") as HTMLElement;
    if (activeEl) {
      const offsetTop = activeEl.offsetTop;
      const scrollPosition =
        offsetTop - container.clientHeight / 2 + activeEl.clientHeight / 2;

      container.scrollTo({
        top: Math.max(0, scrollPosition),
        behavior: "smooth",
      });

      if (!isPlaying.value) {
        togglePlay();
      }
    }
  }
});

const formatTime = (time: number) => {
  if (isNaN(time)) return "00:00";
  const m = Math.floor(time / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(time % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
};

// 切歌相关逻辑
const findCurrentIndex = async () => {
  if (playlistTracks.value.length > 0) {
    const date = playlistTracks.value.findIndex(
      (t) => String(t.url.match(/\d+$/)) == String(currentId.value),
    )
    if(date !== -1){
      return date;
    }
  }
  const ids = await getListIds();
  return ids.indexOf(String(currentId.value));
};

const playAtIndex = async (index: number) => {
  console.log("请求切歌，目标索引:", index);
  // 如果使用 playlist API 返回的曲目列表，直接从中切换以避免重复请求
  if (playlistTracks.value.length > 0) {
    const safeIndex =
      (index + playlistTracks.value.length) % playlistTracks.value.length;
    currentId.value = playlistTracks.value[safeIndex].url.match(/\d+$/)?.[0] || currentId.value;
    console.log("切换到歌单中的歌曲，ID:", currentId.value);
    await fetchMusicData();
    await nextTick();
    history.pushState(null, '', '/player?id=' + currentId.value);
    if (audioRef.value) {
      try {
        await audioRef.value.play();
        isPlaying.value = true;
      } catch (e) {
        isPlaying.value = false;
      }
    }
    return;
  }

  const ids = getListIds();
  if (ids.length === 0) return;
  const safeIndex = (index + ids.length) % ids.length;
  currentId.value = ids[safeIndex];
  await fetchMusicData();
  await nextTick();
  if (audioRef.value) {
    try {
      await audioRef.value.play();
      isPlaying.value = true;
    } catch (e) {
      isPlaying.value = false;
    }
  }
};

const prevSong = async () => {
  const idx = await findCurrentIndex();
  if (idx === -1) return;
  playAtIndex(idx - 1);
};

const nextSong = async () => {
  const idx = await findCurrentIndex();
  if (idx === -1) return;
  playAtIndex(idx + 1);
};
let visualizerInitialized = false;
watch(() => song.value?.url, async () => {
  // 断开旧连接
  if (sourceNode) {
    sourceNode.disconnect();
    sourceNode = null;
  }
  visualizerInitialized = false;
  analyser = null;
  await nextTick();
  draw();
});

function draw() {
  if (!audioRef.value || !canvasRef.value) {
    setTimeout(() => draw(), 500);
    return;
  }
  if (!visualizerInitialized) {
    audioContext = new window.AudioContext();
    sourceNode = audioContext.createMediaElementSource(audioRef.value);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    sourceNode.connect(analyser);
    analyser.connect(audioContext.destination);
    visualizerInitialized = true;
  } else {
    if (!analyser && audioContext) {
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      sourceNode && sourceNode.connect(analyser);
      analyser.connect(audioContext.destination);
    }
  }
  ctx = canvasRef.value.getContext("2d");
  canvasRef.value.width = window.innerWidth;
  if (!ctx || !analyser) return;
  bufferLength = analyser.frequencyBinCount;
  dataArray = new (window.Uint8Array as { new(length: number): Uint8Array })(bufferLength);
  function a_draw() {
    if (!audioRef.value || !canvasRef.value || !ctx || !analyser || !dataArray) return;
    let barWidth = (canvasRef.value.width / bufferLength) * 1.5;
    analyser.getByteFrequencyData(dataArray);
    barWidth = 25;
    ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
    let barHeight;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i]/2.7;
      ctx.fillStyle = "white";
      ctx.fillRect(x, canvasRef.value.height - barHeight, barWidth, barHeight);
      x += barWidth + 1;
    }
    requestAnimationFrame(a_draw);
  }
  a_draw();
}

// 每次音频切换都重新初始化可视化
watch(() => song.value?.url, () => {
  nextTick(() => draw());
});

// 组件挂载时初始化
onMounted(() => {
  loadPlaylist().then(() => fetchMusicData());
  setTimeout(() => draw(), 500);
});
onTimeUpdate();
</script>

<template>
  <!-- 核心修改 1: 容器加入 am-no-lyrics 状态支持居中 -->
  <div
    class="am-player-wrapper"
    :class="{ 'am-no-lyrics': !hasLyrics, 'mobile-hide-lyrics': true }"
    v-if="!isLoading && song"
  >
    <!-- 模糊背景 -->
    <div class="am-bg" :style="{ backgroundImage: `url(${song.pic})` }"></div>
    <div class="am-glass-overlay"></div>

    <div class="am-content">
      <!-- 左侧：封面与控制面板 -->
      <div class="am-control-panel">
        <div class="am-info">
          <h2 class="am-title">
            {{ song.name }}
            <badge type="warning" v-if="isTrial">
              {{ globalConfig.lang.trial }}</badge
            >
          </h2>
          <p class="am-artist">{{ song.artist }}</p>
        </div>

        <div class="am-cover-wrapper" :class="{ 'is-playing': isPlaying }">
          <img
            :src="song.pic"
            alt="Album Cover"
            class="am-cover"
            @click="togglePlay"
          />
        </div>

        <div class="am-progress-container">
          <span class="am-time">{{ formatTime(currentTime) }}</span>
          <input
            type="range"
            class="am-progress-bar"
            :min="0"
            :max="duration || 100"
            :value="currentTime"
            @input="seekAudio"
          />
          <span class="am-time">{{ formatTime(duration) }}</span>
        </div>
        <div class="am-control-button-container">
          <button class="am-control-button" @click="prevSong">
            <icon :icon="globalConfig.icon.previous_song" />
          </button>
          <button class="am-control-button" @click="togglePlay">
            <icon :icon="globalConfig.icon.stop" v-if="isPlaying" />
            <icon :icon="globalConfig.icon.play" v-else />
          </button>
          <button class="am-control-button" @click="nextSong">
            <icon :icon="globalConfig.icon.next_song" />
          </button>
        </div>

        <!-- crossorigin 属性必须存在，否则 Web Audio 无法提取跨域音频数据 -->
        <audio
          v-show="song"
          ref="audioRef"
          :src="song.url"
          :autoplay="autoplay"
          crossorigin="anonymous"
          @loadedmetadata="onLoadedMetadata"
          @ended="onAudioEnded"
        ></audio>
      </div>

      <!-- 右侧：歌词面板 -->
      <!-- 核心修改 3: 当纯音乐时隐藏面板 -->
      <div class="am-lyrics-panel" ref="lyricsContainerRef" v-if="hasLyrics">
        <div class="am-lyrics-pad"></div>
        <div
          v-for="(line, index) in lyrics"
          :key="index"
          class="lyric-line"
          :class="{ active: index === currentLyricIndex }"
          @click="seekAudio({ target: { value: line.time } } as any)"
        >
          <span
            v-if="
              index === currentLyricIndex && line.etext && maindate.metadata.zq
            "
            class="lrc-original"
          >
            <span
              v-for="(seg, segIdx) in line.etext"
              :key="segIdx"
              :style="{
                '--progress':
                  currentTime >= seg.start && currentTime <= seg.end
                    ? ((currentTime - seg.start) / seg.Duration) * 100 + '%'
                    : currentTime > seg.end
                      ? '100%'
                      : '0%',
              }"
              >{{ seg.text }}</span
            >
          </span>
          <span v-else-if="index < currentLyricIndex" class="lrc-original-passed">
            {{ line.text }}
          </span>
          <span v-else class="lrc-original">{{ line.text }}</span>
          <span v-if="line.romanizationslyric" class="lrc-roman">{{
            line.romanizationslyric
          }}</span>
          <span v-if="line.pairlyric" class="lrc-translate">{{
            line.pairlyric
          }}</span>
        </div>
        <div class="am-lyrics-pad"></div>
      </div>
      <canvas ref="canvasRef" class="am-visualizer" width="100%" height="150"></canvas>
    </div>
  </div>
</template>
<style scoped>
/* 核心修改 1: 控制高度在一屏以内 */
.am-player-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
  font-family: var(--vp-font-family-base);
  height: 100vh; /* 使用 clamp 限制最大最小高度 */
  display: flex;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.am-bg {
  position: absolute;
  inset: -20px;
  background-size: cover;
  background-position: center;
  filter: blur(40px) brightness(0.8);
  transform: scale(1.1);
  z-index: 0;
}

.am-glass-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(30px) saturate(180%);
  -webkit-backdrop-filter: blur(25px) saturate(180%);
  background: rgba(0, 0, 0, 0.4);
  z-index: 1;
}

.am-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  padding: clamp(1.5rem, 4vw, 3rem);
  gap: clamp(2rem, 5vw, 4rem);
}

/* 核心修改 3: 纯音乐时的居中布局 */
.am-no-lyrics .am-content {
  justify-content: center;
  align-items: center;
}
.am-no-lyrics .am-control-panel {
  flex: none;
  width: 100%;
  max-width: 450px; /* 居中时限制最大宽度让排版好看 */
}

/* 左侧面板 */
.am-control-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 250px;
  height: 100%;
}

.am-cover-wrapper {
  position: relative;
  width: clamp(200px, 100%, 320px);
  aspect-ratio: 1 / 1;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
  transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  transform: scale(0.95);
  background: #000;
}

.am-cover-wrapper.is-playing {
  transform: scale(1);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
}

.am-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
  position: relative;
}

/* 核心修改 4: 频谱动画层 */
.am-visualizer {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 30%;
  z-index: -1;
  opacity: 0.8;
  /* 底部淡出边缘效果 */
  mask-image: linear-gradient(to top, rgba(0, 0, 0, 1) 0%, transparent 100%);
  -webkit-mask-image: linear-gradient(
    to top,
    rgba(0, 0, 0, 1) 0%,
    transparent 100%
  );
}

.am-info {
  margin-bottom: calc(var(--vp-gap) * 2);
  text-align: center;
  width: 100%;
}

.am-title {
  font-size: clamp(1.2rem, 3vw, 1.5rem);
  font-weight: 700;
  margin: 0 !important;
  color: #fff;
  border: none;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.am-artist {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.75);
  margin-top: 0.5rem;
}

/* 进度条与控制台 */
.am-progress-container {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 320px;
  gap: 1rem;
  margin-top: calc(var(--vp-gap) * 2);
}
.am-control-button-container{
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 320px;
  gap: 1rem;
}
.am-control-button{
  background: transparent;
  border: none;
  font-size: 30px;
}
.am-time {
  font-size: 0.8rem;
  font-variant-numeric: tabular-nums;
  color: rgba(255, 255, 255, 0.7);
}

.am-progress-bar {
  flex: 1;
  height: 6px;
  -webkit-appearance: none;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}

.am-progress-bar::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  transition: transform 0.1s;
}

.am-progress-bar:active::-webkit-slider-thumb {
  transform: scale(1.3);
}

.am-controls {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.am-btn-play {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.am-btn-play:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(1.05);
}

.am-btn-play svg {
  width: 28px;
  height: 28px;
}

.am-btn-prev,
.am-btn-next {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 0.75rem;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.am-btn-prev svg,
.am-btn-next svg {
  width: 20px;
  height: 20px;
}

/* 30秒试听限制提示 */
.am-trial-notice {
  margin-top: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #ffcc00;
  background: rgba(0, 0, 0, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  backdrop-filter: blur(5px);
}

/* 右侧歌词面板 */
.am-lyrics-panel {
  flex: 1.2;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding-right: 1rem;
  height: 100%; /* 继承外层 clamp 高度 */
  -webkit-mask-image: linear-gradient(
    180deg,
    transparent 0%,
    #000 15%,
    #000 85%,
    transparent 100%
  );
  mask-image: linear-gradient(
    180deg,
    transparent 0%,
    #000 15%,
    #000 85%,
    transparent 100%
  );
}

.am-lyrics-panel::-webkit-scrollbar {
  display: none;
}

.am-lyrics-pad {
  min-height: 45%;
}

.lyric-line {
  display: flex;
  flex-direction: column;
  margin: 1rem 0;
  transform-origin: left center;
  transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
  cursor: pointer;
  filter: blur(1px);
}

/* 核心修改 5: 歌词与翻译文字排版 */
.lrc-original {
  font-size: clamp(1.2rem, 3vw, 1.8rem);
  font-weight: 700;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.3);
  transition: color 0.5s ease;
}
.lrc-original span {
  display: inline-block;
  background: linear-gradient(
    to right,
    #ffffff var(--progress, 0%),
    rgba(255, 255, 255, 0.6) var(--progress, 0%)
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  transition: --progress 0.1s ease;
  white-space: normal;
}
.lrc-original-passed {
  font-size: clamp(1.2rem, 3vw, 1.8rem);
  font-weight: 700;
  line-height: 1.4;
  color: #cccccc;
  transition: color 0.5s ease;
}
.lrc-translate {
  font-size: clamp(0.85rem, 1.5vw, 1.1rem);
  font-weight: 500;
  line-height: 1.4;
  margin-top: 0.4rem;
  color: rgba(255, 255, 255, 0.2);
  transition: color 0.5s ease;
}
.lrc-roman {
  font-weight: 500;
  font-size: 10px;
  margin: 0rem;
  color: rgba(255, 255, 255, 0.6);
  transition: color 0.5s ease;
}

.lyric-line:hover .lrc-original {
  color: rgba(255, 255, 255, 0.6);
}

.lyric-line.active {
  filter: blur(0);
  transform: scale(1.05);
}

.lyric-line.active .lrc-original {
  color: #ffffff;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.lyric-line.active .lrc-translate {
  color: rgba(255, 255, 255, 0.7);
}

.am-loading {
  text-align: center;
  padding: 4rem;
  color: var(--vp-c-text-2);
}

@media (max-width: 768px) {
  .am-player-wrapper {
    height: auto;
    min-height: 100vh;
    align-items: center;
  }

  .am-content {
    flex-direction: column;
    padding: 1.5rem;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - var(--vp-nav-height));
  }

  .am-lyrics-panel {
    height: 400px;
    -webkit-mask-image: linear-gradient(
      180deg,
      transparent 0%,
      #000 10%,
      #000 90%,
      transparent 100%
    );
  }

  .lyric-line {
    text-align: center;
    transform-origin: center center;
  }

  .mobile-hide-lyrics .am-lyrics-panel {
    display: none !important;
  }

  /* 隐藏后让封面内容居中 */
  .mobile-hide-lyrics .am-content {
    justify-content: center !important;
    align-items: center !important;
  }

  /* 确保控制面板在居中时占满宽度 */
  .mobile-hide-lyrics .am-control-panel {
    width: 100% !important;
    max-width: 400px !important;
    margin-top: auto;
    margin-bottom: auto;
  }
}
</style>
