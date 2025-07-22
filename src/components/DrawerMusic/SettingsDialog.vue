<script setup lang="ts">
import { ref, computed } from 'vue'
import { settingStore } from '@/stores/modules/setting'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import { ElNotification } from 'element-plus'

const visible = defineModel<boolean>()
const setting = settingStore()
const { volume, setVolume } = useAudioPlayer()

// 音质选项
const qualityOptions = [
  { label: '标准音质', value: 'standard', description: '128kbps，节省流量' },
  { label: '高品质', value: 'higher', description: '192kbps，平衡音质与流量' },
  { label: '极高品质', value: 'exhigh', description: '320kbps，CD级音质' },
  { label: '无损音质', value: 'lossless', description: 'FLAC，原始音质' },
  { label: 'Hi-Res', value: 'hires', description: '24bit/96kHz，超高解析度' }
]

// 使用设置存储中的值
const selectedQuality = computed({
  get: () => setting.audioQuality,
  set: (value) => setting.setSettingState('audioQuality', value)
})

const autoPlay = computed({
  get: () => setting.autoPlay,
  set: (value) => setting.setSettingState('autoPlay', value)
})

const crossfade = computed({
  get: () => setting.crossfade,
  set: (value) => setting.setSettingState('crossfade', value)
})

const gaplessPlayback = computed({
  get: () => setting.gaplessPlayback,
  set: (value) => setting.setSettingState('gaplessPlayback', value)
})

const showDesktopLyrics = computed({
  get: () => setting.showDesktopLyrics,
  set: (value) => setting.setSettingState('showDesktopLyrics', value)
})

const enableNotifications = computed({
  get: () => setting.enableNotifications,
  set: (value) => setting.setSettingState('enableNotifications', value)
})

const bassBoost = computed({
  get: () => setting.bassBoost,
  set: (value) => setting.setSettingState('bassBoost', value)
})

const trebleBoost = computed({
  get: () => setting.trebleBoost,
  set: (value) => setting.setSettingState('trebleBoost', value)
})

const virtualSurround = computed({
  get: () => setting.virtualSurround,
  set: (value) => setting.setSettingState('virtualSurround', value)
})

// 保存设置
const saveSettings = () => {
  // 设置已经通过computed自动同步到store，这里只需要关闭弹窗
  ElNotification({
    title: '设置已保存',
    message: '你的播放设置已成功保存',
    type: 'success',
    duration: 2000
  })
  visible.value = false
}

// 重置设置
const resetSettings = () => {
  selectedQuality.value = 'higher'
  autoPlay.value = true
  crossfade.value = false
  gaplessPlayback.value = true
  showDesktopLyrics.value = false
  enableNotifications.value = true
  bassBoost.value = 0
  trebleBoost.value = 0
  virtualSurround.value = false

  ElNotification({
    title: '设置已重置',
    message: '所有设置已恢复为默认值',
    type: 'info',
    duration: 2000
  })
}
</script>

<template>
  <el-dialog
    v-model="visible"
    title=""
    width="600px"
    :show-close="false"
    class="settings-dialog"
    align-center
  >
    <!-- 自定义头部 -->
    <template #header>
      <div class="flex items-center justify-between p-6 pb-0">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
            <icon-material-symbols:settings class="text-white text-xl" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">播放设置</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">个性化你的音乐体验</p>
          </div>
        </div>
        <el-button
          text
          circle
          @click="visible = false"
          class="hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <icon-material-symbols:close class="text-xl" />
        </el-button>
      </div>
    </template>

    <div class="px-6 pb-6 space-y-6 max-h-[70vh] overflow-y-auto">
      <!-- 音质设置 -->
      <div class="setting-section">
        <div class="section-header">
          <icon-material-symbols:high-quality class="text-blue-500 text-xl" />
          <h3 class="section-title">音质选择</h3>
        </div>
        <div class="space-y-3">
          <div
            v-for="option in qualityOptions"
            :key="option.value"
            @click="selectedQuality = option.value"
            class="quality-option"
            :class="{ 'quality-option-selected': selectedQuality === option.value }"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="quality-radio">
                  <div v-if="selectedQuality === option.value" class="quality-radio-dot"></div>
                </div>
                <div>
                  <h4 class="font-medium text-gray-900 dark:text-gray-100">{{ option.label }}</h4>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ option.description }}</p>
                </div>
              </div>
              <icon-material-symbols:check v-if="selectedQuality === option.value" class="text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      <!-- 播放设置 -->
      <div class="setting-section">
        <div class="section-header">
          <icon-material-symbols:play-circle class="text-green-500 text-xl" />
          <h3 class="section-title">播放设置</h3>
        </div>
        <div class="space-y-4">
          <div class="setting-item">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="setting-item-title">自动播放</h4>
                <p class="setting-item-desc">启动时自动播放音乐</p>
              </div>
              <el-switch v-model="autoPlay" />
            </div>
          </div>

          <div class="setting-item">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="setting-item-title">淡入淡出</h4>
                <p class="setting-item-desc">歌曲切换时的平滑过渡效果</p>
              </div>
              <el-switch v-model="crossfade" />
            </div>
          </div>

          <div class="setting-item">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="setting-item-title">无缝播放</h4>
                <p class="setting-item-desc">歌曲间无停顿播放</p>
              </div>
              <el-switch v-model="gaplessPlayback" />
            </div>
          </div>
        </div>
      </div>

      <!-- 显示设置 -->
      <div class="setting-section">
        <div class="section-header">
          <icon-material-symbols:display-settings class="text-purple-500 text-xl" />
          <h3 class="section-title">显示设置</h3>
        </div>
        <div class="space-y-4">
          <div class="setting-item">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="setting-item-title">桌面歌词</h4>
                <p class="setting-item-desc">在桌面显示歌词</p>
              </div>
              <el-switch v-model="showDesktopLyrics" />
            </div>
          </div>

          <div class="setting-item">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="setting-item-title">通知提醒</h4>
                <p class="setting-item-desc">歌曲切换时显示通知</p>
              </div>
              <el-switch v-model="enableNotifications" />
            </div>
          </div>
        </div>
      </div>

      <!-- 音效设置 -->
      <div class="setting-section">
        <div class="section-header">
          <icon-material-symbols:equalizer class="text-orange-500 text-xl" />
          <h3 class="section-title">音效增强</h3>
        </div>
        <div class="space-y-4">
          <div class="setting-item">
            <div>
              <h4 class="setting-item-title">低音增强</h4>
              <p class="setting-item-desc">增强低频音效</p>
            </div>
            <div class="mt-3">
              <el-slider
                v-model="bassBoost"
                :min="-10"
                :max="10"
                :step="1"
                show-stops
                :format-tooltip="(val) => `${val > 0 ? '+' : ''}${val}dB`"
              />
            </div>
          </div>

          <div class="setting-item">
            <div>
              <h4 class="setting-item-title">高音增强</h4>
              <p class="setting-item-desc">增强高频音效</p>
            </div>
            <div class="mt-3">
              <el-slider
                v-model="trebleBoost"
                :min="-10"
                :max="10"
                :step="1"
                show-stops
                :format-tooltip="(val) => `${val > 0 ? '+' : ''}${val}dB`"
              />
            </div>
          </div>

          <div class="setting-item">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="setting-item-title">虚拟环绕声</h4>
                <p class="setting-item-desc">模拟环绕声效果</p>
              </div>
              <el-switch v-model="virtualSurround" />
            </div>
          </div>
        </div>
      </div>

      <!-- 音量控制 -->
      <div class="setting-section">
        <div class="section-header">
          <icon-material-symbols:volume-up class="text-red-500 text-xl" />
          <h3 class="section-title">音量控制</h3>
        </div>
        <div class="setting-item">
          <div class="flex items-center gap-4 w-full">
            <icon-material-symbols:volume-down class="text-gray-400" />
            <el-slider
              :model-value="volume"
              @update:model-value="setVolume"
              :max="100"
              class="flex-1"
              :format-tooltip="(val) => `${val}%`"
            />
            <icon-material-symbols:volume-up class="text-gray-400" />
            <span class="text-sm text-gray-500 w-12">{{ volume }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <el-button @click="resetSettings" class="text-gray-500">
          <icon-material-symbols:refresh class="mr-2" />
          重置设置
        </el-button>
        <div class="flex gap-3">
          <el-button @click="visible = false">取消</el-button>
          <el-button type="primary" @click="saveSettings">
            <icon-material-symbols:check class="mr-2" />
            保存设置
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.settings-dialog :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

.settings-dialog :deep(.el-dialog__header) {
  padding: 0;
  margin: 0;
}

.settings-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.settings-dialog :deep(.el-dialog__footer) {
  padding: 0;
}

.setting-section {
  background-color: rgb(249 250 251);
  border-radius: 0.75rem;
  padding: 1rem;
}

.dark .setting-section {
  background-color: rgba(31 41 55 / 0.5);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: rgb(17 24 39);
}

.dark .section-title {
  color: rgb(243 244 246);
}

.setting-item {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1rem;
}

.dark .setting-item {
  background-color: rgba(55 65 81 / 0.5);
}

.setting-item-title {
  font-weight: 500;
  color: rgb(17 24 39);
}

.dark .setting-item-title {
  color: rgb(243 244 246);
}

.setting-item-desc {
  font-size: 0.875rem;
  color: rgb(107 114 128);
  margin-top: 0.25rem;
}

.dark .setting-item-desc {
  color: rgb(156 163 175);
}

.quality-option {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.dark .quality-option {
  background-color: rgba(55 65 81 / 0.5);
}

.quality-option:hover {
  border-color: rgb(191 219 254);
}

.dark .quality-option:hover {
  border-color: rgb(29 78 216);
}

.quality-option-selected {
  border-color: rgb(59 130 246);
  background-color: rgb(239 246 255);
}

.dark .quality-option-selected {
  background-color: rgba(30 58 138 / 0.2);
}

.quality-radio {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  border: 2px solid rgb(209 213 219);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: colors 0.2s;
}

.dark .quality-radio {
  border-color: rgb(75 85 99);
}

.quality-option-selected .quality-radio {
  border-color: rgb(59 130 246);
}

.quality-radio-dot {
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 50%;
  background-color: rgb(59 130 246);
}
</style>
