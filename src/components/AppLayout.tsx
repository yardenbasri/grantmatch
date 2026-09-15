import { AppBar, Box, Tab, Tabs, Toolbar, Typography } from '@mui/material'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

const navItems = [
  { path: '/grants', label: 'קטלוג מענקים' },
  { path: '/profile', label: 'פרופיל עסק' },
  { path: '/matches', label: 'התאמות למענקים' },
]

export function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const currentTab = navItems.find((item) => item.path === location.pathname)?.path ?? false

  return (
    <Box sx={{ minHeight: '100%' }}>
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar sx={{ display: 'flex', gap: 4 }}>
          <Typography variant="h6" component="span" sx={{ fontFamily: '"Frank Ruhl Libre", serif' }}>
            GrantMatch
          </Typography>
          <Tabs value={currentTab} onChange={(_, value) => navigate(value)}>
            {navItems.map((item) => (
              <Tab key={item.path} value={item.path} label={item.label} />
            ))}
          </Tabs>
        </Toolbar>
      </AppBar>
      <Outlet />
    </Box>
  )
}
