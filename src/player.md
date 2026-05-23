---
layout: home
footer: false
title: Music Player
---

<ClientOnly>
  <MusicPlayer :id="musicId"/>
</ClientOnly>

<script setup>
import { ref, onMounted } from 'vue'

const musicId = ref(null)

onMounted(() => {
  // 页面加载完成后，从浏览器地址栏获取 ?id=xxx
  const urlParams = new URLSearchParams(window.location.search)
  musicId.value = urlParams.get('id')
})
</script>