// config Socket.IO client
import { io } from 'socket.io-client'
import { API_ROOT } from '~/utils/constants'
import { store } from '~/redux/store'

export const socketIoInstance = io(API_ROOT, {
  withCredentials: true,
  transports: ['websocket', 'polling'],
  // Đính kèm accessToken (Bearer) vào mỗi lần handshake/reconnect
  // để server xác thực socket (auth là function nên luôn đọc token mới nhất từ Redux)
  // Song song với cơ chế cookie httpOnly: bên nào có dữ liệu thì server dùng bên đó
  auth: (cb) => {
    const token = store.getState()?.user?.currentUser?.accessToken
    cb(token ? { token } : {})
  }
})
