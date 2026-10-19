import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlined from '@mui/icons-material/LightModeOutlined'
import SearchIcon from '@mui/icons-material/Search'
import ShoppingCartOutlined from '@mui/icons-material/ShoppingCartOutlined'
import {
  AppBar,
  Badge,
  Box,
  Button,
  Container,
  InputBase,
  Link,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material'
import { useState, type FormEvent } from 'react'
import { Link as RouterLink, Outlet, useNavigate } from 'react-router-dom'
import { useLogoutMutation } from '@/api/api'
import { useColorMode } from '@/app/colorMode'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { useI18n, useT } from '@/i18n/i18n'
import { selectCartCount } from '@/features/cart/cartSlice'
import { toastShown } from '@/features/ui/uiSlice'
import { Logo } from './Logo'
import { ToastHost } from './ToastHost'

function LanguageButton() {
  const { lang, setLang, t } = useI18n()
  const next = lang === 'es' ? 'en' : 'es'
  return (
    <Button
      color="inherit"
      size="small"
      onClick={() => setLang(next)}
      lang={next}
      aria-label={t('Cambiar idioma a {language}', {
        language: next === 'en' ? 'English' : 'Español',
      })}
      sx={{
        minWidth: 0,
        px: { xs: 0.75, sm: 1.25 },
        fontWeight: 700,
        fontSize: { xs: '0.75rem', sm: '0.875rem' },
      }}
    >
      {next === 'en' ? 'English' : 'Español'}
    </Button>
  )
}

function CartButton() {
  const t = useT()
  const count = useAppSelector(selectCartCount)
  return (
    <IconButton
      component={RouterLink}
      to="/carrito"
      color="inherit"
      aria-label={
        count === 1 ? t('Carrito, 1 artículo') : t('Carrito, {count} artículos', { count })
      }
    >
      <Badge badgeContent={count} color="secondary" max={99}>
        <ShoppingCartOutlined />
      </Badge>
    </IconButton>
  )
}

function UserMenu() {
  const t = useT()
  const user = useAppSelector((state) => state.auth.user)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [logout] = useLogoutMutation()
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)

  if (!user) {
    return (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button component={RouterLink} to="/login" color="inherit">
          {t('Ingresar')}
        </Button>
        <Button
          component={RouterLink}
          to="/registro"
          variant="contained"
          color="secondary"
          sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
        >
          {t('Crear cuenta')}
        </Button>
      </Box>
    )
  }

  const onLogout = async () => {
    setAnchor(null)
    await logout()
    dispatch(toastShown(t('Sesión cerrada. ¡Hasta pronto!'), 'info'))
    navigate('/')
  }

  return (
    <>
      <Button color="inherit" onClick={(e) => setAnchor(e.currentTarget)} aria-haspopup="menu">
        <Box
          component="span"
          sx={{
            maxWidth: { xs: 90, sm: 220 },
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {user.fullName}
        </Box>
      </Button>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        {user.role === 'CUSTOMER' && (
          <MenuItem component={RouterLink} to="/ordenes" onClick={() => setAnchor(null)}>
            {t('Mis órdenes')}
          </MenuItem>
        )}
        {user.role === 'ADMIN' && [
          <MenuItem
            key="products"
            component={RouterLink}
            to="/admin/productos"
            onClick={() => setAnchor(null)}
          >
            {t('Gestionar productos')}
          </MenuItem>,
          <MenuItem
            key="orders"
            component={RouterLink}
            to="/admin/ordenes"
            onClick={() => setAnchor(null)}
          >
            {t('Gestionar órdenes')}
          </MenuItem>,
        ]}
        <MenuItem onClick={onLogout}>{t('Cerrar sesión')}</MenuItem>
      </Menu>
    </>
  )
}

/** Buscador de la cabecera: lleva al catálogo con el texto como filtro de nombre. */
function SearchBox() {
  const t = useT()
  const navigate = useNavigate()
  const [text, setText] = useState('')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const query = text.trim()
    navigate(query ? `/productos?q=${encodeURIComponent(query)}` : '/productos')
    setText('')
  }

  return (
    <Box
      component="form"
      role="search"
      onSubmit={submit}
      sx={{
        display: { xs: 'none', md: 'flex' },
        alignItems: 'center',
        gap: 1,
        ml: 3,
        px: 1.75,
        py: 0.5,
        width: 300,
        borderRadius: 999,
        bgcolor: 'action.hover',
        border: 1,
        borderColor: 'divider',
        '&:focus-within': {
          borderColor: 'primary.main',
          boxShadow: (theme) => `0 0 0 3px ${theme.palette.primary.main}33`,
        },
      }}
    >
      <SearchIcon fontSize="small" color="action" />
      <InputBase
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t('Buscar plantas, flores, guías…')}
        slotProps={{ input: { 'aria-label': t('Buscar en la tienda') } }}
        sx={{ flexGrow: 1, fontSize: '0.95rem' }}
      />
    </Box>
  )
}

function Footer() {
  const t = useT()
  const categoryLinks: [string, string][] = [
    [t('Plantas de interior'), '/productos?categoria=1'],
    [t('Flores'), '/productos?categoria=2'],
    [t('Macetas y decoración'), '/productos?categoria=3'],
    [t('Herramientas'), '/productos?categoria=4'],
    [t('Guías digitales'), '/productos?categoria=5'],
  ]
  const user = useAppSelector((state) => state.auth.user)
  const heading = { fontWeight: 700, mb: 1.5, fontFamily: '"Fraunces", Georgia, serif' } as const
  const link = {
    display: 'block',
    py: 0.5,
    color: 'text.secondary',
    textDecoration: 'none',
    '&:hover': { color: 'primary.main', textDecoration: 'underline' },
  } as const

  return (
    <Box
      component="footer"
      sx={{ mt: 4, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
    >
      <Container sx={{ py: 5 }}>
        <Box
          sx={{
            display: 'grid',
            gap: 4,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: '1.4fr 1fr 1fr' },
          }}
        >
          <Box>
            <Box sx={{ color: 'primary.main', mb: 1.5 }}>
              <Logo />
            </Box>
            <Typography color="text.secondary" sx={{ maxWidth: 340 }}>
              {t('Plantas de interior, flores y guías digitales para que tu hogar florezca.')}
            </Typography>
          </Box>
          <Box component="nav" aria-label={t('Categorías')}>
            <Typography component="p" sx={heading}>
              {t('Tienda')}
            </Typography>
            {categoryLinks.map(([label, to]) => (
              <Link key={to} component={RouterLink} to={to} sx={link}>
                {label}
              </Link>
            ))}
          </Box>
          <Box component="nav" aria-label={t('Cuenta')}>
            <Typography component="p" sx={heading}>
              {t('Tu cuenta')}
            </Typography>
            {user ? (
              <Link
                component={RouterLink}
                to={user.role === 'ADMIN' ? '/admin/ordenes' : '/ordenes'}
                sx={link}
              >
                {user.role === 'ADMIN' ? t('Gestionar órdenes') : t('Mis órdenes')}
              </Link>
            ) : (
              <>
                <Link component={RouterLink} to="/login" sx={link}>
                  {t('Ingresar')}
                </Link>
                <Link component={RouterLink} to="/registro" sx={link}>
                  {t('Crear cuenta')}
                </Link>
              </>
            )}
            <Link component={RouterLink} to="/carrito" sx={link}>
              {t('Carrito')}
            </Link>
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
          {t('Bloom · Proyecto de demostración: los pagos y envíos son simulados.')}
        </Typography>
      </Container>
    </Box>
  )
}

export function Layout() {
  const t = useT()
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
        {t('Saltar al contenido')}
      </Box>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Toolbar sx={{ gap: { xs: 0, sm: 1 }, px: { xs: 1, sm: 3 }, minHeight: { sm: 72 } }}>
          <Box
            component={RouterLink}
            to="/"
            aria-label={t('Bloom, inicio')}
            sx={{ color: 'primary.main', textDecoration: 'none' }}
          >
            <Logo />
          </Box>
          <Button
            component={RouterLink}
            to="/productos"
            color="inherit"
            sx={{ ml: { xs: 0, sm: 2 } }}
          >
            {t('Tienda')}
          </Button>
          <SearchBox />
          <Box sx={{ flexGrow: 1 }} />
          <IconButton
            onClick={toggle}
            color="inherit"
            aria-label={mode === 'dark' ? t('Cambiar a modo claro') : t('Cambiar a modo oscuro')}
          >
            {mode === 'dark' ? <LightModeOutlined /> : <DarkModeOutlined />}
          </IconButton>
          <LanguageButton />
          <CartButton />
          <UserMenu />
        </Toolbar>
      </AppBar>
      <Container
        component="main"
        id="contenido"
        tabIndex={-1}
        sx={{ flexGrow: 1, py: { xs: 3, md: 5 }, outline: 'none' }}
      >
        <Outlet />
      </Container>
      <Footer />
      <ToastHost />
    </Box>
  )
}
