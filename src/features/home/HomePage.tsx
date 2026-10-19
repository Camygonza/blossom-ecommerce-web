import ArrowForward from '@mui/icons-material/ArrowForward'
import { Alert, Box, Button, Card, CardActionArea, Stack, Typography } from '@mui/material'
import Grid from '@mui/material/Grid'
import { Link as RouterLink } from 'react-router-dom'
import { useGetCategoriesQuery, useGetProductsQuery } from '@/api/api'
import { useT } from '@/i18n/i18n'
import { ProductImage } from '@/features/products/art/ProductImage'
import { ProductCard, ProductCardSkeleton } from '@/features/products/ProductCard'
import { HeroArt } from './HeroArt'

// Foto representativa por categoría para la portada (si falta, ProductImage dibuja la ilustración).
const CATEGORY_PHOTO: Record<number, { name: string; photo: string }> = {
  1: { name: 'Costilla de Adán', photo: '01' },
  2: { name: 'Ramo de girasoles', photo: '08' },
  3: { name: 'Maceta de barro', photo: '15' },
  4: { name: 'Regadera', photo: '20' },
  5: { name: 'Guía de cuidado de plantas', photo: '25' },
}

export function HomePage() {
  const t = useT()
  const perks = [
    [
      t('Para empezar fácil'),
      t('Plantas resistentes y guías paso a paso para quien está comenzando.'),
    ],
    [t('Guías al instante'), t('Los productos digitales se descargan al comprar, sin esperas.')],
    [t('Cuidado que se nota'), t('Elegimos plantas sanas y herramientas que duran.')],
  ] as const
  const { data, isLoading, error } = useGetProductsQuery({ size: 4, sort: 'createdAt,desc' })
  const { data: categories = [] } = useGetCategoriesQuery()

  return (
    <Stack spacing={{ xs: 6, md: 9 }}>
      <Box
        component="section"
        aria-labelledby="hero-title"
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: { xs: 3, md: 4 },
          px: { xs: 3, md: 7 },
          py: { xs: 5, md: 7 },
          color: '#f7f3ea',
          background: 'linear-gradient(135deg, #1f4d38 0%, #2d6a4f 55%, #4a8a68 100%)',
          boxShadow: '0 30px 70px -30px rgba(31,77,56,0.65)',
        }}
      >
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(600px 300px at 85% 10%, rgba(244,180,0,0.22), transparent 60%), radial-gradient(500px 300px at 0% 100%, rgba(227,148,119,0.25), transparent 60%)',
          }}
        />
        <Grid
          container
          spacing={{ xs: 3, md: 4 }}
          sx={{ position: 'relative', alignItems: 'center' }}
        >
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="overline" sx={{ letterSpacing: 2, opacity: 0.85 }}>
              {t('Plantas · flores · guías')}
            </Typography>
            <Typography
              id="hero-title"
              variant="h1"
              sx={{ fontSize: { xs: '2.4rem', md: '3.6rem' }, mt: 1, lineHeight: 1.05 }}
            >
              {t('Verde que se siente en casa')}
            </Typography>
            <Typography sx={{ mt: 2.5, mb: 4, maxWidth: 480, fontSize: '1.1rem', opacity: 0.92 }}>
              {t(
                'Plantas de interior, flores frescas y guías digitales para que tu hogar florezca, con todo lo que necesitas para cuidarlas.',
              )}
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                component={RouterLink}
                to="/productos"
                size="large"
                endIcon={<ArrowForward />}
                sx={{ bgcolor: '#f7f3ea', color: '#1f4d38', '&:hover': { bgcolor: '#fff' } }}
              >
                {t('Explorar la tienda')}
              </Button>
              <Button
                component={RouterLink}
                to="/productos?categoria=5"
                size="large"
                variant="outlined"
                sx={{
                  color: '#f7f3ea',
                  borderColor: 'rgba(247,243,234,0.6)',
                  '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.08)' },
                }}
              >
                {t('Ver guías digitales')}
              </Button>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <HeroArt />
          </Grid>
        </Grid>
      </Box>

      {categories.length > 0 && (
        <Box component="section" aria-labelledby="categorias">
          <Typography id="categorias" variant="h4" component="h2" sx={{ mb: 3 }}>
            {t('Compra por categoría')}
          </Typography>
          <Grid container spacing={2.5}>
            {[...categories]
              .sort((a, b) => a.id - b.id)
              .map((category) => (
                <Grid key={category.id} size={{ xs: 6, sm: 4, md: 12 / 5 }}>
                  <Card sx={{ height: '100%' }}>
                    <CardActionArea
                      component={RouterLink}
                      to={`/productos?categoria=${category.id}`}
                      sx={{ height: '100%' }}
                    >
                      <Box sx={{ aspectRatio: '4 / 3', overflow: 'hidden' }}>
                        <ProductImage
                          product={{
                            name: CATEGORY_PHOTO[category.id]?.name ?? category.name,
                            categoryId: category.id,
                            imageUrl: CATEGORY_PHOTO[category.id]
                              ? `/products/${CATEGORY_PHOTO[category.id].photo}.jpg`
                              : null,
                          }}
                        />
                      </Box>
                      <Typography sx={{ fontWeight: 600, p: 1.75, textAlign: 'center' }}>
                        {t(category.name)}
                      </Typography>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </Box>
      )}

      <Box component="section" aria-labelledby="novedades">
        <Stack
          direction="row"
          sx={{ alignItems: 'baseline', justifyContent: 'space-between', mb: 3 }}
        >
          <Typography id="novedades" variant="h4" component="h2">
            {t('Novedades')}
          </Typography>
          <Button component={RouterLink} to="/productos" endIcon={<ArrowForward />}>
            {t('Ver todo')}
          </Button>
        </Stack>
        {error && (
          <Alert severity="warning">{t('No pudimos cargar las novedades ahora mismo.')}</Alert>
        )}
        <Grid container spacing={3}>
          {isLoading &&
            Array.from({ length: 4 }, (_, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                <ProductCardSkeleton />
              </Grid>
            ))}
          {data?.content.map((product) => (
            <Grid key={product.id} size={{ xs: 12, sm: 6, md: 3 }}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box component="section" aria-label={t('Por qué Bloom')}>
        <Grid container spacing={3}>
          {perks.map(([title, text]) => (
            <Grid key={title} size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: 'divider',
                  height: '100%',
                }}
              >
                <Typography variant="h6" component="h3" gutterBottom>
                  {title}
                </Typography>
                <Typography color="text.secondary">{text}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Stack>
  )
}
