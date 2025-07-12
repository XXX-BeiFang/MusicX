<script setup lang="ts">
import { settingStore } from '@/stores/modules/setting'

const setting = settingStore()

// 计算内容区域的样式
const mainStyle = computed(() => {
  // 如果有壁纸，则使用透明背景
  if (setting.wallpaper && setting.wallpaperType !== 'none') {
    return {
      backgroundColor: 'transparent'
    }
  }
  return {}
})
</script>

<template>
  <main
    class="flex-1 overflow-x-hidden"
    :class="{'bg-themeBgColor': !setting.wallpaper || setting.wallpaperType === 'none'}"
    :style="mainStyle"
  >
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </main>
</template>
