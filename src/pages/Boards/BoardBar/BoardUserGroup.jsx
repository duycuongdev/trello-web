import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Badge from '@mui/material/Badge'
import Tooltip from '@mui/material/Tooltip'
import Popover from '@mui/material/Popover'
import IconButton from '@mui/material/IconButton'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { useConfirm } from 'material-ui-confirm'
import { useTranslation } from 'react-i18next'
import { removeBoardMemberAPI } from '~/apis'
import { removeMemberFromBoard } from '~/redux/activeBoard/activeBoardSlice'

function BoardUserGroup({ boardUsers = [], limit = 4, boardId, ownerIds = [], isOwner = false, onlineUsers = [], excludeUserId = null }) {
  const { t } = useTranslation()
  const confirmRemoveMember = useConfirm()
  const dispatch = useDispatch()
  // State to manage the popover for showing all users when the limit is exceeded
  const [anchorPopoverElement, setAnchorPopoverElement] = useState(null)
  const isOpenPopover = Boolean(anchorPopoverElement)
  const popoverId = isOpenPopover ? 'board-all-users-popover' : undefined
  const handleTogglePopover = (event) => {
    if (!anchorPopoverElement) setAnchorPopoverElement(event.currentTarget)
    else setAnchorPopoverElement(null)
  }

  const handleRemoveMember = (user) => {
    confirmRemoveMember({
      title: t('board.removeMemberTitle'),
      description: t('board.removeMemberDesc', { name: user?.displayName }),
      confirmationText: t('board.remove'),
      cancellationText: t('common.cancel')
    }).then(async () => {
      await removeBoardMemberAPI(boardId, user._id)
      dispatch(removeMemberFromBoard(user._id))
      toast.success(t('board.memberRemoved'))
    }).catch((error) => {
      if (error?.response) {
        toast.error(error.response.data?.message || t('board.removeMemberFailed'))
      }
    })
  }

  const renderUser = (user, index) => {
    const userIsOwner = ownerIds.some(id => id.toString() === user?._id?.toString())
    const isOnline = onlineUsers.some(u => u?._id?.toString() === user?._id?.toString())

    return (
      <Box key={user?._id || index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Tooltip title={`${user?.displayName || t('notifications.someone')}${isOnline ? ` • ${t('boardBar.onlineNow')}` : ''}`}>
          {isOnline ? (
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              variant="dot"
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: '#22c55e',
                  color: '#22c55e',
                  boxShadow: '0 0 0 2px #fff',
                  '&::after': {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    animation: 'ripple 1.5s infinite ease-in-out',
                    border: '1px solid currentColor',
                    content: '""'
                  }
                },
                '@keyframes ripple': {
                  '0%': { transform: 'scale(.8)', opacity: 1 },
                  '100%': { transform: 'scale(2.2)', opacity: 0 }
                }
              }}
            >
              <Avatar sx={{ width: 34, height: 34 }} alt={user?.displayName} src={user?.avatar} />
            </Badge>
          ) : (
            <Avatar sx={{ width: 34, height: 34 }} alt={user?.displayName} src={user?.avatar} />
          )}
        </Tooltip>
        {isOwner && !userIsOwner &&
          <IconButton size="small" onClick={() => handleRemoveMember(user)} aria-label={`${t('board.remove')} ${user?.displayName || ''}`}>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        }
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', gap: '4px' }}>
      {/* display limit number of users */}
      {boardUsers.filter(user => !excludeUserId || user?._id?.toString() !== excludeUserId?.toString()).map((user, index) => index < limit ? renderUser(user, index) : null)}

      {/* if the number of users exceeds the limit, show the "+number" button */}
      {boardUsers.filter(user => !excludeUserId || user?._id?.toString() !== excludeUserId?.toString()).length > limit &&
        <Tooltip title={t('common.showMore')}>
          <Box
            aria-describedby={popoverId}
            onClick={handleTogglePopover}
            sx={{
              width: 36,
              height: 36,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: '500',
              borderRadius: '50%',
              color: 'white',
              backgroundColor: '#a4b0be'
            }}
          >
            +{boardUsers.filter(user => !excludeUserId || user?._id?.toString() !== excludeUserId?.toString()).length - limit}
          </Box>
        </Tooltip>
      }

      {/* popover to show all users */}
      <Popover
        id={popoverId}
        open={isOpenPopover}
        anchorEl={anchorPopoverElement}
        onClose={handleTogglePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, maxWidth: '235px', display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {boardUsers.map(renderUser)}
        </Box>
      </Popover>
    </Box>
  )
}

export default BoardUserGroup
