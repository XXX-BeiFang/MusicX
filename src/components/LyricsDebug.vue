<script setup lang="ts">
import { ref } from 'vue'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import * as LyricsPage from '@/components/LyricsPage/index.vue'

const { currentTrack, isPlaying } = useAudioPlayer()
const showLyricsPage = ref(false)

// 测试数据
const testTrack = {
  id: '27591651',
  title: 'Intro AE 86',
  artist: '陈光荣',
  album: '頭文字[イニシャル]D THE MOVIE SOUND TUNE',
  cover: 'http://p4.music.126.net/9KeyafHLjadqSQTRS_tN5Q==/5741649720318487.jpg',
  url: 'http://music.163.com/song/media/outer/url?id=27591651.mp3',
  duration: 149000,
  lyrics: {
    lines: [
      { time: 0, lrc: '这是测试歌词第一行' },
      { time: 5000, lrc: '这是测试歌词第二行' },
      { time: 10000, lrc: '这是测试歌词第三行' },
      { time: 15000, lrc: '这是测试歌词第四行' },
      { time: 20000, lrc: '这是测试歌词第五行' }
    ],
    lyricUser: '测试用户',
    transUser: '',
    remark: '测试歌词'
  }
}

const openLyricsPage = () => {
  showLyricsPage.value = true
}

const closeLyricsPage = () => {
  showLyricsPage.value = false
}
</script>

<template>
  <div class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
    <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">歌词页面调试工具</h2>
    
    <div class="space-y-4 mb-6">
      <div>
        <h3 class="text-lg font-semibold mb-2">当前歌曲信息:</h3>
        <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded">
          <p><strong>标题:</strong> {{ currentTrack.title || '无' }}</p>
          <p><strong>艺术家:</strong> {{ currentTrack.artist || '无' }}</p>
          <p><strong>播放状态:</strong> {{ isPlaying ? '播放中' : '暂停' }}</p>
          <p><strong>歌词数据:</strong> {{ currentTrack.lyrics ? '已加载' : '未加载' }}</p>
          <p><strong>歌词行数:</strong> {{ currentTrack.lyrics?.lines?.length || 0 }}</p>
        </div>
      </div>
      
      <div>
        <h3 class="text-lg font-semibold mb-2">测试操作:</h3>
        <div class="flex gap-4">
          <button 
            @click="openLyricsPage"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            打开歌词页面
          </button>
          
          <button 
            @click="closeLyricsPage"
            class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            关闭歌词页面
          </button>
        </div>
      </div>
      
      <div>
        <h3 class="text-lg font-semibold mb-2">状态信息:</h3>
        <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded">
          <p><strong>歌词页面状态:</strong> {{ showLyricsPage ? '已打开' : '已关闭' }}</p>
          <p><strong>组件路径:</strong> src/components/LyricsPage/index.vue</p>
        </div>
      </div>
    </div>
    
    <!-- 歌词页面组件 -->
    <LyricsPage.default v-if="showLyricsPage" v-model="showLyricsPage" />
  </div>
</template>

<style scoped>
.debug-info {
  font-family: 'Courier New', monospace;
  font-size: 12px;
}
</style>
