import { PluginOption } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import IconsResolver from 'unplugin-icons/resolver' // 集成图标集
import Icons from 'unplugin-icons/vite'
import { VitePWA } from 'vite-plugin-pwa'

export const createVitePlugins = (viteEnv: ViteEnv): (PluginOption | PluginOption[])[] => {
    return [
        vue(),
        // basicSsl() 模拟https的配置,
        AutoImport({
            imports: ['vue', 'vue-router', 'pinia'],
            dirs: ['src/utils/**', 'src/stores/modules/**', 'src/hooks/**'],
            dts: 'src/auto-import/imports.d.ts',
            eslintrc: {
                enabled: true,
                filepath: 'src/auto-import/eslintrc-auto-import.json',
            },
        }),
        Components({
            dirs: ['src/components'],
            dts: 'src/auto-import/components.d.ts',
            resolvers: [
                // 集成图标集
                IconsResolver({
                    prefix: 'icon' // 私有前缀
                })
            ]
        }),
        Icons({
            autoInstall: true // 自动安装所需图标集
        }),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
            manifest: {
                name: 'MusicX',
                short_name: 'MusicX',
                description: '一个优雅的音乐播放器',
                theme_color: '#ffffff',
                background_color: '#ffffff',
                display: 'standalone',
                start_url: '/',
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ]
            },
            devOptions: {
                enabled: true
            }
        }),
    ]

}