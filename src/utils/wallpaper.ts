/**
 * 壁纸相关工具函数
 */

// 预设壁纸列表
export const presetWallpapers = [
  {
    id: 'wallpaper1',
    name: '富士山',
    path: '/src/assets/wallpapers/1.png'
  },
  {
    id: 'wallpaper2',
    name: '云雾山脉',
    path: '/src/assets/wallpapers/2.png'
  },
  {
    id: 'wallpaper3',
    name: '海边小店',
    path: '/src/assets/wallpapers/3.png'
  },
  {
    id: 'wallpaper4',
    name: '小动物池塘',
    path: '/src/assets/wallpapers/4.png'
  },
  {
    id: 'wallpaper5',
    name: '音乐少女',
    path: '/src/assets/wallpapers/5.png'
  },
  {
    id: 'wallpaper6',
    name: '雪山云海',
    path: '/src/assets/wallpapers/6.png'
  },
  {
    id: 'wallpaper7',
    name: '田园风光',
    path: '/src/assets/wallpapers/7.png'
  }
]

/**
 * 将 File 对象转换为 data URL
 * @param file 文件对象
 * @returns Promise<string> data URL
 */
export const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * 验证文件是否为有效的图片
 * @param file 文件对象
 * @returns boolean 是否为有效图片
 */
export const validateImage = (file: File): boolean => {
  // 验证文件类型
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!validTypes.includes(file.type)) {
    return false
  }

  // 验证文件大小（最大 5MB）
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    return false
  }

  return true
}