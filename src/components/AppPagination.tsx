import { Box, Pagination } from '@mui/material'

interface Props {
  count: number
  /** Base 1. */
  page: number
  onChange: (page: number) => void
  label: string
}

const LABELS = {
  first: 'Primera página',
  last: 'Última página',
  next: 'Página siguiente',
  previous: 'Página anterior',
  'start-ellipsis': 'Más páginas',
  'end-ellipsis': 'Más páginas',
} as const

/** Paginador centrado con las etiquetas accesibles en español. */
export function AppPagination({ count, page, onChange, label }: Props) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Pagination
        count={count}
        page={page}
        onChange={(_event, next) => onChange(next)}
        color="primary"
        aria-label={label}
        getItemAriaLabel={(type, itemPage, selected) => {
          if (type === 'page') return selected ? `Página ${itemPage}` : `Ir a la página ${itemPage}`
          return LABELS[type]
        }}
      />
    </Box>
  )
}
