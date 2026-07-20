---
# https://vitepress.dev/reference/default-theme-home-page
layout: page
pageClass: indexPage
footer: false
---

<ClientOnly>
  <div ref="firstPageRef">
    <FirstPage v-if="globalConfig.firstPageMode===1"/>
    <FirstPage_2 v-if="globalConfig.firstPageMode===2"/>
  </div>
</ClientOnly>
<div class="VPContent is-home" id="VPContent" style="padding-top: 0 !important;">
    <div class="VPHome">
        <div class="vp-doc container" style="margin: 0 auto; padding: 0 6vw 128px 6vw; max-width: 1280px;">
<div v-if="globalConfig.homePage.modules.pictures" class="hide-phone">
    <h2><Icon :icon="globalConfig.icon.photos"/> {{ globalConfig.lang.photos }}</h2>
    <ClientOnly>
        <Pictures />
    </ClientOnly>
</div>

<div v-if="globalConfig.homePage.modules.recentPosts">
    <h2><Icon :icon="globalConfig.icon.recentPosts" /> {{ globalConfig.lang.recentPosts }}</h2>
    <div v-if="globalConfig.homePage.modules.lastMoment">
        <ClientOnly>
            <LastMoment />
        </ClientOnly>
    </div>
    <ClientOnly>
        <RecentPosts />
    </ClientOnly>
</div>

<div v-if="globalConfig.homePage.modules.musics" class="hide-phone">
    <h2><Icon :icon="globalConfig.icon.musics" /> {{ globalConfig.lang.musics }}</h2>
    <ClientOnly>
        <Musics />
    </ClientOnly>
</div>

<div v-if="globalConfig.homePage.modules.projects">
    <h2><Icon :icon="globalConfig.icon.projects" /> {{ globalConfig.lang.projects }}</h2>
    <ClientOnly>
        <Projects />
    </ClientOnly>
</div>

<div v-if="globalConfig.homePage.modules.techStack" class="hide-phone">
    <h2><Icon :icon="globalConfig.icon.techStack" /> {{ globalConfig.lang.techStack }}</h2>
    <ClientOnly>
        <TechStack />
    </ClientOnly>
</div>

<div v-if="globalConfig.homePage.modules.friends" class="hide-phone">
    <h2><Icon :icon="globalConfig.icon.friends" /> {{ globalConfig.lang.friends }}</h2>
    <ClientOnly>
        <Friends />
    </ClientOnly>
</div>
        </div>
    </div>
</div>

<script setup lang="ts">
    import { ref, onMounted, onUnmounted } from 'vue'
    import { globalConfig } from "#config";
    
    console.log(globalConfig.photos)

    const firstPageRef = ref<HTMLElement | null>(null)

    // 检查滚动位置的函数
    const checkScroll = () => {
        if (!firstPageRef.value) return
        
        // 获取 FirstPage 元素距离视口的位置信息
        const rect = firstPageRef.value.getBoundingClientRect()
        
        // 当 FirstPage 的底部还在视口内时（> 0 代表还没完全滚出去，> 64 代表没被导航栏完全遮挡）
        if (rect.bottom > 64) {
            // 给 body 添加一个特定的类名
            document.body.classList.add('override-nav-bg')
        } else {
            // 滚出去了，移除这个类名
            document.body.classList.remove('override-nav-bg')
        }
    }

    onMounted(() => {
        // 初始执行一次
        checkScroll()
        // 监听滚动事件
        window.addEventListener('scroll', checkScroll)
    })

    onUnmounted(() => {
        // 组件卸载时移除监听器
        window.removeEventListener('scroll', checkScroll)
        // 切换到其他页面时，务必清理掉 body 上的类名，避免影响其他页面
        document.body.classList.remove('override-nav-bg')
    })
</script>

<style>
    /* 当 body 包含 override-nav-bg 时，强制修改导航栏背景色 */
    body.override-nav-bg .VPNavBar {
        background-color: var(--vp-c-bg) !important;
    }
    
    /* 让颜色变化更平滑 */
    .VPNavBar {
        transition: background-color var(--vp-transition-time) !important;
    }

    .indexPage img.VPImage.logo {
        display: none
    }
    .indexPage h2 {
        text-transform: var(--vp-title-uppercase);
    }
/* ========================================================
   核心修复：所有模块默认不显示顶边框
   ======================================================== */
.indexPage .container > div h2 {
    border-top: none !important;
}

/* ========================================================
   只有当它“不是第一个可见模块”时，才把边框补回来。
   通过 `~` 选择器，如果一个 div 前面还有别的 div，说明它不是第一，就加边框。
   ======================================================== */
.indexPage .container > div ~ div h2 {
    border-top: 1px solid var(--vp-c-divider) !important;
    margin-top: 48px !important; /* 恢复后续模块的间距 */
}

/* ========================================================
   特例处理：如果照片是第一个，但在手机上隐藏了，
   那么排在第二的文章块就变成了“手机上的第一个”。
   当手机端 .hide-phone 消失后，让紧跟在它后面的那个块去掉边框。
   ======================================================== */
@media (max-width: 767px) {
    /* 隐藏手机端元素 */
    .indexPage .hide-phone {
        display: none !important;
    }
    
    /* 如果第一个元素被 hide-phone 隐藏了，让紧随其后的模块 h2 去掉边框 */
    .indexPage .container > .hide-phone:first-child + div h2 {
        border-top: none !important;
        margin-top: 10px !important;
    }
}

/* 统一让真正意义上的第一个元素的顶间距缩减 */
.indexPage .container > div:first-child h2 {
    margin-top: 10px !important;
}
</style>