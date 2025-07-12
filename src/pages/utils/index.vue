<script setup lang="ts">
import { elementIcons, musicPlayerIcons, iconConfig } from '@/utils/icons'

// 将对象转换为数组，方便在模板中遍历
const elementIconsList = ref(Object.keys(elementIcons))
const musicIconsList = ref(Object.entries(musicPlayerIcons))

// 图标大小选项
const sizeOptions = [
  { label: '小', value: iconConfig.sizeSmall },
  { label: '中', value: iconConfig.sizeMedium },
  { label: '大', value: iconConfig.sizeLarge },
]

// 当前选择的大小
const selectedSize = ref(iconConfig.sizeMedium)

// 颜色选项
const colorOptions = [
  { label: '主题色', value: iconConfig.themeColor },
  { label: '浅紫色', value: iconConfig.purpleLight },
  { label: '中紫色', value: iconConfig.purpleMedium },
  { label: '深紫色', value: iconConfig.purpleDark },
  { label: '红色', value: '#ef4444' },
  { label: '蓝色', value: '#3b82f6' },
  { label: '绿色', value: '#10b981' },
]

// 当前选择的颜色
const selectedColor = ref(iconConfig.themeColor)
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">图标库展示</h1>
    
    <!-- 控制面板 -->
    <div class="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div class="flex items-center gap-6">
        <div>
          <span class="mr-2">图标大小:</span>
          <el-radio-group v-model="selectedSize" size="small">
            <el-radio-button 
              v-for="option in sizeOptions" 
              :key="option.value" 
              :label="option.value"
            >
              {{ option.label }}
            </el-radio-button>
          </el-radio-group>
        </div>
        
        <div>
          <span class="mr-2">图标颜色:</span>
          <el-radio-group v-model="selectedColor" size="small">
            <el-radio-button 
              v-for="option in colorOptions" 
              :key="option.value" 
              :label="option.value"
            >
              {{ option.label }}
            </el-radio-button>
          </el-radio-group>
        </div>
      </div>
    </div>
    
    <!-- 音乐播放器常用图标 -->
    <div class="mb-8">
      <h2 class="text-xl font-semibold mb-4">音乐播放器常用图标</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div 
          v-for="[name, iconName] in musicIconsList" 
          :key="name"
          class="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-hoverMenuBg transition-colors"
        >
          <Icon :name="iconName" :size="selectedSize" :color="selectedColor" class="mb-2" />
          <span class="text-sm">{{ name }}</span>
          <span class="text-xs text-gray-500">{{ iconName }}</span>
        </div>
      </div>
    </div>
    
    <!-- Element Plus 图标库 -->
    <div>
      <h2 class="text-xl font-semibold mb-4">Element Plus 图标库</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        <div 
          v-for="name in elementIconsList" 
          :key="name"
          class="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-hoverMenuBg transition-colors"
        >
          <Icon :name="name" :size="selectedSize" :color="selectedColor" class="mb-2" />
          <span class="text-xs">{{ name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
