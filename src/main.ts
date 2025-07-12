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
app.mount('#app')

// 应用保存的主题颜色
const settings = settingStore();
if (settings.themeColor) {
  document.documentElement.style.setProperty('--primary', settings.themeColor);
}
