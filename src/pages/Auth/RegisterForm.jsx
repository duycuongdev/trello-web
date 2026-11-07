import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import MuiCard from '@mui/material/Card'
import TrelloIcon from '~/components/Icons/TrelloIcon'
import CardActions from '@mui/material/CardActions'
import TextField from '@mui/material/TextField'
import Zoom from '@mui/material/Zoom'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import {
  EMAIL_RULE,
  PASSWORD_RULE
} from '~/utils/validators'
import FieldErrorAlert from '~/components/Form/FieldErrorAlert'
import { useForm } from 'react-hook-form'
import { registerUserAPI } from '~/apis'
import { toast } from 'react-toastify'
import { useDispatch } from 'react-redux'
import { loginGoogleUserAPI } from '~/redux/user/userSlice'
import { GoogleLogin } from '@react-oauth/google'
import { useTranslation } from 'react-i18next'

function RegisterForm() {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [registeredEmail, setRegisteredEmail] = useState(null)
  const { handleSubmit, register, formState: { errors }, watch, reset } = useForm()

  const handleGoogleLoginSuccess = (credentialResponse) => {
    if (!credentialResponse?.credential) return
    toast.promise(dispatch(loginGoogleUserAPI({ token: credentialResponse.credential })), {
      pending: t('auth.signingUpWithGoogle')
    }).then((res) => {
      if (!res.error) { navigate('/') }
    })
  }

  const handleGoogleLoginError = () => {
    toast.error(t('auth.googleSignUpFailed'))
  }

  // Lắng nghe tín hiệu kích hoạt từ tab xác thực email (BroadcastChannel & localStorage event)
  // Khi người dùng bấm xác nhận email ở bất kỳ tab nào, tab đăng ký cũ này sẽ tự động chuyển sang trang Login!
  useEffect(() => {
    if (!registeredEmail) return

    const handleVerified = (verifiedEmail) => {
      if (!verifiedEmail || verifiedEmail.toLowerCase() === registeredEmail.toLowerCase()) {
        navigate(`/login?verifiedEmail=${encodeURIComponent(registeredEmail)}`, { replace: true })
      }
    }

    let authChannel = null
    try {
      authChannel = new BroadcastChannel('trello-auth-channel')
      authChannel.onmessage = (event) => {
        if (event.data?.type === 'ACCOUNT_VERIFIED') {
          handleVerified(event.data.email)
        }
      }
    } catch (_err) {
      // BroadcastChannel may not be supported
    }

    const handleStorage = (event) => {
      if (event.key === 'trello_account_verified' && event.newValue) {
        try {
          const data = JSON.parse(event.newValue)
          handleVerified(data?.email)
        } catch (_err) {
          // Ignore invalid JSON in storage event
        }
      }
    }

    window.addEventListener('storage', handleStorage)

    return () => {
      if (authChannel) authChannel.close()
      window.removeEventListener('storage', handleStorage)
    }
  }, [registeredEmail, navigate])

  const submitRegister = (data) => {
    const { email, password } = data
    toast.promise(registerUserAPI({ email, password }), {
      pending: t('auth.registering'),
      success: t('auth.registerSuccess'),
      error: (err) => err?.response?.data?.message || t('auth.registerFailed')
    }).then((user) => {
      // Giữ nguyên ở trang đăng ký và lưu email để hiển thị thông báo hướng dẫn vào hộp thư xác thực
      setRegisteredEmail(user?.email || email)
    }).catch(() => {})
  }

  // Khi đăng ký thành công, giữ ở trang đăng ký và hiển thị màn hình xác nhận email trực quan
  if (registeredEmail) {
    const isGmail = registeredEmail.toLowerCase().endsWith('@gmail.com')

    return (
      <Box sx={{ width: '100%', maxWidth: 440 }}>
        <Zoom in={true} style={{ transitionDelay: '150ms' }}>
          <MuiCard sx={{
            width: '100%',
            borderRadius: 3.5,
            boxShadow: (theme) => theme.palette.mode === 'dark'
              ? '0 12px 40px rgba(0, 0, 0, 0.45)'
              : '0 12px 36px rgba(0, 0, 0, 0.08)',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1e293b' : '#ffffff',
            p: 3,
            textAlign: 'center'
          }}>
            {/* Animated mail icon container */}
            <Box sx={{
              width: 68,
              height: 68,
              borderRadius: '50%',
              bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(12, 102, 228, 0.2)' : '#e9f2ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'primary.main',
              mx: 'auto',
              mb: 2,
              boxShadow: '0 4px 16px rgba(12, 102, 228, 0.25)'
            }}>
              <MarkEmailReadOutlinedIcon sx={{ fontSize: 38 }} />
            </Box>

            <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.5px', mb: 1 }}>
              {t('auth.checkYourEmail')}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
              {t('auth.activationSent')}
            </Typography>

            <Box sx={{
              p: 1.5,
              mb: 2.5,
              bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f4f5f7',
              borderRadius: 2,
              border: '1px dashed',
              borderColor: 'primary.main'
            }}>
              <Typography variant="body1" fontWeight={700} color="primary.main" sx={{ wordBreak: 'break-all' }}>
                {registeredEmail}
              </Typography>
            </Box>

            <Alert severity="info" sx={{ mb: 3, borderRadius: 2, textAlign: 'left', fontSize: '0.825rem' }}>
              {t('auth.activationHint')}
            </Alert>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {isGmail && (
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  endIcon={<OpenInNewIcon fontSize="small" />}
                  onClick={() => window.open('https://mail.google.com', '_blank')}
                  sx={{
                    py: 1.3,
                    borderRadius: 2,
                    fontWeight: 700,
                    textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(12, 102, 228, 0.35)'
                  }}
                >
                  {t('auth.openGmail')}
                </Button>
              )}

              <Button
                component={Link}
                to={`/login?registeredEmail=${encodeURIComponent(registeredEmail)}`}
                variant={isGmail ? 'outlined' : 'contained'}
                color="primary"
                size="large"
                fullWidth
                sx={{
                  py: 1.3,
                  borderRadius: 2,
                  fontWeight: 700,
                  textTransform: 'none',
                  ...(!isGmail && { boxShadow: '0 4px 14px rgba(12, 102, 228, 0.35)' })
                }}
              >
                {t('auth.goToLogin')}
              </Button>

              <Button
                variant="text"
                size="small"
                onClick={() => {
                  setRegisteredEmail(null)
                  reset()
                }}
                sx={{ textTransform: 'none', color: 'text.secondary', mt: 0.5 }}
              >
                {t('auth.useDifferentEmail')}
              </Button>
            </Box>
          </MuiCard>
        </Zoom>
      </Box>
    )
  }

  return (
    <form onSubmit={handleSubmit(submitRegister)} style={{ width: '100%', maxWidth: 420 }}>
      <Zoom in={true} style={{ transitionDelay: '150ms' }}>
        <MuiCard sx={{
          width: '100%',
          borderRadius: 3.5,
          boxShadow: (theme) => theme.palette.mode === 'dark'
            ? '0 12px 40px rgba(0, 0, 0, 0.45)'
            : '0 12px 36px rgba(0, 0, 0, 0.08)',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1e293b' : '#ffffff',
          p: 1.5
        }}>
          {/* Header */}
          <Box sx={{
            mt: 1.5,
            mb: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1
          }}>
            <Box sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 4px 12px rgba(12, 102, 228, 0.3)'
            }}>
              <TrelloIcon fontSize="medium" sx={{ color: 'white' }} />
            </Box>
            <Typography component="h1" variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.5px' }}>
              {t('auth.registerHeader')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('auth.registerHeaderSub')}
            </Typography>
          </Box>

          {/* Inputs */}
          <Box sx={{ px: 1.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                  pattern: {
                    value: EMAIL_RULE,
                    message: t('validation.emailInvalid')
                  }
                })}
              />
              <FieldErrorAlert errors={errors} fieldName="email" />
            </Box>

            <Box>
              <TextField
                fullWidth
                label={t('auth.password')}
                type="password"
                variant="outlined"
                error={!!errors.password}
                {...register('password', {
                  required: t('validation.required'),
                  pattern: {
                    value: PASSWORD_RULE,
                    message: t('validation.passwordRule')
                  }
                })}
              />
              <FieldErrorAlert errors={errors} fieldName="password" />
            </Box>

            <Box>
              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                variant="outlined"
                error={!!errors.password_confirmation}
                {...register('password_confirmation', {
                  validate: (value) => {
                    if (value === watch('password')) return true
                    return t('validation.passwordConfirmation')
                  }
                })}
              />
              <FieldErrorAlert errors={errors} fieldName="password_confirmation" />
            </Box>
          </Box>

          {/* Submit Action */}
          <CardActions sx={{ px: 1.5, pt: 2.5, pb: 1 }}>
            <Button
              className="interceptor-loading"
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              sx={{
                py: 1.3,
                borderRadius: 2,
                fontWeight: 700,
                fontSize: '1rem',
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(12, 102, 228, 0.35)'
              }}
            >
              Sign up
            </Button>
          </CardActions>

          {/* Divider */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, my: 1.5, px: 1.5 }}>
            <Divider sx={{ flex: 1 }} />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Or continue with
            </Typography>
            <Divider sx={{ flex: 1 }} />
          </Box>

          {/* Google Sign Up */}
          <Box sx={{ px: 1.5, mb: 1, display: 'flex', justifyContent: 'center', width: '100%' }}>
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginError}
              theme="outline"
              size="large"
              width="360"
              text="signup_with"
              shape="rectangular"
            />
          </Box>

          {/* Bottom link */}
          <Box sx={{ p: 1.5, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              already have an account?{' '}
              <Link to="/login" style={{ textDecoration: 'none', fontWeight: 700, color: '#0c66e4' }}>
                Log in
              </Link>
            </Typography>
          </Box>
        </MuiCard>
      </Zoom>
    </form>
  )
}

export default RegisterForm
