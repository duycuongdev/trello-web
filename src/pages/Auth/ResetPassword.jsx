import { useState } from 'react'
import { Link, useNavigate, Navigate, useSearchParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import MuiCard from '@mui/material/Card'
import TrelloIcon from '~/components/Icons/TrelloIcon'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Zoom from '@mui/material/Zoom'
import Alert from '@mui/material/Alert'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { useForm } from 'react-hook-form'
import {
  PASSWORD_RULE,
  PASSWORD_RULE_MESSAGE,
  FIELD_REQUIRED_MESSAGE
} from '~/utils/validators'
import FieldErrorAlert from '~/components/Form/FieldErrorAlert'
import { resetPasswordAPI } from '~/apis'
import { toast } from 'react-toastify'

/**
 * Trang đặt lại mật khẩu: truy cập từ link trong email
 * (/reset-password?email=...&token=...). Sau khi đặt lại thành công,
 * mọi phiên đăng nhập khác đều bị đăng xuất (server thu hồi refresh token).
 */
function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { email, token } = Object.fromEntries([...searchParams])

  const [showPassword, setShowPassword] = useState(false)
  const { handleSubmit, register, watch, formState: { errors, isSubmitting } } = useForm()

  if (!email || !token) {
    return <Navigate to='/404' replace />
  }

  const submitResetPassword = async (data) => {
    await resetPasswordAPI({ email, token, newPassword: data.newPassword })
    toast.success('Password has been reset successfully. Please log in with your new password.')
    navigate(`/login?resetSuccess=${encodeURIComponent(email)}`, { replace: true })
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
              Choose a new password
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              You&apos;re resetting the password for <strong>{email}</strong>
            </Typography>
          </Box>

          <form onSubmit={handleSubmit(submitResetPassword)} noValidate>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <TextField
                  autoFocus
                  fullWidth
                  label="New password"
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  error={!!errors.newPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  {...register('newPassword', {
                    required: FIELD_REQUIRED_MESSAGE,
                    pattern: { value: PASSWORD_RULE, message: PASSWORD_RULE_MESSAGE }
                  })}
                />
                <FieldErrorAlert errors={errors} fieldName="newPassword" />
              </Box>

              <Box>
                <TextField
                  fullWidth
                  label="Confirm new password"
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  error={!!errors.confirmPassword}
                  {...register('confirmPassword', {
                    required: FIELD_REQUIRED_MESSAGE,
                    validate: (value) => value === watch('newPassword') || 'Passwords do not match.'
                  })}
                />
                <FieldErrorAlert errors={errors} fieldName="confirmPassword" />
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
                Reset password
              </Button>
            </Box>
          </form>

          <Alert severity="info" sx={{ borderRadius: 2, mt: 2.5 }}>
            After resetting, all other logged-in sessions will be signed out automatically.
          </Alert>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              <Link to="/login" style={{ textDecoration: 'none', fontWeight: 700, color: '#0c66e4' }}>
                Back to log in
              </Link>
            </Typography>
          </Box>
        </MuiCard>
      </Zoom>
    </Box>
  )
}

export default ResetPassword
