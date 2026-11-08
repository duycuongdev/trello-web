import { experimental_extendTheme as extendTheme } from '@mui/material/styles'

const APP_BAR_HEIGHT = '58px'
const BOARD_BAR_HEIGHT = '60px'
const MOBILE_BOTTOM_NAV_HEIGHT = '60px'
const COLUMN_HEADER_HEIGHT = '50px'
const COLUMN_FOOTER_HEIGHT = '56px'

// Chiều cao vùng board điều khiển bằng CSS variable để riêng mobile (xs) trừ thêm
// bottom nav 60px và dùng dvh (viewport động khi thanh địa chỉ trình duyệt mobile co giãn).
// xs: AppBar ẩn ở board detail nên chỉ trừ BoardBar + BottomNav + safe-area.
const BOARD_CONTENT_HEIGHT = 'var(--trello-board-content-height)'

// Create a theme instance.
const theme = extendTheme({
  // kích thước giao diện
  trello: {
    appBarHeight: APP_BAR_HEIGHT,
    boardBarHeight: BOARD_BAR_HEIGHT,
    boardContentHeight: BOARD_CONTENT_HEIGHT,
    columnHeaderHeight: COLUMN_HEADER_HEIGHT,
    columnHeaderheight: COLUMN_HEADER_HEIGHT,
    columnFooterHeight: COLUMN_FOOTER_HEIGHT
  },
  // màu giao diện
  colorSchemes: {
    light: {},
    dark: {}
  },
  // other properties
  components: {
    // scrollbar đồng bộ palette: mảnh, bo tròn, đổi màu theo light/dark
    MuiCssBaseline: {
      styleOverrides: {
        ':root': {
          '--trello-board-content-height': `calc(100vh - ${APP_BAR_HEIGHT} - ${BOARD_BAR_HEIGHT})`,
          '--trello-scrollbar-thumb': '#c3c9d4',
          '--trello-scrollbar-thumb-hover': '#a9b1bf',
          '--trello-scrollbar-track': 'transparent'
        },
        '@supports (height: 100dvh)': {
          ':root': {
            '--trello-board-content-height': `calc(100dvh - ${APP_BAR_HEIGHT} - ${BOARD_BAR_HEIGHT})`
          }
        },
        '@media (max-width: 599.95px)': {
          ':root': {
            '--trello-board-content-height': `calc(100vh - ${BOARD_BAR_HEIGHT} - ${MOBILE_BOTTOM_NAV_HEIGHT} - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))`
          },
          '@supports (height: 100dvh)': {
            ':root': {
              '--trello-board-content-height': `calc(100dvh - ${BOARD_BAR_HEIGHT} - ${MOBILE_BOTTOM_NAV_HEIGHT} - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))`
            }
          }
        },
        '[data-mui-color-scheme="dark"], [data-color-scheme="dark"]': {
          '--trello-scrollbar-thumb': 'rgba(255, 255, 255, 0.22)',
          '--trello-scrollbar-thumb-hover': 'rgba(255, 255, 255, 0.4)'
        },
        '*': {
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--trello-scrollbar-thumb) var(--trello-scrollbar-track)'
        },
        '*::-webkit-scrollbar': {
          width: '8px',
          height: '8px'
        },
        '*::-webkit-scrollbar-track': {
          background: 'var(--trello-scrollbar-track)'
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: 'var(--trello-scrollbar-thumb)',
          borderRadius: '8px'
        },
        '*::-webkit-scrollbar-thumb:hover': {
          backgroundColor: 'var(--trello-scrollbar-thumb-hover)'
        },
        '*::-webkit-scrollbar-corner': {
          background: 'transparent'
        }
      }
    },
    // chuyển về chữ bình thường (viết hoa chữ cái đầu)
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          // border
          borderWidth: '0.5px',
          '&:hover': { borderWidth: '1.5px' }
        }
      }
    },
    // fontSize input
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem'
        }
      }
    },
    // fontSize của Typography
    MuiTypography: {
      styleOverrides: {
        root: {
          '&.MuiTypography-body1': { fontSize: '0.875rem' }
        }
      }
    },
    // sửa trong input
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          '& fieldset': { borderWidth: '0.5px !important' },
          '&:hover fieldset': { borderWidth: '1.5px !important' },
          '&.Mui-focused fieldset': { borderWidth: '1px !important' }
        }
      }
    }
  }
})

export default theme
