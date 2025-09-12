// 测试登录功能的简单脚本
import { captchaSent, captchaVerify, loginCellphone, loginCellphonePost } from '@/api'

// 测试验证码发送
export async function testCaptchaSent(phone: string = '13000000000') {
  try {
    console.log('测试验证码发送...')
    const result = await captchaSent(phone, '86')
    console.log('验证码发送结果:', result)
    return result
  } catch (error: any) {
    console.error('验证码发送失败:', error?.response?.data || error?.message)
    return null
  }
}

// 测试验证码验证
export async function testCaptchaVerify(phone: string = '13000000000', captcha: string = '1234') {
  try {
    console.log('测试验证码验证...')
    const result = await captchaVerify({ phone, captcha, ctcode: '86' })
    console.log('验证码验证结果:', result)
    return result
  } catch (error: any) {
    console.error('验证码验证失败:', error?.response?.data || error?.message)
    return null
  }
}

// 测试密码登录 (GET)
export async function testPasswordLoginGet(phone: string = '13000000000', password: string = 'test123') {
  try {
    console.log('测试密码登录 (GET)...')
    const result = await loginCellphone({
      phone,
      password,
      countrycode: '86',
      ctcode: '86'
    })
    console.log('密码登录 (GET) 结果:', result)
    return result
  } catch (error: any) {
    console.error('密码登录 (GET) 失败:', error?.response?.data || error?.message)
    return null
  }
}

// 测试密码登录 (POST)
export async function testPasswordLoginPost(phone: string = '13000000000', password: string = 'test123') {
  try {
    console.log('测试密码登录 (POST)...')
    const result = await loginCellphonePost({
      phone,
      password,
      countrycode: '86',
      ctcode: '86',
      rememberLogin: true
    })
    console.log('密码登录 (POST) 结果:', result)
    return result
  } catch (error: any) {
    console.error('密码登录 (POST) 失败:', error?.response?.data || error?.message)
    return null
  }
}

// 测试验证码登录 (GET)
export async function testCaptchaLoginGet(phone: string = '13000000000', captcha: string = '1234') {
  try {
    console.log('测试验证码登录 (GET)...')
    const params = {
      phone,
      captcha,
      countrycode: '86',
      ctcode: '86'
    }
    console.log('请求参数:', params)
    const result = await loginCellphone(params)
    console.log('验证码登录 (GET) 结果:', result)
    return result
  } catch (error: any) {
    console.error('验证码登录 (GET) 失败:')
    console.error('- 状态码:', error?.response?.status)
    console.error('- 错误数据:', error?.response?.data)
    console.error('- 错误信息:', error?.message)
    return null
  }
}

// 测试验证码登录 (POST)
export async function testCaptchaLoginPost(phone: string = '13000000000', captcha: string = '1234') {
  try {
    console.log('测试验证码登录 (POST)...')
    const params = {
      phone,
      captcha,
      countrycode: '86',
      ctcode: '86',
      rememberLogin: true
    }
    console.log('请求参数:', params)
    const result = await loginCellphonePost(params)
    console.log('验证码登录 (POST) 结果:', result)
    return result
  } catch (error: any) {
    console.error('验证码登录 (POST) 失败:')
    console.error('- 状态码:', error?.response?.status)
    console.error('- 错误数据:', error?.response?.data)
    console.error('- 错误信息:', error?.message)
    return null
  }
}

// 运行所有测试
export async function runAllTests() {
  console.log('=== 开始登录功能测试 ===')

  // 测试验证码发送
  console.log('\n1. 测试验证码发送...')
  await testCaptchaSent()

  // 等待一秒
  await new Promise(resolve => setTimeout(resolve, 1000))

  // 测试密码登录
  console.log('\n2. 测试密码登录...')
  await testPasswordLoginGet()
  await testPasswordLoginPost()

  // 测试验证码相关
  console.log('\n3. 测试验证码登录...')
  await testCaptchaVerify()
  await testCaptchaLoginGet()
  await testCaptchaLoginPost()

  console.log('\n=== 测试完成 ===')
  console.log('如果看到8810错误码，说明需要使用验证码登录')
}

// 专门针对8810错误的验证码登录流程测试
export async function testCaptchaLoginFlow(phone: string) {
  console.log('=== 开始验证码登录完整流程测试 ===')
  console.log('手机号:', phone)

  try {
    // 1. 发送验证码
    console.log('\n1. 发送验证码...')
    const sentResult = await testCaptchaSent(phone)
    if (!sentResult || (sentResult as any).code !== 200) {
      console.error('验证码发送失败，无法继续测试')
      return false
    }

    console.log('✅ 验证码发送成功！')
    console.log('📱 请查看手机短信，然后在控制台输入：')
    console.log(`window.loginTest.testCaptchaLoginWithCode('${phone}', '您收到的验证码')`)

    return true
  } catch (error) {
    console.error('验证码登录流程测试失败:', error)
    return false
  }
}

// 使用验证码登录
export async function testCaptchaLoginWithCode(phone: string, captcha: string) {
  console.log('\n=== 使用验证码登录 ===')
  console.log('手机号:', phone)
  console.log('验证码:', captcha)

  try {
    // 先尝试GET方式
    const result = await testCaptchaLoginGet(phone, captcha)
    if (result) {
      console.log('✅ 验证码登录成功！')
      return result
    }
  } catch (error) {
    console.log('GET方式失败，尝试POST方式...')
  }

  try {
    // 再尝试POST方式
    const result = await testCaptchaLoginPost(phone, captcha)
    if (result) {
      console.log('✅ 验证码登录成功！')
      return result
    }
  } catch (error) {
    console.error('❌ 验证码登录失败:', error)
    return null
  }
}

// 在浏览器控制台中可以调用的全局函数
if (typeof window !== 'undefined') {
  (window as any).loginTest = {
    testCaptchaSent,
    testCaptchaVerify,
    testPasswordLoginGet,
    testPasswordLoginPost,
    testCaptchaLoginGet,
    testCaptchaLoginPost,
    testCaptchaLoginFlow,
    testCaptchaLoginWithCode,
    runAllTests
  }

  // 添加使用说明
  console.log('🔧 登录测试工具已加载！')
  console.log('📋 由于检测到8810安全风险错误，建议使用验证码登录：')
  console.log('1. 发送验证码: window.loginTest.testCaptchaLoginFlow("您的手机号")')
  console.log('2. 收到验证码后: window.loginTest.testCaptchaLoginWithCode("您的手机号", "验证码")')
}
