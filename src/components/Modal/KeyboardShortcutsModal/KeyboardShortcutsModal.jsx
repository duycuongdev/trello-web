import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import KeyboardOutlinedIcon from '@mui/icons-material/KeyboardOutlined'
import Divider from '@mui/material/Divider'
import { useTranslation } from 'react-i18next'

const getShortcuts = (t) => [
  {
    category: t('shortcuts.catGlobal'),
    items: [
      { key: '/', description: t('shortcuts.searchFocus') },
      { key: '?', description: t('shortcuts.openGuide') },
      { key: 'Esc', description: t('shortcuts.escape') }
    ]
  },
  {
    category: t('shortcuts.catBoard'),
    items: [
      { key: 'F', description: t('shortcuts.myCardsFilter') }
    ]
  }
]

function Kbd({ children }) {
  return (
    <Box
      component="kbd"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 26,
        height: 24,
        px: 0.8,
        fontSize: '12px',
        fontWeight: 700,
        fontFamily: 'monospace',
        color: 'text.primary',
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'grey.100'),
        border: '1px solid',
        borderColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'grey.300'),
        borderRadius: '5px',
        boxShadow: (theme) => (theme.palette.mode === 'dark' ? '0 2px 0 rgba(0,0,0,0.5)' : '0 2px 0 rgba(0,0,0,0.1)'),
        lineHeight: 1
      }}
    >
      {children}
    </Box>
  )
}

function KeyboardShortcutsModal({ open, onClose }) {
  const { t } = useTranslation()
  const SHORTCUTS = getShortcuts(t)
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="keyboard-shortcuts-title"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '92%', sm: 460 },
          maxWidth: 'calc(100vw - 32px)',
          bgcolor: 'background.paper',
          borderRadius: 3,
          boxShadow: 24,
          p: 3,
          outline: 'none',
          border: (theme) => `1px solid ${theme.palette.divider}`
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <KeyboardOutlinedIcon sx={{ color: '#0052cc', fontSize: 28 }} />
            <Typography id="keyboard-shortcuts-title" variant="h6" fontWeight={700}>
              {t('shortcuts.title')}
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose} aria-label="close">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          {t('shortcuts.subtitle')}
        </Typography>

        {SHORTCUTS.map((section, idx) => (
          <Box key={section.category} sx={{ mb: idx < SHORTCUTS.length - 1 ? 2.5 : 1 }}>
            <Typography
              variant="caption"
              fontWeight={700}
              sx={{ color: 'text.secondary', letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', mb: 1 }}
            >
              {section.category}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              {section.items.map((item) => (
                <Box
                  key={item.key}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 0.5,
                    px: 1,
                    borderRadius: 1,
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {item.description}
                  </Typography>
                  <Kbd>{item.key}</Kbd>
                </Box>
              ))}
            </Box>
            {idx < SHORTCUTS.length - 1 && <Divider sx={{ mt: 2 }} />}
          </Box>
        ))}

        <Box
          sx={{
            mt: 3,
            p: 1.5,
            borderRadius: 1.5,
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(0, 82, 204, 0.15)' : 'rgba(0, 82, 204, 0.08)'),
            border: '1px dashed rgba(0, 82, 204, 0.3)'
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontStyle: 'italic' }}>
            💡 <strong>{t('shortcuts.proTipLabel')}</strong> {t('shortcuts.proTip')}
          </Typography>
        </Box>
      </Box>
    </Modal>
  )
}

export default KeyboardShortcutsModal
