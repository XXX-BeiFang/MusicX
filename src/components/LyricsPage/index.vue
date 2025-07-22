<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted, Transition } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { formatTime } from '@/utils'
import { settingStore } from '@/stores/modules/setting'
import { Icon } from '@iconify/vue'
import { ElScrollbar, ElIcon } from 'element-plus'
import { Timer, EditPen, Brush, Plus, Minus, Check, RefreshRight, Mouse, VideoPlay, VideoPause, Back, Right, Refresh, Sort, Star, Share, Setting, Mute, Microphone, Close, ArrowDown } from '@element-plus/icons-vue'
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
  Close,
  ElIcon,
  ElScrollbar
}

// 歌词设置相关状态
const lyricsSettings = ref({
  fontSize: 18, // 默认字体大小
  color: '#3b82f6', // 默认颜色
  speedOffset: 0, // 歌词速度偏移（秒）
  fontFamily: 'default' // 默认字体
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
  { name: '宁静青', value: '#06b6d4' },
  { name: '典雅红', value: '#dc2626' }
]

// 字体选项 - 按类别组织
const fontCategories = [
  {
    title: '中文字体',
    fonts: [
      { name: '默认', value: 'default', family: 'inherit' },
      { name: '思源黑体', value: 'source-han-sans', family: '"Source Han Sans SC", "Noto Sans CJK SC", sans-serif' },
      { name: '思源宋体', value: 'source-han-serif', family: '"Source Han Serif SC", "Noto Serif CJK SC", serif' },
      { name: '苹方', value: 'pingfang', family: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif' },
      { name: '微软雅黑', value: 'microsoft-yahei', family: '"Microsoft YaHei", "Segoe UI", sans-serif' },
      { name: '华文楷体', value: 'stkaiti', family: '"STKaiti", "KaiTi", "楷体", serif' }
    ]
  },
  {
    title: '英文字体',
    fonts: [
      { name: 'Helvetica', value: 'helvetica', family: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
      { name: 'Times', value: 'times', family: '"Times New Roman", Times, serif' },
      { name: 'Georgia', value: 'georgia', family: 'Georgia, "Times New Roman", serif' }
    ]
  }
]

// 保持向后兼容的扁平化字体选项
const fontOptions = fontCategories.flatMap(category => category.fonts)

// 字体样式选项
const fontStyleOptions = [
  { name: '加粗', value: 'bold', style: 'font-weight: bold;', icon: 'B' },
  { name: '斜体', value: 'italic', style: 'font-style: italic;', icon: 'I' },
  { name: '下划线', value: 'underline', style: 'text-decoration: underline;', icon: 'U' }
]

// 字体样式状态
const selectedFontStyles = ref(new Set())

// 控制面板显示状态
const showControlPanel = ref(false)
const showFontPanel = ref(false)
const controlPanelTimer = ref<NodeJS.Timeout | null>(null)
const showInitialHint = ref(true)
// 右侧功能区显示状态（通过齿轮按钮控制）
const showControlPanelByButton = ref(false)

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

// 跳转到MV页面
const router = useRouter()
function goToMV() {
  if (currentTrack.value.mv && currentTrack.value.mv !== 0) {
    router.push(`/mv/${currentTrack.value.mv}`)
  }
}

// 获取播放来源
function getPlaySource() {
  // 优先使用 source 字段
  if (currentTrack.value.source) {
    return currentTrack.value.source
  }

  // 如果没有 source 字段，根据URL判断播放来源
  const url = currentTrack.value.url || ''
  if (url.includes('music.163.com') || url.includes('netease')) {
    return '网易云音乐'
  } else if (url.includes('qq.com') || url.includes('tencent')) {
    return 'QQ音乐'
  } else if (url.includes('kugou.com')) {
    return '酷狗音乐'
  } else if (url.includes('kuwo.cn')) {
    return '酷我音乐'
  } else if (url.includes('xiami.com')) {
    return '虾米音乐'
  } else {
    return '本地音乐'
  }
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

// 动画事件处理
const onBeforeEnter = () => {
  // 动画开始前的准备工作
  document.body.style.overflow = 'hidden'
}

const onAfterEnter = () => {
  // 动画完成后的清理工作
  document.body.style.overflow = ''
}

const onBeforeLeave = () => {
  // 离开动画开始前的准备工作
  document.body.style.overflow = 'hidden'
}

const onAfterLeave = () => {
  // 离开动画完成后的清理工作
  document.body.style.overflow = ''
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

const setLyricsFont = (fontValue: string) => {
  lyricsSettings.value.fontFamily = fontValue
}

// 计算当前字体样式
const currentFontFamily = computed(() => {
  const selectedFont = fontOptions.find(font => font.value === lyricsSettings.value.fontFamily)
  return selectedFont ? selectedFont.family : 'inherit'
})

// 计算当前字体样式CSS
const currentFontStyle = computed(() => {
  let styles = []
  if (selectedFontStyles.value.has('bold')) {
    styles.push('font-weight: bold')
  }
  if (selectedFontStyles.value.has('italic')) {
    styles.push('font-style: italic')
  }
  if (selectedFontStyles.value.has('underline')) {
    styles.push('text-decoration: underline')
  }
  return styles.join('; ')
})

const resetLyricsSettings = () => {
  lyricsSettings.value = {
    fontSize: 18,
    color: '#3b82f6',
    speedOffset: 0,
    fontFamily: 'default'
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

// 齿轮按钮控制右侧功能区显示/隐藏
const toggleControlPanelByButton = () => {
  showControlPanelByButton.value = !showControlPanelByButton.value
  if (showControlPanelByButton.value && showInitialHint.value) {
    showInitialHint.value = false
  }
}

// 点击外部隐藏右侧功能区
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  // 检查点击是否在右侧功能区域或齿轮按钮内
  if (!target.closest('.control-trigger-zone') && !target.closest('.gear-button')) {
    showControlPanelByButton.value = false
  }
}

// 颜色选择面板显示/隐藏逻辑
const showColorPicker = ref(false)

const toggleColorPicker = (event?: Event) => {
  if (event) {
    event.stopPropagation()
  }
  // 如果字体面板已打开，先关闭字体面板
  if (showFontPanel.value) {
    showFontPanel.value = false
  }
  showColorPicker.value = !showColorPicker.value
}

const setLyricsColorAndClose = (color: string) => {
  setLyricsColor(color)
  showColorPicker.value = false
}

// 字体面板切换函数
const toggleFontPanel = (event?: Event) => {
  if (event) {
    event.stopPropagation()
  }
  // 如果颜色面板已打开，先关闭颜色面板
  if (showColorPicker.value) {
    showColorPicker.value = false
  }
  showFontPanel.value = !showFontPanel.value
}

const setLyricsFontAndClose = (fontValue: string) => {
  setLyricsFont(fontValue)
  showFontPanel.value = false
}

// 切换字体样式
const toggleFontStyle = (styleValue: string) => {
  if (selectedFontStyles.value.has(styleValue)) {
    selectedFontStyles.value.delete(styleValue)
  } else {
    selectedFontStyles.value.add(styleValue)
  }
  // 触发响应式更新
  selectedFontStyles.value = new Set(selectedFontStyles.value)
}

// 点击外部关闭颜色选择面板
const closeColorPicker = (event: Event) => {
  const target = event.target as HTMLElement
  // 检查点击是否在颜色选择器内部
  if (!target.closest('.color-control')) {
    showColorPicker.value = false
  }
}

// 点击外部关闭字体选择面板
const closeFontPanel = (event: Event) => {
  const target = event.target as HTMLElement
  // 检查点击是否在字体选择器内部
  if (!target.closest('.font-control')) {
    showFontPanel.value = false
  }
}

// 监听全局点击事件
onMounted(() => {
  document.addEventListener('click', closeColorPicker)
  document.addEventListener('click', closeFontPanel)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', closeColorPicker)
  document.removeEventListener('click', closeFontPanel)
  document.removeEventListener('click', handleClickOutside)
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
  <Transition
    name="drawer"
    appear
    @before-enter="onBeforeEnter"
    @after-enter="onAfterEnter"
    @before-leave="onBeforeLeave"
    @after-leave="onAfterLeave"
  >
    <div
      v-if="showLyricsPage"
      class="fixed inset-0 z-50 lyrics-page-container bg-white dark:bg-gray-900"
    >
    <!-- 主要内容区域 -->
    <div class="h-full flex flex-col">
      <!-- 顶部导航栏 -->
      <header class="relative flex items-center justify-between px-8 py-6 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
        <!-- 左侧返回按钮 -->
        <div class="flex items-center">
          <button
            @click="closeLyricsPage"
            class="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <el-icon class="text-xl">
              <ArrowDown />
            </el-icon>
          </button>
        </div>

        <!-- 右侧按钮组 -->
        <div class="flex items-center gap-3">
          <!-- 主题切换按钮 -->
          <button
            @click="toggleTheme($event)"
            class="group relative w-11 h-11 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900 dark:hover:to-blue-800 border border-gray-200/50 dark:border-gray-600/50 hover:border-blue-200 dark:hover:border-blue-400 transition-all duration-300 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
            :class="{ 'from-blue-100 to-blue-200 border-blue-300 text-blue-700 dark:from-blue-800 dark:to-blue-700 dark:border-blue-500 dark:text-blue-300': isDarkMode }"
          >
            <!-- 背景光效 -->
            <div class="absolute inset-0 rounded-xl bg-gradient-to-br from-white/60 dark:from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Icon
              :icon="getCurrentThemeIcon(isDarkMode)"
              :class="[getThemeIconSize(), 'relative z-10 transition-transform duration-200 group-hover:scale-110']"
            />
          </button>

          <!-- 收藏按钮 -->
          <button class="group relative w-11 h-11 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 hover:from-red-50 hover:to-red-100 dark:hover:from-red-900 dark:hover:to-red-800 border border-gray-200/50 dark:border-gray-600/50 hover:border-red-200 dark:hover:border-red-400 transition-all duration-300 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95">
            <!-- 背景光效 -->
            <div class="absolute inset-0 rounded-xl bg-gradient-to-br from-white/60 dark:from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <el-icon class="text-lg relative z-10 transition-transform duration-200 group-hover:scale-110">
              <Star />
            </el-icon>
            <!-- 装饰性心形粒子 -->
            <div class="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-300"></div>
          </button>

          <!-- 分享按钮 -->
          <button class="group relative w-11 h-11 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900 dark:hover:to-blue-800 border border-gray-200/50 dark:border-gray-600/50 hover:border-blue-200 dark:hover:border-blue-400 transition-all duration-300 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95">
            <!-- 背景光效 -->
            <div class="absolute inset-0 rounded-xl bg-gradient-to-br from-white/60 dark:from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <el-icon class="text-lg relative z-10 transition-transform duration-200 group-hover:scale-110">
              <Share />
            </el-icon>
            <!-- 分享动画效果 -->
            <div class="absolute inset-0 rounded-xl border-2 border-blue-400/30 opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-300"></div>
          </button>

          <!-- 右侧功能区控制按钮（齿轮） -->
          <button
            class="gear-button group relative w-11 h-11 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 hover:from-orange-50 hover:to-orange-100 dark:hover:from-orange-900 dark:hover:to-orange-800 border border-gray-200/50 dark:border-gray-600/50 hover:border-orange-200 dark:hover:border-orange-400 transition-all duration-300 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
            @click="toggleControlPanelByButton"
          >
            <!-- 背景光效 -->
            <div class="absolute inset-0 rounded-xl bg-gradient-to-br from-white/60 dark:from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <el-icon class="text-lg relative z-10 transition-transform duration-200 group-hover:scale-110" :class="{ 'animate-spin': showControlPanelByButton }">
              <Setting />
            </el-icon>
            <!-- 活跃状态指示器 -->
            <div
              class="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full transition-all duration-300"
              :class="showControlPanelByButton ? 'opacity-100 scale-100' : 'opacity-0 scale-0'"
            >
              <div class="absolute inset-0 bg-orange-400 rounded-full animate-ping"></div>
            </div>
          </button>


        </div>
      </header>

      <!-- 主内容区域 -->
      <main class="flex-1 flex min-h-0">
        <!-- 左侧：专辑封面区域 -->
        <div class="w-1/3 flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-900">
          <!-- 专辑封面 - 黑胶唱片效果 -->
          <div class="relative mb-10">
            <!-- 音波可视化特效系统 - 仅在播放时显示 -->
            <div
              v-if="isPlaying"
              class="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <!-- 背景光晕效果 -->
              <div class="absolute inset-0 soundwave-glow-bg"></div>

              <!-- 外层：低频慢波扩散 -->
              <div class="absolute w-96 h-96 border-2 rounded-full soundwave-outer-1"></div>
              <div class="absolute w-104 h-104 border-2 rounded-full soundwave-outer-2"></div>
              <div class="absolute w-112 h-112 border rounded-full soundwave-outer-3"></div>
              <div class="absolute w-120 h-120 border rounded-full soundwave-outer-4"></div>

              <!-- 中层：中频波动效果 -->
              <div class="absolute w-80 h-80 border-2 rounded-full soundwave-mid-1"></div>
              <div class="absolute w-88 h-88 border-2 rounded-full soundwave-mid-2"></div>
              <div class="absolute w-72 h-72 border rounded-full soundwave-mid-3"></div>
              <div class="absolute w-84 h-84 border rounded-full soundwave-mid-4"></div>

              <!-- 内层：高频快速波纹 -->
              <div class="absolute w-64 h-64 border-2 rounded-full soundwave-inner-1"></div>
              <div class="absolute w-68 h-68 border-2 rounded-full soundwave-inner-2"></div>
              <div class="absolute w-60 h-60 border rounded-full soundwave-inner-3"></div>
              <div class="absolute w-56 h-56 border rounded-full soundwave-inner-4"></div>

              <!-- 频谱可视化条 -->
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="spectrum-visualizer">
                  <div class="spectrum-bar spectrum-bar-1"></div>
                  <div class="spectrum-bar spectrum-bar-2"></div>
                  <div class="spectrum-bar spectrum-bar-3"></div>
                  <div class="spectrum-bar spectrum-bar-4"></div>
                  <div class="spectrum-bar spectrum-bar-5"></div>
                  <div class="spectrum-bar spectrum-bar-6"></div>
                  <div class="spectrum-bar spectrum-bar-7"></div>
                  <div class="spectrum-bar spectrum-bar-8"></div>
                </div>
              </div>

              <!-- 脉冲节拍效果 -->
              <div class="absolute w-52 h-52 border-4 rounded-full pulse-beat-1"></div>
              <div class="absolute w-48 h-48 border-2 rounded-full pulse-beat-2"></div>
              <div class="absolute w-44 h-44 border rounded-full pulse-beat-3"></div>

              <!-- 动态光环 -->
              <div class="absolute w-76 h-76 rounded-full dynamic-ring-1"></div>
              <div class="absolute w-92 h-92 rounded-full dynamic-ring-2"></div>
              <div class="absolute w-108 h-108 rounded-full dynamic-ring-3"></div>
            </div>
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



            <!-- 暂停状态的装饰 -->
            <!-- <div
              class="absolute -top-2 -left-2"
              :style="{
                transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: !isPlaying ? '1' : '0',
                transform: !isPlaying ? 'scale(1)' : 'scale(0)'
              }"
            >
              <div class="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center shadow-lg border border-gray-300/50 backdrop-blur-sm">
              -->
                <!-- 暂停图标 -->
                <!-- <Icon icon="material-symbols:pause-rounded" class="text-gray-500 text-sm" /> -->
                <!-- 装饰性光点 -->
                <!-- <div class="absolute -top-1 -right-1 w-2 h-2 bg-orange-400 rounded-full animate-pulse shadow-sm"></div>
              </div>
            </div> -->
          </div>



          <!-- 歌曲信息 -->
          <!-- <div class="text-center mb-6"> -->
            <!-- 歌曲标题 -->
            <!-- <div class="flex items-center justify-center gap-2 mb-2">
              <Icon icon="material-symbols:music-note" class="text-blue-500 dark:text-blue-400 text-lg" />
              <h2 class="text-xl font-medium text-gray-900 dark:text-white">{{ currentTrack.title }}</h2>
            </div> -->

            <!-- 艺术家 -->
            <!-- <div class="flex items-center justify-center gap-2 mb-1">
              <Icon icon="material-symbols:person" class="text-gray-500 dark:text-gray-400 text-sm" />
              <p class="text-base text-gray-600 dark:text-gray-300">{{ currentTrack.artist }}</p>
            </div> -->

            <!-- 专辑 -->
            <!-- <div class="flex items-center justify-center gap-2">
              <Icon icon="material-symbols:album" class="text-gray-400 dark:text-gray-500 text-sm" />
              <p class="text-sm text-gray-400 dark:text-gray-500">{{ currentTrack.album || '未知专辑' }}</p>
            </div>
          </div> -->

          <!-- 播放控制 -->
          <div class="flex items-center justify-center gap-4 mb-6">
            <!-- 随机播放按钮 -->
            <button
              @click="setPlayMode('shuffle')"
              :class="[
                'group relative w-11 h-11 rounded-xl border transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95 ripple-effect',
                playMode === 'shuffle'
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-400/30 text-white active-mode'
                  : 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900 dark:hover:to-blue-800 border-gray-200/50 dark:border-gray-600/50 hover:border-blue-200 dark:hover:border-blue-400 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              ]"
              title="随机播放"
            >
              <div class="absolute inset-0 rounded-xl bg-gradient-to-br from-white/60 dark:from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <el-icon :class="['text-lg relative z-10 transition-transform duration-200', playMode === 'shuffle' ? 'animate-pulse' : '']">
                <Refresh />
              </el-icon>
            </button>

            <!-- 上一首按钮 -->
            <button
              @click="prevTrack"
              class="group relative w-12 h-12 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-600 dark:hover:to-gray-500 border border-gray-200/50 dark:border-gray-600/50 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-300 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95 ripple-effect"
              title="上一首"
            >
              <div class="absolute inset-0 rounded-xl bg-gradient-to-br from-white/60 dark:from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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


              </div>
            </button>

            <!-- 下一首按钮 -->
            <button
              @click="nextTrack"
              class="group relative w-12 h-12 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-600 dark:hover:to-gray-500 border border-gray-200/50 dark:border-gray-600/50 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-300 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95 ripple-effect"
              title="下一首"
            >
              <div class="absolute inset-0 rounded-xl bg-gradient-to-br from-white/60 dark:from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
                  : 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 hover:from-green-50 hover:to-green-100 dark:hover:from-green-900 dark:hover:to-green-800 border-gray-200/50 dark:border-gray-600/50 hover:border-green-200 dark:hover:border-green-400 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400'
              ]"
              title="循环播放"
            >
              <div class="absolute inset-0 rounded-xl bg-gradient-to-br from-white/60 dark:from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <el-icon :class="['text-lg relative z-10 transition-transform duration-200', playMode === 'loop' ? 'animate-spin' : '']" style="animation-duration: 2s;">
                <RefreshRight />
              </el-icon>
            </button>
          </div>

          <!-- 进度条 -->
          <div class="w-full max-w-xs mb-4 relative">

            <!-- 进度条容器 -->
            <div class="relative">
              <!-- 进度条背景装饰 -->
              <div class="absolute -inset-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg opacity-50 blur-sm"></div>

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
                  <Icon icon="material-symbols:play-arrow" class="text-xs text-blue-500 dark:text-blue-400" />
                  <span class="text-xs text-gray-500 dark:text-gray-400">{{ formatTime(currentTime) }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <span class="text-xs text-gray-500 dark:text-gray-400">{{ formatTime(duration) }}</span>
                  <Icon icon="material-symbols:music-note" class="text-xs text-gray-400 dark:text-gray-500" />
                </div>
              </div>
            </div>
          </div>

          <!-- 音量控制 -->
          <div class="flex items-center gap-2">
            <button
              @click="toggleVolume"
              class="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
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
            <span class="text-xs text-gray-500 dark:text-gray-400 w-6 text-center">{{ volume }}</span>
              <Icon icon="material-symbols:percent" class="text-xs text-gray-400 dark:text-gray-500" />
            </div>
          </div>
        </div>

        <!-- 右侧：歌词显示 -->
        <div class="w-2/3 bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-700 flex min-h-0 relative lyrics-area">
          <!-- 歌词内容区域 -->
          <div class="flex-1 p-8 flex flex-col min-h-0">
            <!-- 歌曲信息区域 -->
            <div class="mb-6 pb-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
              <!-- 歌曲标题和MV按钮 -->
              <div class="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
                <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white text-center break-words">
                  {{ currentTrack.title }}
                </h1>
                <!-- MV按钮 -->
                <button
                  v-if="currentTrack.mv && currentTrack.mv !== 0"
                  @click="goToMV"
                  class="mv-button group relative px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-xs sm:text-sm font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-1.5 sm:gap-2 flex-shrink-0"
                >
                  <Icon icon="material-symbols:play-circle" class="play-icon text-base sm:text-lg" />
                  <span>MV</span>
                  <!-- 装饰性光效 -->
                  <div class="absolute inset-0 rounded-lg bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </button>
              </div>

              <!-- 歌曲详细信息 -->
              <div class="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 gap-y-2 text-center text-sm">
                <!-- 专辑信息 -->
                <div class="flex items-center gap-1.5">
                  <span class="text-gray-500 dark:text-gray-400 flex-shrink-0">专辑:</span>
                  <!-- <Icon icon="material-symbols:album" class="text-gray-400 dark:text-gray-500 text-sm flex-shrink-0" /> -->
                  <span class="text-gray-600 dark:text-gray-300 whitespace-nowrap">{{ currentTrack.album || '未知专辑' }}</span>
                </div>

                <!-- 艺术家信息 -->
                <div class="flex items-center gap-1.5">
                  <span class="text-gray-500 dark:text-gray-400 flex-shrink-0">歌手:</span>
                  <!-- <Icon icon="material-symbols:person" class="text-gray-400 dark:text-gray-500 text-sm flex-shrink-0" /> -->
                  <span class="text-gray-600 dark:text-gray-300 whitespace-nowrap">{{ currentTrack.artist }}</span>
                </div>

                <!-- 播放来源信息 -->
                <div class="flex items-center gap-1.5">
                  <span class="text-gray-500 dark:text-gray-400 flex-shrink-0">来源:</span>
                  <!-- <Icon icon="material-symbols:cloud-queue" class="text-gray-400 dark:text-gray-500 text-sm flex-shrink-0" /> -->
                  <span class="text-gray-600 dark:text-gray-300 whitespace-nowrap">{{ getPlaySource() }}</span>
                </div>
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
                  class="group text-center cursor-pointer py-4 px-6 mx-4 mb-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 relative lyric-line"
                  :class="
                    adjustedCurrentLyricIndex == index
                      ? 'activeLyric bg-blue-50/80 dark:bg-blue-900/30 shadow-sm border border-blue-100 dark:border-blue-800'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  "
                  :style="{
                    transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: adjustedCurrentLyricIndex == index ? 'scale(1.05)' : 'scale(1)',
                    fontSize: adjustedCurrentLyricIndex == index ? `${lyricsSettings.fontSize + 4}px` : `${lyricsSettings.fontSize}px`,
                    fontWeight: selectedFontStyles.has('bold') ? 'bold' : (adjustedCurrentLyricIndex == index ? '600' : '400'),
                    fontStyle: selectedFontStyles.has('italic') ? 'italic' : 'normal',
                    textDecoration: selectedFontStyles.has('underline') ? 'underline' : 'none',
                    lineHeight: adjustedCurrentLyricIndex == index ? '1.6' : '1.5',
                    opacity: adjustedCurrentLyricIndex == index ? '1' : '0.7',
                    color: adjustedCurrentLyricIndex == index ? lyricsSettings.color : '',
                    fontFamily: currentFontFamily
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
                  <div class="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-60 transition-opacity duration-200 text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                    <Icon icon="material-symbols:schedule" class="text-xs" />
                    {{ formatTime(item.time / 1000) }}
                  </div>
                </div>
              </template>

              <!-- 无歌词时的提示 -->
              <div
                v-if="!currentTrack.lyrics?.lines?.length"
                class="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 py-20"
              >
                <div class="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
                  <Icon icon="material-symbols:lyrics" class="text-2xl text-gray-400 dark:text-gray-500" />
                </div>
                <div class="flex items-center gap-2 mb-2">
                  <Icon icon="material-symbols:info" class="text-blue-500 dark:text-blue-400 text-sm" />
                  <h3 class="text-lg font-medium text-gray-600 dark:text-gray-400">暂无歌词</h3>
                </div>
                <div class="flex items-center gap-2">
                  <Icon icon="material-symbols:headphones" class="text-green-500 dark:text-green-400 text-sm" />
                  <p class="text-sm text-gray-400 dark:text-gray-500">请欣赏这美妙的音乐</p>
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
                v-show="!showControlPanel && !showControlPanelByButton"
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
                    <span>悬停此区域或点击齿轮显示控制面板</span>
                  </div>
                  <!-- 箭头指向触发区域 -->
                  <div class="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-blue-500/90 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
                </div>
              </div>

              <!-- 悬停状态或按钮激活状态：显示控制面板 -->
              <div
                v-show="showControlPanel || showControlPanelByButton"
                class="lyrics-control-panel w-full flex flex-col items-center justify-center py-6 transition-all duration-300 ease-out relative min-h-full"
              >
            <!-- 背景装饰 -->
            <div class="absolute inset-0 bg-gradient-to-b from-blue-50/30 via-purple-50/20 to-pink-50/30 dark:from-blue-900/20 dark:via-purple-900/15 dark:to-pink-900/20 rounded-l-3xl"></div>
            <div class="absolute inset-0 backdrop-blur-xl bg-white/40 dark:bg-gray-800/40 rounded-l-3xl border-l border-t border-b border-white/50 dark:border-gray-600/50 shadow-2xl"></div>

            <!-- 控制按钮组 -->
            <div class="flex flex-col items-center gap-6 relative z-10">

              <!-- 速度控制组 -->
              <div class="control-group">
                <div class="group-header">
                  <el-icon class="text-blue-500 dark:text-blue-400 text-lg"><Timer /></el-icon>
                  <span class="group-title">速度</span>
                </div>
                <div class="control-buttons">
                  <button
                    @click="adjustSpeed(0.5)"
                    class="control-btn control-btn-increase"
                    title="加快歌词速度"
                  >
                    <el-icon><Plus /></el-icon>
                  </button>
                  <div class="control-value">{{ lyricsSettings.speedOffset >= 0 ? '+' : '' }}{{ lyricsSettings.speedOffset }}s</div>
                  <button
                    @click="adjustSpeed(-0.5)"
                    class="control-btn control-btn-decrease"
                    title="减慢歌词速度"
                  >
                    <el-icon><Minus /></el-icon>
                  </button>
                </div>
              </div>

              <!-- 分隔线 -->
              <div class="control-divider"></div>

              <!-- 字号控制组 -->
              <div class="control-group">
                <div class="group-header">
                  <el-icon class="text-purple-500 dark:text-purple-400 text-lg"><EditPen /></el-icon>
                  <span class="group-title">字号</span>
                </div>
                <div class="control-buttons vertical">
                  <button
                    @click="adjustFontSize(2)"
                    :disabled="lyricsSettings.fontSize >= FONT_SIZE_MAX"
                    class="control-btn control-btn-increase"
                    :class="{ 'control-btn-disabled': lyricsSettings.fontSize >= FONT_SIZE_MAX }"
                    title="字体放大"
                  >
                    <el-icon><Plus /></el-icon>
                  </button>
                  <div class="control-value">{{ lyricsSettings.fontSize }}</div>
                  <button
                    @click="adjustFontSize(-2)"
                    :disabled="lyricsSettings.fontSize <= FONT_SIZE_MIN"
                    class="control-btn control-btn-decrease"
                    :class="{ 'control-btn-disabled': lyricsSettings.fontSize <= FONT_SIZE_MIN }"
                    title="字体缩小"
                  >
                    <el-icon><Minus /></el-icon>
                  </button>
                </div>
              </div>

              <!-- 分隔线 -->
              <div class="control-divider"></div>

              <!-- 字体控制组 -->
              <div class="control-group">
                <div class="group-header">
                  <el-icon class="text-indigo-500 dark:text-indigo-400 text-lg"><Setting /></el-icon>
                  <span class="group-title">字体</span>
                </div>
                <div class="font-control">
                  <button
                    class="font-btn"
                    @click.stop="toggleFontPanel"
                    :title="`当前字体: ${fontOptions.find(f => f.value === lyricsSettings.fontFamily)?.name || '默认'}`"
                  >
                    <span class="font-preview" :style="{ fontFamily: currentFontFamily }">字</span>
                  </button>

                  <!-- 字体选择面板 -->
                  <div
                    v-if="showFontPanel"
                    class="color-picker-panel font-picker-panel"
                    @click.stop
                  >
                    <!-- 字体选择区域 -->
                    <div class="color-grid">
                      <button
                        v-for="font in fontOptions"
                        :key="font.value"
                        @click="setLyricsFontAndClose(font.value)"
                        class="color-option"
                        :class="{ 'color-option-active': lyricsSettings.fontFamily === font.value }"
                        :title="font.name"
                      >
                        <div class="font-preview" :style="{ fontFamily: font.family }">字</div>
                      </button>
                    </div>

                    <!-- 分隔线 -->
                    <div class="font-style-divider"></div>

                    <!-- 字体样式选择区域 -->
                    <div class="font-style-grid">
                      <button
                        v-for="style in fontStyleOptions"
                        :key="style.value"
                        @click="toggleFontStyle(style.value)"
                        class="font-style-option"
                        :class="{ 'font-style-option-active': selectedFontStyles.has(style.value) }"
                        :title="style.name"
                      >
                        <div class="font-style-preview" :style="style.style">{{ style.icon }}</div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 分隔线 -->
              <div class="control-divider"></div>

              <!-- 颜色控制组 -->
              <div class="control-group">
                <div class="group-header">
                  <el-icon class="text-orange-500 dark:text-orange-400 text-lg"><Brush /></el-icon>
                  <span class="group-title">颜色</span>
                </div>
                <div class="color-control relative">
                  <button
                    class="color-btn"
                    title="选择歌词颜色"
                    @click.stop="toggleColorPicker"
                  >
                    <div
                      class="color-preview"
                      :style="{ backgroundColor: lyricsSettings.color }"
                    ></div>
                    <el-icon class="color-icon"><Brush /></el-icon>
                  </button>

                  <!-- 颜色选择面板 -->
                  <div
                    v-if="showColorPicker"
                    class="color-picker-panel"
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
                  <el-icon class="text-red-500 dark:text-red-400 text-xl"><RefreshRight /></el-icon>
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
  </Transition>
</template>

<style scoped lang="scss">
// MV按钮特殊效果
.mv-button {
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }

  // 播放图标动画
  &:hover .play-icon {
    animation: pulse-play 0.6s ease-in-out;
  }
}

@keyframes pulse-play {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

// 抽屉式动画效果
.drawer-enter-active {
  transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94),
              opacity 0.3s ease-out;
}

.drawer-leave-active {
  transition: transform 0.35s cubic-bezier(0.55, 0.055, 0.675, 0.19),
              opacity 0.25s ease-in;
}

.drawer-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.drawer-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.drawer-enter-to,
.drawer-leave-from {
  transform: translateY(0);
  opacity: 1;
}

// 确保动画期间性能优化
.lyrics-page-container {
  will-change: transform, opacity;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transform-style: preserve-3d;
  -webkit-transform-style: preserve-3d;
}

@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// 黑胶唱片旋转动画 - 调慢速度更舒适
.vinyl-spinning {
  animation: vinyl-rotate 15s linear infinite;
}

// 光效旋转动画 - 比封面稍慢一些
.vinyl-light-effect {
  animation: vinyl-rotate 20s linear infinite;
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
  }

  .color-picker-panel {
      position: absolute;
      top: -190%;
      right: 100%;
      margin-right: 20px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.5);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 1000;
      // animation: slideInLeft 0.3s ease-out;

      .color-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
        min-width: 120px;
      }

      // 分隔线样式
      .font-style-divider {
        height: 1px;
        background: linear-gradient(90deg, transparent 0%, rgba(229, 231, 235, 0.5) 50%, transparent 100%);
        margin: 12px 0;
      }

      // 字体样式选择网格
      .font-style-grid {
        display: flex;
        justify-content: center;
        gap: 16px;
        width: 100%;
      }

      // 字体样式选项
      .font-style-option {
        width: 28px;
        height: 28px;
        border-radius: 6px;
        border: 2px solid rgba(229, 231, 235, 0.5);
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        background: rgba(255, 255, 255, 0.8);
        flex-shrink: 0;

        &:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          border-color: rgba(99, 102, 241, 0.4);
        }

        &.font-style-option-active {
          border-color: #4338ca;
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.4);
          background: rgba(99, 102, 241, 0.1);
          transform: scale(1.05);

          .font-style-preview {
            color: #4338ca !important;
            font-weight: 700;
          }
        }

        .font-style-preview {
          color: #374151;
          font-size: 14px;
          font-weight: 600;
          line-height: 1;
          font-family: 'Arial', sans-serif;
        }
      }

      .color-option {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        border: 2px solid rgba(229, 231, 235, 0.5);
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        background: rgba(255, 255, 255, 0.8);

        &:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          border-color: rgba(99, 102, 241, 0.4);
        }

        .font-preview {
          color: #374151;
          font-size: 16px;
          font-weight: 500;
          line-height: 1;
        }

        &.color-option-active {
          border-color: #4338ca;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.4);
          background: rgba(99, 102, 241, 0.1);
          transform: scale(1.05);

          .font-preview {
            color: #4338ca !important;
            font-weight: 700;
            transform: scale(1.1);
          }
        }
      }
    }
  }

  // 字体选择面板特定样式
  .font-picker-panel {
    top: 70% !important;
    transform: translateY(-50%);
  }

// 深色模式下的颜色控制样式
.dark .color-control {
  .color-btn {
    background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1);

    &:hover {
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
    }

    .color-preview {
      border: 2px solid rgba(229, 231, 235, 0.9);
    }

    .color-icon {
      color: #9ca3af;
    }
  }

  .color-picker-panel {
    background: rgba(55, 65, 81, 0.95);
    border: 1px solid rgba(75, 85, 99, 0.5);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);

    .color-option {
      border: 2px solid rgba(75, 85, 99, 0.8);
      background: rgba(75, 85, 99, 0.3);

      &:hover {
        border-color: rgba(129, 140, 248, 0.6);
        background: rgba(129, 140, 248, 0.1);
      }

      &.color-option-active {
        border-color: #818cf8;
        box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.5);
        background: rgba(129, 140, 248, 0.2);

        .font-preview {
          color: #e0e7ff !important;
          font-weight: 700;
          transform: scale(1.1);
        }
      }

      .font-preview {
        color: #e5e7eb;
      }
    }

    // 深色模式下的分隔线
    .font-style-divider {
      background: linear-gradient(90deg, transparent 0%, rgba(75, 85, 99, 0.5) 50%, transparent 100%);
    }

    // 深色模式下的字体样式选项
    .font-style-option {
      border: 2px solid rgba(75, 85, 99, 0.8);
      background: rgba(75, 85, 99, 0.3);

      &:hover {
        border-color: rgba(129, 140, 248, 0.6);
        background: rgba(129, 140, 248, 0.1);
      }

      &.font-style-option-active {
        border-color: #818cf8;
        box-shadow: 0 0 0 2px rgba(129, 140, 248, 0.5);
        background: rgba(129, 140, 248, 0.2);

        .font-style-preview {
          color: #e0e7ff !important;
          font-weight: 700;
        }
      }

      .font-style-preview {
        color: #e5e7eb;
      }
    }
  }

  // 深色模式下的字体选择面板特定样式
  .font-picker-panel {
    top: 70% !important;
    transform: translateY(-50%);
  }

  // 字体控制样式
  .font-control {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;

    .font-btn {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      border: none;
      background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8);
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.9);
      }

      &:active {
        transform: translateY(-1px);
        box-shadow: 0 3px 12px rgba(0, 0, 0, 0.2);
      }

      .font-preview {
        font-size: 18px;
        font-weight: 600;
        color: #4338ca;
        transition: all 0.2s ease;
      }

      &:hover .font-preview {
        transform: scale(1.1);
      }
    }
  }

// 深色模式下的字体控制样式
.dark .font-control {
  .font-btn {
    background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1);

    &:hover {
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15);
    }

    .font-preview {
      color: #818cf8;
    }
  }

  // 深色模式下的字体预览样式
  .font-preview {
    color: #e5e7eb;
  }
}

// 字体预览样式
.font-preview {
  font-size: 16px;
  font-weight: 500;
  color: #374151;
  line-height: 1;
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
    height: 4px;
    border-radius: 2px;
  }

  :deep(.el-slider__bar) {
    background-color: #3b82f6;
    height: 4px;
    border-radius: 2px;
  }

  :deep(.el-slider__button) {
    width: 18px;
    height: 18px;
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

// 深色模式下的进度条样式
.dark .lyrics-progress-slider {
  :deep(.el-slider__runway) {
    background-color: #4b5563;
  }

  :deep(.el-slider__bar) {
    background-color: #60a5fa;
  }

  :deep(.el-slider__button) {
    border: 2px solid #60a5fa;
    background-color: #1f2937;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

    &:hover {
      box-shadow: 0 4px 8px rgba(96, 165, 250, 0.4);
    }
  }
}

// 音量滑块样式
.lyrics-volume-slider {
  :deep(.el-slider__runway) {
    background-color: #e5e7eb;
    height: 3px;
    border-radius: 1.5px;
  }

  :deep(.el-slider__bar) {
    background-color: #6b7280;
    height: 3px;
    border-radius: 1.5px;
  }

  :deep(.el-slider__button) {
    width: 14px;
    height: 14px;
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

// 深色模式下的音量滑块样式
.dark .lyrics-volume-slider {
  :deep(.el-slider__runway) {
    background-color: #4b5563;
  }

  :deep(.el-slider__bar) {
    background-color: #9ca3af;
  }

  :deep(.el-slider__button) {
    border: 2px solid #9ca3af;
    background-color: #1f2937;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);

    &:hover {
      box-shadow: 0 2px 6px rgba(156, 163, 175, 0.4);
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

/* 上浮动画 */
@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(10px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
}

/* 左侧滑入动画 */
@keyframes slideInLeft {
  0% {
    opacity: 0;
    transform: translateX(-20px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

/* 从左侧滑入动画 */
@keyframes slideInFromLeft {
  0% {
    opacity: 0;
    transform: translateY(-50%) translateX(-30px) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translateY(-50%) translateX(0) scale(1);
  }
}

/* 右侧滑入动画 */
@keyframes slideInRight {
  0% {
    opacity: 0;
    transform: translateX(20px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

/* 检查图标脉冲动画 */
@keyframes checkPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* 黑胶唱片旋转动画 */

/* 音波可视化特效系统 */

/* 背景光晕效果 */
.soundwave-glow-bg {
  background: radial-gradient(
    circle at center,
    rgba(59, 130, 246, 0.1) 0%,
    rgba(147, 51, 234, 0.08) 25%,
    rgba(6, 182, 212, 0.06) 50%,
    rgba(236, 72, 153, 0.04) 75%,
    transparent 100%
  );
  animation: glowPulse 4s ease-in-out infinite;
  filter: blur(20px);
}

.dark .soundwave-glow-bg {
  background: radial-gradient(
    circle at center,
    rgba(59, 130, 246, 0.15) 0%,
    rgba(147, 51, 234, 0.12) 25%,
    rgba(6, 182, 212, 0.1) 50%,
    rgba(236, 72, 153, 0.08) 75%,
    transparent 100%
  );
}

/* 外层：低频慢波扩散 */
.soundwave-outer-1 {
  border-color: rgba(59, 130, 246, 0.3);
  animation: soundwaveOuter 3s ease-out infinite;
  animation-delay: 0s;
  filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.5));
}

.soundwave-outer-2 {
  border-color: rgba(147, 51, 234, 0.25);
  animation: soundwaveOuter 3.2s ease-out infinite;
  animation-delay: 0.4s;
  filter: drop-shadow(0 0 8px rgba(147, 51, 234, 0.4));
}

.soundwave-outer-3 {
  border-color: rgba(6, 182, 212, 0.2);
  animation: soundwaveOuter 3.4s ease-out infinite;
  animation-delay: 0.8s;
  filter: drop-shadow(0 0 6px rgba(6, 182, 212, 0.3));
}

.soundwave-outer-4 {
  border-color: rgba(236, 72, 153, 0.15);
  animation: soundwaveOuter 3.6s ease-out infinite;
  animation-delay: 1.2s;
  filter: drop-shadow(0 0 4px rgba(236, 72, 153, 0.2));
}

/* 中层：中频波动效果 */
.soundwave-mid-1 {
  border-color: rgba(59, 130, 246, 0.4);
  animation: soundwaveMid 2.2s ease-in-out infinite;
  animation-delay: 0.1s;
  filter: drop-shadow(0 0 12px rgba(59, 130, 246, 0.6));
}

.soundwave-mid-2 {
  border-color: rgba(147, 51, 234, 0.35);
  animation: soundwaveMid 2.4s ease-in-out infinite;
  animation-delay: 0.3s;
  filter: drop-shadow(0 0 10px rgba(147, 51, 234, 0.5));
}

.soundwave-mid-3 {
  border-color: rgba(6, 182, 212, 0.3);
  animation: soundwaveMid 2.6s ease-in-out infinite;
  animation-delay: 0.5s;
  filter: drop-shadow(0 0 8px rgba(6, 182, 212, 0.4));
}

.soundwave-mid-4 {
  border-color: rgba(236, 72, 153, 0.25);
  animation: soundwaveMid 2.8s ease-in-out infinite;
  animation-delay: 0.7s;
  filter: drop-shadow(0 0 6px rgba(236, 72, 153, 0.3));
}

/* 内层：高频快速波纹 */
.soundwave-inner-1 {
  border-color: rgba(59, 130, 246, 0.6);
  animation: soundwaveInner 1.2s ease-in-out infinite;
  animation-delay: 0s;
  filter: drop-shadow(0 0 15px rgba(59, 130, 246, 0.8));
}

.soundwave-inner-2 {
  border-color: rgba(147, 51, 234, 0.55);
  animation: soundwaveInner 1.4s ease-in-out infinite;
  animation-delay: 0.2s;
  filter: drop-shadow(0 0 12px rgba(147, 51, 234, 0.7));
}

.soundwave-inner-3 {
  border-color: rgba(6, 182, 212, 0.5);
  animation: soundwaveInner 1.6s ease-in-out infinite;
  animation-delay: 0.4s;
  filter: drop-shadow(0 0 10px rgba(6, 182, 212, 0.6));
}

.soundwave-inner-4 {
  border-color: rgba(236, 72, 153, 0.45);
  animation: soundwaveInner 1.8s ease-in-out infinite;
  animation-delay: 0.6s;
  filter: drop-shadow(0 0 8px rgba(236, 72, 153, 0.5));
}

/* 频谱可视化条 */
.spectrum-visualizer {
  display: flex;
  align-items: end;
  justify-content: center;
  gap: 2px;
  height: 40px;
  opacity: 0.7;
}

.spectrum-bar {
  width: 3px;
  background: linear-gradient(
    to top,
    rgba(59, 130, 246, 0.8) 0%,
    rgba(147, 51, 234, 0.6) 50%,
    rgba(6, 182, 212, 0.4) 100%
  );
  border-radius: 2px;
  filter: drop-shadow(0 0 4px currentColor);
}

.spectrum-bar-1 { animation: spectrumBeat 0.8s ease-in-out infinite; height: 20%; }
.spectrum-bar-2 { animation: spectrumBeat 0.9s ease-in-out infinite; height: 40%; animation-delay: 0.1s; }
.spectrum-bar-3 { animation: spectrumBeat 1.1s ease-in-out infinite; height: 60%; animation-delay: 0.2s; }
.spectrum-bar-4 { animation: spectrumBeat 1.3s ease-in-out infinite; height: 80%; animation-delay: 0.3s; }
.spectrum-bar-5 { animation: spectrumBeat 1.2s ease-in-out infinite; height: 70%; animation-delay: 0.4s; }
.spectrum-bar-6 { animation: spectrumBeat 1.0s ease-in-out infinite; height: 50%; animation-delay: 0.5s; }
.spectrum-bar-7 { animation: spectrumBeat 0.85s ease-in-out infinite; height: 30%; animation-delay: 0.6s; }
.spectrum-bar-8 { animation: spectrumBeat 0.95s ease-in-out infinite; height: 25%; animation-delay: 0.7s; }

/* 脉冲节拍效果 */
.pulse-beat-1 {
  border-color: rgba(59, 130, 246, 0.8);
  animation: pulseBeat 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  animation-delay: 0s;
  filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.6));
}

.pulse-beat-2 {
  border-color: rgba(147, 51, 234, 0.6);
  animation: pulseBeat 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  animation-delay: 0.2s;
  filter: drop-shadow(0 0 15px rgba(147, 51, 234, 0.5));
}

.pulse-beat-3 {
  border-color: rgba(6, 182, 212, 0.4);
  animation: pulseBeat 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  animation-delay: 0.4s;
  filter: drop-shadow(0 0 10px rgba(6, 182, 212, 0.4));
}

/* 动态光环 */
.dynamic-ring-1 {
  background: conic-gradient(
    from 0deg,
    rgba(59, 130, 246, 0.3) 0deg,
    rgba(147, 51, 234, 0.2) 120deg,
    rgba(6, 182, 212, 0.3) 240deg,
    rgba(59, 130, 246, 0.3) 360deg
  );
  animation: dynamicRing 4s linear infinite;
  filter: blur(8px);
}

.dynamic-ring-2 {
  background: conic-gradient(
    from 120deg,
    rgba(147, 51, 234, 0.25) 0deg,
    rgba(6, 182, 212, 0.15) 120deg,
    rgba(236, 72, 153, 0.25) 240deg,
    rgba(147, 51, 234, 0.25) 360deg
  );
  animation: dynamicRing 6s linear infinite reverse;
  filter: blur(12px);
}

.dynamic-ring-3 {
  background: conic-gradient(
    from 240deg,
    rgba(6, 182, 212, 0.2) 0deg,
    rgba(236, 72, 153, 0.1) 120deg,
    rgba(59, 130, 246, 0.2) 240deg,
    rgba(6, 182, 212, 0.2) 360deg
  );
  animation: dynamicRing 8s linear infinite;
  filter: blur(16px);
}

/* 音波动画关键帧 */

/* 背景光晕脉冲 */
@keyframes glowPulse {
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

/* 外层音波扩散 */
@keyframes soundwaveOuter {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}

/* 中层音波波动 */
@keyframes soundwaveMid {
  0% {
    transform: scale(0.9);
    opacity: 0;
  }
  25% {
    opacity: 1;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

/* 内层高频波纹 */
@keyframes soundwaveInner {
  0% {
    transform: scale(0.95);
    opacity: 0;
  }
  30% {
    opacity: 1;
  }
  100% {
    transform: scale(1.1);
    opacity: 0;
  }
}

/* 频谱可视化动画 */
@keyframes spectrumBeat {
  0%, 100% {
    transform: scaleY(0.3);
    opacity: 0.6;
  }
  50% {
    transform: scaleY(1);
    opacity: 1;
  }
}

/* 脉冲节拍动画 */
@keyframes pulseBeat {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 动态光环旋转 */
@keyframes dynamicRing {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 自定义宽高类 */
.w-52 {
  width: 13rem; /* 208px */
}

.h-52 {
  height: 13rem; /* 208px */
}

.w-56 {
  width: 14rem; /* 224px */
}

.h-56 {
  height: 14rem; /* 224px */
}

.w-60 {
  width: 15rem; /* 240px */
}

.h-60 {
  height: 15rem; /* 240px */
}

.w-68 {
  width: 17rem; /* 272px */
}

.h-68 {
  height: 17rem; /* 272px */
}

.w-72 {
  width: 18rem; /* 288px */
}

.h-72 {
  height: 18rem; /* 288px */
}

.w-76 {
  width: 19rem; /* 304px */
}

.h-76 {
  height: 19rem; /* 304px */
}

.w-84 {
  width: 21rem; /* 336px */
}

.h-84 {
  height: 21rem; /* 336px */
}

.w-88 {
  width: 22rem; /* 352px */
}

.h-88 {
  height: 22rem; /* 352px */
}

.w-92 {
  width: 23rem; /* 368px */
}

.h-92 {
  height: 23rem; /* 368px */
}

.w-104 {
  width: 26rem; /* 416px */
}

.h-104 {
  height: 26rem; /* 416px */
}

.w-108 {
  width: 27rem; /* 432px */
}

.h-108 {
  height: 27rem; /* 432px */
}

.w-112 {
  width: 28rem; /* 448px */
}

.h-112 {
  height: 28rem; /* 448px */
}

.w-120 {
  width: 30rem; /* 480px */
}

.h-120 {
  height: 30rem; /* 480px */
}

.w-128 {
  width: 32rem; /* 512px */
}

.h-128 {
  height: 32rem; /* 512px */
}

</style>
