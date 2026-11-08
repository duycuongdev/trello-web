import React from 'react'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Avatar from '@mui/material/Avatar'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Settings from '@mui/icons-material/Settings'
import Logout from '@mui/icons-material/Logout'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import KeyboardOutlinedIcon from '@mui/icons-material/KeyboardOutlined'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness'
import TranslateIcon from '@mui/icons-material/Translate'
import CheckIcon from '@mui/icons-material/Check'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { useSelector, useDispatch } from 'react-redux'
import { selectCurrentUser, logoutUserAPI } from '~/redux/user/userSlice'
import { useConfirm } from 'material-ui-confirm'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useColorScheme } from '@mui/material/styles'
import { SUPPORTED_LANGUAGES } from '~/i18n'

function Profile({ onOpenTour, onOpenShortcuts, openUpward = false }) {
  // Profile được render 2 lần (AppBar desktop + BottomNav mobile) nên id phải duy nhất theo instance
  const buttonId = React.useId()
  const menuId = React.useId()
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [themeAnchor, setThemeAnchor] = React.useState(null)
  const [langAnchor, setLangAnchor] = React.useState(null)
  const open = Boolean(anchorEl)
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
    setThemeAnchor(null)
    setLangAnchor(null)
  }

  const { t, i18n } = useTranslation()
  const { mode, setMode } = useColorScheme()
  const currentLang = i18n.language?.startsWith('vi') ? 'vi' : 'en'
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)

  const ModeIcon = mode === 'light'
    ? LightModeIcon
    : mode === 'dark'
      ? DarkModeOutlinedIcon
      : SettingsBrightnessIcon
  const modeOptions = [
    { value: 'light', label: t('mode.light'), Icon: LightModeIcon },
    { value: 'dark', label: t('mode.dark'), Icon: DarkModeOutlinedIcon },
    { value: 'system', label: t('mode.system'), Icon: SettingsBrightnessIcon }
  ]

  const confirmLogout = useConfirm()
  const handleLogout = () => {
    confirmLogout({
      title: t('profileMenu.logoutTitle'),
      confirmationText: t('common.confirm'),
      cancellationText: t('common.cancel')
    }).then(() => {
      dispatch(logoutUserAPI())
    }).catch(() => { })
  }
  return (
    <Box>
      <Tooltip title={t('profileMenu.accountSettings')}>
        <IconButton
          id={buttonId}
          onClick={handleClick}
          size="small"
          sx={{ color: 'inherit' }}
          aria-label={t('profileMenu.accountSettings')}
          aria-controls={open ? menuId : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <Avatar
            sx={{ width: 36, height: 36 }}
            alt={currentUser?.displayName || t('common.avatar')}
            src={currentUser?.avatar}
          />
        </IconButton>
      </Tooltip>
      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        // openUpward: dùng khi nút nằm ở BottomNav (đáy màn hình) - menu mở hướng lên, không đè lên icon
        anchorOrigin={openUpward ? { vertical: 'top', horizontal: 'right' } : { vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={openUpward ? { vertical: 'bottom', horizontal: 'right' } : { vertical: 'top', horizontal: 'right' }}
        MenuListProps={{
          'aria-labelledby': buttonId
        }}
      >
        <Link to='/settings/account' style={{ color: 'inherit' }}>
          <MenuItem sx={{ '&:hover': { color: 'success.light' } }}>
            <Avatar
              sx={{ width: 28, height: 28, mr: 2 }}
              alt={currentUser?.displayName || t('common.avatar')}
              src={currentUser?.avatar}
            /> {t('profileMenu.profile')}
          </MenuItem>
        </Link>
        <Divider />
        <MenuItem onClick={() => {
          handleClose()
          if (onOpenTour) onOpenTour()
        }}>
          <ListItemIcon>
            <HelpOutlineIcon fontSize="small" sx={{ color: '#0052cc' }} />
          </ListItemIcon>
          {t('profileMenu.productTour')}
        </MenuItem>
        <MenuItem onClick={() => {
          handleClose()
          if (onOpenShortcuts) onOpenShortcuts()
        }}>
          <ListItemIcon>
            <KeyboardOutlinedIcon fontSize="small" sx={{ color: '#0ea5e9' }} />
          </ListItemIcon>
          {t('profileMenu.shortcuts')}
        </MenuItem>
        <Divider />
        {/* Chế độ sáng/tối + ngôn ngữ: đặt trong menu Profile để truy cập được trên mobile (BottomNav) */}
        <MenuItem
          onClick={(event) => { event.stopPropagation(); setThemeAnchor(event.currentTarget) }}
          aria-haspopup="menu"
          aria-expanded={themeAnchor ? 'true' : undefined}
        >
          <ListItemIcon>
            <ModeIcon fontSize="small" sx={{ color: '#f59e0b' }} />
          </ListItemIcon>
          <ListItemText>{t('mode.label')}</ListItemText>
          <ChevronRightIcon fontSize="small" sx={{ color: 'text.secondary' }} />
        </MenuItem>
        <MenuItem
          onClick={(event) => { event.stopPropagation(); setLangAnchor(event.currentTarget) }}
          aria-haspopup="menu"
          aria-expanded={langAnchor ? 'true' : undefined}
        >
          <ListItemIcon>
            <TranslateIcon fontSize="small" sx={{ color: '#10b981' }} />
          </ListItemIcon>
          <ListItemText>{t('language.label')}</ListItemText>
          <ChevronRightIcon fontSize="small" sx={{ color: 'text.secondary' }} />
        </MenuItem>
        <Divider />
        <Link to='/settings/account' style={{ color: 'inherit', textDecoration: 'none' }}>
          <MenuItem>
            <ListItemIcon>
              <Settings fontSize="small" sx={{ color: '#6366f1' }} />
            </ListItemIcon>
            {t('profileMenu.settings')}
          </MenuItem>
        </Link>
        <MenuItem onClick={handleLogout} sx={{
          '&:hover': {
            color: 'error.main',
            '& .icon-logout': { color: 'error.main' }
          }
        }}>
          <ListItemIcon>
            <Logout className='icon-logout' fontSize="small" sx={{ color: '#ef4444' }} />
          </ListItemIcon>
          {t('profileMenu.logout')}
        </MenuItem>
      </Menu>

      {/* Submenu chế độ sáng/tối/hệ thống */}
      <Menu
        anchorEl={themeAnchor}
        open={Boolean(themeAnchor)}
        onClose={() => setThemeAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        MenuListProps={{ 'aria-label': t('mode.label') }}
      >
        {modeOptions.map(({ value, label, Icon }) => (
          <MenuItem
            key={value}
            selected={mode === value}
            onClick={() => { setMode(value); handleClose() }}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              <Icon fontSize="small" />
            </ListItemIcon>
            <Box sx={{ flexGrow: 1 }}>{label}</Box>
            {mode === value && <CheckIcon fontSize="small" sx={{ color: 'primary.main' }} />}
          </MenuItem>
        ))}
      </Menu>

      {/* Submenu ngôn ngữ English / Tiếng Việt */}
      <Menu
        anchorEl={langAnchor}
        open={Boolean(langAnchor)}
        onClose={() => setLangAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        MenuListProps={{ 'aria-label': t('language.label') }}
      >
        {SUPPORTED_LANGUAGES.map(({ code, label }) => (
          <MenuItem
            key={code}
            selected={currentLang === code}
            onClick={() => { i18n.changeLanguage(code); handleClose() }}
          >
            <Box sx={{ flexGrow: 1 }}>{label}</Box>
            {currentLang === code && <CheckIcon fontSize="small" sx={{ color: 'primary.main' }} />}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  )
}

export default Profile
