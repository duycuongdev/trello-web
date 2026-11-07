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
    <Box sx={{
      width: '100%',
      height: (theme) => theme.trello.appBarHeight,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: { xs: 1, sm: 2 },
      overflowX: 'auto',
      paddingX: { xs: 1, sm: 2 },
      bgcolor: activeBoard?.background
        ? 'rgba(0, 0, 0, 0.45)'
        : (theme) => (theme.palette.mode === 'dark' ? '#0f172a' : '#0052cc'),
      backdropFilter: activeBoard?.background ? 'blur(6px)' : 'none',
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

        {/* notifications */}
        <Notifications />

        <Profile
          onOpenTour={() => setOpenTour(true)}
          onOpenShortcuts={() => setOpenShortcuts(true)}
        />
      </Box>

      {/* Modal giới thiệu toàn bộ tính năng website cho người dùng */}
      <UserOnboardingModal open={openTour} onClose={handleCloseTour} />

      {/* Modal hướng dẫn phím tắt bàn phím */}
      <KeyboardShortcutsModal open={openShortcuts} onClose={() => setOpenShortcuts(false)} />
    </Box>
  )
}

export default AppBar
