import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import svgr from 'vite-plugin-svgr'

// https://vitejs.dev/config/
export default defineConfig({
  // cho phép vite sử dụng process.env, mặc định thì phải import.meta.env
  define: {
    'process.env': process.env
  },
  plugins: [
    react(),
    svgr()
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
