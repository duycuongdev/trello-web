import { useLocation, Navigate, Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'
import TrelloIcon from '~/components/Icons/TrelloIcon'
import ModeSelect from '~/components/ModeSelect/ModeSelect'
import LanguageSelect from '~/components/LanguageSelect/LanguageSelect'
import { useTranslation } from 'react-i18next'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import WatchLaterOutlinedIcon from '@mui/icons-material/WatchLaterOutlined'
import AttachFileIcon from '@mui/icons-material/AttachFile'

function Auth() {
  const { t } = useTranslation()
  const location = useLocation()
  const isLogin = location.pathname === '/login'
  const isRegister = location.pathname === '/register'

  const currentUser = useSelector(selectCurrentUser)
  if (currentUser) {
    return <Navigate to="/" replace={true} />
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      background: (theme) => theme.palette.mode === 'dark'
        ? 'linear-gradient(135deg, #030712 0%, #0b1329 45%, #172554 100%)'
        : 'linear-gradient(135deg, #0747a6 0%, #0052cc 50%, #0c66e4 100%)',
      color: 'white',
      transition: 'background 0.3s ease'
    }}>
      {/* Background ambient lighting glows */}
      <Box sx={{
        position: 'absolute',
        top: '-10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '900px',
        height: '600px',
        borderRadius: '50%',
        background: (theme) => theme.palette.mode === 'dark'
          ? 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Decorative floating card left (visible on large screens) */}
      <Box sx={{
        display: { xs: 'none', lg: 'block' },
        position: 'absolute',
        left: '5%',
        top: '46%',
        transform: 'translateY(-50%) rotate(-7deg)',
        zIndex: 1,
        pointerEvents: 'none',
        transition: 'all 0.3s ease'
      }}>
        <Card sx={{
          width: 220,
          borderRadius: 3,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid',
          borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.6)'
        }}>
          <Box sx={{ height: 6, bgcolor: '#10b981' }} />
          <CardContent sx={{ p: 2, '&:last-child': { p: 2 } }}>
            <Box sx={{ width: 42, height: 6, bgcolor: '#10b981', borderRadius: 1, mb: 1.2 }} />
            <Typography variant="body2" fontWeight={700} sx={{ mb: 1.5, color: 'text.primary' }}>
              Q4 Product Roadmap
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'text.secondary', fontSize: 12 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#10b981', fontWeight: 600 }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 16 }} /> 5/5 Done
              </Box>
              <Avatar sx={{ width: 24, height: 24, fontSize: 11, bgcolor: '#0284c7' }}>A</Avatar>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Decorative floating card right (visible on large screens) */}
      <Box sx={{
        display: { xs: 'none', lg: 'block' },
        position: 'absolute',
        right: '5%',
        top: '44%',
        transform: 'translateY(-50%) rotate(7deg)',
        zIndex: 1,
        pointerEvents: 'none',
        transition: 'all 0.3s ease'
      }}>
        <Card sx={{
          width: 220,
          borderRadius: 3,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid',
          borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.6)'
        }}>
          <Box sx={{ height: 6, bgcolor: '#8b5cf6' }} />
          <CardContent sx={{ p: 2, '&:last-child': { p: 2 } }}>
            <Box sx={{ width: 42, height: 6, bgcolor: '#8b5cf6', borderRadius: 1, mb: 1.2 }} />
            <Typography variant="body2" fontWeight={700} sx={{ mb: 1.5, color: 'text.primary' }}>
              Design System & Themes
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'text.secondary', fontSize: 12 }}>
              <Chip
                size="small"
                icon={<WatchLaterOutlinedIcon sx={{ fontSize: '13px !important' }} />}
                label="Oct 30"
                sx={{ height: 22, fontSize: 11, fontWeight: 600 }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AttachFileIcon sx={{ fontSize: 14 }} /> 2
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* 1. Top Navigation */}
      <Box sx={{
        position: 'relative',
        zIndex: 2,
        py: 2.5,
        px: { xs: 2.5, sm: 4 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Box sx={{
            width: 36,
            height: 36,
            borderRadius: 1.5,
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <TrelloIcon fontSize="small" sx={{ color: 'white' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>
            Trello
          </Typography>
        </Link>

        <ModeSelect />
        <LanguageSelect />
      </Box>

      {/* 2. Main Form Container */}
      <Container
        maxWidth="sm"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          position: 'relative',
          zIndex: 2
        }}
      >
        {isLogin && <LoginForm />}
        {isRegister && <RegisterForm />}
      </Container>

      {/* 3. Footer */}
      <Box sx={{
        position: 'relative',
        zIndex: 2,
        py: 2.5,
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.85)',
        fontSize: '13px'
      }}>
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 0.5 }}>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none', fontWeight: 500 }}>{t('auth.footerHome')}</Link>
          <span>•</span>
          <Link to="/boards" style={{ color: 'inherit', textDecoration: 'none', fontWeight: 500 }}>{t('auth.footerBoards')}</Link>
          <span>•</span>
          <span>{t('auth.footerPrivacy')}</span>
          <span>•</span>
          <span>{t('auth.footerTerms')}</span>
        </Stack>
        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.75)' }}>
          © 2026 Trello || All rights reserved.
        </Typography>
      </Box>
    </Box>
  )
}

export default Auth
