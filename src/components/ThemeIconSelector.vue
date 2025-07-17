<template>
  <div class="theme-icon-selector p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
    <h3 class="text-lg font-medium mb-4">选择深色/浅色模式图标</h3>
    
    <div class="grid grid-cols-3 gap-4">
      <!-- Iconify Material Symbols -->
      <div 
        v-for="iconSet in iconOptions" 
        :key="iconSet.name"
        class="icon-option p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        :class="{ 'border-blue-500 bg-blue-50 dark:bg-blue-900/20': selectedIcon === iconSet.name }"
        @click="selectIcon(iconSet)"
      >
        <div class="text-center">
          <div class="flex justify-center items-center gap-2 mb-2">
            <!-- 浅色模式图标 -->
            <Icon :icon="iconSet.lightIcon" class="text-2xl text-gray-600" />
            <span class="text-gray-400">/</span>
            <!-- 深色模式图标 -->
            <Icon :icon="iconSet.darkIcon" class="text-2xl text-gray-600" />
          </div>
          <p class="text-sm font-medium">{{ iconSet.name }}</p>
          <p class="text-xs text-gray-500">{{ iconSet.description }}</p>
        </div>
      </div>
    </div>

    <div class="mt-6 flex justify-between">
      <button 
        @click="$emit('cancel')"
        class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        取消
      </button>
      <button 
        @click="confirmSelection"
        class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        :disabled="!selectedIcon"
      >
        确认选择
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'

interface IconOption {
  name: string
  description: string
  lightIcon: string
  darkIcon: string
}

const emit = defineEmits(['confirm', 'cancel'])

const selectedIcon = ref<string>('')

// 图标选项
const iconOptions: IconOption[] = [
  {
    name: 'Material Symbols',
    description: '现代简洁',
    lightIcon: 'material-symbols:dark-mode-outline',
    darkIcon: 'material-symbols:light-mode-outline'
  },
  {
    name: 'Material Symbols Rounded',
    description: '圆润风格',
    lightIcon: 'material-symbols:dark-mode-outline-rounded',
    darkIcon: 'material-symbols:light-mode-outline-rounded'
  },
  {
    name: 'Tabler Icons',
    description: '线性风格',
    lightIcon: 'tabler:moon',
    darkIcon: 'tabler:sun'
  },
  {
    name: 'Lucide Icons',
    description: '精致线条',
    lightIcon: 'lucide:moon',
    darkIcon: 'lucide:sun'
  },
  {
    name: 'Heroicons',
    description: 'Tailwind 官方',
    lightIcon: 'heroicons:moon-20-solid',
    darkIcon: 'heroicons:sun-20-solid'
  },
  {
    name: 'Phosphor Icons',
    description: '多样化风格',
    lightIcon: 'ph:moon-bold',
    darkIcon: 'ph:sun-bold'
  },
  {
    name: 'Feather Icons',
    description: '轻量简洁',
    lightIcon: 'feather:moon',
    darkIcon: 'feather:sun'
  },
  {
    name: 'Carbon Icons',
    description: 'IBM 设计',
    lightIcon: 'carbon:moon',
    darkIcon: 'carbon:sun'
  },
  {
    name: 'Remix Icons',
    description: '丰富图标库',
    lightIcon: 'ri:moon-line',
    darkIcon: 'ri:sun-line'
  }
]

const selectIcon = (iconSet: IconOption) => {
  selectedIcon.value = iconSet.name
}

const confirmSelection = () => {
  const selected = iconOptions.find(icon => icon.name === selectedIcon.value)
  if (selected) {
    emit('confirm', selected)
  }
}
</script>

<style scoped>
.icon-option:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.icon-option.selected {
  border-color: #3b82f6;
  background-color: #eff6ff;
}
</style>
