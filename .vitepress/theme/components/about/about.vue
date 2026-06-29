<template>
  <div class="about">
    <div class="personal">
      <img
        :src="globalConfig.homePage.avatar"
        alt="avatar"
        class="avatar"
      />
      <div class="textPlace">
        <span class="name">{{ globalConfig.author }}</span>
        <span class="introduce">{{ globalConfig.about.desc }}</span>
      </div>
    </div>

    <h2>
      <Icon :icon="globalConfig.icon.about" /> {{ globalConfig.lang.infos }}
    </h2>
    <div class="tags" v-if="l.length > 1">
      <TagChip
        v-for="(item, index) in l"
        :key="index"
        :label="item.title"
        :count="item.content"
      >
        <template #icon>
          <Icon :icon="item.icon" />
        </template>
      </TagChip>
    </div>

    <h2>
      <Icon :icon="globalConfig.icon.tasks" /> {{ globalConfig.lang.tasks }}
    </h2>
    <div class="tasks">
      <div
        v-for="(item, index) in globalConfig.about.todo"
        :key="index"
        class="task"
      >
        <icon
          :icon="
            item.complete
              ? globalConfig.icon.taskComplete
              : globalConfig.icon.taskNotComplete
          "
          :class="item.complete ? 'complete' : 'notComplete'"
        />
        <span :class="{ complete: item.complete }">{{ item.text }}</span>
      </div>
    </div>

    <h2>
      <Icon :icon="globalConfig.icon.techStack" />
      {{ globalConfig.lang.techStack }}
    </h2>
    <TechStack />

    <div v-if="globalConfig.about.schedule.enabled">
      <h2>
        <Icon :icon="globalConfig.icon.schedule" />
        {{ globalConfig.lang.schedule }}
      </h2>
      <div class="schedule">
        <div class="day-card" v-for="day in scheduleList" :key="day.en">
          <div class="day-header">
            <span class="en">{{ day.en }}</span>
            <span class="zh">{{ day.zh }}</span>
          </div>
          <div class="course-list">
            <div
              class="course-item"
              :class="{
                'active-course': isCurrentCourse(day.key, course.time),
              }"
              v-for="(course, index) in day.courses"
              :key="index"
            >
              <div class="time">{{ course.time }}</div>
              <div class="name">{{ course.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted, onUnmounted } from "vue";
import { globalConfig } from "#config";

const l = globalConfig.about.tags;

// 映射星期数据以符合 UI 显示 (中英对照)
const scheduleMap = [
  { key: "monday", en: "MON", zh: "周一" },
  { key: "tuesday", en: "TUE", zh: "周二" },
  { key: "wednesday", en: "WED", zh: "周三" },
  { key: "thursday", en: "THU", zh: "周四" },
  { key: "friday", en: "FRI", zh: "周五" },
  { key: "saturday", en: "SAT", zh: "周六" },
  { key: "sunday", en: "SUN", zh: "周日" },
];

// 将 config.ts 的 schedule 对象转化为数组格式，过滤掉没有课程的日子
const scheduleList = computed(() => {
  return scheduleMap
    .map((day) => ({
      ...day,
      // @ts-ignore - 规避潜在的索引签名问题
      courses: globalConfig.about.schedule[day.key] || [],
    }))
    .filter((day) => day.courses.length > 0);
});

// --- 当前时间高亮逻辑 ---
const currentTime = ref(new Date());
let timer: ReturnType<typeof setInterval>;

onMounted(() => {
  // 每分钟更新一次当前时间，保持高亮状态实时准确
  timer = setInterval(() => {
    currentTime.value = new Date();
  }, 60000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

// 判断是否是当前正在进行的课程
const isCurrentCourse = (dayKey: string, timeRange: string) => {
  const now = currentTime.value;
  // getDay() 返回 0-6，0代表周日。我们将其映射为我们的 key
  const weekDaysMap = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const todayKey = weekDaysMap[now.getDay()];

  // 如果不是今天的课程，直接返回 false
  if (dayKey !== todayKey) return false;

  // 兼容 "08:00-09:30" 或 "08:00 - 09:30" 或 "08:00~09:30" 等格式
  const times = timeRange.split(/[-~]/).map((t) => t.trim());
  if (times.length !== 2) return false;

  const [startStr, endStr] = times;
  const [startH, startM] = startStr.split(":").map(Number);
  const [endH, endM] = endStr.split(":").map(Number);

  if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM))
    return false;

  // 转换为当天的总分钟数方便比较大小
  const currentTotalMins = now.getHours() * 60 + now.getMinutes();
  const startTotalMins = startH * 60 + startM;
  const endTotalMins = endH * 60 + endM;

  // 当前时间在开始时间和结束时间之间
  return currentTotalMins >= startTotalMins && currentTotalMins <= endTotalMins;
};
</script>

<style lang="css" scoped>
.tags {
  border-radius: var(--vp-border-radius-1);
  transition: all var(--vp-transition-time);
  display: flex;
  flex-wrap: wrap;
  gap: var(--vp-gap);
}
.personal {
  display: flex;
  align-items: center;
  gap: calc(var(--vp-gap) * 2);
  margin: 30px 0;
  .avatar {
    width: 80px;
    transition: all var(--vp-transition-time);
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
  }
  .textPlace {
    display: flex;
    flex-direction: column;
    gap: 4px;
    .name {
      font-size: clamp(1.5rem, 3vw, 2rem);
      font-weight: 400;
      font-family: var(--vp-font-family-display);
    }
    .introduce {
      color: var(--vp-c-text-2);
      line-height: var(--vp-font-line-height-body);
    }
  }
}
.tasks {
  display: flex;
  flex-direction: column;
  gap: var(--vp-gap);
  .task {
    display: flex;
    align-items: center;
    gap: var(--vp-gap);
    span.complete {
      color: var(--vp-c-text-3);
      opacity: 0.8;
      text-decoration: line-through;
    }
    .notComplete {
      color: var(--vp-c-text-2);
    }
  }
}

.schedule {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--vp-gap);
  align-items: start;
  margin-top: 20px;
}

.day-card {
  border-bottom: 1px solid var(--vp-c-divider);
  display: flex;
  flex-direction: column;
  padding: 1rem 0;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--vp-c-divider);
  background-color: var(--vp-c-bg-soft);
  border-radius: var(--vp-border-radius-1) var(--vp-border-radius-1) 0 0;
}

.day-header .en {
  font-weight: 400;
  font-family: var(--vp-font-family-display);
  font-size: 1.1em;
  color: var(--vp-c-text-1);
}

.day-header .zh {
  font-size: 0.9em;
  color: var(--vp-c-text-2);
}

.course-list {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.course-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-left: 12px;
  border-left: 1px solid var(--vp-c-divider);
  transition: all var(--vp-transition-time);

  &:hover {
    border-color: var(--vp-c-brand-1);
  }
}

/* === 新增的高亮类 === */
.course-item.active-course {
  border-color: var(--vp-c-brand-1);
  border-width: 4px;
  background-color: var(--vp-c-brand-soft);
  padding-top: 10px;
  padding-bottom: 10px;
  border-radius: 0 var(--vp-border-radius-3) var(--vp-border-radius-3) 0;
}

.course-item.active-course .name {
  color: var(--vp-c-brand-1);
}

.course-item .time {
  font-size: 0.85em;
  color: var(--vp-c-text-2);
  line-height: 1;
}

.course-item .name {
  font-weight: 400;
  font-size: 0.95em;
  color: var(--vp-c-text-1);
  line-height: 1.3;
  text-transform: var(--vp-title-uppercase);
}
</style>
