<script setup lang="ts">
import { personalized, albumNewest, TopArtists, getMVRanking } from '@/api'
import { API } from '@/api/interface'

// 推荐数据
const recommendData = reactive({
  playlists: [] as API.RecommendPlaylist[],
  albums: [] as any[],
  artists: [] as API.Artist[],
  mvs: [] as API.MVRanking[]
})

// 获取推荐歌单
const getRecommendPlaylists = () => {
  personalized({ limit: 8 }).then(res => {
    recommendData.playlists = res.result
  })
}

// 获取最新专辑
const getNewestAlbums = () => {
  albumNewest<{ albums: any[] }>().then(res => {
    recommendData.albums = res.albums.slice(0, 8)
  })
}

// 获取热门歌手
const getTopArtists = () => {
  TopArtists().then((res: any) => {
    recommendData.artists = res.artists.slice(0, 8)
  })
}

// 获取热门MV
const getHotMVs = () => {
  getMVRanking().then(res => {
    recommendData.mvs = res.data.slice(0, 8)
  })
}

// 加载所有推荐数据
const loadAllRecommendations = () => {
  getRecommendPlaylists()
  getNewestAlbums()
  getTopArtists()
  getHotMVs()
}

// 页面加载时获取推荐数据
onMounted(() => {
  loadAllRecommendations()
})
</script>
<template>
  <div class="p-4 w-full h-full overflow-x-hidden flex flex-col">
    <!-- 推荐内容 -->
    <div class="flex-1 overflow-y-auto">
      <!-- 推荐歌单 -->
      <div class="mb-8">
        <h2 class="text-xl font-bold mb-4">推荐歌单</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <router-link
            v-for="playlist in recommendData.playlists"
            :key="playlist.id"
            :to="`/playlist/${playlist.id}`"
            class="group cursor-pointer"
          >
            <div class="relative overflow-hidden rounded-lg">
              <el-image
                :src="playlist.picUrl + '?param=200y200'"
                fit="cover"
                class="w-full aspect-square object-cover rounded-lg transition-transform duration-300 group-hover:scale-110"
                lazy
              />
              <div class="absolute top-2 right-2 flex items-center bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                <i class="el-icon-video-play mr-1"></i>
                {{ (playlist.playCount / 10000).toFixed(1) }}万
              </div>
            </div>
            <div class="mt-2 text-sm line-clamp-2">{{ playlist.name }}</div>
          </router-link>
        </div>
      </div>

      <!-- 最新专辑 -->
      <div class="mb-8">
        <h2 class="text-xl font-bold mb-4">最新专辑</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <router-link
            v-for="album in recommendData.albums"
            :key="album.id"
            :to="`/album/${album.id}`"
            class="group cursor-pointer"
          >
            <div class="relative overflow-hidden rounded-lg">
              <el-image
                :src="album.picUrl + '?param=200y200'"
                fit="cover"
                class="w-full aspect-square object-cover rounded-lg transition-transform duration-300 group-hover:scale-110"
                lazy
              />
            </div>
            <div class="mt-2 text-sm line-clamp-2">{{ album.name }}</div>
            <div class="text-xs text-gray-500">{{ album.artist.name }}</div>
          </router-link>
        </div>
      </div>

      <!-- 热门歌手 -->
      <div class="mb-8">
        <h2 class="text-xl font-bold mb-4">热门歌手</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <router-link
            v-for="artist in recommendData.artists"
            :key="artist.id"
            :to="`/artist/${artist.id}`"
            class="group cursor-pointer"
          >
            <div class="relative overflow-hidden rounded-full">
              <el-image
                :src="artist.picUrl + '?param=200y200'"
                fit="cover"
                class="w-full aspect-square object-cover rounded-full transition-transform duration-300 group-hover:scale-110"
                lazy
              />
            </div>
            <div class="mt-2 text-sm text-center">{{ artist.name }}</div>
          </router-link>
        </div>
      </div>

      <!-- 推荐MV -->
      <div class="mb-8">
        <h2 class="text-xl font-bold mb-4">推荐MV</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <router-link
            v-for="mv in recommendData.mvs"
            :key="mv.id"
            :to="`/mv/${mv.id}`"
            class="group cursor-pointer"
          >
            <div class="relative overflow-hidden rounded-lg">
              <el-image
                :src="mv.cover + '?param=320y180'"
                fit="cover"
                class="w-full aspect-video object-cover rounded-lg transition-transform duration-300 group-hover:scale-110"
                lazy
              />
              <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <div class="text-white text-sm line-clamp-1">{{ mv.name }}</div>
                <div class="text-white/80 text-xs">{{ mv.artistName }}</div>
              </div>
              <div class="absolute top-2 right-2 flex items-center bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                <i class="el-icon-video-play mr-1"></i>
                {{ (mv.playCount / 10000).toFixed(1) }}万
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
