import { GoogleOAuthProvider } from '@react-oauth/google'
import { useTranslation } from 'react-i18next'
import { GOOGLE_CLIENT_ID } from '~/utils/constants'

/**
 * Bọc GoogleOAuthProvider với locale theo ngôn ngữ đang chọn (en/vi)
 * để nút "Sign in with Google" của Google Identity Services hiển thị đúng ngôn ngữ.
 */
function GoogleProvider({ children }) {
  const { i18n } = useTranslation()
  const locale = i18n.language?.startsWith('vi') ? 'vi' : 'en'
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID} locale={locale}>
      {children}
    </GoogleOAuthProvider>
  )
}

export default GoogleProvider
