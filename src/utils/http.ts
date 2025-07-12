import axios, {
    AxiosInstance,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from 'axios'
import { ElNotification } from "element-plus";
import NProgress from '@/config/nprogress'

const instance: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_BASE_API,
    timeout: 30000, // 增加超时时间到30秒
    withCredentials: true,
})

// 请求拦截器
instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // 开启进度条
        NProgress.start()
        if (config.params === undefined) {
            config.params = {}
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
    (error) => {
        // 响应错误时也结束进度条
        NProgress.done()
        
        // 处理超时错误
        if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
            ElNotification({
                title: '请求超时',
                message: '服务器响应时间过长，请稍后再试',
                type: 'error',
            })
        } else if (error.response) {
            // 处理服务器返回的错误
            ElNotification({
                title: '请求错误',
                message: error.response.data?.message || '网络请求失败，请稍后再试！',
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
)

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