import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Grid from '@mui/material/Unstable_Grid2'
import Chip from '@mui/material/Chip'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import Divider from '@mui/material/Divider'
import TrelloIcon from '~/components/Icons/TrelloIcon'
import ModeSelect from '~/components/ModeSelect/ModeSelect'
import LanguageSelect from '~/components/LanguageSelect/LanguageSelect'
import { useTranslation } from 'react-i18next'
import { selectCurrentUser } from '~/redux/user/userSlice'

// Material UI Icons
import DashboardIcon from '@mui/icons-material/Dashboard'
import TaskAltIcon from '@mui/icons-material/TaskAlt'
import WatchLaterOutlinedIcon from '@mui/icons-material/WatchLaterOutlined'
import WallpaperOutlinedIcon from '@mui/icons-material/WallpaperOutlined'
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined'
import FilterListIcon from '@mui/icons-material/FilterList'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import SecurityIcon from '@mui/icons-material/Security'

function Home() {
  const { t } = useTranslation()
  const currentUser = useSelector(selectCurrentUser)

  const scrollToFeatures = () => {
    const section = document.getElementById('features')
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0b1120' : '#ffffff',
      color: (theme) => theme.palette.mode === 'dark' ? '#f1f5f9' : '#0f172a',
      transition: 'background-color 0.3s ease'
    }}>
      {/* 1. Header / Navbar - đồng bộ màu xanh với AppBar các trang trong app */}
      <Box sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0f172a' : '#0052cc',
        borderBottom: '1px solid',
        borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
        transition: 'background-color 0.3s ease'
      }}>
        <Container maxWidth="lg" sx={{ pt: 'calc(12px + env(safe-area-inset-top, 0px))', pb: 1.5, px: { xs: 1.5, sm: 3 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <Link to="/" aria-label="Trello" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <Box sx={{
              width: 34,
              height: 34,
              borderRadius: 1.5,
              bgcolor: 'rgba(255, 255, 255, 0.16)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <TrelloIcon fontSize="small" sx={{ color: 'white' }} />
            </Box>
            {/* Mobile hẹp: ẩn chữ để đủ chỗ cho Mode + Language + Log in + Sign up, chỉ giữ icon */}
            <Typography component="span" variant="h5" sx={{ display: { xs: 'none', sm: 'inline' }, fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>
              Trello
            </Typography>
          </Link>

          {/* Action buttons */}
          <Stack direction="row" spacing={{ xs: 0.8, sm: 1.5 }} alignItems="center">
            <ModeSelect variant="appbar" />

            <LanguageSelect variant="appbar" />

            {currentUser ? (
              <>
                <Chip
                  avatar={<Avatar src={currentUser.avatar} alt={currentUser.displayName || currentUser.username} />}
                  label={currentUser.displayName || currentUser.username}
                  sx={{
                    display: { xs: 'none', sm: 'inline-flex' },
                    fontWeight: 600,
                    color: 'white',
                    bgcolor: 'rgba(255, 255, 255, 0.12)',
                    border: '1px solid rgba(255, 255, 255, 0.25)'
                  }}
                />
                <Button
                  component={Link}
                  to="/boards"
                  variant="contained"
                  endIcon={<ArrowForwardIcon sx={{ fontSize: { xs: '16px', sm: '20px' } }} />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    px: { xs: 1.8, sm: 2.5 },
                    py: { xs: 0.8, sm: 1 },
                    fontSize: { xs: '0.85rem', sm: '0.95rem' },
                    borderRadius: 2,
                    whiteSpace: 'nowrap',
                    bgcolor: 'white',
                    // Dark mode: primary.main là xanh nhạt, không đủ tương phản trên nền nút trắng
                    color: '#0052cc',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.18)',
                    '&:hover': { bgcolor: '#f1f5f9', boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)' }
                  }}
                >
                  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>{t('home.goToBoards')}</Box>
                  <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>{t('home.boardsShort')}</Box>
                </Button>
              </>
            ) : (
              <>
                <Button
                  component={Link}
                  to="/login"
                  variant="text"
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    color: 'white',
                    px: { xs: 1, sm: 1.5 },
                    fontSize: { xs: '0.85rem', sm: '0.95rem' },
                    minWidth: 'auto',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.12)' }
                  }}
                >
                  {t('home.logIn')}
                </Button>
                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    px: { xs: 1.8, sm: 2.5 },
                    py: { xs: 0.8, sm: 1 },
                    fontSize: { xs: '0.85rem', sm: '0.95rem' },
                    borderRadius: 2,
                    whiteSpace: 'nowrap',
                    bgcolor: 'white',
                    // Dark mode: primary.main là xanh nhạt, không đủ tương phản trên nền nút trắng
                    color: '#0052cc',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.18)',
                    '&:hover': { bgcolor: '#f1f5f9', boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)' }
                  }}
                >
                  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>{t('home.getTrelloFree')}</Box>
                  <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>{t('auth.signUp')}</Box>
                </Button>
              </>
            )}
          </Stack>
        </Container>
      </Box>

      {/* 2. Hero Section */}
      <Box sx={{
        position: 'relative',
        overflow: 'hidden',
        pt: { xs: 6, md: 10 },
        pb: { xs: 8, md: 14 },
        background: (theme) => theme.palette.mode === 'dark'
          ? 'radial-gradient(circle at 50% 20%, rgba(37, 99, 235, 0.15) 0%, rgba(11, 17, 32, 0) 70%)'
          : 'radial-gradient(circle at 50% 20%, rgba(0, 82, 204, 0.12) 0%, rgba(12, 102, 228, 0.04) 40%, rgba(255, 255, 255, 0) 70%)'
      }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', maxWidth: 840, mx: 'auto', mb: { xs: 5, md: 8 } }}>
            <Chip
              label={t('home.badge')}
              color="primary"
              variant="outlined"
              sx={{
                mb: 3,
                fontWeight: 600,
                fontSize: { xs: '0.75rem', sm: '0.85rem' },
                borderRadius: 4,
                maxWidth: '100%',
                height: 'auto',
                py: { xs: 0.5, sm: 0.8 },
                borderColor: 'primary.light',
                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(37, 99, 235, 0.1)' : 'rgba(0, 82, 204, 0.08)',
                '& .MuiChip-label': {
                  whiteSpace: 'normal',
                  textAlign: 'center',
                  px: { xs: 1, sm: 1.5 }
                }
              }}
            />

            <Typography
              component="h1"
              variant="h2"
              sx={{
                fontWeight: 900,
                letterSpacing: { xs: '-0.8px', sm: '-1.5px' },
                lineHeight: 1.18,
                fontSize: { xs: '1.9rem', sm: '3rem', md: '4.2rem' },
                mb: { xs: 2, sm: 3 }
              }}
            >
              {t('home.heroTitle')}
            </Typography>

            <Typography
              variant="h6"
              sx={{
                color: (theme) => theme.palette.mode === 'dark' ? '#94a3b8' : '#475569',
                fontWeight: 400,
                lineHeight: 1.6,
                maxWidth: 680,
                mx: 'auto',
                mb: { xs: 3.5, sm: 4 },
                fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.25rem' }
              }}
            >
              {t('home.heroSubtitle')}
            </Typography>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
              alignItems="center"
              sx={{ width: '100%' }}
            >
              <Button
                component={Link}
                to={currentUser ? '/boards' : '/register'}
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  py: { xs: 1.4, sm: 1.6 },
                  px: { xs: 3, sm: 4 },
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  fontWeight: 700,
                  borderRadius: 2.5,
                  textTransform: 'none',
                  width: { xs: '100%', sm: 'auto' },
                  maxWidth: { xs: '320px', sm: 'none' },
                  boxShadow: '0 8px 24px rgba(12, 102, 228, 0.35)'
                }}
              >
                {currentUser ? t('home.goToBoards') : t('home.getTrelloFree')}
              </Button>

              <Button
                variant="outlined"
                size="large"
                onClick={scrollToFeatures}
                sx={{
                  py: { xs: 1.4, sm: 1.6 },
                  px: { xs: 3, sm: 3.5 },
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  fontWeight: 600,
                  borderRadius: 2.5,
                  textTransform: 'none',
                  width: { xs: '100%', sm: 'auto' },
                  maxWidth: { xs: '320px', sm: 'none' }
                }}
              >
                {t('home.exploreFeatures')}
              </Button>
            </Stack>
          </Box>

          {/* 3. Interactive-Style Kanban Mockup Preview */}
          <Box sx={{
            p: { xs: 1.5, sm: 2.5 },
            borderRadius: 3.5,
            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1e293b' : '#0052cc',
            boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.35)',
            border: '1px solid',
            borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)'
          }}>
            {/* Mockup Header */}
            <Box sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              gap: { xs: 1.5, sm: 2 },
              pb: 2,
              px: 1,
              borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
              color: 'white'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexWrap: 'wrap' }}>
                <DashboardIcon />
                <Typography variant="h6" fontWeight={700} sx={{ color: 'white', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  {t('home.mockupTitle')}
                </Typography>
                <Chip size="small" label={t('home.mockupPublic')} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }} />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Chip size="small" icon={<FilterListIcon sx={{ color: 'white !important' }} />} label={t('home.mockupFilter')} sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white' }} />
                <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 26, height: 26, fontSize: 11, borderColor: 'transparent' } }}>
                  <Avatar sx={{ bgcolor: '#e11d48' }}>A</Avatar>
                  <Avatar sx={{ bgcolor: '#0284c7' }}>B</Avatar>
                  <Avatar sx={{ bgcolor: '#10b981' }}>C</Avatar>
                </AvatarGroup>
              </Box>
            </Box>

            {/* Mockup Columns */}
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {/* Column 1: To Do */}
              <Grid xs={12} md={4}>
                <Box sx={{
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0f172a' : '#ebecf0',
                  borderRadius: 2,
                  p: 1.5,
                  minHeight: 280
                }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, px: 0.5 }}>
                    {t('home.colTodo')}
                  </Typography>

                  {/* Card 1 */}
                  <Card sx={{ mb: 1.5, borderRadius: 1.5, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <CardContent sx={{ p: 1.5, '&:last-child': { p: 1.5 } }}>
                      <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
                        <Box sx={{ width: 40, height: 6, bgcolor: '#8b5cf6', borderRadius: 1 }} />
                        <Box sx={{ width: 40, height: 6, bgcolor: '#06b6d4', borderRadius: 1 }} />
                      </Box>
                      <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                        {t('home.mockCard1')}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'text.secondary', fontSize: 12 }}>
                        <Chip size="small" icon={<WatchLaterOutlinedIcon sx={{ fontSize: '14px !important' }} />} label="Oct 28" sx={{ height: 22, fontSize: 11 }} />
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                            <TaskAltIcon sx={{ fontSize: 14 }} /> 2/5
                          </Box>
                          <Avatar sx={{ width: 22, height: 22, fontSize: 10, bgcolor: '#0284c7' }}>B</Avatar>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>

                  {/* Card 2 */}
                  <Card sx={{ borderRadius: 1.5, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <CardContent sx={{ p: 1.5, '&:last-child': { p: 1.5 } }}>
                      <Typography variant="body2" fontWeight={600}>
                        {t('home.mockCard2')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Grid>

              {/* Column 2: In Progress */}
              <Grid xs={12} md={4}>
                <Box sx={{
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0f172a' : '#ebecf0',
                  borderRadius: 2,
                  p: 1.5,
                  minHeight: 280
                }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, px: 0.5 }}>
                    {t('home.colInProgress')}
                  </Typography>

                  {/* Card with cover & checklist */}
                  <Card sx={{ mb: 1.5, borderRadius: 1.5, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <Box sx={{ height: 38, bgcolor: '#22c55e' }} />
                    <CardContent sx={{ p: 1.5, '&:last-child': { p: 1.5 } }}>
                      <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
                        <Box sx={{ width: 40, height: 6, bgcolor: '#22c55e', borderRadius: 1 }} />
                      </Box>
                      <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5 }}>
                        {t('home.mockCard3')}
                      </Typography>

                      {/* Checklist progress bar */}
                      <Box sx={{ mb: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: '#16a34a', mb: 0.5 }}>
                          <span>{t('card.checklist')}</span>
                          <span>100%</span>
                        </Box>
                        <Box sx={{ height: 6, bgcolor: '#e2e8f0', borderRadius: 1, overflow: 'hidden' }}>
                          <Box sx={{ width: '100%', height: '100%', bgcolor: '#22c55e' }} />
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'text.secondary', fontSize: 12 }}>
                        <Chip size="small" label={t('card.completed')} color="success" sx={{ height: 20, fontSize: 10, fontWeight: 700 }} />
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}><AttachFileIcon sx={{ fontSize: 14 }} /> 2</Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}><ChatBubbleOutlineIcon sx={{ fontSize: 14 }} /> 4</Box>
                          <Avatar sx={{ width: 22, height: 22, fontSize: 10, bgcolor: '#e11d48' }}>A</Avatar>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              </Grid>

              {/* Column 3: Done */}
              <Grid xs={12} md={4}>
                <Box sx={{
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0f172a' : '#ebecf0',
                  borderRadius: 2,
                  p: 1.5,
                  minHeight: 280
                }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, px: 0.5 }}>
                    {t('home.colDone')}
                  </Typography>

                  <Card sx={{ mb: 1.5, borderRadius: 1.5, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <CardContent sx={{ p: 1.5, '&:last-child': { p: 1.5 } }}>
                      <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
                        <Box sx={{ width: 40, height: 6, bgcolor: '#3b82f6', borderRadius: 1 }} />
                      </Box>
                      <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                        {t('home.mockCard4')}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Chip size="small" icon={<CheckCircleIcon sx={{ fontSize: '14px !important', color: '#16a34a' }} />} label={t('home.verified')} sx={{ height: 22, fontSize: 11 }} />
                        <Avatar sx={{ width: 22, height: 22, fontSize: 10, bgcolor: '#10b981' }}>C</Avatar>
                      </Box>
                    </CardContent>
                  </Card>

                  <Card sx={{ borderRadius: 1.5, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <CardContent sx={{ p: 1.5, '&:last-child': { p: 1.5 } }}>
                      <Typography variant="body2" fontWeight={600}>
                        {t('home.mockCard5')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* 4. Feature Cards Section */}
      <Box id="features" sx={{ py: { xs: 8, md: 12 }, bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0b1120' : '#f8fafc' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', maxWidth: 700, mx: 'auto', mb: 8 }}>
            <Typography variant="overline" color="primary" fontWeight={700} letterSpacing={1.5}>
              {t('home.capabilitiesTag')}
            </Typography>
            <Typography component="h2" variant="h3" fontWeight={800} letterSpacing="-1px" sx={{ mt: 1, mb: 2 }}>
              {t('home.capabilitiesTitle')}
            </Typography>
            <Typography variant="body1" color="text.secondary" fontSize="1.1rem">
              {t('home.capabilitiesSubtitle')}
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Feature 1 */}
            <Grid xs={12} sm={6} md={3}>
              <Card sx={{
                height: '100%',
                borderRadius: 3,
                p: 1,
                border: '1px solid',
                borderColor: 'divider',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
              }}>
                <CardContent>
                  <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', mb: 2.5 }}>
                    <DashboardIcon />
                  </Box>
                  <Typography component="h3" variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                    {t('home.feature1Title')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
                    {t('home.feature1Desc')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Feature 2 */}
            <Grid xs={12} sm={6} md={3}>
              <Card sx={{
                height: '100%',
                borderRadius: 3,
                p: 1,
                border: '1px solid',
                borderColor: 'divider',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
              }}>
                <CardContent>
                  <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', mb: 2.5 }}>
                    <TaskAltIcon />
                  </Box>
                  <Typography component="h3" variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                    {t('home.feature2Title')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
                    {t('home.feature2Desc')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Feature 3 */}
            <Grid xs={12} sm={6} md={3}>
              <Card sx={{
                height: '100%',
                borderRadius: 3,
                p: 1,
                border: '1px solid',
                borderColor: 'divider',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
              }}>
                <CardContent>
                  <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', mb: 2.5 }}>
                    <WallpaperOutlinedIcon />
                  </Box>
                  <Typography component="h3" variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                    {t('home.feature3Title')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
                    {t('home.feature3Desc')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Feature 4 */}
            <Grid xs={12} sm={6} md={3}>
              <Card sx={{
                height: '100%',
                borderRadius: 3,
                p: 1,
                border: '1px solid',
                borderColor: 'divider',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
              }}>
                <CardContent>
                  <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', mb: 2.5 }}>
                    <GroupOutlinedIcon />
                  </Box>
                  <Typography component="h3" variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                    {t('home.feature4Title')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
                    {t('home.feature4Desc')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 5. Deep Dive Feature Highlights (2-Column Alternating) */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 14 } }}>
        <Grid container spacing={6} alignItems="center">
          <Grid xs={12} md={6}>
            <Chip label={t('home.deepTag')} color="primary" size="small" sx={{ fontWeight: 700, mb: 2 }} />
            <Typography component="h2" variant="h3" fontWeight={800} letterSpacing="-1px" sx={{ mb: 2.5 }}>
              {t('home.deepTitle')}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontSize: '1.1rem', lineHeight: 1.7 }}>
              {t('home.deepDesc')}
            </Typography>

            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CheckCircleIcon color="success" />
                <Typography fontWeight={600}>{t('home.deepPoint1')}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CheckCircleIcon color="success" />
                <Typography fontWeight={600}>{t('home.deepPoint2')}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CheckCircleIcon color="success" />
                <Typography fontWeight={600}>{t('home.deepPoint3')}</Typography>
              </Box>
            </Stack>
          </Grid>

          <Grid xs={12} md={6}>
            <Box sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1e293b' : '#f1f5f9',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 12px 30px rgba(0,0,0,0.06)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <ArchiveOutlinedIcon color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  {t('home.archiveTitle')}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                {t('home.archiveDescPrefix')}<strong>{t('home.archivedItemsDrawer')}</strong>{t('home.archiveDescSuffix')}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <SecurityIcon color="primary" />
                <Typography variant="body2" color="text.secondary">
                  {t('home.securityNote')}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* 6. Call To Action Banner */}
      <Box sx={{
        bgcolor: 'primary.main',
        color: 'white',
        py: { xs: 8, md: 10 },
        textAlign: 'center'
      }}>
        <Container maxWidth="md">
          <Typography component="h2" variant="h3" fontWeight={800} letterSpacing="-1px" sx={{ mb: 2, fontSize: { xs: '2rem', md: '2.8rem' } }}>
            {t('home.ctaTitle')}
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, mb: 4, maxWidth: 600, mx: 'auto' }}>
            {t('home.ctaSubtitle')}
          </Typography>
          <Button
            component={Link}
            to={currentUser ? '/boards' : '/register'}
            variant="contained"
            size="large"
            endIcon={<ArrowForwardIcon />}
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              py: 1.8,
              px: 4.5,
              fontSize: '1.15rem',
              fontWeight: 800,
              borderRadius: 2.5,
              textTransform: 'none',
              '&:hover': {
                bgcolor: '#f8fafc',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
              }
            }}
          >
            {currentUser ? t('home.goToBoards') : t('home.getStartedFree')}
          </Button>
        </Container>
      </Box>

      {/* 7. Footer */}
      <Box sx={{
        py: 5,
        bgcolor: (theme) => theme.palette.mode === 'dark' ? '#070d18' : '#0f172a',
        color: '#94a3b8',
        borderTop: '1px solid',
        borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.1)'
      }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrelloIcon fontSize="small" sx={{ color: 'primary.light' }} />
              <Typography variant="subtitle1" fontWeight={700} color="white">
                Trello
              </Typography>
              <Typography variant="body2" sx={{ ml: 1 }}>
                {t('auth.footerCopyright')}
              </Typography>
            </Box>

            <Stack direction="row" spacing={3}>
              <Link to="/boards" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px' }}>
                {t('home.boardsShort')}
              </Link>
              <Link to="/login" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px' }}>
                {t('home.logIn')}
              </Link>
              <Link to="/register" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px' }}>
                {t('auth.signUp')}
              </Link>
            </Stack>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}

export default Home

