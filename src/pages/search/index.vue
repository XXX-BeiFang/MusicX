<script setup lang="ts">
const router = useRouter()
const route = useRoute()

// 搜索关键字
const keyword = computed(() => (route.query.query as string) || '')

// 当前选中的结果类型（与网易云搜索 type 对齐）
const activeType = ref((route.query.type as string) || '1')

watch(
  () => route.query,
  (q) => {
    activeType.value = (q.type as string) || '1'
  }
)

// 选项变化时同步到路由
watch(
  () => activeType.value,
  (name) => {
    router.replace({
      path: '/search',
      query: {
        query: keyword.value,
        type: name,
      },
    })
  }
)

// 引入结果子组件（它们内部会根据 route.query.query 拉取数据）
const Songs = defineAsyncComponent(() => import('./songs.vue'))
const SongList = defineAsyncComponent(() => import('./songList.vue'))
const Artists = defineAsyncComponent(() => import('./artists.vue'))
const Albums = defineAsyncComponent(() => import('./albums.vue'))
const MVs = defineAsyncComponent(() => import('./mv.vue'))
</script>

<template>
  <div class="p-4 w-full h-full overflow-hidden flex flex-col">
    <div class="mb-4 text-sm text-gray-600 dark:text-gray-300" v-if="keyword">
      搜索 "{{ keyword }}" 的结果
    </div>

    <div v-else class="text-sm text-gray-500">请输入关键词后按回车开始搜索</div>

    <el-tabs v-model="activeType" class="flex-0">
      <el-tab-pane label="歌曲" name="1" />
      <el-tab-pane label="歌单" name="1000" />
      <el-tab-pane label="歌手" name="100" />
      <el-tab-pane label="专辑" name="10" />
      <el-tab-pane label="MV" name="1004" />
    </el-tabs>

    <div class="flex-1 min-h-0 overflow-hidden">
      <keep-alive>
        <Songs v-if="activeType === '1'" :selected="'1'" />
        <SongList v-else-if="activeType === '1000'" :selected="'1000'" />
        <Artists v-else-if="activeType === '100'" :selected="'100'" />
        <Albums v-else-if="activeType === '10'" :selected="'10'" />
        <MVs v-else-if="activeType === '1004'" :selected="'1004'" />
      </keep-alive>
    </div>
  </div>
</template>
