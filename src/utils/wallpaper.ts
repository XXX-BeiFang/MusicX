/**
 * 壁纸相关工具函数
 */

// 导入壁纸图片
import wallpaper1 from '@/assets/wallpapers/1.png'
import wallpaper2 from '@/assets/wallpapers/2.png'
import wallpaper3 from '@/assets/wallpapers/3.png'
import wallpaper4 from '@/assets/wallpapers/4.png'
import wallpaper5 from '@/assets/wallpapers/5.png'
import wallpaper6 from '@/assets/wallpapers/6.png'
import wallpaper7 from '@/assets/wallpapers/7.png'
import wallpaper8 from '@/assets/wallpapers/8.png'

// 预设壁纸列表
export const presetWallpapers = [
  {
    id: 'wallpaper1',
    name: '晴空旷野',
    path: wallpaper1
  },
  {
    id: 'wallpaper2',
    name: '云雾山脉',
    path: wallpaper2
  },
  {
    id: 'wallpaper3',
    name: '夏日晴空',
    path: wallpaper3
  },
  {
    id: 'wallpaper4',
    name: '碧海蓝天',
    path: wallpaper4
  },
  {
    id: 'wallpaper5',
    name: '山峰云海',
    path: wallpaper5
  },
  {
    id: 'wallpaper6',
    name: '牧羊犬',
    path: wallpaper6
  },
  {
    id: 'wallpaper7',
    name: '逐风少年',
    path: wallpaper7
  },
  {
    id: 'wallpaper8',
    name: '疯狂动物城-尼克朱迪',
    path: wallpaper8
  },
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