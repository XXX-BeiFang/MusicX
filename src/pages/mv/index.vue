<script setup lang="ts">
import { formatNumber, formatMillisecondsToTime } from '@/utils'
import { getAllMV, API } from '@/api'
import { mvTabs, areasList, orderList } from '@/utils/enum'

const { pause } = useAudioPlayer()
const router = useRouter()
const videos = ref<API.MV[]>([])

// 轮播图
const bannerList = [
  {
    id: 5646424,
    title: 'Catch the Moment 中文版',
    artist: 'JAY',
    cover: '',
  },
  {
    id: 2,
    title: 'Catch the Moment 中文版',
  },
]

// MV 类型
const selected = ref('全部')
// 区域
const selectedArea = ref('全部')
// 排序
const selectedOrder = ref('上升最快')

onMounted(() => {
  handlegetAllMV()
})

const handlegetAllMV = () => {
  getAllMV({
    area: selectedArea.value,
    order: selectedOrder.value,
    type: selected.value,
    limit: 30,
  }).then((res) => {
    videos.value = res.data
  })
}

const changeTabs = (id: string) => {
  selected.value = id
  handlegetAllMV()
}

const handleClickVideo = (id: number | string) => {
  pause()
  router.push(`/mv/${id}`)
}
</script>
<template>
  <div class="p-6 w-full">
    <div class="mb-4">
      <div
        class="inline-flex items-center rounded-md bg-muted/70 p-1 text-muted-foreground w-full justify-start mb-4 overflow-x-auto"
      >
        <button
          v-for="tab in mvTabs"
          :key="tab.id"
          @click="changeTabs(tab.id)"
          :class="{
            'bg-background text-foreground shadow-sm': selected === tab.id,
          }"
          class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          {{ tab.label }}
        </button>

        <div class="ml-auto space-x-3">
          <el-select
            v-model="selectedArea"
            class="w-28"
            @change="handlegetAllMV"
          >
            <el-option
              v-for="item in areasList"
              :key="item"
              :label="item.label"
              :value="item.id"
            ></el-option>
          </el-select>
          <el-select
            v-model="selectedOrder"
            class="w-28"
            @change="handlegetAllMV"
          >
            <el-option
              v-for="item in orderList"
              :key="item"
              :label="item.label"
              :value="item.id"
            ></el-option>
          </el-select>
        </div>
      </div>
    </div>

    <div class="mb-12">
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        <div
          v-for="movie in videos"
          :key="movie.id"
          @click="handleClickVideo(movie.id)"
          class="aspect-video object-cover text-white/80 group relative overflow-hidden rounded-lg shadow-lg transition-transform duration-300 hover:-translate-y-2"
        >
          <el-image
            :src="movie.cover + '?param=458y300'"
            lazy
            :alt="movie.name"
          />
          <div
            class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <div class="absolute bottom-0 p-4 w-full">
              <h3 class="text-white text-lg font-bold mb-1">
                {{ movie.name }}
              </h3>
              <p class="text-sm mb-2">
                {{ movie.artistName }}
              </p>
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center">
                  <span class="flex items-center gap-1 text-sm">
                    <icon-mdi:eye-outline
                      class="lucide lucide-clock w-4 h-4"
                    />{{ formatNumber(movie.playCount) }}</span
                  >
                </div>
                <span class="flex items-center gap1 text-sm">
                  <icon-mingcute:time-duration-line
                    class="lucide lucide-clock w-4 h-4"
                  />
                  {{ formatMillisecondsToTime(movie.duration) }}</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
