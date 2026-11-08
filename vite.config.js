import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import svgr from 'vite-plugin-svgr'
import { createHash } from 'node:crypto'

const PRECACHE_EXTENSIONS = /\.(js|css|html|svg|png|woff2)$/
const MAX_PRECACHE_BYTES = 4 * 1024 * 1024
const PUBLIC_PRECACHE = [
  '/',
  '/trello.svg',
  '/apple-touch-icon.png',
  '/pwa-192.png',
  '/pwa-512.png',
  '/pwa-maskable-512.png',
  '/vite.svg'
]

function serviceWorkerSource(version, urls) {
  return `const VERSION = '${version}'
const PRECACHE = 'trello-precache-' + VERSION
const RUNTIME = 'trello-runtime-' + VERSION
const META = 'trello-runtime-meta-' + VERSION
const URLS = ${JSON.stringify(urls)}
const MAX_ENTRIES = 60
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(caches.open(PRECACHE).then((cache) => cache.addAll(URLS)))
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.filter((key) => key !== PRECACHE && key !== RUNTIME && key !== META).map((key) => caches.delete(key)))
    await self.clients.claim()
  })())
})

async function trimRuntime(cache, meta) {
  const keys = await cache.keys()
  const excess = keys.slice(0, Math.max(0, keys.length - MAX_ENTRIES))
  for (const key of excess) {
    await cache.delete(key)
    await meta.delete(key)
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return
  const url = new URL(request.url)

  if (url.origin === self.location.origin) {
    if (request.mode === 'navigate') {
      event.respondWith(fetch(request).catch(() => caches.match('/index.html')))
      return
    }
    event.respondWith((async () => {
      const cached = await caches.match(request)
      if (cached) return cached
      const response = await fetch(request)
      if (response.ok && URLS.includes(url.pathname)) {
        const cache = await caches.open(PRECACHE)
        await cache.put(request, response.clone())
      }
      return response
    })())
    return
  }

  if (url.hostname === 'res.cloudinary.com') {
    event.respondWith((async () => {
      const cache = await caches.open(RUNTIME)
      const meta = await caches.open(META)
      const cached = await cache.match(request)
      if (cached) {
        const stamp = await meta.match(request)
        if (stamp) {
          const { t } = await stamp.json()
          if (Date.now() - t < MAX_AGE_MS) return cached
        }
        await cache.delete(request)
        await meta.delete(request)
      }
      const response = await fetch(request)
      if (response.ok || response.type === 'opaque') {
        await cache.put(request, response.clone())
        await meta.put(request, new Response(JSON.stringify({ t: Date.now() }), { headers: { 'Content-Type': 'application/json' } }))
        await trimRuntime(cache, meta)
      }
      return response
    })())
  }
})
`
}

function pwaShell() {
  return {
    name: 'trello-pwa-shell',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const urls = new Set(PUBLIC_PRECACHE)
      for (const [fileName, entry] of Object.entries(bundle)) {
        const size = entry.source?.length ?? 0
        if (PRECACHE_EXTENSIONS.test(fileName) && size <= MAX_PRECACHE_BYTES) {
          urls.add('/' + fileName)
        }
      }
      const list = [...urls]
      const version = createHash('sha256').update(list.join('|')).digest('hex').slice(0, 10)
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: serviceWorkerSource(version, list) })
    }
  }
}

export default defineConfig({
  // chỉ inline đúng biến cần dùng, tránh phơi nhiễm toàn bộ process.env vào bundle
  define: {
    'process.env.BUILD_MODE': JSON.stringify(process.env.BUILD_MODE)
  },
  plugins: [
    react(),
    svgr(),
    pwaShell()
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