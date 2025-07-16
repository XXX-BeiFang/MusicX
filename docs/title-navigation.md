# 📍 标题导航功能

为主页的"推荐歌单"和"热门歌手"标题添加了右箭头图标和悬浮动画效果。

## ✨ 实现效果

### 1. 推荐歌单
- **标题**: "推荐歌单" + 右箭头图标
- **点击跳转**: `/playlist` 页面
- **悬浮效果**: 标题和图标变为蓝色，图标放大并右移

### 2. 热门歌手  
- **标题**: "热门歌手" + 右箭头图标
- **点击跳转**: `/artist` 页面
- **悬浮效果**: 标题和图标变为蓝色，图标放大并右移

## 🎨 动画效果

### 悬浮动画
```css
/* 标题颜色变化 */
group-hover:text-blue-600 dark:group-hover:text-blue-400

/* 图标动画 */
group-hover:scale-110 group-hover:translate-x-1

/* 平滑过渡 */
transition-all duration-300
```

### 动画细节
1. **颜色变化**: 灰色 → 蓝色
2. **图标缩放**: 100% → 110%
3. **图标位移**: 向右移动 4px
4. **动画时长**: 300ms

## 🔧 技术实现

### HTML 结构
```vue
<div 
  class="flex items-center gap-2 cursor-pointer group transition-all duration-300"
  @click="router.push('/playlist')"
>
  <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 drop-shadow-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">推荐歌单</h2>
  <icon-tabler:chevron-right class="text-gray-600 dark:text-gray-400 text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all duration-300 group-hover:scale-110 group-hover:translate-x-1" />
</div>
```

### 关键 CSS 类
- `group`: 父容器，用于控制子元素的悬浮状态
- `cursor-pointer`: 鼠标指针样式
- `transition-all duration-300`: 平滑过渡动画
- `group-hover:*`: 悬浮时的样式变化

## 🎯 用户体验

1. **视觉提示**: 右箭头图标明确表示可点击跳转
2. **即时反馈**: 悬浮时的颜色和动画变化
3. **操作直观**: 点击标题区域即可跳转
4. **主题适配**: 支持浅色和深色主题

## 📱 响应式支持

- 在所有屏幕尺寸下都能正常显示
- 触摸设备上也能正常工作
- 保持与整体设计的一致性
