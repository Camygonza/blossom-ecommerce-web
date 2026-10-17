import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlined from '@mui/icons-material/LightModeOutlined'
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { Link as RouterLink, Outlet, useNavigate } from 'react-router-dom'
import { useLogoutMutation } from '@/api/api'
import { useColorMode } from '@/app/colorMode'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { toastShown } from '@/features/ui/uiSlice'
import { Logo } from './Logo'
import { ToastHost } from './ToastHost'

function UserMenu() {
  const user = useAppSelector((state) => state.auth.user)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [logout] = useLogoutMutation()
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)

  if (!user) {
    return (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button component={RouterLink} to="/login" color="inherit">
          Ingresar
        </Button>
        <Button component={RouterLink} to="/registro" variant="contained" color="secondary">
          Crear cuenta
        </Button>
      </Box>
    )
  }

  const onLogout = async () => {
    setAnchor(null)
    await logout()
    dispatch(toastShown('Sesión cerrada. ¡Hasta pronto!', 'info'))
    navigate('/')
  }

  return (
    <>
      <Button color="inherit" onClick={(e) => setAnchor(e.currentTarget)} aria-haspopup="menu">
        {user.fullName}
      </Button>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        <MenuItem onClick={onLogout}>Cerrar sesión</MenuItem>
      </Menu>
    </>
  )
}

export function Layout() {
  const { mode, toggle } = useColorMode()

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box
        component="a"
        href="#contenido"
        sx={{
          position: 'absolute',
          left: -9999,
          '&:focus': {
            left: 8,
            top: 8,
            zIndex: 2000,
            bgcolor: 'background.paper',
            p: 1,
            borderRadius: 1,
          },
        }}
      >
        Saltar al contenido
      </Box>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Toolbar sx={{ gap: 1 }}>
          <Box
            component={RouterLink}
            to="/"
            aria-label="Bloom, inicio"
            sx={{ color: 'primary.main', textDecoration: 'none' }}
          >
            <Logo />
          </Box>
          <Button component={RouterLink} to="/productos" color="inherit" sx={{ ml: 2 }}>
            Tienda
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton
            onClick={toggle}
            color="inherit"
            aria-label={mode === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {mode === 'dark' ? <LightModeOutlined /> : <DarkModeOutlined />}
          </IconButton>
          <UserMenu />
        </Toolbar>
      </AppBar>
      <Container
        component="main"
        id="contenido"
        tabIndex={-1}
        sx={{ flexGrow: 1, py: 4, outline: 'none' }}
      >
        <Outlet />
      </Container>
      <Box
        component="footer"
        sx={{ borderTop: 1, borderColor: 'divider', py: 3, textAlign: 'center' }}
      >
        <Typography variant="body2" color="text.secondary">
          Bloom · Plantas, flores y guías para tu hogar
        </Typography>
      </Box>
      <ToastHost />
    </Box>
  )
}
