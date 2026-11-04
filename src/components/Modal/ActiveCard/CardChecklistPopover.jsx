import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Popover from '@mui/material/Popover'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined'

function CardChecklistPopover({ anchorEl, isOpen, onClose, onAddChecklist }) {
  const [title, setTitle] = useState('Checklist')

  const handleClose = () => {
    setTitle('Checklist')
    onClose()
  }

  const handleAdd = () => {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return
    onAddChecklist({
      _id: crypto.randomUUID(),
      title: trimmedTitle,
      items: []
    })
    handleClose()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
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
      slotProps={{
        paper: {
          sx: {
            width: { xs: 'min(300px, 88vw)', sm: 300 },
            p: 2,
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
          }
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TaskAltOutlinedIcon fontSize="small" color="primary" />
          <Typography variant="subtitle1" fontWeight={700}>
            Add checklist
          </Typography>
        </Box>
        <IconButton size="small" onClick={handleClose} aria-label="close">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Typography variant="caption" fontWeight={600} sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
        TITLE
      </Typography>
      <TextField
        fullWidth
        autoFocus
        size="small"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Checklist title..."
        sx={{ mb: 2 }}
      />

      <Button
        fullWidth
        variant="contained"
        color="primary"
        size="small"
        disabled={!title.trim()}
        onClick={handleAdd}
        sx={{ textTransform: 'none', fontWeight: 600 }}
      >
        Add
      </Button>
    </Popover>
  )
}

export default CardChecklistPopover

