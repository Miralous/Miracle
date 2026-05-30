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
async function getListIds() {
  try {
    const date = await fetch(`${api}/?type=playlist&id=${list}`);
    return Array.isArray(date)
      ? date.map((it: any) =>
          typeof it === "string" ? it : it.url.match(/\d+$/)?.[0] || "",
        )
      : [];
  } catch (e) {
    console.error("getListIds失败:", e);
    return [];
  }
}
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

// 手机版歌词预览
const showMobileLyrics = ref(false);
const mobileLyricsContainerRef = ref<HTMLElement | null>(null);
const isMobile = ref(false);

function toggleMobileLyrics() {
  showMobileLyrics.value = !showMobileLyrics.value;
  // 打开时自动滚动到当前歌词
  if (showMobileLyrics.value) {
    nextTick(() => {
      const container = mobileLyricsContainerRef.value;
      if (!container) return;
      const activeEl = container.querySelector(
        ".mobile-lyric-line.active",
      ) as HTMLElement;
      if (activeEl) {
        container.scrollTo({
          top:
            activeEl.offsetTop -
            container.clientHeight / 2 +
            activeEl.clientHeight / 2,
          behavior: "instant",
        });
      } else {
        // 如果还没渲染出 active，根据 currentLyricIndex 计算
        const lines = container.querySelectorAll(".mobile-lyric-line");
        if (lines.length > 0 && currentLyricIndex.value >= 0) {
          const target = lines[currentLyricIndex.value] as HTMLElement;
          if (target) {
            container.scrollTo({
              top:
                target.offsetTop -
                container.clientHeight / 2 +
                target.clientHeight / 2,
              behavior: "instant",
            });
          }
        }
      }
    });
  }
}

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
      let pairlyrics = yrc.tlyric.lyric
        .split("\n")
        .filter((item: string) => timeTagRegex.test(item));
        if(yrc.ytlrc&&yrc.ytlrc.lyric){
              pairlyrics = yrc.ytlrc.lyric.split("\n").filter((item: string) => timeTagRegex.test(item));
              min_pairtime = 0.01;
        }
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
      let romalyrics = yrc.romalrc.lyric
        .split("\n")
        .filter((item: string) => timeTagRegex.test(item));
        if(yrc.yromalrc&&yrc.yromalrc.lyric){
            romalyrics = yrc.yromalrc.lyric.split("\n").filter((item: string) => timeTagRegex.test(item));
            min_romatime = 0.01;
        }
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
  //暂时的cors代理,原为“https://music.163.com/api/song/lyric?os=pc&id=${musicid}&yv=-1&tv=-1&rv=-1&lv=-1”
  const datae = await response.json();
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
          const texte = ttt[4].replace(' ','\u00A0');
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
async function QQJsonGET(name: string, artist: string, album: string, yrcjson: any) {
  console.log("正在使用QQ音乐API进行补充查询...");
  function stringSimilarity(a: string, b: string) {
    //vibe coding函数uwu
    const strA = a == null ? '' : String(a);
    const strB = b == null ? '' : String(b);
    const lenA = strA.length, lenB = strB.length;
    // 空串情况
    if (lenA === 0 && lenB === 0) return 1;
    if (lenA === 0 || lenB === 0) return 0;

    // 前一行的编辑距离数组，初始为0..lenB
    let prev = Array.from({ length: lenB + 1 }, (_, i) => i);
    let curr = new Array(lenB + 1);

    for (let i = 1; i <= lenA; i++) {
      curr[0] = i; // 第一列值 = i（删除a的字符数）
      for (let j = 1; j <= lenB; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        // 插入、删除、替换的最小代价
        curr[j] = Math.min(
          curr[j - 1] + 1,   // 插入
          prev[j] + 1,       // 删除
          prev[j - 1] + cost // 替换
        );
      }
      // 交换当前行与前行，复用数组
      [prev, curr] = [curr, prev];
    }

    const distance = prev[lenB]; // 最终编辑距离
    return 1 - distance / Math.max(lenA, lenB);
  }
  let nmed = await fetch(`https://api.vkeys.cn/v2/music/tencent/search/song?word=${encodeURIComponent(name)} ${encodeURIComponent(artist.replace(/\/[^/]*$/, ""))}`)
  let nme = await nmed.json();
  if(!nme.data||!Array.isArray(nme.data)||nme.data.length === 0) {
    console.log("未找到匹配的歌曲，使用原生歌词");
    return;
  }
  let aru = stringSimilarity(nme.data[0].singer,artist)
  let tiu = stringSimilarity(nme.data[0].name,name)
  let alu = stringSimilarity(nme.data[0].album,album)
  if(aru<0.3&&tiu<0.8&&alu<0.3){
    console.log("QQ音乐API查询结果相似度不足，使用原生歌词");
    return {metadata:{zq:false}};
  }
  let datae = await fetch(`https://api.vkeys.cn/v2/music/tencent/lyric?id=${nme.data[0].id}`)
  let dataejson = await datae.json();
  if(!dataejson.data) return;
  let qrc={orig: null, ts: null, roma: null};
  qrc.orig = dataejson.data.yrc
  qrc.ts = dataejson.data.trans
  qrc.roma = dataejson.data.roma
  let qrcjson = QrcToJson(qrc,nme.data[0].id,0)
  if(qrcjson){
    console.log("QQ音乐API查询成功，使用QQ音乐歌词");
    return qrcjson
  }
  return qrcjson
}
function QrcToJson(qrcd: any,id: number, apinu: number){
  let qrc = qrcd;
  const metadataRegex = /^\s*\[([a-zA-Z]+)\s*:\s*(.*?)\]\s*$/;
  const zqTagRegex = /\[(\d+),(\d+)?\](.*)/
  const regex = /(.*?)\((\d+),(\d+)\)/g;
  function prpdlq(qrc: any, timesec: number, apinu: number){
    const timeTagRegex = /\[(\d+):(\d+)(?:[.:](\d+))?\](.*)/;
    const zqTagRegex = /\[(\d+),(\d+)?\](.*)/
    let pairif = false;
    let romaif = false;
    let pairtext = "";
    let min_pairtime = 3;
    let min_romatime = 3;
    if(qrc.ts){
      let pairlyrics;
      let lyricMatch;
      if(apinu===0){
        pairlyrics = qrc.ts.split("\n").filter((item: string) => timeTagRegex.test(item));
      }
      if(apinu===1){
        pairlyrics = qrc.ts.split("\n").filter((item: string) => zqTagRegex.test(item));
      }
      for(let i = 0; i < pairlyrics.length; i++){
        lyricMatch = apinu===0?pairlyrics[i].match(timeTagRegex):pairlyrics[i].match(zqTagRegex);
        if(!lyricMatch) continue;
        let text = apinu===0?lyricMatch[4]:lyricMatch[3]
        const decimal = apinu===0?(lyricMatch[3] ? (lyricMatch[3].toString().length === 2 ? parseInt(lyricMatch[3]) / 100 : parseInt(lyricMatch[1])/1000):0):0
        let timesecp = apinu===0?parseInt(lyricMatch[1]) * 60 + parseInt(lyricMatch[2]) + decimal:lyricMatch[1]/1000
        if(min_pairtime > Math.abs(timesec - timesecp)){
          min_pairtime = Math.abs(timesec - timesecp);
          pairtext = text.replace('//', '');//TX特有的局部无翻译文本的替换字符
        }
      }
      pairif = true;
    }
    let romatext = '';
    if(qrc.roma){
      const romalyrics = qrc.roma.split("\n").filter((item: string) => zqTagRegex.test(item));
      for(let i = 0; i < romalyrics.length; i++){
        let lyricMatch = romalyrics[i].match(zqTagRegex);
        if(!lyricMatch) continue;
        let text = lyricMatch[3].replace(/\([^)]*\)/g, '')
        let timesecp = parseInt(lyricMatch[1])/1000
        if(min_romatime > Math.abs(timesec - timesecp)){
          min_romatime = Math.abs(timesec - timesecp);
          romatext = text;
        }
      }
      romaif = true;
    }
    return {pairtext,pairif,romatext,romaif};
  }
  let json: any={metadata: {zq:false,m:2}, lyrics: [],};
  if(qrc.orig){
    let pdjg;
    qrc.orig = qrc.orig.replace(/^\uFEFF/, '');
    const lyrics = qrc.orig.split("\n");
    for(const lyric of lyrics){
      const metadataMatch = lyric.match(metadataRegex);
      if (metadataMatch) {
        json.metadata[metadataMatch[1].toLowerCase()] = metadataMatch[2].trim();
        continue;
      }
      let lyricMatch = lyric.match(zqTagRegex);
      let text;
      let timesec;
      if(!lyricMatch) continue;
      text = lyricMatch[3]
      timesec = lyricMatch[1] / 1000
      let eljson = [];
      if (text.includes('(') && text.includes(')')) {
        let ttt;
        let i = 0;
        while ((ttt = regex.exec(lyric.replace(/\[.*?\]/g, '')))) {
          const Duration = parseInt(ttt[3]) / 1000
          const start = parseInt(ttt[2]) / 1000
          const totalSecondsEnd = (parseInt(ttt[2])+parseInt(ttt[3]))/1000
          const texte = ttt[1].replace(/ /g, '\u00A0');
          eljson.push({ Duration: Duration, start: start, end: totalSecondsEnd, text: texte });
        }
        json.metadata.zq = eljson.length > 0;
      }
      text = text.replace(/\(\d+,\d+\)/g, '')
      pdjg = prpdlq(qrc, timesec, apinu)
      json.lyrics.push({time: timesec,text: text,etext: eljson,pairlyric: pdjg.pairtext,romanizationslyric: pdjg.romatext})
    }
    json.metadata.nolyric = json.lyrics.length === 0;
    json.metadata.roma = pdjg?pdjg.romaif:false
    json.metadata.pair = pdjg?pdjg.pairif:false
  }else{
    json.metadata.nolyric =true;
    json.metadata.zq = false;
    json.metadata.roma = false;
    json.metadata.pair = false;
  }
  json.metadata.qqmusicid = id;
  console.log(json);
  return json;
}
import { LYRIC_METADATA_KW } from "./words";

// 核心关键词（长词优先，请确保已加入 "单位" 或 "举办单位"）
const sortedKeywords = [...LYRIC_METADATA_KW]
  .sort((a, b) => b.length - a.length)
  .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  .join("|");

// 完美匹配全半角符号及连写的正则
const LYRIC_METADATA_RE = new RegExp(
  "(?:" +
    sortedKeywords +
    ")" +
    // 后缀约束：关键词后面必须跟着以下三种情况之一才删除
    "(?:" +
    // 1. 任意全半角标点符号（包含冒号、斜杠、横杠、等号、括号等）
    "[._\\-—~/:：／＼＝=＝\\[\\]【】()（）《》<>\"规律'`“”+＋,，|｜#&§@×…\\s]+" +
    "|" +
    // 2. 纯空格，且空格后有名字（如：作词 周杰伦）
    "\\s+(?=[^\\s])" +
    "|" +
    // 3. 关键词正好是括号的最后一部分（如：【独白】）
    "(?=[\\s\\]】）)])" +
    ")",
  "i",
);

// 过滤函数
function filterLyricLines(lines) {
  return lines.filter((line) => !LYRIC_METADATA_RE.test(line));
}

function isLyricMetadata(line: string): boolean {
  return LYRIC_METADATA_RE.test(line.trim());
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
      const track = playlistTracks.value.find(
        (t) => String(t.id) === String(currentId.value),
      );
      if (track) {
        song.value = track as SongData;
        maindate = await YrcToJson(currentId.value, song.value);
        maindate.lyrics = maindate.lyrics.filter(
          (l: LyricLine) => !isLyricMetadata(l.text),
        );
        if(!maindate.metadata.zq&&globalConfig.netease.QQMusicLyricsSource){
          const qqdata = await QQJsonGET(song.value.name, song.value.artist, '', maindate);
          if(qqdata&&qqdata.metadata&&qqdata.metadata.zq){
            maindate = qqdata;
          }
        }
        lyrics.value = maindate.lyrics;
        mediaSession();
        return;
      }
    }

    // 回退到单曲查询
    const res = await fetch(`${api}/?type=song&id=${currentId.value}`);
    const data = await res.json();

    if (Array.isArray(data) && data.length > 0) {
      song.value = data[0];
      maindate = await YrcToJson(currentId.value, song.value);
      maindate.lyrics = maindate.lyrics.filter(
        (l: LyricLine) => !isLyricMetadata(l.text),
      );
      if(!maindate.metadata.zq&&globalConfig.netease.QQMusicLyricsSource){
        const qqdata = await QQJsonGET(song.value.name, song.value.artist, '', maindate);
        if(qqdata&&qqdata.metadata&&qqdata.metadata.zq){
          maindate = qqdata;
        }
      }
      lyrics.value = maindate.lyrics;
      mediaSession();
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
          type: "image/jpeg",
        },
      ],
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
    if (
      currentLyricIndex.value !== -1 &&
      document.title !== lyrics.value[currentLyricIndex.value].text
    ) {
      document.title = lyrics.value[currentLyricIndex.value].text;
    }
  } else if (document.title !== main_title) {
    document.title = main_title;
  }
}
let activeEl: HTMLElement | null = null;
// 监听当前歌词索引的变化，平滑滚动
watch(currentLyricIndex, async (newIndex) => {
  if (newIndex !== -1 && lyricsContainerRef.value) {
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
    );
    if (date !== -1) {
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
    currentId.value =
      playlistTracks.value[safeIndex].url.match(/\d+$/)?.[0] || currentId.value;
    console.log("切换到歌单中的歌曲，ID:", currentId.value);
    await fetchMusicData();
    await nextTick();
    history.pushState(null, "", "/player?id=" + currentId.value);
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
watch(
  () => song.value?.url,
  async () => {
    // 断开旧连接
    if (sourceNode) {
      sourceNode.disconnect();
      sourceNode = null;
    }
    visualizerInitialized = false;
    analyser = null;
    await nextTick();
    draw();
  },
);

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
  dataArray = new (window.Uint8Array as { new (length: number): Uint8Array })(
    bufferLength,
  );
  function a_draw() {
    if (!audioRef.value || !canvasRef.value || !ctx || !analyser || !dataArray)
      return;
    let barWidth = (canvasRef.value.width / bufferLength) * 1.5;
    analyser.getByteFrequencyData(dataArray);
    barWidth = 25;
    ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
    let barHeight;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i] / 2.7;
      ctx.fillStyle = "white";
      ctx.fillRect(x, canvasRef.value.height - barHeight, barWidth, barHeight);
      x += barWidth + 1;
    }
    requestAnimationFrame(a_draw);
  }
  a_draw();
}
//键盘监测区
document.addEventListener("keydown", function (event) {
  if (event.key === " ") {
    togglePlay();
  }
});

// 每次音频切换都重新初始化可视化
watch(
  () => song.value?.url,
  () => {
    nextTick(() => draw());
  },
);

// 手机版歌词滚动
watch(currentLyricIndex, async (newIndex) => {
  if (
    newIndex !== -1 &&
    showMobileLyrics.value &&
    mobileLyricsContainerRef.value
  ) {
    await nextTick();
    const container = mobileLyricsContainerRef.value;
    const activeEl = container.querySelector(
      ".mobile-lyric-line.active",
    ) as HTMLElement;
    if (activeEl) {
      const offsetTop = activeEl.offsetTop;
      const scrollPosition =
        offsetTop - container.clientHeight / 2 + activeEl.clientHeight / 2;
      container.scrollTo({
        top: Math.max(0, scrollPosition),
        behavior: "smooth",
      });
    }
  }
});

// 组件挂载时初始化
onMounted(() => {
  isMobile.value = window.innerWidth <= 768;
  window.addEventListener("resize", () => {
    isMobile.value = window.innerWidth <= 768;
  });
  loadPlaylist().then(() => fetchMusicData());
  setTimeout(() => draw(), 500);
  setInterval(document_title_change, 200);
});

onMounted(() => {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") showMobileLyrics.value = false;
  });
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
        <div
          class="am-control-button-container"
          v-if="globalConfig.netease.demoMode"
        >
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
          <span
            v-else-if="index < currentLyricIndex"
            class="lrc-original-passed"
          >
            {{ line.text }}
          </span>
          <span v-else class="lrc-original">{{ line.text }}</span>
          <span
            v-if="line.romanizationslyric && globalConfig.netease.showRoman"
            class="lrc-roman"
            >{{ line.romanizationslyric }}</span
          >
          <span
            v-if="line.pairlyric && globalConfig.netease.showTranslation"
            class="lrc-translate"
            >{{ line.pairlyric }}</span
          >
        </div>
        <div class="am-lyrics-pad"></div>
      </div>
      <canvas
        ref="canvasRef"
        class="am-visualizer"
        width="100%"
        height="150"
        v-if="globalConfig.netease.visualizer"
      ></canvas>
    </div>

    <!-- 手机端歌词按钮 -->
    <button
      class="mobile-lyrics-btn"
      v-if="isMobile && hasLyrics"
      @click="toggleMobileLyrics"
    >
      <icon :icon="globalConfig.icon.musics" />
    </button>

    <!-- 手机端全屏歌词覆盖层（Apple Music 风格） -->
    <Teleport to="body">
      <Transition name="lyrics-fade">
        <div
          class="mobile-lyrics-overlay"
          v-if="showMobileLyrics"
          @click.self="showMobileLyrics = false"
        >
          <!-- 毛玻璃背景：歌曲封面 -->
          <div
            class="mobile-lyrics-bg"
            :style="{ backgroundImage: `url(${song?.pic})` }"
          ></div>
          <div class="mobile-lyrics-glass"></div>

          <!-- 顶部栏 -->
          <div class="mobile-lyrics-header">
            <button
              class="mobile-lyrics-close"
              @click="showMobileLyrics = false"
            >
              <icon :icon="globalConfig.icon.close" :rotate="2" />
            </button>
            <div class="mobile-lyrics-header-info">
              <div class="mobile-lyrics-header-title">{{ song?.name }}</div>
              <div class="mobile-lyrics-header-artist">{{ song?.artist }}</div>
            </div>
            <div class="mobile-lyrics-header-spacer"></div>
          </div>

          <!-- 歌词区域 -->
          <div class="mobile-lyrics-body" ref="mobileLyricsContainerRef">
            <div class="mobile-lyrics-pad"></div>
            <div
              v-for="(line, index) in lyrics"
              :key="'mob-' + index"
              class="mobile-lyric-line"
              :class="{ active: index === currentLyricIndex }"
              @click="seekAudio({ target: { value: line.time } } as any)"
            >
              <span
                v-if="
                  index === currentLyricIndex &&
                  line.etext &&
                  maindate?.metadata?.zq
                "
                class="mobile-lrc-original"
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
                >
                  {{ seg.text }}
                </span>
              </span>
              <span v-else class="mobile-lrc-text">{{ line.text }}</span>
              <span
                v-if="line.pairlyric && globalConfig.netease.showTranslation"
                class="mobile-lrc-translate"
                >{{ line.pairlyric }}</span
              >
              <span
                v-if="line.romanizationslyric && globalConfig.netease.showRoman"
                class="mobile-lrc-roman"
                >{{ line.romanizationslyric }}</span
              >
            </div>
            <div class="mobile-lyrics-pad"></div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
<style scoped>
* {
  user-select: none;
}
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
  height: 20%;
  z-index: -1;
  opacity: 0.5;
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
.am-control-button-container {
  margin-top: calc(var(--vp-gap) * 2);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 320px;
  gap: 2.5rem;
}
.am-control-button {
  background: transparent;
  border: none;
  font-size: 30px;
  transition: all calc(var(--vp-transition-time) * 1.5);
  &:hover {
    scale: 1.07;
  }
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
  filter: blur(2px);
}

/* 核心修改 5: 歌词与翻译文字排版 */
.lrc-original {
  font-size: clamp(1.2rem, 3vw, 1.8rem);
  font-weight: 700 !important;
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
  color: rgba(255, 255, 255, 0.3);
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
  &,
  span {
    font-weight: 700 !important;
  }
}

.lyric-line.active .lrc-original {
  color: #ffffff;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  &,
  span {
    font-weight: 700 !important;
  }
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

  /* 手机端歌词触发按钮（Apple Music 风格） */
  .mobile-lyrics-btn {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 100;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.25);
    color: #fff;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  .mobile-lyrics-btn:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: scale(1.08);
  }

  .mobile-lyrics-btn:active {
    transform: scale(0.95);
  }
}

/* ===== 手机端全屏歌词覆盖层（Apple Music 风格） ===== */
.mobile-lyrics-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.mobile-lyrics-bg {
  position: absolute;
  inset: -30px;
  background-size: cover;
  background-position: center;
  filter: blur(60px) brightness(0.3);
  transform: scale(1.05);
  z-index: 0;
}

.mobile-lyrics-glass {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(40px) saturate(150%);
  -webkit-backdrop-filter: blur(40px) saturate(150%);
  z-index: 1;
}

/* 顶部栏 */
.mobile-lyrics-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  padding: 16px 20px;
  padding-top: max(16px, env(safe-area-inset-top, 16px));
  gap: 16px;
}

.mobile-lyrics-close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  font-size: 22px;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
}

.mobile-lyrics-close:hover {
  opacity: 0.7;
}

.mobile-lyrics-header-info {
  flex: 1;
  min-width: 0;
}

.mobile-lyrics-header-title {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mobile-lyrics-header-artist {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 2px;
}

.mobile-lyrics-header-spacer {
  width: 38px;
}

/* 歌词主体 */
.mobile-lyrics-body {
  position: relative;
  z-index: 2;
  flex: 1;
  overflow-y: auto;
  padding: 0 24px;
  -webkit-mask-image: linear-gradient(
    180deg,
    transparent 0%,
    #000 12%,
    #000 88%,
    transparent 100%
  );
  mask-image: linear-gradient(
    180deg,
    transparent 0%,
    #000 12%,
    #000 88%,
    transparent 100%
  );
}

.mobile-lyrics-body::-webkit-scrollbar {
  display: none;
}

.mobile-lyrics-pad {
  min-height: calc(50vh - 60px);
}

.mobile-lyric-line {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin: 18px 0;
  transition: all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
  cursor: pointer;
  opacity: 0.35;
  filter: blur(1px);
}

.mobile-lyric-line.active {
  opacity: 1;
  filter: blur(0);
  transform: scale(1.04);
}

.mobile-lrc-text {
  font-size: clamp(1.3rem, 4vw, 1.8rem);
  font-weight: 600;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.7);
  transition:
    color 0.5s ease,
    font-weight 0.5s ease;
}

.mobile-lyric-line.active .mobile-lrc-text {
  color: #fff;
  font-weight: 700;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
}

/* 逐词高亮 */
.mobile-lrc-original {
  font-size: clamp(1.3rem, 4vw, 1.8rem);
  font-weight: 600;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.7);
}

.mobile-lrc-original span {
  display: inline-block;
  background: linear-gradient(
    to right,
    #ffffff var(--progress, 0%),
    rgba(255, 255, 255, 0.45) var(--progress, 0%)
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  transition: --progress 0.1s ease;
  white-space: normal;
}

.mobile-lyric-line.active .mobile-lrc-original {
  color: #fff;
  font-weight: 700;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
}

.mobile-lrc-translate {
  font-size: clamp(0.8rem, 2.5vw, 1rem);
  font-weight: 500;
  line-height: 1.4;
  margin-top: 6px;
  color: rgba(255, 255, 255, 0.25);
  transition: color 0.5s ease;
}

.mobile-lyric-line.active .mobile-lrc-translate {
  color: rgba(255, 255, 255, 0.7);
}

.mobile-lrc-roman {
  font-size: 10px;
  font-weight: 500;
  margin-top: 2px;
  color: rgba(255, 255, 255, 0.4);
  transition: color 0.5s ease;
}

.mobile-lyric-line.active .mobile-lrc-roman {
  color: rgba(255, 255, 255, 0.65);
}

/* 歌词覆盖层过渡动画 */
.lyrics-fade-enter-active,
.lyrics-fade-leave-active {
  transition: opacity 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.lyrics-fade-enter-active .mobile-lyrics-body,
.lyrics-fade-leave-active .mobile-lyrics-body {
  transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.lyrics-fade-enter-from,
.lyrics-fade-leave-to {
  opacity: 0;
}

.lyrics-fade-enter-from .mobile-lyrics-body,
.lyrics-fade-leave-to .mobile-lyrics-body {
  transform: translateY(30px);
}

.iconify {
  color: #fff !important;
}
</style>
