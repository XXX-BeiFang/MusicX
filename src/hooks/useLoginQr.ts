import { loginQrKey, loginQrCreate, loginQrCheck, loginStatus } from '@/api'
import { QrCallback, ResLoginStatus } from '@/hooks/interface'

export function useLoginQr(qrCallback: QrCallback) {
  const qrKey = ref<string>('')
  const qrImgUrl = ref<string>('')
  const qrStatus = ref<ResLoginStatus | null>(null)
  let intervalId: ReturnType<typeof setInterval> | null = null
  const userStore = UserStore()
  // 获取二维码 key 的方法
  const fetchQrKey = async () => {
    try {
      console.log('正在获取二维码 key...')
      const response = await loginQrKey()
      console.log('二维码 key 响应:', response)

      // 检查响应格式 - API返回格式: {"data":{"code":200,"unikey":"xxx"},"code":200}
      if (response && response.data && response.data.unikey) {
        qrKey.value = response.data.unikey
        console.log('获取到二维码 key:', response.data.unikey)
        return response.data.unikey
      } else if (response && response.unikey) {
        // 有些API可能直接返回unikey
        qrKey.value = response.unikey
        console.log('获取到二维码 key:', response.unikey)
        return response.unikey
      } else {
        console.error('响应格式不正确:', response)
        throw new Error('无效的响应格式')
      }
    } catch (error) {
      console.error('获取二维码 key 失败:', error)
      qrStatus.value = { message: '获取二维码失败，请检查网络连接' }
      throw error
    }
  }

  // 根据 key 创建二维码的方法
  const createQrCode = async () => {
    try {
      const key = await fetchQrKey()
      console.log('正在创建二维码，key:', key)

      const response = await loginQrCreate(key)
      console.log('二维码创建响应:', response)

      // 检查不同的响应格式 - API返回格式: {"code":200,"data":{"qrurl":"xxx","qrimg":"data:image/png;base64,xxx"}}
      let qrimg = null
      if (response && response.data && response.data.qrimg) {
        qrimg = response.data.qrimg
      } else if (response && response.qrimg) {
        qrimg = response.qrimg
      } else if (response && response.data && response.data.qrurl) {
        // 如果没有qrimg但有qrurl，可以使用二维码生成服务
        const qrurl = response.data.qrurl
        qrimg = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrurl)}`
      } else if (response && response.qrurl) {
        // 如果没有qrimg但有qrurl，可以使用二维码生成服务
        const qrurl = response.qrurl
        qrimg = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrurl)}`
      }

      if (qrimg) {
        qrImgUrl.value = qrimg
        qrStatus.value = { message: '请使用网易云音乐APP扫描二维码登录' }
        console.log('二维码创建成功')
      } else {
        console.error('响应中没有二维码图片:', response)
        throw new Error('无法获取二维码图片')
      }
    } catch (error) {
      console.error('创建二维码失败:', error)
      // 显示错误信息
      qrImgUrl.value = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI0MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+5LqM57u05LiN5Y+v55SoPC90ZXh0PgogIDx0ZXh0IHg9IjUwJSIgeT0iNjAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkFQSeacjeWKoeWZqOaXoOazleS9v+eUqDwvdGV4dD4KPC9zdmc+'
      qrStatus.value = { message: '二维码加载失败，请刷新重试' }
    }
  }

  // 检查二维码扫描状态的方法
  const checkQrStatus = async () => {
    try {
      const response = await loginQrCheck(qrKey.value)
      qrStatus.value = response // 更新二维码状态

      if (response.code === 800) {
        // 如果二维码过期（code 为 800），则重新获取
        clearInterval(intervalId as unknown as number) // 清除现有轮询
        await createQrCode() // 重新获取二维码
        startPolling() // 重新开始轮询
      } else if (response.code === 803) {
        // 如果二维码授权成功（code 为 803）停止检查二维码
        stopPolling()
        // 获取用户信息,并存储在本地
        loginStatus().then(({ data }) => {
          const { nickname, avatarUrl, userId } = data.profile
          const userInfo = {
            nickname,
            avatarUrl,
            userId,
          }
          userStore.setUserInfo(userInfo)
          userStore.setIsLoggedIn(true)
          //   通知已获取到数据
          qrCallback(true)
        })
      }
    } catch (error) {
      console.error('检查二维码状态失败:', error)
    }
  }

  // 开始轮询二维码的方法
  const startPolling = () => {
    intervalId = setInterval(() => {
      checkQrStatus()
    }, 3000) // 每1秒钟轮询一次状态
  }

  // 停止轮询二维码的方法
  const stopPolling = () => {
    if (intervalId !== null) {
      clearInterval(intervalId as unknown as number)
      intervalId = null
    }
  }

  // 组件被加载后立刻执行，开始二维码登录流程
  onMounted(async () => {
    await createQrCode() // 创建二维码
    startPolling() // 开始轮询状态
  })

  // 组件卸载前执行，清理轮询
  onUnmounted(() => {
    stopPolling()
  })

  // 将定义的响应式数据和方法暴露给使用该 hook 的组件
  return { qrKey, qrImgUrl, qrStatus, stopPolling }
}
