<script setup lang="ts">
import { ref, watch, defineComponent, onMounted, computed } from 'vue';

// 默认导出组件
defineComponent({
  name: 'ColorPicker'
});

const props = defineProps({
  value: {
    type: String,
    default: '#8b5cf6'
  },
  title: {
    type: String,
    default: '选择颜色'
  }
});

const emit = defineEmits(['update:value', 'confirm', 'cancel', 'change']);

// 颜色值
const colorValue = ref(props.value);
const colorPickerRef = ref<HTMLDivElement | null>(null);
const pickerHandleRef = ref<HTMLDivElement | null>(null);
const hueSliderRef = ref<HTMLDivElement | null>(null);
const hueHandleRef = ref<HTMLDivElement | null>(null);

// RGB值
const rValue = ref(0);
const gValue = ref(0);
const bValue = ref(0);

// HSL值 (用于颜色选择器的位置)
const hue = ref(0);
const saturation = ref(100);
const lightness = ref(50);

// 计算色相渐变的背景色
const hueColor = computed(() => {
  const h = hue.value;
  const s = 100; // 最大饱和度
  const l = 50; // 中等亮度

  // 从HSL转换为RGB
  const c = (1 - Math.abs(2 * l / 100 - 1)) * s / 100;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l / 100 - c / 2;

  let r, g, b;

  if (h >= 0 && h < 60) {
    [r, g, b] = [c, x, 0];
  } else if (h >= 60 && h < 120) {
    [r, g, b] = [x, c, 0];
  } else if (h >= 120 && h < 180) {
    [r, g, b] = [0, c, x];
  } else if (h >= 180 && h < 240) {
    [r, g, b] = [0, x, c];
  } else if (h >= 240 && h < 300) {
    [r, g, b] = [x, 0, c];
  } else {
    [r, g, b] = [c, 0, x];
  }

  const rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0');
  const gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0');
  const bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
});

// 从十六进制颜色更新RGB值
const updateRgbFromHex = (hex: string) => {
  hex = hex.replace('#', '');
  rValue.value = parseInt(hex.substring(0, 2), 16);
  gValue.value = parseInt(hex.substring(2, 4), 16);
  bValue.value = parseInt(hex.substring(4, 6), 16);

  // 更新HSL值
  const r = rValue.value / 255;
  const g = gValue.value / 255;
  const b = bValue.value / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  lightness.value = Math.round(((max + min) / 2) * 100);

  if (max === min) {
    saturation.value = 0;
    hue.value = 0;
  } else {
    const d = max - min;
    saturation.value = Math.round(lightness.value > 50 ? d / (2 - max - min) * 100 : d / (max + min) * 100);

    switch (max) {
      case r:
        hue.value = Math.round(((g - b) / d + (g < b ? 6 : 0)) * 60);
        break;
      case g:
        hue.value = Math.round(((b - r) / d + 2) * 60);
        break;
      case b:
        hue.value = Math.round(((r - g) / d + 4) * 60);
        break;
    }
  }

  updatePickerPosition();
  updateHuePosition();
};

// 从RGB值更新十六进制颜色
const updateHexFromRgb = () => {
  const toHex = (value: number) => {
    const hex = Math.max(0, Math.min(255, value)).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  colorValue.value = `#${toHex(rValue.value)}${toHex(gValue.value)}${toHex(bValue.value)}`;
};

// 更新颜色选择器手柄位置
const updatePickerPosition = () => {
  if (!pickerHandleRef.value || !colorPickerRef.value) return;

  const width = colorPickerRef.value.clientWidth;
  const height = colorPickerRef.value.clientHeight;

  // 基于亮度和饱和度计算位置
  const x = (saturation.value / 100) * width;
  const y = (1 - lightness.value / 100) * height;

  pickerHandleRef.value.style.left = `${x}px`;
  pickerHandleRef.value.style.top = `${y}px`;
};

// 更新色相滑块手柄位置
const updateHuePosition = () => {
  if (!hueHandleRef.value || !hueSliderRef.value) return;

  const width = hueSliderRef.value.clientWidth;
  const x = (hue.value / 360) * width;

  hueHandleRef.value.style.left = `${x}px`;
};

// 处理颜色选择器点击和拖动
const handleColorPickerInteraction = (event: MouseEvent) => {
  if (!colorPickerRef.value) return;

  const rect = colorPickerRef.value.getBoundingClientRect();
  const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
  const y = Math.max(0, Math.min(rect.height, event.clientY - rect.top));

  const width = rect.width;
  const height = rect.height;

  // 计算饱和度和亮度
  const s = Math.max(0, Math.min(100, (x / width) * 100));
  const l = Math.max(0, Math.min(100, 100 - (y / height) * 100));

  saturation.value = Math.round(s);
  lightness.value = Math.round(l);

  updateRgbFromHsl();
  updatePickerPosition();
  emitColorChange();
};

// 处理色相滑块点击和拖动
const handleHueSliderInteraction = (event: MouseEvent) => {
  if (!hueSliderRef.value) return;

  const rect = hueSliderRef.value.getBoundingClientRect();
  const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
  const width = rect.width;

  // 计算色相值 (0-360)
  const h = Math.round((x / width) * 360);
  hue.value = h;

  updateRgbFromHsl();
  updateHuePosition();
  emitColorChange();
};

// 从HSL更新RGB值
const updateRgbFromHsl = () => {
  const h = hue.value;
  const s = saturation.value / 100;
  const l = lightness.value / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;

  let r1, g1, b1;

  if (h >= 0 && h < 60) {
    [r1, g1, b1] = [c, x, 0];
  } else if (h >= 60 && h < 120) {
    [r1, g1, b1] = [x, c, 0];
  } else if (h >= 120 && h < 180) {
    [r1, g1, b1] = [0, c, x];
  } else if (h >= 180 && h < 240) {
    [r1, g1, b1] = [0, x, c];
  } else if (h >= 240 && h < 300) {
    [r1, g1, b1] = [x, 0, c];
  } else {
    [r1, g1, b1] = [c, 0, x];
  }

  rValue.value = Math.round((r1 + m) * 255);
  gValue.value = Math.round((g1 + m) * 255);
  bValue.value = Math.round((b1 + m) * 255);

  updateHexFromRgb();
};

// 发送颜色变化事件
const emitColorChange = () => {
  emit('update:value', colorValue.value);
  emit('change', colorValue.value);
};

// 开始拖动颜色选择器
const startDrag = (event: MouseEvent) => {
  handleColorPickerInteraction(event);

  const handleMove = (e: MouseEvent) => {
    handleColorPickerInteraction(e);
  };

  const handleEnd = () => {
    document.removeEventListener('mousemove', handleMove);
    document.removeEventListener('mouseup', handleEnd);
  };

  document.addEventListener('mousemove', handleMove);
  document.addEventListener('mouseup', handleEnd);
};

// 开始拖动色相滑块
const startHueDrag = (event: MouseEvent) => {
  handleHueSliderInteraction(event);

  const handleMove = (e: MouseEvent) => {
    handleHueSliderInteraction(e);
  };

  const handleEnd = () => {
    document.removeEventListener('mousemove', handleMove);
    document.removeEventListener('mouseup', handleEnd);
  };

  document.addEventListener('mousemove', handleMove);
  document.addEventListener('mouseup', handleEnd);
};

// 确认颜色选择
const confirmColor = () => {
  emit('update:value', colorValue.value);
  emit('confirm', colorValue.value);
};

// 取消颜色选择
const cancelColor = () => {
  emit('cancel');
};

// 监听RGB值变化
watch([rValue, gValue, bValue], () => {
  updateHexFromRgb();
  emitColorChange();
});

// 监听十六进制颜色变化
watch(colorValue, (newValue) => {
  if (newValue.length >= 7) {
    updateRgbFromHex(newValue);
    emitColorChange();
  }
});

// 监听props.value变化
watch(() => props.value, (newValue) => {
  if (newValue !== colorValue.value) {
    colorValue.value = newValue;
    updateRgbFromHex(newValue);
  }
});

// 组件挂载后初始化
onMounted(() => {
  updateRgbFromHex(colorValue.value);
  updatePickerPosition();
  updateHuePosition();
});
</script>

<template>
  <div class="color-picker" @click.stop>
    <div class="mb-4">
      <!-- 颜色渐变选择区域 -->
      <div
        ref="colorPickerRef"
        class="color-gradient-picker relative mb-4 rounded overflow-hidden"
        @mousedown.stop="startDrag"
        :style="{
          background: `linear-gradient(to top, #000, transparent),
                      linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))`
        }"
      >
        <div class="cursor-pointer relative w-full h-32">
          <div
            ref="pickerHandleRef"
            class="color-picker-handle absolute"
            :style="{ backgroundColor: colorValue }"
          ></div>
        </div>
      </div>

      <!-- 色相滑块 -->
      <div
        ref="hueSliderRef"
        class="hue-slider relative mb-4 rounded overflow-hidden"
        @mousedown.stop="startHueDrag"
      >
        <div
          ref="hueHandleRef"
          class="hue-handle absolute"
          :style="{ backgroundColor: `hsl(${hue}, 100%, 50%)` }"
        ></div>
      </div>

      <!-- RGB值输入区域 -->
      <div class="grid grid-cols-3 gap-2 mb-4">
        <div class="flex flex-col items-center">
          <input
            v-model.number="rValue"
            type="number"
            min="0"
            max="255"
            class="w-full px-2 py-1 text-sm border rounded text-center"
            @click.stop
          />
          <span class="text-xs mt-1">R</span>
        </div>
        <div class="flex flex-col items-center">
          <input
            v-model.number="gValue"
            type="number"
            min="0"
            max="255"
            class="w-full px-2 py-1 text-sm border rounded text-center"
            @click.stop
          />
          <span class="text-xs mt-1">G</span>
        </div>
        <div class="flex flex-col items-center">
          <input
            v-model.number="bValue"
            type="number"
            min="0"
            max="255"
            class="w-full px-2 py-1 text-sm border rounded text-center"
            @click.stop
          />
          <span class="text-xs mt-1">B</span>
        </div>
      </div>

      <!-- 十六进制颜色输入 -->
      <div class="mb-4">
        <input
          v-model="colorValue"
          type="text"
          class="w-full px-2 py-1 text-sm border rounded text-center"
          placeholder="#000000"
          @click.stop
        />
      </div>
    </div>

    <div class="flex justify-between">
      <button
        @click.stop="cancelColor"
        class="px-3 py-1 text-sm rounded border hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        取消
      </button>
      <button
        @click.stop="confirmColor"
        class="px-3 py-1 text-sm rounded confirm"
      >
        确定
      </button>
    </div>
  </div>
</template>

<style scoped>
.color-picker {
  width: 100%;
  background-color: transparent;
  border-radius: 8px;
  overflow: hidden;
}

.dark .color-picker {
  background-color: transparent;
}

/* 颜色渐变选择区域 */
.color-gradient-picker {
  height: 120px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.color-picker-handle {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid white;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 3px rgba(0,0,0,0.5);
  cursor: pointer;
}

/* 色相滑块 */
.hue-slider {
  height: 16px;
  background: linear-gradient(to right,
    #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000);
  cursor: pointer;
  border-radius: 8px;
}

.hue-handle {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid white;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 3px rgba(0,0,0,0.5);
  top: 50%;
  cursor: pointer;
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

button {
  transition: all 0.2s ease;
}

button:hover {
  opacity: 0.9;
}

button.confirm {
  background-color: v-bind(colorValue);
  color: white;
}

input {
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.dark input {
  background-color: #374151;
  border-color: rgba(255, 255, 255, 0.1);
  color: white;
}
</style>

<script lang="ts">
export default {
  name: 'ColorPicker'
}
</script>