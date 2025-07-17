<script setup lang="ts">
import {
  getTopSong,
  topPlaylist,
  API,
  playlistTrackAll,
  TopArtists,
  personalized,
  banner,
} from '@/api'
import rootGedanImg from '@/assets/root_gedan.jpg'
import { Icon } from '@iconify/vue'

type ChartItem = {
  id: number
  title: string
  updateTime: string
  songs: API.Song[]
}

const router = useRouter()
const audio = AudioStore()

const { loadTrack, play } = useAudioPlayer()

// 推荐歌单
const recommendeList = ref<API.Playlist[]>([])
// 排行榜
const topSongList = ref<API.TopSongItem[]>([])
// 轮播图数据
const bannerList = ref<any[]>([])
// 当前活动的轮播图
const activeBanner = ref(0)
// 猜你喜欢数据
const personalizedList = ref<API.RecommendPlaylist[]>([])
// 当前悬停的指示器索引
const hoveredIndicator = ref(-1)
// 自动轮播定时器
const autoPlayTimer = ref<NodeJS.Timeout | null>(null)
// 是否暂停自动轮播（鼠标悬停时）
const isPaused = ref(false)

// 轮播图切换函数
const changeBanner = (index: number) => {
  activeBanner.value = index
}

// 上一张轮播图
const previousBanner = () => {
  if (bannerList.value.length === 0) return
  activeBanner.value = activeBanner.value === 0 ? bannerList.value.length - 1 : activeBanner.value - 1
}

// 下一张轮播图
const nextBanner = () => {
  if (bannerList.value.length === 0) return
  activeBanner.value = (activeBanner.value + 1) % bannerList.value.length
}

// 开始自动轮播
const startAutoPlay = () => {
  if (autoPlayTimer.value) {
    clearInterval(autoPlayTimer.value)
  }
  autoPlayTimer.value = setInterval(() => {
    if (!isPaused.value) {
      // 固定12个指示器，循环切换
      activeBanner.value = (activeBanner.value + 1) % 12
    }
  }, 4000) // 每4秒切换一次
}

// 停止自动轮播
const stopAutoPlay = () => {
  if (autoPlayTimer.value) {
    clearInterval(autoPlayTimer.value)
    autoPlayTimer.value = null
  }
}

// 鼠标悬停指示器时切换
const handleIndicatorHover = (index: number) => {
  hoveredIndicator.value = index
  activeBanner.value = index
  isPaused.value = true // 暂停自动轮播
}

// 鼠标离开指示器区域时的处理
const handleIndicatorLeave = () => {
  hoveredIndicator.value = -1
  isPaused.value = false // 恢复自动轮播
}

// 加载状态
const isLoading = ref(true)
const loadingError = ref<string | null>(null)

// 页面挂载时初始化数据
onMounted(async () => {
  isLoading.value = true
  loadingError.value = null

  try {
    // 并行获取轮播图和个性化推荐数据
    const [bannerResult, personalizedResult] = await Promise.allSettled([
      banner(),
      personalized({ limit: 8 })
    ])

    // 处理轮播图数据
    if (bannerResult.status === 'fulfilled') {
      const bannerData = bannerResult.value as any
      if (bannerData && bannerData.banners && Array.isArray(bannerData.banners)) {
        bannerList.value = bannerData.banners.slice(0, 12) // 取前12个轮播图
        // 启动自动轮播
        nextTick(() => {
          startAutoPlay()
        })
      } else {
        console.warn('轮播图数据格式异常:', bannerData)
      }
    } else {
      console.warn('获取轮播图失败:', bannerResult.reason)
    }

    // 处理个性化推荐数据
    if (personalizedResult.status === 'fulfilled') {
      const personalizedData = personalizedResult.value as any
      if (personalizedData && personalizedData.result && Array.isArray(personalizedData.result)) {
        personalizedList.value = personalizedData.result.slice(0, 4) // 取前4个推荐
      } else {
        console.warn('个性化推荐数据格式异常:', personalizedData)
      }
    } else {
      console.warn('获取个性化推荐失败:', personalizedResult.reason)
    }

  } catch (error) {
    console.error('初始化数据失败:', error)
    loadingError.value = '数据加载失败，请刷新页面重试'
  } finally {
    isLoading.value = false
  }

  // 获取推荐歌单
  try {
    // 使用personalized接口获取推荐歌单
    const { result: playlistResult } = await personalized({ limit: 6 })

    // 将第一个歌单设置为固定的自定义歌单
    const customPlaylist = {
      id: 745701140,
      name: '阿迪力江的歌单',
      coverImgUrl: rootGedanImg,
      playCount: 0, // 添加必要的字段
      creator: {} as API.Creator,
      description: '',
      highQuality: false,
      specialType: 0,
      subscribed: false,
      trackCount: 0,
      userId: 0,
      subscribedCount: 0,
      updateTime: 0,
      playlistCount: 0
    }

    // 确保playlistResult是数组
    if (Array.isArray(playlistResult) && playlistResult.length > 0) {
      // 将RecommendPlaylist转换为Playlist类型
      const playlistsFromAPI = playlistResult.map(item => ({
        id: item.id,
        name: item.name,
        coverImgUrl: item.picUrl,
        playCount: item.playCount,
        trackCount: item.trackCount,
        creator: {} as API.Creator,
        description: '',
        highQuality: item.highQuality,
        specialType: 0,
        subscribed: false,
        userId: 0,
        subscribedCount: 0,
        updateTime: item.trackNumberUpdateTime,
        playlistCount: 0
      } as API.Playlist))

      // 合并自定义歌单和API返回的歌单（去掉第一个，总保持6个）
      recommendeList.value = [
        customPlaylist,
        ...playlistsFromAPI.slice(0, 5)
      ]
    } else {
      // 如果API没有返回数据，至少显示自定义歌单
      recommendeList.value = [customPlaylist]
    }
  } catch (error) {
    console.error('获取推荐歌单失败:', error)
    // 发生错误时，至少显示自定义歌单
    recommendeList.value = [{
      id: 745701140,
      name: '阿迪力江的歌单',
      coverImgUrl: rootGedanImg,
      playCount: 0,
      creator: {} as API.Creator,
      description: '',
      highQuality: false,
      specialType: 0,
      subscribed: false,
      trackCount: 0,
      userId: 0,
      subscribedCount: 0,
      updateTime: 0,
      playlistCount: 0
    }]
  }

  // 获取其他数据
  try {
    // 获取排行榜
    const { data } = await getTopSong()
    topSongList.value = data

    // 获取歌手数据
    TopArtists().then((res: any) => {
        if (res && res.artists) {
          artists.value = res.artists.map((item: any) => ({
            id: item.id,
            avatar: item.img1v1Url,
            name: item.name,
            fans: item.fansCount,
          }))
        }
      })

    // 使用配置化的方式定义榜单参数
    const chartConfigs = [
      { id: 3779629, index: 0 }, // 新歌榜
      { id: 3778678, index: 1 }, // 热歌榜
      { id: 19723756, index: 2 }, // 飙升榜
    ]

    // 批量获取榜单数据
    const chartPromises = chartConfigs.map(async ({ id, index }) => {
      try {
        const res: any = await playlistTrackAll({ id, limit: 10 })
        if (res && res.songs) {
          charts.value[index].songs = res.songs
        }
      } catch (error: any) {
        console.error(`获取榜单 ${id} 数据失败:`, error)
        // 如果是404错误，设置空数组避免界面异常
        if (error.response?.status === 404) {
          charts.value[index].songs = []
        }
      }
    })

    // 等待所有榜单数据加载完成
    await Promise.allSettled(chartPromises)
  } catch (error) {
    console.error('获取其他数据失败:', error)
  }
})

// 组件卸载时的清理工作
onUnmounted(() => {
  stopAutoPlay() // 清理定时器
})

const handlePlaylclick = async (row: any) => {
  // 转换歌曲实体
  const track = convertToTrackModel(row)
  // 添加到播放列表
  audio.addTracks(track)
  // 播放
  await loadTrack()
  play()
}

// 榜单数据
const charts = ref<ChartItem[]>([
  {
    id: 1,
    title: '热歌榜',
    updateTime: '今天',
    songs: [],
  },
  {
    id: 2,
    title: '新歌榜',
    updateTime: '今天',
    songs: [],
  },
  {
    id: 3,
    title: '飙升榜',
    updateTime: '今天',
    songs: [],
  },
])
// 歌手
const artists = ref<Pick<API.Artist, 'id' | 'avatar' | 'name' | 'fans'>[]>([])

// 辅助函数：获取轮播图图片路径
const getBannerImage = (item: any) => {
  if (item.pic) {
    // 如果是网易云音乐的图片链接，直接使用，否则添加参数
    if (item.pic.includes('music.126.net')) {
      return item.pic + '?param=600y280'
    } else {
      return item.pic
    }
  } else if (item.picUrl) {
    return item.picUrl.includes('music.126.net') ? item.picUrl + '?param=600y280' : item.picUrl
  } else if (item.imageUrl) {
    return item.imageUrl.includes('music.126.net') ? item.imageUrl + '?param=600y280' : item.imageUrl
  } else {
    return rootGedanImg // 默认图片
  }
}

// 获取歌手名
const getArtistName = (item: any) => {
  if (!item) return '未知歌手'
  // 尝试从不同字段获取歌手名
  if (item.song && item.song.artists && item.song.artists.length > 0) {
    return item.song.artists[0].name
  }
  if (item.artist) return item.artist
  if (item.typeTitle) return item.typeTitle
  return '热门歌手'
}



// 获取歌曲标题
const getSongTitle = (item: any) => {
  if (!item) return '精选推荐'
  if (item.song && item.song.name) return item.song.name
  if (item.typeTitle) return item.typeTitle
  return '热门推荐'
}

// 获取歌曲副标题
const getSongSubtitle = (item: any) => {
  if (!item) return '发现更多精彩内容'
  if (item.song && item.song.album && item.song.album.name) {
    return item.song.album.name
  }
  return '发现更多精彩内容'
}

// 获取轮播图标签
const getBannerTag = (item: any) => {
  if (!item) return '推荐'
  if (item.typeTitle && item.typeTitle.includes('新歌')) return '新歌首发'
  if (item.typeTitle && item.typeTitle.includes('专辑')) return '新专辑'
  if (item.typeTitle && item.typeTitle.includes('MV')) return '热门MV'
  return '热门推荐'
}

// 图片加载错误处理
const handleImageError = (event: Event, item: any) => {
  const img = event.target as HTMLImageElement
  console.warn('轮播图图片加载失败:', item.pic || item.picUrl || item.imageUrl)
  img.src = rootGedanImg // 使用默认图片
}

// 辅助函数：获取推荐卡片图片路径
const getRecommendImage = (item: any) => {
  return item.picUrl ? item.picUrl + '?param=120y120' : rootGedanImg
}

// 辅助函数：导航到轮播图链接
const navigateToBanner = (item: any) => {
  if (item.url) {
    router.push(item.url)
  } else if (item.targetId) {
    router.push(`/playlist/${item.targetId}`)
  } else if (item.encodeId) {
    router.push(`/playlist/${item.encodeId}`)
  }
}
</script>

<template>
  <div class="flex p-4 w-full">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="flex-1 flex items-center justify-center min-h-[400px]">
      <div class="text-center">
        <div class="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-lg text-muted-foreground">正在加载精彩内容...</p>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="loadingError" class="flex-1 flex items-center justify-center min-h-[400px]">
      <div class="text-center">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon icon="material-symbols:error-outline" class="w-8 h-8 text-red-500" />
        </div>
        <p class="text-lg text-red-600 mb-4">{{ loadingError }}</p>
        <button
          @click="location.reload()"
          class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
        >
          重新加载
        </button>
      </div>
    </div>

    <!-- 主要内容 -->
    <div v-else class="flex-1">
      <!-- 现代化音乐轮播区域 -->
      <div class="w-full flex flex-col overflow-hidden">
        <div class="bg-card backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/30 dark:border-white/20 shadow-xl hover:shadow-2xl hover:bg-card/80 transition-all duration-300 hover:scale-[1.02]">
          <!-- 现代化轮播区域 -->
          <div class="flex items-stretch space-x-6 h-[200px]">
            <!-- 左侧轮播图区域 - 网易云风格 -->
            <div class="w-2/5 relative rounded-lg overflow-hidden shadow-lg group h-full">
              <!-- 轮播图容器 -->
              <div class="relative w-full h-full">
                <template v-if="bannerList.length > 0">
                  <div v-for="(item, index) in bannerList" :key="index"
                       class="absolute w-full h-full transition-all duration-500 ease-in-out"
                       :class="index === (activeBanner % bannerList.length) ? 'opacity-100 z-10' : 'opacity-0 z-0'">
                    <img
                      :src="getBannerImage(item)"
                      :alt="item.typeTitle || '推荐'"
                      class="w-full h-full object-cover cursor-pointer"
                      @click="navigateToBanner(item)"
                      @error="handleImageError($event, item)"
                      loading="lazy"
                    />

                    <!-- 右下角标签 -->
                    <div class="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-lg">
                      <span class="text-white text-xs font-semibold tracking-wide">
                        {{ getBannerTag(item) }}
                      </span>
                    </div>
                  </div>
                </template>

                <!-- 底部指示器 - 现代化设计 -->
                <div class="absolute bottom-4 left-4 flex items-center space-x-2 z-20">
                  <div v-for="(_, index) in bannerList" :key="index"
                       @mouseenter="handleIndicatorHover(index)"
                       @mouseleave="handleIndicatorLeave"
                       class="cursor-pointer group relative"
                  >
                    <!-- 活跃指示器的外圈动画 -->
                    <div
                      v-if="index === (activeBanner % bannerList.length)"
                      class="absolute inset-0 w-3 h-3 rounded-full border border-white/80 animate-pulse"
                      style="animation: ripple 2s infinite;"
                    ></div>

                    <!-- 主指示器 -->
                    <div
                      class="relative transition-all duration-500 ease-out transform"
                      :class="[
                        index === (activeBanner % bannerList.length)
                          ? 'w-3 h-3 bg-white rounded-full shadow-lg scale-110'
                          : 'w-2 h-2 bg-white/70 rounded-full hover:bg-white hover:scale-125 group-hover:shadow-lg'
                      ]"
                    >
                      <!-- 内部光点效果 -->
                      <div
                        v-if="index === (activeBanner % bannerList.length)"
                        class="absolute inset-0.5 bg-white/90 rounded-full animate-ping"
                        style="animation-duration: 1.5s;"
                      ></div>
                    </div>

                    <!-- 悬停时的扩散效果 -->
                    <div
                      class="absolute inset-0 w-3 h-3 rounded-full bg-white/20 scale-0 group-hover:scale-150 transition-transform duration-300 ease-out"
                    ></div>
                  </div>
                </div>

                <!-- 左右切换按钮 -->
                <div class="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button @click="previousBanner" class="w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all duration-200">
                    <icon-tabler:chevron-left class="w-5 h-5" />
                  </button>
                </div>
                <div class="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button @click="nextBanner" class="w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all duration-200">
                    <icon-tabler:chevron-right class="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

              <!-- 中间推荐区域 -->
              <div class="flex-1 h-full flex flex-col">
              <div class="mb-1.5">
                <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 drop-shadow-lg inline">下午好，猜你喜欢听</h3>
                <span class="text-sm text-gray-700 dark:text-gray-200 ml-2 drop-shadow-sm">根据你的口味生成专属推荐</span>
              </div>

              <!-- 推荐卡片网格 - 4个歌单2x2排列 -->
              <div class="grid grid-cols-2 gap-1.5 flex-1 -mt-0.5">
                <div v-for="item in personalizedList.slice(0, 4)" :key="item.id"
                     @click="router.push(`/playlist/${item.id}`)"
                     class="rounded-lg bg-card cursor-pointer hover:bg-card/80 transition-all p-2 flex items-center group hover:shadow-md hover:shadow-gray-200/50 dark:hover:shadow-black/50 transform hover:-translate-y-0.5 hover:scale-105 duration-300 border border-white/30 dark:border-white/20 backdrop-blur-md">
                  <!-- 歌单封面 -->
                  <div class="w-10 h-10 overflow-hidden rounded-lg relative shadow-sm flex-shrink-0 mr-2">
                    <img :src="getRecommendImage(item)" :alt="item.name"
                         class="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                         style="object-fit: cover;"/>
                    <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center rounded-lg">
                      <icon-tabler:player-play class="text-white text-xs drop-shadow-lg" />
                    </div>
                  </div>
                  <!-- 歌单信息 -->
                  <div class="flex-1 flex flex-col justify-center min-w-0">
                    <h4 class="text-xs font-medium text-gray-900 dark:text-gray-100 group-hover:text-gray-900 dark:group-hover:text-white transition-colors leading-tight drop-shadow-md line-clamp-2" :title="item.name">{{ item.name }}</h4>
                    <p v-if="item.copywriter" class="text-xs text-gray-700 dark:text-gray-200 mt-0.5 leading-tight line-clamp-1" :title="item.copywriter">{{ item.copywriter }}</p>
                  </div>
                </div>
              </div>
            </div>



          <!-- 右侧ChatGPT入口 -->
            <div
              class="w-1/5 rounded-3xl overflow-hidden relative cursor-pointer h-full bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 hover:from-purple-600 hover:via-blue-600 hover:to-indigo-700 transition-all duration-500 shadow-2xl hover:shadow-3xl transform hover:scale-105 group"
              @click="router.push('/chatGPT')"
            >
              <!-- 装饰性背景动画 -->
              <div class="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div class="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
              <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12 group-hover:scale-125 transition-transform duration-700"></div>

              <div class="relative z-10 p-6 flex flex-col h-full justify-between">
                <div>
                  <h3 class="text-2xl font-bold text-white mb-3 group-hover:text-white/95 transition-colors drop-shadow-lg">ChatGPT</h3>
                  <p class="text-sm text-white/90 line-clamp-3 leading-relaxed group-hover:text-white/95 transition-colors drop-shadow-md">AI智能助手，解答你的问题</p>
                </div>
                <div class="flex justify-end items-end mt-6">
                  <icon-tabler:robot class="w-20 h-20 text-white/20 group-hover:text-white/30 transition-all duration-500 group-hover:scale-110" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- banner end -->

      <!-- 主要内容区域 -->
      <div class="px-4">
        <!-- 推荐歌单 -->
        <div class="bg-card backdrop-blur-md rounded-2xl p-6 border border-white/30 dark:border-white/20 shadow-xl hover:shadow-2xl hover:bg-card/80 transition-all duration-300 hover:scale-[1.02]">
          <div class="flex items-center justify-between mb-4">
            <div
              class="flex items-center gap-2 cursor-pointer group transition-all duration-300"
              @click="router.push('/playlist')"
            >
              <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 drop-shadow-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">推荐歌单</h2>
              <icon-tabler:chevron-right class="text-gray-600 dark:text-gray-400 text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all duration-300 group-hover:scale-110 group-hover:translate-x-1" />
            </div>
          </div>
          <div class="grid grid-cols-6 gap-4">
            <div
              v-for="playlist in recommendeList"
              :key="playlist.id"
              @click="router.push(`/playlist/${playlist.id}`)"
              class="rounded-xl bg-card backdrop-blur-md cursor-pointer hover:bg-card/80 transition-all p-3 flex flex-col items-center group hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-black/50 transform hover:-translate-y-1 hover:scale-105 duration-300 border border-white/30 dark:border-white/20"
            >
              <div class="w-full aspect-square overflow-hidden rounded-lg mb-3 relative shadow-md">
                <img
                  :src="playlist.coverImgUrl?.startsWith('http') ? playlist.coverImgUrl + '?param=330y330' : playlist.coverImgUrl"
                  :alt="playlist.name"
                  class="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                />
                <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center rounded-lg">
                  <icon-tabler:player-play class="text-white text-lg drop-shadow-lg" />
                </div>
                <div class="absolute top-2 right-2 flex items-center space-x-1 text-white text-xs bg-black/40 backdrop-blur-sm rounded-full px-2 py-1 drop-shadow-lg">
                  <icon-ic:outline-remove-red-eye class="text-xs" />
                  <span>{{ playlist.playCount }}</span>
                </div>
              </div>
              <span class="text-xs line-clamp-2 text-center font-medium text-gray-900 dark:text-gray-100 drop-shadow-lg group-hover:text-gray-900 dark:group-hover:text-white transition-colors leading-tight">{{ playlist.name }}</span>
            </div>
          </div>
        </div>

        <!-- 增加排行榜区域 -->
        <div class="mt-8 bg-card backdrop-blur-md rounded-2xl p-6 border border-white/30 dark:border-white/20 shadow-xl hover:shadow-2xl hover:bg-card/80 transition-all duration-300 hover:scale-[1.02]">
          <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 drop-shadow-lg mb-4">音乐排行榜</h2>
          <div class="grid grid-cols-3 gap-4">
            <div
              v-for="chart in charts"
              :key="chart.id"
              class="bg-card backdrop-blur-md rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:bg-card/80 border border-white/30 dark:border-white/20 hover:scale-105"
            >
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-base font-bold text-gray-900 dark:text-gray-100 drop-shadow-lg">{{ chart.title }}</h3>
                <span class="text-xs text-gray-700 dark:text-gray-200">{{ chart.updateTime }}</span>
              </div>
              <div class="space-y-1">
                <div
                  v-for="(song, index) in chart.songs"
                  :key="index"
                  @dblclick="handlePlaylclick(song)"
                  class="flex p-2 items-center space-x-3 hover:bg-white/30 dark:hover:bg-black/30 rounded-lg transition-all duration-200 cursor-pointer group hover:scale-105"
                >
                  <span
                    class="text-sm font-bold w-6 text-center drop-shadow-md"
                    :class="index < 3 ? 'text-yellow-400' : 'text-gray-700 dark:text-gray-200'"
                    >{{ index + 1 }}</span
                  >
                  <div class="flex-1 min-w-0">
                    <h4 class="font-medium truncate text-sm text-gray-900 dark:text-gray-100 drop-shadow-lg group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{{ song.name }}</h4>
                    <p class="text-xs text-gray-700 dark:text-gray-200 truncate">
                      {{ song.ar.map((item) => item.name).join(', ') }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-8 mb-24 bg-card backdrop-blur-md rounded-2xl p-6 border border-white/30 dark:border-white/20 shadow-xl hover:shadow-2xl hover:bg-card/80 transition-all duration-300 hover:scale-[1.02]">
          <div class="flex items-center justify-between mb-4">
            <div
              class="flex items-center gap-2 cursor-pointer group transition-all duration-300"
              @click="router.push('/artist')"
            >
              <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 drop-shadow-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">热门歌手</h2>
              <icon-tabler:chevron-right class="text-gray-600 dark:text-gray-400 text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all duration-300 group-hover:scale-110 group-hover:translate-x-1" />
            </div>
          </div>
          <div class="grid grid-cols-6 gap-4">
            <div
              v-for="artist in artists"
              :key="artist.id"
              class="text-center group cursor-pointer transform transition-all duration-300 hover:-translate-y-1 hover:scale-105 bg-card backdrop-blur-md rounded-xl p-3 hover:bg-card/80 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-black/50 border border-white/30 dark:border-white/20"
              @click="router.push(`/artist/${artist.id}`)"
            >
              <div class="aspect-square rounded-full overflow-hidden mb-3 shadow-md">
                <img
                  :src="artist.avatar + '?param=330y330'"
                  :alt="artist.name"
                  class="w-full h-full object-cover transition duration-300 group-hover:scale-110"
                />
              </div>
              <h3 class="font-medium text-gray-900 dark:text-gray-100 drop-shadow-lg group-hover:text-gray-900 dark:group-hover:text-white transition-colors text-sm">{{ artist.name }}</h3>
              <p class="text-xs text-gray-700 dark:text-gray-200">{{ artist.fans }} 粉丝</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.banner {
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEMAAABkCAMAAADqvX3PAAAAKlBMVEUAAADX19fX19fBwcHT09PX19fW1tbT09PW1tbV1dXOzs7Ozs7BwcHV1dX5uIg2AAAADnRSTlMAPQAKH0czAAApFAAAAHys1goAAAHwSURBVHja7ZfdcuMwCEb1GUIDcd//dZuk2n5rZzCKOzuzFzo3+XNOBAIHtQosxwi0XUw/jjh2qN1pVzV43FJwJIDLuq5tvaNmzxeEZI5wWP/p9v0gypgGYhGH8fL28yyM7ycOJkFlJW3tZDHhRdBjIO22JR6a1BGMgTAWopvr6BC1jSB1MDWyXYfvkpDlg4iiV83lITiuoXZL+U4/ltcNq2MhogaYBWMYjYU8HHfSRdTrCIOLYImemrfz8dMO6DlVGYyFMWz3tmuGY6GgO1ikXVM51JDXurBO0nyEcyPTnvOXvmyb0hzqfV64jUUYw47Re9CZe6EbeC+M39+TcfK/gTFZuxZgOSag7aMASwGkrQW1Y2lLwXRMx3RMx3T8Pw67FpSOcA5RCccOcTMNL05aRw7Fn2kizA7+1VNH6ENAOBgOxiIK888dHPVqh+Q/yeknzQfHkhx+nqyjT0QFzDUd2Skp53lp7PdFnEkYIhzQv/KRzJUV0QdDSON5+S14CEW0vqSTiAPWWDknCLsY0BZxnNP0L/Z9YQEO8yznXZ2yNwfgTu7rNFgj9aamvS9eZljMTNOeoybSGNwQkvZ+3XrCU07t4HmWSBjDLBzEwdSzhMYcRPRZNYmgdjA1FyahcKQIqpKZs8N0TMd0TMd0/BvHF8n9f8tHo7HcAAAAAElFTkSuQmCC),
    linear-gradient(to right, #fd31a2, #ff3a8b, #ff4b78, #cf4af3, #e73bd7);
}

/* 排行榜悬停效果 */
.backdrop-blur-sm {
  transition: all 0.3s ease;
}

/* 轮播指示器现代化动画效果 */
@keyframes ripple {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.4);
    opacity: 0.7;
  }
  100% {
    transform: scale(1.8);
    opacity: 0;
  }
}

@keyframes indicator-glow {
  0%, 100% {
    box-shadow: 0 0 12px rgba(255, 255, 255, 0.6), 0 0 20px rgba(255, 255, 255, 0.4);
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.8), 0 0 30px rgba(255, 255, 255, 0.6);
  }
}

@keyframes progress-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 指示器形状变换动画 */
@keyframes morphToRect {
  0% {
    border-radius: 50%;
    transform: scale(1);
  }
  100% {
    border-radius: 20%;
    transform: scale(1.1);
  }
}

@keyframes morphToCircle {
  0% {
    border-radius: 20%;
    transform: scale(1.1);
  }
  100% {
    border-radius: 50%;
    transform: scale(1);
  }
}

/* 指示器状态样式 */
.indicator-active {
  animation: indicator-glow 3s ease-in-out infinite;
}

.progress-ring {
  animation: progress-ring 4s linear infinite;
}

/* 指示器悬停时的光晕效果 */
.group:hover .absolute.inset-0 {
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.6);
}

/* 毛玻璃效果增强 */
.backdrop-blur-xl {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.backdrop-blur-sm:hover {
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  transform: translateY(-5px);
}
</style>
