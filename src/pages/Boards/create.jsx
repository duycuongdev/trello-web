import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import Typography from '@mui/material/Typography'
import LibraryAddIcon from '@mui/icons-material/LibraryAdd'
import { useForm } from 'react-hook-form'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import FieldErrorAlert from '~/components/Form/FieldErrorAlert'
import AbcIcon from '@mui/icons-material/Abc'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import Button from '@mui/material/Button'
import { createNewBoardAPI } from '~/apis'
import { useTranslation } from 'react-i18next'

/**
 * CreateBoardModal: Modal tạo Board mới, dùng chung cho ô "+ Create new board"
 * trong lưới board ở trang Boards và trang board trống.
 * - open/onClose: điều khiển từ component cha
 */
export function CreateBoardModal({ open, onClose, afterCreateNewBoard }) {
  const { t } = useTranslation()
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const handleCloseModal = () => {
    reset()
    onClose()
  }

  const submitCreateNewBoard = (data) => {
    createNewBoardAPI(data).then(() => {
      handleCloseModal()
      afterCreateNewBoard()
    })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '92%', sm: 540, md: 580 },
        bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1e293b' : '#ffffff',
        color: (theme) => theme.palette.mode === 'dark' ? '#f1f5f9' : '#172b4d',
        boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
        borderRadius: '12px',
        border: '1px solid',
        borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
        outline: 0,
        padding: { xs: '20px 16px', sm: '24px 30px' }
      }}>
        <Box sx={{
          position: 'absolute',
          top: '10px',
          right: '10px'
        }}>
          <IconButton size="small" onClick={handleCloseModal} aria-label="close">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Box id="modal-modal-title" sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1 }}>
          <LibraryAddIcon color="primary" />
          <Typography variant="h6" component="h2" fontWeight={700}>{t('boards.createBoardTitle')}</Typography>
        </Box>
        <Box id="modal-modal-description" sx={{ my: 2 }}>
          <form onSubmit={handleSubmit(submitCreateNewBoard)}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box>
                <TextField
                  fullWidth
                  label={t('common.title')}
                  type="text"
                  variant="outlined"
                  placeholder={t('boards.boardTitlePlaceholder')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AbcIcon fontSize="small" />
                      </InputAdornment>
                    )
                  }}
                  {...register('title', {
                    required: t('validation.required'),
                    minLength: { value: 3, message: t('validation.minLength3') },
                    maxLength: { value: 50, message: t('validation.minLength50') }
                  })}
                  error={!!errors['title']}
                />
                <FieldErrorAlert errors={errors} fieldName={'title'} />
              </Box>

              <Box>
                <TextField
                  fullWidth
                  label={t('common.description')}
                  type="text"
                  variant="outlined"
                  multiline
                  rows={3}
                  placeholder={t('boards.boardDescriptionPlaceholder')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DescriptionOutlinedIcon fontSize="small" />
                      </InputAdornment>
                    )
                  }}
                  {...register('description', {
                    required: t('validation.required'),
                    minLength: { value: 3, message: t('validation.minLength3') },
                    maxLength: { value: 255, message: t('validation.maxLength255') }
                  })}
                  error={!!errors['description']}
                />
                <FieldErrorAlert errors={errors} fieldName={'description'} />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 1 }}>
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={handleCloseModal}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Cancel
                </Button>
                <Button
                  className="interceptor-loading"
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ textTransform: 'none', fontWeight: 600, px: 3 }}
                >
                  Create
                </Button>
              </Box>
            </Box>
          </form>
        </Box>
      </Box>
    </Modal>
  )
}
