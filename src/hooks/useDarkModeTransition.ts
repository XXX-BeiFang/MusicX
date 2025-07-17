import { useDark, useToggle } from '@vueuse/core'
import { settingStore } from '@/stores/modules/setting'

/**
 * 深色模式切换 Hook，支持 View Transitions API 动画
 */
export function useDarkModeTransition() {
  const setting = settingStore()

  // 使用 VueUse 的 useDark，配置为使用 data-bs-theme 属性
  const isDark = useDark({
    selector: 'html',
    attribute: 'data-bs-theme',
    valueDark: 'dark',
    valueLight: 'light',
    // 同步到 setting store
    onChanged: (dark: boolean) => {
      setting.setDarkMode(dark)
    }
  })

  const toggleDark = useToggle(isDark)

  /**
   * 带动画的主题切换函数
   * @param event - 点击事件，用于获取动画起始位置
   */
  const toggleTheme = (event?: MouseEvent) => {
    // 如果没有事件对象，使用屏幕中心作为起始点
    const x = event?.clientX ?? window.innerWidth / 2
    const y = event?.clientY ?? window.innerHeight / 2
    
    // 计算从点击位置到屏幕边缘的最大距离
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    // 兼容性处理：如果浏览器不支持 View Transitions API，直接切换
    if (!document.startViewTransition) {
      toggleDark()
      return
    }

    // 使用 View Transitions API 创建平滑的切换动画
    const transition = document.startViewTransition(async () => {
      toggleDark()
    })

    // 当过渡准备就绪时，应用圆形扩散动画
    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ]
      
      // 根据当前主题决定动画方向
      document.documentElement.animate(
        {
          clipPath: isDark.value ? [...clipPath].reverse() : clipPath,
        },
        {
          duration: 400,
          easing: "ease-in",
          pseudoElement: isDark.value
            ? "::view-transition-old(root)"
            : "::view-transition-new(root)",
        }
      )
    })
  }

  // 初始化时同步状态
  if (setting.isDarkMode !== isDark.value) {
    isDark.value = setting.isDarkMode
  }

  return {
    isDark,
    toggleDark,
    toggleTheme
  }
}
