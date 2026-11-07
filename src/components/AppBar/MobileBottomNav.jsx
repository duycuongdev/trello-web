import { Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard'
import { selectCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'
import Notifications from './Notifications/Notifications'
import Profile from './Menus/Profile'

/**
 * Thanh điều hướng dưới cùng cho MOBILE (ẩn từ sm trở lên) - chuẩn UX mobile app:
 * các tab chính nằm trong vùng ngón tay thay vì trên đầu.
 * Gồm: Boards | Notifications | Account (tái sử dụng nguyên Notifications & Profile).
 * Chừa safe-area-inset-bottom để không bị home indicator của iPhone che.
 */
function MobileBottomNav({ onOpenTour, onOpenShortcuts }) {
  const { t } = useTranslation()
  const location = useLocation()
  const activeBoard = useSelector(selectCurrentActiveBoard)
  const onBoardWithImage = Boolean(activeBoard?.background)

  const isBoardsActive = location.pathname.startsWith('/boards')

  return (
    <Box sx={{
      display: { xs: 'flex', sm: 'none' },
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1100,
      alignItems: 'center',
      justifyContent: 'space-around',
      // PWA standalone (iPhone): chừa chỗ cho home indicator
      height: 'calc(60px + env(safe-area-inset-bottom, 0px))',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      bgcolor: onBoardWithImage
        ? 'rgba(0, 0, 0, 0.55)'
        : (theme) => (theme.palette.mode === 'dark' ? '#0f172a' : '#0052cc'),
      backdropFilter: onBoardWithImage ? 'blur(16px)' : 'none',
      borderTop: '1px solid rgba(255, 255, 255, 0.15)'
    }}>
      <TabLink
        to="/boards/"
        icon={<SpaceDashboardIcon />}
        label={t('appBar.boardList')}
        active={isBoardsActive || location.pathname === '/'}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', minWidth: 64 }}>
        <Notifications openUpward />
        <Typography sx={{ fontSize: '0.65rem', fontWeight: 500, lineHeight: 1, color: 'rgba(255, 255, 255, 0.85)' }}>
          {t('appBar.notifications')}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', minWidth: 64 }}>
        <Profile onOpenTour={onOpenTour} onOpenShortcuts={onOpenShortcuts} openUpward />
        <Typography sx={{ fontSize: '0.65rem', fontWeight: 500, lineHeight: 1, color: 'rgba(255, 255, 255, 0.85)' }}>
          {t('profileMenu.profile')}
        </Typography>
      </Box>
    </Box>
  )
}

function TabLink({ to, icon, label, active }) {
  return (
    <Box
      component={Link}
      to={to}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2px',
        minWidth: 64,
        py: 1,
        borderRadius: 2,
        color: active ? '#ffffff' : 'rgba(255, 255, 255, 0.65)',
        bgcolor: active ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
        textDecoration: 'none',
        transition: 'all 0.15s ease'
      }}
    >
      {icon}
      <Typography sx={{ fontSize: '0.65rem', fontWeight: active ? 700 : 500, lineHeight: 1 }}>
        {label}
      </Typography>
    </Box>
  )
}

export default MobileBottomNav
