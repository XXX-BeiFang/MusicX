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
</script>
<template>
  <div class="flex items-center flex-1">
    <div class="flex items-center mr-2">
      <button
        @click="prevTrack"
        class="p-2 rounded-full hover:bg-hoverMenuBg transition"
      >
        <Icon name="Back" :size="18" class="text-purple-600" />
      </button>
      <button
        @click="togglePlayPause"
        class="p-2 rounded-full hover:bg-hoverMenuBg transition"
      >
        <Icon
          :name="isPlaying ? 'VideoPause' : 'Play'"
          :size="24"
          class="text-purple-600"
        />
      </button>
      <button
        @click="nextTrack"
        class="p-2 rounded-full hover:bg-hoverMenuBg transition"
      >
        <Icon name="Right" :size="18" class="text-purple-600" />
      </button>
      <button class="p-2 rounded-full hover:bg-hoverMenuBg transition">
        <Icon name="Star" :size="18" color="#ef4444" />
      </button>
    </div>
    <div class="w-full flex items-center space-x-2">
      <el-slider
        v-model="currentTime"
        :step="1"
        :show-tooltip="false"
        @change="seek"
        :max="duration"
        class="w-full"
        size="small"
      />
      <span class="text-xs">{{ formatTime(currentTime) }}</span>
      <span> / </span>
      <span class="text-xs">{{ formatTime(duration) }}</span>
    </div>
  </div>
</template>
