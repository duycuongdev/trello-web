import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import compassSvg from '~/assets/404/compass.svg'
import routesSvg from '~/assets/404/routes.svg'
import { useTranslation } from 'react-i18next'

// Pure CSS lightweight ambient particles with Nord color palette
const PARTICLES = [
  { size: 14, left: '10%', duration: 12, delay: 0, color: '#81a1c1' },
  { size: 22, left: '20%', duration: 16, delay: 2, color: '#88c0d0' },
  { size: 10, left: '30%', duration: 10, delay: 4, color: '#bf616a' },
  { size: 18, left: '42%', duration: 14, delay: 1, color: '#b48ead' },
  { size: 26, left: '55%', duration: 18, delay: 3, color: '#a3be8c' },
  { size: 12, left: '68%', duration: 11, delay: 5, color: '#ebcb8b' },
  { size: 20, left: '78%', duration: 15, delay: 2.5, color: '#81a1c1' },
  { size: 16, left: '88%', duration: 13, delay: 0.5, color: '#88c0d0' },
  { size: 24, left: '95%', duration: 17, delay: 4.5, color: '#b48ead' }
]

export default function NotFound() {
  const { t } = useTranslation()
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        bgcolor: '#ffffff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        px: 3,
        '@keyframes floatUp': {
          '0%': {
            transform: 'translateY(105vh) scale(0.5)',
            opacity: 0
          },
          '20%': {
            opacity: 0.6
          },
          '80%': {
            opacity: 0.5
          },
          '100%': {
            transform: 'translateY(-10vh) scale(1)',
            opacity: 0
          }
        }
      }}
    >
      {/* Lightweight CSS ambient floating particles */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          overflow: 'hidden'
        }}
        aria-hidden="true"
      >
        {PARTICLES.map((p, idx) => (
          <Box
            key={idx}
            sx={{
              position: 'absolute',
              bottom: 0,
              left: p.left,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              bgcolor: p.color,
              animation: `floatUp ${p.duration}s infinite linear`,
              animationDelay: `${p.delay}s`
            }}
          />
        ))}
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 10
        }}
      >
        <Stack
          direction={{
            xs: 'column',
            md: 'row'
          }}
          spacing={{
            xs: 4,
            md: 10
          }}
          alignItems="center"
        >
          {/* Left */}
          <Stack
            spacing={3}
            alignItems={{
              xs: 'center',
              md: 'flex-start'
            }}
          >
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
            >
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 700,
                  color: '#2e3440',
                  fontSize: {
                    xs: '4rem',
                    md: '8rem'
                  }
                }}
              >
                404
              </Typography>

              <Box
                component="img"
                src={compassSvg}
                alt="Compass"
                sx={{
                  width: {
                    xs: 50,
                    md: 70
                  },
                  height: {
                    xs: 50,
                    md: 70
                  }
                }}
              />
            </Stack>

            <Typography
              sx={{
                fontSize: {
                  xs: '1rem',
                  md: '1.2rem'
                },
                color: '#4c566a',
                textAlign: {
                  xs: 'center',
                  md: 'left'
                }
              }}
            >
              {t('notFound.message')}
            </Typography>

            <Button
              variant="contained"
              href="/"
              sx={{
                bgcolor: '#88c0d0',
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: '#6fb3c5'
                }
              }}
            >
              {t('notFound.returnHome')}
            </Button>
          </Stack>

          {/* Right */}
          <Box
            component="img"
            src={routesSvg}
            alt="Routes"
            sx={{
              width: {
                xs: 250,
                md: 400
              },
              maxWidth: '100%',
              height: 'auto'
            }}
          />
        </Stack>
      </Box>
    </Box>
  )
}
