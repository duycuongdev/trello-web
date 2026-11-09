import { useState } from 'react'
import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import MuiCard from '@mui/material/Card'
import TrelloIcon from '~/components/Icons/TrelloIcon'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import CardEntrance from '~/components/Motion/CardEntrance'
import Alert from '@mui/material/Alert'
import { useForm } from 'react-hook-form'
import { EMAIL_RULE } from '~/utils/validators'
import FieldErrorAlert from '~/components/Form/FieldErrorAlert'
import { forgotPasswordAPI } from '~/apis'
import { useTranslation } from 'react-i18next'

/**
 * Trang "Quên mật khẩu": nhập email để nhận link đặt lại mật khẩu.
 * Vì backend chống email enumeration nên dù email có tồn tại hay không,
 * thông báo hiển thị luôn giống nhau.
 */
function ForgotPassword() {
  const { t } = useTranslation()
  const [submitted, setSubmitted] = useState(false)
  const { handleSubmit, register, formState: { errors, isSubmitting } } = useForm()

  const submitForgotPassword = async (data) => {
    await forgotPasswordAPI(data)
    // Luôn coi như thành công (kể cả email không tồn tại) để không lộ thông tin
    setSubmitted(true)
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      '@supports (height: 100dvh)': { minHeight: '100dvh' },
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      p: 2,
      pt: 'calc(16px + env(safe-area-inset-top, 0px))',
      pb: 'calc(16px + env(safe-area-inset-bottom, 0px))',
      background: (theme) => theme.palette.mode === 'dark'
        ? 'linear-gradient(135deg, #030712 0%, #0b1329 45%, #172554 100%)'
        : 'linear-gradient(135deg, #0747a6 0%, #0052cc 50%, #0c66e4 100%)',
      transition: 'background 0.3s ease'
    }}>
      <Box sx={{
        position: 'absolute',
        top: '-10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '900px',
        height: '600px',
        maxWidth: '160vw',
        borderRadius: '50%',
        background: (theme) => theme.palette.mode === 'dark'
          ? 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />
      <CardEntrance delay={0.1} style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        <MuiCard sx={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 3.5,
          border: '1px solid',
          borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.6)',
          bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1e293b' : '#ffffff',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          p: 3
        }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, mb: 2.5 }}>
            <Box sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(12, 102, 228, 0.3)'
            }}>
              <TrelloIcon fontSize="medium" sx={{ color: 'white' }} />
            </Box>
            <Typography component="h1" variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.5px' }}>
              {t('forgotPassword.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              {t('forgotPassword.subtitle')}
            </Typography>
          </Box>

          {submitted ? (
            <Alert severity="success" sx={{ borderRadius: 2, mb: 2 }}>
              {t('forgotPassword.success')}
            </Alert>
          ) : (
            <form onSubmit={handleSubmit(submitForgotPassword)} noValidate>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <TextField
                    autoFocus
                    fullWidth
                    label={t('auth.email')}
                    type="text"
                    variant="outlined"
                    error={!!errors.email}
                    {...register('email', {
                      required: t('validation.required'),
                      pattern: { value: EMAIL_RULE, message: t('validation.emailInvalid') }
                    })}
                  />
                  <FieldErrorAlert errors={errors} fieldName="email" />
                </Box>
                <Button
                  className="interceptor-loading"
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={isSubmitting}
                  sx={{ py: 1.3, borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
                >
                  {t('forgotPassword.sendLink')}
                </Button>
              </Box>
            </form>
          )}

          <Box sx={{ mt: 2.5, textAlign: 'center' }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                '& a': {
                  textDecoration: 'none',
                  fontWeight: 700,
                  color: (theme) => theme.palette.mode === 'dark' ? '#8ab4ff' : '#0c66e4',
                  '&:hover': { textDecoration: 'underline' }
                }
              }}
            >
              {t('forgotPassword.remembered')}{' '}
              <Link to="/login">
                {t('forgotPassword.backToLogin')}
              </Link>
            </Typography>
          </Box>
        </MuiCard>
      </CardEntrance>
    </Box>
  )
}

export default ForgotPassword
