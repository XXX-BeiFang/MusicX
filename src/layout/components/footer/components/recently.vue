<script setup lang="ts">
import { formatMillisecondsToTime } from '@/utils'
import { trackModel } from '@/stores/interface'
import { settingStore } from '@/stores/modules/setting'

const audio = AudioStore()
const setting = settingStore()
const { loadTrack, play, audioElement } = useAudioPlayer()

const mouseOverIndex = ref(-1) // 用于跟踪鼠标悬停的索引

const playMusic = async (song: trackModel) => {
  // 根据设置决定播放行为
  if (setting.playlistDoubleClickBehavior === 'replace') {
    // 替换播放列表模式：将当前播放列表替换为播放列表
    const currentIndex = audio.trackList.findIndex((track: trackModel) => track.id === song.id)
    audio.replaceTracks(audio.trackList, currentIndex)
  } else {
    // 添加模式：仅添加当前歌曲到播放列表
    audio.addTracks(song)
  }

  // 加载
  await loadTrack()
  play()
}

const handleClearAll = () => {
  audio.setAudioStore('trackList', [])
  if (audioElement.value) {
    audioElement.value.src = ''
  }
}
</script>
<template>
  <el-popover
    :width="450"
    trigger="click"
    placement="top-end"
    popper-class="!rounded-lg !p-0"
  >
    <template #reference>
      <div class="flex items-center">
        <button class="w-10 h-10 rounded-full hover:bg-hoverMenuBg transition flex items-center justify-center">
          <Icon name="List" :size="18" class="text-primary" />
        </button>
      </div>
    </template>
    <div class="bg-popoverBg rounded-lg p-2">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm text-gray-400">最近播放</span>
        <button
          class="w-8 h-8 rounded-full hover:bg-hoverMenuBg transition flex items-center justify-center"
          @click="handleClearAll"
        >
          <Icon name="Delete" :size="16" class="text-gray-500" />
        </button>
      </div>
      <div class="flex flex-col">
        <el-scrollbar class="h-96">
          <div
            v-for="(item, index) in audio.trackList"
            :key="index"
            @dblclick="playMusic(item)"
            @mouseover="mouseOverIndex = index"
            @mouseleave="mouseOverIndex = -1"
            class="flex items-center gap-2 p-2 my-1 rounded-lg transition"
            :class="`hover:bg-gray-300 ${audio.currentSongIndex == index ? 'bg-gray-300 dark:bg-[#414243]' : ''} dark:hover:bg-[#414243] `"
          >
            <div class="w-10 h-auto rounded-lg overflow-hidden">
              <img :src="item.cover" alt="" />
            </div>
            <div class="flex-1">
              <div class="text-sm">{{ item.title }}</div>
              <div class="text-xs text-gray-400">{{ item.artist }}</div>
            </div>
            <div class="text-xs text-gray-400">
              {{ formatMillisecondsToTime(item.duration) }}
            </div>
            <el-button
              v-show="mouseOverIndex == index"
              type="primary"
              text
              circle
              @click="audio.deleteTrack(item.id)"
            >
              <Icon name="Delete" :size="16" class="text-gray-500" />
            </el-button>
          </div>
        </el-scrollbar>
      </div>
    </div>
  </el-popover>
</template>
