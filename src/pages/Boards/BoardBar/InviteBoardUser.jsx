import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import Popover from '@mui/material/Popover'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import TextField from '@mui/material/TextField'
import { useForm } from 'react-hook-form'
import { EMAIL_RULE, FIELD_REQUIRED_MESSAGE, EMAIL_RULE_MESSAGE } from '~/utils/validators'
import FieldErrorAlert from '~/components/Form/FieldErrorAlert'
import { inviteUserToBoardAPI } from '~/apis'
import { useTranslation } from 'react-i18next'
import { socketIoInstance } from '~/socketClient'

function InviteBoardUser({ boardId, board }) {
  const { t } = useTranslation()
  /**
   * Xử lý Popover để ẩn hoặc hiện một popup nhỏ, tương tự docs để tham khảo ở đây:
   * https://mui.com/material-ui/react-popover/
  */
  const [anchorPopoverElement, setAnchorPopoverElement] = useState(null)
  const isOpenPopover = Boolean(anchorPopoverElement)
  const popoverId = isOpenPopover ? 'invite-board-user-popover' : undefined
  const handleTogglePopover = (event) => {
    if (!anchorPopoverElement) setAnchorPopoverElement(event.currentTarget)
    else setAnchorPopoverElement(null)
  }

  const { register, handleSubmit, setValue, formState: { errors } } = useForm()
  const submitInviteUserToBoard = (data) => {
    const { inviteeEmail } = data

    // call api to invite user to board
    inviteUserToBoardAPI({ inviteeEmail, boardId }).then(invitation => {
      // Clear input and close popover
      setValue('inviteeEmail', null)
      setAnchorPopoverElement(null)

      // invite successfully, also have an totice to user invited (real time)
      socketIoInstance.emit('FE_USER_INVITED_TO_BOARD', invitation)
    })

  }

  return (
    <Box>
      <Tooltip title={t('board.inviteUser')}>
        <Button
          aria-describedby={popoverId}
          onClick={handleTogglePopover}
          variant="outlined"
          startIcon={<PersonAddIcon />}
          sx={{
            color: 'white',
            borderColor: 'white',
            '&:hover': { borderColor: 'white' },
            // Mobile: thu gọn còn icon để BoardBar không bị tràn ngang
            minWidth: { xs: 0, sm: 64 },
            px: { xs: 1.25, sm: 2 }
          }}
        >
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
            {t('board.invite')}
          </Box>
        </Button>
      </Tooltip>

      {/* Khi Click vào butotn Invite ở trên thì sẽ mở popover */}
      <Popover
        id={popoverId}
        open={isOpenPopover}
        anchorEl={anchorPopoverElement}
        onClose={handleTogglePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <form onSubmit={handleSubmit(submitInviteUserToBoard)} style={{ width: '340px', maxWidth: 'calc(100vw - 32px)' }}>
          <Box sx={{ p: '15px 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="span" sx={{ fontWeight: 'bold', fontSize: '16px' }}>{t('board.inviteUser')}</Typography>
            <Box>
              <TextField
                autoFocus
                fullWidth
                label={t('board.inviteEmailPlaceholder')}
                type="text"
                variant="outlined"
                {...register('inviteeEmail', {
                  required: FIELD_REQUIRED_MESSAGE,
                  pattern: { value: EMAIL_RULE, message: EMAIL_RULE_MESSAGE }
                })}
                error={!!errors['inviteeEmail']}
              />
              <FieldErrorAlert errors={errors} fieldName={'inviteeEmail'} />
            </Box>

            <Box sx={{ alignSelf: 'flex-end' }}>
              <Button
                className="interceptor-loading"
                type="submit"
                variant="contained"
                color="info"
              >
                {t('board.invite')}
              </Button>
            </Box>

            {/* Danh sách thành viên hiện tại của bảng */}
            {(board?.FE_allUsers || []).length > 0 && (
              <>
                <Divider />
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {t('board.currentMembers')} ({board.FE_allUsers.length})
                  </Typography>
                  <Box sx={{ mt: 1, maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1, pr: 0.5 }}>
                    {board.FE_allUsers.map((user) => {
                      const userIsOwner = (board?.ownerIds || []).some(id => id?.toString() === user?._id?.toString())
                      return (
                        <Box key={user?._id} sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                          <Avatar sx={{ width: 30, height: 30 }} alt={user?.displayName} src={user?.avatar} />
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user?.displayName || 'User'}
                              </Typography>
                              {userIsOwner && (
                                <Chip size="small" label={t('board.ownerBadge')} sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, bgcolor: 'rgba(0, 82, 204, 0.12)', color: '#0052cc' }} />
                              )}
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {user?.email}
                            </Typography>
                          </Box>
                        </Box>
                      )
                    })}
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </form>
      </Popover>
    </Box>
  )
}

export default InviteBoardUser
