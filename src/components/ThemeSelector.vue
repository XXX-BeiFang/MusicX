<script setup lang="ts">
import { ref, onMounted, defineComponent } from 'vue';
import { onClickOutside } from '@vueuse/core';
import { settingStore } from '@/stores/modules/setting';

// 默认导出组件
defineComponent({
  name: 'ThemeSelector'
});

const settings = settingStore();
const themePanel = ref(null);

// 预设主题颜色
const presetThemes = [
  { name: '默认紫', color: '#8b5cf6' },
  { name: '朱砂红', color: '#e11d48' },
  { name: '酷炫黑', color: '#171717' },
  { name: '天空蓝', color: '#0ea5e9' },
  { name: '翡翠绿', color: '#10b981' },
  { name: '橙黄色', color: '#f59e0b' },
];

// 自定义颜色
const customColor = ref('#8b5cf6');

// 显示/隐藏主题选择器
const showThemeSelector = ref(false);

// 点击外部关闭面板
onClickOutside(themePanel, () => {
  showThemeSelector.value = false;
});

// 应用主题
const applyTheme = (color: string, name: string) => {
  settings.setThemeColor(color, name);
  showThemeSelector.value = false;
};

// 应用自定义主题
const applyCustomTheme = () => {
  settings.setThemeColor(customColor.value, '自定义');
  showThemeSelector.value = false;
};

// 获取按钮位置，用于定位面板
const buttonRef = ref<HTMLElement | null>(null);
const panelPosition = ref({ top: '20px', right: '4px' });

// 更新面板位置
const updatePanelPosition = () => {
  if (buttonRef.value) {
    const rect = buttonRef.value.getBoundingClientRect();
    panelPosition.value = {
      top: `${rect.bottom + 10}px`,
      right: `${window.innerWidth - rect.right}px`
    };
  }
};

// 初始化
onMounted(() => {
  // 如果已经有保存的主题颜色，则应用它
  if (settings.themeColor) {
    document.documentElement.style.setProperty('--primary', settings.themeColor);
  }
});
</script>

<template>
  <div class="relative" ref="themePanel">
    <!-- 主题选择按钮 -->
    <button
      ref="buttonRef"
      @click="showThemeSelector = !showThemeSelector; updatePanelPosition()"
      class="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      :title="`当前主题: ${settings.themeColorName}`"
    >
      <icon-tabler:palette class="text-xl" :style="{ color: settings.themeColor }" />
    </button>

    <!-- 使用Teleport将主题选择器面板传送到body元素下，确保它不受父元素层级的影响 -->
    <Teleport to="body">
      <!-- 主题选择器面板 -->
      <div
        v-if="showThemeSelector"
        class="theme-selector-panel p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg w-64"
        :style="{
          position: 'fixed',
          top: panelPosition.top,
          right: panelPosition.right,
          zIndex: 999999
        }"
      >
        <h3 class="text-sm font-medium mb-3">选择主题色</h3>

        <!-- 预设主题颜色 -->
        <div class="grid grid-cols-3 gap-2 mb-4">
          <button
            v-for="theme in presetThemes"
            :key="theme.name"
            @click="applyTheme(theme.color, theme.name)"
            class="flex flex-col items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            :class="{'ring-2 ring-offset-2': settings.themeColor === theme.color}"
          >
            <div class="w-6 h-6 rounded-full mb-1" :style="{ backgroundColor: theme.color }"></div>
            <span class="text-xs">{{ theme.name }}</span>
          </button>
        </div>

        <!-- 自定义颜色 -->
        <div class="mb-2">
          <label class="text-xs font-medium block mb-1">自定义颜色</label>
          <div class="flex items-center gap-2">
            <input
              v-model="customColor"
              type="color"
              class="w-8 h-8 rounded cursor-pointer"
            />
            <input
              v-model="customColor"
              type="text"
              class="flex-1 px-2 py-1 text-sm border rounded"
            />
            <button
              @click="applyCustomTheme"
              class="px-2 py-1 text-xs text-white rounded"
              :style="{ backgroundColor: customColor }"
            >
              应用
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.ring-2 {
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
}

.ring-offset-2 {
  --tw-ring-offset-width: 2px;
}

.theme-selector-panel {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}
</style>