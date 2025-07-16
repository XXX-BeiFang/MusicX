import { useDark, useToggle } from '@vueuse/core'

// 使用VueUse的useDark来管理暗黑模式
const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
  storageKey: 'theme',
  storage: localStorage
})

const toggleDark = useToggle(isDark)

/**
 * 带有View Transitions API动画的主题切换函数
 * @param event - 点击事件，用于获取动画起始位置
 */
export const useThemeToggle = () => {
  const toggleTheme = (event?: Event) => {
    // 如果没有传入事件，直接切换主题
    if (!event) {
      toggleDark()
      return
    }

    // 类型断言为MouseEvent
    const mouseEvent = event as MouseEvent
    const x = mouseEvent.clientX
    const y = mouseEvent.clientY
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    // 兼容性处理 - 检查浏览器是否支持View Transitions API
    if (!document.startViewTransition) {
      toggleDark()
      return
    }

    // 启动视图过渡
    const transition = document.startViewTransition(async () => {
      toggleDark()
    })

    // 当过渡准备就绪时，添加圆形扩散动画
    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ]

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

  return {
    isDark,
    toggleTheme
  }
}

// 导出单例实例
export const { isDark: isDarkMode, toggleTheme } = useThemeToggle()
