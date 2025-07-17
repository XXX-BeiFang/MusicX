/**
 * 检查浏览器是否支持 View Transitions API
 */
export function isViewTransitionSupported(): boolean {
  return typeof document !== 'undefined' && 'startViewTransition' in document
}

/**
 * 在控制台输出 View Transitions API 支持状态
 */
export function logViewTransitionSupport(): void {
  if (typeof window !== 'undefined') {
    const supported = isViewTransitionSupported()
    console.log(`🎨 View Transitions API 支持状态: ${supported ? '✅ 支持' : '❌ 不支持'}`)
    
    if (!supported) {
      console.log('💡 提示: 请使用支持 View Transitions API 的浏览器（如 Chrome 111+）来体验动画效果')
    }
  }
}
