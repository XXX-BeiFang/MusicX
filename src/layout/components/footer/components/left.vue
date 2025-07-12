<script setup lang="ts">
// const { currentTrack, currentLyricIndex } = useAudioPlayer()
const { currentTrack, currentLyricIndex, isPlaying, togglePlayPause } = useAudioPlayer()
const showDrawerMusic = ref(false)
const isHovering = ref(false)

// 处理播放/暂停按钮点击事件
const handlePlayPauseClick = (event: MouseEvent) => {
  event.stopPropagation() // 阻止事件冒泡，防止触发showDrawerMusic切换
  togglePlayPause()
}
</script>
<template>
  <div class="flex items-center gap-2 w-64">
    <div 
      class="min-w-14 max-w-14 h-full relative"
      @mouseenter="isHovering = true"
      @mouseleave="isHovering = false"
    >
      <img
        @click="showDrawerMusic = !showDrawerMusic"
        :src="currentTrack.cover + '?param=90y90'"
        :alt="currentTrack.title"
        class="w-full h-full object-cover"
      />
      <!-- 播放/暂停图标覆盖层 -->
      <div 
        class="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300"
        :class="isHovering ? 'opacity-100' : 'opacity-0'"
      >
        <button 
          @click="handlePlayPauseClick"
          class="w-8 h-8 rounded-full bg-primary/80 hover:bg-primary flex items-center justify-center transition-transform duration-300 transform hover:scale-110"
        >
          <el-icon class="text-white" :size="20">
            <video-play v-if="!isPlaying" />
            <video-pause v-else />
          </el-icon>
        </button>
      </div>
    </div>
    <div>
      <div
        class="text-sm text-primary-foreground line-clamp-1"
        :title="currentTrack.title"
      >
        {{ currentTrack.title }}
      </div>
      <div class="text-xs text-muted-foreground line-clamp-1 h-4">
        {{ currentTrack.lyrics?.lines?.[currentLyricIndex]?.lrc || '...' }}
      </div>
    </div>
    <DrawerMusic v-model="showDrawerMusic" />
  </div>
</template>
