import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Box from '@mui/material/Box'
import CheckIcon from '@mui/icons-material/Check'
import TranslateIcon from '@mui/icons-material/Translate'
import { SUPPORTED_LANGUAGES } from '~/i18n'

/**
 * Nút chọn ngôn ngữ dạng icon + menu (English / Tiếng Việt).
 * Thay thế cho Select có floating label trước đây (label dễ bị cắt trên navbar mobile).
 * Lựa chọn được lưu vào localStorage ('trello-lang') bởi i18next-browser-languagedetector.
 *
 * variant:
 * - 'appbar' (mặc định): icon TRẮNG, dùng trên nền xanh/dậm (AppBar, trang Auth)
 * - 'page': icon theo theme, dùng trên nền sáng/tối của trang thường (Home)
 */
function LanguageSelect({ variant = 'appbar' }) {
  const { t, i18n } = useTranslation()
  const [anchorEl, setAnchorEl] = useState(null)
  const currentLang = i18n.language?.startsWith('vi') ? 'vi' : 'en'

  const onColoredBg = variant === 'appbar'

  const handleChange = (code) => {
    i18n.changeLanguage(code)
    setAnchorEl(null)
  }

  return (
    <>
      <Tooltip title={t('language.label')}>
        <IconButton
          size="small"
          onClick={(event) => setAnchorEl(event.currentTarget)}
          aria-label={t('language.label')}
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
          <TranslateIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 160 } } }}
      >
        {SUPPORTED_LANGUAGES.map(({ code, label }) => (
          <MenuItem
            key={code}
            selected={currentLang === code}
            onClick={() => handleChange(code)}
          >
            <Box sx={{ flexGrow: 1 }}>{label}</Box>
            {currentLang === code && <CheckIcon fontSize="small" sx={{ color: 'primary.main' }} />}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}

export default LanguageSelect
