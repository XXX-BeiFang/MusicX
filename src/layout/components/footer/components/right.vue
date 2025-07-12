<script setup lang="ts">
import Recently from './recently.vue'
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
        class="p-2 rounded-full hover:bg-hoverMenuBg transition w-9 h-9"
        @click="setPlayMode('order')"
      >
        <Icon name="Menu" :size="14" class="text-purple-600" />
      </button>
      <button
        class="p-2 rounded-full hover:bg-hoverMenuBg transition w-9 h-9"
        @click="setPlayMode('shuffle')"
      >
        <Icon name="Sort" :size="14" class="text-purple-600" />
      </button>
      <button
        class="p-2 rounded-full hover:bg-hoverMenuBg transition w-9 h-9"
        @click="setPlayMode('loop')"
      >
        <Icon name="RefreshRight" :size="14" class="text-purple-600" />
      </button>
      <button
        class="p-2 rounded-full hover:bg-hoverMenuBg transition w-9 h-9"
        @click="setPlayMode('single')"
      >
        <Icon name="Refresh" :size="14" class="text-purple-600" />
      </button>
    </div>
    <button
      @click="toggleVolume"
      class="p-2 rounded-full hover:bg-hoverMenuBg transition w-9 h-9"
    >
      <Icon
        :name="isMuted ? 'Mute' : 'Microphone'"
        :size="14" 
        class="text-purple-600"
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
    <Recently />
  </div>
</template>
<style lang="scss">
.el-slider__button-wrapper {
  display: none !important;
}
</style>
