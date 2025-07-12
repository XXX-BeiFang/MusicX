<script setup lang="ts">
import * as Left from './components/left.vue'
import * as Center from './components/center.vue'
import * as Right from './components/right.vue'
import { settingStore } from '@/stores/modules/setting'

const setting = settingStore()

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
</script>
<template>
  <footer class="border-t flex items-center justify-between player-footer" :style="footerStyle">
    <!-- 左边：歌曲封面和歌曲名称 -->
    <Left.default />
    <!-- 中间：控制区 -->
    <Center.default />
    <!-- 右边：历史播放和音量 -->
    <Right.default />
  </footer>
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
