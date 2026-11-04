import { useState } from 'react'
import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import MuiCard from '@mui/material/Card'
import TrelloIcon from '~/components/Icons/TrelloIcon'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Zoom from '@mui/material/Zoom'
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
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Zoom in={true} style={{ transitionDelay: '150ms' }}>
        <MuiCard sx={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 3.5,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1e293b' : '#ffffff',
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
            <Typography variant="body2" color="text.secondary">
              {t('forgotPassword.remembered')}{' '}
              <Link to="/login" style={{ textDecoration: 'none', fontWeight: 700, color: '#0c66e4' }}>
                {t('forgotPassword.backToLogin')}
              </Link>
            </Typography>
          </Box>
        </MuiCard>
      </Zoom>
    </Box>
  )
}

export default ForgotPassword
