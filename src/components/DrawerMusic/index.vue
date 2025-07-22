<script setup lang="ts">
import Left from './left.vue'
import Right from './right.vue'
import SettingsDialog from './SettingsDialog.vue'
import { useDateFormat, useNow } from '@vueuse/core'

const formatted = useDateFormat(useNow(), 'HH:mm:ss')
const setting = settingStore()
const showDrawer = defineModel<boolean>()
const user = UserStore()
const showLogin = ref(false)
const showSettingsDialog = ref(false)

const { currentTrack } = useAudioPlayer()
</script>
<template>
  <el-drawer
    :style="{
      '--track-cover-url': `url(${currentTrack.cover})`,
    }"
    v-model="showDrawer"
    direction="btt"
    size="100%"
    :modal="false"
    :showClose="false"
    class="drawer-bg backdrop-filter backdrop-blur-md"
  >
    <!-- drawer加上backdrop-filter backdrop-blur-md 会有闪烁效果，暂时不知道怎么解决 -->
    <template #header>
      <div class="flex items-center justify-between">
        <div
          class="flex items-center justify-center gap-2 text-primary-foreground"
        >
          <el-button text circle @click="showDrawer = false">
            <icon-material-symbols:arrow-back-ios class="-rotate-90" />
          </el-button>
          <div class="flex items-center gap-1">
            <icon-material-symbols:nest-clock-farsight-analog-outline />
            <span class="text-sm"> {{ formatted }} </span>
          </div>
          <div class="flex items-center gap-1">
            <icon-fluent:weather-hail-day-20-regular />
            27°
          </div>
        </div>

        <div class="flex items-center gap-2 text-primary-foreground">
          <div class="flex items-center gap-2">
            <icon-material-symbols:bluetooth />
            <icon-material-symbols:wifi />
            <icon-ic:baseline-battery-charging-80 />
          </div>

          <!-- 设置按钮 -->
          <el-button
            text
            circle
            @click="showSettingsDialog = true"
            class="hover:bg-white/10 transition-colors"
            title="设置"
          >
            <icon-material-symbols:settings class="text-lg" />
          </el-button>

          <el-avatar
            v-if="user.userInfo && user.userInfo.userId"
            :src="user.userInfo.avatarUrl"
            class="mr-2"
            shape="circle"
            :size="32"
          />
          <el-button
            v-else
            class="mr-3"
            type="primary"
            @click="showLogin = true"
          >
            <div class="flex items-center gap-1">
              <icon-ic:baseline-person-pin />
              登录
            </div>
          </el-button>
        </div>
      </div>
    </template>
    <main class="flex h-full">
      <div class="flex w-full flex-1">
        <div class="w-1/2">
          <Left />
        </div>
        <div class="w-1/2 relative">
          <Right />
        </div>
      </div>
    </main>
    <LoginPopup v-if="showLogin" v-model="showLogin" />
    <SettingsDialog v-model="showSettingsDialog" />
    <template #footer>
      <div class="flex justify-end gap-2">
        <el-switch
          v-model="setting.isTranslatedParsed"
          @change="
            (val: boolean) => setting.setSettingState('isTranslatedParsed', val)
          "
          active-text="翻译"
        />
        <el-switch
          v-model="setting.isRomaParsed"
          @change="
            (val: boolean) => setting.setSettingState('isRomaParsed', val)
          "
          active-text="罗马音"
        />
      </div>
    </template>
  </el-drawer>
</template>
