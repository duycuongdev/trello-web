import React from 'react'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import ListItemIcon from '@mui/material/ListItemIcon'
import Avatar from '@mui/material/Avatar'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Settings from '@mui/icons-material/Settings'
import Logout from '@mui/icons-material/Logout'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import KeyboardOutlinedIcon from '@mui/icons-material/KeyboardOutlined'
import { useSelector, useDispatch } from 'react-redux'
import { selectCurrentUser, logoutUserAPI } from '~/redux/user/userSlice'
import { useConfirm } from 'material-ui-confirm'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

function Profile({ onOpenTour, onOpenShortcuts }) {
  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl)
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const { t } = useTranslation()
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)

  const confirmLogout = useConfirm()
  const handleLogout = () => {
    confirmLogout({
      title: t('profileMenu.logoutTitle'),
      confirmationText: t('common.confirm'),
      cancellationText: t('common.cancel')
    }).then(() => {
      dispatch(logoutUserAPI())
    }).catch(() => { })
  }
  return (
    <Box>
      <Tooltip title={t('profileMenu.accountSettings')}>
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{ color: 'inherit' }}
          aria-controls={open ? 'basic-menu-profile' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <Avatar
            sx={{ width: 36, height: 36 }}
            alt='avatar'
            src={currentUser?.avatar}
          />
        </IconButton>
      </Tooltip>
      <Menu
        id="basic-menu-profile"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button-profile'
        }}
      >
        <Link to='/settings/account' style={{ color: 'inherit' }}>
          <MenuItem sx={{ '&:hover': { color: 'success.light' } }}>
            <Avatar
              sx={{ width: 28, height: 28, mr: 2 }}
              src={currentUser?.avatar}
            /> {t('profileMenu.profile')}
          </MenuItem>
        </Link>
        <Divider />
        <MenuItem onClick={() => {
          handleClose()
          if (onOpenTour) onOpenTour()
        }}>
          <ListItemIcon>
            <HelpOutlineIcon fontSize="small" sx={{ color: '#0052cc' }} />
          </ListItemIcon>
          {t('profileMenu.productTour')}
        </MenuItem>
        <MenuItem onClick={() => {
          handleClose()
          if (onOpenShortcuts) onOpenShortcuts()
        }}>
          <ListItemIcon>
            <KeyboardOutlinedIcon fontSize="small" sx={{ color: '#0ea5e9' }} />
          </ListItemIcon>
          {t('profileMenu.shortcuts')}
        </MenuItem>
        <Link to='/settings/account' style={{ color: 'inherit', textDecoration: 'none' }}>
          <MenuItem>
            <ListItemIcon>
              <Settings fontSize="small" sx={{ color: '#6366f1' }} />
            </ListItemIcon>
            {t('profileMenu.settings')}
          </MenuItem>
        </Link>
        <MenuItem onClick={handleLogout} sx={{
          '&:hover': {
            color: 'error.main',
            '& .icon-logout': { color: 'error.main' }
          }
        }}>
          <ListItemIcon>
            <Logout className='icon-logout' fontSize="small" sx={{ color: '#ef4444' }} />
          </ListItemIcon>
          {t('profileMenu.logout')}
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default Profile
