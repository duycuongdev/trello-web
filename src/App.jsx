import { useEffect } from 'react'
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
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
      <Route path='/' element={currentUser ? <Navigate to='/boards/' replace={true} /> : <Home />} />
      <Route path='/home' element={<Home />} />

      {/* Protected Routes (Hiểu đơn giản trong dự án của chúng ta là những route chỉ cho truy cập sau khi đã login) */}
      <Route element={<ProtectedRoute user={currentUser} />}>
        {/* <Outlet /> của react-router-dom sẽ chạy vào các child route trong này */}

        {/* board details route */}
        <Route path='boards/:boardId' element={<Board />} />
        <Route path='boards/:boardId/:slug' element={<Board />} />
        <Route path='boards/' element={<Boards />} />

        {/* User Settings */}
        <Route path='settings/account' element={<Settings />} />
        <Route path='settings/security' element={<Settings />} />
      </Route>

      {/* Authentication */}
      <Route path='login' element={<Auth />} />
      <Route path='register' element={<Auth />} />
      <Route path='/account/verification' element={<AccountVerification />} />
      <Route path='/forgot-password' element={<ForgotPassword />} />
      <Route path='/reset-password' element={<ResetPassword />} />

      {/* 404 route */}
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}

export default App
