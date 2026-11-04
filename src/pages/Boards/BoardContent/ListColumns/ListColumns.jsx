// tạo cấu trúc "rfce"
import Box from '@mui/material/Box'
import Column from './Column/Column'
import Button from '@mui/material/Button'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { useState } from 'react'
import TextField from '@mui/material/TextField'
import CloseIcon from '@mui/icons-material/Close'
import { toast } from 'react-toastify'
import { createNewColumnAPI } from '~/apis'
import cloneDeep from 'lodash/cloneDeep'
import { generatePlaceholderCard } from '~/utils/formatter'
import { updateCurrentActiveBoard, selectCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { useDispatch, useSelector } from 'react-redux'
import { emitBoardUpdate, BOARD_ACTION_TYPES } from '~/sockets/boardSocketClient'

function ListColumns({ columns = [] }) {
  const dispatch = useDispatch()
  const board = useSelector(selectCurrentActiveBoard)
  const currentUser = useSelector(selectCurrentUser)

  const [openNewColumnForm, setOpenNewColumnForm] = useState(false)
  const toggleOpenNewColumnForm = () => setOpenNewColumnForm(!openNewColumnForm)

  const [newColumnTitle, setNewColumnTitle] = useState('')
  const addNewColumn = async () => {
    if (!newColumnTitle.trim()) {
      toast.error('Please enter column title')
      return
    }

    if (newColumnTitle.trim().length < 3) {
      toast.error('Column title must be at least 3 characters long')
      return
    }

    const newColumnData = { title: newColumnTitle.trim() }
    try {
      const createdColumn = await createNewColumnAPI({ ...newColumnData, boardId: board._id })
      const placeholderCard = generatePlaceholderCard(createdColumn)
      createdColumn.cards = [placeholderCard]
      createdColumn.cardOrderIds = [placeholderCard._id]
      const newBoard = cloneDeep(board)
      newBoard.columns.push(createdColumn)
      newBoard.columnOrderIds.push(createdColumn._id)
      dispatch(updateCurrentActiveBoard(newBoard))

      // Gửi sự kiện realtime tới các client khác
      emitBoardUpdate({
        boardId: board._id,
        actionType: BOARD_ACTION_TYPES.CREATE_COLUMN,
        payload: createdColumn,
        currentUser
      })

      toggleOpenNewColumnForm()
      setNewColumnTitle('')
    } catch (_error) {
      // authorizedAxios interceptor already displays error toasts for API errors, preventing duplicate notifications
    }
  }

  /*
    SorttableContext yêu cầu items là 1 mảng dạng ['id-01', 'id-02'] chứ không phải [{id: 'id-1'}, {id: 'id-2'}]
    nếu không đúng vẫn kéo thả được nhưng không có animation
  */
  return (
    <SortableContext items={(columns || []).map(c => c._id)} strategy={horizontalListSortingStrategy}>
      <Box sx={{
        bgcolor: 'inherit',
        width: '100%',
        height: '100%',
        display: 'flex',
        overflowX: 'auto',
        overflowY: 'hidden',
        // thanh scroll thẳng với list card
        '&::-webkit-scrollbar-track': { m: 2 }
      }}>
        {(columns || []).map(column => <Column key={column._id} column={column} />)}

        {/* add new column */}
        {!openNewColumnForm
          ? <Box onClick={toggleOpenNewColumnForm} sx={{
            minWidth: '250px',
            maxWidth: '250px',
            mx: 2,
            borderRadius: '6px',
            height: 'fit-content',
            bgcolor: '#ffffff3d'
          }}>
            <Button
              startIcon={<NoteAddIcon />}
              sx={{
                color: 'white',
                width: '100%',
                justifyContent: 'flex-start',
                pl: 2.5,
                py: 1
              }}
            >
              Add new column
            </Button>
          </Box>
          : <Box sx={{
            minWidth: '250px',
            maxWidth: '250px',
            mx: 2,
            p: 1,
            borderRadius: '6px',
            height: 'fit-content',
            bgcolor: '#ffffff3d',
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}>
            <TextField
              label="Enter column title ..."
              type="text"
              size='small'
              variant='outlined'
              autoFocus
              // thay đổi value
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              sx={{
                '& label': { color: 'white' },
                '& input': { color: 'white' },
                '& label.Mui-focused': { color: 'white' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'white' },
                  '&:hover fieldset': { borderColor: 'white' },
                  '&.Mui-focused fieldset': { borderColor: 'white' }
                }
              }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                className='interceptor-loading'
                onClick={addNewColumn}
                variant='contained' color='success' size='small'
                sx={{
                  boxShadow: 'none',
                  border: '0.5px solid',
                  borderColor: (theme) => theme.palette.success.main,
                  '&:hover': { bgcolor: (theme) => theme.palette.success.main }
                }}
              >Add Column</Button>
              <CloseIcon
                fontSize='small'
                sx={{
                  color: 'white',
                  cursor: 'pointer',
                  '&:hover': { color: (theme) => theme.palette.warning.light }
                }}
                // xóa value
                onClick={toggleOpenNewColumnForm}
              />
            </Box>
          </Box>
        }

      </Box>
    </SortableContext>
  )
}

export default ListColumns
