import { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import InputAdornment from '@mui/material/InputAdornment'
import Avatar from '@mui/material/Avatar'
import Checkbox from '@mui/material/Checkbox'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import CloseIcon from '@mui/icons-material/Close'
import CheckIcon from '@mui/icons-material/Check'
import FilterListIcon from '@mui/icons-material/FilterList'
import {
  selectCardFilter,
  setCardFilter,
  clearCardFilter
} from '~/redux/activeBoard/activeBoardSlice'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { useTranslation } from 'react-i18next'

function BoardCardFilterPopover({ anchorEl, isOpen, onClose, board }) {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const cardFilter = useSelector(selectCardFilter)
  const currentUser = useSelector(selectCurrentUser)

  // Tổng hợp tất cả các nhãn thực tế do người dùng tạo và gán vào các thẻ trên board kèm số lượng thẻ
  const availableLabels = useMemo(() => {
    const labelMap = new Map()

    board?.columns?.forEach(column => {
      column.cards?.forEach(card => {
        if (!card?.FE_PlaceholderCard && Array.isArray(card.labels)) {
          const seenInCard = new Set()
          card.labels.forEach(label => {
            if (label && label.color) {
              const title = (label.title || '').trim()
              const id = `${label.color}___${title}`
              if (!labelMap.has(id)) {
                labelMap.set(id, {
                  id,
                  color: label.color,
                  title,
                  count: 0
                })
              }
              if (!seenInCard.has(id)) {
                seenInCard.add(id)
                labelMap.get(id).count += 1
              }
            }
          })
        }
      })
    })

    return Array.from(labelMap.values())
  }, [board])

  // Đếm số lượng thẻ đang hiển thị / tổng số thẻ
  const { totalCards, matchedCards } = useMemo(() => {
    let total = 0
    let matched = 0
    const search = cardFilter?.search?.trim().toLowerCase()
    const filterLabelIds = cardFilter?.labelIds || []
    const onlyMyCards = Boolean(cardFilter?.onlyMyCards)
    const filterMemberIds = cardFilter?.memberIds || []

    board?.columns?.forEach(column => {
      column.cards?.forEach(card => {
        if (!card?.FE_PlaceholderCard) {
          total++
          let isMatch = true
          if (search) {
            const matchTitle = card.title?.toLowerCase().includes(search)
            const matchDesc = card.description?.toLowerCase().includes(search)
            if (!matchTitle && !matchDesc) isMatch = false
          }
          if (filterLabelIds.length > 0) {
            const cardLabelKeys = (card.labels || []).map(l => `${l.color}___${(l.title || '').trim()}`)
            if (!filterLabelIds.some(id => cardLabelKeys.includes(id))) {
              isMatch = false
            }
          }
          // Lọc theo thành viên (OR logic: hiển thị thẻ được gán cho Tôi HOẶC bất kỳ thành viên nào được chọn)
          const targetMemberIds = [
            ...(onlyMyCards && currentUser?._id ? [currentUser._id.toString()] : []),
            ...filterMemberIds.map(id => id.toString())
          ]
          if (targetMemberIds.length > 0) {
            const cardMemberIds = (card.memberIds || []).map(id => id.toString())
            if (!targetMemberIds.some(targetId => cardMemberIds.includes(targetId))) {
              isMatch = false
            }
          }
          if (isMatch) matched++
        }
      })
    })
    return { totalCards: total, matchedCards: matched }
  }, [board, cardFilter, currentUser])

  const hasActiveFilter = Boolean(
    cardFilter?.search ||
    cardFilter?.labelIds?.length > 0 ||
    cardFilter?.onlyMyCards ||
    cardFilter?.memberIds?.length > 0
  )

  const handleToggleLabel = (labelId) => {
    const currentLabelIds = cardFilter.labelIds || []
    const newLabelIds = currentLabelIds.includes(labelId)
      ? currentLabelIds.filter(id => id !== labelId)
      : [...currentLabelIds, labelId]
    dispatch(setCardFilter({ labelIds: newLabelIds }))
  }

  const handleToggleMember = (memberId) => {
    const currentMemberIds = cardFilter.memberIds || []
    const newMemberIds = currentMemberIds.includes(memberId)
      ? currentMemberIds.filter(id => id !== memberId)
      : [...currentMemberIds, memberId]
    dispatch(setCardFilter({ memberIds: newMemberIds }))
  }

  return (
    <Popover
      open={isOpen}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left'
      }}
      slotProps={{
        paper: {
          sx: {
            width: 320,
            maxWidth: 'calc(100vw - 32px)',
            maxHeight: 'calc(100vh - 80px)',
            overflowY: 'auto',
            p: 2,
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
          }
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterListIcon fontSize="small" color="primary" />
          <Typography variant="subtitle1" fontWeight={700}>
            Filter Cards
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} aria-label="close">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {hasActiveFilter && (
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
          Showing <strong>{matchedCards}</strong> of <strong>{totalCards}</strong> cards
        </Typography>
      )}

      {/* Tìm kiếm theo từ khóa */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" fontWeight={600} sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
          KEYWORD
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder={t('board.filterSearchPlaceholder')}
          value={cardFilter.search || ''}
          onChange={(e) => dispatch(setCardFilter({ search: e.target.value }))}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
            endAdornment: cardFilter.search ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => dispatch(setCardFilter({ search: '' }))}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null
          }}
        />
      </Box>

      <Divider sx={{ my: 1.5 }} />

      {/* Lọc theo Thành viên (Members / Only my cards) */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" fontWeight={600} sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
          MEMBERS
        </Typography>

        {/* Nút lọc nhanh: Chỉ thẻ của tôi */}
        <Box
          onClick={() => dispatch(setCardFilter({ onlyMyCards: !cardFilter.onlyMyCards }))}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 1.5,
            py: 1,
            mb: 1,
            borderRadius: 1.5,
            bgcolor: cardFilter.onlyMyCards
              ? (theme) => (theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.2)' : 'primary.50')
              : (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f4f5f7'),
            border: '1px solid',
            borderColor: cardFilter.onlyMyCards ? 'primary.main' : 'divider',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            '&:hover': {
              bgcolor: cardFilter.onlyMyCards ? 'primary.100' : 'action.hover'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <Avatar
              src={currentUser?.avatar}
              alt={currentUser?.displayName}
              sx={{ width: 26, height: 26, fontSize: '0.75rem', bgcolor: '#0052cc' }}
            >
              {currentUser?.displayName?.[0]?.toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={600}>
                Cards assigned to me
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Only my cards
              </Typography>
            </Box>
          </Box>
          <Checkbox
            size="small"
            checked={Boolean(cardFilter.onlyMyCards)}
            sx={{ p: 0 }}
          />
        </Box>

        {/* Danh sách các thành viên khác trên board (nếu có) */}
        {board?.FE_allUsers?.length > 1 && (
          <Stack spacing={0.5} sx={{ maxHeight: 150, overflowY: 'auto', pr: 0.5 }}>
            {board.FE_allUsers
              .filter(user => user._id !== currentUser?._id)
              .map((user) => {
                const isSelected = cardFilter.memberIds?.includes(user._id)
                return (
                  <Box
                    key={user._id}
                    onClick={() => handleToggleMember(user._id)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: 1.2,
                      py: 0.6,
                      borderRadius: 1,
                      cursor: 'pointer',
                      bgcolor: isSelected ? 'action.selected' : 'transparent',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        src={user.avatar}
                        alt={user.displayName}
                        sx={{ width: 22, height: 22, fontSize: '0.7rem' }}
                      >
                        {user.displayName?.[0]?.toUpperCase()}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontSize: '0.825rem' }}>
                        {user.displayName}
                      </Typography>
                    </Box>
                    <Checkbox
                      size="small"
                      checked={Boolean(isSelected)}
                      sx={{ p: 0 }}
                    />
                  </Box>
                )
              })}
          </Stack>
        )}
      </Box>

      <Divider sx={{ my: 1.5 }} />

      {/* Lọc theo Nhãn (Labels) do người dùng tạo */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" fontWeight={600} sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
          LABELS
        </Typography>

        {availableLabels.length === 0 ? (
          <Box sx={{
            py: 2,
            px: 1.5,
            textAlign: 'center',
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f4f5f7'),
            borderRadius: 1.5,
            border: '1px dashed',
            borderColor: 'divider'
          }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.85rem' }}>
              {t('board.filterNoLabels')}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled', mt: 0.5, display: 'block' }}>
              {t('board.filterNoLabelsHint')}
            </Typography>
          </Box>
        ) : (
          <Stack
            spacing={0.75}
            sx={{
              maxHeight: '180px',
              overflowY: 'auto',
              pr: 0.5,
              '&::-webkit-scrollbar': { width: '5px' },
              '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'),
                borderRadius: '4px'
              },
              '&::-webkit-scrollbar-thumb:hover': {
                backgroundColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.35)')
              }
            }}
          >
            {availableLabels.map((label) => {
              const isSelected = cardFilter.labelIds?.includes(label.id)
              return (
                <Box
                  key={label.id}
                  onClick={() => handleToggleLabel(label.id)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 1.5,
                    py: 0.8,
                    borderRadius: 1.5,
                    bgcolor: label.color,
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    boxShadow: isSelected ? '0 0 0 2.5px #1976d2' : 'none',
                    opacity: isSelected ? 1 : 0.9,
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      opacity: 1,
                      transform: 'translateX(2px)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, overflow: 'hidden' }}>
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{
                        fontWeight: 600,
                        color: 'white',
                        fontSize: '0.85rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {label.title || t('board.noTitle')}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.85)',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        flexShrink: 0
                      }}
                    >
                      ({label.count})
                    </Typography>
                  </Box>
                  {isSelected && <CheckIcon fontSize="small" sx={{ color: 'white', flexShrink: 0, ml: 1 }} />}
                </Box>
              )
            })}
          </Stack>
        )}
      </Box>

      <Divider sx={{ my: 1.5 }} />

      {/* Nút Clear Filter */}
      <Button
        fullWidth
        size="small"
        variant="outlined"
        color="inherit"
        disabled={!hasActiveFilter}
        onClick={() => dispatch(clearCardFilter())}
        sx={{
          textTransform: 'none',
          borderColor: 'divider',
          '&:hover': { bgcolor: 'action.hover' }
        }}
      >
        Clear all filters
      </Button>
    </Popover>
  )
}

export default BoardCardFilterPopover