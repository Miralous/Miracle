<script setup lang="ts">
import { reactive, ref, computed, watch } from "vue";
import { globalConfig } from "#config";
import { useCardHover } from "#theme/utils/composables/useCardHover";

const { handleMouseMove, handleMouseEnter, handleMouseLeave } = useCardHover();

// 初始为 null，表示尚未选择模式
const mode = ref<"add" | "del" | null>(null);
const step = ref(1);
const totalSteps = 3;

const addConfirmationKeys = [
  "addLinkAgree1",
  "addLinkAgree2",
  "addLinkAgree3",
  "addLinkAgree4",
  "addLinkAgree5",
  "addLinkAgree6",
  "addLinkAgree7",
] as const;

const delConfirmationKeys = [
  "delLinkAgree1",
  "delLinkAgree2",
  "delLinkAgree3",
] as const;

const confirmationKeys = computed(() =>
  mode.value === "add" ? addConfirmationKeys : delConfirmationKeys,
);

const confirmations = reactive<{ label: string; checked: boolean }[]>([]);

function initConfirmations() {
  confirmations.length = 0;
  if (mode.value) {
    confirmationKeys.value.forEach((key) => {
      confirmations.push({
        label: globalConfig.lang[key],
        checked: false,
      });
    });
  }
}

watch(
  mode,
  () => {
    step.value = 1;
    initConfirmations();
  },
  { immediate: true },
);

const allConfirmed = computed(() => confirmations.every((c) => c.checked));
const nextPopAnimating = ref(false);

watch(
  [step, allConfirmed],
  ([newStep, newConfirmed], [oldStep, oldConfirmed]) => {
    nextPopAnimating.value =
      newStep === oldStep && newConfirmed !== oldConfirmed;
  },
);

const stepTitle = computed(() => {
  if (mode.value === "add") {
    if (step.value === 1) return globalConfig.lang.addLinkInfoTitle;
    if (step.value === 2) return globalConfig.lang.addLinkConfirmTitle;
    return globalConfig.lang.addLinkSubmitTitle;
  } else if (mode.value === "del") {
    if (step.value === 1) return globalConfig.lang.delLinkInfoTitle;
    if (step.value === 2) return globalConfig.lang.delLinkConfirmTitle;
    return globalConfig.lang.delLinkSubmitTitle;
  }
  return "";
});

const infoDesc = computed(() => {
  if (mode.value === "add") {
    return globalConfig.lang.addLinkInfoDesc.replace(
      "{title}",
      globalConfig.informations.title,
    );
  } else if (mode.value === "del") {
    return globalConfig.lang.delLinkInfoDesc;
  }
  return "";
});

const submitDesc = computed(() => {
  if (mode.value === "add") {
    return globalConfig.lang.addLinkSubmitDesc.replace(
      "{author}",
      globalConfig.informations.author,
    );
  } else if (mode.value === "del") {
    return globalConfig.lang.delLinkSubmitDesc;
  }
  return "";
});

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

const delInfoItems = computed(() => [
  {
    icon: globalConfig.icon.github,
    label: globalConfig.lang.delLinkNotice1,
  },
  {
    icon: globalConfig.icon.delete,
    label: globalConfig.lang.delLinkNotice2,
  },
]);

const confirmItems = computed(() =>
  confirmations.map((c) => ({
    icon: c.checked
      ? globalConfig.icon.taskComplete
      : globalConfig.icon.taskNotComplete,
    label: c.label,
    state: c.checked ? "checked" : "unchecked",
  })),
);

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

const submitUrl = computed(() => {
  const { github } = globalConfig.informations;
  const base = `https://github.com/${github.name}/${github.repo}/issues/new?template=`;
  return mode.value === "add" ? `${base}add-link.yaml` : `${base}del-link.yml`;
});

const handleClick = () => {
  window.location.href = submitUrl.value;
};
</script>

<template>
  <div style="height: calc(var(--vp-gap) * 2)"></div>
  <div class="wizard">
    <!-- 模式选择界面（初始状态） -->
    <div v-if="mode === null" class="mode-selection">
      <div class="head-card">
        <div class="step-title">
          <span>{{ globalConfig.lang.chooseMode }}</span>
        </div>
        <p class="step-desc">
          {{ globalConfig.lang.chooseModeDesc }}
        </p>
      </div>
      <div class="mode-buttons">
        <button
          class="btn mode-btn addb"
          @click="mode = 'add'"
          @mouseenter="handleMouseEnter"
          @mousemove="handleMouseMove"
          @mouseleave="handleMouseLeave"
        >
          <Icon :icon="globalConfig.icon.add" />
          <span>{{ globalConfig.lang.addLinkS }}</span>
        </button>
        <button
          class="btn mode-btn delb"
          @click="mode = 'del'"
          @mouseenter="handleMouseEnter"
          @mousemove="handleMouseMove"
          @mouseleave="handleMouseLeave"
        >
          <Icon :icon="globalConfig.icon.delete" />
          <span>{{ globalConfig.lang.delLinkS }}</span>
        </button>
      </div>
    </div>

    <!-- 原有流程内容（选择模式后显示） -->
    <template v-else>
      <div class="head-card">
        <div class="step-title">
          <span>{{ stepTitle }}</span>
        </div>
        <p class="step-desc">
          <template v-if="step === 1">{{ infoDesc }}</template>
          <template v-else-if="step === 2">
            {{
              mode === "add"
                ? globalConfig.lang.addLinkConfirmDesc
                : globalConfig.lang.delLinkConfirmDesc
            }}
          </template>
          <template v-else>{{ submitDesc }}</template>
        </p>
      </div>

      <!-- 第一步内容 -->
      <template v-if="step === 1">
        <ListCard
          v-if="mode === 'add'"
          :items="linkItems"
          class="padded"
          label-bold
          value-ellipsis
          hoverable
          @item-click="(_, index) => copyKey(index)"
        />
        <ListCard v-else :items="delInfoItems" class="padded" hoverable />
      </template>

      <!-- 第二步确认列表 -->
      <ListCard
        v-else-if="step === 2"
        :items="confirmItems"
        class="padded confirm"
        item-align="flex-start"
        icon-size="1.3em"
        hoverable
        @item-click="(_, index) => toggleConfirm(index)"
      />

      <!-- 第三步提交按钮 -->
      <div
        v-else
        class="addBtn"
        @click="handleClick"
        @mouseenter="handleMouseEnter"
        @mousemove="handleMouseMove"
        @mouseleave="handleMouseLeave"
      >
        <Icon
          :icon="
            mode === 'add' ? globalConfig.icon.arrow : globalConfig.icon.delete
          "
          style="margin-right: var(--vp-gap)"
        />
        {{
          mode === "add"
            ? globalConfig.lang.clickToAdd
            : globalConfig.lang.clickToDelete
        }}
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
    </template>
  </div>
</template>

<style scoped>
.wizard {
  max-width: 720px;
  margin: 0 auto;
}

/* 原有样式 */
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
  box-shadow: var(--vp-shadow-brand-tag);
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
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.addBtn:hover {
  color: var(--vp-c-green-2);
  border-color: var(--vp-c-green-2);
  box-shadow: var(--vp-shadow-green-tag);
}

.addBtn .iconify {
  transition: all var(--vp-transition-time);
}

.addBtn:hover .iconify {
  rotate: 45deg;
}

/* 1. 让模式选择区和下方导航按钮的间距保持一致 */
.mode-buttons {
  display: flex;
  gap: var(--vp-gap);
  margin-top: var(--vp-gap); /* 加上和 .nav-btns 一样的顶部间距 */
  width: 100%;
}

/* 2. 确保按钮内部也是水平居中（图标+文字在同一水平线上） */
.mode-btn {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 3. 调整图标大小和文字间距，让它们不会显得太小或太挤 */
.mode-btn .iconify {
  opacity: 0.8;
  margin-right: calc(var(--vp-gap)); /* 给图标和文字之间留点空隙 */
}

.addb:hover {
  color: var(--vp-c-green-2);
  border-color: var(--vp-c-green-2);
  box-shadow: var(--vp-shadow-green-tag);
}

.delb:hover {
  color: var(--vp-c-yellow-2);
  border-color: var(--vp-c-yellow-2);
  box-shadow: var(--vp-shadow-negative-tag);
}
</style>
