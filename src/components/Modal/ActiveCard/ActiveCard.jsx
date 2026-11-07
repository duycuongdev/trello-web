import { useState, lazy, Suspense } from 'react'
import { useSearchParams } from 'react-router-dom'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Modal from '@mui/material/Modal'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import Grid from '@mui/material/Unstable_Grid2'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined'
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined'
import WatchLaterOutlinedIcon from '@mui/icons-material/WatchLaterOutlined'
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import UndoIcon from '@mui/icons-material/Undo'
import SubjectRoundedIcon from '@mui/icons-material/SubjectRounded'
import DvrOutlinedIcon from '@mui/icons-material/DvrOutlined'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ToggleFocusInput from '~/components/Form/ToggleFocusInput'
import VisuallyHiddenInput from '~/components/Form/VisuallyHiddenInput'
import { singleFileValidator } from '~/utils/validators'
import { toast } from 'react-toastify'
import { useConfirm } from 'material-ui-confirm'
import dayjs from 'dayjs'
import CardUserGroup from './CardUserGroup'
const CardDescriptionMdEditor = lazy(() => import('./CardDescriptionMdEditor'))
import CardActivitySection from './CardActivitySection'
import CardLabelPopover from './CardLabelPopover'
import CardChecklistPopover from './CardChecklistPopover'
import CardChecklistSection from './CardChecklistSection'
import CardDueDatePopover from './CardDueDatePopover'
import CardAttachmentSection from './CardAttachmentSection'
import CardMovePopover from './CardMovePopover'
import CardCopyPopover from './CardCopyPopover'
import { useDispatch, useSelector } from 'react-redux'
import {
  clearAndHideCurrentActiveCard,
  selectCurrentActiveCard,
  updateCurrentActiveCard,
  selectIsShowModalActiveCard
} from '~/redux/activeCard/activeCardSlice'
import { updateCardInBoard, removeCardFromBoard, selectCurrentActiveBoard, updateCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'
import { styled } from '@mui/material/styles'
import cloneDeep from 'lodash/cloneDeep'
import { generatePlaceholderCard } from '~/utils/formatter'
import {
  updateCardDetailsAPI,
  deleteCardAPI,
  addCardAttachmentAPI,
  deleteCardAttachmentAPI,
  updateCardCommentAPI,
  deleteCardCommentAPI,
  archiveCardAPI,
  restoreCardAPI
} from '~/apis'
import { selectCurrentUser } from '~/redux/user/userSlice'
import ChangeBoardBackgroundPopover from '~/pages/Boards/BoardBar/ChangeBoardBackgroundPopover'
import { CARD_MEMBER_ACTION } from '~/utils/constants'
import { useTranslation } from 'react-i18next'
import { fetchInvitationsAPI } from '~/redux/notifications/notificationsSlice'
import { emitBoardUpdate, BOARD_ACTION_TYPES } from '~/sockets/boardSocketClient'
import { socketIoInstance } from '~/socketClient'

const SidebarItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600',
  color: theme.palette.mode === 'dark' ? '#90caf9' : '#172b4d',
  backgroundColor: theme.palette.mode === 'dark' ? '#2f3542' : '#091e420f',
  padding: '10px',
  borderRadius: '4px',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? '#33485D' : theme.palette.grey[300],
    '&.active': {
      color: theme.palette.mode === 'dark' ? '#000000de' : '#0c66e4',
      backgroundColor: theme.palette.mode === 'dark' ? '#90caf9' : '#e9f2ff'
    }
  }
}))

function ActiveCard() {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)
  const activeCard = useSelector(selectCurrentActiveCard)
  const isShowModalActiveCard = useSelector(selectIsShowModalActiveCard)
  const activeBoard = useSelector(selectCurrentActiveBoard)
  const [searchParams, setSearchParams] = useSearchParams()

  const [labelAnchorEl, setLabelAnchorEl] = useState(null)
  const [coverPickerAnchorEl, setCoverPickerAnchorEl] = useState(null)
  const isLabelOpen = Boolean(labelAnchorEl)
  const handleOpenLabelPopover = (event) => setLabelAnchorEl(event.currentTarget)
  const handleCloseLabelPopover = () => setLabelAnchorEl(null)

  const [checklistAnchorEl, setChecklistAnchorEl] = useState(null)
  const isChecklistOpen = Boolean(checklistAnchorEl)
  const handleOpenChecklistPopover = (event) => setChecklistAnchorEl(event.currentTarget)
  const handleCloseChecklistPopover = () => setChecklistAnchorEl(null)

  const [dueDateAnchorEl, setDueDateAnchorEl] = useState(null)
  const isDueDateOpen = Boolean(dueDateAnchorEl)
  const handleOpenDueDatePopover = (event) => setDueDateAnchorEl(event.currentTarget)
  const handleCloseDueDatePopover = () => setDueDateAnchorEl(null)

  const [moveAnchorEl, setMoveAnchorEl] = useState(null)
  const isMoveOpen = Boolean(moveAnchorEl)
  const handleOpenMovePopover = (event) => setMoveAnchorEl(event.currentTarget)
  const handleCloseMovePopover = () => setMoveAnchorEl(null)

  const [copyAnchorEl, setCopyAnchorEl] = useState(null)
  const isCopyOpen = Boolean(copyAnchorEl)
  const handleOpenCopyPopover = (event) => setCopyAnchorEl(event.currentTarget)
  const handleCloseCopyPopover = () => setCopyAnchorEl(null)

  const handleUpdateCardLabels = (newLabels) => {
    callApiUpdateCard({ labels: newLabels })
  }

  const handleAddChecklist = (newChecklist) => {
    const currentChecklists = activeCard?.checklists || []
    callApiUpdateCard({ checklists: [...currentChecklists, newChecklist] })
  }

  const handleUpdateCardChecklists = (newChecklists) => {
    const totalItems = newChecklists?.reduce((sum, cl) => sum + (cl.items?.length || 0), 0) || 0
    const completedItems = newChecklists?.reduce((sum, cl) => sum + (cl.items?.filter(i => i.isDone).length || 0), 0) || 0

    const updateData = { checklists: newChecklists }

    // Tự động đồng bộ trạng thái Due Date khi nhiệm vụ (Checklist) đạt 100% hoặc bị bỏ bớt
    if (activeCard?.dueDate && totalItems > 0) {
      if (completedItems === totalItems && !activeCard.isDueDateComplete) {
        updateData.isDueDateComplete = true
      } else if (completedItems < totalItems && activeCard.isDueDateComplete) {
        updateData.isDueDateComplete = false
      }
    }

    callApiUpdateCard(updateData)
  }

  const handleUpdateDueDate = async (dueData) => {
    // Nếu đặt hạn mới nhưng các nhiệm vụ trong checklist đã hoàn thành 100%, tự động đánh dấu completed
    const totalItems = activeCard?.checklists?.reduce((sum, cl) => sum + (cl.items?.length || 0), 0) || 0
    const completedItems = activeCard?.checklists?.reduce((sum, cl) => sum + (cl.items?.filter(i => i.isDone).length || 0), 0) || 0

    if (totalItems > 0) {
      dueData.isDueDateComplete = (completedItems === totalItems)
    } else {
      dueData.isDueDateComplete = false
    }

    const updatedCard = await callApiUpdateCard(dueData)
    dispatch(fetchInvitationsAPI())

    // Bắn socket thông báo deadline cập nhật cho các thành viên trong thẻ
    const recipientIds = (updatedCard?.memberIds || activeCard?.memberIds || [])
      .map(id => id.toString())
      .filter(id => id !== currentUser?._id?.toString())
    if (recipientIds.length > 0) {
      socketIoInstance.emit('FE_CARD_DUE_DATE_CHANGED', {
        recipientIds,
        card: updatedCard || activeCard,
        boardTitle: activeBoard?.title
      })
    }
  }

  const handleCloseModal = () => {
    if (searchParams.has('cardId')) {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev)
        next.delete('cardId')
        return next
      }, { replace: true })
    }
    dispatch(clearAndHideCurrentActiveCard())
  }

  const confirmDeleteCard = useConfirm()
  const handleDeleteCard = () => {
    confirmDeleteCard({
      title: t('cardModal.deleteCardConfirmTitle'),
      description: 'This action will permanently delete this Card! Are you sure?',
      confirmationText: 'Confirm',
      cancellationText: 'Cancel'
    }).then(() => {
      const cardId = activeCard._id
      if (searchParams.has('cardId')) {
        setSearchParams(prev => {
          const next = new URLSearchParams(prev)
          next.delete('cardId')
          return next
        }, { replace: true })
      }
      dispatch(clearAndHideCurrentActiveCard())
      dispatch(removeCardFromBoard(cardId))
      emitBoardUpdate({
        boardId: activeBoard._id,
        actionType: BOARD_ACTION_TYPES.DELETE_CARD,
        payload: { cardId, columnId: activeCard.columnId },
        currentUser
      })
      deleteCardAPI(cardId).then(res => {
        toast.success(res?.deleteResult || 'Card deleted successfully!')
      })
    }).catch(() => {})
  }

  const handleArchiveCard = async () => {
    try {
      await archiveCardAPI(activeCard._id)

      // Xóa card khỏi board columns trong redux
      const newBoard = cloneDeep(activeBoard)
      const column = newBoard.columns.find(c => c._id === activeCard.columnId)
      if (column) {
        column.cards = column.cards.filter(c => c._id !== activeCard._id)
        column.cardOrderIds = column.cardOrderIds.filter(id => id !== activeCard._id)
        if (column.cards.length === 0) {
          column.cards = [generatePlaceholderCard(column)]
          column.cardOrderIds = [generatePlaceholderCard(column)._id]
        }
        dispatch(updateCurrentActiveBoard(newBoard))
      }

      dispatch(updateCurrentActiveCard({ ...activeCard, _destroy: true }))
      emitBoardUpdate({
        boardId: activeBoard._id,
        actionType: BOARD_ACTION_TYPES.ARCHIVE_CARD,
        payload: { cardId: activeCard._id, columnId: activeCard.columnId },
        currentUser
      })
      toast.success('Card archived!')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to archive card')
    }
  }

  const handleRestoreCard = async () => {
    try {
      const restoredCard = await restoreCardAPI(activeCard._id)

      const newBoard = cloneDeep(activeBoard)
      let column = newBoard.columns.find(c => c._id === restoredCard.columnId)
      if (!column && newBoard.columns.length > 0) {
        column = newBoard.columns[0]
      }

      if (column) {
        column.cards = (column.cards || []).filter(c => !c.FE_PlaceholderCard)
        column.cardOrderIds = (column.cardOrderIds || []).filter(id => !id.includes('placeholder-card'))

        column.cards.push(restoredCard)
        column.cardOrderIds.push(restoredCard._id)
        dispatch(updateCurrentActiveBoard(newBoard))
      }

      dispatch(updateCurrentActiveCard({ ...restoredCard, _destroy: false }))
      emitBoardUpdate({
        boardId: activeBoard._id,
        actionType: BOARD_ACTION_TYPES.RESTORE_CARD,
        payload: restoredCard,
        currentUser
      })
      toast.success('Card restored to board!')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to restore card')
    }
  }

  // Gọi API dùng chung cho các trường hợp update Card: title, description, cover...
  const callApiUpdateCard = async (updateData) => {
    const updatedCard = await updateCardDetailsAPI(activeCard._id, updateData)

    // Cập nhật lại card đang active trong redux
    dispatch(updateCurrentActiveCard(updatedCard))
    // Cập nhật lại cái bản ghi card trong cái activeBoard (nested data)
    dispatch(updateCardInBoard(updatedCard))

    emitBoardUpdate({
      boardId: activeBoard._id,
      actionType: BOARD_ACTION_TYPES.UPDATE_CARD,
      payload: updatedCard,
      currentUser
    })

    return updatedCard
  }

  const onUpdateCardTitle = (newTitle) => {
    callApiUpdateCard({ title: newTitle })
  }

  const onUpdateCardDescription = (newDescription) => {
    callApiUpdateCard({ description: newDescription })
  }


  // Upload tệp đính kèm vào Card
  const onUploadCardAttachment = (event) => {
    const file = event.target?.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit!')
      return
    }
    const formData = new FormData()
    formData.append('attachment', file)

    toast.promise(
      addCardAttachmentAPI(activeCard._id, formData).then(updatedCard => {
        dispatch(updateCurrentActiveCard(updatedCard))
        dispatch(updateCardInBoard(updatedCard))
        emitBoardUpdate({
          boardId: activeBoard._id,
          actionType: BOARD_ACTION_TYPES.UPDATE_CARD,
          payload: updatedCard,
          currentUser
        })
      }).finally(() => {
        event.target.value = ''
      }),
      { pending: t('cardModal.uploadingAttachment'), success: t('cardModal.attachmentUploaded') }
    )
  }

  // Upload tệp đính kèm cho checklist item và đồng bộ vào Card attachments
  const handleUploadChecklistAttachment = async (file) => {
    if (!file) return null
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit!')
      return null
    }
    const formData = new FormData()
    formData.append('attachment', file)

    try {
      const uploadResult = await addCardAttachmentAPI(activeCard._id, formData, true)
      toast.success(`Attached file: ${file.name}`)
      return uploadResult || { fileUrl: '', fileName: file.name }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to upload attachment!')
      return null
    }
  }

  // Xóa tệp đính kèm
  const handleDeleteAttachment = (attachmentId) => {
    deleteCardAttachmentAPI(activeCard._id, attachmentId).then(updatedCard => {
      dispatch(updateCurrentActiveCard(updatedCard))
      dispatch(updateCardInBoard(updatedCard))
      emitBoardUpdate({
        boardId: activeBoard._id,
        actionType: BOARD_ACTION_TYPES.UPDATE_CARD,
        payload: updatedCard,
        currentUser
      })
      toast.success(t('card.attachmentDeleted'))
    })
  }

  // Đặt tệp ảnh đính kèm làm ảnh bìa (Cover)
  const handleMakeCover = (imageUrl) => {
    callApiUpdateCard({ cover: imageUrl })
  }

  // Mở popover chọn Cover — tái sử dụng nguyên bộ picker của board background
  const handleOpenCoverPicker = (event) => setCoverPickerAnchorEl(event.currentTarget)
  // Upload file ảnh bìa từ tab Upload của popover (FormData cardCover)
  const handleUploadCardCoverFile = (file) => {
    const error = singleFileValidator(file)
    if (error) { toast.error(error); return }
    const reqData = new FormData()
    reqData.append('cardCover', file)
    toast.promise(
      callApiUpdateCard(reqData),
      { pending: t('card.updatingCover') }
    )
  }

  // Dùng async await ở đây để component con CardActivitySection chờ và nếu thành công thì mới clear input comment
  const onAddCardComment = async (commentToAdd) => {
    await callApiUpdateCard({ commentToAdd })
  }

  const onUpdateCardComment = async (commentId, content) => {
    const updatedCard = await updateCardCommentAPI(activeCard._id, commentId, { content })
    dispatch(updateCurrentActiveCard(updatedCard))
    dispatch(updateCardInBoard(updatedCard))
    return updatedCard
  }

  const onDeleteCardComment = async (commentId) => {
    const updatedCard = await deleteCardCommentAPI(activeCard._id, commentId)
    dispatch(updateCurrentActiveCard(updatedCard))
    dispatch(updateCardInBoard(updatedCard))
    emitBoardUpdate({
      boardId: activeBoard._id,
      actionType: BOARD_ACTION_TYPES.UPDATE_CARD,
      payload: updatedCard,
      currentUser
    })
    return updatedCard
  }

  const onUpdateCardMembers = async (incomingMemberInfor) => {
    await callApiUpdateCard({ incomingMemberInfor })
    dispatch(fetchInvitationsAPI())
    if (incomingMemberInfor?.userId === currentUser._id) {
      if (incomingMemberInfor.action === CARD_MEMBER_ACTION.ADD) {
        toast.success(t('card.joinedCard'))
      } else {
        toast.info('Left card successfully!')
      }
    }
  }

  return (
    <Modal
      disableScrollLock
      open={isShowModalActiveCard}
      onClose={handleCloseModal}
      sx={{ overflowY: 'auto' }}>
      <Box sx={{
        position: 'relative',
        width: { xs: '92%', sm: '90%', md: 900 },
        maxWidth: 900,
        bgcolor: 'white',
        boxShadow: 24,
        borderRadius: '8px',
        border: 'none',
        outline: 0,
        padding: { xs: '32px 14px 18px', sm: '40px 20px 20px' },
        margin: { xs: '20px auto', sm: '35px auto', md: '50px auto' },
        backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#1A2027' : '#fff')
      }}>
        <Box sx={{
          position: 'absolute',
          top: '8px',
          right: '8px'
        }}>
          <IconButton size="small" onClick={handleCloseModal} aria-label="close">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Banner thông báo thẻ đã lưu trữ */}
        {activeCard?._destroy && (
          <Box sx={{
            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#b26b0033' : '#fff0b3',
            color: (theme) => theme.palette.mode === 'dark' ? '#ffcc80' : '#172b4d',
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: '4px',
            mb: 2.5
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ArchiveOutlinedIcon fontSize="small" />
              <Typography variant="body2" fontWeight={600}>{t('cardModal.archivedBanner')}</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" variant="contained" onClick={handleRestoreCard} sx={{ textTransform: 'none' }}>
                {t('cardModal.sendToBoard')}
              </Button>
              <Button size="small" color="error" variant="outlined" onClick={handleDeleteCard} sx={{ textTransform: 'none' }}>
                Delete
              </Button>
            </Box>
          </Box>
        )}

        {activeCard?.cover &&
          <Box sx={{ mb: 4 }}>
            {String(activeCard.cover).startsWith('http') ? (
              <img
                style={{ width: '100%', height: 'auto', maxHeight: '320px', borderRadius: '6px', objectFit: 'cover' }}
                src={activeCard?.cover}
                alt="card-cover"
              />
            ) : (
              <Box sx={{ height: 180, background: activeCard.cover, borderRadius: '6px' }} />
            )}
          </Box>
        }

        <Box sx={{ mb: 1, mt: -3, pr: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CreditCardIcon sx={{ color: '#0052cc' }} />

          {/* Feature 01: Xử lý tiêu đề của Card */}
          <ToggleFocusInput
            inputFontSize='22px'
            value={activeCard?.title}
            onChangedValue={onUpdateCardTitle} />
        </Box>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Left side */}
          <Grid xs={12} sm={9}>
            <Box sx={{ display: 'flex', gap: 4, mb: 3, flexWrap: 'wrap' }}>
              <Box>
                <Typography sx={{ fontWeight: '600', color: 'primary.main', mb: 1 }}>{t('cardModal.membersTitle')}</Typography>
                <CardUserGroup
                  cardMemberIds={activeCard?.memberIds}
                  onUpdateCardMembers={onUpdateCardMembers}
                />
              </Box>

              {!!activeCard?.labels?.length && (
                <Box>
                  <Typography sx={{ fontWeight: '600', color: 'primary.main', mb: 1 }}>{t('cardModal.labelsTitle')}</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {activeCard.labels.map((label, idx) => (
                      <Chip
                        key={idx}
                        label={label.title || '\u00A0'}
                        size="small"
                        sx={{
                          bgcolor: label.color,
                          color: '#fff',
                          fontWeight: '600',
                          borderRadius: '4px',
                          height: '32px',
                          px: 0.5
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Feature 09: Hiển thị Khối Hạn chót (Due Date) */}
              {activeCard?.dueDate && (
                <Box>
                  <Typography sx={{ fontWeight: '600', color: 'primary.main', mb: 1 }}>{t('cardModal.dueDateTitle')}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      color="inherit"
                      onClick={handleOpenDueDatePopover}
                      endIcon={<ExpandMoreIcon fontSize="small" />}
                      sx={{
                        textTransform: 'none',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        borderRadius: '4px',
                        borderColor: 'divider',
                        px: 1,
                        py: 0.5,
                        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f4f5f7'
                      }}
                    >
                      {dayjs(activeCard.dueDate).format(t('common.datetimeFormat'))}
                    </Button>

                    {activeCard?.isDueDateComplete ? (
                      <Chip label={t('card.completed')} size="small" color="success" sx={{ height: 24, fontWeight: 700, fontSize: '0.7rem' }} />
                    ) : dayjs(activeCard.dueDate).isBefore(dayjs()) ? (
                      <Chip label={t('card.overdue')} size="small" color="error" sx={{ height: 24, fontWeight: 700, fontSize: '0.7rem' }} />
                    ) : (activeCard?.reminderMinutes !== null && activeCard?.reminderMinutes !== undefined ? dayjs(activeCard.dueDate).diff(dayjs(), 'minute') <= activeCard.reminderMinutes : dayjs(activeCard.dueDate).diff(dayjs(), 'hour') <= 24) ? (
                      <Chip label={t('card.dueSoon')} size="small" color="warning" sx={{ height: 24, fontWeight: 700, fontSize: '0.7rem' }} />
                    ) : null}
                  </Box>
                </Box>
              )}
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <SubjectRoundedIcon sx={{ color: '#0052cc' }} />
                <Typography variant="span" sx={{ fontWeight: '600', fontSize: '20px' }}>{t('cardModal.descriptionTitle')}</Typography>
              </Box>

              {/* Feature 03: Xử lý mô tả của Card */}
              <Suspense fallback={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 2 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2" color="text.secondary">Loading editor...</Typography>
                </Box>
              }>
                <CardDescriptionMdEditor
                  cardDescriptionProp={activeCard?.description}
                  handleUpdateCardDescription={onUpdateCardDescription}
                />
              </Suspense>
            </Box>

            {/* Feature 10: Xử lý tệp đính kèm (Attachments) */}
            <CardAttachmentSection
              attachments={activeCard?.attachments || []}
              cardCover={activeCard?.cover}
              onDeleteAttachment={handleDeleteAttachment}
              onMakeCover={handleMakeCover}
            />

            {/* Feature 08: Xử lý Checklists & thanh tiến độ */}
            <CardChecklistSection
              checklists={activeCard?.checklists || []}
              onUpdateCardChecklists={handleUpdateCardChecklists}
              onUploadAttachment={handleUploadChecklistAttachment}
              boardUsers={activeBoard?.FE_allUsers || []}
            />

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <DvrOutlinedIcon sx={{ color: '#9333ea' }} />
                <Typography variant="span" sx={{ fontWeight: '600', fontSize: '20px' }}>{t('cardModal.activityTitle')}</Typography>
              </Box>

              {/* Feature 04: Xử lý các hành động, ví dụ comment vào Card */}
              <CardActivitySection
                cardComments={activeCard?.comments}
                onAddCardComment={onAddCardComment}
                onUpdateCardComment={onUpdateCardComment}
                onDeleteCardComment={onDeleteCardComment}
                boardOwnerIds={activeBoard?.ownerIds || []}
              />
            </Box>
          </Grid>

          {/* Right side - trên mobile (xs) đưa lên TRƯỚC nội dung chính (order: -1) để không phải cuộn xuống cuối */}
          <Grid xs={12} sm={3} sx={{ order: { xs: -1, sm: 0 } }}>
            <Typography sx={{ fontWeight: '600', color: 'primary.main', mb: 1 }}>{t('cardModal.addToCard')}</Typography>
            <Stack
              spacing={1}
              direction={{ xs: 'row', sm: 'column' }}
              sx={{
                overflowX: { xs: 'auto', sm: 'visible' },
                overflowY: 'hidden',
                pb: { xs: 1, sm: 0 },
                '& > *': { flexShrink: { xs: 0, sm: 1 }, whiteSpace: 'nowrap' },
                '&::-webkit-scrollbar': { height: '5px' },
                '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '4px' }
              }}
            >
              {/* Feature 05: Xử lý hành động bản thân user tự join / leave khỏi card */}
              {!activeCard?.memberIds?.includes(currentUser._id) ? (
                <SidebarItem
                  className="active"
                  onClick={() => onUpdateCardMembers({ userId: currentUser._id, action: CARD_MEMBER_ACTION.ADD })}
                >
                  <PersonOutlineOutlinedIcon fontSize="small" sx={{ color: '#16a34a' }} />
                  {t('cardModal.join')}
                </SidebarItem>
              ) : (
                <SidebarItem
                  className="active"
                  onClick={() => onUpdateCardMembers({ userId: currentUser._id, action: CARD_MEMBER_ACTION.REMOVE })}
                  sx={{
                    '&:hover': {
                      color: 'error.main',
                      '& .MuiSvgIcon-root': { color: 'error.main' }
                    }
                  }}
                >
                  <ExitToAppIcon fontSize="small" sx={{ color: '#ef4444' }} />
                  {t('cardModal.leave')}
                </SidebarItem>
              )}
              {/* Feature 06: Xử lý hành động cập nhật ảnh Cover của Card */}
              <SidebarItem className="active" onClick={handleOpenCoverPicker}>
                <ImageOutlinedIcon fontSize="small" sx={{ color: '#ec4899' }} />
                {t('cardModal.cover')}

              </SidebarItem>
              {/* Popover chọn Cover — tái sử dụng nguyên bộ picker của board (Photos/Gradients/Colors/Upload) */}
              <ChangeBoardBackgroundPopover
                anchorEl={coverPickerAnchorEl}
                isOpen={Boolean(coverPickerAnchorEl)}
                onClose={() => setCoverPickerAnchorEl(null)}
                currentBackground={activeCard?.cover || null}
                onSelectBackground={handleMakeCover}
                onUploadBackgroundFile={handleUploadCardCoverFile}
                title={t('cardModal.cover')}
              />

              {/* Feature 10: Nút Upload tệp đính kèm */}
              <SidebarItem className="active" component="label">
                <AttachFileOutlinedIcon fontSize="small" sx={{ color: '#0d9488' }} />
                {t('cardModal.generalAttachment')}
                <VisuallyHiddenInput type="file" onChange={onUploadCardAttachment} />
              </SidebarItem>

              {/* Feature 07: Xử lý chọn & custom nhãn cho Card */}
              <SidebarItem className="active" onClick={handleOpenLabelPopover}>
                <LocalOfferOutlinedIcon fontSize="small" sx={{ color: '#8b5cf6' }} />
                {t('cardModal.labels')}
              </SidebarItem>

              <CardLabelPopover
                anchorEl={labelAnchorEl}
                isOpen={isLabelOpen}
                onClose={handleCloseLabelPopover}
                activeCardLabels={activeCard?.labels || []}
                onUpdateCardLabels={handleUpdateCardLabels}
              />

              {/* Feature 08: Thêm Checklist */}
              <SidebarItem className="active" onClick={handleOpenChecklistPopover}>
                <TaskAltOutlinedIcon fontSize="small" sx={{ color: '#16a34a' }} />
                {t('cardModal.checklist')}
              </SidebarItem>

              <CardChecklistPopover
                anchorEl={checklistAnchorEl}
                isOpen={isChecklistOpen}
                onClose={handleCloseChecklistPopover}
                onAddChecklist={handleAddChecklist}
              />

              {/* Feature 09: Chọn Hạn chót Dates */}
              <SidebarItem className="active" onClick={handleOpenDueDatePopover}>
                <WatchLaterOutlinedIcon fontSize="small" sx={{ color: '#f59e0b' }} />
                {t('cardModal.dates')}
              </SidebarItem>

              <CardDueDatePopover
                anchorEl={dueDateAnchorEl}
                isOpen={isDueDateOpen}
                onClose={handleCloseDueDatePopover}
                dueDate={activeCard?.dueDate}
                isDueDateComplete={activeCard?.isDueDateComplete}
                reminderMinutes={activeCard?.reminderMinutes}
                onUpdateDueDate={handleUpdateDueDate}
              />
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography sx={{ fontWeight: '600', color: 'primary.main', mb: 1 }}>{t('cardModal.actions')}</Typography>
            <Stack
              spacing={1}
              direction={{ xs: 'row', sm: 'column' }}
              sx={{
                overflowX: { xs: 'auto', sm: 'visible' },
                overflowY: 'hidden',
                pb: { xs: 1, sm: 0 },
                '& > *': { flexShrink: { xs: 0, sm: 1 }, whiteSpace: 'nowrap' },
                '&::-webkit-scrollbar': { height: '5px' },
                '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '4px' }
              }}
            >
              <SidebarItem
                className="active"
                onClick={handleDeleteCard}
                sx={{
                  '&:hover': {
                    color: 'error.light',
                    '& .MuiSvgIcon-root': { color: 'error.light' }
                  }
                }}
              >
                <DeleteForeverIcon fontSize="small" sx={{ color: '#ef4444' }} />
                {t('cardModal.deleteCard')}
              </SidebarItem>

              <SidebarItem className="active" onClick={handleOpenMovePopover}>
                <ArrowForwardOutlinedIcon fontSize="small" sx={{ color: '#6366f1' }} />
                {t('cardModal.move')}
              </SidebarItem>
              <CardMovePopover
                anchorEl={moveAnchorEl}
                isOpen={isMoveOpen}
                onClose={handleCloseMovePopover}
                card={activeCard}
                board={activeBoard}
              />

              <SidebarItem className="active" onClick={handleOpenCopyPopover}>
                <ContentCopyOutlinedIcon fontSize="small" sx={{ color: '#0ea5e9' }} />
                {t('cardModal.copy')}
              </SidebarItem>
              <CardCopyPopover
                anchorEl={copyAnchorEl}
                isOpen={isCopyOpen}
                onClose={handleCloseCopyPopover}
                card={activeCard}
                board={activeBoard}
              />

              {activeCard?._destroy ? (
                <SidebarItem className="active" onClick={handleRestoreCard}>
                  <UndoIcon fontSize="small" sx={{ color: '#16a34a' }} />
                  {t('cardModal.sendToBoard')}
                </SidebarItem>
              ) : (
                <SidebarItem className="active" onClick={handleArchiveCard}>
                  <ArchiveOutlinedIcon fontSize="small" sx={{ color: '#f43f5e' }} />
                  {t('cardModal.archive')}
                </SidebarItem>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  )
}

export default ActiveCard
