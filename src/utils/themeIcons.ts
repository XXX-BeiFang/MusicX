/**
 * 深色/浅色模式切换图标配置
 */

export interface ThemeIconSet {
  name: string
  description: string
  lightIcon: string  // 浅色模式时显示的图标（通常是月亮）
  darkIcon: string   // 深色模式时显示的图标（通常是太阳）
  size?: string      // 图标大小类名
}

// 推荐的图标集合
export const themeIconSets: ThemeIconSet[] = [
  {
    name: 'Material Symbols Rounded',
    description: '现代圆润，推荐使用',
    lightIcon: 'material-symbols:dark-mode-outline-rounded',
    darkIcon: 'material-symbols:light-mode-outline-rounded',
    size: 'text-xl'
  },
  {
    name: 'Material Symbols Sharp',
    description: '现代锐利',
    lightIcon: 'material-symbols:dark-mode-outline-sharp',
    darkIcon: 'material-symbols:light-mode-outline-sharp',
    size: 'text-xl'
  },
  {
    name: 'Tabler Icons',
    description: '简洁线性',
    lightIcon: 'tabler:moon',
    darkIcon: 'tabler:sun',
    size: 'text-xl'
  },
  {
    name: 'Lucide Icons',
    description: '精致优雅',
    lightIcon: 'lucide:moon',
    darkIcon: 'lucide:sun',
    size: 'text-xl'
  },
  {
    name: 'Heroicons Solid',
    description: 'Tailwind 官方',
    lightIcon: 'heroicons:moon-20-solid',
    darkIcon: 'heroicons:sun-20-solid',
    size: 'text-xl'
  },
  {
    name: 'Phosphor Bold',
    description: '粗体风格',
    lightIcon: 'ph:moon-bold',
    darkIcon: 'ph:sun-bold',
    size: 'text-xl'
  },
  {
    name: 'Feather Icons',
    description: '轻量简洁',
    lightIcon: 'feather:moon',
    darkIcon: 'feather:sun',
    size: 'text-xl'
  },
  {
    name: 'Carbon Icons',
    description: 'IBM 设计系统',
    lightIcon: 'carbon:moon',
    darkIcon: 'carbon:sun',
    size: 'text-xl'
  }
]

// 当前使用的图标集（推荐使用 Tabler Icons，更大更清晰）
export const currentThemeIcons: ThemeIconSet = themeIconSets[2] // Tabler Icons

/**
 * 获取当前主题图标
 * @param isDark 是否为深色模式
 * @returns 图标名称
 */
export function getCurrentThemeIcon(isDark: boolean): string {
  return isDark ? currentThemeIcons.darkIcon : currentThemeIcons.lightIcon
}

/**
 * 获取图标大小类名
 * @returns CSS 类名
 */
export function getThemeIconSize(): string {
  return currentThemeIcons.size || 'text-xl'
}
