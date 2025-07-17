/**
 * 错误处理工具函数
 * 用于处理常见的null/undefined错误和API响应异常
 */

/**
 * 安全的字符串分割函数
 * @param str 要分割的字符串
 * @param separator 分隔符
 * @returns 分割后的数组，如果输入无效则返回空数组
 */
export function safeSplit(str: any, separator: string = '\n'): string[] {
  if (!str || typeof str !== 'string') {
    return []
  }
  return str.split(separator)
}

/**
 * 安全的对象属性访问
 * @param obj 对象
 * @param path 属性路径，如 'a.b.c'
 * @param defaultValue 默认值
 * @returns 属性值或默认值
 */
export function safeGet(obj: any, path: string, defaultValue: any = null): any {
  if (!obj || typeof obj !== 'object') {
    return defaultValue
  }
  
  const keys = path.split('.')
  let result = obj
  
  for (const key of keys) {
    if (result === null || result === undefined || !(key in result)) {
      return defaultValue
    }
    result = result[key]
  }
  
  return result
}

/**
 * 验证API响应数据格式
 * @param response API响应
 * @param requiredFields 必需字段数组
 * @returns 是否有效
 */
export function validateApiResponse(response: any, requiredFields: string[] = []): boolean {
  if (!response || typeof response !== 'object') {
    return false
  }
  
  for (const field of requiredFields) {
    if (safeGet(response, field) === null) {
      return false
    }
  }
  
  return true
}

/**
 * 安全的数组访问
 * @param arr 数组
 * @param index 索引
 * @param defaultValue 默认值
 * @returns 数组元素或默认值
 */
export function safeArrayAccess(arr: any, index: number, defaultValue: any = null): any {
  if (!Array.isArray(arr) || index < 0 || index >= arr.length) {
    return defaultValue
  }
  return arr[index]
}

/**
 * 安全的JSON解析
 * @param jsonString JSON字符串
 * @param defaultValue 默认值
 * @returns 解析后的对象或默认值
 */
export function safeJsonParse(jsonString: any, defaultValue: any = {}): any {
  if (!jsonString || typeof jsonString !== 'string') {
    return defaultValue
  }
  
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    console.warn('JSON解析失败:', error)
    return defaultValue
  }
}

/**
 * 错误日志记录
 * @param error 错误对象
 * @param context 上下文信息
 */
export function logError(error: any, context: string = ''): void {
  const timestamp = new Date().toISOString()
  const errorInfo = {
    timestamp,
    context,
    message: error?.message || '未知错误',
    stack: error?.stack,
    type: error?.constructor?.name || 'Unknown'
  }
  
  console.error(`[${timestamp}] ${context}:`, errorInfo)
}

/**
 * 创建默认的歌词数据
 * @param remark 备注信息
 * @returns 默认歌词数据对象
 */
export function createDefaultLyricsData(remark: string = '暂无歌词') {
  return {
    lines: [],
    lyricUser: '',
    transUser: '',
    remark
  }
}

/**
 * 安全的URL构建
 * @param baseUrl 基础URL
 * @param params 参数对象
 * @returns 构建后的URL
 */
export function safeBuildUrl(baseUrl: string, params: Record<string, any> = {}): string {
  if (!baseUrl || typeof baseUrl !== 'string') {
    return ''
  }
  
  try {
    const url = new URL(baseUrl)
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.set(key, String(value))
      }
    })
    return url.toString()
  } catch (error) {
    console.warn('URL构建失败:', error)
    return baseUrl
  }
}

/**
 * 防抖函数包装器
 * @param func 要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

/**
 * 重试函数
 * @param fn 要重试的异步函数
 * @param maxRetries 最大重试次数
 * @param delay 重试间隔（毫秒）
 * @returns Promise
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (i < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError
}
