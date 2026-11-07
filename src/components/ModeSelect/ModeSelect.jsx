import { useState } from 'react'
import { useColorScheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Box from '@mui/material/Box'
import CheckIcon from '@mui/icons-material/Check'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness'

/**
 * Nút chuyển chế độ sáng/tối dạng icon (sun/moon/auto) + menu lựa chọn.
 * Thay thế cho Select có floating label trước đây (label dễ bị cắt trên navbar mobile).
 *
 * variant:
 * - 'appbar' (mặc định): icon TRẮNG, dùng trên nền xanh/dậm (AppBar, trang Auth)
 * - 'page': icon theo theme, dùng trên nền sáng/tối của trang thường (Home)
 */
function ModeSelect({ variant = 'appbar' }) {
  const { mode, setMode } = useColorScheme()
  const { t } = useTranslation()
  const [anchorEl, setAnchorEl] = useState(null)

  const onColoredBg = variant === 'appbar'
  const iconColor = onColoredBg ? 'inherit' : undefined

  const ModeIcon = mode === 'light'
    ? LightModeIcon
    : mode === 'dark'
      ? DarkModeOutlinedIcon
      : SettingsBrightnessIcon

  const options = [
    { value: 'light', label: t('mode.light'), Icon: LightModeIcon },
    { value: 'dark', label: t('mode.dark'), Icon: DarkModeOutlinedIcon },
    { value: 'system', label: t('mode.system'), Icon: SettingsBrightnessIcon }
  ]

  return (
    <>
      <Tooltip title={t('mode.label')}>
        <IconButton
          size="small"
          onClick={(event) => setAnchorEl(event.currentTarget)}
          aria-label={t('mode.label')}
          aria-haspopup="menu"
          sx={{
            color: onColoredBg ? 'white' : 'text.primary',
            width: 44,
            height: 44,
            borderRadius: 1.5,
            ...(onColoredBg && {
              bgcolor: 'rgba(255, 255, 255, 0.12)',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.22)' }
            }),
            ...(!onColoredBg && {
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': { bgcolor: 'action.hover' }
            })
          }}
        >
          <ModeIcon fontSize="small" sx={{ color: iconColor }} />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 170 } } }}
      >
        {options.map(({ value, label, Icon }) => (
          <MenuItem
            key={value}
            selected={mode === value}
            onClick={() => {
              setMode(value)
              setAnchorEl(null)
            }}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              <Icon fontSize="small" />
            </ListItemIcon>
            <Box sx={{ flexGrow: 1 }}>{label}</Box>
            {mode === value && <CheckIcon fontSize="small" sx={{ color: 'primary.main' }} />}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}

export default ModeSelect
