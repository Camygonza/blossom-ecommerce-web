import { Box, Pagination } from '@mui/material'
import { useT } from '@/i18n/i18n'

interface Props {
  count: number
  /** Base 1. */
  page: number
  onChange: (page: number) => void
  label: string
}

/** Paginador centrado con las etiquetas accesibles en el idioma activo. */
export function AppPagination({ count, page, onChange, label }: Props) {
  const t = useT()
  const labels = {
    first: t('Primera página'),
    last: t('Última página'),
    next: t('Página siguiente'),
    previous: t('Página anterior'),
    'start-ellipsis': t('Más páginas'),
    'end-ellipsis': t('Más páginas'),
  } as const
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Pagination
        count={count}
        page={page}
        onChange={(_event, next) => onChange(next)}
        color="primary"
        aria-label={label}
        getItemAriaLabel={(type, itemPage, selected) => {
          if (type === 'page')
            return selected
              ? t('Página {page}', { page: itemPage ?? 0 })
              : t('Ir a la página {page}', { page: itemPage ?? 0 })
          return labels[type]
        }}
      />
    </Box>
  )
}
