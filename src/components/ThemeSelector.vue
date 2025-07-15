<script setup lang="ts">
import { ref, onMounted, defineComponent, watch } from 'vue';
import { onClickOutside } from '@vueuse/core';
import { settingStore } from '@/stores/modules/setting';
import ColorPicker from '@/components/ColorPicker.vue';

// 默认导出组件
defineComponent({
  name: 'ThemeSelector'
});

const settings = settingStore();
const themePanel = ref(null);
const colorPickerRef = ref<HTMLElement | null>(null);

// 预设主题颜色
const presetThemes = [
  { name: '韵味紫', color: '#8b5cf6' },
  { name: '朱砂红', color: '#e11d48' },
  { name: '酷炫黑', color: '#171717' },
  { name: '天空蓝', color: '#0ea5e9' },
  { name: '翡翠绿', color: '#10b981' },
  { name: '橙黄色', color: '#f59e0b' },
];

// 自定义颜色
const customColor = ref(settings.themeColor || '#8b5cf6');
// 预览颜色 - 用于实时显示但不立即应用
const previewColor = ref(customColor.value);

// 显示/隐藏主题选择器
const showThemeSelector = ref(false);

// 点击外部关闭面板，但排除颜色选择器区域
onClickOutside(themePanel, (event) => {
  // 检查点击的元素是否在颜色选择器内部
  if (colorPickerRef.value && colorPickerRef.value.contains(event.target as Node)) {
    return; // 如果点击的是颜色选择器内部，不关闭面板
  }
  showThemeSelector.value = false;
});

// 应用主题
const applyTheme = (color: string, name: string) => {
  settings.setThemeColor(color, name);
  customColor.value = color;
  previewColor.value = color;
  showThemeSelector.value = false;
};

// 应用自定义颜色
const applyCustomColor = (color: string) => {
  settings.setThemeColor(color, '自定义');
  customColor.value = color;
  showThemeSelector.value = false;
};

// 处理颜色变化
const handleColorChange = (color: string) => {
  previewColor.value = color;
};

// 取消颜色选择
const handleCancelColor = () => {
  previewColor.value = customColor.value;
  showThemeSelector.value = false;
};

// 初始化
onMounted(() => {
  // 如果已经有保存的主题颜色，则应用它
  if (settings.themeColor) {
    document.documentElement.style.setProperty('--primary', settings.themeColor);
    customColor.value = settings.themeColor;
    previewColor.value = settings.themeColor;
  }
});
</script>

<template>
  <div class="relative" ref="themePanel">
    <!-- 主题选择按钮 -->
    <button
      @click="showThemeSelector = !showThemeSelector"
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
        class="theme-selector-panel fixed top-20 right-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
        style="z-index: 999999; width: 300px;"
      >
        <h3 class="text-lg font-medium mb-3">选择主题色</h3>

        <!-- 预设主题颜色 -->
        <div class="grid grid-cols-3 gap-3 mb-4">
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

        <!-- 自定义颜色选择器 -->
        <div ref="colorPickerRef" class="custom-color-section mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <ColorPicker
            v-model:value="previewColor"
            @change="handleColorChange"
            @confirm="applyCustomColor(previewColor)"
            @cancel="handleCancelColor"
          />
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

/* 去除数字输入框的箭头 */
input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type=number] {
  -moz-appearance: textfield;
}
</style>