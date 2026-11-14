let apiRoot = ''
if (import.meta.env.VITE_API_ROOT) {
  apiRoot = import.meta.env.VITE_API_ROOT
} else if (process.env.BUILD_MODE === 'dev') {
  apiRoot = 'http://localhost:1900'
} else if (process.env.BUILD_MODE === 'production') {
  // Khi chạy trên localhost (kể cả Docker production container), tự động kết nối Backend local port 1900
  apiRoot = (typeof window !== 'undefined' && window.location.hostname === 'localhost')
    ? 'http://localhost:1900'
    : 'https://trello-api-5hh5.onrender.com'
}

export const API_ROOT = apiRoot

export const DEFAULT_PAGE = 1
export const DEFAULT_ITEMS_PER_PAGE = 12

export const CARD_MEMBER_ACTION = {
  ADD: 'ADD',
  REMOVE: 'REMOVE'
}

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '450608219312-6tmujfnjku68koncdd1hihnsl9td226a.apps.googleusercontent.com'
