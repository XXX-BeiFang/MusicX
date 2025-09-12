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
  // 只在开发环境显示详细错误信息
  if (import.meta.env.DEV) {
    console.error('错误详情:', { err, vm, info })
  }
}

// 全局未处理的Promise错误
window.addEventListener('unhandledrejection', event => {
  console.error('未处理的Promise错误:', event.reason)

  // 如果是网络错误或API错误，不显示给用户
  if (event.reason?.name === 'AxiosError' ||
      event.reason?.message?.includes('404') ||
      event.reason?.message?.includes('AbortError')) {
    // 静默处理这些常见错误
    event.preventDefault()
    return
  }

  // 阻止默认的错误处理
  event.preventDefault()
})

app.mount('#app')

// 在开发环境下，确保未启用的 PWA Service Worker 被卸载，避免控制台 404/manifest 报错
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  // 注销已注册的所有 Service Worker
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((reg) => reg.unregister().catch(() => {}))
  })
  // 清理可能的 PWA 相关缓存，防止旧缓存导致异常请求
  caches?.keys?.().then((keys) => {
    keys
      .filter((k) => /workbox|vite-pwa|pwa/i.test(k))
      .forEach((k) => caches.delete(k).catch(() => {}))
  })
}


// 应用保存的主题颜色和深色模式
const settings = settingStore();
if (settings.themeColor) {
  document.documentElement.style.setProperty('--primary', settings.themeColor);
}
// 应用保存的深色模式设置
settings.applyDarkMode();

// 检查 View Transitions API 支持状态
import { logViewTransitionSupport } from '@/utils/viewTransitionSupport'
logViewTransitionSupport();

// 在开发环境下导入登录测试工具
if (import.meta.env.DEV) {
  import('@/test/login-test').then(module => {
    console.log('登录测试工具已加载，可在控制台使用 window.loginTest')
  }).catch(err => {
    console.warn('登录测试工具加载失败:', err)
  })
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
