<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import { globalConfig } from "#config";
import { useCardHover } from "#theme/utils/useCardHover";

const { handleMouseMove, handleMouseEnter, handleMouseLeave } = useCardHover();

const step = ref(1);
const totalSteps = 3;

// 确认项：第一步需要逐项勾选
const confirmationKeys = [
  "addLinkAgree1",
  "addLinkAgree2",
  "addLinkAgree3",
  "addLinkAgree4",
  "addLinkAgree5",
  "addLinkAgree6",
  "addLinkAgree7",
] as const;

const confirmations = reactive(
  confirmationKeys.map((key) => ({
    label: globalConfig.lang[key],
    checked: false,
  })),
);

const allConfirmed = computed(() => confirmations.every((c) => c.checked));

const stepTitle = computed(() => {
  if (step.value === 1) return globalConfig.lang.addLinkConfirmTitle;
  if (step.value === 2) return globalConfig.lang.addLinkInfoTitle;
  return globalConfig.lang.addLinkSubmitTitle;
});

const submitDesc = globalConfig.lang.addLinkSubmitDesc.replace(
  "{author}",
  globalConfig.informations.author,
);

const infoDesc = globalConfig.lang.addLinkInfoDesc.replace(
  "{title}",
  globalConfig.informations.title,
);

// 响应式 link 数组，每个项包含 copied 状态
const link = reactive([
  {
    icon: globalConfig.icon.title,
    name: globalConfig.lang.name,
    key: globalConfig.informations.title,
    copied: false,
  },
  {
    icon: globalConfig.icon.avatar,
    name: globalConfig.lang.avatar,
    key: globalConfig.informations.avatar,
    copied: false,
  },
  {
    icon: globalConfig.icon.desc,
    name: globalConfig.lang.desc,
    key: globalConfig.informations.description,
    copied: false,
  },
  {
    icon: globalConfig.icon.url,
    name: globalConfig.lang.link,
    key: globalConfig.informations.url,
    copied: false,
  },
]);

// 复制并临时切换图标
const copyKey = async (item: { key: string; copied: boolean }) => {
  try {
    await navigator.clipboard.writeText(item.key);
  } catch (err) {
    const textarea = document.createElement("textarea");
    textarea.value = item.key;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }

  item.copied = true;
};

const nextStep = () => {
  if (step.value < totalSteps) step.value++;
};

const backStep = () => {
  if (step.value > 1) step.value--;
};

const handleClick = () => {
  const url = `https://github.com/${globalConfig.informations.github.name}/${globalConfig.informations.github.repo}/issues/new?template=add-link.yaml`;
  window.location.href = url;
};
</script>

<template>
  <div style="height: calc(var(--vp-gap) * 2)"></div>
  <div class="wizard">
    <div class="head-card">
      <div class="step-title">
        <span>{{ stepTitle }}</span>
      </div>
      <p v-if="step === 1" class="step-desc">
        {{ globalConfig.lang.addLinkConfirmDesc }}
      </p>
      <p v-else-if="step === 2" class="step-desc">
        {{ infoDesc }}
      </p>
      <p v-else-if="step === 3" class="step-desc">
        {{ submitDesc }}
      </p>
    </div>

    <div v-if="step !== 3" class="card">
      <div v-if="step === 1" class="confirm-list">
        <div
          v-for="(c, index) in confirmations"
          :key="index"
          class="confirm-item"
          :class="{ checked: c.checked }"
          @click="c.checked = !c.checked"
        >
          <Icon
            :icon="
              c.checked
                ? globalConfig.icon.taskComplete
                : globalConfig.icon.taskNotComplete
            "
            class="check-icon"
          />
          <span class="confirm-label">{{ c.label }}</span>
        </div>
      </div>

      <div v-else class="infos">
        <div
          v-for="(item, index) in link"
          :key="index"
          class="info"
          @click="copyKey(item)"
        >
          <Icon
            :icon="item.copied ? globalConfig.icon.tick : item.icon"
            class="icon"
          />
          <span class="name">{{ item.name }}</span>
          <span class="key">{{ item.key }}</span>
        </div>
      </div>
    </div>

    <div
      v-else
      class="addBtn"
      @click="handleClick"
      @mouseenter="handleMouseEnter"
      @mousemove="handleMouseMove"
      @mouseleave="handleMouseLeave"
    >
      <Icon
        :icon="globalConfig.icon.arrow"
        style="margin-right: var(--vp-gap)"
      />
      {{ globalConfig.lang.clickToAdd }}
    </div>

    <div class="nav-btns">
      <button
        v-if="step > 1"
        class="btn btn-back"
        @click="backStep"
        @mouseenter="handleMouseEnter"
        @mousemove="handleMouseMove"
        @mouseleave="handleMouseLeave"
      >
        {{ globalConfig.lang.backStep }}
      </button>
      <button
        v-if="step < totalSteps"
        class="btn btn-next"
        :style="{ opacity: step === 1 && !allConfirmed ? '0' : '1' }"
        @click="nextStep"
        @mouseenter="handleMouseEnter"
        @mousemove="handleMouseMove"
        @mouseleave="handleMouseLeave"
      >
        {{ globalConfig.lang.nextStep }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.wizard {
  max-width: 720px;
  margin: 0 auto;
}
.card {
  border: 1px solid var(--vp-c-divider);
  box-shadow: var(--vp-shadow);
  border-radius: var(--vp-border-radius-1);
  padding: 20px;
}
.head-card {
  margin: calc(var(--vp-gap) * 2) 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.step-title {
  display: flex;
  align-items: center;
  gap: var(--vp-gap);
  font-size: 1.4em;
  font-weight: 700;
}
.step-desc {
  color: var(--vp-c-text-2);
  margin: calc(var(--vp-gap) / 2) 0 0;
}
.confirm-list {
  display: flex;
  flex-direction: column;
  gap: calc(var(--vp-gap) / 2);
}
.confirm-item {
  display: flex;
  align-items: flex-start;
  gap: var(--vp-gap);
  padding: 10px 15px;
  border-radius: var(--vp-border-radius-2);
  cursor: pointer;
  transition: all var(--vp-transition-time);
}
.confirm-item:hover {
  background-color: var(--vp-c-bg-soft);
}
.check-icon {
  font-size: 1.3em;
  flex-shrink: 0;
  margin-top: 1px;
  color: var(--vp-c-text-3);
}
.confirm-item.checked .check-icon {
  color: var(--vp-c-brand-1);
}
.confirm-item.checked .confirm-label {
  color: var(--vp-c-text-1);
}
.confirm-label {
  color: var(--vp-c-text-2);
  line-height: 1.6;
  transition: all var(--vp-transition-time);
}
.nav-btns {
  display: flex;
  gap: var(--vp-gap);
  margin-top: var(--vp-gap);
}
.btn {
  flex: 1;
  text-align: center;
  border: 1px solid var(--vp-c-divider);
  box-shadow: var(--vp-shadow);
  border-radius: var(--vp-border-radius-1);
  padding: 10px 24px;
  font-weight: 600;
  font-size: 15px;
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-bg);
  cursor: pointer;
  transition: all var(--vp-transition-time);
}
.btn:hover {
  color: var(--vp-c-brand-2);
  border-color: var(--vp-c-brand-2);
  box-shadow: var(--vp-shadow-brand);
}
.addBtn {
  border: 1px solid var(--vp-c-divider);
  box-shadow: var(--vp-shadow);
  border-radius: var(--vp-border-radius-1);
  padding: 15px 30px;
  font-weight: 600;
  transition: all var(--vp-transition-time);
  text-align: center;
  .iconify {
    transition: all var(--vp-transition-time);
  }
  &:hover {
    color: var(--vp-c-brand-2);
    border-color: var(--vp-c-brand-2);
    box-shadow: var(--vp-shadow-brand);
    cursor: pointer;
  }
  &:hover .iconify {
    rotate: 45deg;
  }
}
.infos {
  display: flex;
  flex-direction: column;
  gap: calc(var(--vp-gap) / 4);
  .info {
    display: flex;
    padding: 7px 15px;
    align-items: center;
    gap: var(--vp-gap);
    border-radius: var(--vp-border-radius-2);
    cursor: pointer;
    text-decoration: none;
    color: inherit;
    transition: all var(--vp-transition-time);
    &:hover {
      background-color: var(--vp-c-bg-soft);
    }
    .icon {
      font-size: 1.2em;
      flex-shrink: 0;
    }
    .name {
      font-weight: 600;
    }
    .key {
      color: var(--vp-c-text-2);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      transition: all var(--vp-transition-time);
      user-select: text;
    }
  }
}
</style>
