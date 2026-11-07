import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Popover from '@mui/material/Popover'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Tooltip from '@mui/material/Tooltip'
import Divider from '@mui/material/Divider'
import CloseIcon from '@mui/icons-material/Close'
import CheckIcon from '@mui/icons-material/Check'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import WallpaperIcon from '@mui/icons-material/Wallpaper'
import GradientIcon from '@mui/icons-material/Gradient'
import PaletteIcon from '@mui/icons-material/Palette'
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'
import VisuallyHiddenInput from '~/components/Form/VisuallyHiddenInput'
import { singleFileValidator } from '~/utils/validators'
import { toast } from 'react-toastify'
import { PRESET_PHOTOS } from '~/utils/samplePhotos'
import { useTranslation } from 'react-i18next'


const PRESET_GRADIENTS = [
  { id: 'ocean-blue', name: 'Ocean Blue', value: 'linear-gradient(135deg, #0079bf 0%, #5067c5 100%)' },
  { id: 'sunset-glow', name: 'Sunset Glow', value: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)' },
  { id: 'emerald-forest', name: 'Emerald Forest', value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  { id: 'neon-night', name: 'Neon Night', value: 'linear-gradient(135deg, #8a2387 0%, #e94057 50%, #f27121 100%)' },
  { id: 'deep-space', name: 'Deep Space', value: 'linear-gradient(135deg, #141e30 0%, #243b55 100%)' },
  { id: 'royal-purple', name: 'Royal Purple', value: 'linear-gradient(135deg, #654ea3 0%, #eaafc8 100%)' },
  { id: 'cherry-blossom', name: 'Cherry Blossom', value: 'linear-gradient(135deg, #f857a6 0%, #ff5858 100%)' },
  { id: 'midnight-navy', name: 'Midnight Navy', value: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' }
]

const PRESET_COLORS = [
  { id: 'trello-blue', name: 'Classic Blue', value: '#0079bf' },
  { id: 'fresh-green', name: 'Fresh Green', value: '#519839' },
  { id: 'amber-orange', name: 'Amber Orange', value: '#d29034' },
  { id: 'crimson-red', name: 'Crimson Red', value: '#b04632' },
  { id: 'amethyst-purple', name: 'Purple', value: '#89609e' },
  { id: 'bright-cyan', name: 'Bright Cyan', value: '#00aecc' },
  { id: 'deep-charcoal', name: 'Charcoal', value: '#34495e' },
  { id: 'elegant-navy', name: 'Navy', value: '#172b4d' }
]

function ChangeBoardBackgroundPopover({
  anchorEl,
  isOpen,
  onClose,
  currentBackground,
  onSelectBackground,
  onUploadBackgroundFile,
  title
}) {
  const { t } = useTranslation()
  const [tabIndex, setTabIndex] = useState(0)
  const [customUrl, setCustomUrl] = useState('')

  const handleApplyBackground = (value) => {
    onSelectBackground(value)
  }

  const handleApplyCustomUrl = () => {
    const trimmed = customUrl.trim()
    if (!trimmed) {
      toast.error(t('card.imageUrlRequired'))
      return
    }
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      toast.error(t('card.imageUrlInvalid'))
      return
    }
    onSelectBackground(trimmed)
    setCustomUrl('')
  }

  const handleFileChange = (event) => {
    const file = event.target?.files?.[0]
    if (!file) return

    const error = singleFileValidator(file)
    if (error) {
      toast.error(error)
      return
    }

    if (onUploadBackgroundFile) {
      onUploadBackgroundFile(file)
    }

    event.target.value = ''
  }

  const handleResetDefault = () => {
    onSelectBackground(null)
  }

  return (
    <Popover
      open={isOpen}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      slotProps={{
        paper: {
          sx: {
            width: 400,
            maxWidth: 'calc(100vw - 32px)',
            p: 2,
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
          }
        }
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle1" fontWeight={700}>
          {title || t('background.changeTitle')}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Tabs */}
      <Tabs
        value={tabIndex}
        onChange={(_, val) => setTabIndex(val)}
        variant="fullWidth"
        sx={{
          minHeight: 40,
          mb: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          '& .MuiTab-root': {
            minHeight: 40,
            minWidth: 0,
            p: '6px 4px',
            fontSize: '13px',
            textTransform: 'none',
            fontWeight: 600,
            gap: 0.5
          }
        }}
      >
        <Tab icon={<WallpaperIcon sx={{ fontSize: 17 }} />} iconPosition="start" label={t('background.photos')} />
        <Tab icon={<GradientIcon sx={{ fontSize: 17 }} />} iconPosition="start" label={t('background.gradients')} />
        <Tab icon={<PaletteIcon sx={{ fontSize: 17 }} />} iconPosition="start" label={t('background.colors')} />
        <Tab icon={<CloudUploadOutlinedIcon sx={{ fontSize: 17 }} />} iconPosition="start" label={t('background.upload')} />
      </Tabs>

      {/* Tab 0: Photos */}
      {tabIndex === 0 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
          {PRESET_PHOTOS.map((photo) => {
            const isSelected = currentBackground === photo.value
            return (
              <Box
                key={photo.id}
                onClick={() => handleApplyBackground(photo.value)}
                sx={{
                  position: 'relative',
                  height: 70,
                  borderRadius: 1.5,
                  cursor: 'pointer',
                  overflow: 'hidden',
                  backgroundImage: `url("${photo.thumb}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: isSelected ? '2.5px solid #0079bf' : '1px solid rgba(0,0,0,0.1)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
                  }
                }}
              >
                {isSelected && (
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      bgcolor: 'rgba(0,0,0,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <CheckIcon sx={{ color: '#fff', fontSize: 24 }} />
                  </Box>
                )}
                <Typography
                  variant="caption"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    bgcolor: 'rgba(0,0,0,0.5)',
                    color: '#fff',
                    px: 0.5,
                    fontSize: '10px',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {photo.name}
                </Typography>
              </Box>
            )
          })}
        </Box>
      )}

      {/* Tab 1: Gradients */}
      {tabIndex === 1 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
          {PRESET_GRADIENTS.map((grad) => {
            const isSelected = currentBackground === grad.value
            return (
              <Tooltip key={grad.id} title={grad.name}>
                <Box
                  onClick={() => handleApplyBackground(grad.value)}
                  sx={{
                    height: 52,
                    borderRadius: 1.5,
                    cursor: 'pointer',
                    background: grad.value,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: isSelected ? '2.5px solid #fff' : 'none',
                    boxShadow: isSelected ? '0 0 0 2px #0079bf' : 'none',
                    transition: 'transform 0.15s ease',
                    '&:hover': { transform: 'scale(1.05)' }
                  }}
                >
                  {isSelected && <CheckIcon sx={{ color: '#fff', fontSize: 20 }} />}
                </Box>
              </Tooltip>
            )
          })}
        </Box>
      )}

      {/* Tab 2: Solid Colors */}
      {tabIndex === 2 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
          {PRESET_COLORS.map((col) => {
            const isSelected = currentBackground === col.value
            return (
              <Tooltip key={col.id} title={col.name}>
                <Box
                  onClick={() => handleApplyBackground(col.value)}
                  sx={{
                    height: 52,
                    borderRadius: 1.5,
                    cursor: 'pointer',
                    bgcolor: col.value,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: isSelected ? '2.5px solid #fff' : 'none',
                    boxShadow: isSelected ? '0 0 0 2px #0079bf' : 'none',
                    transition: 'transform 0.15s ease',
                    '&:hover': { transform: 'scale(1.05)' }
                  }}
                >
                  {isSelected && <CheckIcon sx={{ color: '#fff', fontSize: 20 }} />}
                </Box>
              </Tooltip>
            )
          })}
        </Box>
      )}

      {/* Tab 3: Upload from Device & Custom URL */}
      {tabIndex === 3 && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            UPLOAD FROM COMPUTER:
          </Typography>

          <Button
            component="label"
            fullWidth
            variant="outlined"
            size="small"
            startIcon={<CloudUploadOutlinedIcon />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              py: 1,
              borderStyle: 'dashed',
              borderWidth: '1.5px',
              borderRadius: 2
            }}
          >
            {t('background.chooseImage')}
            <VisuallyHiddenInput type="file" accept="image/*" onChange={handleFileChange} />
          </Button>
          <Typography variant="caption" sx={{ fontSize: '11px', color: 'text.secondary', display: 'block', mt: 0.5, mb: 1.5, textAlign: 'center' }}>
            Supported formats: JPG, PNG, WEBP (Max 10MB)
          </Typography>

          <Divider sx={{ my: 1.5 }}>
            <Typography variant="caption" color="text.secondary">OR PASTE URL</Typography>
          </Divider>

          <TextField
            fullWidth
            size="small"
            placeholder="https://example.com/image.jpg"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleApplyCustomUrl()
              }
            }}
            sx={{ mb: 1.5 }}
          />
          <Button
            fullWidth
            variant="contained"
            size="small"
            onClick={handleApplyCustomUrl}
            disabled={!customUrl.trim()}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {t('background.applyUrl')}
          </Button>
        </Box>
      )}

      {/* Footer: Reset Button */}
      <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'center' }}>
        <Button
          size="small"
          variant="text"
          color="inherit"
          startIcon={<RestartAltIcon fontSize="small" />}
          onClick={handleResetDefault}
          disabled={!currentBackground}
          sx={{ textTransform: 'none', fontSize: '13px' }}
        >
          {t('background.resetDefault')}
        </Button>
      </Box>
    </Popover>
  )
}

export default ChangeBoardBackgroundPopover
