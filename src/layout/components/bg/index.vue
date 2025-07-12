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

// 计算背景容器样式
const containerStyle = computed(() => {
  if (setting.wallpaper && setting.wallpaperType !== 'none') {
    return {
      background: 'transparent'
    }
  }
  return {}
})
</script>

<template>
  <div class="bg-container w-full h-full absolute top-0 left-0 z-0" :class="{'bg-white dark:bg-neutral-900': !setting.wallpaper || setting.wallpaperType === 'none'}" :style="containerStyle">
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

.bg-container {
  transition: background 0.3s ease;
}

.wallpaper-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

.wallpaper {
  position: absolute;
  top: -5%;  /* 稍微放大一点，确保覆盖整个容器 */
  left: -5%;
  width: 110%;  /* 稍微放大一点，确保覆盖整个容器 */
  height: 110%;
  transition: opacity 0.3s ease, filter 0.3s ease;
}
</style>
