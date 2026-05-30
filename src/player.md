---
layout: page
footer: false
title: Player
pageClass: transbar
---

<ClientOnly>
  <MusicPlayer :id="musicId"/>
</ClientOnly>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useData } from 'vitepress' // 引入 VitePress 的 useData

const musicId = ref(null)
const { isDark } = useData() // 获取当前主题状态
let originalThemeIsDark = false // 用来记录进入页面前的主题

onMounted(() => {
  // 1. 获取 URL 参数
  const urlParams = new URLSearchParams(window.location.search)
  musicId.value = urlParams.get('id')

  // 2. 记录当前主题状态，并强制开启深色模式
  originalThemeIsDark = isDark.value
  if (!originalThemeIsDark) {
    isDark.value = true
  }
})

onUnmounted(() => {
  // 3. 页面卸载（退出）时，如果原来不是深色，就把它切回去
  if (!originalThemeIsDark) {
    isDark.value = false
  }
})
</script>

<style>
.transbar {
    .VPContent {
        padding: 0 !important;
    }

    .VPFlyout.VPNavBarExtra.extra button.button {
        display:none !important;
    }

    .VPSwitch.VPSwitchAppearance, .VPNavScreenAppearance.appearance {
        display: none;
    }
    
    .VPNavBar {
        backdrop-filter: blur(0px) !important;
        transition: background-color calc(var(--vp-transition-time) * 2) !important;
    }

    /* ヘッダーを絶対配置にしてコンテンツの上に重ね、透明にする */
    .VPNav {
        position: absolute !important;
        top: 0;
        left: 0;
        right: 0;
        background: transparent !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
    }

    /* モバイルメニュー展開時にnavbarを不透明にする（vp-transition-timeの遅延後に切り替え） */
    .VPNavBar.screen-open {
        background: var(--vp-nav-bg-color) !important;
    }
}
</style>