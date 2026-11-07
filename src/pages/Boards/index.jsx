import { useState, useEffect } from 'react'
import AppBar from '~/components/AppBar/AppBar'
import PageLoadingSpinner from '~/components/Loading/PageLoadingSpinner'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard'
import FolderOffOutlinedIcon from '@mui/icons-material/FolderOffOutlined'
import UndoIcon from '@mui/icons-material/Undo'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import AddIcon from '@mui/icons-material/Add'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Pagination from '@mui/material/Pagination'
import PaginationItem from '@mui/material/PaginationItem'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import randomColor from 'randomcolor'
import { CreateBoardModal } from './create'
import { styled } from '@mui/material/styles'
import { fetchBoardsAPI, reopenBoardAPI, deleteBoardDetailsAPI } from '~/apis/index.js'
import { DEFAULT_PAGE, DEFAULT_ITEMS_PER_PAGE } from '~/utils/constants.js'
import { useConfirm } from 'material-ui-confirm'
import { toast } from 'react-toastify'
import { slugify } from '~/utils/formatter'
import { useTranslation } from 'react-i18next'

// Styles của các Sidebar item menu - nền trong suốt, chỉ highlight khi hover/active
const SidebarItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  cursor: 'pointer',
  color: theme.palette.mode === 'dark' ? '#cbd5e1' : '#172b4d',
  padding: '12px 16px',
  borderRadius: '8px',
  fontWeight: 500,
  transition: 'all 0.15s ease',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'
  },
  '&.active': {
    color: '#0052cc',
    fontWeight: 600,
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 82, 204, 0.15)' : '#e9f2ff'
  }
}))

/**
 * Ô "+ Create new board" đặt ngay trong lưới board (chuẩn Trello thật).
 */
function CreateBoardTile({ onClick }) {
  const { t } = useTranslation()
  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        width: '100%',
        height: '140px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        borderRadius: '10px',
        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0, 82, 204, 0.04)',
        border: '2px dashed',
        borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0, 82, 204, 0.35)',
        boxShadow: 'none',
        transition: 'all 0.2s ease',
        '&:hover': {
          bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0, 82, 204, 0.08)',
          borderColor: '#0052cc',
          transform: 'translateY(-3px)'
        }
      }}
    >
      <AddIcon sx={{ fontSize: 34, color: '#0052cc' }} />
      <Typography sx={{ fontWeight: 600, color: '#0052cc', fontSize: '0.95rem' }}>
        {t('boards.createBoard')}
      </Typography>
    </Card>
  )
}

function Boards() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const confirm = useConfirm()
  // Số lượng bản ghi boards hiển thị tối đa trên 1 page tùy dự án (thường sẽ là 12 cái)
  const [boards, setBoards] = useState(null)
  // Tổng toàn bộ số lượng bản ghi boards có trong Database mà phía BE trả về để FE dùng tính toán phân trang
  const [totalBoards, setTotalBoards] = useState(null)
  const [loadError, setLoadError] = useState('')
  // Ô "+ Create new board" trong lưới board mở modal tạo board
  const [openCreateBoardModal, setOpenCreateBoardModal] = useState(false)

  // Xử lý phân trang từ url với MUI: https://mui.com/material-ui/react-pagination/#router-integration
  const location = useLocation()
  const query = new URLSearchParams(location.search)
  const page = parseInt(query.get('page') || '1', 10)
  const isClosedView = query.get('closed') === 'true'

  const updateStateData = (res) => {
    setBoards(res.boards || [])
    setTotalBoards(res.totalBoards || 0)
  }

  useEffect(() => {
    setBoards(null)
    setLoadError('')
    fetchBoardsAPI(location.search)
      .then(updateStateData)
      .catch(() => setLoadError(t('boards.loadError')))
  }, [location.search, t])

  const afterCreateNewBoard = () => {
    setLoadError('')
    setBoards(null)
    fetchBoardsAPI(location.search)
      .then(updateStateData)
      .catch(() => setLoadError(t('boards.refreshError')))
  }

  const handleReopenBoard = async (boardId) => {
    try {
      await reopenBoardAPI(boardId)
      toast.success(t('boards.reopened'))
      fetchBoardsAPI(location.search).then(updateStateData)
    } catch (error) {
      toast.error(error?.response?.data?.message || t('boards.reopenFailed'))
    }
  }

  const handleDeleteBoard = (b) => {
    confirm({
      title: t('boards.deleteConfirmTitle'),
      description: t('boards.deleteConfirmDescription', { title: b.title }),
      confirmationText: t('boards.deletePermanently'),
      cancellationText: t('common.cancel')
    }).then(async () => {
      try {
        await deleteBoardDetailsAPI(b._id)
        toast.success(t('boards.permanentlyDeleted'))
        fetchBoardsAPI(location.search).then(updateStateData)
      } catch (error) {
        toast.error(error?.response?.data?.message || t('boards.deleteFailed'))
      }
    }).catch(() => { })
  }

  // Lúc chưa tồn tại boards > đang chờ gọi api thì hiện loading
  if (!boards && !loadError) {
    return <PageLoadingSpinner caption={t('boards.loadingBoards')} />
  }

  if (loadError) {
    return (
      <Box sx={{
        minHeight: '100vh',
        bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0f172a' : '#f4f5f7',
        color: (theme) => theme.palette.mode === 'dark' ? '#f1f5f9' : '#172b4d'
      }}>
        <AppBar />
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="error">{loadError}</Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0f172a' : '#f4f5f7',
      color: (theme) => theme.palette.mode === 'dark' ? '#f1f5f9' : '#172b4d',
      transition: 'background-color 0.3s ease, color 0.3s ease'
    }}>
      <AppBar />
      <Container maxWidth="xl" sx={{ py: { xs: 2.5, sm: 4 }, px: { xs: 1.5, sm: 3, md: 4 } }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          {/* Sidebar - ẩn trên mobile: bottom nav đã có tab Danh sách bảng,
              "Bảng đã đóng" nằm ở icon trên AppBar (mobile) */}
          <Box sx={{ width: { xs: '100%', md: '260px' }, flexShrink: 0, mr: { xs: 0, md: 4 }, display: { xs: 'none', md: 'block' } }}>
            <Stack direction="column" spacing={1}>
              <SidebarItem
                component={Link}
                to="/boards"
                className={!isClosedView ? 'active' : ''}
                sx={{ textDecoration: 'none', color: 'inherit' }}
              >
                <SpaceDashboardIcon fontSize="small" />
                {t('boards.sidebarBoards')}
              </SidebarItem>

              <SidebarItem
                component={Link}
                to="/boards?closed=true"
                className={isClosedView ? 'active' : ''}
                sx={{ textDecoration: 'none', color: 'inherit' }}
              >
                <FolderOffOutlinedIcon fontSize="small" />
                {t('boards.sidebarClosedBoards')}
              </SidebarItem>
            </Stack>
          </Box>

          {/* Main Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {isClosedView ? t('boards.closedBoards') : t('boards.yourBoards')}
              </Typography>

              {/* Mobile/tablet (md trở xuống, sidebar đang ẩn): nút chuyển qua lại giữa Bảng và Bảng đã đóng */}
              <Button
                component={Link}
                to={isClosedView ? '/boards' : '/boards?closed=true'}
                startIcon={isClosedView ? <SpaceDashboardIcon /> : <FolderOffOutlinedIcon />}
                size="small"
                variant={isClosedView ? 'contained' : 'outlined'}
                sx={{
                  display: { xs: 'inline-flex', md: 'none' },
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2
                }}
              >
                {isClosedView ? t('boards.sidebarBoards') : t('boards.sidebarClosedBoards')}
              </Button>
            </Box>

            {/* Trường hợp gọi API nhưng không tồn tại cái board nào trong Database trả về */}
            {boards?.length === 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
                  {isClosedView ? t('boards.noClosedBoards') : t('boards.noResults')}
                </Typography>
                {!isClosedView && <CreateBoardTile onClick={() => setOpenCreateBoardModal(true)} />}
              </Box>
            )}

            {/* Render danh sách boards theo CSS Grid 5 cột trên hàng */}
            {boards?.length > 0 && (
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                  lg: 'repeat(5, 1fr)'
                },
                gap: 2.5
              }}>
                {boards.map((b, index) => (
                  <motion.div
                    key={b._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.4), ease: 'easeOut' }}
                  >
                    <Card
                      onClick={() => navigate(`/boards/${b._id}/${b.slug || slugify(b.title)}`)}
                      sx={{
                        cursor: 'pointer',
                        width: '100%',
                        height: '140px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1e293b' : '#ffffff',
                        border: '1px solid',
                        borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                        boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 6px rgba(0,0,0,0.04)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0, 82, 204, 0.35)',
                          boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 8px 20px rgba(0,0,0,0.5)' : '0 8px 20px rgba(0,0,0,0.1)'
                        }
                      }}
                    >
                      <Box sx={{
                        height: '50px',
                        backgroundColor: b.background?.startsWith('http') ? 'transparent' : (b.background || randomColor({ seed: b._id })),
                        background: b.background?.startsWith('http') ? `url("${b.background}") center/cover no-repeat` : undefined,
                        flexShrink: 0
                      }} />

                      <CardContent sx={{
                        p: 1.5,
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        '&:last-child': { pb: 1.5 }
                      }}>
                        <Typography
                          variant="subtitle1"
                          component="div"
                          sx={{
                            fontWeight: 600,
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            lineHeight: 1.3
                          }}
                        >
                          {b.title}
                        </Typography>

                        {isClosedView ? (
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', pt: 0.8, borderTop: '1px solid', borderColor: 'divider' }}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<UndoIcon fontSize="small" />}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleReopenBoard(b._id)
                              }}
                              sx={{ textTransform: 'none', fontSize: '11px', py: 0.2, px: 0.8 }}
                            >
                              {t('boards.reopen')}
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              variant="outlined"
                              startIcon={<DeleteOutlineIcon fontSize="small" />}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteBoard(b)
                              }}
                              sx={{ textTransform: 'none', fontSize: '11px', py: 0.2, px: 0.8 }}
                            >
                              {t('boards.delete')}
                            </Button>
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 0.8, borderTop: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize', fontSize: '11px' }}>
                              {t('boards.workspace')}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}

                {/* Ô "+ Create new board" ngay trong lưới - người dùng Trello quen với cách này */}
                {!isClosedView && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(boards.length * 0.04, 0.4), ease: 'easeOut' }}
                  >
                    <CreateBoardTile onClick={() => setOpenCreateBoardModal(true)} />
                  </motion.div>
                )}
              </Box>
            )}

            {/* Modal tạo board dùng chung cho ô trong lưới */}
            <CreateBoardModal
              open={openCreateBoardModal}
              onClose={() => setOpenCreateBoardModal(false)}
              afterCreateNewBoard={afterCreateNewBoard}
            />

            {/* Phân trang */}
            {(totalBoards > DEFAULT_ITEMS_PER_PAGE) && (
              <Box sx={{ my: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Pagination
                  size="large"
                  color="primary"
                  showFirstButton
                  showLastButton
                  count={Math.ceil(totalBoards / DEFAULT_ITEMS_PER_PAGE)}
                  page={page}
                  renderItem={(item) => {
                    const params = new URLSearchParams()
                    if (isClosedView) params.set('closed', 'true')
                    if (item.page !== DEFAULT_PAGE) params.set('page', item.page)
                    const searchStr = params.toString() ? `?${params.toString()}` : ''
                    return (
                      <PaginationItem
                        component={Link}
                        to={`/boards${searchStr}`}
                        {...item}
                      />
                    )
                  }}
                />
              </Box>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default Boards
