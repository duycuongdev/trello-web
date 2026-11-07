import { useEffect } from 'react'
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Board from '~/pages/Boards/_id'
import NotFound from '~/pages/404/NotFound'
import Auth from '~/pages/Auth/Auth'
import AccountVerification from '~/pages/Auth/AccountVerification'
import ForgotPassword from '~/pages/Auth/ForgotPassword'
import ResetPassword from '~/pages/Auth/ResetPassword'
import { useSelector, useDispatch } from 'react-redux'
import { selectCurrentUser, fetchCurrentUserAPI } from '~/redux/user/userSlice'
import Settings from '~/pages/Settings/Settings'
import Boards from '~/pages/Boards/index.jsx'
import Home from '~/pages/Home/Home'

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

  // Xác thực phiên làm việc liên tục:
  // 1. Khi app mount hoặc currentUserId thay đổi
  // 2. Khi người dùng click chuyển hướng giữa các trang (location.pathname)
  // 3. Khi người dùng switch tab quay lại cửa sổ trình duyệt (window focus & visibilitychange)
  // Nếu user đã bị xóa hoặc vô hiệu hóa trong DB, interceptor 401 sẽ tự động kích hoạt logoutUserAPI ngay lập tức.
  useEffect(() => {
    if (!currentUserId) return

    // Kiểm tra ngay khi mount hoặc khi route thay đổi
    dispatch(fetchCurrentUserAPI())

    // Kiểm tra ngay lập tức khi người dùng quay lại tab (ví dụ sau khi thao tác xóa tài khoản trong DB)
    const handleCheckSession = () => {
      if (document.visibilityState === 'visible') {
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
  )
}

export default App
