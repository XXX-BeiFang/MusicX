<script setup lang="ts">
import * as Header from './components/header/index.vue'
import * as Aside from './components/aside/index.vue'
import Main from './components/main/index.vue'
import * as Footer from './components/footer/index.vue'
import BG from './components/bg/index.vue'
import { AudioPlayer } from '@/hooks/useAudioPlayer'

provide('audioPlayer', AudioPlayer())
</script>
<template>
  <BG />
  <div class="absolute w-full flex flex-col h-full z-10">
    <div
      class="w-full flex flex-col h-full rounded-3xl overflow-hidden bg-white dark:bg-neutral-900 shadow-2xl border border-white/30 dark:border-white/10"
    >
      <Header.default />
      <div class="flex flex-1 overflow-hidden">
        <Aside.default />
        <Main />
      </div>
      <Footer.default />
    </div>
  </div>
</template>
