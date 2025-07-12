<script setup lang="ts">
import { settingStore } from '@/stores/modules/setting'

const setting = settingStore()

// 计算壁纸背景样式
const wallpaperStyle = computed(() => {
  if (!setting.wallpaper || setting.wallpaperType === 'none') {
    return {}
  }

  return {
    backgroundImage: `url(${setting.wallpaper})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    opacity: setting.wallpaperOpacity,
    filter: `blur(${setting.wallpaperBlur}px)`
  }
})
</script>

<template>
  <div class="bg-white dark:bg-neutral-900 w-full h-full absolute top-0 left-0 z-0">
    <!-- 壁纸背景层 -->
    <div v-if="setting.wallpaper && setting.wallpaperType !== 'none'" class="wallpaper-container">
      <div class="wallpaper" :style="wallpaperStyle"></div>
    </div>
  </div>
</template>

<style lang="scss">
.bg-white {
  background: #fff;
}
.dark .bg-white {
  background: #18181c;
}

.wallpaper-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -1;
}

.wallpaper {
  width: 100%;
  height: 100%;
  transition: opacity 0.3s ease, filter 0.3s ease;
}
</style>
