import { useState, useEffect } from 'react'
import { useColorScheme } from '@mui/material/styles'
import MDEditor from '@uiw/react-md-editor'
import rehypeSanitize from 'rehype-sanitize'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import EditNoteIcon from '@mui/icons-material/EditNote'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import { useTranslation } from 'react-i18next'

function CardDescriptionMdEditor({ cardDescriptionProp, handleUpdateCardDescription }) {
  const { t } = useTranslation()
  const { mode } = useColorScheme()

  // State xử lý chế độ Edit và chế độ View
  const [markdownEditMode, setMarkdownEditMode] = useState(false)
  // State xử lý giá trị markdown khi chỉnh sửa
  const [cardDescription, setCardDescription] = useState(cardDescriptionProp || '')

  useEffect(() => {
    setCardDescription(cardDescriptionProp || '')
  }, [cardDescriptionProp])

  const updateCardDescription = () => {
    setMarkdownEditMode(false)
    handleUpdateCardDescription(cardDescription)
  }

  const cancelEdit = () => {
    setCardDescription(cardDescriptionProp || '')
    setMarkdownEditMode(false)
  }

  const hasContent = Boolean(cardDescription && cardDescription.trim())

  return (
    <Box sx={{ mt: 1.5 }}>
      {markdownEditMode ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {/* Markdown Quick Syntax Helper Bar */}
          <Box sx={{
            p: 1,
            borderRadius: 1.5,
            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1e293b' : '#f0f7ff',
            border: '1px solid',
            borderColor: (theme) => theme.palette.mode === 'dark' ? '#334155' : '#bfdbfe',
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 0.8
          }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', mr: 0.5 }}>
              Markdown Tips:
            </Typography>
            <Chip size="small" label="# H1" variant="outlined" sx={{ fontSize: '0.72rem', height: 22 }} />
            <Chip size="small" label="## H2" variant="outlined" sx={{ fontSize: '0.72rem', height: 22 }} />
            <Chip size="small" label="**bold**" variant="outlined" sx={{ fontSize: '0.72rem', height: 22 }} />
            <Chip size="small" label="*italic*" variant="outlined" sx={{ fontSize: '0.72rem', height: 22 }} />
            <Chip size="small" label="`code`" variant="outlined" sx={{ fontSize: '0.72rem', height: 22 }} />
            <Chip size="small" label="> quote" variant="outlined" sx={{ fontSize: '0.72rem', height: 22 }} />
            <Chip size="small" label="- list" variant="outlined" sx={{ fontSize: '0.72rem', height: 22 }} />
            <Chip size="small" label="- [x] task" variant="outlined" sx={{ fontSize: '0.72rem', height: 22 }} />
          </Box>

          {/* MDEditor container */}
          <Box
            data-color-mode={mode}
            sx={{
              borderRadius: 2,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: (theme) => theme.palette.mode === 'dark' ? '#334155' : '#cbd5e1',
              boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 4px 14px rgba(0,0,0,0.3)' : '0 4px 14px rgba(0,0,0,0.05)'
            }}
          >
            <MDEditor
              value={cardDescription}
              onChange={(val) => setCardDescription(val || '')}
              previewOptions={{ rehypePlugins: [[rehypeSanitize]] }}
              height={320}
              preview="edit"
            />
          </Box>

          {/* Action buttons */}
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              onClick={cancelEdit}
              type="button"
              variant="outlined"
              size="small"
              startIcon={<CloseIcon />}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}
            >
              Cancel
            </Button>
            <Button
              onClick={updateCardDescription}
              className="interceptor-loading"
              type="button"
              variant="contained"
              size="small"
              startIcon={<CheckIcon />}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: 1.5,
                bgcolor: '#0052cc',
                backgroundImage: 'linear-gradient(135deg, #0052cc 0%, #0284c7 100%)',
                '&:hover': { bgcolor: '#0747a6' }
              }}
            >
              {t('card.saveDescription')}
            </Button>
          </Stack>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {hasContent ? (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                <Button
                  onClick={() => setMarkdownEditMode(true)}
                  type="button"
                  variant="outlined"
                  size="small"
                  startIcon={<EditNoteIcon />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 1.5,
                    borderColor: 'divider',
                    color: 'text.primary',
                    '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
                  }}
                >
                  Edit
                </Button>
              </Box>

              {/* Styled Rich Markdown Container */}
              <Box
                data-color-mode={mode}
                onClick={() => setMarkdownEditMode(true)}
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: (theme) => theme.palette.mode === 'dark' ? '#334155' : '#e2e8f0',
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1e293b' : '#f8fafc',
                  boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#0052cc',
                    boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 4px 16px rgba(0, 82, 204, 0.2)' : '0 4px 16px rgba(0, 82, 204, 0.08)'
                  },
                  // Custom styling for rich markdown elements
                  '& .wmde-markdown': {
                    bgcolor: 'transparent !important',
                    fontFamily: 'inherit',
                    fontSize: '0.92rem',
                    lineHeight: 1.65,
                    color: (theme) => theme.palette.mode === 'dark' ? '#f1f5f9' : '#1e293b',
                    // Headings
                    '& h1': {
                      color: (theme) => theme.palette.mode === 'dark' ? '#60a5fa' : '#0052cc',
                      fontWeight: 800,
                      fontSize: '1.45rem',
                      pb: 0.8,
                      mb: 1.5,
                      borderBottom: '2px solid',
                      borderColor: (theme) => theme.palette.mode === 'dark' ? '#334155' : '#e2e8f0'
                    },
                    '& h2': {
                      color: (theme) => theme.palette.mode === 'dark' ? '#38bdf8' : '#0284c7',
                      fontWeight: 750,
                      fontSize: '1.25rem',
                      pb: 0.5,
                      mb: 1.2
                    },
                    '& h3': {
                      color: (theme) => theme.palette.mode === 'dark' ? '#2dd4bf' : '#0d9488',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      mb: 1
                    },
                    '& h4, & h5, & h6': {
                      color: (theme) => theme.palette.mode === 'dark' ? '#a78bfa' : '#6366f1',
                      fontWeight: 650,
                      fontSize: '1rem',
                      mb: 0.8
                    },
                    // Inline code
                    '& code:not([class*="language-"])': {
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(244, 114, 182, 0.15)' : 'rgba(124, 58, 237, 0.08)',
                      color: (theme) => theme.palette.mode === 'dark' ? '#f472b6' : '#7c3aed',
                      border: '1px solid',
                      borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(244, 114, 182, 0.3)' : 'rgba(124, 58, 237, 0.2)',
                      px: 0.8,
                      py: 0.2,
                      borderRadius: 1,
                      fontFamily: 'Consolas, Monaco, monospace',
                      fontSize: '0.86rem',
                      fontWeight: 600
                    },
                    // Code block
                    '& pre': {
                      bgcolor: '#0f172a !important',
                      border: '1px solid #334155',
                      borderRadius: 2,
                      p: 1.8,
                      my: 1.5,
                      overflowX: 'auto',
                      '& code': {
                        bgcolor: 'transparent !important',
                        color: '#f8fafc !important',
                        border: 'none !important',
                        p: '0 !important'
                      }
                    },
                    // Blockquotes
                    '& blockquote': {
                      borderLeft: '4px solid #0052cc',
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(0, 82, 204, 0.12)' : 'rgba(0, 82, 204, 0.04)',
                      p: '10px 16px',
                      borderRadius: '0 8px 8px 0',
                      my: 1.5,
                      color: (theme) => theme.palette.mode === 'dark' ? '#cbd5e1' : '#475569',
                      fontStyle: 'italic'
                    },
                    // Links
                    '& a': {
                      color: (theme) => theme.palette.mode === 'dark' ? '#38bdf8' : '#0052cc',
                      fontWeight: 600,
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' }
                    },
                    // Lists
                    '& ul, & ol': {
                      pl: 3,
                      my: 1
                    },
                    '& li': {
                      my: 0.4
                    },
                    // Tables
                    '& table': {
                      width: '100%',
                      borderCollapse: 'collapse',
                      my: 1.5,
                      borderRadius: 1,
                      overflow: 'hidden',
                      '& th': {
                        bgcolor: (theme) => theme.palette.mode === 'dark' ? '#334155' : '#e0e7ff',
                        color: (theme) => theme.palette.mode === 'dark' ? '#f8fafc' : '#3730a3',
                        fontWeight: 700,
                        p: 1.2,
                        textAlign: 'left'
                      },
                      '& td': {
                        p: 1,
                        borderBottom: '1px solid',
                        borderColor: (theme) => theme.palette.mode === 'dark' ? '#334155' : '#e2e8f0'
                      },
                      '& tr:nth-of-type(even)': {
                        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'
                      }
                    },
                    // Checkbox in task lists
                    '& input[type="checkbox"]': {
                      accentColor: '#0052cc',
                      transform: 'scale(1.15)',
                      verticalAlign: 'middle',
                      mr: 0.8
                    }
                  }
                }}
              >
                {/* Bắt buộc sanitize HTML output để chặn stored XSS qua nội dung markdown
                    (rehypeSanitize loại bỏ thẻ script/onerror/onclick... trước khi render) */}
                <MDEditor.Markdown source={cardDescription} rehypePlugins={[[rehypeSanitize]]} />
              </Box>
            </Box>
          ) : (
            /* Inviting Empty State Box */
            <Box
              onClick={() => setMarkdownEditMode(true)}
              sx={{
                p: 3,
                borderRadius: 2.5,
                border: '2px dashed',
                borderColor: (theme) => theme.palette.mode === 'dark' ? '#334155' : '#cbd5e1',
                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: '#0052cc',
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(0, 82, 204, 0.1)' : 'rgba(0, 82, 204, 0.04)',
                  '& .desc-icon': { color: '#0052cc', transform: 'scale(1.1)' }
                }
              }}
            >
              <DescriptionOutlinedIcon
                className="desc-icon"
                sx={{
                  fontSize: 34,
                  color: 'text.secondary',
                  mb: 1,
                  transition: 'all 0.2s ease'
                }}
              />
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                {t('card.descEmptyTitle')}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                {t('card.descEmptySubtitle')}
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}

export default CardDescriptionMdEditor
