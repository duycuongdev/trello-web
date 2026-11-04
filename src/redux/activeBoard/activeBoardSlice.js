import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { API_ROOT } from '~/utils/constants'
import { generatePlaceholderCard } from '~/utils/formatter'
import isEmpty from 'lodash/isEmpty'
import { mapOrder } from '~/utils/sorts'
import authorizedAxiosInstance from '~/utils/authorizeAxios'

// Khởi tạo giá trị State của 1 cái slice trong redux
const initialState = {
  currentActiveBoard: null,
  isLoading: false,
  error: null,
  cardFilter: { search: '', labelIds: [], onlyMyCards: false, memberIds: [] }
}

// Gọi api (bất đồng bộ) và cập nhật dữ liệu vào redux, dùng middleware createAsyncThunk đi kèm với extraReducers
export const fetchBoardDetailsAPI = createAsyncThunk(
  'activeBoard/fetchBoardDetailsAPI',
  async (boardId) => {
    const reponse = await authorizedAxiosInstance.get(`${API_ROOT}/v1/boards/${boardId}`)
    return reponse.data
  }
)

export const activeBoardSlice = createSlice({
  name: 'activeBoard',
  initialState,
  // Reducer là nơi để xử lý dữ liệu đồng bộ
  reducers: {
    // luôn cần cặp ngoặc {} trong reducer dù code bên trong có 1 dòng vì đầy là rule của redux
    updateCurrentActiveBoard: (state, action) => {
      const incoming = action.payload
      if (!incoming) {
        state.currentActiveBoard = null
        return
      }
      // Nếu incoming board không chứa mảng columns nhưng state hiện tại đang có columns, giữ nguyên columns và FE_allUsers
      if (!incoming.columns && state.currentActiveBoard?.columns) {
        state.currentActiveBoard = {
          ...state.currentActiveBoard,
          ...incoming,
          columns: state.currentActiveBoard.columns,
          FE_allUsers: state.currentActiveBoard.FE_allUsers || incoming.FE_allUsers
        }
      } else {
        state.currentActiveBoard = incoming
      }
    },
    removeCardFromBoard: (state, action) => {
      const cardId = action.payload
      state.currentActiveBoard?.columns.forEach(column => {
        column.cards = column.cards.filter(card => card._id !== cardId)
        column.cardOrderIds = column.cardOrderIds.filter(id => id !== cardId)
        if (isEmpty(column.cards)) {
          const placeholderCard = generatePlaceholderCard(column)
          column.cards = [placeholderCard]
          column.cardOrderIds = [placeholderCard._id]
        }
      })
    },
    removeMemberFromBoard: (state, action) => {
      const memberId = action.payload?.toString()
      if (!state.currentActiveBoard || !memberId) return

      state.currentActiveBoard.memberIds = (state.currentActiveBoard.memberIds || [])
        .filter(id => id.toString() !== memberId)
      state.currentActiveBoard.members = (state.currentActiveBoard.members || [])
        .filter(member => member._id?.toString() !== memberId)
      state.currentActiveBoard.FE_allUsers = (state.currentActiveBoard.FE_allUsers || [])
        .filter(user => user._id?.toString() !== memberId)
    },
    updateCardInBoard: (state, action) => {
      // update nested data
      const incomingCard = action.payload
      if (!incomingCard?._id || !state.currentActiveBoard?.columns) return

      for (const column of state.currentActiveBoard.columns) {
        const cardIndex = column.cards?.findIndex(
          c => c._id?.toString() === incomingCard._id?.toString()
        )
        if (cardIndex !== -1 && cardIndex !== undefined) {
          column.cards[cardIndex] = {
            ...column.cards[cardIndex],
            ...incomingCard
          }
          break
        }
      }
    },
    setCardFilter: (state, action) => {
      state.cardFilter = { ...state.cardFilter, ...action.payload }
    },
    clearCardFilter: (state) => {
      state.cardFilter = { search: '', labelIds: [], onlyMyCards: false, memberIds: [] }
    }
  },

  // ExtraReducers: Nơi xử lý dữ liệu bất đồng bộ
  extraReducers: (builder) => {
    builder.addCase(fetchBoardDetailsAPI.pending, (state) => {
      state.isLoading = true
      state.error = null
      state.currentActiveBoard = null
    })
    builder.addCase(fetchBoardDetailsAPI.fulfilled, (state, action) => {
      state.isLoading = false
      state.error = null
      state.cardFilter = { search: '', labelIds: [] }
      // action.payload là reponse.data trả về từ api
      let board = action.payload

      // user include ownerIds and members
      board.FE_allUsers = board.owners.concat(board.members)

      // xử lý dữ liệu cần thiết
      // sắp xếp column xong đưa xuống component con
      board.columns = mapOrder(board.columns, board.columnOrderIds, '_id')

      board.columns.forEach(column => {
        // xử lý kéo thả khi column rỗng
        if (isEmpty(column.cards)) {
          column.cards = [generatePlaceholderCard(column)]
          column.cardOrderIds = [generatePlaceholderCard(column)._id]
        } else {
          // sắp xếp cards xong đưa xuống component con
          column.cards = mapOrder(column.cards, column.cardOrderIds, '_id')
        }
      })

      // update lại dữ liệu currentActiveBoard
      state.currentActiveBoard = board
    })
    builder.addCase(fetchBoardDetailsAPI.rejected, (state, action) => {
      state.isLoading = false
      state.currentActiveBoard = null
      state.error = action.error?.message || 'Unable to load board.'
    })
  }
})

// Action là nơi dành cho các component bên dưới gọi bằng dispatch() tới nó để cập nhật lại dữ liệu thông qua reducer(chạy đồng bộ)
// Ở trên không có properties action vì những cái action này sẽ được redux tạo tự động theo tên của reducer
export const {
  updateCurrentActiveBoard,
  updateCardInBoard,
  removeCardFromBoard,
  removeMemberFromBoard,
  setCardFilter,
  clearCardFilter
} = activeBoardSlice.actions

// selectors: các components bên dưới gọi bằng hook useSelector() để lấy dữ liệu trong kho redux store ra sử dụng
export const selectCurrentActiveBoard = (state) => {
  return state.activeBoard.currentActiveBoard
}

export const selectCardFilter = (state) => {
  return state.activeBoard.cardFilter || { search: '', labelIds: [], onlyMyCards: false, memberIds: [] }
}

// file này tên là activeBoardSlice nhưng export 1 thứ tên là reducer
export const activeBoardReducer = activeBoardSlice.reducer