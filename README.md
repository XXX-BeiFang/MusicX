# 🎵 MusicX - 现代化音乐播放器

一个基于 Vue 3 + TypeScript 的现代化音乐播放器应用，集成网易云音乐 API，提供完整的音乐播放、搜索、歌单管理等功能。

## ✨ 项目特色

- 🎵 完整的音乐播放功能（播放、暂停、上一首、下一首）
- 🔍 强大的搜索功能（歌曲、歌手、专辑、歌单、MV）
- 📋 歌单管理与播放
- 🎬 MV 播放与评论
- 📝 实时歌词显示与同步
- 👤 用户登录与个人信息管理
- 🌙 深色/浅色主题切换
- 📱 响应式设计，支持多端适配
- 🤖 集成 ChatGPT 聊天功能

## 🛠️ 技术栈

### 前端框架
- **Vue 3.5.13** - 渐进式 JavaScript 框架
- **TypeScript 5.6.2** - JavaScript 的超集，提供静态类型检查
- **Vite 6.0.5** - 下一代前端构建工具

### 状态管理
- **Pinia 2.3.1** - Vue 的状态管理库
- **pinia-plugin-persistedstate** - Pinia 持久化插件

### 路由管理
- **Vue Router 4** - Vue.js 官方路由管理器

### UI 组件库
- **Element Plus 2.9.3** - 基于 Vue 3 的组件库
- **TailwindCSS 3.4.17** - 实用优先的 CSS 框架
- **tailwindcss-animate** - TailwindCSS 动画扩展

### 工具库
- **@vueuse/core 12.5.0** - Vue 组合式 API 工具集
- **axios 1.7.9** - HTTP 客户端
- **artplayer 5.2.2** - 现代化 HTML5 视频播放器

### 开发工具
- **ESLint + Prettier** - 代码规范与格式化
- **unplugin-auto-import** - 自动导入 API
- **unplugin-vue-components** - 自动导入组件
- **unplugin-icons** - 图标自动导入
- **vue-i18n 11.0.1** - 国际化解决方案

## 🏗️ 项目架构

```
MusicX/
├── src/                          # 源代码目录
│   ├── api/                      # API 接口层
│   │   ├── index.ts             # API 接口定义
│   │   └── interface.ts         # API 类型定义
│   ├── assets/                   # 静态资源
│   │   ├── avatar/              # 头像图片
│   │   ├── banner/              # 轮播图
│   │   └── *.png               # 其他图片资源
│   ├── components/               # 公共组件
│   │   ├── Artplayer.vue       # 视频播放器组件
│   │   ├── DrawerMusic/         # 音乐抽屉组件
│   │   ├── LoginPopup.vue       # 登录弹窗
│   │   └── Table.vue           # 表格组件
│   ├── config/                   # 配置文件
│   │   └── nprogress.ts        # 进度条配置
│   ├── hooks/                    # 组合式函数
│   │   ├── useAudioPlayer.ts   # 音频播放器 Hook
│   │   ├── useLoginQr.ts       # 二维码登录 Hook
│   │   └── interface.ts        # Hook 类型定义
│   ├── i18n/                     # 国际化
│   │   ├── i18n.ts             # 国际化配置
│   │   └── modules/            # 语言包
│   ├── layout/                   # 布局组件
│   │   ├── components/         # 布局子组件
│   │   │   ├── header/         # 头部组件
│   │   │   ├── aside/          # 侧边栏组件
│   │   │   ├── main/           # 主内容区
│   │   │   ├── footer/         # 底部播放器
│   │   │   └── bg/             # 背景组件
│   │   └── index.vue           # 主布局
│   ├── pages/                    # 页面组件
│   │   ├── index.vue           # 首页
│   │   ├── search/             # 搜索页面
│   │   ├── playlist/           # 歌单页面
│   │   ├── artist/             # 歌手页面
│   │   ├── mv/                 # MV 页面
│   │   ├── setting/            # 设置页面
│   │   ├── chatGPT/            # ChatGPT 页面
│   │   └── utils/              # 工具页面
│   ├── routers/                  # 路由配置
│   │   └── index.ts            # 路由定义
│   ├── stores/                   # 状态管理
│   │   ├── modules/            # Store 模块
│   │   │   ├── audio.ts        # 音频状态
│   │   │   ├── user.ts         # 用户状态
│   │   │   ├── setting.ts      # 设置状态
│   │   │   ├── menu.ts         # 菜单状态
│   │   │   └── chatGPT.ts      # ChatGPT 状态
│   │   ├── interface/          # Store 类型定义
│   │   ├── helper/             # Store 辅助函数
│   │   └── index.ts            # Store 入口
│   ├── style/                    # 样式文件
│   │   ├── index.scss          # 主样式文件
│   │   ├── base.scss           # 基础样式
│   │   ├── tailwind.css        # TailwindCSS
│   │   └── element-plus.css    # Element Plus 样式
│   ├── typings/                  # 类型定义
│   │   ├── global.d.ts         # 全局类型
│   │   └── utils.d.ts          # 工具类型
│   ├── utils/                    # 工具函数
│   │   ├── http.ts             # HTTP 请求封装
│   │   ├── dateUtils.ts        # 日期工具
│   │   ├── parsedLyrics.ts     # 歌词解析
│   │   ├── markdown.ts         # Markdown 解析
│   │   ├── enum.ts             # 枚举定义
│   │   └── index.ts            # 工具函数入口
│   ├── mock/                     # 模拟数据
│   │   └── index.ts            # Mock 数据
│   ├── App.vue                   # 根组件
│   ├── main.ts                   # 应用入口
│   └── vite-env.d.ts            # Vite 环境类型
├── build/                        # 构建配置
│   ├── plugins.ts              # Vite 插件配置
│   ├── proxy.ts                # 代理配置
│   └── getEnv.ts               # 环境变量处理
├── netease-cloud-music-api-master/  # 网易云音乐 API 服务
├── public/                       # 公共静态资源
├── package.json                  # 项目依赖配置
├── vite.config.ts               # Vite 配置
├── tsconfig.json                # TypeScript 配置
├── tailwind.config.js           # TailwindCSS 配置
├── postcss.config.js            # PostCSS 配置
├── eslint.config.js             # ESLint 配置
└── README.md                    # 项目说明文档
```

## 📱 页面功能

### 🏠 首页 (`/`)
- 推荐歌单展示
- 音乐排行榜（热歌榜、新歌榜、飙升榜）
- 热门歌手推荐
- 精美的 Banner 展示

### 🔍 搜索页 (`/search`)
- 综合搜索功能
- 支持搜索歌曲、歌手、专辑、歌单、MV
- 搜索历史记录
- 热门搜索推荐

### 📋 歌单页 (`/playlist` & `/playlist/:id`)
- 歌单列表浏览
- 歌单详情展示
- 歌单内歌曲播放
- 歌单评论功能
- 歌单收藏与分享

### 👤 歌手页 (`/artist` & `/artist/:id`)
- 歌手列表浏览
- 歌手详情信息
- 歌手热门歌曲
- 歌手专辑列表
- 歌手 MV 作品

### 🎬 MV页 (`/mv` & `/mv/:id`)
- MV 列表浏览
- MV 视频播放
- MV 评论互动
- 相关 MV 推荐

### ⚙️ 设置页 (`/setting`)
- 主题切换（深色/浅色）
- 语言切换（中文/英文）
- 音质设置
- 播放模式设置
- 用户偏好配置

### 🤖 ChatGPT页 (`/chatGPT`)
- AI 智能对话
- 音乐相关问答
- 聊天记录保存

## 🚀 快速开始

### 环境要求
- Node.js >= 18.12.0
- pnpm >= 7

### 安装依赖

```bash

# 进入项目目录
cd MusicX

# 安装依赖
pnpm install
```

### 启动开发服务器

```bash
# 启动前端开发服务器
pnpm dev

# 启动网易云音乐 API 服务（另开终端）
cd netease-cloud-music-api-master
npm install
npm start
```

### 构建生产版本

```bash
# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```


## 📚 相关文档

- [网易云音乐 API 文档](https://musicapi-three-sand.vercel.app/)
- [Vue 3 官方文档](https://vuejs.org/)
- [Element Plus 组件库](https://element-plus.org/)
- [TailwindCSS 文档](https://tailwindcss.com/)
- [Pinia 状态管理](https://pinia.vuejs.org/)


