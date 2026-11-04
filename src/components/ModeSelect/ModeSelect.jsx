import { useColorScheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import Box from '@mui/material/Box'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness'

/**
 * variant:
 * - 'appbar' (mặc định): chữ + viền TRẮNG, dùng trên nền xanh/dậm (AppBar, trang Auth)
 * - 'page': theo theme (text.primary + viền divider), dùng trên nền sáng/tối của trang thường (Home)
 */
function ModeSelect({ variant = 'appbar' }) {
  const { mode, setMode } = useColorScheme()
  const { t } = useTranslation()
  const handleChange = (event) => {
    const selectedMode = event.target.value
    setMode(selectedMode)
  }

  const onColoredBg = variant === 'appbar'

  return (
    <FormControl size="small" sx={{ minWidth: '120px' }}>
      <InputLabel
        id="label-select-dark-light-mode"
        sx={{
          color: onColoredBg ? 'white' : 'text.primary',
          '&.Mui-focused': { color: onColoredBg ? 'white' : 'text.primary' }
        }}
      >
        {t('mode.label')}
      </InputLabel>
      <Select
        labelId="label-select-dark-light-mode"
        id="select-dark-light-mode"
        value={mode}
        label={t('mode.label')}
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
        <MenuItem value="light">
          <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LightModeIcon fontSize='small' /> {t('mode.light')}
          </Box>
        </MenuItem>
        <MenuItem value="dark">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DarkModeOutlinedIcon fontSize='small' /> {t('mode.dark')}
          </Box>
        </MenuItem>
        <MenuItem value="system">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SettingsBrightnessIcon fontSize='small' /> {t('mode.system')}
          </Box>
        </MenuItem>
      </Select>
    </FormControl>
  )
}

export default ModeSelect
