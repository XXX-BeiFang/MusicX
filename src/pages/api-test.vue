<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">API 连接测试</h1>
    
    <div class="space-y-4">
      <!-- Banner API 测试 -->
      <div class="bg-white/10 rounded-lg p-4">
        <h2 class="text-lg font-semibold mb-2">轮播图 API 测试</h2>
        <button @click="testBanner" class="bg-blue-500 text-white px-4 py-2 rounded mr-2">
          测试 Banner API
        </button>
        <span v-if="bannerStatus" :class="bannerStatus.success ? 'text-green-500' : 'text-red-500'">
          {{ bannerStatus.message }}
        </span>
      </div>

      <!-- 个性化推荐 API 测试 -->
      <div class="bg-white/10 rounded-lg p-4">
        <h2 class="text-lg font-semibold mb-2">个性化推荐 API 测试</h2>
        <button @click="testPersonalized" class="bg-green-500 text-white px-4 py-2 rounded mr-2">
          测试推荐 API
        </button>
        <span v-if="personalizedStatus" :class="personalizedStatus.success ? 'text-green-500' : 'text-red-500'">
          {{ personalizedStatus.message }}
        </span>
      </div>

      <!-- 音乐 URL API 测试 -->
      <div class="bg-white/10 rounded-lg p-4">
        <h2 class="text-lg font-semibold mb-2">音乐 URL API 测试</h2>
        <input 
          v-model="testSongId" 
          placeholder="输入歌曲ID (例如: 108493)" 
          class="bg-white/20 text-white px-3 py-2 rounded mr-2 w-48"
        />
        <button @click="testMusicUrl" class="bg-purple-500 text-white px-4 py-2 rounded mr-2">
          测试音乐 URL
        </button>
        <span v-if="musicUrlStatus" :class="musicUrlStatus.success ? 'text-green-500' : 'text-red-500'">
          {{ musicUrlStatus.message }}
        </span>
      </div>

      <!-- 歌词 API 测试 -->
      <div class="bg-white/10 rounded-lg p-4">
        <h2 class="text-lg font-semibold mb-2">歌词 API 测试</h2>
        <button @click="testLyrics" class="bg-orange-500 text-white px-4 py-2 rounded mr-2">
          测试歌词 API
        </button>
        <span v-if="lyricsStatus" :class="lyricsStatus.success ? 'text-green-500' : 'text-red-500'">
          {{ lyricsStatus.message }}
        </span>
      </div>

      <!-- 搜索 API 测试 -->
      <div class="bg-white/10 rounded-lg p-4">
        <h2 class="text-lg font-semibold mb-2">搜索 API 测试</h2>
        <input 
          v-model="searchKeyword" 
          placeholder="输入搜索关键词" 
          class="bg-white/20 text-white px-3 py-2 rounded mr-2 w-48"
        />
        <button @click="testSearch" class="bg-pink-500 text-white px-4 py-2 rounded mr-2">
          测试搜索 API
        </button>
        <span v-if="searchStatus" :class="searchStatus.success ? 'text-green-500' : 'text-red-500'">
          {{ searchStatus.message }}
        </span>
      </div>
    </div>

    <!-- 测试结果显示 -->
    <div v-if="testResults.length > 0" class="mt-8">
      <h2 class="text-xl font-semibold mb-4">测试结果</h2>
      <div class="bg-black/20 rounded-lg p-4 max-h-96 overflow-y-auto">
        <pre class="text-sm text-gray-300">{{ testResults.join('\n\n') }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { banner, personalized, urlV1, lyricNew, cloudsearch } from '@/api'

const bannerStatus = ref<{success: boolean, message: string} | null>(null)
const personalizedStatus = ref<{success: boolean, message: string} | null>(null)
const musicUrlStatus = ref<{success: boolean, message: string} | null>(null)
const lyricsStatus = ref<{success: boolean, message: string} | null>(null)
const searchStatus = ref<{success: boolean, message: string} | null>(null)

const testSongId = ref('108493')
const searchKeyword = ref('周杰伦')
const testResults = ref<string[]>([])

const testBanner = async () => {
  try {
    bannerStatus.value = { success: false, message: '测试中...' }
    const result = await banner()
    bannerStatus.value = { success: true, message: `成功获取 ${result.banners?.length || 0} 个轮播图` }
    testResults.value.unshift(`Banner API 测试成功: ${JSON.stringify(result, null, 2)}`)
  } catch (error: any) {
    bannerStatus.value = { success: false, message: `失败: ${error.message}` }
    testResults.value.unshift(`Banner API 测试失败: ${error.message}`)
  }
}

const testPersonalized = async () => {
  try {
    personalizedStatus.value = { success: false, message: '测试中...' }
    const result = await personalized({ limit: 5 })
    personalizedStatus.value = { success: true, message: `成功获取 ${result.result?.length || 0} 个推荐` }
    testResults.value.unshift(`个性化推荐 API 测试成功: ${JSON.stringify(result, null, 2)}`)
  } catch (error: any) {
    personalizedStatus.value = { success: false, message: `失败: ${error.message}` }
    testResults.value.unshift(`个性化推荐 API 测试失败: ${error.message}`)
  }
}

const testMusicUrl = async () => {
  try {
    musicUrlStatus.value = { success: false, message: '测试中...' }
    const result = await urlV1(testSongId.value)
    const url = result.data[0]?.url
    musicUrlStatus.value = { 
      success: !!url, 
      message: url ? '成功获取音乐URL' : '未获取到音乐URL（可能因版权限制）' 
    }
    testResults.value.unshift(`音乐URL API 测试: ${JSON.stringify(result, null, 2)}`)
  } catch (error: any) {
    musicUrlStatus.value = { success: false, message: `失败: ${error.message}` }
    testResults.value.unshift(`音乐URL API 测试失败: ${error.message}`)
  }
}

const testLyrics = async () => {
  try {
    lyricsStatus.value = { success: false, message: '测试中...' }
    const result = await lyricNew(testSongId.value)
    lyricsStatus.value = { success: true, message: '成功获取歌词' }
    testResults.value.unshift(`歌词 API 测试成功: ${JSON.stringify(result, null, 2)}`)
  } catch (error: any) {
    lyricsStatus.value = { success: false, message: `失败: ${error.message}` }
    testResults.value.unshift(`歌词 API 测试失败: ${error.message}`)
  }
}

const testSearch = async () => {
  try {
    searchStatus.value = { success: false, message: '测试中...' }
    const result = await cloudsearch({ kw: searchKeyword.value, limit: 5 })
    searchStatus.value = { 
      success: true, 
      message: `成功搜索到 ${result.result?.songCount || 0} 首歌曲` 
    }
    testResults.value.unshift(`搜索 API 测试成功: ${JSON.stringify(result, null, 2)}`)
  } catch (error: any) {
    searchStatus.value = { success: false, message: `失败: ${error.message}` }
    testResults.value.unshift(`搜索 API 测试失败: ${error.message}`)
  }
}
</script>
