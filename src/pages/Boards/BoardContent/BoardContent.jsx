// tạo cấu trúc "rfce"
import Box from '@mui/material/Box'
import ListColumns from './ListColumns/ListColumns'
import { useEffect, useState, useCallback, useRef } from 'react'
import isEmpty from 'lodash/isEmpty'

// drag drop libarary
import {
  DndContext,
  // PointerSensor,
  // MouseSensor,
  // TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  closestCorners,
  // closestCenter,
  pointerWithin,
  // rectIntersection,
  getFirstCollision
} from '@dnd-kit/core'
import { MouseSensor, TouchSensor } from '~/customLibraries/DndKitSensors'
import { arrayMove } from '@dnd-kit/sortable'
import Column from './ListColumns/Column/Column'
import Card from './ListColumns/Column/ListCards/Card/Card'
import { generatePlaceholderCard } from '~/utils/formatter'

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: 'ACTIVE_DRAG_ITEM_TYPE_COLUMN',
  CARD: 'ACTIVE_DRAG_ITEM_TYPE_CARD'
}

function BoardContent({
  board,
  moveColumns,
  moveCardInTheSameColumn,
  moveCardToDifferentColumn
}) {
  // const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 10 } })

  // yêu cầu di chuyển chuột 10px thì mới kích hoạt event, fix trường hợp click bị gọi event
  const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 10 } })

  // nhấn giữ 250ms mới kích hoạt drag; tolerance nhỏ để vuốt ngang vẫn cuộn board bình thường trên mobile
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } })

  // const sensors = useSensors(pointerSensor)
  // ưu tiên kết hợp 2 loại sensor mouse và touch để trải nghiệm trên mobie tốt nhất và không bị bug
  const sensors = useSensors(mouseSensor, touchSensor)

  const [orderedColumns, setOrderedColumns] = useState([])

  const [activeDragItemId, setActiveDragItemId] = useState(null)
  const [activeDragItemType, setActiveDragItemType] = useState(null)
  const [activeDragItemData, setActiveDragItemData] = useState(null)
  const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard] = useState(null)

  // điểm va chạm cuối cùng trước đó
  const lastOverId = useRef(null)

  useEffect(() => {
    // columns đã được sắp xếp ở component cha cao nhất
    setOrderedColumns(board?.columns || [])
  }, [board])

  // tìm 1 cái column theo cardId
  const findColumnByCardId = (cardId) => {
    /*
    đoạn này cần lưu ý, nên dùng c.cards thay vì c.cardOrderIds bởi vì ở bước handleDragOver chúng ta sẽ làm lại dữ liệu cho Cards\
    hoàn chỉnh trước rồi mới tạo ra cardOrderIds mới
    */
    return orderedColumns.find(column => column.cards.map(card => card._id)?.includes(cardId))
  }

  // function chung xử lý việc cập nhật lại state trong trường hợp di chuyển card giữa các column khác nhau
  const moveCardBetweenDifferentColumns = (
    overColumn,
    overCardId,
    active,
    over,
    activeColumn,
    activeDraggingCardId,
    activeDraggingCardData,
    triggerFrom
  ) => {
    setOrderedColumns(prevColumns => {
      // tìm vị trí (index) của cái overCard trong column đích (nơi mà activeCard sắp được thả)
      const overCardIndex = overColumn?.cards?.findIndex(card => card._id === overCardId)

      // logic tính toán cardIndex mới
      let newCardIndex
      const isBeLowOverItem = active.rect.current.translated &&
        active.rect.current.translated.top > over.rect.top + over.rect.height
      const modifier = isBeLowOverItem ? 1 : 0
      newCardIndex = overCardIndex >= 0 ? overCardIndex + modifier : overColumn?.cards?.length + 1

      /**
       * Cập nhật STRUCTURAL (giữ nguyên reference của các column/card không đổi)
       * thay vì cloneDeep toàn bộ board: nhờ vậy React.memo ở Column/Card có thể
       * bỏ qua re-render cho mọi column không liên quan trong lúc kéo thả.
       */
      const nextColumns = prevColumns.map(column => {
        // column không liên quan -> trả nguyên reference cũ
        if (column._id !== activeColumn._id && column._id !== overColumn._id) return column

        if (column._id === activeColumn._id) {
          // xóa card ở column active, thêm placeholderCard nếu column bị rỗng
          let cards = column.cards.filter(card => card._id !== activeDraggingCardId)
          if (isEmpty(cards)) {
            cards = [generatePlaceholderCard(column)]
          }
          return { ...column, cards, cardOrderIds: cards.map(card => card._id) }
        }

        // column đích (overColumn)
        // kiểm tra xem card đang kéo đã tồn tại trong column chưa, nếu có cần xóa trước
        let cards = column.cards.filter(card => card._id !== activeDraggingCardId)
        // phải cập nhật lại chuẩn dữ liệu columnId trong card sau khi kéo giữa 2 column khác nhau
        const rebuild_activeDraggingCardData = {
          ...activeDraggingCardData,
          columnId: column._id
        }
        // thêm card đang kéo vào overColumn theo vị trí index mới
        cards = cards.toSpliced(newCardIndex, 0, rebuild_activeDraggingCardData)
        // xóa placeholder card nếu column đích có card
        cards = cards.filter(card => !card.FE_PlaceholderCard)

        return { ...column, cards, cardOrderIds: cards.map(card => card._id) }
      })

      // nếu function này được gọi từ handleDragEnd nghĩa là đã kéo thả xong, lúc này mới xử lý gọi API 1 lần ở đây
      if (triggerFrom === 'handleDragEnd') {
        /**
         * gọi lên props function moveCardToDifferentColumn nằm ở component cha cao nhất (board/._id.jsx)
         * Với việc sử dụng Redux thì code sẽ clean chuẩn chỉnh hơn
         */
        /*
         phải dùng tới oldColumnWhenDraggingCard._id (set vào state từ bước handleDragStart)
         chứ không phải activeData trong scope handleDragEnd này vì sau khi đi qua onDragOver là state của card đã bị cập nhật 1 lần rồi
        */
        moveCardToDifferentColumn(
          activeDraggingCardId,
          oldColumnWhenDraggingCard._id,
          overColumn._id,
          nextColumns
        )
      }

      return nextColumns
    })
  }

  const handleDragStart = (event) => {
    // console.log ('handleDragEnd: ', event)
    setActiveDragItemId(event?.active?.id)
    setActiveDragItemType(event?.active?.data?.current?.columnId ? ACTIVE_DRAG_ITEM_TYPE.CARD : ACTIVE_DRAG_ITEM_TYPE.COLUMN)
    setActiveDragItemData(event?.active?.data?.current)

    // nếu là hành động kéo card thì mới thực hiện những hành động set giá trị oldColumn
    if (event?.active?.data?.current?.columnId) {
      setOldColumnWhenDraggingCard(findColumnByCardId(event?.active?.id))
    }
  }

  // trigger (kích hoạt) trong quá trình drag (kéo) 1 phần tử
  const handleDragOver = (event) => {
    // không làm gì thêm nếu đang kéo column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) return

    // console.log('handleDragEnd: ', event)
    //  còn nếu kéo card thì xử lí thêm để có thể kéo card qua lại giữa các columns
    const { active, over } = event

    // kiểm tra nếu không tồn tại over (kéo linh tinh ra ngoài thì return luôn tránh lỗi)
    if (!active || !over) return

    // activeDraggingCard: là cái card đang được kéo
    const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active
    // overCard: là cái card đang tương tác trên hoặc dưới so với cái card đang được kéo ở trên
    const { id: overCardId } = over

    // tìm 2 cái column của cardId
    const activeColumn = findColumnByCardId(activeDraggingCardId)
    const overColumn = findColumnByCardId(overCardId)

    // nếu không tồn tại 1 trong 2 column thì không làm gì hết, tránh crash trang web
    if (!activeColumn || !overColumn) return

    /*
    xử lí logic ở đây chỉ khi kéo card qua 2 column khác nhau, còn nếu kéo card qua chính column ban đầu của nó thì không làm gì
    vì đây đang là đoạn xử lí lúc kéo (handleDragOver), còn xử lí lúc kéo xong xuôi thì nó lại ở vấn đề khác ở (handleDragEnd)
    */
    if (activeColumn._id !== overColumn._id) {
      moveCardBetweenDifferentColumns(
        overColumn,
        overCardId,
        active,
        over,
        activeColumn,
        activeDraggingCardId,
        activeDraggingCardData,
        // Đang kéo qua cột khác: CHỈ cập nhật state local, KHÔNG gọi API
        // (trước đây nhãn bị hoán đổi khiến API + socket bị bắn liên tục khi kéo qua lại)
        'handleDragOver'
      )
    }
  }

  const handleDragEnd = (event) => {
    // console.log('handleDragEnd: ', event)
    const { active, over } = event

    // kiểm tra nếu không tồn tại over (kéo linh tinh ra ngoài thì return luôn tránh lỗi)
    if (!over) return

    // xử lý kéo thả cards
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      // activeDraggingCard: là cái card đang được kéo
      const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active
      // overCard: là cái card đang tương tác trên hoặc dưới so với cái card đang được kéo ở trên
      const { id: overCardId } = over

      // tìm 2 cái column của cardId
      const activeColumn = findColumnByCardId(activeDraggingCardId)
      const overColumn = findColumnByCardId(overCardId)

      // nếu không tồn tại 1 trong 2 column thì không làm gì hết, tránh crash trang web
      if (!activeColumn || !overColumn) return

      /*
      hành động kéo thả giữa 2 column khác nhau
      phải dùng tới activeDragItemData.columnId hoặc oldColumnWhenDraggingCard._id chứ không phải activeData trong scope handleDragEnd
      này vì sau khi đi qua onDragOver tới đây là state của card đã bị cập nhật 1 lần
      */
      if (oldColumnWhenDraggingCard._id !== overColumn._id) {
        moveCardBetweenDifferentColumns(
          overColumn,
          overCardId,
          active,
          over,
          activeColumn,
          activeDraggingCardId,
          activeDraggingCardData,
          // Đã thả chuột: cập nhật state và GỌI API đúng 1 lần để lưu vị trí mới
          'handleDragEnd'
        )
      } else {
        // hành động kéo thả trong cùng 1 column

        // lấy vị trí cũ oldColumnWhenDraggingCard
        const oldCardIndex = oldColumnWhenDraggingCard?.cards?.findIndex(c => c._id === activeDragItemId)
        // lấy vị trí mới
        const newCardIndex = overColumn?.cards?.findIndex(c => c._id === overCardId)

        // dùng arrayMove vì kéo card trong 1 cái column thì tương tự với logic kéo column trong 1 cái board content
        const dndOrderedCards = arrayMove(oldColumnWhenDraggingCard?.cards, oldCardIndex, newCardIndex)
        const dndOrderedCardsIds = dndOrderedCards.map(card => card._id)

        // Vẫn gọi update State ở đây để tránh delay hoặc Flickering giao diện lúc kéo thả cần phải chờ gọi API
        // (structural update: chỉ thay column đích, giữ reference các column khác cho memo)
        setOrderedColumns(prevColumns => {
          return prevColumns.map(column => {
            if (column._id !== overColumn._id) return column
            return { ...column, cards: dndOrderedCards, cardOrderIds: dndOrderedCardsIds }
          })
        })

        /**
         * gọi lên props function moveCardInTheSameColumn nằm ở component cha cao nhất (board/._id.jsx)
         * Lưu ý: học phần cao hơn sẽ đưa ra ngoài Redux Global Store
         * Và lúc này có thể gọi luôn API ở đây là xong thay vì phải lần lượt gọi ngược lên những component cha ở phía bên trên (đối với component con nằm càng sâu thì càng khó)
         * Với việc sử dụng Redux thì code sẽ clean chuẩn chỉnh hơn
         */
        moveCardInTheSameColumn(dndOrderedCards, dndOrderedCardsIds, oldColumnWhenDraggingCard._id)
      }
    }

    // xử lý kéo thả columns
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      // console.log('hành động kéo thả column - tạm thời không làm gì')
      // nếu vị trí sau khi kéo thả khác với vị trí ban đầu
      if (active.id !== over.id) {
        // lấy vị trí cũ
        const oldColumnIndex = orderedColumns.findIndex(c => c._id === active.id)
        // lấy vị trí mới
        const newColumnIndex = orderedColumns.findIndex(c => c._id === over.id)

        const dndOrderedColumns = arrayMove(orderedColumns, oldColumnIndex, newColumnIndex)

        // Vẫn gọi Update State ở đay để tránh delay hoặc Flickering giao diện lúc kéo thả cần phải chờ gọi API
        setOrderedColumns(dndOrderedColumns)

        /**
         * gọi lên props function moveColumns nằm ở component cha cao nhất (board/._id.jsx)
         * Lưu ý: học phần cao hơn sẽ đưa ra ngoài Redux Global Store
         * Và lúc này có thể gọi luôn API ở đây là xong thay vì phải lần lượt gọi ngược lên những component cha ở phía bên trên (đối với component con nằm càng sâu thì càng khó)
         * Với việc sử dụng Redux thì code sẽ clean chuẩn chỉnh hơn
         */
        moveColumns(dndOrderedColumns)

      }
    }

    // những giá trị này sau khi kéo thả luôn phải đưa về giá trị null mặc định ban đầu
    setActiveDragItemId(null)
    setActiveDragItemType(null)
    setActiveDragItemData(null)
    setOldColumnWhenDraggingCard(null)
  }

  // animation khi drop phần tử
  const customDropAnimation = { sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }) }

  // tối ưu kéo thả card giữa nhiều column
  const collisionDetectionStrategy = useCallback((args) => {
    // trường hợp kéo column dùng thuật toán closestCorners chuẩn nhất
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      return closestCorners({ ...args })
    }

    // tìm các điểm giao nhau, va chạm - intersection với con trỏ
    const pointerInterSection = pointerWithin(args)
    // mảng rỗng (khi kéo ra ngoài) thì return luôn
    if (!pointerInterSection?.length) return

    // thuật toán phát hiện va chạm sẽ trả về 1 mảng các va chạm ở đây
    // const intersection = !!pointerInterSection?.length
    //   ? pointerInterSection
    //   : rectIntersection(args)

    // tìm overId đầu tiên trong đám pointerInterSection
    let overId = getFirstCollision(pointerInterSection, 'id')
    if (overId) {
      /*
      nếu cái over là column thì sẽ tìm tới cái cardId gần nhất bên trong khu vực và chạm đó dựa vào thuật toán phát hiện va chạm
      closesCenter hoặc closesCorner (mượt hơn)
      */
      const checkColumn = orderedColumns.find(column => column._id === overId)
      if (checkColumn) {
        overId = closestCorners({
          ...args,
          droppableContainers: args.droppableContainers.filter(container => {
            return (container.id !== overId) && (checkColumn?.cardOrderIds?.includes(container.id))
          })
        })[0]?.id
      }

      lastOverId.current = overId
      return [{ id: overId }]
    }

    // nếu overId là null nó sẽ trả về mảng rỗng
    return lastOverId.current ? [{ id: lastOverId.current }] : []

  }, [activeDragItemType, orderedColumns])

  return (
    <DndContext
      // cảm biến
      sensors={sensors}
      // thuật toán phát hiện va chạm
      // nếu chỉ dùng closesconers thì sẽ sai lệch dữ liệu
      // collisionDetection={closestCorners}

      // tự custom nâng cao thuật toán va chạm
      collisionDetection={collisionDetectionStrategy}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <Box sx={{
        bgcolor: board?.background ? 'transparent' : ((theme) => (theme.palette.mode === 'dark' ? '#0f172a' : '#0052cc')),
        width: '100%',
        height: (theme) => theme.trello.boardContentHeight,
        p: '10px 0'
      }}>
        <ListColumns columns={orderedColumns}/>
        <DragOverlay dropAnimation={customDropAnimation}>
          {(!activeDragItemType && null)}
          {(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) && <Column column={activeDragItemData} />}
          {(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) && <Card card={activeDragItemData} />}
        </DragOverlay>
      </Box>
    </DndContext>
  )
}

export default BoardContent