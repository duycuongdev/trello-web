import { useMemo } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'

/**
 * Thanh chỉ báo độ mạnh mật khẩu (4 mức: Weak / Fair / Good / Strong).
 * Hiện ngay dưới ô nhập mật khẩu, chỉ render khi đã có nội dung nhập.
 */
function PasswordStrengthMeter({ password = '' }) {
  const { t } = useTranslation()

  const { score, labelKey, color } = useMemo(() => {
    if (!password) return { score: 0, labelKey: null, color: 'divider' }

    let s = 0
    if (password.length >= 8) s++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) s++
    if (/\d/.test(password)) s++
    if (/[^A-Za-z0-9]/.test(password)) s++

    // Mật khẩu quá ngắn (<8) luôn coi là yếu dù đủ tiêu chí khác
    if (password.length < 8) s = Math.min(s, 1)
    // Luôn có ít nhất 1 mức (Weak) khi đã có nội dung nhập
    s = Math.max(1, s)

    const levels = {
      1: { labelKey: 'validation.pwdWeak', color: '#ef4444' },
      2: { labelKey: 'validation.pwdFair', color: '#f59e0b' },
      3: { labelKey: 'validation.pwdGood', color: '#22c55e' },
      4: { labelKey: 'validation.pwdStrong', color: '#16a34a' }
    }
    return { score: s, ...levels[s] }
  }, [password])

  if (!password) return null

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.75 }}>
      <Box sx={{ display: 'flex', gap: 0.5, flex: 1 }}>
        {[1, 2, 3, 4].map((segment) => (
          <Box
            key={segment}
            sx={{
              height: 4,
              flex: 1,
              borderRadius: '2px',
              bgcolor: segment <= score ? color : (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'),
              transition: 'background-color 0.25s ease'
            }}
          />
        ))}
      </Box>
      {labelKey && (
        <Typography variant="caption" sx={{ color, fontWeight: 700, minWidth: 46, textAlign: 'right' }}>
          {t(labelKey)}
        </Typography>
      )}
    </Box>
  )
}

export default PasswordStrengthMeter
