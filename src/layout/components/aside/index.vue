<script setup lang="ts">
import { MenuData } from './data'
import { userPlaylist } from '@/api'
import { API } from '@/api/interface'
import { settingStore } from '@/stores/modules/setting'

const user = UserStore()
const setting = settingStore()

const userPlay = ref<API.Playlist[]>([])

watch(
  () => user.userInfo.userId,
  () => {
    if (user.userInfo.userId) {
      userPlaylist({ id: user.userInfo.userId, limit: 50 }).then((res) => {
        userPlay.value = res.playlist
      })
    }
  },
  {
    immediate: true,
  }
)

// 计算侧边栏样式
const asideStyle = computed(() => {
  if (setting.wallpaper && setting.wallpaperType !== 'none') {
    return {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)'
    }
  }
  return {}
})
</script>
<template>
  <aside class="w-64 hidden h-full overflow-hidden md:block border-r" :style="asideStyle">
    <nav
      class="flex flex-col p-4 space-y-4 flex-1 h-full box-border overflow-hidden"
    >
      <div
        v-for="(item, index) in MenuData"
        :key="index"
        class="w-full flex flex-col gap-1"
      >
        <h3 class="text-xs font-semibold text-gray-700 dark:text-gray-200">
          {{ item.title }}
        </h3>
        <router-link
          class="rounded-lg w-full transition text-sm duration-300 py-2 px-2 flex items-center space-x-2 text-gray-900 dark:text-gray-100 hover:bg-gray-100/30 dark:hover:bg-gray-700/30 hover:shadow-sm transform hover:translate-x-1"
          :to="item2.router"
          v-for="(item2, index2) in item.children"
          :key="index2"
        >
          <Icon :name="item2.icon" :size="18" class="text-gray-700 dark:text-gray-200" />
          <span>{{ item2.title }}</span>
        </router-link>
      </div>
      <!-- 用户歌单 -->
      <div
        class="w-full flex flex-col gap-1 overflow-x-hidden"
        v-if="user.userInfo.userId"
      >
        <h3 class="text-xs font-semibold text-gray-700 dark:text-gray-200">我的歌单</h3>
        <el-scrollbar class="flex-1">
          <router-link
            v-for="item in userPlay"
            :key="item.id"
            class="rounded-lg w-full transition text-sm duration-300 py-2 px-2 flex items-center space-x-2 text-gray-900 dark:text-gray-100 hover:bg-gray-100/30 dark:hover:bg-gray-700/30 hover:shadow-sm transform hover:translate-x-1"
            :to="`/playlist/${item.id}`"
          >
            <el-image
              lazy
              :src="item.coverImgUrl + '?param=50y50'"
              class="w-7 h-7 rounded-md"
              :alt="item.name"
            />
            <span>{{ item.name }}</span>
          </router-link>
        </el-scrollbar>
      </div>
    </nav>
  </aside>
</template>
