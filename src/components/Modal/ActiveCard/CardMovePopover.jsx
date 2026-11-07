import { useState, useEffect, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import cloneDeep from 'lodash/cloneDeep'
import Popover from '@mui/material/Popover'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import { useTranslation } from 'react-i18next'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import CloseIcon from '@mui/icons-material/Close'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import { toast } from 'react-toastify'
import { updateColumnDetailsAPI, moveCardToDifferentColumnAPI } from '~/apis'
import { updateCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'
import { updateCurrentActiveCard } from '~/redux/activeCard/activeCardSlice'
import { generatePlaceholderCard } from '~/utils/formatter'

function CardMovePopover({ anchorEl, isOpen, onClose, card, board }) {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const columns = useMemo(() => board?.columns || [], [board?.columns])

  const [targetColumnId, setTargetColumnId] = useState('')
  const [targetPosition, setTargetPosition] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Khi mở Popover, thiết lập cột ban đầu là cột của thẻ hiện tại
  useEffect(() => {
    if (isOpen && card) {
      const colId = card.columnId || (columns[0]?._id ?? '')
      setTargetColumnId(colId)

      const currentCol = columns.find(c => c._id === colId)
      const nonPlaceholderCards = (currentCol?.cards || []).filter(c => !c.FE_PlaceholderCard)
      const currentIndex = nonPlaceholderCards.findIndex(c => c._id === card._id)
      setTargetPosition(currentIndex >= 0 ? currentIndex + 1 : 1)
    }
  }, [isOpen, card, columns])

  // Cột được chọn hiện tại
  const selectedCol = useMemo(() => {
    return columns.find(c => c._id === targetColumnId)
  }, [columns, targetColumnId])

  // Tính toán số lượng vị trí khả dụng
  const positionOptions = useMemo(() => {
    if (!selectedCol) return [1]
    const nonPlaceholderCards = (selectedCol.cards || []).filter(c => !c.FE_PlaceholderCard)
    const isSameColumn = targetColumnId === card?.columnId
    const count = isSameColumn ? nonPlaceholderCards.length : nonPlaceholderCards.length + 1
    const total = Math.max(1, count)
    return Array.from({ length: total }, (_, i) => i + 1)
  }, [selectedCol, targetColumnId, card?.columnId])

  const handleColumnChange = (newColId) => {
    setTargetColumnId(newColId)
    const col = columns.find(c => c._id === newColId)
    const nonPlaceholderCards = (col?.cards || []).filter(c => !c.FE_PlaceholderCard)
    if (newColId === card?.columnId) {
      const currentIndex = nonPlaceholderCards.findIndex(c => c._id === card._id)
      setTargetPosition(currentIndex >= 0 ? currentIndex + 1 : 1)
    } else {
      // Mặc định đặt ở cuối cột đích
      setTargetPosition(nonPlaceholderCards.length + 1)
    }
  }

  const handleMoveCard = async () => {
    if (!card || !targetColumnId || isSubmitting) return

    const sourceColumnId = card.columnId
    const sourceCol = columns.find(c => c._id === sourceColumnId)
    const nonPlaceholderCards = (sourceCol?.cards || []).filter(c => !c.FE_PlaceholderCard)
    const currentIndex = nonPlaceholderCards.findIndex(c => c._id === card._id)
    const targetIndex = targetPosition - 1

    // Trường hợp cùng cột và cùng vị trí
    if (sourceColumnId === targetColumnId && currentIndex === targetIndex) {
      onClose()
      return
    }

    setIsSubmitting(true)
    try {
      if (sourceColumnId === targetColumnId) {
        // Di chuyển trong cùng 1 cột
        const newBoard = cloneDeep(board)
        const columnToUpdate = newBoard.columns.find(c => c._id === targetColumnId)
        const reorderedCards = (columnToUpdate?.cards || []).filter(c => !c.FE_PlaceholderCard)

        const [movedCard] = reorderedCards.splice(currentIndex, 1)
        reorderedCards.splice(targetIndex, 0, movedCard)

        columnToUpdate.cards = reorderedCards
        columnToUpdate.cardOrderIds = reorderedCards.map(c => c._id)

        dispatch(updateCurrentActiveBoard(newBoard))
        await updateColumnDetailsAPI(targetColumnId, { cardOrderIds: columnToUpdate.cardOrderIds })
      } else {
        // Di chuyển sang cột khác
        const newBoard = cloneDeep(board)
        const srcCol = newBoard.columns.find(c => c._id === sourceColumnId)
        const dstCol = newBoard.columns.find(c => c._id === targetColumnId)

        // 1. Xóa khỏi cột nguồn
        srcCol.cards = (srcCol.cards || []).filter(c => c._id !== card._id)
        srcCol.cardOrderIds = (srcCol.cardOrderIds || []).filter(id => id !== card._id)
        if (srcCol.cards.length === 0) {
          srcCol.cards = [generatePlaceholderCard(srcCol)]
          srcCol.cardOrderIds = [generatePlaceholderCard(srcCol)._id]
        }

        // 2. Chèn vào cột đích
        dstCol.cards = (dstCol.cards || []).filter(c => !c.FE_PlaceholderCard)
        dstCol.cardOrderIds = (dstCol.cardOrderIds || []).filter(id => !id.includes('placeholder-card'))

        const movedCard = { ...card, columnId: targetColumnId }
        dstCol.cards.splice(targetIndex, 0, movedCard)
        dstCol.cardOrderIds.splice(targetIndex, 0, movedCard._id)

        dispatch(updateCurrentActiveBoard(newBoard))
        dispatch(updateCurrentActiveCard(movedCard))

        let prevCardOrderIds = srcCol.cardOrderIds
        if (prevCardOrderIds[0]?.includes('placeholder-card')) prevCardOrderIds = []

        await moveCardToDifferentColumnAPI({
          currentCardId: card._id,
          prevColumnId: sourceColumnId,
          prevCardOrderIds,
          nextColumnId: targetColumnId,
          nextCardOrderIds: dstCol.cardOrderIds
        })
      }

      toast.success('Card moved successfully!')
      onClose()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to move card')
      dispatch(updateCurrentActiveBoard(board))
    } finally {
      setIsSubmitting(false)
    }
  }

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
            width: { xs: 'min(300px, 88vw)', sm: 300 },
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
          <ArrowForwardOutlinedIcon fontSize="small" color="primary" />
          <Typography variant="subtitle1" fontWeight={700}>
            Move Card
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} aria-label="close">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Typography variant="caption" fontWeight={600} sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
        SELECT DESTINATION
      </Typography>

      {/* Select List / Column */}
      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel id="move-card-select-column-label">List</InputLabel>
        <Select
          labelId="move-card-select-column-label"
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
        <InputLabel id="move-card-select-position-label">{t('cardModal.position')}</InputLabel>
        <Select
          labelId="move-card-select-position-label"
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
        onClick={handleMoveCard}
        disabled={isSubmitting}
        sx={{ fontWeight: 600, py: 0.8 }}
      >
        {isSubmitting ? t('cardModal.moving') : t('cardModal.move')}
      </Button>
    </Popover>
  )
}

export default CardMovePopover

