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
// 控制左右箭头的显示
const showArrows = ref(false)

// 轮播图切换函数
const changeBanner = (index: number) => {
  activeBanner.value = index
}

// 手动切换到上一张或下一张
const prevBanner = () => {
  activeBanner.value = (activeBanner.value - 1 + bannerList.value.length) % bannerList.value.length
}

const nextBanner = () => {
  activeBanner.value = (activeBanner.value + 1) % bannerList.value.length
}

// 定时切换轮播图
let bannerTimer: any = null
const startBannerTimer = () => {
  bannerTimer = setInterval(() => {
    activeBanner.value = (activeBanner.value + 1) % (bannerList.value.length || 1)
  }, 5000) // 5秒切换一次
}

// 清除定时器
const clearBannerTimer = () => {
  if (bannerTimer) {
    clearInterval(bannerTimer)
  }
}

// 鼠标进入轮播图区域
const handleMouseEnter = () => {
  clearBannerTimer()
  showArrows.value = true
}

// 鼠标离开轮播图区域
const handleMouseLeave = () => {
  startBannerTimer()
  showArrows.value = false
}

// 页面挂载时初始化数据
onMounted(async () => {
  try {
    // 获取轮播图数据
    const bannerData: any = await banner()
    if (bannerData && bannerData.banners) {
      bannerList.value = bannerData.banners.slice(0, 6) // 取前6个轮播图
      // 启动轮播定时器
      startBannerTimer()
    }

    // 获取个性化推荐数据(猜你喜欢)
    const { result } = await personalized({ limit: 8 })
    if (Array.isArray(result) && result.length > 0) {
      personalizedList.value = result.slice(0, 4) // 取前4个推荐
    }
  } catch (error) {
    console.error('获取banner或个性化推荐失败:', error)
  }

  // 获取推荐歌单
  try {
    // 使用personalized接口获取推荐歌单
    const { result } = await personalized({ limit: 6 })
    
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
    
    // 确保result是数组
    if (Array.isArray(result) && result.length > 0) {
      // 将RecommendPlaylist转换为Playlist类型
      const playlistsFromAPI = result.map(item => ({
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

  // 获取排行榜
  const { data } = await getTopSong()
  topSongList.value = data

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
  Promise.all(
    chartConfigs.map(({ id }) => playlistTrackAll({ id, limit: 10 }))
  ).then((results) => {
    results.forEach((res: any, i: number) => {
      if (res && res.songs) {
        charts.value[chartConfigs[i].index].songs = res.songs
      }

    })
  })
})

// 组件卸载时清除定时器
onUnmounted(() => {
  clearBannerTimer()
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
  if (item.picUrl) {
    return item.picUrl + '?param=300y160' // 调整图片大小
  } else if (item.imageUrl) {
    return item.imageUrl + '?param=300y160'
  } else {
    return rootGedanImg // 默认图片
  }
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
    <div class="flex-1">
      <!-- 网易云音乐风格banner -->
      <div class="w-full flex flex-col overflow-hidden">
        <div class="bg-white/5 rounded-lg p-4 mb-8">
          <!-- 网易云风格轮播区域 -->
          <div class="flex items-start space-x-4">
            <!-- 左侧轮播图区域 -->
            <div class="w-2/5 relative rounded-lg overflow-hidden h-[160px]" 
                 @mouseenter="handleMouseEnter" 
                 @mouseleave="handleMouseLeave">
              <template v-if="bannerList.length > 0">
                <div v-for="(item, index) in bannerList" :key="index" 
                     class="absolute w-full h-full transition-opacity duration-500"
                     :class="index === activeBanner ? 'opacity-100 z-10' : 'opacity-0 z-0'">
                  <img 
                    :src="getBannerImage(item)"
                    :alt="item.typeTitle || '推荐'"
                    class="w-full h-full object-cover rounded-lg"
                    @click="navigateToBanner(item)"
                  />
                  <div class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <div class="flex items-center justify-between">
                      <button 
                        class="px-4 py-1 bg-black/50 text-white text-xs rounded-full hover:bg-black/70 transition"
                        @click.stop="navigateToBanner(item)"
                      >
                        立即前往
                      </button>
                      <span class="text-white/80 text-xs">{{ item.typeTitle || '热门推荐' }}</span>
                    </div>
                  </div>
                </div>
              </template>
              <!-- <div v-else class="w-full h-full">
                <img
                  src="@/assets/banner/963.png" 
                  alt="默认轮播图" 
                  class="w-full h-full object-cover rounded-lg"
                />
                <div class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                  <div class="flex items-center justify-between">
                    <button class="px-4 py-1 bg-black/50 text-white text-xs rounded-full">立即播放</button>
                    <span class="text-white/80 text-xs">推荐音乐</span>
                  </div>
                </div>
              </div> -->
              
              <!-- 左右箭头导航 -->
              <!-- <div class="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-between px-2 pointer-events-none">
                <button 
                  @click.stop="prevBanner" 
                  class="w-8 h-8 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 transition-all pointer-events-auto"
                  :class="showArrows ? 'opacity-100' : 'opacity-0'"
                >
                  <icon-tabler:chevron-left class="text-xl" />
                </button>
                <button 
                  @click.stop="nextBanner" 
                  class="w-8 h-8 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 transition-all pointer-events-auto"
                  :class="showArrows ? 'opacity-100' : 'opacity-0'"
                >
                  <icon-tabler:chevron-right class="text-xl" />
                </button>
              </div> -->
              
              <!-- 轮播指示器 - 修改为正下方位置 -->
              <div class="absolute bottom-4 left-0 right-0 flex justify-center z-20">
                <div class="flex space-x-2 bg-black/30 px-2 py-1 rounded-full">
                  <div v-for="(_, index) in bannerList" :key="index"
                       @click.stop="changeBanner(index)"
                       @mouseenter="changeBanner(index)"
                       class="w-2 h-2 rounded-full cursor-pointer transition-all duration-300"
                       :class="index === activeBanner ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'"></div>
                </div>
              </div>
            </div>
            
            <!-- 中间推荐区域 -->
            <div class="flex-1 h-full">
              <div class="mb-3">
                <h3 class="text-lg font-medium">下午好，猜你喜欢听</h3>
                <p class="text-sm text-gray-500">根据你的口味生成专属推荐</p>
              </div>
              
              <!-- 推荐卡片网格 -->
              <div class="grid grid-cols-4 gap-2">
                <div v-for="item in personalizedList" :key="item.id" 
                     @click="router.push(`/playlist/${item.id}`)"
                     class="rounded bg-gray-100/10 cursor-pointer hover:bg-gray-100/20 transition p-2 flex flex-col justify-center items-center group hover:shadow-lg hover:shadow-primary transform hover:-translate-y-1 duration-300">
                  <div class="w-14 h-14 overflow-hidden rounded mb-2 relative">
                    <div class="aspect-square w-full h-full">
                      <img :src="getRecommendImage(item)" :alt="item.name" 
                           class="w-full h-full object-cover group-hover:scale-110 transition duration-300" 
                           style="object-fit: cover;"/>
                    </div>
                    <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <icon-tabler:player-play class="text-white text-xl" />
                    </div>
                  </div>
                  <span class="text-xs line-clamp-2 text-center">{{ item.name }}</span>
                </div>
              </div>
            </div>
            
            <!-- 右侧ChatGPT入口 -->
            <div 
              class="w-1/5 rounded-lg overflow-hidden relative cursor-pointer h-[160px] theme-gradient"
              @click="router.push('/chatGPT')"
            >
              <div class="p-3 flex flex-col h-full justify-between">
                <div>
                  <h3 class="font-bold text-white mb-1">ChatGPT</h3>
                  <p class="text-xs text-white/80 line-clamp-2">AI智能助手，解答你的问题</p>
                </div>
                <div class="flex justify-end mt-4">
                  <icon-tabler:robot class="w-16 h-16 text-white/30" />
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
        <div class="mt-4">
          <div class="flex items-center mb-6 cursor-pointer group" @click="router.push('/playlist')">
            <h2 class="text-2xl font-bold mr-2 group-hover:text-primary">推荐歌单</h2>
            <icon-ep:arrow-right-bold class="text-xl group-hover:text-primary" />
          </div>
          <div class="grid grid-cols-6 gap-6">
            <div
              v-for="playlist in recommendeList"
              :key="playlist.id"
              @click="router.push(`/playlist/${playlist.id}`)"
              class="group cursor-pointer transform transition-all duration-300 hover:shadow-xl hover:shadow-primary hover:-translate-y-1 rounded-lg"
            >
              <div class="relative aspect-square rounded-lg overflow-hidden">
                <img
                  :src="playlist.coverImgUrl?.startsWith('http') ? playlist.coverImgUrl + '?param=330y330' : playlist.coverImgUrl"
                  :alt="playlist.name"
                  class="w-full h-full object-cover transition duration-300 group-hover:scale-110"
                />
                <div
                  class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
                />
                <div
                  class="absolute top-1 right-2 flex items-center space-x-1 text-white"
                >
                  <icon-ic:outline-remove-red-eye />
                  <span class="text-sm">{{ playlist.playCount }}</span>
                </div>
                <div class="absolute bottom-2 left-0 right-0">
                  <h3
                    class="px-3 text-sm font-medium text-white z-10 line-clamp-2"
                  >
                    {{ playlist.name }}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 增加排行榜区域 -->
        <div class="mt-12">
          <h2 class="text-2xl font-bold mb-6">音乐排行榜</h2>
          <div class="grid grid-cols-3 gap-6">
            <div
              v-for="chart in charts"
              :key="chart.id"
              class="backdrop-blur-sm rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:bg-gray-100/10 dark:hover:bg-gray-800/20"
            >
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-bold">{{ chart.title }}</h3>
                <span class="text-sm text-gray-500"
                  >更新时间: {{ chart.updateTime }}</span
                >
              </div>
              <div class="">
                <div
                  v-for="(song, index) in chart.songs"
                  :key="index"
                  @dblclick="handlePlaylclick(song)"
                  class="flex p-2 items-center space-x-3 hover:bg-gray-100/30 dark:hover:bg-gray-700/30 rounded-md transition-all duration-300 transform hover:translate-x-1 hover:shadow-sm cursor-pointer"
                >
                  <span
                    class="text-lg font-bold"
                    :class="index < 3 ? 'text-primary' : 'text-gray-400'"
                    >{{ index + 1 }}</span
                  >
                  <div class="flex-1">
                    <h4 class="font-medium truncate">{{ song.name }}</h4>
                    <p class="text-sm text-gray-500 truncate">
                      {{ song.ar.map((item) => item.name).join() }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-12 mb-24">
          <div class="flex items-center mb-6 cursor-pointer group" @click="router.push('/artist')">
            <h2 class="text-2xl font-bold mr-2 group-hover:text-primary">热门歌手</h2>
            <icon-ep:arrow-right-bold class="text-xl group-hover:text-primary" />
          </div>
          <div class="grid grid-cols-6 gap-6">
            <div
              v-for="artist in artists"
              :key="artist.id"
              class="text-center group cursor-pointer transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary"
              @click="router.push(`/artist/${artist.id}`)"
            >
              <div class="aspect-square rounded-full overflow-hidden mb-3">
                <img
                  :src="artist.avatar + '?param=330y330'"
                  :alt="artist.name"
                  class="w-full h-full object-cover transition duration-300 group-hover:scale-110"
                />
              </div>
              <h3 class="font-medium group-hover:text-primary transition-colors">{{ artist.name }}</h3>
              <p class="text-sm text-gray-500">{{ artist.fans }} 粉丝</p>
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

.backdrop-blur-sm:hover {
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  transform: translateY(-5px);
}
</style>
