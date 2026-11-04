import { useEffect, useRef } from 'react'
import { useSearchParams, useNavigate, Navigate } from 'react-router-dom'
import PageLoadingSpinner from '~/components/Loading/PageLoadingSpinner'
import { verifyUserAPI } from '~/apis'
import { useTranslation } from 'react-i18next'

const AccountVerification = () => {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const { email, token } = Object.fromEntries([...searchParams])
  const navigate = useNavigate()
  const hasRequested = useRef(false)

  useEffect(() => {
    if (!email || !token) return
    if (hasRequested.current) return
    hasRequested.current = true

    // verifyUserAPI đã tự động hiển thị 1 toast.success duy nhất với toastId cố định
    // authorizedAxiosInstance đã tự động hiển thị 1 toast.error duy nhất nếu thất bại
    const notifyOldTabAndFinish = () => {
      // 1. Bắn tín hiệu sang tab cũ (tab /register đang mở) qua BroadcastChannel
      try {
        const authChannel = new BroadcastChannel('trello-auth-channel')
        authChannel.postMessage({ type: 'ACCOUNT_VERIFIED', email })
        authChannel.close()
      } catch (_err) {
        // BroadcastChannel may not be supported in some environments
      }

      // 2. Dự phòng thêm qua localStorage event (hỗ trợ mọi trình duyệt)
      try {
        localStorage.setItem('trello_account_verified', JSON.stringify({ email, timestamp: Date.now() }))
      } catch (_err) {
        // localStorage may be restricted
      }

      // 3. Thử tự động đóng tab mới này để người dùng quay về tab cũ
      window.close()

      // 4. Dự phòng nếu trình duyệt chặn window.close() (do tab mở từ email ngoài), điều hướng tab này về /login
      navigate(`/login?verifiedEmail=${encodeURIComponent(email)}`, { replace: true })
    }

    verifyUserAPI({ email, token })
      .then(() => {
        notifyOldTabAndFinish()
      })
      .catch((error) => {
        const errorMsg = error?.response?.data?.message || ''
        if (errorMsg.toLowerCase().includes('already active')) {
          notifyOldTabAndFinish()
        } else {
          navigate('/login', { replace: true })
        }
      })
  }, [email, token, navigate])

  if (!email || !token) {
    return <Navigate to='/404' replace />
  }

  return <PageLoadingSpinner caption={t('auth.verifying')} />
}

export default AccountVerification
