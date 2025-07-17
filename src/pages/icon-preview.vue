<template>
  <div class="icon-preview-page p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">
        深色/浅色模式图标预览
      </h1>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="iconSet in themeIconSets" 
          :key="iconSet.name"
          class="icon-card bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
        >
          <h3 class="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
            {{ iconSet.name }}
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">
            {{ iconSet.description }}
          </p>
          
          <!-- 图标展示 -->
          <div class="flex items-center justify-center gap-4 mb-4">
            <!-- 浅色模式图标 -->
            <div class="flex flex-col items-center">
              <Icon :icon="iconSet.lightIcon" :class="[iconSet.size || 'text-2xl', 'text-gray-700 dark:text-gray-300 mb-1']" />
              <span class="text-xs text-gray-500">浅色模式</span>
            </div>
            
            <div class="text-gray-400">/</div>
            
            <!-- 深色模式图标 -->
            <div class="flex flex-col items-center">
              <Icon :icon="iconSet.darkIcon" :class="[iconSet.size || 'text-2xl', 'text-gray-700 dark:text-gray-300 mb-1']" />
              <span class="text-xs text-gray-500">深色模式</span>
            </div>
          </div>
          
          <!-- 模拟按钮效果 -->
          <div class="flex justify-center">
            <button 
              class="group relative w-10 h-10 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 flex items-center justify-center text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
              @click="selectIcon(iconSet)"
            >
              <Icon 
                :icon="isDark ? iconSet.darkIcon : iconSet.lightIcon" 
                :class="[iconSet.size || 'text-xl', 'transition-transform duration-200 group-hover:scale-110']"
              />
            </button>
          </div>
          
          <!-- 选择按钮 -->
          <button 
            @click="selectIcon(iconSet)"
            class="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            :class="{ 'bg-green-500 hover:bg-green-600': isCurrentIcon(iconSet) }"
          >
            {{ isCurrentIcon(iconSet) ? '当前使用' : '选择此图标' }}
          </button>
        </div>
      </div>
      
      <!-- 返回按钮 -->
      <div class="text-center mt-8">
        <button 
          @click="$router.back()"
          class="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          返回
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { themeIconSets, currentThemeIcons, type ThemeIconSet } from '@/utils/themeIcons'
import { useDarkModeTransition } from '@/hooks/useDarkModeTransition'
import { ElNotification } from 'element-plus'

const { isDark } = useDarkModeTransition()

const isCurrentIcon = (iconSet: ThemeIconSet) => {
  return iconSet.name === currentThemeIcons.name
}

const selectIcon = (iconSet: ThemeIconSet) => {
  ElNotification({
    title: '图标选择',
    message: `已选择 ${iconSet.name} 图标集。要应用此图标，请修改 src/utils/themeIcons.ts 文件中的 currentThemeIcons 配置。`,
    type: 'info',
    duration: 5000
  })
  
  console.log('选择的图标集:', iconSet)
  console.log('要应用此图标，请在 src/utils/themeIcons.ts 中修改 currentThemeIcons 为:', iconSet)
}
</script>

<style scoped>
.icon-card:hover {
  transform: translateY(-2px);
}

.icon-preview-page {
  transition: background-color 0.3s ease;
}
</style>
