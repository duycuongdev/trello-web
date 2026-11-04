import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from './locales/en.json'
import vi from './locales/vi.json'

/**
 * i18n song ngữ (English / Tiếng Việt)
 * - Ưu tiên ngôn ngữ người dùng đã chọn (localStorage: 'trello-lang')
 * - Không có lựa chọn thì theo ngôn ngữ trình duyệt, fallback 'en'
 * - Đổi ngôn ngữ: i18n.changeLanguage('vi' | 'en') (xem LanguageSelect trong AppBar)
 */
export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' }
]

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      vi: { translation: vi }
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'vi'],
    detection: {
      // Thứ tự: cache/localStorage trước, rồi tới ngôn ngữ trình duyệt
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'trello-lang',
      caches: ['localStorage']
    },
    interpolation: { escapeValue: false }, // React đã tự escape
    returnObjects: false
  })

export default i18n
