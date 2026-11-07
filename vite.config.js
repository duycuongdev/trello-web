import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import svgr from 'vite-plugin-svgr'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  // cho phép vite sử dụng process.env, mặc định thì phải import.meta.env
  define: {
    'process.env': process.env
  },
  plugins: [
    react(),
    svgr(),
    // PWA: manifest + service worker (Workbox) để cài app lên điện thoại và cache shell
    // Lưu ý: SW chỉ hoạt động ở bản build (vite build + preview), dev mode tự tắt
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['trello.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Trello Clone – Kanban Boards',
        short_name: 'Trello Clone',
        description: 'A learning project inspired by Trello: manage projects and tasks with intuitive Kanban boards.',
        lang: 'en',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#0052cc',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        // Bundle của app có chunk >1MB nên phải nâng hạn mức precache
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // SPA: mọi điều hướng không trùng file tĩnh đều trả về index.html
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            // Ảnh nền board từ Cloudinary: cache-first, cập nhật ngầm sau 30 ngày
            urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cloudinary-images',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      },
      devOptions: {
        enabled: false
      }
    })
  ],
  optimizeDeps: {
    include: ['dayjs']
  },
  // thay đổi đường dẫn tới thư mục
  resolve: {
    alias: [
      { find: '~', replacement: '/src' }
    ]
  },
  build: {
    chunkSizeWarningLimit: 1200
  },
  // Ghim port dev: Google OAuth chỉ chấp nhận origin http://localhost:5173
  // (đã đăng ký trong Google Cloud Console). Nếu port bận thì FAIL LOUDLY
  // thay vì lặng lẽ nhảy sang 5174/5175... và phá Google login.
  server: {
    port: 5173,
    strictPort: true
  }
})
