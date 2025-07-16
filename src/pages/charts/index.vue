<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">音乐排行榜</h1>
      <p class="text-gray-600 dark:text-gray-300">发现最热门的音乐作品</p>
    </div>

    <!-- 排行榜网格 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="chart in charts"
        :key="chart.id"
        class="bg-card backdrop-blur-md rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:bg-card/80 border border-white/30 dark:border-white/20 hover:scale-105 cursor-pointer"
        @click="handleChartClick(chart)"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 drop-shadow-lg">{{ chart.title }}</h3>
          <span class="text-sm text-gray-600 dark:text-gray-200">{{ chart.updateTime }}</span>
        </div>
        
        <div class="space-y-3">
          <div
            v-for="(song, index) in chart.songs.slice(0, 5)"
            :key="index"
            @dblclick="handlePlaylclick(song)"
            class="flex p-3 items-center space-x-3 hover:bg-white/30 dark:hover:bg-black/30 rounded-lg transition-all duration-200 cursor-pointer group hover:scale-105"
          >
            <span
              class="text-sm font-bold w-6 text-center drop-shadow-md"
              :class="index < 3 ? 'text-yellow-400' : 'text-gray-700 dark:text-gray-200'"
            >{{ index + 1 }}</span>
            
            <div class="flex-1 min-w-0">
              <h4 class="font-medium truncate text-sm text-gray-900 dark:text-gray-100 drop-shadow-lg group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{{ song.name }}</h4>
              <p class="text-xs text-gray-700 dark:text-gray-200 truncate">
                {{ song.ar.map((item) => item.name).join(', ') }}
              </p>
            </div>
            
            <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <icon-tabler:player-play class="text-gray-600 dark:text-gray-300 text-sm" />
            </div>
          </div>
        </div>
        
        <div class="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
            <span>共 {{ chart.songs.length }} 首歌曲</span>
            <div class="flex items-center gap-1 group-hover:gap-2 transition-all duration-300">
              <span>查看完整榜单</span>
              <icon-tabler:chevron-right class="text-xs transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 如果没有数据 -->
    <div v-if="charts.length === 0" class="text-center py-12">
      <div class="text-gray-400 dark:text-gray-500 mb-4">
        <icon-tabler:music-off class="text-6xl mx-auto mb-4" />
        <p class="text-lg">暂无排行榜数据</p>
        <p class="text-sm">请稍后再试</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 排行榜数据
const charts = ref([
  {
    id: 1,
    title: '热歌榜',
    updateTime: '每日更新',
    songs: [
      { name: '示例歌曲1', ar: [{ name: '示例歌手1' }] },
      { name: '示例歌曲2', ar: [{ name: '示例歌手2' }] },
      { name: '示例歌曲3', ar: [{ name: '示例歌手3' }] },
      { name: '示例歌曲4', ar: [{ name: '示例歌手4' }] },
      { name: '示例歌曲5', ar: [{ name: '示例歌手5' }] },
    ]
  },
  {
    id: 2,
    title: '新歌榜',
    updateTime: '每日更新',
    songs: [
      { name: '新歌示例1', ar: [{ name: '新歌手1' }] },
      { name: '新歌示例2', ar: [{ name: '新歌手2' }] },
      { name: '新歌示例3', ar: [{ name: '新歌手3' }] },
      { name: '新歌示例4', ar: [{ name: '新歌手4' }] },
      { name: '新歌示例5', ar: [{ name: '新歌手5' }] },
    ]
  },
  {
    id: 3,
    title: '飙升榜',
    updateTime: '每日更新',
    songs: [
      { name: '飙升歌曲1', ar: [{ name: '飙升歌手1' }] },
      { name: '飙升歌曲2', ar: [{ name: '飙升歌手2' }] },
      { name: '飙升歌曲3', ar: [{ name: '飙升歌手3' }] },
      { name: '飙升歌曲4', ar: [{ name: '飙升歌手4' }] },
      { name: '飙升歌曲5', ar: [{ name: '飙升歌手5' }] },
    ]
  }
])

// 处理排行榜点击
const handleChartClick = (chart: any) => {
  console.log('点击排行榜:', chart.title)
  // 这里可以跳转到具体的排行榜详情页
}

// 处理歌曲播放
const handlePlaylclick = (song: any) => {
  console.log('播放歌曲:', song.name)
  // 这里可以添加播放逻辑
}

onMounted(() => {
  // 这里可以加载真实的排行榜数据
  console.log('排行榜页面加载完成')
})
</script>

<style scoped>
/* 可以添加额外的样式 */
</style>
