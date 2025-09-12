<script setup lang="ts">
import { usePhoneLogin } from '@/hooks/usePhoneLogin'

const dialogTableVisible = defineModel<boolean>()

// 获取完用户数据就关闭登录窗口
function closeLoginModal() {
  dialogTableVisible.value = false
}

// 界面切换：'qr' | 'phone'
const mode = ref<'qr' | 'phone'>('qr')

// 初始化二维码登录
const { qrImgUrl, qrStatus } = useLoginQr(closeLoginModal)

// 手机登录 hook
const { form, state, sendCaptcha, login } = usePhoneLogin(closeLoginModal)

// 监听弹窗显示状态
watch(dialogTableVisible, (newVal) => {
  if (newVal) {
    mode.value = 'qr'
  }
})
</script>
<template>
  <el-dialog v-model="dialogTableVisible" width="500">
    <div class="rounded-lg w-80 mx-auto">
      <div class="flex flex-col space-y-1.5 p-6">
        <h3
          class="text-2xl font-semibold leading-none tracking-tight text-center"
        >
          {{ mode === 'qr' ? '二维码登录' : '手机号登录' }}
        </h3>
      </div>

      <!-- 二维码登录 -->
      <div v-if="mode === 'qr'" class="p-6 pt-0 flex flex-col items-center space-y-4">
        <div class="relative">
          <div v-if="qrImgUrl" class="qr-container">
            <img :src="qrImgUrl" alt="二维码" class="h-52 w-52 border border-gray-200 rounded-lg" />
          </div>
          <div v-else class="h-52 w-52 border border-gray-200 rounded-lg flex items-center justify-center bg-gray-50">
            <div class="text-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p class="text-sm text-gray-500">加载中...</p>
            </div>
          </div>
          <div
            v-if="qrStatus?.avatarUrl"
            class="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center rounded-lg"
          >
            <span class="relative flex shrink-0 overflow-hidden rounded-full h-20 w-20">
              <img
                v-if="qrStatus?.avatarUrl"
                class="aspect-square h-full w-full"
                :alt="qrStatus?.nickname"
                :src="qrStatus?.avatarUrl"
              />
            </span>
          </div>
        </div>
        <p class="text-sm text-center text-gray-500 max-w-xs">
          {{ qrStatus?.message || '正在加载二维码...' }}
        </p>
        <div class="text-center" v-if="qrStatus?.nickname">
          <p class="font-semibold">{{ qrStatus?.nickname }}</p>
        </div>
        <el-button type="primary" link @click="mode = 'phone'">手机号登录</el-button>
      </div>

      <!-- 手机号登录 -->
      <div v-else class="p-6 pt-0 flex flex-col space-y-4">
        <div class="flex justify-between items-center">
          <el-button type="primary" link @click="mode = 'qr'">返回二维码登录</el-button>
          <el-radio-group v-model="form.mode" size="small">
            <el-radio-button label="password">密码登录</el-radio-button>
            <el-radio-button label="captcha">验证码登录</el-radio-button>
          </el-radio-group>
        </div>

        <el-form label-position="top" :model="form">
          <el-form-item label="手机号">
            <div class="flex gap-2 w-full">
              <el-select v-model="form.countrycode" style="width: 110px">
                <el-option label="+86" value="86" />
                <el-option label="+1" value="1" />
                <el-option label="+81" value="81" />
                <el-option label="+82" value="82" />
                <el-option label="+852" value="852" />
                <el-option label="+886" value="886" />
              </el-select>
              <el-input v-model.trim="form.phone" placeholder="请输入手机号" clearable />
            </div>
          </el-form-item>

          <template v-if="form.mode === 'password'">
            <el-form-item label="密码">
              <el-input v-model="form.password" type="password" show-password placeholder="请输入密码" />
            </el-form-item>
          </template>

          <template v-else>
            <el-form-item label="验证码">
              <div class="flex gap-2 w-full">
                <el-input v-model.trim="form.captcha" maxlength="6" placeholder="请输入短信验证码" />
                <el-button :loading="state.sendingCaptcha" :disabled="state.captchaCountdown>0" @click="sendCaptcha">
                  {{ state.captchaCountdown>0 ? `${state.captchaCountdown}s` : '获取验证码' }}
                </el-button>
              </div>
            </el-form-item>
          </template>

          <div v-if="state.error" class="text-red-500 text-sm">{{ state.error }}</div>

          <el-button type="primary" class="w-full" :loading="state.loading" @click="login">登录</el-button>
        </el-form>
      </div>
    </div>
  </el-dialog>
</template>
