import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Badge from '@mui/material/Badge'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import Typography from '@mui/material/Typography'
import DashboardIcon from '@mui/icons-material/Dashboard'
import FilterIcon from '@mui/icons-material/FilterList'
import WallpaperOutlinedIcon from '@mui/icons-material/WallpaperOutlined'
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined'
import FolderOffOutlinedIcon from '@mui/icons-material/FolderOffOutlined'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import Tooltip from '@mui/material/Tooltip'
import { selectCardFilter, setCardFilter, updateCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'
import { updateBoardDetailsAPI, closeBoardAPI, removeBoardMemberAPI } from '~/apis'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { toast } from 'react-toastify'
import { useConfirm } from 'material-ui-confirm'
import { useNavigate } from 'react-router-dom'
import { slugify } from '~/utils/formatter'
import BoardUserGroup from './BoardUserGroup'
import InviteBoardUser from './InviteBoardUser'
import BoardCardFilterPopover from './BoardCardFilterPopover'
import ChangeBoardBackgroundPopover from './ChangeBoardBackgroundPopover'
import ArchivedItemsDrawer from './ArchivedItemsDrawer'
import { emitBoardUpdate, BOARD_ACTION_TYPES } from '~/sockets/boardSocketClient'
import { useTranslation } from 'react-i18next'

const MENU_STYLES = {
  color: 'white',
  bgcolor: 'transparent',
  border: 'none',
  paddingX: '5px',
  borderRadius: '4px',
  '& .MuiSvgIcon-root': {
    color: 'white'
  },
  '&:hover': {
    bgcolor: 'primary.50'
  }
}

function BoardBar({ board, onlineUsers = [] }) {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const confirm = useConfirm()
  const navigate = useNavigate()
  const currentUser = useSelector(selectCurrentUser)
  const isOwner = (board?.ownerIds || []).some(id => id.toString() === currentUser?._id?.toString())
  const isInvitedMember = Boolean(currentUser?._id) && !isOwner

  const [filterAnchorEl, setFilterAnchorEl] = useState(null)
  const isFilterOpen = Boolean(filterAnchorEl)

  const [bgAnchorEl, setBgAnchorEl] = useState(null)
  const isBgOpen = Boolean(bgAnchorEl)
  const [isArchivedOpen, setIsArchivedOpen] = useState(false)

  // Trên mobile (xs): các chip công cụ bị tràn thanh -> gom vào menu "⋯"
  const [moreAnchorEl, setMoreAnchorEl] = useState(null)
  const isMoreOpen = Boolean(moreAnchorEl)
  const moreBtnRef = useRef(null)

  const handleOpenBgFromMore = () => {
    setMoreAnchorEl(null)
    setBgAnchorEl(moreBtnRef.current)
  }
  const handleOpenArchivedFromMore = () => {
    setMoreAnchorEl(null)
    setIsArchivedOpen(true)
  }

  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(board?.title || '')

  useEffect(() => {
    setTitleValue(board?.title || '')
  }, [board?.title])

  const handleCloseBoard = () => {
    confirm({
      title: t('boardBar.closeBoardTitle'),
      description: t('boardBar.closeBoardDesc'),
      confirmationText: t('boardBar.close'),
      cancellationText: t('common.cancel')
    }).then(async () => {
      try {
        await closeBoardAPI(board._id)
        toast.success(t('boardBar.boardClosed'))
        navigate('/boards')
      } catch (error) {
        toast.error(error?.response?.data?.message || t('boardBar.closeFailed'))
      }
    }).catch(() => {})
  }

  const handleLeaveBoard = () => {
    confirm({
      title: t('boardBar.leaveBoardTitle'),
      description: t('boardBar.leaveBoardDesc', { title: board?.title }),
      confirmationText: t('boardBar.leaveBoard'),
      cancellationText: t('common.cancel')
    }).then(async () => {
      try {
        await removeBoardMemberAPI(board._id, currentUser._id)
        emitBoardUpdate({
          boardId: board._id,
          actionType: BOARD_ACTION_TYPES.UPDATE_BOARD,
          payload: { removedMemberId: currentUser._id },
          currentUser
        })
        toast.success(t('boardBar.leftBoard', { title: board?.title }))
        navigate('/boards')
      } catch (error) {
        toast.error(error?.response?.data?.message || t('boardBar.leaveFailed'))
      }
    }).catch(() => {})
  }

  const cardFilter = useSelector(selectCardFilter)

  const activeFilterCount = (cardFilter?.search ? 1 : 0) + (cardFilter?.labelIds?.length || 0) + (cardFilter?.onlyMyCards ? 1 : 0) + (cardFilter?.memberIds?.length || 0)
  const hasActiveFilter = activeFilterCount > 0

  const handleOpenFilter = (e) => setFilterAnchorEl(e.currentTarget)
  const handleCloseFilter = () => setFilterAnchorEl(null)

  const handleOpenBgPopover = (e) => setBgAnchorEl(e.currentTarget)
  const handleCloseBgPopover = () => setBgAnchorEl(null)

  // Phím tắt bàn phím: bấm 'F' để bật/tắt nhanh bộ lọc "Thẻ của tôi" khi đang xem board
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        (event.key === 'f' || event.key === 'F') &&
        !['INPUT', 'TEXTAREA'].includes(event.target?.tagName) &&
        !event.target?.isContentEditable
      ) {
        event.preventDefault()
        dispatch(setCardFilter({ onlyMyCards: !cardFilter?.onlyMyCards }))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [dispatch, cardFilter?.onlyMyCards])

  const handleUpdateBoardTitle = (newTitle) => {
    if (!newTitle || newTitle.trim() === board?.title) return
    const updatedTitle = newTitle.trim()

    const newSlug = slugify(updatedTitle)
    dispatch(updateCurrentActiveBoard({ ...board, title: updatedTitle, slug: newSlug }))

    emitBoardUpdate({
      boardId: board._id,
      actionType: BOARD_ACTION_TYPES.UPDATE_BOARD,
      payload: { title: updatedTitle, slug: newSlug },
      currentUser
    })

    updateBoardDetailsAPI(board._id, { title: updatedTitle })
      .then(() => {
        toast.success(t('board.boardTitleUpdated'))
      })
      .catch(() => {
        dispatch(updateCurrentActiveBoard(board))
        toast.error(t('board.boardTitleUpdateFailed'))
      })
  }

  const handleSelectBackground = (newBackground) => {
    // Cập nhật Redux ngay lập tức để giao diện mượt mà không có độ trễ
    dispatch(updateCurrentActiveBoard({ ...board, background: newBackground }))

    emitBoardUpdate({
      boardId: board._id,
      actionType: BOARD_ACTION_TYPES.UPDATE_BOARD,
      payload: { background: newBackground },
      currentUser
    })

    updateBoardDetailsAPI(board._id, { background: newBackground })
      .then(() => {
        toast.success(t('board.boardBackgroundUpdated'))
      })
      .catch(() => {
        dispatch(updateCurrentActiveBoard(board))
        toast.error(t('board.boardBackgroundUpdateFailed'))
      })
  }

  const handleUploadBackgroundFile = (file) => {
    const formData = new FormData()
    formData.append('boardBackground', file)

    toast.promise(
      updateBoardDetailsAPI(board._id, formData).then((updatedBoard) => {
        dispatch(updateCurrentActiveBoard({ ...board, ...updatedBoard, columns: board.columns, FE_allUsers: board.FE_allUsers }))
        emitBoardUpdate({
          boardId: board._id,
          actionType: BOARD_ACTION_TYPES.UPDATE_BOARD,
          payload: { background: updatedBoard?.background },
          currentUser
        })
      }),
      {
        pending: 'Uploading background image to Cloudinary...',
        success: 'Board background updated!',
        error: 'Failed to upload background image!'
      }
    )
  }

  return (
    <Box sx={{
      width: '100%',
      // PWA standalone (iPhone): chừa chỗ cho thanh trạng thái/notch
      height: (theme) => `calc(${theme.trello.boardBarHeight} + env(safe-area-inset-top, 0px))`,
      paddingTop: 'env(safe-area-inset-top, 0px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
      overflow: 'auto',
      paddingX: 2,
      bgcolor: board?.background
        ? 'rgba(0, 0, 0, 0.55)'
        : (theme) => (theme.palette.mode === 'dark' ? '#1e293b' : '#0747a6'),
      backdropFilter: board?.background ? 'blur(16px)' : 'none',
      borderBottom: board?.background ? '1px solid rgba(255, 255, 255, 0.15)' : 'none',
      transition: 'background 0.3s ease',
      // thanh scroll thẳng với list card
      '&::-webkit-scrollbar-track': { m: 2 }
    }}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        {!isEditingTitle ? (
          <Tooltip title={t('board.clickToEditTitle')}>
            <Chip
              sx={{
                ...MENU_STYLES,
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                // Mobile: giới hạn độ rộng tên board để cụm bên phải (Mời/avatar) không bị đẩy tràn màn hình
                maxWidth: { xs: '38vw', sm: 'none' },
                '& .MuiChip-label': {
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                },
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.25)'
                }
              }}
              icon={<DashboardIcon sx={{ color: 'white !important', fontSize: '18px' }} />}
              label={board?.title || 'Untitled Board'}
              clickable
              onClick={() => {
                setTitleValue(board?.title || '')
                setIsEditingTitle(true)
              }}
            />
          </Tooltip>
        ) : (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              height: 32,
              px: 1,
              borderRadius: '4px',
              bgcolor: (theme) => theme.palette.mode === 'dark' ? '#22272b' : '#ffffff',
              boxShadow: '0 0 0 2px #0052cc'
            }}
          >
            <DashboardIcon sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#9fadbc' : '#0052cc', fontSize: 18 }} />
            <Box
              component="input"
              autoFocus
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onFocus={(e) => e.target.select()}
              onBlur={() => {
                setIsEditingTitle(false)
                if (titleValue.trim() && titleValue.trim() !== board?.title) {
                  handleUpdateBoardTitle(titleValue)
                } else {
                  setTitleValue(board?.title || '')
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.target.blur()
                } else if (e.key === 'Escape') {
                  setTitleValue(board?.title || '')
                  setIsEditingTitle(false)
                }
              }}
              sx={{
                border: 'none',
                outline: 'none',
                bgcolor: 'transparent',
                color: (theme) => theme.palette.mode === 'dark' ? '#b6c2cf' : '#172b4d',
                fontSize: '14px',
                fontWeight: 700,
                fontFamily: 'inherit',
                p: 0,
                m: 0,
                width: `${Math.max((titleValue || '').length * 8.5 + 20, 80)}px`,
                maxWidth: '320px'
              }}
            />
          </Box>
        )}

        <Chip
          sx={{
            ...MENU_STYLES,
            display: { xs: 'none', sm: 'inline-flex' },
            ...(hasActiveFilter && {
              bgcolor: 'rgba(255, 255, 255, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              fontWeight: 600
            })
          }}
          icon={<FilterIcon />}
          label={hasActiveFilter ? `${t('boardBar.filters')} (${activeFilterCount})` : t('boardBar.filters')}
          clickable
          onClick={handleOpenFilter}
        />

        <BoardCardFilterPopover
          anchorEl={filterAnchorEl}
          isOpen={isFilterOpen}
          onClose={handleCloseFilter}
          board={board}
        />

        {/* Nút Thay đổi Hình nền / Màu nền cho Bảng */}
        <Chip
          sx={{
            ...MENU_STYLES,
            display: { xs: 'none', sm: 'inline-flex' },
            ...(board?.background && {
              bgcolor: 'rgba(255, 255, 255, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              fontWeight: 600
            })
          }}
          icon={<WallpaperOutlinedIcon />}
          label={t('boardBar.background')}
          clickable
          onClick={handleOpenBgPopover}
        />

        <ChangeBoardBackgroundPopover
          anchorEl={bgAnchorEl}
          isOpen={isBgOpen}
          onClose={handleCloseBgPopover}
          currentBackground={board?.background}
          onSelectBackground={handleSelectBackground}
          onUploadBackgroundFile={handleUploadBackgroundFile}
        />

        {/* Nút Mở Danh sách Lưu trữ (Archived Items) */}
        <Chip
          sx={{ ...MENU_STYLES, display: { xs: 'none', sm: 'inline-flex' } }}
          icon={<ArchiveOutlinedIcon />}
          label={t('boardBar.archived')}
          clickable
          onClick={() => setIsArchivedOpen(true)}
        />

        <ArchivedItemsDrawer
          isOpen={isArchivedOpen}
          onClose={() => setIsArchivedOpen(false)}
          boardId={board?._id}
        />

        {/* Nút Đóng Bảng (Chỉ dành cho Owner) */}
        {isOwner && (
          <Chip
            sx={{
              ...MENU_STYLES,
              display: { xs: 'none', sm: 'inline-flex' },
              '&:hover': {
                bgcolor: 'error.main'
              }
            }}
            icon={<FolderOffOutlinedIcon />}
            label={t('boardBar.closeBoard')}
            clickable
            onClick={handleCloseBoard}
          />
        )}

        {/* Nút Rời Bảng (Dành cho Thành viên được mời) */}
        {isInvitedMember && (
          <Chip
            sx={{
              ...MENU_STYLES,
              display: { xs: 'none', sm: 'inline-flex' },
              '&:hover': {
                bgcolor: 'error.main'
              }
            }}
            icon={<ExitToAppIcon />}
            label={t('boardBar.leaveBoard')}
            clickable
            onClick={handleLeaveBoard}
          />
        )}

        {/* Mobile (xs): nút Bộ lọc dạng icon - công cụ dùng nhiều nhất nên tách ra khỏi menu ⋯
            Có chấm cảnh báo khi đang bật bộ lọc */}
        <Badge
          color="warning"
          variant="dot"
          invisible={!hasActiveFilter}
          sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
        >
          <IconButton
            onClick={handleOpenFilter}
            aria-label={t('boardBar.filters')}
            sx={{ color: 'white', bgcolor: 'rgba(255, 255, 255, 0.15)', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' } }}
          >
            <FilterIcon />
          </IconButton>
        </Badge>

        {/* Mobile (xs): menu "⋯" gom các công cụ bị tràn thanh */}
        <Tooltip title={t('boardBar.more')}>
          <IconButton
            ref={moreBtnRef}
            onClick={(e) => setMoreAnchorEl(e.currentTarget)}
            aria-label={t('boardBar.more')}
            aria-haspopup="menu"
            sx={{
              display: { xs: 'inline-flex', sm: 'none' },
              color: 'white',
              bgcolor: 'rgba(255, 255, 255, 0.15)',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' }
            }}
          >
            <MoreHorizIcon />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={moreAnchorEl}
          open={isMoreOpen}
          onClose={() => setMoreAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={handleOpenBgFromMore}>
            <ListItemIcon sx={{ color: '#8b5cf6' }}>
              <WallpaperOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="inherit">{t('boardBar.background')}</Typography>
          </MenuItem>
          <MenuItem onClick={handleOpenArchivedFromMore}>
            <ListItemIcon sx={{ color: '#f59e0b' }}>
              <ArchiveOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="inherit">{t('boardBar.archived')}</Typography>
          </MenuItem>
          {isOwner && (
            <MenuItem onClick={() => { setMoreAnchorEl(null); handleCloseBoard() }}>
              <ListItemIcon sx={{ color: '#ef4444' }}>
                <FolderOffOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <Typography variant="inherit">{t('boardBar.closeBoard')}</Typography>
            </MenuItem>
          )}
          {isInvitedMember && (
            <MenuItem onClick={() => { setMoreAnchorEl(null); handleLeaveBoard() }}>
              <ListItemIcon sx={{ color: '#ef4444' }}>
                <ExitToAppIcon fontSize="small" />
              </ListItemIcon>
              <Typography variant="inherit">{t('boardBar.leaveBoard')}</Typography>
            </MenuItem>
          )}
        </Menu>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {/* Live Active Viewers Indicator */}
        {onlineUsers.length > 0 && (
          <Tooltip title={`Online on this board: ${onlineUsers.map(u => u.displayName || u.email).join(', ')}`}>
            <Chip
              size="small"
              icon={
                <Box sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: '#22c55e',
                  boxShadow: '0 0 6px #22c55e',
                  ml: 0.5
                }} />
              }
              label={`${onlineUsers.length} live`}
              sx={{
                bgcolor: 'rgba(34, 197, 94, 0.2)',
                color: '#bbf7d0',
                border: '1px solid rgba(74, 222, 128, 0.4)',
                fontWeight: 600,
                height: 28,
                cursor: 'pointer',
                '& .MuiChip-label': { px: 1, fontSize: '0.75rem' }
              }}
            />
          </Tooltip>
        )}

        {/* handle invite user into board */}
        <InviteBoardUser boardId={board?._id} board={board} />

        {/* handle user group */}
        <BoardUserGroup
          boardUsers={board?.FE_allUsers}
          onlineUsers={onlineUsers}
          boardId={board?._id}
          ownerIds={board?.ownerIds}
          isOwner={isOwner}
          excludeUserId={currentUser?._id}
        />
      </Box>
    </Box>
  )
}

export default BoardBar
