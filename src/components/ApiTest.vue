<script setup lang="ts">
import { ref } from 'vue'
import { banner, personalized } from '@/api'

const testResults = ref<string[]>([])
const isLoading = ref(false)

const testBanner = async () => {
  isLoading.value = true
  try {
    const result = await banner()
    testResults.value.unshift(`✅ Banner API 测试成功: 获取到 ${result.banners?.length || 0} 个轮播图`)
  } catch (error: any) {
    testResults.value.unshift(`❌ Banner API 测试失败: ${error.message}`)
  } finally {
    isLoading.value = false
  }
}

const testPersonalized = async () => {
  isLoading.value = true
  try {
    const result = await personalized({ limit: 5 })
    testResults.value.unshift(`✅ 个性化推荐 API 测试成功: 获取到 ${result.result?.length || 0} 个推荐`)
  } catch (error: any) {
    testResults.value.unshift(`❌ 个性化推荐 API 测试失败: ${error.message}`)
  } finally {
    isLoading.value = false
  }
}

const clearResults = () => {
  testResults.value = []
}
</script>

<template>
  <div class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
    <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">API 连接测试</h2>
    
    <div class="flex gap-4 mb-6">
      <button 
        @click="testBanner"
        :disabled="isLoading"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ isLoading ? '测试中...' : '测试轮播图 API' }}
      </button>
      
      <button 
        @click="testPersonalized"
        :disabled="isLoading"
        class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ isLoading ? '测试中...' : '测试推荐 API' }}
      </button>
      
      <button 
        @click="clearResults"
        class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
      >
        清空结果
      </button>
    </div>
    
    <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto">
      <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">测试结果:</h3>
      <div v-if="testResults.length === 0" class="text-gray-500 dark:text-gray-400">
        暂无测试结果，点击上方按钮开始测试
      </div>
      <div v-else class="space-y-2">
        <div 
          v-for="(result, index) in testResults" 
          :key="index"
          class="p-2 bg-white dark:bg-gray-600 rounded text-sm font-mono"
          :class="{
            'text-green-700 dark:text-green-300': result.includes('✅'),
            'text-red-700 dark:text-red-300': result.includes('❌')
          }"
        >
          {{ result }}
        </div>
      </div>
    </div>
  </div>
</template>
