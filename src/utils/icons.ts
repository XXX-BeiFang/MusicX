// 图标工具类 - 统一管理Element Plus和Iconify图标
import { Component, h } from 'vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { Icon } from '@iconify/vue'

// Element Plus 图标映射
export const elementIcons: Record<string, Component> = ElementPlusIconsVue

// 音乐播放器常用图标映射
export const musicPlayerIcons = {
  // 播放控制
  play: 'Play',
  pause: 'VideoPause',
  prev: 'Back',
  next: 'Right',
  volume: 'Microphone',
  mute: 'Mute',
  playlist: 'List',
  
  // 导航栏
  home: 'HomeFilled',
  discover: 'Compass',
  search: 'Search',
  mv: 'VideoCamera',
  songList: 'Menu',
  artist: 'Avatar',
  setting: 'Setting',
  
  // 功能按钮
  add: 'Plus',
  favorite: 'Star',
  download: 'Download',
  share: 'Share',
  more: 'More',
  delete: 'Delete',
  
  // 其他
  user: 'User',
  logout: 'SwitchButton',
  theme: 'MoonNight',
  language: 'Language'
}

// 获取Element Plus图标组件
export const getElementIcon = (name: string): Component => {
  return elementIcons[name] || null
}

// 获取Iconify图标组件
export const getIconify = (name: string) => {
  return () => h(Icon, { icon: name })
}

// 主题配置
export const iconConfig = {
  // 主题色
  themeColor: '#8A2BE2',
  // 紫色系列
  purpleLight: '#9F7AEA',
  purpleMedium: '#805AD5',
  purpleDark: '#6B46C1',
  // 默认大小
  sizeSmall: 14,
  sizeMedium: 18,
  sizeLarge: 24,
  // 默认样式
  defaultClass: 'text-primary'
} 