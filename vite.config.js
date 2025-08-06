import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import {createSvgIconsPlugin} from 'vite-plugin-svg-icons'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        createSvgIconsPlugin({
            // 指定需要缓存的图标文件夹
            iconDirs: [path.resolve(process.cwd(), 'src/icons')],
            // 指定symbolId格式
            symbolId: 'icon-[dir]-[name]',

            /**
             * 自定义插入位置
             * @default: body-last
             */
            // inject?: 'body-last' | 'body-first'

            /**
             * custom dom id
             * @default: __svg__icons__dom__
             */
            // customDomId: '__svg__icons__dom__',
        }),
        visualizer({
            filename: 'dist/stats.html',
            open: true,
            gzipSize: true,
            brotliSize: true,
        }),
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        // Vue 核心库
                        if (id.includes('vue') && !id.includes('element-plus') && !id.includes('echarts')) {
                            return 'vue-vendor'
                        }
                        // Pinia
                        if (id.includes('pinia')) {
                            return 'vue-vendor'
                        }
                        // Vue Router
                        if (id.includes('vue-router')) {
                            return 'vue-vendor'
                        }
                        // Element Plus
                        if (id.includes('element-plus')) {
                            return 'element-plus'
                        }
                        // ECharts 相关
                        if (id.includes('echarts') || id.includes('zrender')) {
                            return 'echarts'
                        }
                        // 其他工具库
                        if (id.includes('@vueuse/core') || id.includes('fast-glob')) {
                            return 'utils'
                        }
                    }
                }
            }
        },
        chunkSizeWarningLimit: 1000,
    }
})