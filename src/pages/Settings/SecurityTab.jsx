import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import PasswordIcon from '@mui/icons-material/Password'
import LockResetIcon from '@mui/icons-material/LockReset'
import LockIcon from '@mui/icons-material/Lock'
import LogoutIcon from '@mui/icons-material/Logout'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'

import { FIELD_REQUIRED_MESSAGE, PASSWORD_RULE, PASSWORD_RULE_MESSAGE } from '~/utils/validators'
import FieldErrorAlert from '~/components/Form/FieldErrorAlert'
import PasswordStrengthMeter from '~/components/Form/PasswordStrengthMeter'
import { useForm } from 'react-hook-form'
import { useConfirm } from 'material-ui-confirm'
import { toast } from 'react-toastify'
import { useDispatch } from 'react-redux'
import { updateUserAPI, logoutUserAPI } from '~/redux/user/userSlice'
import { useTranslation } from 'react-i18next'

function SecurityTab() {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const [showPassword, setShowPassword] = useState(false)

  // Ôn lại: https://www.npmjs.com/package/material-ui-confirm
  const confirmChangePassword = useConfirm()
  const submitChangePassword = (data) => {
    confirmChangePassword({
      // Title, Description, Content...vv của gói material-ui-confirm đều có type là ReactNode nên có thể thoải sử dụng MUI components, rất tiện lợi khi cần custom styles
      title: <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LogoutIcon sx={{ color: 'warning.dark' }} /> {t('settings.changePassword')}
      </Box>,
      description: 'You have to login again after successfully changing your password. Continue?',
      confirmationText: 'Confirm',
      cancellationText: 'Cancel'
    }).then(() => {
      const { current_password, new_password } = data

      // Gọi API...
      toast.promise(dispatch(updateUserAPI({ current_password, new_password })), {
        pending: 'Updating...'
      }).then((res) => {
        // Nếu update thành công thì điều hướng về trang dashboard
        if (!res.error) {
          toast.success(t('card.passwordChanged'))
          dispatch(logoutUserAPI(false))
        }
      })
    }).catch(() => { })
  }

  return (
    <Box sx={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Box sx={{
        maxWidth: '1200px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3
      }}>
        <Box>
          <Typography variant="h5">{t('settings.securityDashboard')}</Typography>
        </Box>
        <form onSubmit={handleSubmit(submitChangePassword)}>
          <Box sx={{ width: { xs: '100%', sm: '400px' }, maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <TextField
                fullWidth
                label={t('settings.currentPassword')}
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                // autoComplete chuẩn giúp trình duyệt không tự điền nhầm (dấu ••• trông như giá trị có sẵn)
                inputProps={{ autoComplete: 'current-password' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PasswordIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                {...register('current_password', {
                  required: FIELD_REQUIRED_MESSAGE,
                  pattern: {
                    value: PASSWORD_RULE,
                    message: PASSWORD_RULE_MESSAGE
                  }
                })}
                error={!!errors['current_password']}
              />
              <FieldErrorAlert errors={errors} fieldName={'current_password'} />
            </Box>

            <Box>
              <TextField
                fullWidth
                label={t('settings.newPassword')}
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                inputProps={{ autoComplete: 'new-password' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon fontSize="small" />
                    </InputAdornment>
                  )
                }}
                {...register('new_password', {
                  required: FIELD_REQUIRED_MESSAGE,
                  pattern: {
                    value: PASSWORD_RULE,
                    message: PASSWORD_RULE_MESSAGE
                  }
                })}
                error={!!errors['new_password']}
              />
              <FieldErrorAlert errors={errors} fieldName={'new_password'} />
              <PasswordStrengthMeter password={watch('new_password') || ''} />
            </Box>

            <Box>
              <TextField
                fullWidth
                label={t('settings.newPasswordConfirmation')}
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                inputProps={{ autoComplete: 'new-password' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockResetIcon fontSize="small" />
                    </InputAdornment>
                  )
                }}
                {...register('new_password_confirmation', {
                  validate: (value) => {
                    if (value === watch('new_password')) return true
                    return t('validation.passwordsDoNotMatch')
                  }
                })}
                error={!!errors['new_password_confirmation']}
              />
              <FieldErrorAlert errors={errors} fieldName={'new_password_confirmation'} />
            </Box>

            <Box>
              <Button
                className="interceptor-loading"
                type="submit"
                variant="contained"
                color="primary"
                fullWidth>
                Change
              </Button>
            </Box>
          </Box>
        </form>
      </Box>
    </Box>
  )
}

export default SecurityTab
