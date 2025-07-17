<script setup lang="ts">
import * as Left from './components/left.vue'
import * as Center from './components/center.vue'
import * as Right from './components/right.vue'
import { settingStore } from '@/stores/modules/setting'
import * as LyricsPage from '@/components/LyricsPage/index.vue'

const setting = settingStore()
const showLyricsPage = ref(false)

// 计算底部播放器样式
const footerStyle = computed(() => {
  if (setting.wallpaper && setting.wallpaperType !== 'none') {
    return {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)'
    }
  }
  return {}
})

// 打开歌词页面
const openLyricsPage = () => {
  showLyricsPage.value = true
}
</script>
<template>
  <footer class="border-t flex items-center justify-between player-footer" :style="footerStyle">
    <!-- 左边：歌曲封面和歌曲名称 -->
    <Left.default @openLyrics="openLyricsPage" />
    <!-- 中间：控制区 -->
    <Center.default @openLyrics="openLyricsPage" />
    <!-- 右边：历史播放和音量 -->
    <Right.default />
  </footer>

  <!-- 歌词页面 -->
  <LyricsPage.default v-if="showLyricsPage" v-model="showLyricsPage" />
</template>

<style scoped>
.player-footer {
  height: 72px; /* 固定高度确保一致性 */
}

/* 确保所有播放器按钮内的图标垂直居中 */
:deep(.player-control-btn) {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 确保所有图标垂直对齐 */
:deep(button) {
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
