import { createApp } from 'vue'
import App from './App.vue'
import router from './routers/index'
import Store from "@/stores";
import { settingStore } from '@/stores/modules/setting';
import i18n from "@/i18n/i18n";
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './style/index.scss'

// PWA注册 - 暂时禁用以避免workbox-window问题
// import { registerSW } from 'virtual:pwa-register'

// 导入图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import IconComponent from '@/components/IconComponent.vue'

const app = createApp(App)

// 注册所有Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 全局注册自定义图标组件
app.component('Icon', IconComponent)

// 路由
app.use(router)
// 状态管理
app.use(Store)
// 国际化
app.use(i18n)
// ElementPlus
app.use(ElementPlus)
// 全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue全局错误:', err, info)
}

// 全局未处理的Promise错误
window.addEventListener('unhandledrejection', event => {
  console.error('未处理的Promise错误:', event.reason)
  // 阻止默认的错误处理
  event.preventDefault()
})

app.mount('#app')

// 应用保存的主题颜色
const settings = settingStore();
if (settings.themeColor) {
  document.documentElement.style.setProperty('--primary', settings.themeColor);
}

// 注册PWA Service Worker - 暂时禁用
/*
const updateSW = registerSW({
  onNeedRefresh() {
    // 当有新版本可用时的处理
    console.log('新版本可用，请刷新页面')
  },
  onOfflineReady() {
    // 当应用准备好离线工作时的处理
    console.log('应用已准备好离线工作')
  },
  onRegistered(r) {
    // Service Worker注册成功
    console.log('Service Worker注册成功:', r)
  },
  onRegisterError(error) {
    // Service Worker注册失败
    console.error('Service Worker注册失败:', error)
  }
})
*/
