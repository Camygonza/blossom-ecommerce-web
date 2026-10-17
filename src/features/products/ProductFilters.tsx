import { Button, MenuItem, Paper, TextField } from '@mui/material'
import Grid from '@mui/material/Grid'
import { useEffect, useState } from 'react'
import { useGetCategoriesQuery } from '@/api/api'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { SORT_OPTIONS, type FilterValues } from './useProductFilters'

interface Props {
  filters: FilterValues
  onChange: (patch: Partial<FilterValues>) => void
  onReset: () => void
  canReset: boolean
}

export function ProductFilters({ filters, onChange, onReset, canReset }: Props) {
  const { data: categories = [] } = useGetCategoriesQuery()

  // los campos de texto se escriben en local y se envían a la URL con debounce
  const [name, setName] = useState(filters.name)
  const [minPrice, setMinPrice] = useState(filters.minPrice)
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice)
  const debounced = useDebouncedValue({ name, minPrice, maxPrice })

  useEffect(() => {
    if (
      debounced.name !== filters.name ||
      debounced.minPrice !== filters.minPrice ||
      debounced.maxPrice !== filters.maxPrice
    ) {
      onChange(debounced)
    }
    // solo reacciona a lo que escribe el usuario
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  // «Limpiar filtros» desde fuera vacía también los campos locales
  useEffect(() => {
    setName(filters.name)
    setMinPrice(filters.minPrice)
    setMaxPrice(filters.maxPrice)
  }, [filters.name, filters.minPrice, filters.maxPrice])

  return (
    <Paper
      variant="outlined"
      component="form"
      role="search"
      aria-label="Filtros de productos"
      sx={{ p: 2 }}
      onSubmit={(e) => e.preventDefault()}
    >
      <Grid container spacing={2} sx={{ alignItems: 'center' }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            label="Buscar por nombre"
            type="search"
            size="small"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
          <TextField
            select
            label="Categoría"
            size="small"
            fullWidth
            value={categories.length ? filters.categoryId : ''}
            onChange={(e) => onChange({ categoryId: e.target.value })}
          >
            <MenuItem value="">Todas</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} value={String(category.id)}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 6, sm: 3, md: 1.5 }}>
          <TextField
            label="Precio mín."
            type="number"
            size="small"
            fullWidth
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            slotProps={{ htmlInput: { min: 0, step: 'any' } }}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3, md: 1.5 }}>
          <TextField
            label="Precio máx."
            type="number"
            size="small"
            fullWidth
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            slotProps={{ htmlInput: { min: 0, step: 'any' } }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 8, md: 2.5 }}>
          <TextField
            select
            label="Ordenar por"
            size="small"
            fullWidth
            value={filters.sort}
            onChange={(e) => onChange({ sort: e.target.value as FilterValues['sort'] })}
          >
            {SORT_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4, md: 1 }}>
          <Button onClick={onReset} disabled={!canReset} fullWidth>
            Limpiar
          </Button>
        </Grid>
      </Grid>
    </Paper>
  )
}
