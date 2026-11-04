import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Checkbox from '@mui/material/Checkbox'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import LinkIcon from '@mui/icons-material/Link'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import CloseIcon from '@mui/icons-material/Close'
import { useTranslation } from 'react-i18next'

function CardChecklistSection({ checklists = [], onUpdateCardChecklists, onUploadAttachment }) {
  const { t } = useTranslation()
  // State cho thêm item mới
  const [activeChecklistIdForNewItem, setActiveChecklistIdForNewItem] = useState(null)
  const [newItemTitle, setNewItemTitle] = useState('')
  const [newItemAttachments, setNewItemAttachments] = useState([])
  const [showNewItemAttachBox, setShowNewItemAttachBox] = useState(false)
  const [newItemCurrentUrl, setNewItemCurrentUrl] = useState('')
  const [isUploadingNewItemFile, setIsUploadingNewItemFile] = useState(false)

  // State cho chỉnh sửa item
  const [editingItemId, setEditingItemId] = useState(null)
  const [editingItemTitle, setEditingItemTitle] = useState('')
  const [editingItemAttachments, setEditingItemAttachments] = useState([])
  const [showEditItemAttachBox, setShowEditItemAttachBox] = useState(false)
  const [editingItemCurrentUrl, setEditingItemCurrentUrl] = useState('')
  const [isUploadingEditItemFile, setIsUploadingEditItemFile] = useState(false)

  if (!checklists || checklists.length === 0) return null

  const getValidUrl = (url) => {
    if (!url) return null
    const trimmed = url.trim()
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed
    if (trimmed.startsWith('/')) return trimmed
    return `https://${trimmed}`
  }

  // Chuẩn hóa danh sách tệp/link đính kèm (hỗ trợ cả schema mới attachments[] và schema cũ link/fileName)
  const getItemAttachments = (item) => {
    if (Array.isArray(item.attachments) && item.attachments.length > 0) {
      return item.attachments
    }
    if (item.link) {
      const isFile = Boolean(
        item.fileName ||
        /\.(jpg|jpeg|png|gif|webp|svg|pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|txt|csv)$/i.test(item.link) ||
        item.link.includes('cloudinary.com')
      )
      return [{
        _id: 'legacy_1',
        url: item.link,
        fileName: item.fileName || null,
        isFile
      }]
    }
    return []
  }

  // Xóa toàn bộ 1 checklist
  const handleDeleteChecklist = (checklistId) => {
    const updated = checklists.filter(c => c._id !== checklistId)
    onUpdateCardChecklists(updated)
  }

  // Tích chọn hoặc bỏ chọn 1 item trong checklist
  const handleToggleItem = (checklistId, itemId) => {
    const updated = checklists.map(cl => {
      if (cl._id !== checklistId) return cl
      return {
        ...cl,
        items: cl.items.map(item => {
          if (item._id !== itemId) return item
          return { ...item, isDone: !item.isDone }
        })
      }
    })
    onUpdateCardChecklists(updated)
  }

  // Xóa 1 item trong checklist
  const handleDeleteItem = (checklistId, itemId) => {
    const updated = checklists.map(cl => {
      if (cl._id !== checklistId) return cl
      return {
        ...cl,
        items: cl.items.filter(item => item._id !== itemId)
      }
    })
    onUpdateCardChecklists(updated)
  }

  // --- LUỒNG THÊM MỤC MỚI (NEW ITEM) ---
  const handleStartAddItem = (checklistId) => {
    setActiveChecklistIdForNewItem(checklistId)
    setNewItemTitle('')
    setNewItemAttachments([])
    setNewItemCurrentUrl('')
    setShowNewItemAttachBox(false)
    setIsUploadingNewItemFile(false)
    setEditingItemId(null)
  }

  const handleCancelAddItem = () => {
    setActiveChecklistIdForNewItem(null)
    setNewItemTitle('')
    setNewItemAttachments([])
    setNewItemCurrentUrl('')
    setShowNewItemAttachBox(false)
    setIsUploadingNewItemFile(false)
  }

  const handleAddNewItemLink = () => {
    const trimmed = newItemCurrentUrl.trim()
    if (!trimmed) return
    const validUrl = getValidUrl(trimmed)
    const newAtt = {
      _id: crypto.randomUUID(),
      url: validUrl,
      fileName: null,
      isFile: false
    }
    setNewItemAttachments(prev => [...prev, newAtt])
    setNewItemCurrentUrl('')
  }

  const handleRemoveNewItemAttachment = (attId) => {
    setNewItemAttachments(prev => prev.filter(a => a._id !== attId))
  }

  const handleUploadFileForNewItem = async (file) => {
    if (!file || !onUploadAttachment) return
    setIsUploadingNewItemFile(true)
    try {
      const uploaded = await onUploadAttachment(file)
      if (uploaded?.fileUrl) {
        const newAtt = {
          _id: crypto.randomUUID(),
          url: uploaded.fileUrl,
          fileName: uploaded.fileName || file.name,
          isFile: true
        }
        setNewItemAttachments(prev => [...prev, newAtt])
        setNewItemCurrentUrl('')
        // Tự động lấy tên file làm tiêu đề nếu ô tiêu đề đang trống
        if (!newItemTitle.trim()) {
          setNewItemTitle(uploaded.fileName || file.name)
        }
      }
    } finally {
      setIsUploadingNewItemFile(false)
    }
  }

  const handleSaveNewItem = (checklistId) => {
    const trimmedTitle = newItemTitle.trim()
    if (!trimmedTitle) return

    let finalAttachments = [...newItemAttachments]
    if (newItemCurrentUrl.trim()) {
      finalAttachments.push({
        _id: crypto.randomUUID(),
        url: getValidUrl(newItemCurrentUrl.trim()),
        fileName: null,
        isFile: false
      })
    }

    const newItem = {
      _id: crypto.randomUUID(),
      title: trimmedTitle,
      link: finalAttachments[0]?.url || null,
      fileName: finalAttachments[0]?.fileName || null,
      attachments: finalAttachments,
      isDone: false
    }

    const updated = checklists.map(cl => {
      if (cl._id !== checklistId) return cl
      return {
        ...cl,
        items: [...(cl.items || []), newItem]
      }
    })

    onUpdateCardChecklists(updated)
    setNewItemTitle('')
    setNewItemAttachments([])
    setNewItemCurrentUrl('')
    setShowNewItemAttachBox(false)
  }

  // --- LUỒNG CHỈNH SỬA MỤC ĐÃ CÓ (EDIT ITEM) ---
  const handleStartEditItem = (item) => {
    setEditingItemId(item._id)
    setEditingItemTitle(item.title || '')
    setEditingItemAttachments(getItemAttachments(item))
    setEditingItemCurrentUrl('')
    setShowEditItemAttachBox(false)
    setIsUploadingEditItemFile(false)
    setActiveChecklistIdForNewItem(null)
  }

  const handleCancelEditItem = () => {
    setEditingItemId(null)
    setEditingItemTitle('')
    setEditingItemAttachments([])
    setEditingItemCurrentUrl('')
    setShowEditItemAttachBox(false)
    setIsUploadingEditItemFile(false)
  }

  const handleAddEditItemLink = () => {
    const trimmed = editingItemCurrentUrl.trim()
    if (!trimmed) return
    const validUrl = getValidUrl(trimmed)
    const newAtt = {
      _id: crypto.randomUUID(),
      url: validUrl,
      fileName: null,
      isFile: false
    }
    setEditingItemAttachments(prev => [...prev, newAtt])
    setEditingItemCurrentUrl('')
  }

  const handleRemoveEditItemAttachment = (attId) => {
    setEditingItemAttachments(prev => prev.filter(a => a._id !== attId))
  }

  const handleUploadFileForEditItem = async (file) => {
    if (!file || !onUploadAttachment) return
    setIsUploadingEditItemFile(true)
    try {
      const uploaded = await onUploadAttachment(file)
      if (uploaded?.fileUrl) {
        const newAtt = {
          _id: crypto.randomUUID(),
          url: uploaded.fileUrl,
          fileName: uploaded.fileName || file.name,
          isFile: true
        }
        setEditingItemAttachments(prev => [...prev, newAtt])
        setEditingItemCurrentUrl('')
        if (!editingItemTitle.trim()) {
          setEditingItemTitle(uploaded.fileName || file.name)
        }
      }
    } finally {
      setIsUploadingEditItemFile(false)
    }
  }

  const handleSaveEditItem = (checklistId, itemId) => {
    const trimmedTitle = editingItemTitle.trim()
    if (!trimmedTitle) return

    let finalAttachments = [...editingItemAttachments]
    if (editingItemCurrentUrl.trim()) {
      finalAttachments.push({
        _id: crypto.randomUUID(),
        url: getValidUrl(editingItemCurrentUrl.trim()),
        fileName: null,
        isFile: false
      })
    }

    const updated = checklists.map(cl => {
      if (cl._id !== checklistId) return cl
      return {
        ...cl,
        items: (cl.items || []).map(item => {
          if (item._id !== itemId) return item
          return {
            ...item,
            title: trimmedTitle,
            link: finalAttachments[0]?.url || null,
            fileName: finalAttachments[0]?.fileName || null,
            attachments: finalAttachments
          }
        })
      }
    })

    onUpdateCardChecklists(updated)
    handleCancelEditItem()
  }

  return (
    <Stack spacing={3} sx={{ mb: 3 }}>
      {checklists.map((checklist) => {
        const totalItems = checklist.items?.length || 0
        const completedItems = checklist.items?.filter(i => i.isDone).length || 0
        const percentage = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100)
        const isComplete = totalItems > 0 && completedItems === totalItems
        const isAddingItem = activeChecklistIdForNewItem === checklist._id

        return (
          <Box key={checklist._id}>
            {/* Header Checklist */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <TaskAltOutlinedIcon sx={{ color: '#16a34a' }} />
                <Typography sx={{ fontWeight: '600', fontSize: '18px' }}>
                  {checklist.title}
                </Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                onClick={() => handleDeleteChecklist(checklist._id)}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.8rem',
                  borderColor: 'divider',
                  '&:hover': { bgcolor: 'action.hover', color: 'error.main', borderColor: 'error.light' }
                }}
              >
                {t('common.delete')}
              </Button>
            </Box>

            {/* Thanh tiến độ Progress Bar */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, pl: 4 }}>
              <Typography variant="caption" sx={{ minWidth: 32, fontWeight: 700, color: isComplete ? 'success.main' : 'text.secondary' }}>
                {percentage}%
              </Typography>
              <Box sx={{ flexGrow: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={percentage}
                  color={isComplete ? 'success' : 'primary'}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e0e0e0'),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      transition: 'transform 0.3s ease'
                    }
                  }}
                />
              </Box>
            </Box>

            {/* Danh sách các item trong checklist
                Item đã hoàn thành (isDone) tự động chìm xuống CUỐI danh sách
                (stable sort nên thứ tự tương đối của các item cùng trạng thái được giữ nguyên),
                giúp các việc CHƯA làm luôn nằm gọn phía trên */}
            <Stack spacing={0.5} sx={{ pl: 3.5, mb: 1 }}>
              {[...(checklist.items || [])]
                .sort((a, b) => Number(Boolean(a.isDone)) - Number(Boolean(b.isDone)))
                .map((item) => {
                  const isEditingThisItem = editingItemId === item._id
                  const itemAttachments = getItemAttachments(item)

                  if (isEditingThisItem) {
                    return (
                      <Box
                        key={item._id}
                        sx={{
                          p: 1.5,
                          borderRadius: 1.5,
                          bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#f8fafc',
                          border: (theme) => `1px solid ${theme.palette.divider}`,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1.25,
                          my: 0.5
                        }}
                      >
                        <TextField
                          fullWidth
                          autoFocus
                          size="small"
                          placeholder={t('card.taskTitle')}
                          value={editingItemTitle}
                          onChange={(e) => setEditingItemTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleSaveEditItem(checklist._id, item._id)
                            }
                            if (e.key === 'Escape') {
                              handleCancelEditItem()
                            }
                          }}
                        />

                        {/* Danh sách các chip tệp/link của item đang sửa */}
                        {editingItemAttachments.length > 0 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                            {editingItemAttachments.map(att => (
                              <Chip
                                key={att._id}
                                size="small"
                                icon={att.isFile ? <AttachFileIcon sx={{ fontSize: '14px !important' }} /> : <LinkIcon sx={{ fontSize: '14px !important' }} />}
                                label={att.fileName || (att.url.replace(/^https?:\/\//, '').length > 25 ? `${att.url.replace(/^https?:\/\//, '').substring(0, 22)}...` : att.url.replace(/^https?:\/\//, ''))}
                                onDelete={() => handleRemoveEditItemAttachment(att._id)}
                                color={att.isFile ? 'success' : 'primary'}
                                variant="outlined"
                                sx={{ maxWidth: 220, height: 26, fontSize: '0.75rem', fontWeight: 600 }}
                              />
                            ))}
                          </Box>
                        )}

                        {/* Hộp nhập thêm link hoặc tải tệp khi sửa */}
                        {showEditItemAttachBox && (
                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            p: 1,
                            borderRadius: 1,
                            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#ffffff',
                            border: (theme) => `1px dashed ${theme.palette.divider}`
                          }}>
                            <TextField
                              fullWidth
                              size="small"
                              placeholder="Dán link web và nhấn Enter (hoặc bấm icon kẹp giấy để tải tệp)..."
                              value={editingItemCurrentUrl}
                              onChange={(e) => setEditingItemCurrentUrl(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  handleAddEditItemLink()
                                }
                              }}
                              InputProps={{
                                startAdornment: <LinkIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
                                endAdornment: (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    {onUploadAttachment && (
                                      <Tooltip title="Tải tệp từ máy tính">
                                        <span>
                                          <IconButton
                                            size="small"
                                            component="label"
                                            disabled={isUploadingEditItemFile}
                                            sx={{
                                              color: isUploadingEditItemFile ? 'primary.main' : 'text.secondary',
                                              '&:hover': { color: 'primary.main' }
                                            }}
                                          >
                                            {isUploadingEditItemFile ? (
                                              <CircularProgress size={18} />
                                            ) : (
                                              <AttachFileIcon fontSize="small" />
                                            )}
                                            <input
                                              type="file"
                                              hidden
                                              onChange={(e) => {
                                                const file = e.target?.files?.[0]
                                                if (file) handleUploadFileForEditItem(file)
                                                e.target.value = ''
                                              }}
                                            />
                                          </IconButton>
                                        </span>
                                      </Tooltip>
                                    )}
                                  </Box>
                                )
                              }}
                            />
                            {editingItemCurrentUrl.trim() && (
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={handleAddEditItemLink}
                                sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
                              >
                              Add
                              </Button>
                            )}
                          </Box>
                        )}

                        {/* Hàng nút Save, Cancel, và Nút Đính kèm thêm */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Button
                              size="small"
                              variant="contained"
                              color="primary"
                              onClick={() => handleSaveEditItem(checklist._id, item._id)}
                              disabled={!editingItemTitle.trim()}
                              sx={{ textTransform: 'none', fontWeight: 600 }}
                            >
                            Save
                            </Button>
                            <Button
                              size="small"
                              variant="text"
                              color="inherit"
                              onClick={handleCancelEditItem}
                              sx={{ textTransform: 'none' }}
                            >
                            Cancel
                            </Button>
                          </Box>

                          <Button
                            size="small"
                            variant={showEditItemAttachBox || editingItemAttachments.length > 0 ? 'outlined' : 'text'}
                            color={editingItemAttachments.length > 0 ? 'success' : 'inherit'}
                            startIcon={<AttachFileIcon sx={{ fontSize: '18px !important' }} />}
                            onClick={() => setShowEditItemAttachBox(!showEditItemAttachBox)}
                            sx={{
                              textTransform: 'none',
                              fontSize: '0.8rem',
                              fontWeight: 500,
                              color: (theme) => editingItemAttachments.length > 0 ? 'success.main' : theme.palette.text.secondary
                            }}
                          >
                            {editingItemAttachments.length > 0 ? `Đính kèm (${editingItemAttachments.length})` : 'Đính kèm link / tệp'}
                          </Button>
                        </Box>
                      </Box>
                    )
                  }

                  return (
                    <Box
                      key={item._id}
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        py: 0.6,
                        px: 1,
                        borderRadius: 1,
                        '&:hover': {
                          bgcolor: 'action.hover',
                          '& .action-item-btn': { opacity: 1 }
                        }
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 1,
                          flexGrow: 1,
                          minWidth: 0
                        }}
                      >
                        <Checkbox
                          checked={Boolean(item.isDone)}
                          size="small"
                          sx={{ p: 0.25, mt: '2px' }}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleItem(checklist._id, item._id)
                          }}
                        />
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flexGrow: 1, minWidth: 0 }}>
                          {/* Dòng 1: Tiêu đề công việc */}
                          <Typography
                            variant="body2"
                            onClick={() => handleToggleItem(checklist._id, item._id)}
                            sx={{
                              textDecoration: item.isDone ? 'line-through' : 'none',
                              color: item.isDone ? 'text.secondary' : 'text.primary',
                              fontWeight: item.isDone ? 400 : 500,
                              lineHeight: 1.4,
                              wordBreak: 'break-word',
                              cursor: 'pointer'
                            }}
                          >
                            {item.title}
                          </Typography>

                          {/* Dòng 2: Xuống dòng hoàn toàn, hiển thị các Chip link / tệp đính kèm */}
                          {itemAttachments.length > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', pt: 0.25 }}>
                              {itemAttachments.map(att => (
                                <Tooltip
                                  key={att._id}
                                  title={att.fileName ? `Tệp: ${att.fileName} (Nhấp để mở)` : `Mở: ${att.url}`}
                                >
                                  <Chip
                                    size="small"
                                    icon={att.isFile ? <AttachFileIcon sx={{ fontSize: '13px !important' }} /> : <OpenInNewIcon sx={{ fontSize: '13px !important' }} />}
                                    label={att.fileName
                                      ? (att.fileName.length > 25 ? `${att.fileName.substring(0, 22)}...` : att.fileName)
                                      : (att.url.replace(/^https?:\/\//, '').length > 25
                                        ? `${att.url.replace(/^https?:\/\//, '').substring(0, 22)}...`
                                        : att.url.replace(/^https?:\/\//, ''))
                                    }
                                    clickable
                                    color={att.isFile ? 'success' : 'primary'}
                                    variant="outlined"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      window.open(getValidUrl(att.url), '_blank', 'noopener,noreferrer')
                                    }}
                                    sx={{
                                      height: 22,
                                      fontSize: '0.72rem',
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                      maxWidth: 220,
                                      '&:hover': {
                                        bgcolor: att.isFile ? 'success.light' : 'primary.light',
                                        color: 'white'
                                      }
                                    }}
                                  />
                                </Tooltip>
                              ))}
                            </Box>
                          )}
                        </Box>
                      </Box>

                      {/* Các nút Sửa và Xóa khi hover */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: '2px', flexShrink: 0 }}>
                        <Tooltip title={t('card.editItem')}>
                          <IconButton
                            className="action-item-btn"
                            size="small"
                            onClick={() => handleStartEditItem(item)}
                            sx={{
                              opacity: 0,
                              transition: 'opacity 0.2s',
                              color: 'text.secondary',
                              '&:hover': { color: 'primary.main' }
                            }}
                          >
                            <EditOutlinedIcon fontSize="small" sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title={t('card.deleteItem')}>
                          <IconButton
                            className="action-item-btn"
                            size="small"
                            onClick={() => handleDeleteItem(checklist._id, item._id)}
                            sx={{
                              opacity: 0,
                              transition: 'opacity 0.2s',
                              color: 'text.secondary',
                              '&:hover': { color: 'error.main' }
                            }}
                          >
                            <DeleteOutlineIcon fontSize="small" sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  )
                })}
            </Stack>

            {/* Thêm mục mới vào checklist */}
            <Box sx={{ pl: 4.5, mt: 1 }}>
              {isAddingItem ? (
                <Box sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#f8fafc',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.25
                }}>
                  <TextField
                    fullWidth
                    autoFocus
                    size="small"
                    placeholder={t('card.addItemTitle')}
                    value={newItemTitle}
                    onChange={(e) => setNewItemTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleSaveNewItem(checklist._id)
                      }
                      if (e.key === 'Escape') {
                        handleCancelAddItem()
                      }
                    }}
                  />

                  {/* Danh sách các chip tệp / link đã gắn cho item mới */}
                  {newItemAttachments.length > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                      {newItemAttachments.map(att => (
                        <Chip
                          key={att._id}
                          size="small"
                          icon={att.isFile ? <AttachFileIcon sx={{ fontSize: '14px !important' }} /> : <LinkIcon sx={{ fontSize: '14px !important' }} />}
                          label={att.fileName || (att.url.replace(/^https?:\/\//, '').length > 25 ? `${att.url.replace(/^https?:\/\//, '').substring(0, 22)}...` : att.url.replace(/^https?:\/\//, ''))}
                          onDelete={() => handleRemoveNewItemAttachment(att._id)}
                          color={att.isFile ? 'success' : 'primary'}
                          variant="outlined"
                          sx={{ maxWidth: 220, height: 26, fontSize: '0.75rem', fontWeight: 600 }}
                        />
                      ))}
                    </Box>
                  )}

                  {/* Hộp nhập thêm link hoặc tải tệp (chỉ hiện khi bấm nút Đính kèm) */}
                  {showNewItemAttachBox && (
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 1,
                      borderRadius: 1,
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#ffffff',
                      border: (theme) => `1px dashed ${theme.palette.divider}`
                    }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Dán link web và nhấn Enter (hoặc bấm icon kẹp giấy để tải tệp)..."
                        value={newItemCurrentUrl}
                        onChange={(e) => setNewItemCurrentUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddNewItemLink()
                          }
                        }}
                        InputProps={{
                          startAdornment: <LinkIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
                          endAdornment: (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {onUploadAttachment && (
                                <Tooltip title="Tải tệp từ máy tính">
                                  <span>
                                    <IconButton
                                      size="small"
                                      component="label"
                                      disabled={isUploadingNewItemFile}
                                      sx={{
                                        color: isUploadingNewItemFile ? 'primary.main' : 'text.secondary',
                                        '&:hover': { color: 'primary.main' }
                                      }}
                                    >
                                      {isUploadingNewItemFile ? (
                                        <CircularProgress size={18} />
                                      ) : (
                                        <AttachFileIcon fontSize="small" />
                                      )}
                                      <input
                                        type="file"
                                        hidden
                                        onChange={(e) => {
                                          const file = e.target?.files?.[0]
                                          if (file) handleUploadFileForNewItem(file)
                                          e.target.value = ''
                                        }}
                                      />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                              )}
                            </Box>
                          )
                        }}
                      />
                      {newItemCurrentUrl.trim() && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={handleAddNewItemLink}
                          sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
                        >
                          Add
                        </Button>
                      )}
                    </Box>
                  )}

                  {/* Hàng nút hành động: Add, Cancel, và Nút Đính kèm link/tệp */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => handleSaveNewItem(checklist._id)}
                        disabled={!newItemTitle.trim()}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                      >
                        Add
                      </Button>
                      <IconButton size="small" onClick={handleCancelAddItem}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    {/* Nút bấm để bật/tắt ô đính kèm */}
                    <Button
                      size="small"
                      variant={showNewItemAttachBox || newItemAttachments.length > 0 ? 'outlined' : 'text'}
                      color={newItemAttachments.length > 0 ? 'success' : 'inherit'}
                      startIcon={<AttachFileIcon sx={{ fontSize: '18px !important' }} />}
                      onClick={() => setShowNewItemAttachBox(!showNewItemAttachBox)}
                      sx={{
                        textTransform: 'none',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        color: (theme) => newItemAttachments.length > 0 ? 'success.main' : theme.palette.text.secondary
                      }}
                    >
                      {newItemAttachments.length > 0 ? `Đính kèm (${newItemAttachments.length})` : 'Đính kèm link / tệp'}
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  onClick={() => handleStartAddItem(checklist._id)}
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.825rem',
                    borderColor: 'divider',
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#f4f5f7',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  + {t('card.addItem')}
                </Button>
              )}
            </Box>
          </Box>
        )
      })}
    </Stack>
  )
}

export default CardChecklistSection
