import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { API_ROOT } from '~/utils/constants'
import authorizedAxiosInstance from '~/utils/authorizeAxios'
import { toast } from 'react-toastify'
import i18n from '~/i18n'

const initialState = {
  currentUser: null
}

export const loginUserApi = createAsyncThunk(
  'user/loginUserApi',
  async (data) => {
    const reponse = await authorizedAxiosInstance.post(`${API_ROOT}/v1/users/login`, data)
    return reponse.data
  }
)

export const loginGoogleUserAPI = createAsyncThunk(
  'user/loginGoogleUserAPI',
  async (data) => {
    const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/users/google-login`, data)
    return response.data
  }
)

// Đăng nhập nhanh dành cho khách (nút "Try as Guest" ở trang Login)
export const loginGuestUserAPI = createAsyncThunk(
  'user/loginGuestUserAPI',
  async () => {
    const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/users/guest_login`)
    return response.data
  }
)

export const fetchCurrentUserAPI = createAsyncThunk(
  'user/fetchCurrentUserAPI',
  async () => {
    const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/users/me`)
    return response.data
  }
)

export const logoutUserAPI = createAsyncThunk(
  'user/logoutUserAPI',
  async (showSuccessMessage = true) => {
    let responseData = {}
    try {
      const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/users/logout`)
      responseData = response.data
    } catch (_error) {
      // Dù API logout có bị lỗi mạng hay gì đi chăng nữa, thì client vẫn phải logout thành công
    }
    if (showSuccessMessage) {
      toast.success(i18n.t('profileMenu.logoutSuccess'))
    }
    return responseData
  }
)

export const updateUserAPI = createAsyncThunk(
  'user/updateUserAPI',
  async (data) => {
    const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/users/update`, data)
    return response.data
  }
)

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setAccessToken: (state, action) => {
      if (state.currentUser) {
        state.currentUser.accessToken = action.payload
      }
    },
    // REFRESH TOKEN ROTATION: server cấp refreshToken mới mỗi lần refresh,
    // phải lưu lại thay thế token cũ (token cũ đã bị thu hồi ở server)
    setRefreshToken: (state, action) => {
      if (state.currentUser) {
        state.currentUser.refreshToken = action.payload
      }
    }
  },

  extraReducers: (builder) => {
    builder.addCase(loginUserApi.fulfilled, (state, action) => {
      const user = action.payload
      state.currentUser = user
    })
    builder.addCase(loginGoogleUserAPI.fulfilled, (state, action) => {
      const user = action.payload
      state.currentUser = user
    })
    builder.addCase(loginGuestUserAPI.fulfilled, (state, action) => {
      const user = action.payload
      state.currentUser = user
    })
    builder.addCase(fetchCurrentUserAPI.fulfilled, (state, action) => {
      const user = action.payload
      // Bảo toàn token trong state nếu API /me chỉ trả về user info
      state.currentUser = {
        ...state.currentUser,
        ...user
      }
    })
    builder.addCase(logoutUserAPI.fulfilled, (state) => {
      /**
       * API logout sau khi gọi thành công thì sẽ clear thông tin currentUser về null ở đây
       * Kết hợp ProtectedRoute đã làm ở App.js => code sẽ điều hướng chuẩn về trang Login
       */
      state.currentUser = null
    })
    builder.addCase(logoutUserAPI.rejected, (state) => {
      state.currentUser = null
    })
    builder.addCase(updateUserAPI.fulfilled, (state, action) => {
      const user = action.payload
      state.currentUser = {
        ...state.currentUser,
        ...user
      }
    })
  }
})

export const { setAccessToken, setRefreshToken } = userSlice.actions

export const selectCurrentUser = (state) => {
  return state.user.currentUser
}

export const userReducer = userSlice.reducer