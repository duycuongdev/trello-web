import { Link, useSearchParams, useNavigate } from 'react-router-dom'
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
import { useForm } from 'react-hook-form'
import {
  EMAIL_RULE,
  EMAIL_RULE_MESSAGE,
  FIELD_REQUIRED_MESSAGE,
  PASSWORD_RULE,
  PASSWORD_RULE_MESSAGE
} from '~/utils/validators'
import FieldErrorAlert from '~/components/Form/FieldErrorAlert'
import { toast } from 'react-toastify'
import { useDispatch } from 'react-redux'
import { loginUserApi, loginGoogleUserAPI } from '~/redux/user/userSlice'
import { GoogleLogin } from '@react-oauth/google'

function LoginForm() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [searchParams] = useSearchParams()
  const registeredEmail = searchParams.get('registeredEmail')
  const verifiedEmail = searchParams.get('verifiedEmail')
  const resetSuccessEmail = searchParams.get('resetSuccess')

  const { handleSubmit, register, formState: { errors } } = useForm({
    defaultValues: {
      email: verifiedEmail || registeredEmail || ''
    }
  })

  const submitLogIn = (data) => {
    const { email, password } = data
    toast.promise(dispatch(loginUserApi({ email, password })), {
      pending: 'Logging in...'
    }).then((res) => {
      if (!res.error) { navigate('/') }
    })
  }

  const handleGoogleLoginSuccess = (credentialResponse) => {
    if (!credentialResponse?.credential) return
    toast.promise(dispatch(loginGoogleUserAPI({ token: credentialResponse.credential })), {
      pending: 'Signing in with Google...'
    }).then((res) => {
      if (!res.error) { navigate('/') }
    })
  }

  const handleGoogleLoginError = () => {
    toast.error('Google Sign In was unsuccessful. Please try again.')
  }

  return (
    <form onSubmit={handleSubmit(submitLogIn)} style={{ width: '100%', maxWidth: 420 }}>
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
              Log in to continue
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Welcome back! Please enter your details.
            </Typography>
          </Box>

          {/* Email verification alerts */}
          <Box sx={{ px: 1.5, mb: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {verifiedEmail &&
              <Alert severity="success" sx={{ borderRadius: 2, '.MuiAlert-message': { overflow: 'hidden' } }}>
                Your email&nbsp;
                <Typography component="span" sx={{ fontWeight: 'bold' }}>{verifiedEmail}</Typography>
                &nbsp;has been verified.<br />Now you can log in to enjoy our services!
              </Alert>
            }
            {registeredEmail &&
              <Alert severity="info" sx={{ borderRadius: 2, '.MuiAlert-message': { overflow: 'hidden' } }}>
                An email has been sent to&nbsp;
                <Typography component="span" sx={{ fontWeight: 'bold' }}>{registeredEmail}</Typography>
                <br />Please check and verify your account before logging in!
              </Alert>
            }
            {resetSuccessEmail &&
              <Alert severity="success" sx={{ borderRadius: 2, '.MuiAlert-message': { overflow: 'hidden' } }}>
                Your password has been reset successfully.<br />
                Please log in with your new password.
              </Alert>
            }
          </Box>

          {/* Inputs */}
          <Box sx={{ px: 1.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <TextField
                autoFocus
                fullWidth
                label="Email"
                type="text"
                variant="outlined"
                error={!!errors.email}
                {...register('email', {
                  required: FIELD_REQUIRED_MESSAGE,
                  pattern: {
                    value: EMAIL_RULE,
                    message: EMAIL_RULE_MESSAGE
                  }
                })}
              />
              <FieldErrorAlert errors={errors} fieldName="email" />
            </Box>

            <Box>
              <TextField
                fullWidth
                label="Password"
                type="password"
                variant="outlined"
                error={!!errors.password}
                {...register('password', {
                  required: FIELD_REQUIRED_MESSAGE,
                  pattern: {
                    value: PASSWORD_RULE,
                    message: PASSWORD_RULE_MESSAGE
                  }
                })}
              />
              <FieldErrorAlert errors={errors} fieldName="password" />
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
              Log in
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

          {/* Google Sign In */}
          <Box sx={{ px: 1.5, mb: 1, display: 'flex', justifyContent: 'center', width: '100%' }}>
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginError}
              theme="outline"
              size="large"
              width="360"
              text="signin_with"
              shape="rectangular"
            />
          </Box>

          {/* Bottom link */}
          <Box sx={{ p: 1.5, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              <Link to="/forgot-password" style={{ textDecoration: 'none', fontWeight: 700, color: '#0c66e4' }}>
                Forgot password?
              </Link>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Don&apos;t have an account yet?{' '}
              <Link to="/register" style={{ textDecoration: 'none', fontWeight: 700, color: '#0c66e4' }}>
                Sign up
              </Link>
            </Typography>
          </Box>
        </MuiCard>
      </Zoom>
    </form>
  )
}

export default LoginForm
