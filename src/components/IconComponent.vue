<template>
  <component 
    :is="iconComponent" 
    :style="iconStyle"
    :class="finalClass"
    @click="handleClick"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getElementIcon, iconConfig } from '@/utils/icons'

interface IconProps {
  name: string; // 图标名称
  size?: number | string; // 图标大小
  color?: string; // 图标颜色
  customClass?: string; // 自定义类名
  onClick?: () => void; // 点击事件
}

const props = withDefaults(defineProps<IconProps>(), {
  size: undefined,
  color: '',
  customClass: '',
  onClick: () => {}
})

const emit = defineEmits(['click'])

// 处理点击事件
const handleClick = (event: MouseEvent) => {
  emit('click', event)
  props.onClick?.()
}

// 计算最终颜色
const finalColor = computed(() => {
  // 如果使用text-primary类，则不应该设置内联颜色样式
  if (props.customClass?.includes('text-primary') || (!props.customClass && iconConfig.defaultClass.includes('text-primary'))) {
    return ''
  }
  return props.color || ''
})

// 计算最终大小
const finalSize = computed(() => {
  return props.size || iconConfig.sizeMedium
})

// 计算最终类名
const finalClass = computed(() => {
  return props.customClass || iconConfig.defaultClass
})

// 计算图标组件
const iconComponent = computed(() => {
  return getElementIcon(props.name)
})

// 强制设置SVG宽高
const iconStyle = computed(() => {
  const size = typeof finalSize.value === 'number' ? `${finalSize.value}px` : finalSize.value
  return {
    width: size,
    height: size,
    color: finalColor.value || undefined,
    minWidth: size,
    minHeight: size,
    maxWidth: size,
    maxHeight: size,
    display: 'inline-block',
    verticalAlign: 'middle',
    lineHeight: size,
  }
})
</script>

<style scoped>
/* 保证svg继承外部宽高 */
:deep(svg) {
  width: 100% !important;
  height: 100% !important;
  display: block;
}

/* 确保text-primary类能够正确应用主题颜色 */
:deep(.text-primary) {
  color: var(--primary) !important;
}
</style> 