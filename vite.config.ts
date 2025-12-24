import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import { resolve } from 'path'

export default defineConfig({
    plugins: [
        react(),
        cssInjectedByJsPlugin()  // 将 CSS 内联注入到 JS 中
    ],
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.tsx'),
            name: 'SessionManagerPlugin',
            formats: ['iife'],
            fileName: () => 'plugin.js'
        },
        outDir: 'dist',
        rollupOptions: {
            // React/ReactDOM 由宿主应用提供，不打包进插件
            external: ['react', 'react-dom'],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM'
                },
                // 确保 CSS 内联到 JS 中
                assetFileNames: '[name][extname]'
            }
        },
        // CSS 内联到 JS bundle 中
        cssCodeSplit: false,
        // 生产环境压缩
        minify: 'terser',
        // 生成 sourcemap 用于调试
        sourcemap: false
    },
    // 开发模式配置
    server: {
        port: 3001
    }
})
