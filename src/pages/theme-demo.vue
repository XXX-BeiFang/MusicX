<template>
  <div class="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
    <div class="container mx-auto px-4 py-8">
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          主题切换动画演示
        </h1>
        
        <div class="mb-8">
          <p class="text-lg text-gray-600 dark:text-gray-300 mb-4">
            点击下面的按钮体验 View Transitions API 主题切换动画效果
          </p>
          
          <button
            @click="handleThemeToggle"
            class="px-8 py-4 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Icon :icon="isDarkMode ? 'mdi:weather-sunny' : 'mdi:weather-night'" class="mr-2" />
            切换到{{ isDarkMode ? '浅色' : '深色' }}模式
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          <div class="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              特性 1
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              使用 VueUse 的 useDark 来管理暗黑模式状态
            </p>
          </div>
          
          <div class="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              特性 2
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              集成 View Transitions API 实现流畅的主题切换动画
            </p>
          </div>
          
          <div class="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              特性 3
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              圆形扩散动画效果，从点击位置开始扩散
            </p>
          </div>
        </div>

        <div class="mt-12 p-6 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
          <h3 class="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            浏览器兼容性提示
          </h3>
          <p class="text-yellow-700 dark:text-yellow-300">
            View Transitions API 目前主要在 Chrome 111+ 中支持。在不支持的浏览器中会回退到普通的主题切换。
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { isDarkMode, toggleTheme } from '@/composables/useTheme'

const handleThemeToggle = (event: Event) => {
  toggleTheme(event)
}
</script>

<style scoped>
/* 额外的样式可以在这里添加 */
</style>
