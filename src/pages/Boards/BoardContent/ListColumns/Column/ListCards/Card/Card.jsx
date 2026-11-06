import { memo } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import MuiCard from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import GroupIcon from '@mui/icons-material/Group'
import CommentIcon from '@mui/icons-material/Comment'
import AttachmentIcon from '@mui/icons-material/Attachment'
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined'
import WatchLaterOutlinedIcon from '@mui/icons-material/WatchLaterOutlined'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useDispatch } from 'react-redux'
import dayjs from 'dayjs'
import { updateCurrentActiveCard, showModalActiveCard } from '~/redux/activeCard/activeCardSlice'
import { useSearchParams } from 'react-router-dom'

// eslint-disable-next-line react-refresh/only-export-components -- export qua memo() là pattern chuẩn, plugin react-refresh 0.3.x không nhận diện
function Card({ card }) {
  const dispatch = useDispatch()
  const [, setSearchParams] = useSearchParams()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card._id, data: { ...card } })

  const dndKitCardStyles = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    border: isDragging ? '1px solid #2ecc71' : undefined
  }

  const totalChecklistItems = card?.checklists?.reduce((sum, cl) => sum + (cl.items?.length || 0), 0) || 0
  const completedChecklistItems = card?.checklists?.reduce((sum, cl) => sum + (cl.items?.filter(i => i.isDone).length || 0), 0) || 0
  const isAllChecklistDone = totalChecklistItems > 0 && totalChecklistItems === completedChecklistItems

  const shouldShowCardActions = (targetCard) => {
    const totalItems = targetCard?.checklists?.reduce((sum, cl) => sum + (cl.items?.length || 0), 0) || 0
    return (
      !!targetCard?.memberIds?.length ||
      !!targetCard?.comments?.length ||
      !!targetCard?.attachments?.length ||
      !!targetCard?.dueDate ||
      totalItems > 0
    )
  }

  const setActiveCard = (targetCard) => {
    dispatch(updateCurrentActiveCard(targetCard))
    dispatch(showModalActiveCard())
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('cardId', targetCard._id)
      return next
    })
  }

  return (
    <MuiCard
      onClick={() => setActiveCard(card)}
      ref={setNodeRef} style={dndKitCardStyles} {...attributes} {...listeners}
      sx={{
        cursor: 'pointer',
        boxShadow: '0 1px 1px rgba(0, 0, 0, 0.2)',
        overflow: 'unset',
        display: card?.FE_PlaceholderCard ? 'none' : 'block',
        border: '1px solid transparent',
        '&:hover': { borderColor: (theme) => theme.palette.primary.main }
      }}>
      {card?.cover && (
        String(card.cover).startsWith('http')
          ? <CardMedia sx={{ height: 140 }} image={card?.cover} />
          : <Box sx={{ height: 140, background: card.cover }} />
      )}

      <CardContent sx={{ p: 1.5, '&:last-child': { p: 1.5 } }}>
        {!!card?.labels?.length && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 0.8 }}>
            {card.labels.map((label, index) => (
              <Box
                key={index}
                sx={{
                  height: '8px',
                  minWidth: '40px',
                  borderRadius: '4px',
                  bgcolor: label.color
                }}
                title={label.title}
              />
            ))}
          </Box>
        )}
        <Typography>{card?.title}</Typography>
      </CardContent>
      {shouldShowCardActions(card) &&
        <CardActions sx={{ p: '1px 12px', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
          {/* Due date badge */}
          {!!card?.dueDate && (
            <Button
              size="small"
              startIcon={<WatchLaterOutlinedIcon fontSize="small" />}
              sx={{
                fontSize: '0.75rem',
                ...(card.isDueDateComplete && {
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#2e7d32' : '#61bd4f'),
                  color: 'white !important',
                  fontWeight: 600,
                  '& .MuiButton-startIcon': { color: 'white' },
                  '&:hover': { bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#1b5e20' : '#519839') }
                }),
                ...(!card.isDueDateComplete && dayjs(card.dueDate).isBefore(dayjs()) && {
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#c62828' : '#eb5a46'),
                  color: 'white !important',
                  fontWeight: 600,
                  '& .MuiButton-startIcon': { color: 'white' },
                  '&:hover': { bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#b71c1c' : '#cf513d') }
                }),
                ...(!card.isDueDateComplete && !dayjs(card.dueDate).isBefore(dayjs()) && (card?.reminderMinutes !== null && card?.reminderMinutes !== undefined ? dayjs(card.dueDate).diff(dayjs(), 'minute') <= card.reminderMinutes : dayjs(card.dueDate).diff(dayjs(), 'hour') <= 24) && {
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#ef6c00' : '#f2d600'),
                  color: (theme) => (theme.palette.mode === 'dark' ? 'white !important' : '#172b4d !important'),
                  fontWeight: 600,
                  '& .MuiButton-startIcon': { color: (theme) => (theme.palette.mode === 'dark' ? 'white' : '#172b4d') },
                  '&:hover': { bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#e65100' : '#d9bf00') }
                })
              }}
            >
              {dayjs(card.dueDate).format('MMM D')}
            </Button>
          )}

          {totalChecklistItems > 0 && (
            <Button
              size="small"
              startIcon={<TaskAltOutlinedIcon fontSize="small" />}
              sx={{
                ...(isAllChecklistDone && {
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#2e7d32' : '#61bd4f'),
                  color: 'white !important',
                  fontWeight: 600,
                  '& .MuiButton-startIcon': { color: 'white' },
                  '&:hover': {
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#1b5e20' : '#519839')
                  }
                })
              }}
            >
              {completedChecklistItems}/{totalChecklistItems}
            </Button>
          )}

          {!!card?.memberIds?.length && <Button size="small" startIcon={<GroupIcon />}>{card?.memberIds?.length}</Button>}
          {!!card?.comments?.length && <Button size="small" startIcon={<CommentIcon />}>{card?.comments?.length}</Button>}
          {!!card?.attachments?.length && <Button size="small" startIcon={<AttachmentIcon />}>{card?.attachments?.length}</Button>}
        </CardActions>
      }
    </MuiCard>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- export qua memo() là pattern chuẩn, plugin react-refresh 0.3.x không nhận diện
export default memo(Card)
