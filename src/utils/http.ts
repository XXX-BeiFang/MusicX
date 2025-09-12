import axios, {
    AxiosInstance,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from 'axios'
import { ElNotification } from "element-plus";
import NProgress from '@/config/nprogress'

// 允许通过 localStorage 临时覆盖 API 基址，便于在无法写入 .env 时快速切换到外部代理
const fallbackBaseUrl = ((): string => {
    try {
        const override = localStorage.getItem('API_BASE_URL_OVERRIDE') || ''
        return override || import.meta.env.VITE_APP_BASE_API || '/api'
    } catch {
        return import.meta.env.VITE_APP_BASE_API || '/api'
    }
})()

const instance: AxiosInstance = axios.create({
    baseURL: fallbackBaseUrl,
    timeout: 15000, // 减少超时时间到15秒，提高响应速度
    withCredentials: true,
    // 添加重试配置
    retry: 3,
    retryDelay: 1000,
})

// 请求拦截器
instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // 开启进度条
        NProgress.start()
        if (config.params === undefined) {
            config.params = {}
        }
        // 规范化 URL：对相对路径自动补全前导斜杠，避免与 baseURL 直连时拼接错误
        if (typeof config.url === 'string') {
            const url = config.url.trim()
            const isAbsolute = /^(https?:)?\/\//i.test(url)
            const hasLeadingSlash = url.startsWith('/')
            if (!isAbsolute && !hasLeadingSlash) {
                config.url = `/${url}`
            }
        }
        // 不再添加额外参数，可能导致API请求失败
        return config
    },
    (error) => Promise.reject(error)
)

// 响应拦截器
instance.interceptors.response.use(
    (response: AxiosResponse) => {
        const { data } = response

        // 进度条结束
        NProgress.done()
        return data
    },
    async (error) => {
        // 响应错误时也结束进度条
        NProgress.done()

        const config = error.config

        // 如果没有配置重试或者已经重试过了，直接返回错误
        if (!config || !config.retry) {
            return handleError(error)
        }

        // 设置重试计数器
        config.__retryCount = config.__retryCount || 0

        // 检查是否超过重试次数
        if (config.__retryCount >= config.retry) {
            return handleError(error)
        }

        // 增加重试计数
        config.__retryCount += 1

        // 创建延迟Promise
        const delay = new Promise(resolve => {
            setTimeout(resolve, config.retryDelay || 1000)
        })

        // 延迟后重试请求
        return delay.then(() => instance(config))
    }
)

// 错误处理函数
function handleError(error: any) {
    // 处理超时错误
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
        ElNotification({
            title: '请求超时',
            message: '服务器响应时间过长，请稍后再试',
            type: 'error',
        })
    } else if (error.response) {
        // 处理服务器返回的错误
        const status = error.response.status
        let message = '网络请求失败，请稍后再试！'

        switch (status) {
            case 400:
                message = '请求参数错误'
                break
            case 401:
                message = '未授权，请重新登录'
                break
            case 403:
                message = '拒绝访问'
                break
            case 404:
                message = '请求的资源不存在'
                break
            case 500:
                message = '服务器内部错误'
                break
            case 502:
                message = '网关错误'
                break
            case 503:
                message = '服务不可用'
                break
            default:
                message = error.response.data?.message || message
        }

        ElNotification({
            title: '请求错误',
            message,
            type: 'error',
        })
    } else {
        // 处理网络错误
        ElNotification({
            title: '网络错误',
            message: '网络连接异常，请检查您的网络设置',
            type: 'error',
        })
    }

    return Promise.reject(error)
}

// 封装get方法
export const httpGet = <T>(url: string, params?: object): Promise<T> =>
    instance.get(url, { params })

// 封装post方法
export const httpPost = <T>(
    url: string,
    data?: object,
    header?: object
): Promise<T> => instance.post(url, data, header)

// 封装upload方法
export const httpUpload = <T>(
    url: string,
    formData: FormData,
    header?: object
): Promise<T> => {
    return instance.post(url, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            ...header,
        },
    })
}