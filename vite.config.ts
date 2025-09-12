import { defineConfig, loadEnv } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import { wrapperEnv } from "./build/getEnv";
import { createProxy } from "./build/proxy";
import { createVitePlugins } from "./build/plugins";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const root = process.cwd();
  const env = loadEnv(mode, root);
  const viteEnv = wrapperEnv(env);

  return {
    plugins: createVitePlugins(viteEnv),
    server: {
      port: 8089,
      host: true,
      // 代理配置
      proxy: createProxy(viteEnv.VITE_PROXY)
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    base: viteEnv.VITE_PUBLIC_PATH,
    build: {
      // outDir: 'xxxxx', // 设置输出目录
      rollupOptions: {
        // 静态资源分类打包
        output: {
          chunkFileNames: 'static/js/[name]-[hash].js',
          entryFileNames: 'static/js/[name]-[hash].js',
          assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
          // 静态资源分拆打包
          manualChunks(id) {
            if (id && id.includes('node_modules')) {
              const idStr = id.toString()
              if (idStr.indexOf('.pnpm/') !== -1) {
                const parts = idStr.split('.pnpm/')
                return parts[1] ? parts[1].split('/')[0].toString() : 'vendor'
              } else if (idStr.indexOf('node_modules/') !== -1) {
                const parts = idStr.split('node_modules/')
                return parts[1] ? parts[1].split('/')[0].toString() : 'vendor'
              }
            }
          },
        },
      },
    },
  }
})