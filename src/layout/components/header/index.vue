<script setup lang="ts">
import { Icon } from '@iconify/vue'
import * as Avatar from './components/avatar.vue'
import { ref } from 'vue'
import * as ThemeSelector from '@/components/ThemeSelector.vue'
import { settingStore } from '@/stores/modules/setting'
import { isDarkMode, toggleTheme } from '@/composables/useTheme'

const route = useRoute()
const router = useRouter()
const setting = settingStore()

const searchText = ref('')

// 赋值到搜索框
watch(
  () => route.query,
  (newValue) => {
    if (newValue.query) {
      searchText.value = newValue.query as string
    }
  },
  { immediate: true }
)

// 计算头部样式
const headerStyle = computed(() => {
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
  <header class="px-4 py-2 border-b flex items-center" :style="headerStyle">
    <div class="flex relative w-60">
      <button class="btn btn1" />
      <button class="btn btn2" />
      <button class="btn btn3" />
    </div>
    <el-button text circle @click="router.back()">
      <Icon icon="material-symbols:arrow-back-ios" />
    </el-button>
    <el-button text circle @click="router.forward()">
      <Icon icon="material-symbols:arrow-forward-ios" />
    </el-button>
    <!-- 输入框和头像 -->
    <div class="ml-auto flex items-center gap-3">
      <div class="relative mr-6">
        <Icon
          icon="mdi:magnify"
          class="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
        />
        <input
          v-model="searchText"
          type="text"
          class="w-64 text-sm pl-8 pr-2 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300 focus:w-80"
          :class="{'bg-white/80 dark:bg-neutral-800/80': setting.wallpaper && setting.wallpaperType !== 'none'}"
          placeholder="搜索..."
          @keyup.enter="router.push('/search?query=' + searchText)"
        />
      </div>
      <!-- 主题选择器 -->
      <ThemeSelector.default />
      <el-button text circle @click="(event) => toggleTheme(event)">
        <Icon :icon="isDarkMode ? 'mdi:weather-sunny' : 'mdi:weather-night'" class="theme-icon" />
      </el-button>
      <Avatar.default />
    </div>
  </header>
</template>

<style scoped>
.btn {
  height: 15px;
  width: 15px;
  margin: 5px;
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.btn1 {
  background: #fac536;
}

.btn1::before {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50%;
  height: 10%;
  opacity: 0;
  background: #222;
  transition: 300ms;
}

.btn1:hover::before {
  opacity: 1;
  top: 50%;
}

.btn2 {
  background: #39ea49;
}

.btn2::before {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 45%;
  height: 45%;
  opacity: 0;
  background: #222;
  transition: 300ms;
}

.btn2::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-45deg);
  width: 15%;
  height: 80%;
  opacity: 0;
  background: #39ea49;
  transition: 300ms;
}

.btn2:hover::before,
.btn2:hover::after {
  opacity: 1;
  top: 50%;
}

.btn3 {
  background: #f25056;
}

.btn3::before {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-45deg);
  width: 15%;
  height: 50%;
  opacity: 0;
  background: #222;
  transition: 300ms;
}

.btn3::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(45deg);
  width: 15%;
  opacity: 0;
  height: 50%;
  background: #222;
  transition: 300ms;
}

.btn3:hover::before,
.btn3:hover::after {
  opacity: 1;
  top: 50%;
}

.theme-icon {
  font-size: 26px;
  vertical-align: middle;
}
</style>
