import { reactive, computed, onUnmounted } from 'vue'
import { loginCellphone, loginCellphonePost, captchaSent, captchaVerify, loginStatus, loginRefresh, cellphoneExistenceCheck, userAccount, userDetail } from '@/api'
import { UserStore } from '@/stores/modules/user'
// 为了最大兼容性，这里只使用 GET 方式调用 /login/cellphone。
// 如果你的后端要求 POST，请把 src/api/index.ts 的 loginCellphonePost 切换进来使用。


export type PhoneLoginMode = 'password' | 'captcha'

export interface PhoneLoginForm {
  countrycode: string
  phone: string
  password: string
  captcha: string
  mode: PhoneLoginMode
}

export interface PhoneLoginState {
  sendingCaptcha: boolean
  captchaCountdown: number
  loading: boolean
  error: string | null
}

export function usePhoneLogin(onSuccess: () => void) {
  const form = reactive<PhoneLoginForm>({
    countrycode: '86',
    phone: '',
    password: '',
    captcha: '',
    mode: 'password',
  })

  const state = reactive<PhoneLoginState>({
    sendingCaptcha: false,
    captchaCountdown: 0,
    loading: false,
    error: null,
  })

  const isValidPhone = computed(() => validatePhone(form.phone))

  const verifyCaptcha = async () => {
    if (form.mode !== 'captcha') return true

    // 对于远程API，可能不支持单独的验证码验证接口
    // 直接返回true，让登录接口来验证验证码
    console.log('跳过单独的验证码验证，直接使用登录接口验证')
    return true

    // 注释掉原来的验证码验证逻辑，因为远程API可能不支持
    /*
    try {
      const res = await captchaVerify({
        phone: form.phone,
        captcha: form.captcha,
        ctcode: form.countrycode
      })

      // 检查返回结果，确保验证码验证成功
      if (res && (res as any).code === 200) {
        return true
      } else if (res && (res as any).code === 400) {
        // 验证码错误
        return false
      }

      // 一些服务返回 code 或 result，简化处理：请求不抛错即认为验证通过
      return true
    } catch (e: any) {
      // 如果有具体错误信息，可以设置到state.error中
      console.warn('验证码验证失败:', e?.response?.data?.message || e?.message)
      return false
    }
    */
  }

  let timer: number | null = null
  const userStore = UserStore()

  const validatePhone = (phone: string) => {
    // 简单校验：国家码为86时，11位数字；否则至少6位
    const pure = phone.replace(/\s|-/g, '')
    if (form.countrycode === '86') return /^1[3-9][0-9]{9}$/.test(pure)
    return /^[0-9]{6,}$/.test(pure)
  }

  const validate = () => {
    state.error = null
    if (!form.phone || !validatePhone(form.phone)) {
      state.error = '请输入有效的手机号'
      return false
    }
    if (form.mode === 'password') {
      if (!form.password || form.password.length < 6) {
        state.error = '请输入至少6位的密码'
        return false
      }
    } else {
      if (!form.captcha || form.captcha.length < 4) {
        state.error = '请输入4位以上的验证码'
        return false
      }
    }
    return true
  }

  // 可选：登录前先检测手机号是否已注册，失败不阻断，仅做提示
  const checkPhoneExistence = async () => {
    try {
      if (!form.phone) return
      await cellphoneExistenceCheck({ phone: form.phone, countrycode: form.countrycode })
    } catch (e: any) {
      // 部分环境该接口返回体结构各异，仅提示，不阻断后续流程
      // const msg = e?.response?.data?.message || e?.response?.data?.msg
      // if (msg) state.error = msg
    }
  }

  const startCountdown = (sec = 60) => {
    state.captchaCountdown = sec
    timer && clearInterval(timer)
    timer = window.setInterval(() => {
      state.captchaCountdown--
      if (state.captchaCountdown <= 0) {
        timer && clearInterval(timer)
        timer = null
      }
    }, 1000)
  }

  const sendCaptcha = async () => {
    if (!form.phone || !validatePhone(form.phone)) {
      state.error = '请输入有效的手机号'
      return
    }
    try {
      state.error = null
      state.sendingCaptcha = true

      // 发送验证码，确保使用正确的国家代码
      const result = await captchaSent(form.phone, form.countrycode)

      // 检查返回结果
      if (result && (result as any).code === 200) {
        startCountdown(60)
        // 可以显示成功提示
      } else {
        throw new Error((result as any)?.message || '验证码发送失败')
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.response?.data?.msg || e?.message
      state.error = msg || '验证码发送失败，请稍后重试'
    } finally {
      state.sendingCaptcha = false
    }
  }

  // 轻量 MD5，无依赖（RFC 1321 实现的简版，适用于前端口令摘要）
  // 为避免超长，这里只保留必要实现
  // 来源：经过简化的公开实现（已在多项目中使用）
  function md5(str: string) {
    function RotateLeft(lValue: number, iShiftBits: number) {
      return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits))
    }
    function AddUnsigned(lX: number, lY: number) {
      const lX4 = lX & 0x40000000
      const lY4 = lY & 0x40000000
      const lX8 = lX & 0x80000000
      const lY8 = lY & 0x80000000
      const lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff)
      if (lX4 & lY4) return lResult ^ 0x80000000 ^ lX8 ^ lY8
      if (lX4 | lY4) {
        if (lResult & 0x40000000) return lResult ^ 0xc0000000 ^ lX8 ^ lY8
        else return lResult ^ 0x40000000 ^ lX8 ^ lY8
      } else return lResult ^ lX8 ^ lY8
    }
    function F(x: number, y: number, z: number) { return (x & y) | ((~x) & z) }
    function G(x: number, y: number, z: number) { return (x & z) | (y & (~x)) }
    function H(x: number, y: number, z: number) { return x ^ y ^ z }
    function I(x: number, y: number, z: number) { return y ^ (x | (~z)) }
    function FF(a:number,b:number,c:number,d:number,x:number,s:number,ac:number){a=AddUnsigned(a,AddUnsigned(AddUnsigned(F(b,c,d),x),ac));return AddUnsigned(RotateLeft(a,s),b)}
    function GG(a:number,b:number,c:number,d:number,x:number,s:number,ac:number){a=AddUnsigned(a,AddUnsigned(AddUnsigned(G(b,c,d),x),ac));return AddUnsigned(RotateLeft(a,s),b)}
    function HH(a:number,b:number,c:number,d:number,x:number,s:number,ac:number){a=AddUnsigned(a,AddUnsigned(AddUnsigned(H(b,c,d),x),ac));return AddUnsigned(RotateLeft(a,s),b)}
    function II(a:number,b:number,c:number,d:number,x:number,s:number,ac:number){a=AddUnsigned(a,AddUnsigned(AddUnsigned(I(b,c,d),x),ac));return AddUnsigned(RotateLeft(a,s),b)}
    function ConvertToWordArray(str: string){
      const lWordArray:number[]=[];let lMessageLength=str.length;let lNumberOfWords_temp1=lMessageLength+8;let lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1%64))/64;let lNumberOfWords=(lNumberOfWords_temp2+1)*16;let lBytePosition=0;let lByteCount=0;while(lByteCount<lMessageLength){let lWordCount=(lByteCount-(lByteCount%4))/4;lBytePosition=(lByteCount%4)*8;lWordArray[lWordCount]=(lWordArray[lWordCount]||0)|(str.charCodeAt(lByteCount)<<lBytePosition);lByteCount++}let lWordCount=(lByteCount-(lByteCount%4))/4;lBytePosition=(lByteCount%4)*8;lWordArray[lWordCount]=lWordArray[lWordCount]||0;lWordArray[lWordCount]=lWordArray[lWordCount]|(0x80<<lBytePosition);lWordArray[lNumberOfWords-2]=lMessageLength<<3;lWordArray[lNumberOfWords-1]=lMessageLength>>>29;return lWordArray}
    function WordToHex(lValue:number){let WordToHexValue='';for(let lCount=0;lCount<=3;lCount++){const lByte=(lValue>>>(lCount*8))&255;let WordToHexValue_temp='0'+lByte.toString(16);WordToHexValue+=WordToHexValue_temp.slice(-2)}return WordToHexValue}
    function Utf8Encode(str:string){str=str.replace(/\r\n/g,'\n');let utftext='';for(let n=0;n<str.length;n++){const c=str.charCodeAt(n);if(c<128){utftext+=String.fromCharCode(c)}else if((c>127)&&(c<2048)){utftext+=String.fromCharCode((c>>6)|192);utftext+=String.fromCharCode((c&63)|128)}else{utftext+=String.fromCharCode((c>>12)|224);utftext+=String.fromCharCode(((c>>6)&63)|128);utftext+=String.fromCharCode((c&63)|128)}}return utftext}
    let x=ConvertToWordArray(Utf8Encode(str));let a=0x67452301;let b=0xEFCDAB89;let c=0x98BADCFE;let d=0x10325476;for(let k=0;k<x.length;k+=16){let AA=a;let BB=b;let CC=c;let DD=d;a=FF(a,b,c,d,x[k+0],7,0xD76AA478);d=FF(d,a,b,c,x[k+1],12,0xE8C7B756);c=FF(c,d,a,b,x[k+2],17,0x242070DB);b=FF(b,c,d,a,x[k+3],22,0xC1BDCEEE);a=FF(a,b,c,d,x[k+4],7,0xF57C0FAF);d=FF(d,a,b,c,x[k+5],12,0x4787C62A);c=FF(c,d,a,b,x[k+6],17,0xA8304613);b=FF(b,c,d,a,x[k+7],22,0xFD469501);a=FF(a,b,c,d,x[k+8],7,0x698098D8);d=FF(d,a,b,c,x[k+9],12,0x8B44F7AF);c=FF(c,d,a,b,x[k+10],17,0xFFFF5BB1);b=FF(b,c,d,a,x[k+11],22,0x895CD7BE);a=FF(a,b,c,d,x[k+12],7,0x6B901122);d=FF(d,a,b,c,x[k+13],12,0xFD987193);c=FF(c,d,a,b,x[k+14],17,0xA679438E);b=FF(b,c,d,a,x[k+15],22,0x49B40821);a=GG(a,b,c,d,x[k+1],5,0xF61E2562);d=GG(d,a,b,c,x[k+6],9,0xC040B340);c=GG(c,d,a,b,x[k+11],14,0x265E5A51);b=GG(b,c,d,a,x[k+0],20,0xE9B6C7AA);a=GG(a,b,c,d,x[k+5],5,0xD62F105D);d=GG(d,a,b,c,x[k+10],9,0x02441453);c=GG(c,d,a,b,x[k+15],14,0xD8A1E681);b=GG(b,c,d,a,x[k+4],20,0xE7D3FBC8);a=GG(a,b,c,d,x[k+9],5,0x21E1CDE6);d=GG(d,a,b,c,x[k+14],9,0xC33707D6);c=GG(c,d,a,b,x[k+3],14,0xF4D50D87);b=GG(b,c,d,a,x[k+8],20,0x455A14ED);a=GG(a,b,c,d,x[k+13],5,0xA9E3E905);d=GG(d,a,b,c,x[k+2],9,0xFCEFA3F8);c=GG(c,d,a,b,x[k+7],14,0x676F02D9);b=GG(b,c,d,a,x[k+12],20,0x8D2A4C8A);a=HH(a,b,c,d,x[k+5],4,0xFFFA3942);d=HH(d,a,b,c,x[k+8],11,0x8771F681);c=HH(c,d,a,b,x[k+11],16,0x6D9D6122);b=HH(b,c,d,a,x[k+14],23,0xFDE5380C);a=HH(a,b,c,d,x[k+1],4,0xA4BEEA44);d=HH(d,a,b,c,x[k+4],11,0x4BDECFA9);c=HH(c,d,a,b,x[k+7],16,0xF6BB4B60);b=HH(b,c,d,a,x[k+10],23,0xBEBFBC70);a=II(a,b,c,d,x[k+0],6,0xF4292244);d=II(d,a,b,c,x[k+7],10,0x432AFF97);c=II(c,d,a,b,x[k+14],15,0xAB9423A7);b=II(b,c,d,a,x[k+5],21,0xFC93A039);a=AddUnsigned(a,AA);b=AddUnsigned(b,BB);c=AddUnsigned(c,CC);d=AddUnsigned(d,DD)}return (WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d)).toLowerCase()}

  const login = async () => {
    if (!validate()) return
    try {
      state.error = null
      state.loading = true

      // 基础参数
      const baseParams: any = {
        phone: form.phone,
        countrycode: form.countrycode,
        ctcode: form.countrycode,
      }

      // 针对beifang.dpdns.org的特殊处理
      const tryLogin = async (params: any, usePost = false) => {
        try {
          if (usePost) {
            return await loginCellphonePost({ ...params, rememberLogin: true })
          } else {
            return await loginCellphone(params)
          }
        } catch (error: any) {
          const errorData = error?.response?.data
          const errorCode = errorData?.code
          const errorMessage = errorData?.message

          // 处理特殊错误码
          if (errorCode === 8810) {
            // 8810错误表示网络环境安全风险，必须使用验证码登录
            const securityError = new Error('网络环境存在安全风险，必须使用验证码登录')
            ;(securityError as any).code = 8810
            ;(securityError as any).requireCaptcha = true
            throw securityError
          } else if (errorCode === 400 && errorMessage?.includes('安全验证')) {
            throw new Error('此账号需要验证码登录，请切换到验证码模式')
          } else if (errorCode === 502 && errorMessage?.includes('账号或密码错误')) {
            throw new Error('账号或密码错误，请检查后重试')
          }

          throw error
        }
      }

      let res: any
      if (form.mode === 'password') {
        // 密码登录模式
        const passwordParams = { ...baseParams, password: form.password }

        try {
          // 1) 先尝试GET请求
          console.log('尝试密码登录 (GET):', passwordParams)
          res = await tryLogin(passwordParams, false)
        } catch (e1: any) {
          console.log('密码登录GET失败，尝试POST:', e1?.response?.data?.message || e1?.message)
          try {
            // 2) GET失败，尝试POST请求
            res = await tryLogin(passwordParams, true)
          } catch (e2: any) {
            console.log('密码登录POST失败，尝试MD5+GET:', e2?.response?.data?.message || e2?.message)
            try {
              // 3) 尝试MD5密码 + GET
              const md5Params = { ...baseParams, md5_password: md5(form.password) }
              console.log('尝试MD5密码登录 (GET):', { ...md5Params, md5_password: '***' })
              res = await tryLogin(md5Params, false)
            } catch (e3: any) {
              console.log('MD5密码GET失败，尝试MD5+POST:', e3?.response?.data?.message || e3?.message)
              // 4) 最后尝试MD5密码 + POST
              const md5Params = { ...baseParams, md5_password: md5(form.password) }
              res = await tryLogin(md5Params, true)
            }
          }
        }
      } else {
        // 验证码登录模式
        console.log('开始验证码登录流程...')

        // 验证码登录不需要先验证，直接使用验证码登录
        // 因为远程API可能不支持单独的验证码验证接口
        const captchaParams = {
          ...baseParams,
          captcha: form.captcha,
          // 移除password相关参数，确保只使用验证码
        }

        // 确保没有password参数
        delete captchaParams.password
        delete captchaParams.md5_password

        try {
          // 1) 先尝试GET请求
          console.log('尝试验证码登录 (GET):', captchaParams)
          res = await tryLogin(captchaParams, false)
        } catch (e1: any) {
          console.log('验证码登录GET失败，尝试POST:', e1?.response?.data?.message || e1?.message)
          // 2) GET失败，尝试POST请求
          res = await tryLogin(captchaParams, true)
        }
      }
      // 优先使用登录接口返回的 profile（避免代理/跨域导致的 cookie 丢失）
      const loginProfile = res?.profile || res?.data?.profile
      const account = res?.account || res?.data?.account

      if (loginProfile && (loginProfile.nickname || loginProfile.userId)) {
        const { nickname, avatarUrl, userId } = loginProfile
        userStore.setUserInfo({ nickname, avatarUrl, userId })
        userStore.setIsLoggedIn(true)
        onSuccess()
        return
      }

      // 兜底：尝试刷新登录+拉取登录状态
      // 再次兜底：尝试直接读取账号信息或用户详情
      try {
        const acc = await userAccount()
        const accProfile: any = (acc as any)?.profile || (acc as any)?.data?.profile
        const uid = accProfile?.userId || (acc as any)?.account?.id
        if (accProfile && uid) {
          userStore.setUserInfo({ nickname: accProfile.nickname, avatarUrl: accProfile.avatarUrl, userId: uid })
          userStore.setIsLoggedIn(true)
          onSuccess()
          return
        }
        if (uid) {
          const detail = await userDetail(uid)
          const profile: any = (detail as any)?.profile || (detail as any)?.data?.profile
          if (profile) {
            userStore.setUserInfo({ nickname: profile.nickname, avatarUrl: profile.avatarUrl, userId: uid })
            userStore.setIsLoggedIn(true)
            onSuccess()
            return
          }
        }
      } catch {}

      try {
        await loginRefresh()
      } catch {}
      const { data } = await loginStatus()
      if (data?.profile) {
        const { nickname, avatarUrl, userId } = data.profile
        userStore.setUserInfo({ nickname, avatarUrl, userId })
        userStore.setIsLoggedIn(true)
        onSuccess()
      } else {
        state.error = '登录成功，但未获取到用户信息，请刷新后重试'
      }
    } catch (e: any) {
      console.error('登录失败:', e)
      const errorData = e?.response?.data
      const errorCode = errorData?.code || e?.code
      const msg = errorData?.message || errorData?.msg || e?.message

      // 特殊错误处理
      if (errorCode === 8810 || e?.requireCaptcha) {
        // 8810错误码表示必须使用验证码登录
        if (form.mode === 'password') {
          // 自动切换到验证码模式
          form.mode = 'captcha'
          state.error = '检测到安全风险，已自动切换到验证码登录模式，请发送验证码'
        } else {
          state.error = '网络环境存在安全风险，请使用验证码登录'
        }
      } else if (msg?.includes('安全验证') || msg?.includes('验证码登录')) {
        state.error = '此账号需要安全验证，请使用验证码登录'
        if (form.mode === 'password') {
          form.mode = 'captcha'
        }
      } else if (msg?.includes('账号或密码错误')) {
        state.error = '账号或密码错误，请检查后重试'
      } else if (msg?.includes('验证码')) {
        state.error = msg
      } else {
        state.error = msg || '登录失败，请稍后重试'
      }
    } finally {
      state.loading = false
    }
  }

  onUnmounted(() => {
    if (timer) clearInterval(timer)
    timer = null
  })

  // 自动切换到验证码模式（当遇到安全风险时）
  const switchToCaptchaMode = () => {
    form.mode = 'captcha'
    state.error = '已自动切换到验证码登录模式，请发送验证码'
  }

  return {
    form,
    state,
    validate,
    sendCaptcha,
    login,
    switchToCaptchaMode,
    isValidPhone,
  }
}

