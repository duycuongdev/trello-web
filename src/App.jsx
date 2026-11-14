import { useEffect, lazy, Suspense, useRef } from 'react'
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { useSelector, useDispatch } from 'react-redux'
import { selectCurrentUser, fetchCurrentUserAPI } from '~/redux/user/userSlice'
import TrelloIcon from '~/components/Icons/TrelloIcon'

// Chỉ tải mã của route đang truy cập.
const Board = lazy(() => import('~/pages/Boards/_id'))
const Boards = lazy(() => import('~/pages/Boards/index.jsx'))
const Home = lazy(() => import('~/pages/Home/Home'))
const Auth = lazy(() => import('~/pages/Auth/Auth'))
const AccountVerification = lazy(() => import('~/pages/Auth/AccountVerification'))
const ForgotPassword = lazy(() => import('~/pages/Auth/ForgotPassword'))
const ResetPassword = lazy(() => import('~/pages/Auth/ResetPassword'))
const Settings = lazy(() => import('~/pages/Settings/Settings'))
const NotFound = lazy(() => import('~/pages/404/NotFound'))

// Giữ nền theo theme trong lúc tải route để tránh lóe màu.
const PageLoading = () => (
  <Box sx={{
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2.5,
    bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0b1120' : '#f4f5f7'
  }}>
    <Box sx={{
      width: 52,
      height: 52,
      borderRadius: 2.5,
      bgcolor: '#0052cc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 8px 24px rgba(0, 82, 204, 0.35)'
    }}>
      <TrelloIcon sx={{ color: 'white', fontSize: 30 }} />
    </Box>
    <CircularProgress size={22} thickness={5} sx={{ color: '#0052cc' }} />
  </Box>
)

/**
 * Giải pháp Clean Code trong việc xác định các route nào cần đăng nhập tài khoản xong thì mới cho truy cập
 * Sử dụng <Outlet /> của react-router-dom để hiển thị các Child Route (xem cách sử dụng trong App() bên dưới)
 * https://reactrouter.com/en/main/components/outlet
 * Một bài hướng dẫn khá đầy đủ:
 * https://www.robinwieruch.de/react-router-private-routes/
 */
const ProtectedRoute = ({ user }) => {
  if (!user) return <Navigate to="/login" replace={true} />
  return <Outlet />
}

/**
 * PageFade: hiệu ứng fade + trượt nhẹ lên khi mỗi trang được mount (route change).
 * Dùng mount-animation thay cho AnimatePresence mode="wait" để tránh case kẹt
 * khi điều hướng client-side giữa các route (framer-motion v14 + react-router v6).
 * Tự động tắt khi người dùng bật Reduce Motion (MotionConfig ở main.jsx).
 */
const PageFade = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.22, ease: 'easeOut' }}
    style={{ minHeight: '100vh' }}
  >
    {children}
  </motion.div>
)

function App() {
  const dispatch = useDispatch()
  const location = useLocation()
  const currentUser = useSelector(selectCurrentUser)
  const currentUserId = currentUser?._id
  const lastSessionCheckRef = useRef(0)

  // Xác thực phiên làm việc thông minh (kèm throttle để tránh spam request liên tục):
  // 1. Khi app mount hoặc currentUserId thay đổi -> kiểm tra ngay
  // 2. Khi chuyển trang (location.pathname) -> kiểm tra nếu đã qua ít nhất 60s kể từ lần check trước
  // 3. Khi người dùng focus/quay lại tab -> kiểm tra nếu đã qua ít nhất 30s kể từ lần check trước
  // Nếu user đã bị xóa hoặc vô hiệu hóa trong DB, interceptor 401 sẽ tự động kích hoạt logoutUserAPI ngay lập tức.
  useEffect(() => {
    if (!currentUserId) return

    const now = Date.now()
    // Nếu vừa mới kiểm tra trong vòng 60 giây trước đó thì bỏ qua lần đổi route này
    if (now - lastSessionCheckRef.current >= 60000) {
      lastSessionCheckRef.current = now
      dispatch(fetchCurrentUserAPI())
    }

    // Khi người dùng quay lại tab (focus hoặc visibilitychange), kiểm tra với throttle 30s
    const handleCheckSession = () => {
      const currentTime = Date.now()
      if (document.visibilityState === 'visible' && currentTime - lastSessionCheckRef.current >= 30000) {
        lastSessionCheckRef.current = currentTime
        dispatch(fetchCurrentUserAPI())
      }
    }

    window.addEventListener('focus', handleCheckSession)
    document.addEventListener('visibilitychange', handleCheckSession)

    return () => {
      window.removeEventListener('focus', handleCheckSession)
      document.removeEventListener('visibilitychange', handleCheckSession)
    }
  }, [dispatch, currentUserId, location.pathname])

  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        {/* Landing Page: khách chưa đăng nhập xem trang giới thiệu; đã đăng nhập tự chuyển vào /boards */}
        <Route path='/' element={currentUser ? <Navigate to='/boards/' replace={true} /> : <PageFade><Home /></PageFade>} />
        <Route path='/home' element={<PageFade><Home /></PageFade>} />

        {/* Protected Routes (Hiểu đơn giản trong dự án của chúng ta là những route chỉ cho truy cập sau khi đã login) */}
        <Route element={<ProtectedRoute user={currentUser} />}>
          {/* <Outlet /> của react-router-dom sẽ chạy vào các child route trong này */}

          {/* board details route */}
          <Route path='boards/:boardId' element={<PageFade><Board /></PageFade>} />
          <Route path='boards/:boardId/:slug' element={<PageFade><Board /></PageFade>} />
          <Route path='boards/' element={<PageFade><Boards /></PageFade>} />

          {/* User Settings */}
          <Route path='settings/account' element={<PageFade><Settings /></PageFade>} />
          <Route path='settings/security' element={<PageFade><Settings /></PageFade>} />
        </Route>

        {/* Authentication */}
        <Route path='login' element={<PageFade><Auth /></PageFade>} />
        <Route path='register' element={<PageFade><Auth /></PageFade>} />
        <Route path='/account/verification' element={<PageFade><AccountVerification /></PageFade>} />
        <Route path='/forgot-password' element={<PageFade><ForgotPassword /></PageFade>} />
        <Route path='/reset-password' element={<PageFade><ResetPassword /></PageFade>} />

        {/* 404 route */}
        <Route path='*' element={<PageFade><NotFound /></PageFade>} />
      </Routes>
    </Suspense>
  )
}

export default App
