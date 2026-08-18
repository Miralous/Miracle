<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { globalConfig } from "#config";
import PostCard from "../common/postCard.vue";
const username = globalConfig.informations.github.name;
const posts = ref<any[]>([]);
const loading = ref(true);
const error = ref("");
const CACHE_KEY = "github_projects_cache";
const CACHE_TTL = 60 * 60 * 1000; // 1小时缓存

// 每行最多 3 个，超出的项目不显示（只保留一行）
const columnCount = ref(1);
const MIN_COL_WIDTH = 320;
const MAX_COLS = 3;

function computeColumns() {
  const maxByWidth = Math.max(1, Math.floor(window.innerWidth / MIN_COL_WIDTH));
  columnCount.value = Math.min(MAX_COLS, maxByWidth);
}

// 只保留能铺满一行的项目数
const visiblePosts = computed(() => posts.value.slice(0, columnCount.value));

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${columnCount.value}, 1fr)`,
}));

// 获取 GitHub 项目数据
async function fetchGithubData() {
  const res = await fetch(`https://api.github.com/users/${username}/repos`);
  if (!res.ok) throw new Error("GitHub API rate limited.");
  const data = await res.json();

  // 过滤掉 Public Archive 与 GitHub 特殊仓库（.github / profile repo）
  const filteredRepos = data.filter(
    (repo: any) =>
      !repo.archived &&
      repo.name.toLowerCase() !== username.toLowerCase() &&
      repo.name.toLowerCase() !== ".github",
  );
  const projects = await Promise.all(
    filteredRepos.map(async (repo: any) => {
      let lastCommit = "";
      let committer = "";
      try {
        const commitsRes = await fetch(
          `https://api.github.com/repos/${username}/${repo.name}/commits?per_page=1`,
        );
        const commits = await commitsRes.json();
        lastCommit = commits[0]?.commit?.message || "";
        // ✅ 使用 GitHub 登录名而非 commit 作者名字
        committer = commits[0]?.author?.login || username;
      } catch {}

      return {
        link: repo.html_url,
        title: repo.name.replace(/-/g, " "),
        description: repo.description,
        lastCommit,
        committer,
        avatarUrl: repo.owner.avatar_url,
      };
    }),
  );

  return projects;
}

function filterProjects(projects: any[]) {
  return projects.filter(
    (p) => p.title.toLowerCase() !== ".github",
  );
}

// 渲染缓存逻辑
async function loadProjects() {
  loading.value = true;
  let cache = localStorage.getItem(CACHE_KEY);
  let cacheTime = localStorage.getItem(CACHE_KEY + "_time");
  let projects: any[] = [];

  if (cache && cacheTime && Date.now() - Number(cacheTime) < CACHE_TTL) {
    try {
      projects = JSON.parse(cache);
      posts.value = filterProjects(projects);
      computeColumns();
      loading.value = false;
      return;
    } catch {}
  }

  try {
    projects = await fetchGithubData();
    localStorage.setItem(CACHE_KEY, JSON.stringify(projects));
    localStorage.setItem(CACHE_KEY + "_time", Date.now().toString());
    posts.value = filterProjects(projects);
    computeColumns();
  } catch (e: any) {
    if (cache) {
      try {
        posts.value = filterProjects(JSON.parse(cache));
        computeColumns();
      } catch {}
    } else {
      error.value = e.message;
    }
  } finally {
    loading.value = false;
  }
}

const onResize = () => computeColumns();

onMounted(() => {
  loadProjects();
  window.addEventListener("resize", onResize);
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize);
});
</script>

<template>
  <div v-if="loading"></div>
  <div v-else-if="error">{{ error }}</div>
  <div v-else class="posts-grid" :style="gridStyle">
    <div v-for="post in visiblePosts" :key="post.link" class="post-card">
      <PostCard
        :url="post.link"
        :title="post.title"
        :description="post.description"
        :category="post.committer || 'Unknown'"
        :date="post.lastCommit || 'No commits yet'"
        :type="'project'"
      />
    </div>
  </div>
</template>

<style scoped>
.posts-grid {
  display: grid;
  gap: var(--vp-gap);
}

.diary {
  height: 100% !important;
}
</style>
