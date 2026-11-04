import { useState, useEffect, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cloneDeep from 'lodash/cloneDeep'
import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import CloseIcon from '@mui/icons-material/Close'
import SearchIcon from '@mui/icons-material/Search'
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined'
import UndoIcon from '@mui/icons-material/Undo'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { useConfirm } from 'material-ui-confirm'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import {
  fetchArchivedItemsAPI,
  restoreCardAPI,
  deleteCardAPI,
  restoreColumnAPI,
  deleteColumnDetailsAPI
} from '~/apis'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { emitBoardUpdate, BOARD_ACTION_TYPES } from '~/sockets/boardSocketClient'
import {
  selectCurrentActiveBoard,
  updateCurrentActiveBoard,
  fetchBoardDetailsAPI
} from '~/redux/activeBoard/activeBoardSlice'

function ArchivedItemsDrawer({ isOpen, onClose, boardId }) {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const board = useSelector(selectCurrentActiveBoard)
  const currentUser = useSelector(selectCurrentUser)
  const confirm = useConfirm()

  const [tabIndex, setTabIndex] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [archivedCards, setArchivedCards] = useState([])
  const [archivedColumns, setArchivedColumns] = useState([])

  const loadArchivedItems = useCallback(async () => {
    if (!boardId) return
    setLoading(true)
    try {
      const data = await fetchArchivedItemsAPI(boardId)
      setArchivedCards(data?.cards || [])
      setArchivedColumns(data?.columns || [])
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load archived items')
    } finally {
      setLoading(false)
    }
  }, [boardId])

  useEffect(() => {
    if (isOpen) {
      loadArchivedItems()
    }
  }, [isOpen, loadArchivedItems])

  // Lọc card theo search
  const filteredCards = useMemo(() => {
    if (!searchTerm.trim()) return archivedCards
    const term = searchTerm.toLowerCase().trim()
    return archivedCards.filter(c =>
      c.title?.toLowerCase().includes(term) ||
      c.columnTitle?.toLowerCase().includes(term)
    )
  }, [archivedCards, searchTerm])

  // Lọc column theo search
  const filteredColumns = useMemo(() => {
    if (!searchTerm.trim()) return archivedColumns
    const term = searchTerm.toLowerCase().trim()
    return archivedColumns.filter(c => c.title?.toLowerCase().includes(term))
  }, [archivedColumns, searchTerm])

  // Khôi phục Card
  const handleRestoreCard = async (card) => {
    try {
      const restoredCard = await restoreCardAPI(card._id)

      // Cập nhật Redux activeBoard
      const newBoard = cloneDeep(board)
      let targetCol = newBoard.columns.find(c => c._id === restoredCard.columnId)
      if (!targetCol && newBoard.columns.length > 0) {
        targetCol = newBoard.columns[0]
      }

      if (targetCol) {
        targetCol.cards = (targetCol.cards || []).filter(c => !c.FE_PlaceholderCard)
        targetCol.cardOrderIds = (targetCol.cardOrderIds || []).filter(id => !id.includes('placeholder-card'))

        targetCol.cards.push(restoredCard)
        targetCol.cardOrderIds.push(restoredCard._id)

        dispatch(updateCurrentActiveBoard(newBoard))
        emitBoardUpdate({
          boardId: board._id,
          actionType: BOARD_ACTION_TYPES.RESTORE_CARD,
          payload: restoredCard,
          currentUser
        })
      }

      setArchivedCards(prev => prev.filter(c => c._id !== card._id))
      toast.success(t('board.cardRestored'))
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to restore card')
    }
  }

  // Xóa vĩnh viễn Card
  const handleDeleteCardPermanently = (card) => {
    confirm({
      title: 'Delete Card Permanently?',
      description: `Are you sure you want to permanently delete "${card.title}"? This action cannot be undone.`,
      confirmationText: 'Delete',
      cancellationText: 'Cancel'
    }).then(async () => {
      try {
        await deleteCardAPI(card._id)
        emitBoardUpdate({
          boardId: board._id,
          actionType: BOARD_ACTION_TYPES.DELETE_CARD,
          payload: { cardId: card._id },
          currentUser
        })
        setArchivedCards(prev => prev.filter(c => c._id !== card._id))
        toast.success(t('board.cardPermanentlyDeleted'))
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to delete card')
      }
    }).catch(() => {})
  }

  // Khôi phục Column
  const handleRestoreColumn = async (column) => {
    try {
      await restoreColumnAPI(column._id)
      dispatch(fetchBoardDetailsAPI(boardId))
      emitBoardUpdate({
        boardId: board._id,
        actionType: BOARD_ACTION_TYPES.UPDATE_BOARD,
        payload: {},
        currentUser
      })
      setArchivedColumns(prev => prev.filter(c => c._id !== column._id))
      toast.success(t('board.listRestored'))
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to restore list')
    }
  }

  // Xóa vĩnh viễn Column
  const handleDeleteColumnPermanently = (column) => {
    confirm({
      title: 'Delete List Permanently?',
      description: `Are you sure you want to permanently delete list "${column.title}" and all its cards? This cannot be undone.`,
      confirmationText: 'Delete',
      cancellationText: 'Cancel'
    }).then(async () => {
      try {
        await deleteColumnDetailsAPI(column._id)
        emitBoardUpdate({
          boardId: board._id,
          actionType: BOARD_ACTION_TYPES.DELETE_COLUMN,
          payload: { columnId: column._id },
          currentUser
        })
        setArchivedColumns(prev => prev.filter(c => c._id !== column._id))
        toast.success(t('board.listPermanentlyDeleted'))
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to delete list')
      }
    }).catch(() => {})
  }

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: 'min(320px, 86vw)', sm: 360 },
          p: 2.5,
          bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1e272e' : '#ffffff',
          boxShadow: '-4px 0 20px rgba(0,0,0,0.15)'
        }
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ArchiveOutlinedIcon color="primary" />
          <Typography variant="h6" fontWeight={700}>
            Archived Items
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} aria-label="close">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Search */}
      <TextField
        fullWidth
        size="small"
        placeholder={t('board.archiveSearchPlaceholder')}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            </InputAdornment>
          )
        }}
        sx={{ mb: 2 }}
      />

      {/* Tabs */}
      <Tabs
        value={tabIndex}
        onChange={(_, val) => setTabIndex(val)}
        variant="fullWidth"
        sx={{
          minHeight: 40,
          mb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          '& .MuiTab-root': {
            minHeight: 40,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '13px'
          }
        }}
      >
        <Tab label={`Cards (${archivedCards.length})`} />
        <Tab label={`Lists (${archivedColumns.length})`} />
      </Tabs>

      {/* Body content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
          <CircularProgress size={32} />
        </Box>
      ) : (
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {/* Tab 0: Cards */}
          {tabIndex === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {filteredCards.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No archived cards found.
                </Typography>
              ) : (
                filteredCards.map((card) => (
                  <Paper
                    key={card._id}
                    elevation={1}
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? '#2f3542' : '#f4f5f7',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    {/* Labels preview */}
                    {Boolean(card?.labels?.length) && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 0.8 }}>
                        {card.labels.map((label, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              height: 6,
                              minWidth: 32,
                              borderRadius: 1,
                              bgcolor: label.color
                            }}
                          />
                        ))}
                      </Box>
                    )}

                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
                      {card.title}
                    </Typography>

                    {card.columnTitle && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                        In list: <strong>{card.columnTitle}</strong>
                      </Typography>
                    )}

                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<UndoIcon fontSize="small" />}
                        onClick={() => handleRestoreCard(card)}
                        sx={{ textTransform: 'none', fontSize: '12px' }}
                      >
                        Send to board
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        startIcon={<DeleteOutlineIcon fontSize="small" />}
                        onClick={() => handleDeleteCardPermanently(card)}
                        sx={{ textTransform: 'none', fontSize: '12px' }}
                      >
                        Delete
                      </Button>
                    </Box>
                  </Paper>
                ))
              )}
            </Box>
          )}

          {/* Tab 1: Lists (Columns) */}
          {tabIndex === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {filteredColumns.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No archived lists found.
                </Typography>
              ) : (
                filteredColumns.map((col) => (
                  <Paper
                    key={col._id}
                    elevation={1}
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? '#2f3542' : '#f4f5f7',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                      {col.title}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<UndoIcon fontSize="small" />}
                        onClick={() => handleRestoreColumn(col)}
                        sx={{ textTransform: 'none', fontSize: '12px' }}
                      >
                        Send to board
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        startIcon={<DeleteOutlineIcon fontSize="small" />}
                        onClick={() => handleDeleteColumnPermanently(col)}
                        sx={{ textTransform: 'none', fontSize: '12px' }}
                      >
                        Delete
                      </Button>
                    </Box>
                  </Paper>
                ))
              )}
            </Box>
          )}
        </Box>
      )}
    </Drawer>
  )
}

export default ArchivedItemsDrawer

