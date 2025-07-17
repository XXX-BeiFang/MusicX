<script setup lang="ts">
import { formatTime } from '@/utils'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'

const {
  isPlaying,
  currentTime,
  duration,
  nextTrack,
  prevTrack,
  togglePlayPause,
  seek,
} = useAudioPlayer()

// 定义事件发射器，用于与父组件通信
const emit = defineEmits(['openLyrics'])

// 点击进度条区域打开歌词页面
const openLyricsPage = () => {
  emit('openLyrics')
}
</script>
<template>
  <div class="flex items-center flex-1">
    <div class="flex items-center mr-2">
      <button
        @click="prevTrack"
        class="w-10 h-10 rounded-full hover:bg-hoverMenuBg transition flex items-center justify-center"
      >
        <Icon name="Back" :size="18" class="text-primary" />
      </button>
      <button
        @click="togglePlayPause"
        class="w-10 h-10 rounded-full hover:bg-hoverMenuBg transition flex items-center justify-center"
      >
        <el-icon class="text-primary" :size="20">
          <video-play v-if="!isPlaying" />
          <video-pause v-else />
        </el-icon>
      </button>
      <button
        @click="nextTrack"
        class="w-10 h-10 rounded-full hover:bg-hoverMenuBg transition flex items-center justify-center"
      >
        <Icon name="Right" :size="18" class="text-primary" />
      </button>
      <button class="w-10 h-10 rounded-full hover:bg-hoverMenuBg transition flex items-center justify-center">
        <Icon name="Star" :size="18" color="#ef4444" />
      </button>
    </div>
    <div class="w-full flex items-center space-x-2 cursor-pointer" @click="openLyricsPage">
      <el-slider
        v-model="currentTime"
        :step="1"
        :show-tooltip="false"
        @change="seek"
        :max="duration"
        class="w-full"
        size="small"
        @click.stop
      />
      <span class="text-xs">{{ formatTime(currentTime) }}</span>
      <span> / </span>
      <span class="text-xs">{{ formatTime(duration) }}</span>
    </div>
  </div>
</template>
