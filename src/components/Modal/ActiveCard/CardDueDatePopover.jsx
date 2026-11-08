import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Popover from '@mui/material/Popover'
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'


import CloseIcon from '@mui/icons-material/Close'
import WatchLaterOutlinedIcon from '@mui/icons-material/WatchLaterOutlined'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

const HOURS_12 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const DEFAULT_MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']

const getReminderOptions = (t) => [
  { value: -1, label: t('dueDate.none') },
  { value: 0, label: t('dueDate.atTime') },
  { value: 10, label: t('dueDate.minutes10Before') },
  { value: 60, label: t('dueDate.hour1Before') },
  { value: 120, label: t('dueDate.hours2Before') },
  { value: 1440, label: t('dueDate.day1Before') },
  { value: 2880, label: t('dueDate.days2Before') }
]

const parseDueDateTo12h = (timestamp) => {
  if (timestamp) {
    const d = dayjs(timestamp)
    const h24 = d.hour()
    return {
      date: d.format('YYYY-MM-DD'),
      hour: h24 % 12 === 0 ? 12 : h24 % 12,
      minute: d.format('mm'),
      ampm: h24 >= 12 ? 'PM' : 'AM'
    }
  }
  const tomorrow = dayjs().add(1, 'day')
  return {
    date: tomorrow.format('YYYY-MM-DD'),
    hour: 5,
    minute: '00',
    ampm: 'PM'
  }
}

function CardDueDatePopover({
  anchorEl,
  isOpen,
  onClose,
  dueDate,
  isDueDateComplete = false,
  reminderMinutes = 1440,
  onUpdateDueDate
}) {
  const { t } = useTranslation()
  const REMINDER_OPTIONS = getReminderOptions(t)
  const [dateStr, setDateStr] = useState(() => parseDueDateTo12h(dueDate).date)
  const [hour12, setHour12] = useState(() => parseDueDateTo12h(dueDate).hour)
  const [minuteStr, setMinuteStr] = useState(() => parseDueDateTo12h(dueDate).minute)
  const [ampm, setAmpm] = useState(() => parseDueDateTo12h(dueDate).ampm)

  const [reminder, setReminder] = useState(() => (reminderMinutes === null ? -1 : (reminderMinutes ?? 1440)))

  useEffect(() => {
    if (isOpen) {
      const initial = parseDueDateTo12h(dueDate)
      setDateStr(initial.date)
      setHour12(initial.hour)
      setMinuteStr(initial.minute)
      setAmpm(initial.ampm)

      setReminder(reminderMinutes === null ? -1 : (reminderMinutes ?? 1440))
    }
  }, [isOpen, dueDate, isDueDateComplete, reminderMinutes])

  // Danh sách các phút, đảm bảo giá trị hiện tại luôn có trong danh sách
  const minuteOptions = DEFAULT_MINUTES.includes(minuteStr)
    ? DEFAULT_MINUTES
    : [...DEFAULT_MINUTES, minuteStr].sort()

  const handleSave = () => {
    if (!dateStr) return

    let h24 = Number(hour12)
    if (ampm === 'PM' && h24 < 12) h24 += 12
    if (ampm === 'AM' && h24 === 12) h24 = 0

    const finalDateTime = dayjs(dateStr).hour(h24).minute(Number(minuteStr)).second(0)

    onUpdateDueDate({
      dueDate: finalDateTime.valueOf(),

      reminderMinutes: reminder === -1 ? null : reminder
    })
    onClose()
  }

  const handleRemove = () => {
    onUpdateDueDate({
      dueDate: null,
      isDueDateComplete: false,
      reminderMinutes: 1440
    })
    onClose()
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
            width: { xs: 'min(330px, 88vw)', sm: 330 },
            p: 2,
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
          }
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WatchLaterOutlinedIcon fontSize="small" color="primary" />
          <Typography variant="subtitle1" fontWeight={700}>
            {t('cardModal.dates')}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} aria-label={t('common.close')}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Chọn Ngày */}
      <Box sx={{ mb: 1.5 }}>
        <Typography variant="caption" fontWeight={600} sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
          {t('cardModal.dueDateTitle')}
        </Typography>
        <TextField
          fullWidth
          size="small"
          type="date"
          value={dateStr}
          onChange={(e) => setDateStr(e.target.value)}
        />
      </Box>

      {/* Chọn Giờ: 1 đến 12 và AM/PM */}
      <Box sx={{ mb: 1.5 }}>
        <Typography variant="caption" fontWeight={600} sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
          {t('cardModal.dueTime')}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Giờ từ 1 đến 12 */}
          <Select
            size="small"
            value={hour12}
            onChange={(e) => setHour12(Number(e.target.value))}
            sx={{ flex: 1 }}
            MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}
          >
            {HOURS_12.map((h) => (
              <MenuItem key={h} value={h}>
                {h}
              </MenuItem>
            ))}
          </Select>

          <Typography fontWeight={700}>:</Typography>

          {/* Phút */}
          <Select
            size="small"
            value={minuteStr}
            onChange={(e) => setMinuteStr(e.target.value)}
            sx={{ flex: 1 }}
            MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}
          >
            {minuteOptions.map((m) => (
              <MenuItem key={m} value={m}>
                {m}
              </MenuItem>
            ))}
          </Select>

          {/* Buổi AM / PM */}
          <Select
            size="small"
            value={ampm}
            onChange={(e) => setAmpm(e.target.value)}
            sx={{ width: 85 }}
          >
            <MenuItem value="AM">AM</MenuItem>
            <MenuItem value="PM">PM</MenuItem>
          </Select>
        </Box>
      </Box>

      {/* Cài đặt nhắc nhở (Set Reminder) */}
      <Box sx={{ mb: 1.5 }}>
        <Typography variant="caption" fontWeight={600} sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
          {t('cardModal.setReminder')}
        </Typography>
        <Select
          fullWidth
          size="small"
          value={reminder}
          onChange={(e) => setReminder(Number(e.target.value))}
          MenuProps={{ PaperProps: { sx: { maxHeight: 220 } } }}
        >
          {REMINDER_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </Box>


      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          size="small"
          onClick={handleSave}
          disabled={!dateStr}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          {t('common.save')}
        </Button>
        {dueDate && (
          <Button
            fullWidth
            variant="outlined"
            color="inherit"
            size="small"
            onClick={handleRemove}
            sx={{
              textTransform: 'none',
              borderColor: 'divider',
              '&:hover': { color: 'error.main', borderColor: 'error.light' }
            }}
          >
            {t('dueDate.remove')}
          </Button>
        )}
      </Box>
    </Popover>
  )
}

export default CardDueDatePopover
