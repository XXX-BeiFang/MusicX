<script setup lang="ts">
import { qualityList, languageOptions } from '@/utils/enum'
import { presetWallpapers, fileToDataURL, validateImage } from '@/utils/wallpaper'
import { ElMessage } from 'element-plus'
import { AudioStore } from '@/stores/modules/audio'
import { nextTick, ref } from 'vue'

import { settingStore } from '@/stores/modules/setting'

// 消除 linter 未使用警告
const _unused = { qualityList, languageOptions };
void _unused;

const setting = settingStore()
const audio = AudioStore()

// 自定义壁纸上传
const handleWallpaperUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return

  const file = target.files[0]

  // 验证图片
  if (!validateImage(file)) {
    ElMessage.error('请上传有效的图片文件（JPG, PNG, GIF, WEBP），大小不超过5MB')
    return
  }

  try {
    // 转换为 data URL
    const dataURL = await fileToDataURL(file)

    // 设置壁纸
    setting.setWallpaper(dataURL, 'custom')

    ElMessage.success('壁纸设置成功')
  } catch (error) {
    console.error('壁纸上传失败:', error)
    ElMessage.error('壁纸上传失败，请重试')
  }

  // 清除 input 值，以便可以再次选择同一文件
  target.value = ''
}

// 选择预设壁纸
const selectPresetWallpaper = (wallpaper: typeof presetWallpapers[0]) => {
  // 使用 nextTick 确保在 DOM 更新后再设置壁纸
  nextTick(() => {
    setting.setWallpaper(wallpaper.path, 'preset')
    ElMessage.success(`已设置壁纸: ${wallpaper.name}`)
  })
}

// 移除壁纸
const removeWallpaper = () => {
  setting.setWallpaper(null, 'none')
  ElMessage.success('已移除壁纸')
}

// 判断当前壁纸是否选中
const isWallpaperSelected = (path: string) => {
  return setting.wallpaper === path
}

// 处理语言变更
const handleLanguageChange = (val: any) => {
  setting.setSettingState('language', val)
}

// 处理音质变更
const handleQualityChange = (val: any) => {
  audio.setAudioStore('quality', val)
}


</script>
<template>
  <div class="p-4">
    <div class="grid gap-6">
      <!-- 壁纸设置 -->
      <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div class="flex flex-col space-y-1.5 p-6">
          <h3 class="text-2xl font-semibold leading-none tracking-tight">
            壁纸设置
          </h3>
        </div>
        <div class="p-6 pt-0 grid gap-4">
          <!-- 壁纸透明度 -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <icon-material-symbols:opacity />
                <label
                  class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  for="wallpaper-opacity"
                  >壁纸透明度</label
                >
              </div>
              <span>{{ Math.round(setting.wallpaperOpacity * 100) }} %</span>
            </div>
            <el-slider
              v-model="setting.wallpaperOpacity"
              :min="0.1"
              :max="1"
              :step="0.01"
              @change="setting.setWallpaperOpacity"
            />
          </div>

          <!-- 壁纸模糊度 -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <icon-material-symbols:blur-on />
                <label
                  class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  for="wallpaper-blur"
                  >壁纸模糊度</label
                >
              </div>
              <span>{{ setting.wallpaperBlur }} px</span>
            </div>
            <el-slider
              v-model="setting.wallpaperBlur"
              :min="0"
              :max="20"
              :step="1"
              @change="setting.setWallpaperBlur"
            />
          </div>

          <!-- 推荐壁纸 -->
          <div class="space-y-2">
            <label class="text-sm font-medium leading-none">推荐壁纸</label>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
              <div
                v-for="wallpaper in presetWallpapers"
                :key="wallpaper.id"
                class="wallpaper-item cursor-pointer rounded-lg overflow-hidden border-2"
                :class="[isWallpaperSelected(wallpaper.path) ? 'border-primary' : '']"
                @click="selectPresetWallpaper(wallpaper)"
              >
                <div class="wallpaper-preview">
                  <img :src="wallpaper.path" :alt="wallpaper.name" class="w-full h-full object-cover" />
                </div>
                <div class="p-2 text-center text-sm truncate">{{ wallpaper.name }}</div>
              </div>
            </div>
          </div>

          <!-- 自定义壁纸上传 -->
          <div class="space-y-2">
            <label class="text-sm font-medium leading-none">自定义壁纸</label>
            <div class="flex items-center space-x-4 mt-2">
              <el-upload
                class="wallpaper-upload"
                action=""
                :auto-upload="false"
                :show-file-list="false"
                accept="image/jpeg,image/png,image/gif,image/webp"
              >
                <el-button type="primary">
                  <icon-material-symbols:upload class="mr-1" />
                  上传壁纸
                </el-button>
                <input type="file" class="hidden-upload" @change="handleWallpaperUpload" />
              </el-upload>
              <el-button type="danger" @click="removeWallpaper">
                <icon-material-symbols:delete class="mr-1" />
                移除壁纸
              </el-button>
            </div>
            <p class="text-xs text-gray-500 mt-1">支持 JPG, PNG, GIF, WEBP 格式，大小不超过 5MB</p>
          </div>
        </div>
      </div>

      <!-- 常规设置 -->
      <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div class="flex flex-col space-y-1.5 p-6">
          <h3 class="text-2xl font-semibold leading-none tracking-tight">
            常规设置
          </h3>
        </div>
        <div class="p-6 pt-0 grid gap-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <icon-material-symbols:language />
              <label
                class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                for="language"
                >语言</label
              >
            </div>
            <el-select
              v-model="setting.language"
              placeholder="请选择语言"
              class="w-48"
              @change="handleLanguageChange"
            >
              <el-option
                v-for="option in languageOptions"
                :key="option.id"
                :label="option.label"
                :value="option.id"
              />
            </el-select>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <icon-material-symbols:lyrics-outline />
              <label
                class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                for="show-lyrics"
                >显示歌词</label
              >
            </div>
            <el-switch disabled />
          </div>
        </div>
      </div>

      <!-- 音频设置 -->
      <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div class="flex flex-col space-y-1.5 p-6">
          <h3 class="text-2xl font-semibold leading-none tracking-tight">
            音频设置
          </h3>
        </div>
        <div class="p-6 pt-0 grid gap-4">
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <icon-ic:baseline-volume-up />
                <label
                  class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  for="volume"
                  >音量</label
                >
              </div>
              <span>{{ audio.volume }} %</span>
            </div>
            <el-slider v-model="audio.volume" :max="100" @change="audio.setVolume" />
          </div>
          <div class="flex items-center justify-between">
            <label
              class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              for="audio-quality"
              >音频质量</label
            >
            <el-select
              v-model="audio.quality"
              @change="handleQualityChange"
              placeholder="请选择音频质量"
              class="w-48"
            >
              <el-option
                v-for="option in qualityList"
                :key="option.id"
                :label="option.label"
                :value="option.id"
              />
            </el-select>
          </div>
          <div class="flex items-center justify-between">
            <label
              class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              for="auto-play"
              >自动播放</label
            >
            <el-switch disabled />
          </div>
        </div>
      </div>

      <!-- 其他设置 -->
      <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div class="flex flex-col space-y-1.5 p-6">
          <h3 class="text-2xl font-semibold leading-none tracking-tight">
            其他设置
          </h3>
        </div>
        <div class="p-6 pt-0 grid gap-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <icon-ic:outline-notifications-active />
              <label
                class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                for="notifications"
                >通知</label
              >
            </div>
            <el-switch disabled />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>


.wallpaper-item {
  position: relative;
}

.wallpaper-preview {
  height: 100px;
  overflow: hidden;
  border-radius: 0.375rem;
}

.wallpaper-item {
  transition: all 0.3s ease;
}

.wallpaper-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.hidden-upload {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.wallpaper-upload {
  position: relative;
  display: inline-block;
}
</style>
