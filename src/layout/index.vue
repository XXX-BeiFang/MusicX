<script setup lang="ts">
import * as Header from './components/header/index.vue'
import * as Aside from './components/aside/index.vue'
import Main from './components/main/index.vue'
import * as Footer from './components/footer/index.vue'
import * as BG from './components/bg/index.vue'
import { AudioPlayer } from '@/hooks/useAudioPlayer'
import { settingStore } from '@/stores/modules/setting'

const setting = settingStore()

provide('audioPlayer', AudioPlayer())

// 计算内容容器的样式
const contentStyle = computed(() => {
  // 如果有壁纸，则移除白色背景
  if (setting.wallpaper && setting.wallpaperType !== 'none') {
    return {
      backgroundColor: 'transparent'
    }
  }
  return {}
})
</script>
<template>
  <BG.default />
  <div class="absolute w-full flex flex-col h-full z-10">
    <div
      class="w-full flex flex-col h-full rounded-3xl overflow-hidden shadow-2xl border border-white/30 dark:border-white/10"
      :class="{'bg-white dark:bg-neutral-900': !setting.wallpaper || setting.wallpaperType === 'none'}"
      :style="contentStyle"
    >
      <Header.default />
      <div class="flex flex-1 overflow-hidden">
        <Aside.default />
        <Main />
      </div>
      <Footer.default />
    </div>
  </div>
</template>
