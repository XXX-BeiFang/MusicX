# 🌙 主题切换动画实现

本项目使用 VueUse 和 View Transitions API 实现了流畅的暗黑模式主题切换动画效果。

## ✨ 特性

- 🎨 使用 VueUse 的 `useDark` 管理暗黑模式状态
- 🌊 集成 View Transitions API 实现流畅的主题切换动画
- 🎯 圆形扩散动画效果，从点击位置开始扩散
- 🔄 自动回退到普通切换（在不支持的浏览器中）
- 💾 自动保存用户的主题偏好到 localStorage

## 🛠️ 技术实现

### 依赖安装

```bash
pnpm install @vueuse/core
```

### 核心文件

1. **`src/composables/useTheme.ts`** - 主题切换逻辑
2. **`src/types/view-transitions.d.ts`** - TypeScript 类型声明
3. **`src/style/base.scss`** - CSS 动画样式

### 使用方法

```vue
<template>
  <button @click="(event) => toggleTheme(event)">
    <Icon :icon="isDarkMode ? 'mdi:weather-sunny' : 'mdi:weather-night'" />
  </button>
</template>

<script setup lang="ts">
import { isDarkMode, toggleTheme } from '@/composables/useTheme'
</script>
```

## 🎯 动画效果

### CSS 样式配置

```scss
/* View Transitions API 暗黑模式切换动画 */
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

::view-transition-old(root) {
  z-index: 1;
}

::view-transition-new(root) {
  z-index: 2147483646;
}

.dark::view-transition-old(root) {
  z-index: 2147483646;
}

.dark::view-transition-new(root) {
  z-index: 1;
}
```

### JavaScript 动画逻辑

```typescript
const toggleTheme = (event?: Event) => {
  if (!event) {
    toggleDark()
    return
  }

  const mouseEvent = event as MouseEvent
  const x = mouseEvent.clientX
  const y = mouseEvent.clientY
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  )

  if (!document.startViewTransition) {
    toggleDark()
    return
  }

  const transition = document.startViewTransition(async () => {
    toggleDark()
  })

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
```

## 🌐 浏览器兼容性

- ✅ **Chrome 111+** - 完整支持 View Transitions API
- ✅ **Edge 111+** - 完整支持 View Transitions API
- ⚠️ **Firefox** - 暂不支持，自动回退到普通切换
- ⚠️ **Safari** - 暂不支持，自动回退到普通切换

## 🎮 演示页面

访问 `/theme-demo` 路径可以体验主题切换动画效果。

## 📝 注意事项

1. View Transitions API 是一个相对较新的 Web API，目前主要在基于 Chromium 的浏览器中支持
2. 在不支持的浏览器中，会自动回退到普通的主题切换，不会影响功能
3. 动画效果基于点击位置计算，确保传递正确的 MouseEvent 对象
4. 主题状态会自动保存到 localStorage，页面刷新后会保持用户的选择
