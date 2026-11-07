// import React from 'react'
import ReactDOM from 'react-dom/client'
// i18n song ngữ (EN/VI) - khởi tạo trước App
import '~/i18n'
import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import GlobalStyles from '@mui/material/GlobalStyles'
import theme from '~/theme'
import App from '~/App.jsx'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
// cấu hình MUI dialog
import { ConfirmProvider } from 'material-ui-confirm'
// Redux
import { Provider } from 'react-redux'
import { store } from '~/redux/store'
// cấu hình react-router-dom với BrowserRouter
import { BrowserRouter } from 'react-router-dom'

// Cấu hình Redux-Persist
import { PersistGate } from 'redux-persist/integration/react'
import { persistStore } from 'redux-persist'
const persistor = persistStore(store)

// kỹ thuật Inject store vào authorizeAxios.js để sử dụng biến store trong file authorizeAxios.js
import { injectStore } from '~/utils/authorizeAxios'
import GoogleProvider from '~/components/GoogleProvider'
import { MotionConfig } from 'framer-motion'
injectStore(store)

// PWA: kiểm tra service worker mới khi người dùng quay lại app.
// iOS PWA khôi phục nguyên trạng webview khi mở lại (không có navigation) nên trình duyệt
// không tự check update - phải chủ động gọi registration.update() rồi để plugin auto-reload.
const checkSWUpdate = () => navigator.serviceWorker?.controller?.update?.()
window.addEventListener('focus', checkSWUpdate)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') checkSWUpdate()
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <GoogleProvider>
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <BrowserRouter basename='/' future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <CssVarsProvider theme={theme}>
            <ConfirmProvider defaultOptions={{
              dialogProps: { maxWidth: 'xs' },
              confirmationButtonProps: { color: 'secondary', variant: 'outlined' },
              cancellationButtonProps: { color: 'inherit' },
              allowClose: false,
              buttonOrder: ['confirm', 'cancel']
            }}>
              <GlobalStyles styles={{
                a: { textDecoration: 'none' },
                // iOS Safari/PWA tự zoom cả trang khi focus vào input có font-size < 16px
                // và trong PWA standalone nó không tự reset -> ép 16px trên mobile
                '@media (max-width: 896px)': {
                  'input, textarea, select': { fontSize: '16px !important' }
                },
                // Tinh chỉnh Toast thông báo siêu nhỏ gọn (Compact Pill), chuẩn đẹp trên cả Mobile và Desktop
                '.Toastify__toast-container': {
                  width: 'min(92vw, 380px) !important',
                  left: '50% !important',
                  transform: 'translateX(-50%) !important',
                  top: '16px !important',
                  padding: '0 !important',
                  zIndex: '99999 !important'
                },
                '.Toastify__toast': {
                  borderRadius: '12px !important',
                  minHeight: '44px !important',
                  padding: '8px 14px !important',
                  fontSize: '13.5px !important',
                  fontWeight: '500 !important',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2) !important',
                  marginBottom: '8px !important'
                },
                '.Toastify__toast-body': {
                  padding: '0 !important',
                  margin: '0 !important',
                  lineHeight: '1.4 !important'
                },
                '.Toastify__toast-icon': {
                  width: '18px !important',
                  marginRight: '10px !important'
                },
                '.Toastify__close-button': {
                  alignSelf: 'center !important',
                  opacity: '0.8 !important'
                }
              }} />
              <CssBaseline />
              {/* reducedMotion="user": tự tắt animation khi người dùng bật Reduce Motion trong hệ điều hành */}
              <MotionConfig reducedMotion="user">
                <App />
              </MotionConfig>
              <ToastContainer
                position='top-center'
                autoClose={4000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                pauseOnHover
                theme='colored'
              />
            </ConfirmProvider>
          </CssVarsProvider>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </GoogleProvider>
)
