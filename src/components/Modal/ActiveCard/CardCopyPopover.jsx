import { useState, useEffect, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import cloneDeep from 'lodash/cloneDeep'
import Popover from '@mui/material/Popover'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import CloseIcon from '@mui/icons-material/Close'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { copyCardAPI } from '~/apis'
import { updateCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'

function CardCopyPopover({ anchorEl, isOpen, onClose, card, board }) {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const columns = useMemo(() => board?.columns || [], [board?.columns])

  const [title, setTitle] = useState('')
  const [targetColumnId, setTargetColumnId] = useState('')
  const [targetPosition, setTargetPosition] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Keep options
  const [keepChecklists, setKeepChecklists] = useState(true)
  const [keepLabels, setKeepLabels] = useState(true)
  const [keepAttachments, setKeepAttachments] = useState(true)
  const [keepDueDate, setKeepDueDate] = useState(true)
  const [keepMembers, setKeepMembers] = useState(true)
  const [keepCover, setKeepCover] = useState(true)
  const [keepDescription, setKeepDescription] = useState(true)

  // Khởi tạo form khi mở popover
  useEffect(() => {
    if (isOpen && card) {
      setTitle(card.title || '')
      const colId = card.columnId || (columns[0]?._id ?? '')
      setTargetColumnId(colId)

      const currentCol = columns.find(c => c._id === colId)
      const nonPlaceholderCards = (currentCol?.cards || []).filter(c => !c.FE_PlaceholderCard)
      const currentIndex = nonPlaceholderCards.findIndex(c => c._id === card._id)

      // Mặc định đặt ngay sau thẻ hiện tại
      setTargetPosition(currentIndex >= 0 ? currentIndex + 2 : nonPlaceholderCards.length + 1)

      setKeepChecklists(true)
      setKeepLabels(true)
      setKeepAttachments(true)
      setKeepDueDate(true)
      setKeepMembers(true)
      setKeepCover(true)
      setKeepDescription(true)
    }
  }, [isOpen, card, columns])

  const selectedCol = useMemo(() => {
    return columns.find(c => c._id === targetColumnId)
  }, [columns, targetColumnId])

  // Danh sách các vị trí khả dụng (1 đến N + 1)
  const positionOptions = useMemo(() => {
    if (!selectedCol) return [1]
    const nonPlaceholderCards = (selectedCol.cards || []).filter(c => !c.FE_PlaceholderCard)
    const count = nonPlaceholderCards.length + 1
    return Array.from({ length: Math.max(1, count) }, (_, i) => i + 1)
  }, [selectedCol])

  const handleColumnChange = (newColId) => {
    setTargetColumnId(newColId)
    const col = columns.find(c => c._id === newColId)
    const nonPlaceholderCards = (col?.cards || []).filter(c => !c.FE_PlaceholderCard)

    if (newColId === card?.columnId) {
      const currentIndex = nonPlaceholderCards.findIndex(c => c._id === card._id)
      setTargetPosition(currentIndex >= 0 ? currentIndex + 2 : nonPlaceholderCards.length + 1)
    } else {
      setTargetPosition(nonPlaceholderCards.length + 1)
    }
  }

  const handleCopyCard = async () => {
    if (!card || !title.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const targetIndex = targetPosition - 1
      const createdCard = await copyCardAPI(card._id, {
        title: title.trim(),
        columnId: targetColumnId,
        position: targetIndex,
        keepOptions: {
          checklists: keepChecklists,
          labels: keepLabels,
          attachments: keepAttachments,
          dueDate: keepDueDate,
          members: keepMembers,
          cover: keepCover,
          description: keepDescription
        }
      })

      // Cập nhật Redux activeBoard
      const newBoard = cloneDeep(board)
      const targetCol = newBoard.columns.find(c => c._id === targetColumnId)
      if (targetCol) {
        targetCol.cards = (targetCol.cards || []).filter(c => !c.FE_PlaceholderCard)
        targetCol.cardOrderIds = (targetCol.cardOrderIds || []).filter(id => !id.includes('placeholder-card'))

        targetCol.cards.splice(targetIndex, 0, createdCard)
        targetCol.cardOrderIds.splice(targetIndex, 0, createdCard._id)

        dispatch(updateCurrentActiveBoard(newBoard))
      }

      toast.success('Card copied successfully!')
      onClose()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to copy card')
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasChecklists = Boolean(card?.checklists?.length)
  const hasLabels = Boolean(card?.labels?.length)
  const hasAttachments = Boolean(card?.attachments?.length)
  const hasDueDate = Boolean(card?.dueDate)
  const hasMembers = Boolean(card?.memberIds?.length)
  const hasCover = Boolean(card?.cover)
  const hasDescription = Boolean(card?.description)
  const hasAnyKeepOption = hasChecklists || hasLabels || hasAttachments || hasDueDate || hasMembers || hasCover || hasDescription

  return (
    <Popover
      open={isOpen}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      slotProps={{
        paper: {
          sx: {
            width: { xs: 'min(330px, 88vw)', sm: 330 },
            p: 2,
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)'
          }
        }
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ContentCopyOutlinedIcon fontSize="small" color="primary" />
          <Typography variant="subtitle1" fontWeight={700}>
            Copy Card
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} aria-label="close">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Title */}
      <Typography variant="caption" fontWeight={600} sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
        TITLE
      </Typography>
      <TextField
        fullWidth
        size="small"
        multiline
        rows={2}
        placeholder={t('cardModal.enterTitleForThisCard')}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        sx={{ mb: 2 }}
      />

      {/* Keep options */}
      {hasAnyKeepOption && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" fontWeight={600} sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
            KEEP...
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
            {hasChecklists && (
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={keepChecklists}
                    onChange={(e) => setKeepChecklists(e.target.checked)}
                    sx={{ p: 0.5 }}
                  />
                }
                label={<Typography variant="body2">Checklists ({card.checklists.length})</Typography>}
              />
            )}
            {hasLabels && (
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={keepLabels}
                    onChange={(e) => setKeepLabels(e.target.checked)}
                    sx={{ p: 0.5 }}
                  />
                }
                label={<Typography variant="body2">Labels ({card.labels.length})</Typography>}
              />
            )}
            {hasAttachments && (
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={keepAttachments}
                    onChange={(e) => setKeepAttachments(e.target.checked)}
                    sx={{ p: 0.5 }}
                  />
                }
                label={<Typography variant="body2">Attachments ({card.attachments.length})</Typography>}
              />
            )}
            {hasDueDate && (
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={keepDueDate}
                    onChange={(e) => setKeepDueDate(e.target.checked)}
                    sx={{ p: 0.5 }}
                  />
                }
                label={<Typography variant="body2">Due date</Typography>}
              />
            )}
            {hasMembers && (
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={keepMembers}
                    onChange={(e) => setKeepMembers(e.target.checked)}
                    sx={{ p: 0.5 }}
                  />
                }
                label={<Typography variant="body2">Members ({card.memberIds.length})</Typography>}
              />
            )}
            {hasCover && (
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={keepCover}
                    onChange={(e) => setKeepCover(e.target.checked)}
                    sx={{ p: 0.5 }}
                  />
                }
                label={<Typography variant="body2">Cover image</Typography>}
              />
            )}
            {hasDescription && (
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={keepDescription}
                    onChange={(e) => setKeepDescription(e.target.checked)}
                    sx={{ p: 0.5 }}
                  />
                }
                label={<Typography variant="body2">Description</Typography>}
              />
            )}
          </Box>
        </Box>
      )}

      {/* Destination Section */}
      <Typography variant="caption" fontWeight={600} sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
        COPY TO...
      </Typography>

      {/* Select List */}
      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel id="copy-card-select-column-label">List</InputLabel>
        <Select
          labelId="copy-card-select-column-label"
          value={targetColumnId}
          label="List"
          onChange={(e) => handleColumnChange(e.target.value)}
        >
          {columns.map((col) => (
            <MenuItem key={col._id} value={col._id}>
              {col.title} {col._id === card?.columnId ? '(current)' : ''}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Select Position */}
      <FormControl fullWidth size="small" sx={{ mb: 2.5 }}>
        <InputLabel id="copy-card-select-position-label">{t('cardModal.position')}</InputLabel>
        <Select
          labelId="copy-card-select-position-label"
          value={targetPosition}
          label={t('cardModal.position')}
          onChange={(e) => setTargetPosition(Number(e.target.value))}
        >
          {positionOptions.map((pos) => (
            <MenuItem key={pos} value={pos}>
              {pos}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Submit Button */}
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleCopyCard}
        disabled={isSubmitting || !title.trim()}
        sx={{ fontWeight: 600, py: 0.8 }}
      >
        {isSubmitting ? t('cardModal.creating') : t('cardModal.createCard')}
      </Button>
    </Popover>
  )
}

export default CardCopyPopover

