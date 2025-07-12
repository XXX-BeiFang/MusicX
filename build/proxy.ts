import type { ProxyOptions } from "vite";

type ProxyItem = [string, string];

type ProxyList = ProxyItem[];

type ProxyTargetList = Record<string, ProxyOptions>;

/**
 * 创建代理，用于解析 .env.development 代理配置
 * @param list
 */
export function createProxy(list: ProxyList = []) {
    const ret: ProxyTargetList = {};
    for (const [prefix, target] of list) {
        const httpsRE = /^https:\/\//;
        const isHttps = httpsRE.test(target);

        // https://github.com/http-party/node-http-proxy#options
        ret[prefix] = {
            target: target,
            changeOrigin: true,
            ws: true,
            rewrite: path => path.replace(new RegExp(`^${prefix}`), ""),
            // https is require secure=false
            ...(isHttps ? { secure: false } : {}),
            // 添加代理超时设置
            timeout: 60000, // 60秒超时
            proxyTimeout: 60000 // 代理超时
        };
    }
    return ret;
}