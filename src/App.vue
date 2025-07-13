<script setup lang="ts">
import * as DefaultLayout from '@/layout/index.vue'
import en from 'element-plus/es/locale/lang/en'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { useI18n } from 'vue-i18n'

const setting = settingStore()

const i18n = useI18n()
onMounted(() => {
  // 设置语言
  let language = setting.language ?? getBrowserLang()
  if (['zh-CN'].includes(language)) {
    language = 'zh'
  }
  i18n.locale.value = language
  setting.setSettingState('language', language)

  // 设置深色模式
  const savedTheme = localStorage.getItem('theme')
  if (!savedTheme) {
    // 如果没有保存的主题设置，默认使用深色模式
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  }
})

const locale = computed(() => {
  if (setting.language == 'zh') return zhCn
  if (setting.language == 'en') return en
  return getBrowserLang() == 'zh' ? zhCn : en
})
</script>

<template>
  <el-config-provider :locale="locale">
    <DefaultLayout.default />
  </el-config-provider>
</template>
