import { useEffect, useState, useMemo, useCallback } from 'react'
import dayjs from 'dayjs'
import Badge from '@mui/material/Badge'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Avatar from '@mui/material/Avatar'
import GroupAddIcon from '@mui/icons-material/GroupAdd'
import DoneIcon from '@mui/icons-material/Done'
import NotInterestedIcon from '@mui/icons-material/NotInterested'
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm'
import WatchLaterOutlinedIcon from '@mui/icons-material/WatchLaterOutlined'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined'
import CloseIcon from '@mui/icons-material/Close'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchInvitationsAPI,
  selectCurrentNotifications,
  updateBoardInvitationAPI,
  addNotification
} from '~/redux/notifications/notificationsSlice'
import { socketIoInstance } from '~/socketClient'
import { toast } from 'react-toastify'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const BOARD_INVITATION_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED'
}

function Notifications() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  // Dữ liệu thông báo từ Redux store
  const rawNotifications = useSelector(selectCurrentNotifications)
  const currentUser = useSelector(selectCurrentUser)
  const userId = currentUser?._id

  // Quản lý danh sách ID thông báo đã đọc & đã xóa (lưu trong localStorage theo từng User)
  const readStorageKey = userId ? `trello_read_notis_${userId}` : null
  const dismissedStorageKey = userId ? `trello_dismissed_notis_${userId}` : null

  const [readIds, setReadIds] = useState(() => {
    if (!readStorageKey) return []
    try {
      return JSON.parse(localStorage.getItem(readStorageKey) || '[]')
    } catch {
      return []
    }
  })

  const [dismissedIds, setDismissedIds] = useState(() => {
    if (!dismissedStorageKey) return []
    try {
      return JSON.parse(localStorage.getItem(dismissedStorageKey) || '[]')
    } catch {
      return []
    }
  })

  // Đồng bộ lại khi đổi tài khoản
  useEffect(() => {
    if (readStorageKey) {
      try {
        setReadIds(JSON.parse(localStorage.getItem(readStorageKey) || '[]'))
      } catch {
        setReadIds([])
      }
    }
    if (dismissedStorageKey) {
      try {
        setDismissedIds(JSON.parse(localStorage.getItem(dismissedStorageKey) || '[]'))
      } catch {
        setDismissedIds([])
      }
    }
  }, [readStorageKey, dismissedStorageKey])

  // Lọc các thông báo chưa bị xóa
  const activeNotifications = useMemo(() => {
    const list = (rawNotifications || []).filter(n => !dismissedIds.includes(n._id))
    return [...list].sort((a, b) => {
      const timeA = new Date(a.createdAt || a.dueDate || 0).getTime()
      const timeB = new Date(b.createdAt || b.dueDate || 0).getTime()
      return timeB - timeA
    })
  }, [rawNotifications, dismissedIds])

  // Đếm số lượng thông báo chưa đọc
  const unreadCount = useMemo(() => {
    return activeNotifications.filter(n => !readIds.includes(n._id)).length
  }, [activeNotifications, readIds])

  const handleClickNotificationIcon = (event) => {
    setAnchorEl(event.currentTarget)
    dispatch(fetchInvitationsAPI())
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  // Đánh dấu tất cả thông báo là đã đọc
  const handleMarkAllAsRead = useCallback(() => {
    if (!readStorageKey) return
    const allIds = activeNotifications.map(n => n._id)
    const updated = Array.from(new Set([...readIds, ...allIds]))
    setReadIds(updated)
    try {
      localStorage.setItem(readStorageKey, JSON.stringify(updated))
    } catch {
      // ignore storage quota error
    }
  }, [activeNotifications, readIds, readStorageKey])

  // Đánh dấu 1 thông báo cụ thể là đã đọc
  const markAsRead = useCallback((notificationId) => {
    if (!readStorageKey || readIds.includes(notificationId)) return
    const updated = [...readIds, notificationId]
    setReadIds(updated)
    try {
      localStorage.setItem(readStorageKey, JSON.stringify(updated))
    } catch {
      // ignore storage quota error
    }
  }, [readIds, readStorageKey])

  // Xóa tất cả thông báo (Clear All)
  const handleClearAll = useCallback(() => {
    if (!dismissedStorageKey) return
    const allIds = activeNotifications.map(n => n._id)
    const updated = Array.from(new Set([...dismissedIds, ...allIds]))
    setDismissedIds(updated)
    try {
      localStorage.setItem(dismissedStorageKey, JSON.stringify(updated))
    } catch {
      // ignore storage quota error
    }
  }, [activeNotifications, dismissedIds, dismissedStorageKey])

  // Xóa 1 thông báo cụ thể (Clear One)
  const handleClearOne = useCallback((notificationId, event) => {
    if (event) event.stopPropagation()
    if (!dismissedStorageKey) return
    const updated = Array.from(new Set([...dismissedIds, notificationId]))
    setDismissedIds(updated)
    try {
      localStorage.setItem(dismissedStorageKey, JSON.stringify(updated))
    } catch {
      // ignore storage quota error
    }
  }, [dismissedIds, dismissedStorageKey])

  useEffect(() => {
    if (userId) {
      socketIoInstance.emit('FE_USER_JOIN_ROOM', userId)
    }

    dispatch(fetchInvitationsAPI())

    const onReceiveInvitation = (invitation) => {
      if (invitation.inviteeId === userId) {
        dispatch(addNotification(invitation))
      }
    }

    socketIoInstance.on('BE_USER_INVITED_TO_BOARD', onReceiveInvitation)

    const onReceiveCardDueDateChanged = ({ card, boardTitle }) => {
      dispatch(fetchInvitationsAPI())
      const cardTitle = card?.title ? `'${card.title}'` : 'assigned card'
      const boardInfo = boardTitle ? ' on ' + boardTitle : ''
      toast.info('⏰ Deadline updated for ' + cardTitle + boardInfo)
    }

    socketIoInstance.on('BE_CARD_DUE_DATE_CHANGED', onReceiveCardDueDateChanged)

    const onConnect = () => {
      if (userId) {
        socketIoInstance.emit('FE_USER_JOIN_ROOM', userId)
      }
    }
    socketIoInstance.on('connect', onConnect)

    const timer = setInterval(() => {
      dispatch(fetchInvitationsAPI())
    }, 60000)

    return () => {
      clearInterval(timer)
      socketIoInstance.off('BE_USER_INVITED_TO_BOARD', onReceiveInvitation)
      socketIoInstance.off('BE_CARD_DUE_DATE_CHANGED', onReceiveCardDueDateChanged)
      socketIoInstance.off('connect', onConnect)
    }
  }, [dispatch, userId])

  const updateBoardInvitation = (status, invitationId) => {
    markAsRead(invitationId)
    dispatch(updateBoardInvitationAPI({ status, invitationId }))
      .then(res => {
        if (res.payload.boardInvitation.status === BOARD_INVITATION_STATUS.ACCEPTED) {
          navigate(`/boards/${res.payload.boardInvitation.boardId}`)
          handleClose()
        }
      })
  }

  return (
    <Box>
      <Tooltip title="Notifications">
        <IconButton
          id="basic-button-open-notification"
          aria-controls={open ? 'basic-notification-drop-down' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClickNotificationIcon}
          // Đủ touch target tối thiểu ~44px trên mobile
          sx={{ color: 'inherit' }}
        >
          <Badge
            color="error"
            badgeContent={unreadCount > 0 ? unreadCount : null}
            max={99}
          >
            <NotificationsNoneIcon sx={{ color: unreadCount > 0 ? '#f59e0b' : 'white' }} />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        sx={{ mt: 1.5 }}
        id="basic-notification-drop-down"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{ 'aria-labelledby': 'basic-button-open-notification', sx: { p: 0 } }}
        PaperProps={{
          sx: {
            maxHeight: 520,
            width: { xs: 'min(360px, 92vw)', sm: 400 },
            borderRadius: 2,
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            overflow: 'hidden'
          }
        }}
      >
        {/* Header Thông Báo Đồng Bộ */}
        <Box sx={{
          px: 2,
          py: 1.2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1e293b' : '#f8fafc'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={`${unreadCount} new`}
                size="small"
                color="primary"
                sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }}
              />
            )}
          </Box>

          {activeNotifications.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Tooltip title={t('notifications.markAllAsRead')}>
                <span>
                  <IconButton
                    size="small"
                    onClick={handleMarkAllAsRead}
                    disabled={unreadCount === 0}
                    sx={{ p: 0.8 }}
                  >
                    <DoneAllIcon fontSize="small" sx={{ fontSize: 18 }} />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title="Clear all">
                <IconButton
                  size="small"
                  onClick={handleClearAll}
                  sx={{ p: 0.8, color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                >
                  <DeleteSweepOutlinedIcon fontSize="small" sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>

        {/* Danh sách thông báo hoặc Trạng thái trống */}
        <Box sx={{ maxHeight: 440, overflowY: 'auto' }}>
          {activeNotifications.length === 0 ? (
            <Box sx={{
              py: 5,
              px: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.2,
              textAlign: 'center'
            }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 44, color: 'success.main', opacity: 0.85 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {t('notifications.allCaughtUp')}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', maxWidth: 260 }}>
                No active task deadlines or board invitations at this time.
              </Typography>
            </Box>
          ) : (
            activeNotifications.map((notification, index) => {
              const isRead = readIds.includes(notification._id)

              // Trường hợp 1: Thông báo Deadline công việc (Quá hạn hoặc Sắp đến hạn)
              if (notification.type === 'CARD_DEADLINE') {
                const isOverdue = notification.deadlineStatus === 'OVERDUE'
                return (
                  <Box key={notification._id || index}>
                    <MenuItem
                      onClick={() => {
                        markAsRead(notification._id)
                        navigate(`/boards/${notification.boardId}?cardId=${notification.cardId}`)
                        handleClose()
                      }}
                      sx={{
                        py: 1.5,
                        px: 2,
                        whiteSpace: 'normal',
                        borderLeft: (theme) => `4px solid ${isOverdue ? theme.palette.error.main : theme.palette.warning.main}`,
                        bgcolor: (theme) => !isRead
                          ? (isOverdue
                            ? (theme.palette.mode === 'dark' ? 'rgba(239, 83, 80, 0.12)' : 'rgba(239, 83, 80, 0.06)')
                            : (theme.palette.mode === 'dark' ? 'rgba(255, 167, 38, 0.12)' : 'rgba(255, 167, 38, 0.06)'))
                          : 'transparent',
                        '&:hover': {
                          bgcolor: (theme) => isOverdue
                            ? (theme.palette.mode === 'dark' ? 'rgba(239, 83, 80, 0.18)' : 'rgba(239, 83, 80, 0.1)')
                            : (theme.palette.mode === 'dark' ? 'rgba(255, 167, 38, 0.18)' : 'rgba(255, 167, 38, 0.1)')
                        }
                      }}
                    >
                      <Box sx={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        {/* Avatar / Icon phân loại */}
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            bgcolor: isOverdue ? 'rgba(239, 83, 80, 0.15)' : 'rgba(255, 167, 38, 0.15)',
                            color: isOverdue ? 'error.main' : 'warning.main',
                            flexShrink: 0
                          }}
                        >
                          {isOverdue ? <AccessAlarmIcon fontSize="small" /> : <WatchLaterOutlinedIcon fontSize="small" />}
                        </Avatar>

                        {/* Nội dung chi tiết */}
                        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.6 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.82rem', color: isOverdue ? 'error.main' : 'warning.main' }}>
                                {isOverdue ? 'Task Overdue' : 'Task Due Soon'}
                              </Typography>
                              {!isRead && (
                                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: isOverdue ? 'error.main' : 'warning.main' }} />
                              )}
                            </Box>
                          </Box>

                          <Typography variant="body2" sx={{ wordBreak: 'break-word', lineHeight: 1.35, color: 'text.primary', fontSize: '0.84rem' }}>
                            Card <strong>&quot;{notification.cardTitle}&quot;</strong> in board <strong>&quot;{notification.boardTitle}&quot;</strong>
                          </Typography>

                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 0.3 }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '11px' }}>
                              Due: {dayjs(notification.dueDate).format(t('common.dateFormatShort'))}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Nút Xóa thông báo này */}
                        <Tooltip title="Dismiss">
                          <IconButton
                            size="small"
                            onClick={(e) => handleClearOne(notification._id, e)}
                            sx={{ p: 0.4, opacity: 0.6, '&:hover': { opacity: 1, color: 'error.main' } }}
                          >
                            <CloseIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </MenuItem>
                    {index !== (activeNotifications.length - 1) && <Divider />}
                  </Box>
                )
              }

              // Trường hợp 2: Lời mời tham gia Board (Board Invitation)
              const inviterName = notification.inviter?.displayName || notification.inviter?.username || 'A teammate'
              const boardTitle = notification.board?.title || 'Board'
              const isPending = notification.boardInvitation?.status === BOARD_INVITATION_STATUS.PENDING

              return (
                <Box key={notification._id || index}>
                  <MenuItem
                    onClick={() => markAsRead(notification._id)}
                    sx={{
                      py: 1.5,
                      px: 2,
                      whiteSpace: 'normal',
                      borderLeft: (theme) => `4px solid ${theme.palette.info.main}`,
                      bgcolor: (theme) => !isRead
                        ? (theme.palette.mode === 'dark' ? 'rgba(2, 132, 199, 0.12)' : 'rgba(2, 132, 199, 0.05)')
                        : 'transparent'
                    }}
                  >
                    <Box sx={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      {/* Avatar người mời */}
                      <Avatar
                        src={notification.inviter?.avatar || undefined}
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: 'rgba(2, 132, 199, 0.15)',
                          color: 'info.main',
                          flexShrink: 0
                        }}
                      >
                        <GroupAddIcon fontSize="small" />
                      </Avatar>

                      {/* Nội dung chi tiết */}
                      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.82rem', color: 'info.main' }}>
                            Board Invitation
                          </Typography>
                          {!isRead && (
                            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'info.main' }} />
                          )}
                        </Box>

                        <Typography variant="body2" sx={{ wordBreak: 'break-word', lineHeight: 1.35, color: 'text.primary', fontSize: '0.84rem' }}>
                          <strong>{inviterName}</strong> invited you to join board <strong>&quot;{boardTitle}&quot;</strong>
                        </Typography>

                        {/* Các nút hành động Accept / Reject */}
                        {isPending ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pt: 0.5 }}>
                            <Button
                              className="interceptor-loading"
                              variant="contained"
                              color="primary"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation()
                                updateBoardInvitation(BOARD_INVITATION_STATUS.ACCEPTED, notification._id)
                              }}
                              sx={{ textTransform: 'none', fontWeight: 600, py: 0.3, px: 1.5, fontSize: '0.78rem' }}
                            >
                              {t('notifications.accept')}
                            </Button>
                            <Button
                              className="interceptor-loading"
                              variant="outlined"
                              color="inherit"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation()
                                updateBoardInvitation(BOARD_INVITATION_STATUS.REJECTED, notification._id)
                              }}
                              sx={{ textTransform: 'none', py: 0.3, px: 1.5, fontSize: '0.78rem', borderColor: 'divider' }}
                            >
                              Decline
                            </Button>
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pt: 0.3 }}>
                            {notification.boardInvitation?.status === BOARD_INVITATION_STATUS.ACCEPTED && (
                              <Chip icon={<DoneIcon />} label={t('notifications.accepted')} color="success" size="small" sx={{ height: 22, fontSize: '0.7rem' }} />
                            )}
                            {notification.boardInvitation?.status === BOARD_INVITATION_STATUS.REJECTED && (
                              <Chip icon={<NotInterestedIcon />} label="Declined" size="small" sx={{ height: 22, fontSize: '0.7rem' }} />
                            )}
                          </Box>
                        )}

                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '11px', pt: 0.2 }}>
                          {dayjs(notification.createdAt).format(t('common.datetimeFormatFull'))}
                        </Typography>
                      </Box>

                      {/* Nút Xóa thông báo này */}
                      <Tooltip title="Dismiss">
                        <IconButton
                          size="small"
                          onClick={(e) => handleClearOne(notification._id, e)}
                          sx={{ p: 0.4, opacity: 0.6, '&:hover': { opacity: 1, color: 'error.main' } }}
                        >
                          <CloseIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </MenuItem>
                  {index !== (activeNotifications.length - 1) && <Divider />}
                </Box>
              )
            })
          )}
        </Box>
      </Menu>
    </Box>
  )
}

export default Notifications
