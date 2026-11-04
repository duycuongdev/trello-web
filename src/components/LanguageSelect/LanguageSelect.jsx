import { useTranslation } from 'react-i18next'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import Box from '@mui/material/Box'
import { SUPPORTED_LANGUAGES } from '~/i18n'

/**
 * Bộ chọn ngôn ngữ (English / Tiếng Việt) - hiển thị cạnh ModeSelect trong AppBar.
 * Lựa chọn được lưu vào localStorage ('trello-lang') bởi i18next-browser-languagedetector.
 */
function LanguageSelect() {
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language?.startsWith('vi') ? 'vi' : 'en'

  const handleChange = (event) => {
    i18n.changeLanguage(event.target.value)
  }

  return (
    <FormControl size="small" sx={{ minWidth: '120px' }}>
      <InputLabel
        id="label-select-language"
        sx={{
          color: 'white',
          '&.Mui-focused': { color: 'white' }
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
          color: 'white',
          'MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
          '.MuiSvgIcon-root': { color: 'white' },
          '& fieldset': { borderColor: 'white' }
        }}
      >
        {SUPPORTED_LANGUAGES.map(({ code, label, flag }) => (
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
