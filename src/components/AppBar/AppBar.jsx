import { useState, useEffect } from 'react'
import ModeSelect from '~/components/ModeSelect/ModeSelect'
import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import AppsIcon from '@mui/icons-material/Apps'
import TrelloIcon from '~/components/Icons/TrelloIcon'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import Profile from './Menus/Profile'
import { Link } from 'react-router-dom'
import Notifications from './Notifications/Notifications'
import MobileBottomNav from './MobileBottomNav'
import AutoCompleteSearchBoard from './SearchBoards/AutoCompleteSearchBoard'
import { useSelector } from 'react-redux'
import { selectCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'
import { selectCurrentUser } from '~/redux/user/userSlice'
import UserOnboardingModal from '~/components/Modal/UserOnboardingModal/UserOnboardingModal'
import KeyboardShortcutsModal from '~/components/Modal/KeyboardShortcutsModal/KeyboardShortcutsModal'

function AppBar() {
  const { t } = useTranslation()
  const activeBoard = useSelector(selectCurrentActiveBoard)
  const currentUser = useSelector(selectCurrentUser)
  const [openTour, setOpenTour] = useState(false)
  const [openShortcuts, setOpenShortcuts] = useState(false)

  // Tự động bật Tour giới thiệu tính năng khi người dùng đăng nhập lần đầu
  useEffect(() => {
    if (currentUser?._id) {
      const tourCompleted = localStorage.getItem(`trello_tour_completed_${currentUser._id}`)
      if (!tourCompleted) {
        setOpenTour(true)
      }
    }
  }, [currentUser?._id])

  // Lắng nghe phím tắt '?' (Shift + /) để mở hướng dẫn phím tắt
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        event.key === '?' &&
        !['INPUT', 'TEXTAREA'].includes(event.target?.tagName) &&
        !event.target?.isContentEditable
      ) {
        event.preventDefault()
        setOpenShortcuts(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleCloseTour = () => {
    setOpenTour(false)
    if (currentUser?._id) {
      localStorage.setItem(`trello_tour_completed_${currentUser._id}`, 'true')
    }
  }

  return (
    <>
      <Box sx={{
        width: '100%',
        // PWA standalone (iPhone): chừa chỗ cho thanh trạng thái/notch
        height: (theme) => `calc(${theme.trello.appBarHeight} + env(safe-area-inset-top, 0px))`,
        paddingTop: 'env(safe-area-inset-top, 0px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: { xs: 1, sm: 2 },
        overflowX: 'auto',
        paddingX: { xs: 1, sm: 2 },
        bgcolor: activeBoard?.background
          ? 'rgba(0, 0, 0, 0.6)'
          : (theme) => (theme.palette.mode === 'dark' ? '#0f172a' : '#0052cc'),
        // Kính mờ đậm đủ để chữ trắng luôn đọc được kể cả khi ảnh nền có vùng gần trắng (bầu trời)
        backdropFilter: activeBoard?.background ? 'blur(16px)' : 'none',
        borderBottom: activeBoard?.background
          ? '1px solid rgba(255, 255, 255, 0.15)'
          : (theme) => (theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)'),
        transition: 'background 0.3s ease, border-color 0.3s ease',
        // thanh scroll thẳng với list card
        '&::-webkit-scrollbar-track': { m: 2 }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
          <Link to='/boards'>
            <Tooltip title={t('appBar.boardList')}>
              <IconButton
                sx={{ color: 'white' }}
                aria-label={t('appBar.boardList')}
              >
                <AppsIcon />
              </IconButton>
            </Tooltip>
          </Link>
          <Link to='/boards' style={{ textDecoration: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TrelloIcon fontSize='small' sx={{ color: 'white' }} />
              <Typography variant='span' sx={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white' }}>Trello</Typography>
            </Box>
          </Link>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
          {/* search board */}
          <AutoCompleteSearchBoard />

          {/* dark mode and light mode */}
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <ModeSelect />
          </Box>

          {/* notifications + account: chỉ trên desktop/tablet - trên mobile chúng nằm ở BottomNav */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
            <Notifications />

            <Profile
              onOpenTour={() => setOpenTour(true)}
              onOpenShortcuts={() => setOpenShortcuts(true)}
            />
          </Box>
        </Box>
      </Box>

      {/* Thanh điều hướng dưới cùng cho mobile (Boards / Notifications / Account).
          PHẢI nằm NGOÀI Box header ở trên: backdrop-filter của header tạo containing block
          cho position:fixed và khiến bottom nav bị neo nhầm lên đỉnh AppBar. */}
      <MobileBottomNav
        onOpenTour={() => setOpenTour(true)}
        onOpenShortcuts={() => setOpenShortcuts(true)}
      />

      {/* Modal giới thiệu toàn bộ tính năng website cho người dùng */}
      <UserOnboardingModal open={openTour} onClose={handleCloseTour} />

      {/* Modal hướng dẫn phím tắt bàn phím */}
      <KeyboardShortcutsModal open={openShortcuts} onClose={() => setOpenShortcuts(false)} />
    </>
  )
}

export default AppBar
