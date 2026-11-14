import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import ReplayIcon from '@mui/icons-material/Replay'
import HomeIcon from '@mui/icons-material/Home'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // eslint-disable-next-line no-console
    console.error('Uncaught error in React Error Boundary:', error, errorInfo)
    this.setState({ errorInfo })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/boards'
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md">
          <Box
            sx={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              py: 4
            }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                bgcolor: 'error.lighter',
                color: 'error.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3
              }}
            >
              <ErrorOutlineIcon sx={{ fontSize: 48, color: '#e74c3c' }} />
            </Box>

            <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
              Oops! Đã xảy ra lỗi không mong muốn
            </Typography>

            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, maxWidth: 540 }}>
              Giao diện gặp sự cố khi xử lý dữ liệu. Bạn có thể thử tải lại trang hoặc quay về danh sách bảng làm việc.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
              <Button
                variant="contained"
                startIcon={<ReplayIcon />}
                onClick={this.handleReload}
                sx={{ textTransform: 'none', px: 3, py: 1, bgcolor: '#0052cc', '&:hover': { bgcolor: '#0747a6' } }}
              >
                Tải lại trang
              </Button>
              <Button
                variant="outlined"
                startIcon={<HomeIcon />}
                onClick={this.handleGoHome}
                sx={{ textTransform: 'none', px: 3, py: 1 }}
              >
                Về danh sách Bảng
              </Button>
            </Box>

            {process.env.BUILD_MODE === 'dev' && this.state.error && (
              <Box
                sx={{
                  width: '100%',
                  textAlign: 'left',
                  p: 2,
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1e293b' : '#f1f5f9',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: (theme) => theme.palette.mode === 'dark' ? '#334155' : '#e2e8f0',
                  overflow: 'auto',
                  maxHeight: 220
                }}
              >
                <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#e74c3c', fontWeight: 600 }}>
                  {this.state.error.toString()}
                </Typography>
                <Typography variant="caption" component="pre" sx={{ fontFamily: 'monospace', mt: 1, whiteSpace: 'pre-wrap', color: 'text.secondary', fontSize: '11px' }}>
                  {this.state.errorInfo?.componentStack}
                </Typography>
              </Box>
            )}
          </Box>
        </Container>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
