import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import Box from '@mui/material/Box'
import Card from './Card/Card'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { selectCardFilter } from '~/redux/activeBoard/activeBoardSlice'
import { selectCurrentUser } from '~/redux/user/userSlice'

function ListCards({ cards }) {
  const cardFilter = useSelector(selectCardFilter)
  const currentUser = useSelector(selectCurrentUser)

  const filteredCards = useMemo(() => {
    if (!cards) return []
    const activeCards = cards.filter(card => !card?._destroy)
    const search = cardFilter?.search?.trim().toLowerCase()
    const filterLabelIds = cardFilter?.labelIds || []
    const onlyMyCards = Boolean(cardFilter?.onlyMyCards)
    const filterMemberIds = cardFilter?.memberIds || []

    const hasFilter = Boolean(search || filterLabelIds.length > 0 || onlyMyCards || filterMemberIds.length > 0)
    if (!hasFilter) return activeCards

    return activeCards.filter(card => {
      // Giữ lại placeholder card để SortableContext và DndKit hoạt động ổn định
      if (card?.FE_PlaceholderCard) return true

      if (search) {
        const matchTitle = card.title?.toLowerCase().includes(search)
        const matchDesc = card.description?.toLowerCase().includes(search)
        if (!matchTitle && !matchDesc) return false
      }

      if (filterLabelIds.length > 0) {
        const cardLabelKeys = (card.labels || []).map(l => `${l.color}___${(l.title || '').trim()}`)
        const hasMatchingLabel = filterLabelIds.some(id => cardLabelKeys.includes(id))
        if (!hasMatchingLabel) return false
      }

      // Lọc theo thành viên (OR logic: hiển thị thẻ được gán cho Tôi HOẶC bất kỳ thành viên nào được chọn)
      const targetMemberIds = [
        ...(onlyMyCards && currentUser?._id ? [currentUser._id.toString()] : []),
        ...filterMemberIds.map(id => id.toString())
      ]
      if (targetMemberIds.length > 0) {
        const cardMemberIds = (card.memberIds || []).map(id => id.toString())
        const hasSelectedMember = targetMemberIds.some(targetId => cardMemberIds.includes(targetId))
        if (!hasSelectedMember) return false
      }

      return true
    })
  }, [cards, cardFilter, currentUser])

  return (
    <SortableContext items={filteredCards?.map(c => c._id)} strategy={verticalListSortingStrategy}>
      <Box sx={{
        p: '0 5px 5px 5px',
        m: '0 5px',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        overflowX: 'hidden',
        // thanh scroll
        overflowY: 'auto',
        maxHeight: (theme) => `calc(
                  ${theme.trello.boardContentHeight} - 
                  ${theme.spacing(5)} -
                  ${theme.trello.columnHeaderheight} -
                  ${theme.trello.columnFooterHeight}
                )`
      }}>
        {filteredCards?.map(card => <Card key={card._id} card={card} />)}
      </Box >
    </SortableContext>
  )
}

export default ListCards
