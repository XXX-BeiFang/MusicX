<script setup lang="ts">
import { ref } from 'vue'
import { settingStore } from '@/stores/modules/setting'
import { AudioStore } from '@/stores/modules/audio'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import { convertToTrackModel } from '@/utils'

const setting = settingStore()
const audio = AudioStore()
const { loadTrack, play } = useAudioPlayer()

// 模拟歌曲数据
const mockSongs = ref([
  {
    id: 1,
    name: '测试歌曲 1',
    ar: [{ name: '测试歌手 1' }],
    al: { name: '测试专辑 1', picUrl: 'https://via.placeholder.com/100' },
    dt: 180000
  },
  {
    id: 2,
    name: '测试歌曲 2',
    ar: [{ name: '测试歌手 2' }],
    al: { name: '测试专辑 2', picUrl: 'https://via.placeholder.com/100' },
    dt: 200000
  },
  {
    id: 3,
    name: '测试歌曲 3',
    ar: [{ name: '测试歌手 3' }],
    al: { name: '测试专辑 3', picUrl: 'https://via.placeholder.com/100' },
    dt: 220000
  }
])

// 双击播放测试
const handleTestPlay = async (song: any) => {
  const track = convertToTrackModel(song)

  if (setting.playlistDoubleClickBehavior === 'replace') {
    const allTracks = mockSongs.value.map(s => convertToTrackModel(s))
    const currentIndex = mockSongs.value.findIndex(s => s.id === song.id)
    audio.replaceTracks(allTracks, currentIndex)
    console.log('替换播放列表模式：', allTracks, '当前索引：', currentIndex)
  } else {
    audio.addTracks(track)
    console.log('添加模式：', track)
  }

  console.log('当前播放列表：', audio.trackList)
  console.log('当前播放索引：', audio.currentSongIndex)
}

// 清空播放列表
const clearPlaylist = () => {
  audio.setAudioStore('trackList', [])
  audio.setAudioStore('currentSongIndex', 0)
}
</script>

<template>
  <div class="p-6 max-w-4xl mx-auto">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">播放列表双击行为测试</h1>
      <p class="text-gray-600 dark:text-gray-400">测试不同的双击行为设置</p>
    </div>

    <!-- 当前设置显示 -->
    <div class="mb-6 rounded-lg border bg-card text-card-foreground shadow-sm">
      <div class="p-4">
        <h2 class="text-lg font-semibold mb-2">当前设置</h2>
        <div class="flex items-center space-x-2">
          <icon-material-symbols:playlist-play class="text-primary" />
          <span class="text-sm">双击行为：</span>
          <span class="font-medium text-primary">
            {{ setting.playlistDoubleClickBehavior === 'replace' ? '替换播放列表' : '添加到播放列表' }}
          </span>
        </div>
        <p class="text-xs text-muted-foreground mt-2">
          可以在设置页面修改此行为
        </p>
      </div>
    </div>

    <!-- 当前播放列表状态 -->
    <div class="mb-6 rounded-lg border bg-card text-card-foreground shadow-sm">
      <div class="p-4">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-semibold">当前播放列表状态</h2>
          <el-button @click="clearPlaylist" type="danger" size="small">
            <icon-material-symbols:clear-all class="mr-1" />
            清空播放列表
          </el-button>
        </div>
        <div class="grid grid-cols-2 gap-4 mb-3">
          <div class="text-sm">
            <span class="text-muted-foreground">播放列表长度：</span>
            <span class="font-medium">{{ audio.trackList.length }}</span>
          </div>
          <div class="text-sm">
            <span class="text-muted-foreground">当前播放索引：</span>
            <span class="font-medium">{{ audio.currentSongIndex }}</span>
          </div>
        </div>
        <div v-if="audio.trackList.length > 0" class="space-y-1 max-h-32 overflow-y-auto">
          <div v-for="(track, index) in audio.trackList" :key="track.id"
               class="text-xs p-2 rounded border"
               :class="index === audio.currentSongIndex ? 'bg-primary/10 border-primary text-primary font-medium' : 'bg-muted/50'">
            {{ index + 1 }}. {{ track.title }} - {{ track.artist }}
          </div>
        </div>
        <p v-else class="text-sm text-muted-foreground text-center py-4">播放列表为空</p>
      </div>
    </div>

    <!-- 测试歌曲列表 -->
    <div class="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
      <div class="p-4 border-b">
        <h2 class="text-lg font-semibold">测试歌曲列表</h2>
        <p class="text-sm text-muted-foreground">双击歌曲测试不同的播放行为</p>
      </div>
      <div class="divide-y">
        <div
          v-for="song in mockSongs"
          :key="song.id"
          @dblclick="handleTestPlay(song)"
          class="p-4 hover:bg-muted/50 cursor-pointer transition-colors duration-200"
        >
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
              <icon-material-symbols:music-note class="text-muted-foreground" />
            </div>
            <div class="flex-1">
              <h3 class="font-medium">{{ song.name }}</h3>
              <p class="text-sm text-muted-foreground">{{ song.ar[0].name }} • {{ song.al.name }}</p>
            </div>
            <div class="text-sm text-muted-foreground">
              {{ Math.floor(song.dt / 60000) }}:{{ String(Math.floor((song.dt % 60000) / 1000)).padStart(2, '0') }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作说明 -->
    <div class="mt-6 rounded-lg border bg-card text-card-foreground shadow-sm">
      <div class="p-4">
        <div class="flex items-center space-x-2 mb-3">
          <icon-material-symbols:info class="text-primary" />
          <h3 class="font-semibold">操作说明</h3>
        </div>
        <ul class="text-sm text-muted-foreground space-y-2">
          <li class="flex items-center space-x-2">
            <icon-material-symbols:mouse class="text-xs" />
            <span>双击任意歌曲测试播放行为</span>
          </li>
          <li class="flex items-center space-x-2">
            <icon-material-symbols:settings class="text-xs" />
            <span>在设置页面切换"替换播放列表"和"添加到播放列表"模式</span>
          </li>
          <li class="flex items-center space-x-2">
            <icon-material-symbols:visibility class="text-xs" />
            <span>观察播放列表状态的变化</span>
          </li>
          <li class="flex items-center space-x-2">
            <icon-material-symbols:refresh class="text-xs" />
            <span>使用"清空播放列表"按钮重置状态</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
