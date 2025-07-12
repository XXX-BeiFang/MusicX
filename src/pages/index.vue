<script setup lang="ts">
import {
  getTopSong,
  topPlaylist,
  API,
  playlistTrackAll,
  TopArtists,
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

onMounted(async () => {
  // 获取推荐歌单
  const { playlists } = await topPlaylist({
    limit: 6,
    order: 'hot',
    cat: encodeURIComponent('R&B/Soul'),
  })
  recommendeList.value = playlists
  if (Array.isArray(recommendeList.value) && recommendeList.value.length > 0) {
    recommendeList.value[0].id = 745701140
    recommendeList.value[0].name = '阿迪力江的歌单'
    recommendeList.value[0].coverImgUrl = rootGedanImg
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
</script>

<template>
  <div class="flex p-4 w-full">
    <div class="flex-1">
      <!-- banner -->
      <div class="w-full flex flex-col overflow-hidden">
        <div
          class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-200 via-pink-200 to-blue-200 mb-8 dark:bg-gradient-to-r dark:from-pink-900 dark:via-purple-900 dark:to-indigo-900"
        >
          <div class="p-6 pb-20 md:pb-6 banner">
            <div class="max-w-[60%]">
              <h1 class="text-2xl md:text-3xl font-bold text-white mb-2">
                变身/登场/必杀曲合集<br />美少女战士系列OPED
              </h1>
              <p class="text-white/90 mb-4">收录美少女战士系列片头曲+片尾曲+变身/登场/必杀曲</p>
              <div class="flex items-center gap-4 text-sm text-white/80 mb-6">
                <div class="flex items-center gap-2">
                  <icon-tabler:play />
                  10,000+ 播放
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full bg-white/80"></div>
                  120 正在播放
                </div>
              </div>
              <div class="flex gap-3">
                <button
                  @click="router.push('/playlist/2636813460')"
                  class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-black/90 hover:bg-black text-white"
                >
                  <icon-tabler:play />
                  立即播放</button
                ><button
                  class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input hover:text-accent-foreground h-10 px-4 py-2"
                >
                  <icon-material-symbols:add />
                  添加到歌单
                </button>
              </div>
            </div>
          </div>
          <img
            alt="Podcast host illustration"
            width="350"
            height="350"
            class="absolute top-0 right-0 md:right-10"
            src="@/assets/banner/35.png"
          />
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
              class="group cursor-pointer"
            >
              <div class="relative aspect-square rounded-lg overflow-hidden">
                <img
                  :src="playlist.coverImgUrl.startsWith('http') ? playlist.coverImgUrl + '?param=330y330' : playlist.coverImgUrl"
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
              class="backdrop-blur-sm rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
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
                  class="flex p-2 items-center space-x-3 hover:bg-background rounded-md transition-all duration-300"
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
              class="text-center group cursor-pointer"
              @click="router.push(`/artist/${artist.id}`)"
            >
              <div class="aspect-square rounded-full overflow-hidden mb-3">
                <img
                  :src="artist.avatar + '?param=330y330'"
                  :alt="artist.name"
                  class="w-full h-full object-cover transition duration-300 group-hover:scale-110"
                />
              </div>
              <h3 class="font-medium">{{ artist.name }}</h3>
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
</style>
