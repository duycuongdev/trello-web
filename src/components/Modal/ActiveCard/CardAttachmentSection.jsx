import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined'
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import WallpaperIcon from '@mui/icons-material/Wallpaper'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useTranslation } from 'react-i18next'

dayjs.extend(relativeTime)

const formatBytes = (bytes) => {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

function CardAttachmentSection({ attachments = [], cardCover, onDeleteAttachment, onMakeCover }) {
  const { t } = useTranslation()
  if (!attachments || attachments.length === 0) return null

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
        <AttachFileOutlinedIcon sx={{ color: '#0d9488' }} />
        <Typography variant="span" sx={{ fontWeight: '600', fontSize: '20px' }}>
          {t('cardModal.generalAttachments')}
        </Typography>
      </Box>

      <Stack spacing={1.5}>
        {attachments.map((att) => {
          const isImage = att.fileType?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(att.fileUrl)
          const isCurrentCover = cardCover === att.fileUrl

          return (
            <Box
              key={att._id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 1,
                borderRadius: 1.5,
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#091e420f'),
                '&:hover': {
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#091e4214')
                }
              }}
            >
              {/* Preview Thumbnail */}
              <Box
                sx={{
                  width: 80,
                  height: 60,
                  flexShrink: 0,
                  borderRadius: 1,
                  overflow: 'hidden',
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#1e293b' : '#e2e8f0'),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                onClick={() => window.open(att.fileUrl, '_blank')}
              >
                {isImage ? (
                  <img
                    src={att.fileUrl}
                    alt={att.fileName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <InsertDriveFileOutlinedIcon sx={{ fontSize: 32, color: 'text.secondary' }} />
                )}
              </Box>

              {/* Attachment Info */}
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  noWrap
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline', color: 'primary.main' }
                  }}
                  onClick={() => window.open(att.fileUrl, '_blank')}
                >
                  {att.fileName}
                </Typography>

                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                  Added {att.uploadedAt ? dayjs(att.uploadedAt).fromNow() : ''}
                  {att.fileSize ? ` • ${formatBytes(att.fileSize)}` : ''}
                  {isCurrentCover && ' • Current Cover'}
                </Typography>

                {/* Actions */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    size="small"
                    color="inherit"
                    startIcon={<OpenInNewIcon fontSize="small" />}
                    onClick={() => window.open(att.fileUrl, '_blank')}
                    sx={{ textTransform: 'none', fontSize: '0.75rem', p: '2px 6px', minWidth: 'unset' }}
                  >
                    Open
                  </Button>

                  {isImage && !isCurrentCover && onMakeCover && (
                    <Button
                      size="small"
                      color="inherit"
                      startIcon={<WallpaperIcon fontSize="small" />}
                      onClick={() => onMakeCover(att.fileUrl)}
                      sx={{ textTransform: 'none', fontSize: '0.75rem', p: '2px 6px', minWidth: 'unset' }}
                    >
                      Make cover
                    </Button>
                  )}

                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteOutlineIcon fontSize="small" />}
                    onClick={() => onDeleteAttachment(att._id)}
                    sx={{ textTransform: 'none', fontSize: '0.75rem', p: '2px 6px', minWidth: 'unset' }}
                  >
                    Delete
                  </Button>
                </Box>
              </Box>
            </Box>
          )
        })}
      </Stack>
    </Box>
  )
}

export default CardAttachmentSection
