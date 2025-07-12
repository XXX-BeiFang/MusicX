<script setup lang="ts">
import { cloudsearch, API } from '@/api'
const route = useRoute()

const props = defineProps({
  selected: {
    type: String,
    default: '100',
  },
})
const artistsData = ref<any>()

const currentPage = ref(1) // 当前页
const pageSize = ref(30) // 每页显示的数量

const state = reactive({
  size: 'default',
  disabled: false,
  background: false,
  layout: 'total, sizes, prev, pager, next, jumper',
  total: 0,
  pageSizes: [20, 30, 40, 50],
})

// 监听分页变化
const handleSizeChange = () => {
  getCloudSearch()
}
// 监听当前页变化
const handleCurrentChange = () => {
  getCloudSearch()
}

const getCloudSearch = () => {
  artistsData.value = undefined
  cloudsearch<any>({
    kw: route.query.query as string,
    offset: currentPage.value,
    limit: pageSize.value,
    type: props.selected,
  }).then((res) => {
    artistsData.value = res.result
    state.total = res.result.artistCount
  })
}

watch(
  () => [route.query.query, props.selected],
  (val) => {
    if (!val[0]) return
    if (!val[1] || val[1] != '100') return
    getCloudSearch()
  },
  {
    immediate: true,
  }
)
</script>
<template>
  <div class="flex-1 h-full flex flex-col overflow-hidden">
    <div class="flex-1 overflow-x-hidden">
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        <router-link
          v-for="artist in artistsData?.artists"
          :key="artist.id"
          :to="`/artist/${artist.id}`"
          class="group cursor-pointer flex flex-col items-center"
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
          <div v-if="artist.alias && artist.alias.length > 0" class="text-xs text-gray-500 text-center">{{ artist.alias[0] }}</div>
        </router-link>
      </div>
    </div>

    <nav class="mx-auto flex w-full justify-center mt-4">
      <el-pagination
        v-model:page-size="pageSize"
        v-model:currentPage="currentPage"
        v-bind="state"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </nav>
  </div>
</template>
