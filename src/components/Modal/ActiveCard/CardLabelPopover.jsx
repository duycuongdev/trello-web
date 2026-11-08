import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import CheckIcon from '@mui/icons-material/Check'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { selectCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'
import { useTranslation } from 'react-i18next'

const LABEL_PALETTE = [
  '#2e7d32', // Green
  '#ed6c02', // Orange
  '#d32f2f', // Red
  '#9c27b0', // Purple
  '#0288d1', // Blue
  '#00897b', // Teal
  '#e91e63', // Pink
  '#ffb300', // Amber
  '#3f51b5', // Indigo
  '#546e7a' // Slate
]

function CardLabelPopover({ anchorEl, isOpen, onClose, activeCardLabels = [], onUpdateCardLabels }) {
  const { t } = useTranslation()
  const activeBoard = useSelector(selectCurrentActiveBoard)

  // Danh sách các nhãn thực tế do người dùng tạo (không dùng nhãn mẫu có sẵn)
  const [availableLabels, setAvailableLabels] = useState([])

  const [view, setView] = useState('list') // 'list' | 'create' | 'edit'
  const [editingTarget, setEditingTarget] = useState(null)
  const [inputTitle, setInputTitle] = useState('')
  const [selectedColor, setSelectedColor] = useState(LABEL_PALETTE[0])

  // Khi mở Popover, đồng bộ danh sách tất cả các nhãn thực tế do người dùng tạo từ activeBoard và activeCard
  useEffect(() => {
    if (isOpen) {
      const map = new Map()
      activeBoard?.columns?.forEach(column => {
        column.cards?.forEach(card => {
          if (!card?.FE_PlaceholderCard && Array.isArray(card.labels)) {
            card.labels.forEach(l => {
              if (l && l.color) {
                const title = (l.title || '').trim()
                map.set(`${l.color}___${title}`, { color: l.color, title })
              }
            })
          }
        })
      })
      activeCardLabels.forEach(l => {
        if (l && l.color) {
          const title = (l.title || '').trim()
          map.set(`${l.color}___${title}`, { color: l.color, title })
        }
      })
      setAvailableLabels(Array.from(map.values()))
      setView('list')
      setEditingTarget(null)
      setInputTitle('')
    }
  }, [isOpen, activeBoard, activeCardLabels])

  const handleClose = () => {
    setView('list')
    setEditingTarget(null)
    setInputTitle('')
    onClose()
  }

  const handleToggleCardLabel = (label) => {
    const isExisted = activeCardLabels.some(l =>
      l.color === label.color && (l.title || '').trim() === (label.title || '').trim()
    )
    let newLabels = []
    if (isExisted) {
      newLabels = activeCardLabels.filter(l =>
        !(l.color === label.color && (l.title || '').trim() === (label.title || '').trim())
      )
    } else {
      newLabels = [...activeCardLabels, label]
    }
    onUpdateCardLabels(newLabels)
  }

  const handleOpenCreateView = () => {
    setInputTitle('')
    setSelectedColor(LABEL_PALETTE[0])
    setView('create')
  }

  const handleOpenEditView = (label, e) => {
    e.stopPropagation()
    setEditingTarget(label)
    setInputTitle(label.title || '')
    setSelectedColor(label.color)
    setView('edit')
  }

  const handleSaveCreate = () => {
    const trimmedTitle = inputTitle.trim()
    const newLabel = {
      title: trimmedTitle,
      color: selectedColor
    }
    setAvailableLabels(prev => {
      const exists = prev.some(l => l.color === newLabel.color && (l.title || '').trim() === trimmedTitle)
      return exists ? prev : [...prev, newLabel]
    })
    // Tự động gán nhãn mới tạo vào card
    const isExisted = activeCardLabels.some(l =>
      l.color === newLabel.color && (l.title || '').trim() === trimmedTitle
    )
    if (!isExisted) {
      onUpdateCardLabels([...activeCardLabels, newLabel])
    }
    setView('list')
  }

  const handleSaveEdit = () => {
    if (!editingTarget) return
    const trimmedTitle = inputTitle.trim()
    const updatedLabel = {
      title: trimmedTitle,
      color: selectedColor
    }

    // Cập nhật trong danh sách availableLabels
    setAvailableLabels(prev => prev.map(l =>
      (l.color === editingTarget.color && (l.title || '').trim() === (editingTarget.title || '').trim())
        ? updatedLabel
        : l
    ))

    // Cập nhật lại trong card nếu card đang gắn nhãn này
    const isSelected = activeCardLabels.some(l =>
      l.color === editingTarget.color && (l.title || '').trim() === (editingTarget.title || '').trim()
    )
    if (isSelected) {
      const newLabels = activeCardLabels.map(l =>
        (l.color === editingTarget.color && (l.title || '').trim() === (editingTarget.title || '').trim())
          ? updatedLabel
          : l
      )
      onUpdateCardLabels(newLabels)
    }

    setView('list')
    setEditingTarget(null)
  }

  const handleDeleteLabel = () => {
    if (!editingTarget) return
    setAvailableLabels(prev => prev.filter(l =>
      !(l.color === editingTarget.color && (l.title || '').trim() === (editingTarget.title || '').trim())
    ))

    // Gỡ nhãn khỏi card nếu đang gắn
    const newLabels = activeCardLabels.filter(l =>
      !(l.color === editingTarget.color && (l.title || '').trim() === (editingTarget.title || '').trim())
    )
    onUpdateCardLabels(newLabels)

    setView('list')
    setEditingTarget(null)
  }

  return (
    <Popover
      open={isOpen}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left'
      }}
    >
      <Box sx={{ p: 2, width: { xs: 'min(300px, 88vw)', sm: '300px' }, maxWidth: '88vw' }}>
        {/* VIEW: LIST LABELS */}
        {view === 'list' && (
          <Box>
            <Typography sx={{ fontWeight: '600', mb: 1.5, textAlign: 'center', fontSize: '15px' }}>
              {t('cardModal.labelsTitle')}
            </Typography>

            {availableLabels.length === 0 ? (
              <Box sx={{
                py: 2.5,
                px: 1.5,
                textAlign: 'center',
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f4f5f7'),
                borderRadius: 1.5,
                border: '1px dashed',
                borderColor: 'divider',
                mb: 1.5
              }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.85rem' }}>
                  {t('cardModal.noLabels')}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled', mt: 0.5, display: 'block' }}>
                  {t('cardModal.noLabelsHint')}
                </Typography>
              </Box>
            ) : (
              <Stack
                spacing={1}
                sx={{
                  maxHeight: '260px',
                  overflowY: 'auto',
                  pr: 0.5
                }}
              >
                {availableLabels.map((label, idx) => {
                  const isSelected = activeCardLabels.some(l =>
                    l.color === label.color && (l.title || '').trim() === (label.title || '').trim()
                  )
                  return (
                    <Box
                      key={`${label.color}-${label.title}-${idx}`}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <Box
                        onClick={() => handleToggleCardLabel(label)}
                        sx={{
                          flexGrow: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          bgcolor: label.color,
                          color: '#fff',
                          px: 1.5,
                          py: 0.8,
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '13px',
                          transition: 'opacity 0.2s',
                          minHeight: '34px',
                          minWidth: 0,
                          '&:hover': { opacity: 0.88 }
                        }}
                      >
                        <Typography
                          variant="span"
                          noWrap
                          sx={{
                            fontWeight: 600,
                            fontSize: '13px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {label.title || '\u00A0'}
                        </Typography>
                        {isSelected && <CheckIcon fontSize="small" sx={{ flexShrink: 0, ml: 1 }} />}
                      </Box>

                      <IconButton
                        size="small"
                        onClick={(e) => handleOpenEditView(label, e)}
                        sx={{ p: 0.5, flexShrink: 0 }}
                        title={t('cardModal.editLabel')}
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )
                })}
              </Stack>
            )}

            <Divider sx={{ my: 1.5 }} />

            <Button
              variant="outlined"
              size="small"
              fullWidth
              onClick={handleOpenCreateView}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              {t('cardModal.createNewLabel')}
            </Button>
          </Box>
        )}

        {/* VIEW: CREATE OR EDIT LABEL */}
        {(view === 'create' || view === 'edit') && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, position: 'relative' }}>
              <IconButton size="small" onClick={() => setView('list')} sx={{ p: 0.5 }} aria-label={t('common.close')}>
                <ArrowBackIosNewIcon sx={{ fontSize: '14px' }} />
              </IconButton>
              <Typography sx={{ fontWeight: '600', flexGrow: 1, textAlign: 'center', fontSize: '15px' }}>
                {view === 'create' ? t('cardModal.createLabel') : t('cardModal.editLabel')}
              </Typography>
            </Box>

            <Typography sx={{ fontSize: '12px', fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>
              {t('common.title')}
            </Typography>
            <TextField
              size="small"
              fullWidth
              placeholder={t('card.labelTitlePlaceholder')}
              value={inputTitle}
              onChange={(e) => setInputTitle(e.target.value)}
              sx={{ mb: 2 }}
              autoFocus
            />

            <Typography sx={{ fontSize: '12px', fontWeight: 600, color: 'text.secondary', mb: 1 }}>
              {t('cardModal.selectColor')}
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1, mb: 2.5 }}>
              {LABEL_PALETTE.map((color) => {
                const isCurrent = selectedColor === color
                return (
                  <Box
                    key={color}
                    role="button"
                    tabIndex={0}
                    aria-label={color}
                    aria-pressed={isCurrent}
                    onClick={() => setSelectedColor(color)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setSelectedColor(color)
                      }
                    }}
                    sx={{
                      height: '32px',
                      borderRadius: '4px',
                      bgcolor: color,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      outline: isCurrent ? '2px solid' : 'none',
                      outlineColor: 'primary.main',
                      outlineOffset: '2px',
                      '&:hover': { opacity: 0.85 }
                    }}
                  >
                    {isCurrent && <CheckIcon sx={{ fontSize: '18px' }} />}
                  </Box>
                )
              })}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
              <Button
                variant="contained"
                size="small"
                fullWidth
                onClick={view === 'create' ? handleSaveCreate : handleSaveEdit}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                {t('common.save')}
              </Button>

              {view === 'edit' && (
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={handleDeleteLabel}
                  startIcon={<DeleteOutlineIcon fontSize="small" />}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  {t('common.delete')}
                </Button>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Popover>
  )
}

export default CardLabelPopover
