<script setup lang="ts">
import * as Recently from './recently.vue'
const { volume, setVolume, setPlayMode } = useAudioPlayer()

const isMuted = computed(() => volume.value === 0)

const toggleVolume = () => {
  setVolume(isMuted.value ? 50 : 0)
}
</script>
<template>
  <div class="flex items-center pr-4">
    <div class="flex items-center ml-2">
      <button
        class="w-10 h-10 rounded-full hover:bg-hoverMenuBg transition flex items-center justify-center"
        @click="setPlayMode('order')"
      >
        <Icon name="Menu" :size="18" class="text-primary" />
      </button>
      <button
        class="w-10 h-10 rounded-full hover:bg-hoverMenuBg transition flex items-center justify-center"
        @click="setPlayMode('shuffle')"
      >
        <Icon name="Sort" :size="18" class="text-primary" />
      </button>
      <button
        class="w-10 h-10 rounded-full hover:bg-hoverMenuBg transition flex items-center justify-center"
        @click="setPlayMode('loop')"
      >
        <Icon name="RefreshRight" :size="18" class="text-primary" />
      </button>
      <button
        class="w-10 h-10 rounded-full hover:bg-hoverMenuBg transition flex items-center justify-center"
        @click="setPlayMode('single')"
      >
        <Icon name="Refresh" :size="18" class="text-primary" />
      </button>
    </div>
    <button
      @click="toggleVolume"
      class="w-10 h-10 rounded-full hover:bg-hoverMenuBg transition flex items-center justify-center"
    >
      <Icon
        :name="isMuted ? 'Mute' : 'Microphone'"
        :size="18"
        class="text-primary"
      />
    </button>
    <el-slider
      v-model="volume"
      :show-tooltip="false"
      @change="setVolume"
      class="!w-24"
      size="small"
      :max="100"
    />
    <Recently.default />
  </div>
</template>
<style lang="scss">
.el-slider__button-wrapper {
  display: none !important;
}
</style>
