import { useEffect, useState } from 'react'
import AppBar from '~/components/AppBar/AppBar'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import SecurityIcon from '@mui/icons-material/Security'
import PersonIcon from '@mui/icons-material/Person'
import { Link, useLocation } from 'react-router-dom'
import AccountTab from './AccountTab'
import SecurityTab from './SecurityTab'
import { useTranslation } from 'react-i18next'

// Khai báo đống tabs ra biến const để dùng lại cho gọn
const TABS = {
  ACCOUNT: 'account',
  SECURITY: 'security'
}

function Settings() {
  const { t } = useTranslation()
  const location = useLocation()
  // Function đơn giản có nhiệm vụ lấy ra cái tab mặc định dựa theo url.
  const getDefaultTab = () => {
    if (location.pathname.includes(TABS.SECURITY)) return TABS.SECURITY
    return TABS.ACCOUNT
  }
  // State lưu trữ giá trị tab nào đang active
  const [activeTab, setActiveTab] = useState(getDefaultTab())

  useEffect(() => {
    setActiveTab(location.pathname.includes(TABS.SECURITY) ? TABS.SECURITY : TABS.ACCOUNT)
  }, [location.pathname])

  // https://mui.com/material-ui/react-tabs
  const handleChangeTab = (event, selectedTab) => { setActiveTab(selectedTab) }

  return (
    <Container disableGutters maxWidth={false}>
      <AppBar />
      <TabContext value={activeTab}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChangeTab}>
            <Tab
              label={t('settings.account')}
              value={TABS.ACCOUNT}
              icon={<PersonIcon />}
              iconPosition="start"
              component={Link}
              to="/settings/account" />
            <Tab
              label={t('settings.security')}
              value={TABS.SECURITY}
              icon={<SecurityIcon />}
              iconPosition="start"
              component={Link}
              to="/settings/security" />
          </TabList>
        </Box>
        <TabPanel value={TABS.ACCOUNT} sx={{ pb: { xs: 'calc(80px + env(safe-area-inset-bottom, 0px))', sm: 3 } }}><AccountTab /></TabPanel>
        <TabPanel value={TABS.SECURITY} sx={{ pb: { xs: 'calc(80px + env(safe-area-inset-bottom, 0px))', sm: 3 } }}><SecurityTab /></TabPanel>
      </TabContext>
    </Container>
  )
}

export default Settings
