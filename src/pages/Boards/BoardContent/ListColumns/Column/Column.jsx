// tạo cấu trúc "rfce"
import Box from '@mui/material/Box'
import { useState, memo } from 'react'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
// tooltip là dạng lable
import Tooltip from '@mui/material/Tooltip'
import AddcardIcon from '@mui/icons-material/AddCard'
import DragHandleIcon from '@mui/icons-material/DragHandle'
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined'
import ListCards from './ListCards/ListCards'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import TextField from '@mui/material/TextField'
import CloseIcon from '@mui/icons-material/Close'
import { toast } from 'react-toastify'
import { useConfirm } from 'material-ui-confirm'
import cloneDeep from 'lodash/cloneDeep'
import { updateCurrentActiveBoard, selectCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { useDispatch, useSelector } from 'react-redux'
import { createNewCardAPI, deleteColumnDetailsAPI, updateColumnDetailsAPI, archiveColumnAPI } from '~/apis/index'
import ToggleFocusInput from '~/components/Form/ToggleFocusInput'
import { emitBoardUpdate, BOARD_ACTION_TYPES } from '~/sockets/boardSocketClient'
import { useTranslation } from 'react-i18next'

// eslint-disable-next-line react-refresh/only-export-components -- export qua memo() là pattern chuẩn, plugin react-refresh 0.3.x không nhận diện
function Column({ column }) {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const board = useSelector(selectCurrentActiveBoard)
  const currentUser = useSelector(selectCurrentUser)

  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  // drag drop
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column._id,
    data: { ...column }
  })

  const dndKitColumnStyles = {
    // dành cho sensor defaut dạng pointerSensor
    // touchAction: 'none',
    // nếu sử dụng Transform sẽ bị stretch
    transform: CSS.Translate.toString(transform),
    transition,
    /*
    chiều cao phải luôn max 100% vì nếu không sẽ lỗi lúc kéo column ngắn qua 1 cái column dài thì phải kéo khu vựa giữa giữa . Lưu ý
    phải kết hợp với {listeners} nằm ở box chứ không phải ở div ngoài cùng để tránh trường hợp kéo vào vùng xanh
    */
    height: '100%',
    opacity: isDragging ? 0.5 : undefined
  }

  // cards đã được sắp xếp ở component cha cao nhất
  const orderedCards = column.cards

  const [openNewCardForm, setOpenNewCardForm] = useState(false)
  const toggleOpenNewCardForm = () => setOpenNewCardForm(!openNewCardForm)

  const [newCardTitle, setNewCardTitle] = useState('')
  const addNewCard = async () => {
    if (!newCardTitle) {
      toast.error('Please enter Card title', { position: 'top-right' })
      return
    }

    // gọi api
    const newCardData = {
      title: newCardTitle,
      columnId: column._id
    }

    const createdCard = await createNewCardAPI({
      ...newCardData,
      boardId: board._id
    })

    // cập nhật state board
    const newBoard = cloneDeep(board)
    const columnToUpdate = newBoard.columns.find(column => column._id === createdCard.columnId)
    if (columnToUpdate) {
      if (columnToUpdate.cards.some(card => card.FE_PlaceholderCard)) {
        columnToUpdate.cards = [createdCard]
        columnToUpdate.cardOrderIds = [createdCard._id]
      } else {
        columnToUpdate.cards.push(createdCard)
        columnToUpdate.cardOrderIds.push(createdCard._id)
      }
    }
    dispatch(updateCurrentActiveBoard(newBoard))

    // Bắn socket realtime tới các client khác
    emitBoardUpdate({
      boardId: board._id,
      actionType: BOARD_ACTION_TYPES.CREATE_CARD,
      payload: createdCard,
      currentUser
    })

    // đóng trang thái thêm Card mới và clear input
    toggleOpenNewCardForm()
    setNewCardTitle('')
  }

  // xử lý xóa 1 column và card bên trong nó
  const confirmDeleteColumn = useConfirm()
  const handleDeleteColumn = () => {
    confirmDeleteColumn({
      title: t('column.deleteColumnTitle'),
      description: 'This action will permanent delete your Column and its Cards! Are you sure ?',
      confirmationText: 'Confirm',
      cancellationText: 'Cancel'
    }).then(() => {
      // update cho chuẩn dữ liệu state board
      const newBoard = { ...board }
      newBoard.columns = newBoard.columns.filter(c => c._id !== column._id)
      newBoard.columnOrderIds = newBoard.columnOrderIds.filter(_id => _id !== column._id)
      dispatch(updateCurrentActiveBoard(newBoard))

      emitBoardUpdate({
        boardId: board._id,
        actionType: BOARD_ACTION_TYPES.DELETE_COLUMN,
        payload: { columnId: column._id },
        currentUser
      })

      // gọi API xử lý phía BE
      deleteColumnDetailsAPI(column._id).then(res => {
        toast.success(res?.deleteResult, { position: 'top-center' })
      })
    }).catch(() => { })
  }

  const handleArchiveColumn = () => {
    confirmDeleteColumn({
      title: t('column.archiveColumnTitle'),
      description: t('column.archiveColumnDesc'),
      confirmationText: t('cardModal.archive'),
      cancellationText: 'Cancel'
    }).then(async () => {
      try {
        await archiveColumnAPI(column._id)

        const newBoard = cloneDeep(board)
        newBoard.columns = newBoard.columns.filter(c => c._id !== column._id)
        newBoard.columnOrderIds = newBoard.columnOrderIds.filter(_id => _id !== column._id)
        dispatch(updateCurrentActiveBoard(newBoard))

        emitBoardUpdate({
          boardId: board._id,
          actionType: BOARD_ACTION_TYPES.ARCHIVE_COLUMN,
          payload: { columnId: column._id },
          currentUser
        })

        toast.success('Column archived!')
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to archive column')
      }
    }).catch(() => {})
  }

  const onUpdateColumnTitle = (newTitle) => {
    updateColumnDetailsAPI(column._id, { title: newTitle }).then(() => {
      const newBoard = cloneDeep(board)
      const columnToUpdate = newBoard.columns.find(c => c._id === column._id)
      if (columnToUpdate) {
        columnToUpdate.title = newTitle
      }
      dispatch(updateCurrentActiveBoard(newBoard))

      emitBoardUpdate({
        boardId: board._id,
        actionType: BOARD_ACTION_TYPES.UPDATE_COLUMN,
        payload: { columnId: column._id, title: newTitle },
        currentUser
      })
    })
  }

  return (
    // phải bọc div ở đây vì chiều cao của column khi kéo thả sẽ có bug Flickering
    <div ref={setNodeRef} style={dndKitColumnStyles} {...attributes} >
      < Box
        {...listeners}
        sx={{
          minWidth: '300px',
          maxWidth: '300px',
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#333643' : '#ebecf0'),
          // margin left
          ml: 2,
          borderRadius: '6px',
          height: 'fit-content',
          maxHeight: (theme) => `calc(${theme.trello.boardContentHeight} - ${theme.spacing(5)})`
        }
        }>
        {/* header */}
        < Box sx={{
          height: (theme) => (theme.trello.columnHeaderHeight),
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <ToggleFocusInput
            value={column?.title}
            onChangedValue={onUpdateColumnTitle}
            data-no-dnd="true"
          />

          {/* prop down */}
          <Box>
            <Tooltip title='More options'>
              <ExpandMoreIcon
                sx={{
                  color: 'text.primary',
                  cursor: 'pointer'
                }}
                id="basic-column-propdown"
                aria-controls={open ? 'basic-menu-column-propdown' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
              />
            </Tooltip>
            <Menu
              id="basic-menu-column-propdown"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              onClick={handleClose}
              MenuListProps={{
                'aria-labelledby': 'basic-column-propdown'
              }}
            >
              <MenuItem onClick={toggleOpenNewCardForm} sx={{
                '&:hover': { color: 'success.light' },
                '&:hover .add-card-icon': { color: 'success.light' }
              }}>
                <ListItemIcon><AddcardIcon className='add-card-icon' fontSize="small" /></ListItemIcon>
                <ListItemText>Add new card</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleDeleteColumn} sx={{
                '&:hover': { color: 'warning.dark' },
                '&:hover .delete-forever-icon': { color: 'warning.dark' }
              }}>
                <ListItemIcon><DeleteForeverIcon className='delete-forever-icon' fontSize="small" /></ListItemIcon>
                <ListItemText>{t('column.deleteThisColumn')}</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleArchiveColumn} sx={{
                '&:hover': { color: 'warning.light' },
                '&:hover .archive-icon': { color: 'warning.light' }
              }}>
                <ListItemIcon><ArchiveOutlinedIcon className='archive-icon' fontSize="small" /></ListItemIcon>
                <ListItemText>Archive this column</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Box >
        {/* list card */}
        <ListCards cards={orderedCards} />
        {/* footer */}
        < Box sx={{
          height: (theme) => (theme.trello.columnFooterHeight),
          p: 2
        }}>
          {!openNewCardForm
            ? <Box sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Button startIcon={<AddcardIcon />} onClick={toggleOpenNewCardForm}>Add new card</Button>
              <Tooltip title='Drag to move'>
                <DragHandleIcon sx={{ cursor: 'pointer' }} />
              </Tooltip>
            </Box>
            : <Box sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <TextField
                label={t('board.enterCardTitle')}
                type="text"
                size='small'
                variant='outlined'
                autoFocus
                data-no-dnd="true"
                // thay đổi value
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                sx={{
                  '& label': { color: 'text.primary' },
                  '& input': {
                    color: (theme) => theme.palette.primary.main,
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#333643' : 'white')
                  },
                  '& label.Mui-focused': { color: (theme) => theme.palette.primary.main },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: (theme) => theme.palette.primary.main },
                    '&:hover fieldset': { borderColor: (theme) => theme.palette.primary.main },
                    '&.Mui-focused fieldset': { borderColor: (theme) => theme.palette.primary.main }
                  },
                  '& .MuiOutlinedInput-input': {
                    borderRadius: 1
                  }
                }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  className='interceptor-loading'
                  onClick={addNewCard}
                  variant='contained' color='success' size='small'
                  sx={{
                    boxShadow: 'none',
                    border: '0.5px solid',
                    borderColor: (theme) => theme.palette.success.main,
                    '&:hover': { bgcolor: (theme) => theme.palette.success.main }
                  }}
                >Add</Button>
                <CloseIcon
                  fontSize='small'
                  sx={{
                    color: (theme) => theme.palette.warning.light,
                    cursor: 'pointer'
                  }}
                  // xóa value
                  onClick={toggleOpenNewCardForm}
                />
              </Box>
            </Box>
          }
        </Box >
      </Box >
    </div >
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- export qua memo() là pattern chuẩn, plugin react-refresh 0.3.x không nhận diện
export default memo(Column)
