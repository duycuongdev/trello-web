import axios from 'axios'
import { toast } from 'react-toastify'
import { interceptorLoadingElements } from './formatter'
import { refreshTokenAPI } from '~/apis/index'
import { logoutUserAPI, setAccessToken, setRefreshToken } from '~/redux/user/userSlice'
/**
 * Không thể import { store } from '~/redux/store' theo cách thông thường ở đây
 * Giải pháp: Inject store: là kỹ thuật khi cần sử dụng biến redux store ở các file ngoài phạm vi component như file authorizeAxios hiện tại
 * Hiểu đơn giản: khi ứng dụng bắt đầu chạy lên, code sẽ chạy vào main.jsx đầu tiên, từ bên đó chúng ta gọi hàm injectStore ngay lập tức để gán biến mainStore vào biến axiosReduxStore cục bộ trong file này.
 * https://redux.js.org/faq/code-structure#how-can-i-use-the-redux-store-in-non-component-files
 */
let axiosReduxStore
export const injectStore = (mainStore) => { axiosReduxStore = mainStore }

// Khởi tạo một đối tượng Axios (authorizedAxiosInstance) mục đích để custom và cấu hình chung cho dự án.
let authorizedAxiosInstance = axios.create()

// Thời gian chờ tối đa của 1 reqquest: để 10 phút
authorizedAxiosInstance.defaults.timeout = 10 * 60 * 1000

// withCredentials: Sẽ cho phép axios tự động gửi cookie trong mỗi request lên BE
// (phục vụ việc chúng ta sẽ lưu JWT tokens (refresh & access) vào trong httpOnly Cookie của trình duyệt)
authorizedAxiosInstance.defaults.withCredentials = true

// Cấu hình Interceptors (Bộ đánh chặn vào giữa mọi Request & Response)
// Add a request interceptor
authorizedAxiosInstance.interceptors.request.use(
  (config) => {
    // Kỹ thuật chặn spam click (xem kỹ mô tả ở file formatters chứa function)
    interceptorLoadingElements(true)

    // Lấy accessToken từ Redux store và đính kèm vào Authorization header (Bearer token)
    // Giúp hỗ trợ cơ chế Dual-Auth: vừa hoạt động với HttpOnly Cookie, vừa hoạt động với Bearer Token trên các trình duyệt di động chặn Third-party cookie (như Safari trên iOS)
    const currentUser = axiosReduxStore?.getState()?.user?.currentUser
    const accessToken = currentUser?.accessToken
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error)
  }
)

// Khởi tạo một cái promise cho việc gọi api refresh_token
// Mục đích tạo Promise này để khi nào gọi api refresh_token xong xuôi thì mới retry lại nhiều api bị lỗi trước đó.
// https://www.thedutchlab.com/en/insights/using-axios-interceptors-for-refreshing-your-api-token
let refreshTokenPromise = null

// Add a response interceptor
authorizedAxiosInstance.interceptors.response.use(
  (response) => {
    // Kỹ thuật chặn spam click (xem kỹ mô tả ở file formatters chứa function)
    interceptorLoadingElements(false)
    return response
  },
  (error) => {
    // Kỹ thuật chặn spam click (xem kỹ mô tả ở file formatters chứa function)
    interceptorLoadingElements(false)

    const originalRequests = error.config

    /** Quan trọng: Xử lý Refresh Token tự động */
    // Trường hợp 1: Nếu như nhận mã 401 từ BE, thì gọi api đăng xuất luôn (ngoại trừ khi đang ở endpoint login / register / logout)
    if (error.response?.status === 401 && !originalRequests?.url?.includes('/users/login') && !originalRequests?.url?.includes('/users/register') && !originalRequests?.url?.includes('/users/logout')) {
      axiosReduxStore.dispatch(logoutUserAPI(false))
    }

    // Trường hợp 2: Nếu như nhận mã 410 từ BE, thì sẽ gọi api refresh token để làm mới lại accessToken
    // Đầu tiên lấy được các request API đang bị lỗi thông qua error.config
    if (error.response?.status === 410 && !originalRequests._retry) {
      // Gán cờ _retry = true để tránh việc vô tình rơi vào vòng lặp vô hạn khi refresh token bị lỗi
      originalRequests._retry = true

      // kiểm tra nếu refreshTokenPromise chưa tồn tại thì mới tạo mới, còn nếu đã tồn tại thì sẽ dùng lại promise cũ
      if (!refreshTokenPromise) {
        const currentRefreshToken = axiosReduxStore?.getState()?.user?.currentUser?.refreshToken
        refreshTokenPromise = refreshTokenAPI(currentRefreshToken)
          .then((data) => {
            // Cập nhật accessToken mới vào Redux store
            if (data?.accessToken) {
              axiosReduxStore.dispatch(setAccessToken(data.accessToken))
            }
            // REFRESH TOKEN ROTATION: server cấp refreshToken mới, token cũ đã bị thu hồi
            // => phải lưu lại token mới, nếu không lần refresh sau sẽ dùng token cũ (đã revoke)
            // và kích hoạt theft detection khiến bị logout toàn bộ phiên
            if (data?.refreshToken) {
              axiosReduxStore.dispatch(setRefreshToken(data.refreshToken))
            }
            return data?.accessToken
          })
          .catch((_error) => {
            // Nếu refresh token bị lỗi, thì sẽ logout luôn
            axiosReduxStore.dispatch(logoutUserAPI(false))
            return Promise.reject(_error)
          })
          .finally(() => {
            // Sau khi refresh token xong xuôi thì gán lại refreshTokenPromise = null để lần sau có thể tạo mới promise khác
            refreshTokenPromise = null
          })
      }

      // Cần return trường hợp refreshTokenPromise chạy thành công và xử lý thêm ở đây:
      return refreshTokenPromise.then((accessToken) => {
        if (accessToken) {
          originalRequests.headers.Authorization = `Bearer ${accessToken}`
        }
        // Bước 2: Bước Quan trọng: Return lại axios instance của chúng ta kết hợp các originalRequests để gọi lại những api ban đầu bị lỗi
        return authorizedAxiosInstance(originalRequests)
      })
    }

    // Mọi mã http status code nằm ngoài khoảng 200 – 299 sẽ là error và rơi vào đây
    // Xử lý tập trung phần hiển thị thông báo lỗi trả về từ mọi API ở đây (viết code một lần: Clean Code)
    // console.log error ra là sẽ thấy cấu trúc data dẫn tới message lỗi như dưới đây
    let errorMessage = error?.message
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    }
    // Dùng toastify để hiển thị bất kể mọi mã lỗi lên màn hình - Ngoại trừ mã 410 - GONE phục vụ việc tự động refresh lại token.
    if (error.response?.status === 401) {
      // Khi bị 401 (phiên hết hạn hoặc user bị xóa/khóa trong DB), chỉ hiển thị duy nhất 1 toast thông báo bằng toastId cố định
      toast.error(errorMessage, { toastId: 'auth-unauthorized-error' })
    } else if (error.response?.status !== 410) {
      toast.error(errorMessage)
    }
    return Promise.reject(error)
  }
)

export default authorizedAxiosInstance
