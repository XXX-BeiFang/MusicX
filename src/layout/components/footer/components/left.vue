<script setup lang="ts">
const { currentTrack, currentLyricIndex } = useAudioPlayer()

// 定义事件发射器，用于与父组件通信
const emit = defineEmits(['openLyrics'])

// 点击歌曲信息区域打开歌词页面
const openLyricsPage = () => {
  emit('openLyrics')
}
</script>
<template>
  <div class="flex items-center gap-2 w-64">
    <div class="min-w-14 max-w-14 h-full relative">
      <img
        @click="openLyricsPage"
        :src="currentTrack.cover + '?param=90y90'"
        :alt="currentTrack.title"
        class="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
      />
    </div>
    <div @click="openLyricsPage" class="cursor-pointer hover:opacity-80 transition-opacity flex-1">
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
  </div>
</template>
