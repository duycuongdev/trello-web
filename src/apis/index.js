import { API_ROOT } from '~/utils/constants'
import authorizedAxiosInstance from '~/utils/authorizeAxios'
import { toast } from 'react-toastify'

// update board
export const updateBoardDetailsAPI = async (boardId, updateData) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/boards/${boardId}`, updateData)
  return response.data
}

export const moveCardToDifferentColumnAPI = async (updateData) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/boards/supports/moving_card`, updateData)
  return response.data
}

// column
export const createNewColumnAPI = async (newColumnData) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/columns`, newColumnData)
  return response.data
}

export const updateColumnDetailsAPI = async (columnId, updateData) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/columns/${columnId}`, updateData)
  return response.data
}

export const deleteColumnDetailsAPI = async (columnId) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/columns/${columnId}`)
  return response.data
}

// card
export const createNewCardAPI = async (newCardData) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/cards`, newCardData)
  return response.data
}

/** Users */
export const registerUserAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/users/register`, data)
  return response.data
}

export const loginGoogleUserAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/users/google-login`, data)
  return response.data
}

export const verifyUserAPI = async (data) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/users/verify`, data)
  toast.success('Account verified successfully! Now you can login to enjoy our services!', {
    theme: 'colored',
    toastId: 'account-verified-success'
  })
  return response.data
}

// Quên mật khẩu: gửi email chứa link đặt lại (BE luôn trả về message chung để chống email enumeration)
export const forgotPasswordAPI = async (data) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/users/forgot_password`, data)
  return response.data
}

// Đặt lại mật khẩu bằng token từ email (server sẽ thu hồi mọi refresh token của user)
export const resetPasswordAPI = async (data) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/users/reset_password`, data)
  return response.data
}

export const refreshTokenAPI = async (refreshToken) => {
  const headers = {}
  if (refreshToken) {
    headers['x-refresh-token'] = refreshToken
  }
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/users/refresh_token`, { headers })
  return response.data
}

export const fetchCurrentUserAPI = async () => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/users/me`)
  return response.data
}

export const fetchBoardsAPI = async (searchPath) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/boards${searchPath}`)
  return response.data
}

export const createNewBoardAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/boards`, data)
  toast.success('Board created successfully')
  return response.data
}

export const deleteCardAPI = async (cardId) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/cards/${cardId}`)
  return response.data
}

export const copyCardAPI = async (cardId, copyData) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/cards/${cardId}/copy`, copyData)
  return response.data
}

export const updateCardDetailsAPI = async (cardId, updateData) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/cards/${cardId}`, updateData)
  return response.data
}

export const updateCardCommentAPI = async (cardId, commentId, updateData) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/cards/${cardId}/comments/${commentId}`, updateData)
  return response.data
}

export const deleteCardCommentAPI = async (cardId, commentId) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/cards/${cardId}/comments/${commentId}`)
  return response.data
}

export const addCardAttachmentAPI = async (cardId, formData, isChecklistOnly = false) => {
  const url = isChecklistOnly
    ? `${API_ROOT}/v1/cards/${cardId}/attachments?isChecklistOnly=true`
    : `${API_ROOT}/v1/cards/${cardId}/attachments`
  const response = await authorizedAxiosInstance.post(url, formData)
  return response.data
}

export const deleteCardAttachmentAPI = async (cardId, attachmentId) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/cards/${cardId}/attachments/${attachmentId}`)
  return response.data
}

export const inviteUserToBoardAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/invitations/board`, data)
  toast.success('User invited to board successfully!')
  return response.data
}

export const removeBoardMemberAPI = async (boardId, userId) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/boards/${boardId}/members/${userId}`)
  return response.data
}

/** Archived Items */
export const fetchArchivedItemsAPI = async (boardId) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/boards/${boardId}/archived_items`)
  return response.data
}

export const archiveCardAPI = async (cardId) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/cards/${cardId}/archive`)
  return response.data
}

export const restoreCardAPI = async (cardId) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/cards/${cardId}/restore`)
  return response.data
}

export const archiveColumnAPI = async (columnId) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/columns/${columnId}/archive`)
  return response.data
}

export const restoreColumnAPI = async (columnId) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/columns/${columnId}/restore`)
  return response.data
}

/** Board Lifecycle (Close, Reopen, Delete) */
export const closeBoardAPI = async (boardId) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/boards/${boardId}/close`)
  return response.data
}

export const reopenBoardAPI = async (boardId) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/boards/${boardId}/reopen`)
  return response.data
}

export const deleteBoardDetailsAPI = async (boardId) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/boards/${boardId}`)
  return response.data
}
