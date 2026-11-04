import { useTranslation } from 'react-i18next'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import Box from '@mui/material/Box'
import { SUPPORTED_LANGUAGES } from '~/i18n'

/**
 * Bộ chọn ngôn ngữ (English / Tiếng Việt).
 * Lựa chọn được lưu vào localStorage ('trello-lang') bởi i18next-browser-languagedetector.
 *
 * variant:
 * - 'appbar' (mặc định): chữ + viền TRẮNG, dùng trên nền xanh/dậm (AppBar, trang Auth)
 * - 'page': theo theme, dùng trên nền sáng/tối của trang thường (Home)
 */
function LanguageSelect({ variant = 'appbar' }) {
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language?.startsWith('vi') ? 'vi' : 'en'

  const handleChange = (event) => {
    i18n.changeLanguage(event.target.value)
  }

  const onColoredBg = variant === 'appbar'

  return (
    <FormControl size="small" sx={{ minWidth: '120px' }}>
      <InputLabel
        id="label-select-language"
        sx={{
          color: onColoredBg ? 'white' : 'text.primary',
          '&.Mui-focused': { color: onColoredBg ? 'white' : 'text.primary' }
        }}
      >
        {t('language.label')}
      </InputLabel>
      <Select
        labelId="label-select-language"
        id="select-language"
        value={currentLang}
        label={t('language.label')}
        onChange={handleChange}
        sx={{
          color: onColoredBg ? 'white' : 'text.primary',
          '.MuiOutlinedInput-notchedOutline': { borderColor: onColoredBg ? 'white' : 'rgba(0, 0, 0, 0.23)' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: onColoredBg ? 'white' : 'text.primary' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: onColoredBg ? 'white' : 'primary.main' },
          '.MuiSvgIcon-root': { color: onColoredBg ? 'white' : 'text.primary' },
          '& fieldset': { borderColor: onColoredBg ? 'white' : 'rgba(0, 0, 0, 0.23)' }
        }}
      >
        {SUPPORTED_LANGUAGES.map(({ code, label }) => (
          <MenuItem key={code} value={code}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {label}
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default LanguageSelect
