<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { formatTime } from '@/utils'
import { settingStore } from '@/stores/modules/setting'
import { Icon } from '@iconify/vue'
import { ElScrollbar, ElIcon } from 'element-plus'
import { Timer, EditPen, Brush, Plus, Minus, Check, RefreshRight, Mouse, VideoPlay, VideoPause, Back, Right, Refresh, Sort, Star, Share, Setting, Mute, Microphone } from '@element-plus/icons-vue'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import { useDarkModeTransition } from '@/hooks/useDarkModeTransition'
import { getCurrentThemeIcon, getThemeIconSize } from '@/utils/themeIcons'

const setting = settingStore()
const showLyricsPage = defineModel<boolean>()

// 注册Element Plus图标组件
const components = {
  Timer,
  EditPen,
  Brush,
  Plus,
  Minus,
  Check,
  RefreshRight,
  Mouse,
  VideoPlay,
  VideoPause,
  Back,
  Right,
  Refresh,
  Sort,
  Star,
  Share,
  Setting,
  Mute,
  Microphone,
  ElIcon,
  ElScrollbar
}

// 歌词设置相关状态
const lyricsSettings = ref({
  fontSize: 18, // 默认字体大小
  color: '#3b82f6', // 默认颜色
  speedOffset: 0 // 歌词速度偏移（秒）
})

// 字体大小范围
const FONT_SIZE_MIN = 12
const FONT_SIZE_MAX = 32

// 预设颜色选项
const colorOptions = [
  { name: '经典蓝', value: '#3b82f6' },
  { name: '优雅紫', value: '#8b5cf6' },
  { name: '温暖橙', value: '#f59e0b' },
  { name: '清新绿', value: '#10b981' },
  { name: '浪漫粉', value: '#ec4899' },
  { name: '深邃黑', value: '#1f2937' },
  { name: '高贵金', value: '#d97706' },
  { name: '宁静青', value: '#06b6d4' }
]

// 控制面板显示状态
const showControlPanel = ref(false)
const controlPanelTimer = ref<NodeJS.Timeout | null>(null)
const showInitialHint = ref(true)

const {
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  currentLyricIndex,
  playMode,
  nextTrack,
  prevTrack,
  togglePlayPause,
  seek,
  setPlayMode,
  volume,
  setVolume
} = useAudioPlayer()

const scrollContainer = ref<HTMLDivElement | null>(null)
const isUserScrolling = ref(false)
const showShortcuts = ref(false)
const iconError = ref(false)



// 多语言显示控制
const showTranslation = ref(true)
const showRomanization = ref(true)

// 深色模式切换（使用带动画的版本）
const { isDark: isDarkMode, toggleTheme } = useDarkModeTransition()

// 处理图标加载错误
function handleIconError() {
  iconError.value = true
}



// 跳转到指定歌词行
function jumpToLyric(index: number) {
  if (!currentTrack.value.lyrics?.lines?.[index]) return

  const targetTime = currentTrack.value.lyrics.lines[index].time / 1000
  seek(targetTime)

  // 添加视觉反馈
  nextTick(() => {
    const lyricElements = (scrollContainer.value as any)?.wrapRef?.querySelectorAll('.lyric-line')
    if (lyricElements?.[index]) {
      lyricElements[index].classList.add('jump-highlight')
      setTimeout(() => {
        lyricElements[index].classList.remove('jump-highlight')
      }, 1000)
    }
  })
}

// 处理滚动事件
function handleScroll() {
  isUserScrolling.value = true
  debouncedFn()
}

function scrollToCurrentLyric(el: any) {
  if (!el.value || !currentTrack.value.lyrics?.lines?.length) return

  const currentIndex = adjustedCurrentLyricIndex.value
  if (currentIndex < 0) return

  const lyricElements = el.value.wrapRef.querySelectorAll('.lyric-line')
  const activeLyric = lyricElements[currentIndex] as HTMLElement
  if (!activeLyric) return

  // 计算让当前歌词显示在更高位置
  const containerHeight = el.value.wrapRef.clientHeight
  const lyricTop = activeLyric.offsetTop
  const lyricHeight = activeLyric.clientHeight

  // 让歌词显示在容器上方1/3的位置（而不是正中心）
  const targetScrollTop = lyricTop - (containerHeight / 3) + (lyricHeight / 2)

  // 使用平滑滚动动画
  const currentScrollTop = el.value.wrapRef.scrollTop
  const distance = targetScrollTop - currentScrollTop
  const duration = 800 // 800ms 动画时间
  const startTime = performance.now()

  function animateScroll(currentTime: number) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    // 使用缓动函数让滚动更平滑
    const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
    const easedProgress = easeInOutCubic(progress)

    const newScrollTop = currentScrollTop + distance * easedProgress
    el.value.setScrollTop(newScrollTop)

    if (progress < 1) {
      requestAnimationFrame(animateScroll)
    }
  }

  requestAnimationFrame(animateScroll)
}

// 防抖函数 - 减少防抖时间让歌词切换更及时
const debouncedFn = useDebounceFn(() => {
  isUserScrolling.value = false
  scrollToCurrentLyric(scrollContainer)
}, 2000)

// 监听播放当前时间，并用于歌词滚动
watch(
  () => [currentTime.value, lyricsSettings.value.speedOffset],
  () => {
    if (currentTime.value && !isUserScrolling.value) {
      scrollToCurrentLyric(scrollContainer)
    }
  },
  {
    immediate: true,
  }
)

// 关闭歌词页面
const closeLyricsPage = () => {
  showLyricsPage.value = false
}

// 键盘快捷键支持
const handleKeydown = (event: KeyboardEvent) => {


  switch (event.code) {
    case 'Escape':
      closeLyricsPage()
      break
    case 'Space':
      event.preventDefault()
      togglePlayPause()
      break
    case 'ArrowLeft':
      event.preventDefault()
      prevTrack()
      break
    case 'ArrowRight':
      event.preventDefault()
      nextTrack()
      break
    case 'ArrowUp':
      event.preventDefault()
      setVolume(Math.min(100, volume.value + 5))
      break
    case 'ArrowDown':
      event.preventDefault()
      setVolume(Math.max(0, volume.value - 5))
      break


  }
}

// 组件挂载时添加键盘事件监听
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)

  // 5秒后自动隐藏初始提示
  setTimeout(() => {
    showInitialHint.value = false
  }, 5000)
})

// 组件卸载时移除键盘事件监听
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  if (controlPanelTimer.value) {
    clearTimeout(controlPanelTimer.value)
  }
})

// 歌词设置功能
const adjustFontSize = (delta: number) => {
  const newSize = Math.max(FONT_SIZE_MIN, Math.min(FONT_SIZE_MAX, lyricsSettings.value.fontSize + delta))
  lyricsSettings.value.fontSize = newSize
}

const adjustSpeed = (delta: number) => {
  lyricsSettings.value.speedOffset = Math.max(-2, Math.min(2, lyricsSettings.value.speedOffset + delta))
}

const setLyricsColor = (color: string) => {
  lyricsSettings.value.color = color
}

const resetLyricsSettings = () => {
  lyricsSettings.value = {
    fontSize: 18,
    color: '#3b82f6',
    speedOffset: 0
  }
}

// 控制面板显示/隐藏逻辑 - 简化版本
const handleControlPanelEnter = () => {
  showControlPanel.value = true
  if (showInitialHint.value) {
    showInitialHint.value = false
  }
}

const handleControlPanelLeave = () => {
  showControlPanel.value = false
}

// 颜色选择面板显示/隐藏逻辑
const showColorPicker = ref(false)

const toggleColorPicker = (event: Event) => {
  event.stopPropagation()
  showColorPicker.value = !showColorPicker.value
}

const setLyricsColorAndClose = (color: string) => {
  setLyricsColor(color)
  showColorPicker.value = false
}

// 点击外部关闭颜色选择面板
const closeColorPicker = () => {
  showColorPicker.value = false
}

// 监听全局点击事件
onMounted(() => {
  document.addEventListener('click', closeColorPicker)
})

onUnmounted(() => {
  document.removeEventListener('click', closeColorPicker)
})

// 计算调整后的当前歌词索引（考虑速度偏移）
const adjustedCurrentLyricIndex = computed(() => {
  if (!currentTrack.value.lyrics?.lines?.length) return -1

  const adjustedTime = (currentTime.value + lyricsSettings.value.speedOffset) * 1000
  const lines = currentTrack.value.lyrics.lines

  for (let i = lines.length - 1; i >= 0; i--) {
    if (adjustedTime >= lines[i].time) {
      return i
    }
  }
  return -1
})

// 音量控制
const isMuted = computed(() => volume.value === 0)
const toggleVolume = () => {
  setVolume(isMuted.value ? 50 : 0)
}

// 计算背景样式
const backgroundStyle = computed(() => {
  if (currentTrack.value.cover) {
    return {
      backgroundImage: `url(${currentTrack.value.cover}?param=1920y1080)`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }
  }
  return {}
})
</script>

<template>
  <div class="fixed inset-0 z-50 lyrics-page-container bg-white">
    <!-- 主要内容区域 -->
    <div class="h-full flex flex-col">
      <!-- 顶部导航栏 -->
      <header class="flex items-center justify-between px-8 py-6 bg-white border-b border-gray-100 flex-shrink-0">
        <div class="flex items-center gap-4">
          <button
            @click="closeLyricsPage"
            class="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center text-gray-600 hover:text-gray-900"
          >
            <Icon icon="material-symbols:arrow-back-ios" class="text-lg" />
          </button>
          <div>
            <h1 class="text-lg font-medium text-gray-900">{{ currentTrack.title }}</h1>
            <p class="text-sm text-gray-500">{{ currentTrack.artist }}</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- 主题切换按钮 -->
          <button
            @click="toggleTheme($event)"
            class="group relative w-11 h-11 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100 border border-gray-200/50 hover:border-blue-200 transition-all duration-300 flex items-center justify-center text-gray-600 hover:text-blue-600 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
            :class="{ 'from-blue-100 to-blue-200 border-blue-300 text-blue-700': isDarkMode }"
          >
            <!-- 背景光效 -->
            <div class="absolute inset-0 rounded-xl bg-gradient-to-br from-white/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Icon
              :icon="getCurrentThemeIcon(isDarkMode)"
              :class="[getThemeIconSize(), 'relative z-10 transition-transform duration-200 group-hover:scale-110']"
            />
          </button>

          <!-- 收藏按钮 -->
          <button class="group relative w-11 h-11 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-red-50 hover:to-red-100 border border-gray-200/50 hover:border-red-200 transition-all duration-300 flex items-center justify-center text-gray-600 hover:text-red-500 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95">
            <!-- 背景光效 -->
            <div class="absolute inset-0 rounded-xl bg-gradient-to-br from-white/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <el-icon class="text-lg relative z-10 transition-transform duration-200 group-hover:scale-110">
              <Star />
            </el-icon>
            <!-- 装饰性心形粒子 -->
            <div class="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-300"></div>
          </button>

          <!-- 分享按钮 -->
          <button class="group relative w-11 h-11 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100 border border-gray-200/50 hover:border-blue-200 transition-all duration-300 flex items-center justify-center text-gray-600 hover:text-blue-500 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95">
            <!-- 背景光效 -->
            <div class="absolute inset-0 rounded-xl bg-gradient-to-br from-white/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <el-icon class="text-lg relative z-10 transition-transform duration-200 group-hover:scale-110">
              <Share />
            </el-icon>
            <!-- 分享动画效果 -->
            <div class="absolute inset-0 rounded-xl border-2 border-blue-400/30 opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-300"></div>
          </button>

          <!-- 快捷键按钮 -->
          <button
            class="group relative w-11 h-11 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-purple-50 hover:to-purple-100 border border-gray-200/50 hover:border-purple-200 transition-all duration-300 flex items-center justify-center text-gray-600 hover:text-purple-600 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
            @click="showShortcuts = !showShortcuts"
          >
            <!-- 背景光效 -->
            <div class="absolute inset-0 rounded-xl bg-gradient-to-br from-white/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <el-icon class="text-lg relative z-10 transition-transform duration-200 group-hover:scale-110">
              <Setting />
            </el-icon>
            <!-- 活跃状态指示器 -->
            <div
              class="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full transition-all duration-300"
              :class="showShortcuts ? 'opacity-100 scale-100' : 'opacity-0 scale-0'"
            >
              <div class="absolute inset-0 bg-purple-400 rounded-full animate-ping"></div>
            </div>

            <!-- 快捷键提示面板 -->
            <div
              v-if="showShortcuts"
              class="absolute top-14 right-0 bg-white/95 backdrop-blur-md rounded-xl p-5 text-sm text-gray-700 whitespace-nowrap z-20 border border-gray-200/50 shadow-xl min-w-[200px]"
              style="animation: slideDown 0.3s ease-out;"
            >
              <!-- 面板标题 -->
              <div class="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                <Icon icon="material-symbols:keyboard" class="text-purple-500" />
                <span class="font-medium text-gray-800">快捷键</span>
              </div>

              <div class="space-y-3">
                <div class="flex justify-between items-center gap-6">
                  <div class="flex items-center gap-2">
                    <Icon icon="material-symbols:play-arrow" class="text-blue-500 text-sm" />
                    <span>播放/暂停</span>
                  </div>
                  <kbd class="px-2 py-1 bg-gradient-to-br from-gray-100 to-gray-200 rounded-md text-xs font-mono shadow-sm border border-gray-300">Space</kbd>
                </div>
                <div class="flex justify-between items-center gap-6">
                  <div class="flex items-center gap-2">
                    <Icon icon="material-symbols:skip-previous" class="text-green-500 text-sm" />
                    <span>上一首</span>
                  </div>
                  <kbd class="px-2 py-1 bg-gradient-to-br from-gray-100 to-gray-200 rounded-md text-xs font-mono shadow-sm border border-gray-300">←</kbd>
                </div>
                <div class="flex justify-between items-center gap-6">
                  <div class="flex items-center gap-2">
                    <Icon icon="material-symbols:skip-next" class="text-green-500 text-sm" />
                    <span>下一首</span>
                  </div>
                  <kbd class="px-2 py-1 bg-gradient-to-br from-gray-100 to-gray-200 rounded-md text-xs font-mono shadow-sm border border-gray-300">→</kbd>
                </div>
                <div class="flex justify-between items-center gap-6">
                  <div class="flex items-center gap-2">
                    <Icon icon="material-symbols:volume-up" class="text-orange-500 text-sm" />
                    <span>音量调节</span>
                  </div>
                  <kbd class="px-2 py-1 bg-gradient-to-br from-gray-100 to-gray-200 rounded-md text-xs font-mono shadow-sm border border-gray-300">↑↓</kbd>
                </div>
                <div class="flex justify-between items-center gap-6">
                  <div class="flex items-center gap-2">
                    <Icon icon="material-symbols:close" class="text-red-500 text-sm" />
                    <span>关闭</span>
                  </div>
                  <kbd class="px-2 py-1 bg-gradient-to-br from-gray-100 to-gray-200 rounded-md text-xs font-mono shadow-sm border border-gray-300">Esc</kbd>
                </div>
              </div>

              <!-- 装饰性箭头 -->
              <div class="absolute -top-2 right-4 w-4 h-4 bg-white/95 border-l border-t border-gray-200/50 transform rotate-45 backdrop-blur-md"></div>
            </div>
          </button>
        </div>
      </header>

      <!-- 主内容区域 -->
      <main class="flex-1 flex min-h-0">
        <!-- 左侧：专辑封面区域 -->
        <div class="w-1/3 flex flex-col items-center justify-center p-8 bg-white">
          <!-- 专辑封面 - 黑胶唱片效果 -->
          <div class="relative mb-6">
            <div
              class="vinyl-container w-64 h-64 overflow-hidden shadow-lg"
              :class="isPlaying ? 'rounded-full' : 'rounded-2xl'"
              :style="{
                transition: 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
                borderRadius: isPlaying ? '50%' : '1rem'
              }"
            >
              <!-- 黑胶唱片背景 (仅在播放时显示) -->
              <div
                class="absolute inset-0 bg-gradient-radial from-gray-900 via-black to-gray-800 shadow-2xl"
                :class="isPlaying ? 'opacity-100 scale-100' : 'opacity-0 scale-95'"
                :style="{
                  transition: 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  borderRadius: isPlaying ? '50%' : '1rem'
                }"
              >
                <!-- 唱片纹理环 -->
                <div class="absolute inset-0 rounded-full">
                  <!-- 多层同心圆纹理 -->
                  <div class="absolute inset-1 border border-gray-700/40 rounded-full"></div>
                  <div class="absolute inset-3 border border-gray-600/35 rounded-full"></div>
                  <div class="absolute inset-5 border border-gray-500/30 rounded-full"></div>
                  <div class="absolute inset-7 border border-gray-400/25 rounded-full"></div>
                  <div class="absolute inset-9 border border-gray-300/20 rounded-full"></div>
                  <div class="absolute inset-11 border border-gray-200/15 rounded-full"></div>
                  <div class="absolute inset-13 border border-gray-100/10 rounded-full"></div>

                  <!-- 更多细密纹理 -->
                  <div class="absolute inset-16 border border-gray-600/8 rounded-full"></div>
                  <div class="absolute inset-18 border border-gray-500/6 rounded-full"></div>
                  <div class="absolute inset-20 border border-gray-400/4 rounded-full"></div>

                  <!-- 中心标签 -->
                  <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-full border-3 border-red-800 shadow-2xl">
                    <!-- 标签文字区域 -->
                    <div class="absolute inset-1 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center">
                      <div class="text-white text-xs font-bold opacity-80">♪</div>
                    </div>
                    <!-- 中心孔 -->
                    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-black rounded-full shadow-inner"></div>
                  </div>
                </div>

                <!-- 唱片光泽效果 -->
                <div
                  class="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-transparent"
                  :class="{ 'vinyl-light-effect': isPlaying }"
                ></div>
              </div>

              <!-- 专辑封面图片 -->
              <div class="relative w-full h-full">
                <img
                  :src="currentTrack.cover + '?param=400y400'"
                  :alt="currentTrack.title"
                  class="w-full h-full object-cover relative z-10"
                  :class="{
                    'vinyl-spinning': isPlaying
                  }"
                  :style="{
                    transition: 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    borderRadius: isPlaying ? '50%' : '1rem',
                    opacity: isPlaying ? '0.8' : '1',
                    transform: isPlaying ? 'scale(0.9)' : 'scale(1)'
                  }"
                />

                <!-- 播放时的动态光效 -->
                <div
                  v-if="isPlaying"
                  class="absolute inset-0 opacity-20 z-20 vinyl-light-effect"
                  :style="{
                    borderRadius: '50%',
                    background: 'conic-gradient(from 0deg, transparent, rgba(255,255,255,0.3), transparent, rgba(255,255,255,0.1), transparent)'
                  }"
                ></div>

                <!-- 播放时的内阴影效果 -->
                <div
                  v-if="isPlaying"
                  class="absolute inset-0 z-30 pointer-events-none"
                  :style="{
                    borderRadius: '50%',
                    boxShadow: 'inset 0 0 30px rgba(0,0,0,0.3), inset 0 0 60px rgba(0,0,0,0.1)'
                  }"
                ></div>
              </div>
            </div>

            <!-- 播放状态指示器 -->
            <div
              class="absolute -bottom-3 -right-3"
              :style="{
                transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: isPlaying ? '1' : '0',
                transform: isPlaying ? 'scale(1)' : 'scale(0)'
              }"
            >
              <!-- 外圈脉冲效果 -->
              <div class="absolute inset-0 w-14 h-14 bg-blue-500/20 rounded-full animate-ping"></div>
              <div class="absolute inset-1 w-12 h-12 bg-blue-500/30 rounded-full animate-ping" style="animation-delay: 0.2s;"></div>

              <!-- 主指示器 -->
              <div class="relative w-14 h-14 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-xl border-3 border-white/90 backdrop-blur-sm">
                <!-- 内部光泽效果 -->
                <div class="absolute inset-1 bg-gradient-to-br from-white/30 to-transparent rounded-full"></div>

                <!-- 音波可视化图标 -->
                <div class="flex items-end gap-0.5 relative z-10">
                  <div class="w-1 bg-white rounded-full animate-bounce" style="height: 6px; animation-delay: 0s; animation-duration: 0.8s;"></div>
                  <div class="w-1 bg-white rounded-full animate-bounce" style="height: 10px; animation-delay: 0.1s; animation-duration: 0.8s;"></div>
                  <div class="w-1 bg-white rounded-full animate-bounce" style="height: 4px; animation-delay: 0.2s; animation-duration: 0.8s;"></div>
                  <div class="w-1 bg-white rounded-full animate-bounce" style="height: 8px; animation-delay: 0.3s; animation-duration: 0.8s;"></div>
                  <div class="w-1 bg-white rounded-full animate-bounce" style="height: 12px; animation-delay: 0.4s; animation-duration: 0.8s;"></div>
                </div>

                <!-- 旋转的音符图标 -->
                <div class="absolute inset-0 flex items-center justify-center">
                  <Icon icon="material-symbols:music-note-rounded" class="text-white/20 text-lg animate-spin" style="animation-duration: 3s;" />
                </div>
              </div>
            </div>

            <!-- 暂停状态的装饰 -->
            <div
              class="absolute -top-2 -left-2"
              :style="{
                transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: !isPlaying ? '1' : '0',
                transform: !isPlaying ? 'scale(1)' : 'scale(0)'
              }"
            >
              <div class="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center shadow-lg border border-gray-300/50 backdrop-blur-sm">
                <!-- 暂停图标 -->
                <Icon icon="material-symbols:pause-rounded" class="text-gray-500 text-sm" />
                <!-- 装饰性光点 -->
                <div class="absolute -top-1 -right-1 w-2 h-2 bg-orange-400 rounded-full animate-pulse shadow-sm"></div>
              </div>
            </div>


          </div>

          <!-- 歌曲信息 -->
          <div class="text-center mb-6">
            <!-- 歌曲标题 -->
            <div class="flex items-center justify-center gap-2 mb-2">
              <Icon icon="material-symbols:music-note" class="text-blue-500 text-lg" />
              <h2 class="text-xl font-medium text-gray-900">{{ currentTrack.title }}</h2>
            </div>

            <!-- 艺术家 -->
            <div class="flex items-center justify-center gap-2 mb-1">
              <Icon icon="material-symbols:person" class="text-gray-500 text-sm" />
              <p class="text-base text-gray-600">{{ currentTrack.artist }}</p>
            </div>

            <!-- 专辑 -->
            <div class="flex items-center justify-center gap-2">
              <Icon icon="material-symbols:album" class="text-gray-400 text-sm" />
              <p class="text-sm text-gray-400">{{ currentTrack.album || '未知专辑' }}</p>
            </div>
          </div>

          <!-- 播放控制 -->
          <div class="flex items-center justify-center gap-4 mb-6">
            <!-- 随机播放按钮 -->
            <button
              @click="setPlayMode('shuffle')"
              :class="[
                'group relative w-11 h-11 rounded-xl border transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95 ripple-effect',
                playMode === 'shuffle'
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-400/30 text-white active-mode'
                  : 'bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100 border-gray-200/50 hover:border-blue-200 text-gray-600 hover:text-blue-600'
              ]"
              title="随机播放"
            >
              <div class="absolute inset-0 rounded-xl bg-gradient-to-br from-white/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <el-icon :class="['text-lg relative z-10 transition-transform duration-200', playMode === 'shuffle' ? 'animate-pulse' : '']">
                <Refresh />
              </el-icon>
            </button>

            <!-- 上一首按钮 -->
            <button
              @click="prevTrack"
              class="group relative w-12 h-12 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border border-gray-200/50 hover:border-gray-300 transition-all duration-300 flex items-center justify-center text-gray-700 hover:text-gray-900 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95 ripple-effect"
              title="上一首"
            >
              <div class="absolute inset-0 rounded-xl bg-gradient-to-br from-white/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <el-icon class="text-xl relative z-10 transition-transform duration-200 group-hover:-translate-x-0.5">
                <Back />
              </el-icon>
            </button>

            <!-- 播放/暂停按钮 -->
            <button
              @click="togglePlayPause"
              :class="[
                'group relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border border-blue-400/30 transition-all duration-300 flex items-center justify-center text-white shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 ripple-effect overflow-hidden',
                { 'playing': isPlaying }
              ]"
              title="播放/暂停"
            >
              <!-- 背景动画效果 -->
              <div class="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div class="absolute inset-0 rounded-2xl bg-blue-400/20 animate-pulse opacity-0 group-active:opacity-100 transition-opacity duration-150"></div>

              <!-- 播放时的波纹效果 -->
              <div
                v-if="isPlaying"
                class="absolute inset-0 rounded-2xl"
                style="background: radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%); animation: ripple 2s infinite;"
              ></div>

              <!-- 按钮图标 -->
              <div class="relative z-10 flex items-center justify-center">
                <el-icon v-if="isPlaying" class="text-2xl transition-all duration-200 group-hover:scale-110">
                  <VideoPause />
                </el-icon>
                <el-icon v-else class="text-2xl transition-all duration-200 group-hover:scale-110" style="margin-left: 2px;">
                  <VideoPlay />
                </el-icon>

                <!-- 装饰性音符 -->
                <div
                  v-if="isPlaying"
                  class="absolute -top-1 -right-1 w-3 h-3 text-white/60 animate-bounce"
                  style="animation-delay: 0.5s; animation-duration: 1.5s;"
                >
                  <Icon icon="material-symbols:music-note" class="text-xs" />
                </div>
              </div>
            </button>

            <!-- 下一首按钮 -->
            <button
              @click="nextTrack"
              class="group relative w-12 h-12 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border border-gray-200/50 hover:border-gray-300 transition-all duration-300 flex items-center justify-center text-gray-700 hover:text-gray-900 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95 ripple-effect"
              title="下一首"
            >
              <div class="absolute inset-0 rounded-xl bg-gradient-to-br from-white/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <el-icon class="text-xl relative z-10 transition-transform duration-200 group-hover:translate-x-0.5">
                <Right />
              </el-icon>
            </button>

            <!-- 循环播放按钮 -->
            <button
              @click="setPlayMode('loop')"
              :class="[
                'group relative w-11 h-11 rounded-xl border transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95 ripple-effect',
                playMode === 'loop'
                  ? 'bg-gradient-to-br from-green-500 to-green-600 border-green-400/30 text-white active-mode'
                  : 'bg-gradient-to-br from-gray-50 to-gray-100 hover:from-green-50 hover:to-green-100 border-gray-200/50 hover:border-green-200 text-gray-600 hover:text-green-600'
              ]"
              title="循环播放"
            >
              <div class="absolute inset-0 rounded-xl bg-gradient-to-br from-white/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <el-icon :class="['text-lg relative z-10 transition-transform duration-200', playMode === 'loop' ? 'animate-spin' : '']" style="animation-duration: 2s;">
                <RefreshRight />
              </el-icon>
            </button>
          </div>

          <!-- 进度条 -->
          <div class="w-full max-w-xs mb-4 relative">
            <!-- 音频可视化装饰 -->
            <div class="flex items-center justify-center mb-3 gap-1">
              <div
                v-for="i in 12"
                :key="i"
                class="w-0.5 bg-gradient-to-t from-blue-400 to-blue-600 rounded-full transition-all duration-300"
                :style="{
                  height: isPlaying ? `${Math.random() * 8 + 4}px` : '2px',
                  animationDelay: `${i * 0.1}s`,
                  animation: isPlaying ? 'audioWave 1.5s ease-in-out infinite alternate' : 'none'
                }"
              ></div>
            </div>

            <!-- 进度条容器 -->
            <div class="relative">
              <!-- 进度条背景装饰 -->
              <div class="absolute -inset-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg opacity-50 blur-sm"></div>

              <el-slider
                v-model="currentTime"
                :show-tooltip="false"
                @change="seek"
                :max="duration"
                class="lyrics-progress-slider mb-2 relative z-10"
              />

              <!-- 进度指示器 -->
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center gap-1">
                  <Icon icon="material-symbols:play-arrow" class="text-xs text-blue-500" />
                  <span class="text-xs text-gray-500">{{ formatTime(currentTime) }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <span class="text-xs text-gray-500">{{ formatTime(duration) }}</span>
                  <Icon icon="material-symbols:music-note" class="text-xs text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          <!-- 音量控制 -->
          <div class="flex items-center gap-2">
            <button
              @click="toggleVolume"
              class="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center text-gray-600 hover:text-gray-900"
            >
              <el-icon class="text-sm">
                <Mute v-if="isMuted" />
                <Microphone v-else />
              </el-icon>
            </button>
            <el-slider
              v-model="volume"
              :show-tooltip="false"
              @change="setVolume"
              class="w-20 lyrics-volume-slider"
              :max="100"
            />
            <div class="flex items-center gap-1">
              <Icon icon="material-symbols:percent" class="text-xs text-gray-400" />
              <span class="text-xs text-gray-500 w-6 text-center">{{ volume }}</span>
            </div>
          </div>
        </div>

        <!-- 右侧：歌词显示 -->
        <div class="w-2/3 bg-white border-l border-gray-100 flex min-h-0 relative lyrics-area">
          <!-- 歌词内容区域 -->
          <div class="flex-1 p-8 flex flex-col min-h-0">
            <!-- 歌词标题 -->
            <div class="text-center mb-6 pb-4 border-b border-gray-100 flex-shrink-0">
              <div class="flex items-center justify-center gap-2 mb-1">
                <Icon icon="material-symbols:lyrics" class="text-blue-500 text-lg" />
                <h3 class="text-lg font-medium text-gray-900">歌词</h3>
              </div>
              <div class="flex items-center justify-center gap-2">
                <Icon icon="material-symbols:music-note" class="text-gray-400 text-sm" />
                <p class="text-sm text-gray-500">{{ currentTrack.title }} - {{ currentTrack.artist }}</p>
              </div>
            </div>



            <!-- 歌词滚动区域 -->
            <div class="flex-1 min-h-0">
              <el-scrollbar
                @scroll="handleScroll"
                ref="scrollContainer"
                wrap-class="w-full h-full"
                :view-class="`w-full flex flex-col ${currentTrack.lyrics?.lines?.length > 1 ? 'py-32' : 'items-center justify-center'}`"
                class="w-full h-full lyrics-scrollbar"
              >
              <template
                v-for="(item, index) in currentTrack.lyrics?.lines"
                :key="item.time"
              >
                <div
                  class="group text-center cursor-pointer py-4 px-6 mx-4 mb-3 rounded-xl hover:bg-gray-50 relative lyric-line"
                  :class="
                    adjustedCurrentLyricIndex == index
                      ? 'activeLyric bg-blue-50/80 shadow-sm border border-blue-100'
                      : 'text-gray-600 hover:text-gray-900'
                  "
                  :style="{
                    transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: adjustedCurrentLyricIndex == index ? 'scale(1.05)' : 'scale(1)',
                    fontSize: adjustedCurrentLyricIndex == index ? `${lyricsSettings.fontSize + 4}px` : `${lyricsSettings.fontSize}px`,
                    fontWeight: adjustedCurrentLyricIndex == index ? '600' : '400',
                    lineHeight: adjustedCurrentLyricIndex == index ? '1.6' : '1.5',
                    opacity: adjustedCurrentLyricIndex == index ? '1' : '0.7',
                    color: adjustedCurrentLyricIndex == index ? lyricsSettings.color : ''
                  }"
                  @click="seek(item.time / 1000)"
                >
                  <p
                    class="leading-relaxed transition-all duration-600 ease-out"
                    :style="{
                      letterSpacing: adjustedCurrentLyricIndex == index ? '0.05em' : '0.02em'
                    }"
                  >
                    {{ item.lrc }}
                  </p>
                  <p
                    v-if="item.tlyric && setting.isTranslatedParsed"
                    class="mt-2 opacity-70 transition-all duration-600"
                    :style="{
                      fontSize: adjustedCurrentLyricIndex == index ? `${lyricsSettings.fontSize - 2}px` : `${lyricsSettings.fontSize - 4}px`
                    }"
                  >
                    {{ item.tlyric }}
                  </p>
                  <p
                    v-if="item.romalrc && setting.isRomaParsed"
                    class="mt-1 opacity-50 italic transition-all duration-600"
                    :style="{
                      fontSize: adjustedCurrentLyricIndex == index ? `${lyricsSettings.fontSize - 4}px` : `${lyricsSettings.fontSize - 6}px`
                    }"
                  >
                    {{ item.romalrc }}
                  </p>

                  <!-- 悬停时的时间提示 -->
                  <div class="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-60 transition-opacity duration-200 text-xs text-gray-400 flex items-center gap-1">
                    <Icon icon="material-symbols:schedule" class="text-xs" />
                    {{ formatTime(item.time / 1000) }}
                  </div>
                </div>
              </template>

              <!-- 无歌词时的提示 -->
              <div
                v-if="!currentTrack.lyrics?.lines?.length"
                class="flex flex-col items-center justify-center h-full text-gray-400 py-20"
              >
                <div class="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4 shadow-sm">
                  <Icon icon="material-symbols:lyrics" class="text-2xl text-gray-400" />
                </div>
                <div class="flex items-center gap-2 mb-2">
                  <Icon icon="material-symbols:info" class="text-blue-500 text-sm" />
                  <h3 class="text-lg font-medium text-gray-600">暂无歌词</h3>
                </div>
                <div class="flex items-center gap-2">
                  <Icon icon="material-symbols:headphones" class="text-green-500 text-sm" />
                  <p class="text-sm text-gray-400">请欣赏这美妙的音乐</p>
                </div>
              </div>
              </el-scrollbar>
            </div>
          </div>

          <!-- 右侧控制面板触发区域 - 只有这个80px宽的区域会触发控制面板 -->
          <div class="w-20 relative min-h-full flex items-center justify-center">
            <!-- 触发区域容器 - 只有这个区域有鼠标事件 -->
            <div
              class="control-trigger-zone w-full h-full absolute inset-0 flex items-center justify-center"
              @mouseenter="handleControlPanelEnter"
              @mouseleave="handleControlPanelLeave"
            >
              <!-- 默认状态：显示触发提示 -->
              <div
                v-show="!showControlPanel"
                class="trigger-hint-display flex flex-col items-center justify-center w-full h-full"
              >
                <!-- 触发区域提示条 -->
                <div
                  class="trigger-hint w-2 h-20 bg-gradient-to-b from-transparent via-blue-300/60 to-transparent rounded-full transition-all duration-300"
                  :class="{
                    'opacity-70': !showInitialHint,
                    'opacity-100 animate-pulse': showInitialHint
                  }"
                ></div>

                <!-- 初始提示文字 -->
                <div
                  v-if="showInitialHint"
                  class="absolute top-1/2 right-24 transform -translate-y-1/2 bg-blue-500/90 text-white text-xs px-3 py-2 rounded-lg shadow-lg animate-bounce whitespace-nowrap z-10"
                >
                  <div class="flex items-center gap-2">
                    <el-icon class="text-sm"><Mouse /></el-icon>
                    <span>悬停此区域显示控制面板</span>
                  </div>
                  <!-- 箭头指向触发区域 -->
                  <div class="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-blue-500/90 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
                </div>
              </div>

              <!-- 悬停状态：显示控制面板 -->
              <div
                v-show="showControlPanel"
                class="lyrics-control-panel w-full flex flex-col items-center justify-center py-6 transition-all duration-300 ease-out relative min-h-full"
              >
            <!-- 背景装饰 -->
            <div class="absolute inset-0 bg-gradient-to-b from-blue-50/30 via-purple-50/20 to-pink-50/30 rounded-l-3xl"></div>
            <div class="absolute inset-0 backdrop-blur-xl bg-white/40 rounded-l-3xl border-l border-t border-b border-white/50 shadow-2xl"></div>

            <!-- 控制按钮组 -->
            <div class="flex flex-col items-center gap-6 relative z-10">

              <!-- 速度控制组 -->
              <div class="control-group">
                <div class="group-header">
                  <el-icon class="text-blue-500 text-lg"><Timer /></el-icon>
                  <span class="group-title">速度</span>
                </div>
                <div class="control-buttons">
                  <button
                    @click="adjustSpeed(-0.5)"
                    class="control-btn control-btn-decrease"
                    title="减慢歌词速度"
                  >
                    <el-icon><Minus /></el-icon>
                  </button>
                  <div class="control-value">{{ lyricsSettings.speedOffset >= 0 ? '+' : '' }}{{ lyricsSettings.speedOffset }}s</div>
                  <button
                    @click="adjustSpeed(0.5)"
                    class="control-btn control-btn-increase"
                    title="加快歌词速度"
                  >
                    <el-icon><Plus /></el-icon>
                  </button>
                </div>
              </div>

              <!-- 分隔线 -->
              <div class="control-divider"></div>

              <!-- 字号控制组 -->
              <div class="control-group">
                <div class="group-header">
                  <el-icon class="text-purple-500 text-lg"><EditPen /></el-icon>
                  <span class="group-title">字号</span>
                </div>
                <div class="control-buttons">
                  <button
                    @click="adjustFontSize(-2)"
                    :disabled="lyricsSettings.fontSize <= FONT_SIZE_MIN"
                    class="control-btn control-btn-decrease"
                    :class="{ 'control-btn-disabled': lyricsSettings.fontSize <= FONT_SIZE_MIN }"
                    title="减小字号"
                  >
                    <el-icon><Minus /></el-icon>
                  </button>
                  <div class="control-value">{{ lyricsSettings.fontSize }}</div>
                  <button
                    @click="adjustFontSize(2)"
                    :disabled="lyricsSettings.fontSize >= FONT_SIZE_MAX"
                    class="control-btn control-btn-increase"
                    :class="{ 'control-btn-disabled': lyricsSettings.fontSize >= FONT_SIZE_MAX }"
                    title="增大字号"
                  >
                    <el-icon><Plus /></el-icon>
                  </button>
                </div>
              </div>

              <!-- 分隔线 -->
              <div class="control-divider"></div>

              <!-- 颜色控制组 -->
              <div class="control-group">
                <div class="group-header">
                  <el-icon class="text-orange-500 text-lg"><Brush /></el-icon>
                  <span class="group-title">颜色</span>
                </div>
                <div class="color-control relative" @click.stop>
                  <button
                    class="color-btn"
                    title="选择歌词颜色"
                    @click="toggleColorPicker"
                  >
                    <div
                      class="color-preview"
                      :style="{ backgroundColor: lyricsSettings.color }"
                    ></div>
                    <el-icon class="color-icon"><Brush /></el-icon>
                  </button>

                  <!-- 颜色选择面板 -->
                  <div
                    class="color-picker-panel"
                    :class="{ 'color-picker-visible': showColorPicker }"
                    @click.stop
                  >
                    <div class="color-grid">
                      <button
                        v-for="color in colorOptions"
                        :key="color.value"
                        @click="setLyricsColorAndClose(color.value)"
                        class="color-option"
                        :class="{ 'color-option-active': lyricsSettings.color === color.value }"
                        :style="{ backgroundColor: color.value }"
                        :title="color.name"
                      >
                        <el-icon v-if="lyricsSettings.color === color.value" class="color-check">
                          <Check />
                        </el-icon>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 分隔线 -->
              <div class="control-divider"></div>

              <!-- 重置按钮 -->
              <div class="control-group">
                <button
                  @click="resetLyricsSettings"
                  class="reset-btn"
                  title="重置所有设置"
                >
                  <el-icon class="text-red-500 text-xl"><RefreshRight /></el-icon>
                  <span class="reset-text">重置</span>
                </button>
              </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped lang="scss">
.lyrics-page-container {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// 黑胶唱片旋转动画
.vinyl-spinning {
  animation: vinyl-rotate 8s linear infinite;
}

// 光效旋转动画
.vinyl-light-effect {
  animation: vinyl-rotate 12s linear infinite;
}

// 黑胶唱片容器样式
.vinyl-container {
  position: relative;
  transition: all 1.2s cubic-bezier(0.4, 0, 0.2, 1);

  // 播放时的外发光效果
  &.rounded-full {
    box-shadow:
      0 0 20px rgba(0, 0, 0, 0.3),
      0 0 40px rgba(0, 0, 0, 0.2),
      inset 0 0 20px rgba(255, 255, 255, 0.1);
  }

  // 暂停时的阴影
  &.rounded-2xl {
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
}

// 径向渐变背景类
.bg-gradient-radial {
  background: radial-gradient(circle, var(--tw-gradient-stops));
}

// 黑胶唱片旋转动画 - 更慢更真实
@keyframes vinyl-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// 黑胶唱片纹理动画
@keyframes vinyl-shine {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

// 播放指示器动画
@keyframes record-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

// 歌词行样式优化
.lyric-line {
  position: relative;

  &.activeLyric {
    // 添加微妙的发光效果，但移除竖线
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.1);
  }

  // 悬停效果优化
  &:hover:not(.activeLyric) {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

// 歌词滚动条样式
.lyrics-scrollbar {
  :deep(.el-scrollbar__bar.is-vertical) {
    width: 4px;
    right: 2px;

    .el-scrollbar__thumb {
      background-color: rgba(59, 130, 246, 0.3);
      border-radius: 2px;

      &:hover {
        background-color: rgba(59, 130, 246, 0.5);
      }
    }
  }
}

.activeLyric {
  position: relative;
}

// 自定义滚动条样式
.lyrics-scrollbar {
  :deep(.el-scrollbar__bar) {
    opacity: 0.3;
    transition: opacity 0.3s ease;

    &:hover {
      opacity: 0.6;
    }

    &.is-vertical {
      right: 4px;
      width: 6px;
      border-radius: 3px;
    }
  }

  :deep(.el-scrollbar__thumb) {
    background-color: #d1d5db;
    border-radius: 3px;
    transition: all 0.3s ease;

    &:hover {
      background-color: #9ca3af;
    }
  }
}

// 右侧控制面板样式
.lyrics-control-panel {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);

  // 控制组样式
  .control-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;

    .group-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      margin-bottom: 4px;

      .group-title {
        font-size: 10px;
        font-weight: 500;
        color: #6b7280;
        text-align: center;
        letter-spacing: 0.5px;
      }
    }

    .control-buttons {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }
  }

  // 控制按钮样式
  .control-btn {
    width: 36px;
    height: 36px;
    border-radius: 12px;
    border: none;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.9);
      background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
    }

    &:active {
      transform: translateY(-1px);
      box-shadow: 0 3px 12px rgba(0, 0, 0, 0.2);
    }

    .el-icon {
      font-size: 16px;
      transition: all 0.2s ease;
    }

    &:hover .el-icon {
      transform: scale(1.1);
    }
  }

  .control-btn-decrease {
    .el-icon {
      color: #ef4444;
    }

    &:hover {
      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
    }
  }

  .control-btn-increase {
    .el-icon {
      color: #22c55e;
    }

    &:hover {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
    }
  }

  .control-btn-disabled {
    opacity: 0.4;
    cursor: not-allowed;

    &:hover {
      transform: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    }
  }

  // 数值显示
  .control-value {
    font-size: 11px;
    font-weight: 600;
    color: #374151;
    background: rgba(255, 255, 255, 0.8);
    padding: 4px 8px;
    border-radius: 8px;
    border: 1px solid rgba(229, 231, 235, 0.5);
    min-width: 32px;
    text-align: center;
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  }

  // 颜色控制样式
  .color-control {
    .color-btn {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      border: none;
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
      }

      .color-preview {
        width: 20px;
        height: 20px;
        border-radius: 6px;
        border: 2px solid rgba(255, 255, 255, 0.9);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        position: absolute;
      }

      .color-icon {
        font-size: 14px;
        color: #6b7280;
        z-index: 1;
      }
    }

    .color-picker-panel {
      position: absolute;
      right: calc(100% + 12px);
      top: 50%;
      transform: translateY(-50%) translateX(10px);
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.5);
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 50;

      &.color-picker-visible {
        opacity: 1;
        visibility: visible;
        transform: translateY(-50%) translateX(0);
      }

      .color-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
        min-width: 120px;
      }

      .color-option {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        border: 2px solid rgba(255, 255, 255, 0.8);
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;

        &:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        &.color-option-active {
          border-color: #374151;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
        }

        .color-check {
          color: white;
          font-size: 14px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }
      }
    }
  }

  // 重置按钮样式
  .reset-btn {
    width: 48px;
    height: 48px;
    border-radius: 16px;
    border: none;
    background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.8);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    gap: 2px;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3);
      background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
    }

    &:active {
      transform: translateY(-1px);
    }

    .reset-text {
      font-size: 9px;
      font-weight: 500;
      color: #dc2626;
      letter-spacing: 0.3px;
    }
  }
}

// 分隔线样式
.control-divider {
  width: 32px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(156, 163, 175, 0.4), transparent);
  margin: 4px 0;
}

// 控制面板触发区域样式
.control-trigger-zone {
  transition: all 0.3s ease;

  // 悬停时的背景效果
  &:hover {
    background: linear-gradient(to left, rgba(59, 130, 246, 0.05), transparent);
  }

  // 触发提示显示
  .trigger-hint-display {
    transition: all 0.3s ease;
  }

  // 触发提示样式
  .trigger-hint {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      background: linear-gradient(to bottom, transparent, rgba(59, 130, 246, 0.8), transparent);
      width: 3px;
      transform: scale(1.1);
    }
  }
}

// 自定义进度条样式
.lyrics-progress-slider {
  :deep(.el-slider__runway) {
    background-color: #e5e7eb;
    height: 2px;
    border-radius: 1px;
  }

  :deep(.el-slider__bar) {
    background-color: #3b82f6;
    height: 2px;
    border-radius: 1px;
  }

  :deep(.el-slider__button) {
    width: 16px;
    height: 16px;
    border: 2px solid #3b82f6;
    background-color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;

    &:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
  }
}

// 音量滑块样式
.lyrics-volume-slider {
  :deep(.el-slider__runway) {
    background-color: #e5e7eb;
    height: 2px;
    border-radius: 1px;
  }

  :deep(.el-slider__bar) {
    background-color: #6b7280;
    height: 2px;
    border-radius: 1px;
  }

  :deep(.el-slider__button) {
    width: 12px;
    height: 12px;
    border: 2px solid #6b7280;
    background-color: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;

    &:hover {
      transform: scale(1.1);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    }
  }
}

// 播放控制按钮增强样式
.group {
  // 按钮内部光泽效果
  &::before {
    content: '';
    position: absolute;
    top: 1px;
    left: 1px;
    right: 1px;
    height: 50%;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, transparent 100%);
    border-radius: inherit;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: 1;
  }

  // 按钮按下效果
  &:active {
    transform: scale(0.95) !important;
    transition: transform 0.1s ease;
  }

  // 图标动画效果
  .el-icon, .iconify {
    transition: all 0.2s ease;
  }

  // 激活状态的特殊效果
  &.active-mode {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);

    &::after {
      content: '';
      position: absolute;
      inset: -2px;
      background: linear-gradient(45deg, transparent, rgba(59, 130, 246, 0.1), transparent);
      border-radius: inherit;
      animation: rotate-border 3s linear infinite;
      z-index: -1;
    }
  }
}

// 主播放按钮特殊效果
button[title="播放/暂停"] {
  // 脉冲动画（播放时）
  &.playing {
    animation: pulse-glow 2s infinite;
  }

  // 播放按钮的特殊悬停效果
  &:hover {
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
  }
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
  }
  50% {
    box-shadow: 0 4px 25px rgba(59, 130, 246, 0.5);
  }
}

@keyframes rotate-border {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

// 按钮涟漪效果
.ripple-effect {
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }

  &:active::after {
    width: 200px;
    height: 200px;
  }
}

// 按钮悬停时的阴影增强
button[title="随机播放"]:hover,
button[title="循环播放"]:hover {
  filter: brightness(1.05);
}

button[title="上一首"]:hover,
button[title="下一首"]:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

// 激活状态按钮的特殊光效
.active-mode {
  position: relative;

  &::before {
    opacity: 0.8 !important;
  }

  // 内部发光效果
  &::after {
    content: '';
    position: absolute;
    inset: 2px;
    background: radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    border-radius: inherit;
    pointer-events: none;
  }
}

/* 音频波形动画 */
@keyframes audioWave {
  0%, 100% {
    transform: scaleY(0.3);
    opacity: 0.6;
  }
  50% {
    transform: scaleY(1);
    opacity: 1;
  }
}

/* 按钮波纹效果 */
@keyframes ripple {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

/* 下拉动画 */
@keyframes slideDown {
  0% {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 黑胶唱片旋转动画 */
@keyframes vinyl-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.vinyl-spinning {
  animation: vinyl-spin 3s linear infinite;
}

/* 黑胶唱片光效动画 */
@keyframes vinyl-light {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.vinyl-light-effect {
  animation: vinyl-light 4s linear infinite;
}
</style>
