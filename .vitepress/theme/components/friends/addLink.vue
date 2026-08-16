<script setup lang="ts">
import { reactive, ref, computed, watch } from "vue";
import { globalConfig } from "#config";
import { useCardHover } from "#theme/utils/composables/useCardHover";

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

// 只在第二步内由勾选状态变化引起的显隐时播放动画
const nextPopAnimating = ref(false);

watch(
  [step, allConfirmed],
  ([newStep, newConfirmed], [oldStep, oldConfirmed]) => {
    nextPopAnimating.value =
      newStep === oldStep && newConfirmed !== oldConfirmed;
  },
);

const stepTitle = computed(() => {
  if (step.value === 1) return globalConfig.lang.addLinkInfoTitle;
  if (step.value === 2) return globalConfig.lang.addLinkConfirmTitle;
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

const linkItems = computed(() =>
  link.map((item) => ({
    icon: item.copied ? globalConfig.icon.tick : item.icon,
    label: item.name,
    value: item.key,
  })),
);

const confirmItems = computed(() =>
  confirmations.map((c) => ({
    icon: c.checked
      ? globalConfig.icon.taskComplete
      : globalConfig.icon.taskNotComplete,
    label: c.label,
    state: c.checked ? "checked" : "unchecked",
  })),
);

// 复制并临时切换图标
const copyKey = async (index: number) => {
  const item = link[index];

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

const toggleConfirm = (index: number) => {
  confirmations[index].checked = !confirmations[index].checked;
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
        {{ infoDesc }}
      </p>
      <p v-else-if="step === 2" class="step-desc">
        {{ globalConfig.lang.addLinkConfirmDesc }}
      </p>
      <p v-else-if="step === 3" class="step-desc">
        {{ submitDesc }}
      </p>
    </div>

    <ListCard
      v-if="step === 1"
      :items="linkItems"
      class="padded"
      label-bold
      value-ellipsis
      hoverable
      @item-click="(_, index) => copyKey(index)"
    />

    <ListCard
      v-else-if="step === 2"
      :items="confirmItems"
      class="padded confirm"
      item-align="flex-start"
      icon-size="1.3em"
      hoverable
      @item-click="(_, index) => toggleConfirm(index)"
    />

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
      <Transition name="next-pop" :css="nextPopAnimating">
        <button
          v-if="step < totalSteps && (step !== 2 || allConfirmed)"
          class="btn btn-next"
          @click="nextStep"
          @mouseenter="handleMouseEnter"
          @mousemove="handleMouseMove"
          @mouseleave="handleMouseLeave"
        >
          {{ globalConfig.lang.nextStep }}
        </button>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.wizard {
  max-width: 720px;
  margin: 0 auto;
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
  text-align: center;
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
.next-pop-enter-active,
.next-pop-leave-active {
  transition: all var(--vp-transition-time);
}
.next-pop-enter-from,
.next-pop-leave-to {
  opacity: 0;
  transform: translateX(calc(var(--vp-gap) * 2));
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
</style>
