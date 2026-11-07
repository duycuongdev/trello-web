import { useState } from 'react'
import dayjs from 'dayjs'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { useConfirm } from 'material-ui-confirm'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'

function CardActivitySection({
  cardComments = [],
  onAddCardComment,
  onUpdateCardComment,
  onDeleteCardComment,
  boardOwnerIds = []
}) {
  const { t } = useTranslation()
  const currentUser = useSelector(selectCurrentUser)
  const confirmDeleteComment = useConfirm()

  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editingContent, setEditingContent] = useState('')

  const handleAddCardComment = (event) => {
    // Bắt hành động người dùng nhấn phím Enter && không phải hành động Shift + Enter
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault() // Thêm dòng này để khi Enter không bị nhảy dòng
      if (!event.target?.value) return // Nếu không có giá trị gì thì return không làm gì cả

      // Tạo một biến comment data để gửi api
      const commentToAdd = {
        userAvatar: currentUser?.avatar,
        userDisplayName: currentUser?.displayName,
        content: event.target.value.trim()
      }
      onAddCardComment(commentToAdd).then(() => {
        event.target.value = ''
      })
    }
  }

  const handleStartEdit = (comment) => {
    const commentId = comment._id || comment.commentedAt?.toString()
    setEditingCommentId(commentId)
    setEditingContent(comment.content || '')
  }

  const handleCancelEdit = () => {
    setEditingCommentId(null)
    setEditingContent('')
  }

  const handleSaveEdit = (comment) => {
    const trimmed = editingContent.trim()
    if (!trimmed) {
      toast.error(t('card.commentEmpty'))
      return
    }

    const commentId = comment._id || comment.commentedAt?.toString()
    if (onUpdateCardComment) {
      onUpdateCardComment(commentId, trimmed)
        .then(() => {
          // Không toast success - bình luận mới hiển thị ngay trong activity
          handleCancelEdit()
        })
        .catch(() => {})
    }
  }

  const handleDelete = (comment) => {
    const commentId = comment._id || comment.commentedAt?.toString()

    confirmDeleteComment({
      title: t('card.deleteCommentTitle'),
      description: t('card.deleteCommentDesc'),
      confirmationText: t('common.delete'),
      cancellationText: t('common.cancel')
    })
      .then(() => {
        if (onDeleteCardComment) {
          onDeleteCardComment(commentId)
            // Không toast success - bình luận biến mất khỏi activity ngay lập tức
            .catch(() => {})
        }
      })
      .catch(() => {})
  }

  return (
    <Box sx={{ mt: 2 }}>
      {/* Xử lý thêm comment vào Card */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Avatar
          sx={{ width: 36, height: 36, cursor: 'pointer' }}
          alt={currentUser?.displayName || 'Avatar'}
          src={currentUser?.avatar}
        />
        <TextField
          fullWidth
          placeholder={t('card.commentPlaceholder')}
          type="text"
          variant="outlined"
          multiline
          onKeyDown={handleAddCardComment}
        />
      </Box>

      {/* Hiển thị danh sách các comments */}
      {cardComments.length === 0 && (
        <Typography sx={{ pl: '45px', fontSize: '14px', fontWeight: '500', color: '#b1b1b1' }}>
          {t('card.noActivity')}
        </Typography>
      )}

      {cardComments.map((comment, index) => {
        const commentId = comment._id || comment.commentedAt?.toString() || index.toString()
        const isEditing = editingCommentId === commentId

        const isAuthor = Boolean(currentUser?._id && comment?.userId && currentUser._id.toString() === comment.userId.toString())
        const isOwner = Boolean(currentUser?._id && boardOwnerIds?.some(id => id.toString() === currentUser._id.toString()))
        const canEdit = isAuthor
        const canDelete = isAuthor || isOwner

        return (
          <Box sx={{ display: 'flex', gap: 1, width: '100%', mb: 1.5 }} key={commentId}>
            <Tooltip title={comment.userDisplayName}>
              <Avatar
                sx={{ width: 36, height: 36, cursor: 'pointer' }}
                alt={comment.userDisplayName}
                src={comment.userAvatar}
              />
            </Tooltip>
            <Box sx={{ width: 'inherit' }}>
              <Typography variant="span" sx={{ fontWeight: 'bold', mr: 1 }}>
                {comment.userDisplayName}
              </Typography>

              <Typography variant="span" sx={{ fontSize: '12px', color: 'text.secondary' }}>
                {dayjs(comment.commentedAt).format('ddd, MMM D, YYYY h:mm A')}
              </Typography>

              {comment.editedAt && (
                <Typography variant="span" sx={{ fontSize: '11px', fontStyle: 'italic', color: 'text.secondary', ml: 1 }}>
                  (edited)
                </Typography>
              )}

              {isEditing ? (
                <Box sx={{ mt: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSaveEdit(comment)
                      }
                    }}
                    autoFocus
                    sx={{
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? '#2f3542' : '#fff'
                    }}
                  />
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleSaveEdit(comment)}
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                      Save
                    </Button>
                    <Button
                      variant="text"
                      size="small"
                      color="inherit"
                      onClick={handleCancelEdit}
                      sx={{ textTransform: 'none' }}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              ) : (
                <>
                  <Box sx={{
                    display: 'block',
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? '#33485D' : 'white',
                    p: '8px 12px',
                    mt: '4px',
                    border: '0.5px solid rgba(0, 0, 0, 0.2)',
                    borderRadius: '4px',
                    wordBreak: 'break-word',
                    boxShadow: '0 0 1px rgba(0, 0, 0, 0.2)'
                  }}>
                    {comment.content}
                  </Box>

                  {(canEdit || canDelete) && (
                    <Box sx={{ display: 'flex', gap: 1.5, mt: 0.5, pl: 0.5 }}>
                      {canEdit && (
                        <Typography
                          variant="caption"
                          onClick={() => handleStartEdit(comment)}
                          sx={{
                            cursor: 'pointer',
                            color: 'text.secondary',
                            textDecoration: 'underline',
                            '&:hover': { color: 'primary.main' }
                          }}
                        >
                          Edit
                        </Typography>
                      )}
                      {canDelete && (
                        <Typography
                          variant="caption"
                          onClick={() => handleDelete(comment)}
                          sx={{
                            cursor: 'pointer',
                            color: 'text.secondary',
                            textDecoration: 'underline',
                            '&:hover': { color: 'error.main' }
                          }}
                        >
                          Delete
                        </Typography>
                      )}
                    </Box>
                  )}
                </>
              )}
            </Box>
          </Box>
        )
      })}
    </Box>
  )
}

export default CardActivitySection
