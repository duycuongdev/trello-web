// Board Details
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import AppBar from '~/components/AppBar/AppBar'
import BoardBar from './BoardBar/Boardbar'
import BoardContent from './BoardContent/BoardContent'
import { useEffect, useState, useRef } from 'react'
import {
  updateBoardDetailsAPI,
  updateColumnDetailsAPI,
  moveCardToDifferentColumnAPI,
  reopenBoardAPI,
  deleteBoardDetailsAPI
} from '~/apis'
import {
  fetchBoardDetailsAPI,
  updateCurrentActiveBoard,
  selectCurrentActiveBoard,
  updateCardInBoard,
  removeCardFromBoard
} from '~/redux/activeBoard/activeBoardSlice'
import {
  selectCurrentActiveCard,
  updateCurrentActiveCard,
  clearAndHideCurrentActiveCard,
  showModalActiveCard
} from '~/redux/activeCard/activeCardSlice'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { useDispatch, useSelector } from 'react-redux'
import cloneDeep from 'lodash/cloneDeep'
import { useParams, useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom'
import { slugify } from '~/utils/formatter'
import { useTranslation } from 'react-i18next'
import PageLoadingSpinner from '~/components/Loading/PageLoadingSpinner'
import ActiveCard from '~/components/Modal/ActiveCard/ActiveCard'
import { useConfirm } from 'material-ui-confirm'
import { toast } from 'react-toastify'
import FolderOffOutlinedIcon from '@mui/icons-material/FolderOffOutlined'
import UndoIcon from '@mui/icons-material/Undo'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { socketIoInstance } from '~/socketClient'
import { fetchInvitationsAPI } from '~/redux/notifications/notificationsSlice'
import {
  joinBoardRoom,
  leaveBoardRoom,
  emitBoardUpdate,
  BOARD_ACTION_TYPES
} from '~/sockets/boardSocketClient'

function Board() {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const confirm = useConfirm()
  const navigate = useNavigate()
  const currentUser = useSelector(selectCurrentUser)
  const board = useSelector(selectCurrentActiveBoard)
  const activeCard = useSelector(selectCurrentActiveCard)
  const boardLoading = useSelector(state => state.activeBoard.isLoading)
  const boardError = useSelector(state => state.activeBoard.error)

  const [onlineUsers, setOnlineUsers] = useState([])

  const { boardId, slug } = useParams()
  const location = useLocation()

  // Dùng ref để giữ giá trị mới nhất mà không gây re-subscribe socket listener
  const boardRef = useRef(board)
  useEffect(() => {
    boardRef.current = board
  }, [board])

  const activeCardRef = useRef(activeCard)
  useEffect(() => {
    activeCardRef.current = activeCard
  }, [activeCard])

  useEffect(() => {
    dispatch(fetchBoardDetailsAPI(boardId))
  }, [dispatch, boardId])

  // Đồng bộ Slug trên URL: nếu URL chưa có slug hoặc slug bị lệch so với slug chuẩn của board
  useEffect(() => {
    if (board?._id && board._id === boardId) {
      const currentSlug = board.slug || slugify(board.title)
      if (currentSlug && slug !== currentSlug) {
        navigate(`/boards/${boardId}/${currentSlug}${location.search}`, { replace: true })
      }
    }
  }, [board?._id, board?.slug, board?.title, boardId, slug, location.search, navigate])

  const [searchParams, setSearchParams] = useSearchParams()
  const targetCardId = searchParams.get('cardId')

  // Tự động mở modal chi tiết thẻ khi có param cardId từ thông báo Deadline
  useEffect(() => {
    if (board && targetCardId && activeCard?._id !== targetCardId) {
      for (const column of (board.columns || [])) {
        const foundCard = (column.cards || []).find(c => c._id === targetCardId)
        if (foundCard) {
          dispatch(updateCurrentActiveCard(foundCard))
          dispatch(showModalActiveCard())
          // Giữ nguyên param cardId trên URL để hỗ trợ chia sẻ link và F5 reload


          break
        }
      }
    }
  }, [board, targetCardId, activeCard?._id, dispatch])

  // Khi URL không còn cardId (ví dụ bấm nút Back của trình duyệt) mà modal đang mở -> đóng modal
  useEffect(() => {
    if (!targetCardId && activeCard) {
      dispatch(clearAndHideCurrentActiveCard())
    }
  }, [targetCardId, activeCard, dispatch])

  // Lắng nghe và quản lý Socket.io Real-time
  useEffect(() => {
    if (!boardId) return

    // Tham gia phòng Socket của bảng
    joinBoardRoom(boardId, currentUser)

    const onConnect = () => {
      joinBoardRoom(boardId, currentUser)
    }
    socketIoInstance.on('connect', onConnect)

    // Nhận danh sách người dùng đang cùng xem bảng
    const onReceiveOnlineUsers = (users) => {
      setOnlineUsers(users || [])
    }
    socketIoInstance.on('BE_BOARD_USERS_ONLINE', onReceiveOnlineUsers)

    // Nhận cập nhật thời gian thực từ các thành viên khác
    const onReceiveBoardUpdated = (data) => {
      if (!data || data.boardId !== boardId) return

      const { actionType, payload, senderName } = data
      const currentBoard = boardRef.current

      switch (actionType) {
      case BOARD_ACTION_TYPES.MOVE_COLUMN: {
        if (payload?.columns && payload?.columnOrderIds && currentBoard) {
          dispatch(updateCurrentActiveBoard({
            ...currentBoard,
            columns: payload.columns,
            columnOrderIds: payload.columnOrderIds
          }))
        }
        break
      }
      case BOARD_ACTION_TYPES.MOVE_CARD_SAME_COLUMN: {
        if (payload?.columnId && currentBoard?.columns) {
          // Structural update: chỉ thay column liên quan, giữ reference cho phần còn lại
          const nextBoard = {
            ...currentBoard,
            columns: currentBoard.columns.map(c => c._id === payload.columnId
              ? { ...c, cards: payload.cards, cardOrderIds: payload.cardOrderIds }
              : c)
          }
          dispatch(updateCurrentActiveBoard(nextBoard))
        }
        break
      }
      case BOARD_ACTION_TYPES.MOVE_CARD_DIFF_COLUMN: {
        if (payload?.dndOrderedColumns && currentBoard?.columns) {
          const nextBoard = cloneDeep(currentBoard)
          nextBoard.columns = payload.dndOrderedColumns
          nextBoard.columnOrderIds = payload.dndOrderedColumns.map(c => c._id)
          dispatch(updateCurrentActiveBoard(nextBoard))
        }
        break
      }
      case BOARD_ACTION_TYPES.CREATE_COLUMN: {
        if (payload?._id && currentBoard?.columns) {
          const nextBoard = cloneDeep(currentBoard)
          if (!nextBoard.columns.some(c => c._id === payload._id)) {
            nextBoard.columns.push(payload)
            nextBoard.columnOrderIds.push(payload._id)
            dispatch(updateCurrentActiveBoard(nextBoard))
            if (senderName) {
              toast.info(t('board.addedColumn', { name: senderName, title: payload.title }), { autoClose: 2500, position: 'bottom-right' })
            }
          }
        }
        break
      }
      case BOARD_ACTION_TYPES.UPDATE_COLUMN: {
        if (payload?.columnId && currentBoard?.columns) {
          const nextBoard = cloneDeep(currentBoard)
          const col = nextBoard.columns.find(c => c._id === payload.columnId)
          if (col) {
            col.title = payload.title
            boardRef.current = nextBoard
            dispatch(updateCurrentActiveBoard(nextBoard))
          }
        }
        break
      }
      case BOARD_ACTION_TYPES.DELETE_COLUMN:
      case BOARD_ACTION_TYPES.ARCHIVE_COLUMN: {
        if (payload?.columnId && currentBoard?.columns) {
          const nextBoard = cloneDeep(currentBoard)
          nextBoard.columns = (nextBoard.columns || []).filter(c => c._id !== payload.columnId)
          nextBoard.columnOrderIds = (nextBoard.columnOrderIds || []).filter(id => id !== payload.columnId)
          dispatch(updateCurrentActiveBoard(nextBoard))
        }
        break
      }
      case BOARD_ACTION_TYPES.CREATE_CARD: {
        if (payload?._id && payload?.columnId && currentBoard?.columns) {
          const nextBoard = cloneDeep(currentBoard)
          const col = nextBoard.columns.find(c => c._id === payload.columnId)
          if (col) {
            if (col.cards.some(c => c.FE_PlaceholderCard)) {
              col.cards = [payload]
              col.cardOrderIds = [payload._id]
            } else if (!col.cards.some(c => c._id === payload._id)) {
              col.cards.push(payload)
              col.cardOrderIds.push(payload._id)
            }
            dispatch(updateCurrentActiveBoard(nextBoard))
            if (senderName) {
              toast.info(t('board.addedCard', { name: senderName, title: payload.title }), { autoClose: 2500, position: 'bottom-right' })
            }
          }
        }
        break
      }
      case BOARD_ACTION_TYPES.UPDATE_CARD: {
        if (payload?._id) {
          dispatch(updateCardInBoard(payload))
          // Nếu người dùng đang mở xem chi tiết chính thẻ này, cập nhật modal luôn
          if (activeCardRef.current?._id?.toString() === payload._id?.toString()) {
            dispatch(updateCurrentActiveCard(payload))
          }
          dispatch(fetchInvitationsAPI())
        }
        break
      }
      case BOARD_ACTION_TYPES.DELETE_CARD:
      case BOARD_ACTION_TYPES.ARCHIVE_CARD: {
        if (payload?.cardId) {
          dispatch(removeCardFromBoard(payload.cardId))
          if (activeCardRef.current?._id === payload.cardId) {
            dispatch(clearAndHideCurrentActiveCard())
            setSearchParams(prev => {
              const next = new URLSearchParams(prev)
              next.delete('cardId')
              return next
            }, { replace: true })
            toast.info(t('board.cardRemovedByTeammate'), { position: 'bottom-right' })
          }
        }
        break
      }
      case BOARD_ACTION_TYPES.RESTORE_CARD: {
        if (payload?._id && payload?.columnId && currentBoard?.columns) {
          const nextBoard = cloneDeep(currentBoard)
          let col = nextBoard.columns.find(c => c._id === payload.columnId) || nextBoard.columns[0]
          if (col) {
            col.cards = (col.cards || []).filter(c => !c.FE_PlaceholderCard)
            col.cardOrderIds = (col.cardOrderIds || []).filter(id => !id.includes('placeholder-card'))
            if (!col.cards.some(c => c._id === payload._id)) {
              col.cards.push(payload)
              col.cardOrderIds.push(payload._id)
            }
            dispatch(updateCurrentActiveBoard(nextBoard))
          }
        }
        break
      }
      case BOARD_ACTION_TYPES.UPDATE_BOARD: {
        if (payload && currentBoard) {
          dispatch(updateCurrentActiveBoard({
            ...currentBoard,
            ...payload,
            columns: currentBoard.columns,
            FE_allUsers: currentBoard.FE_allUsers
          }))
        }
        break
      }
      default:
        break
      }
    }
    socketIoInstance.on('BE_BOARD_UPDATED', onReceiveBoardUpdated)

    // Bị xóa khỏi board (kick real-time): rời phòng + điều hướng về danh sách bảng
    const onRemovedFromBoard = (payload) => {
      if (!payload?.boardId || payload.boardId !== boardId) return
      leaveBoardRoom(boardId)
      toast.info(t('board.youWereRemoved'), { position: 'bottom-right' })
      navigate('/boards')
    }
    socketIoInstance.on('BE_BOARD_MEMBER_REMOVED', onRemovedFromBoard)

    return () => {
      leaveBoardRoom(boardId)
      socketIoInstance.off('connect', onConnect)
      socketIoInstance.off('BE_BOARD_USERS_ONLINE', onReceiveOnlineUsers)
      socketIoInstance.off('BE_BOARD_UPDATED', onReceiveBoardUpdated)
      socketIoInstance.off('BE_BOARD_MEMBER_REMOVED', onRemovedFromBoard)
    }
  }, [boardId, currentUser, dispatch, setSearchParams, t, navigate])

  const moveColumns = (dndOrderedColumns) => {
    const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnsIds
    dispatch(updateCurrentActiveBoard(newBoard))

    emitBoardUpdate({
      boardId: newBoard._id,
      actionType: BOARD_ACTION_TYPES.MOVE_COLUMN,
      payload: {
        columns: dndOrderedColumns,
        columnOrderIds: dndOrderedColumnsIds
      },
      currentUser
    })

    updateBoardDetailsAPI(newBoard._id, { columnOrderIds: dndOrderedColumnsIds })
      .catch(() => {
        dispatch(updateCurrentActiveBoard(board))
      })
  }

  const moveCardInTheSameColumn = (dndOrderedCards, dndOrderedCardsIds, columnId) => {
    // Structural update: chỉ thay column bị đổi, giữ reference các column/card khác
    // để React.memo ở Column/Card bỏ qua re-render (không cloneDeep cả board)
    const newBoard = {
      ...board,
      columns: board.columns.map(column => column._id === columnId
        ? { ...column, cards: dndOrderedCards, cardOrderIds: dndOrderedCardsIds }
        : column)
    }
    dispatch(updateCurrentActiveBoard(newBoard))

    emitBoardUpdate({
      boardId: newBoard._id,
      actionType: BOARD_ACTION_TYPES.MOVE_CARD_SAME_COLUMN,
      payload: {
        columnId,
        cards: dndOrderedCards,
        cardOrderIds: dndOrderedCardsIds
      },
      currentUser
    })

    updateColumnDetailsAPI(columnId, { cardOrderIds: dndOrderedCardsIds })
      .catch(() => {
        dispatch(updateCurrentActiveBoard(board))
      })
  }

  const moveCardToDifferentColumn = (currentCardId, prevColumnId, nextColumnId, dndOrderedColumns) => {
    const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnsIds
    dispatch(updateCurrentActiveBoard(newBoard))

    emitBoardUpdate({
      boardId: newBoard._id,
      actionType: BOARD_ACTION_TYPES.MOVE_CARD_DIFF_COLUMN,
      payload: {
        currentCardId,
        prevColumnId,
        nextColumnId,
        dndOrderedColumns
      },
      currentUser
    })

    let prevCardOrderIds = dndOrderedColumns.find(c => c._id === prevColumnId)?.cardOrderIds || []
    if (prevCardOrderIds[0]?.includes('placeholder-card')) prevCardOrderIds = []

    moveCardToDifferentColumnAPI({
      currentCardId,
      prevColumnId,
      prevCardOrderIds,
      nextColumnId,
      nextCardOrderIds: dndOrderedColumns.find(c => c._id === nextColumnId)?.cardOrderIds || []
    }).catch(() => {
      dispatch(updateCurrentActiveBoard(board))
    })
  }

  if (boardLoading || (!board && !boardError)) {
    return <PageLoadingSpinner caption={t('board.loadingBoard')} />
  }

  if (boardError) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, p: 3 }}>
        <Typography color="error">{t('board.unableToLoad')}</Typography>
        <Button variant="contained" onClick={() => dispatch(fetchBoardDetailsAPI(boardId))}>{t('common.retry')}</Button>
      </Box>
    )
  }

  // Màn hình khi Bảng đã bị đóng (Closed Board)
  if (board?._destroy) {
    const isOwner = (board?.ownerIds || []).some(id => id.toString() === currentUser?._id?.toString())

    const handleReopen = async () => {
      try {
        await reopenBoardAPI(boardId)
        toast.success(t('boards.reopened'))
        dispatch(fetchBoardDetailsAPI(boardId))
      } catch (error) {
        toast.error(error?.response?.data?.message || t('boards.reopenFailed'))
      }
    }

    const handleDeletePermanently = () => {
      confirm({
        title: t('boards.deleteConfirmTitle'),
        description: t('boards.deleteConfirmDescription', { title: board.title }),
        confirmationText: t('boards.deletePermanently'),
        cancellationText: t('common.cancel')
      }).then(async () => {
        try {
          await deleteBoardDetailsAPI(boardId)
          toast.success(t('boards.permanentlyDeleted'))
          navigate('/boards')
        } catch (error) {
          toast.error(error?.response?.data?.message || t('boards.deleteFailed'))
        }
      }).catch(() => {})
    }

    return (
      <Container disableGutters maxWidth={false} sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppBar />
        <Box sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          textAlign: 'center'
        }}>
          <FolderOffOutlinedIcon sx={{ fontSize: 72, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
            {t('board.closedBoardTitle', { title: board.title })}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 480, mb: 3 }}>
            {t('board.closedBoardDescription')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            {isOwner ? (
              <>
                <Button
                  variant="contained"
                  startIcon={<UndoIcon />}
                  onClick={handleReopen}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  {t('board.reopenBoard')}
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteOutlineIcon />}
                  onClick={handleDeletePermanently}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  {t('board.deleteBoardPermanently')}
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                startIcon={<ArrowBackIcon />}
                component={Link}
                to="/boards"
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                {t('board.goToMyBoards')}
              </Button>
            )}
          </Box>
        </Box>
      </Container>
    )
  }

  return (
    <Container
      disableGutters
      maxWidth={false}
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        // Gradient/màu đặc: áp trực tiếp bằng shorthand `background` (bgcolor = background-color
        // sẽ INVALID với chuỗi linear-gradient dài -> gradient không bao giờ được áp dụng).
        // Ảnh http: vẽ bằng layer fixed riêng bên dưới, Container chỉ giữ màu dự phòng.
        background: board?.background?.startsWith('http')
          ? (theme) => (theme.palette.mode === 'dark' ? '#0f172a' : '#0052cc')
          : (board?.background || ((theme) => (theme.palette.mode === 'dark' ? '#0f172a' : '#0052cc'))),
        transition: 'background 0.3s ease'
      }}
    >
      {/* Ảnh nền board vẽ bằng layer position:fixed riêng.
          KHÔNG dùng background-attachment: fixed trên Container vì iOS Safari/PWA bỏ qua nó,
          khiến ảnh không vẽ đằng sau AppBar/BoardBar (2 dải xám nhợt trên iPhone). */}
      {board?.background?.startsWith('http') && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
            background: `url("${board.background}") center/cover no-repeat`,
            transition: 'background 0.3s ease'
          }}
        />
      )}
      <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <ActiveCard />
        <AppBar />
        <BoardBar board={board} onlineUsers={onlineUsers} />
        <BoardContent
          board={board}
          moveColumns={moveColumns}
          moveCardInTheSameColumn={moveCardInTheSameColumn}
          moveCardToDifferentColumn={moveCardToDifferentColumn}
        />
      </Box>
    </Container>
  )
}

export default Board
