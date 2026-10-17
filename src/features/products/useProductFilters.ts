import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { ProductSearchParams, ProductSort } from '@/api/types'

export const PAGE_SIZE = 12

export const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: 'id,asc', label: 'Destacados' },
  { value: 'createdAt,desc', label: 'Más recientes' },
  { value: 'price,asc', label: 'Precio: menor a mayor' },
  { value: 'price,desc', label: 'Precio: mayor a menor' },
  { value: 'name,asc', label: 'Nombre (A–Z)' },
]

export interface FilterValues {
  name: string
  categoryId: string
  minPrice: string
  maxPrice: string
  sort: ProductSort
  /** Base 1 en la URL. */
  page: number
}

const isSort = (value: string | null): value is ProductSort =>
  SORT_OPTIONS.some((option) => option.value === value)

const toNumber = (value: string): number | undefined => {
  if (value.trim() === '') return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined
}

/** La URL es la fuente de verdad de los filtros: se pueden compartir y el botón «atrás» funciona. */
export function useProductFilters() {
  const [params, setParams] = useSearchParams()

  const filters = useMemo<FilterValues>(() => {
    const sort = params.get('orden')
    const page = Number(params.get('pagina'))
    return {
      name: params.get('q') ?? '',
      categoryId: params.get('categoria') ?? '',
      minPrice: params.get('min') ?? '',
      maxPrice: params.get('max') ?? '',
      sort: isSort(sort) ? sort : 'id,asc',
      page: Number.isInteger(page) && page > 0 ? page : 1,
    }
  }, [params])

  const update = useCallback(
    (patch: Partial<FilterValues>) => {
      const next: FilterValues = { ...filters, ...patch }
      // cualquier cambio de filtro (salvo la propia página) vuelve a la primera página
      if (!('page' in patch)) next.page = 1
      const search = new URLSearchParams()
      if (next.name.trim()) search.set('q', next.name.trim())
      if (next.categoryId) search.set('categoria', next.categoryId)
      if (next.minPrice) search.set('min', next.minPrice)
      if (next.maxPrice) search.set('max', next.maxPrice)
      if (next.sort !== 'id,asc') search.set('orden', next.sort)
      if (next.page > 1) search.set('pagina', String(next.page))
      setParams(search, { replace: true })
    },
    [filters, setParams],
  )

  const reset = useCallback(() => setParams(new URLSearchParams(), { replace: true }), [setParams])

  const query = useMemo<ProductSearchParams>(
    () => ({
      name: filters.name.trim() || undefined,
      categoryId: filters.categoryId ? Number(filters.categoryId) : undefined,
      minPrice: toNumber(filters.minPrice),
      maxPrice: toNumber(filters.maxPrice),
      sort: filters.sort,
      page: filters.page - 1,
      size: PAGE_SIZE,
    }),
    [filters],
  )

  const hasActiveFilters = Boolean(
    filters.name.trim() || filters.categoryId || filters.minPrice || filters.maxPrice,
  )

  return { filters, query, update, reset, hasActiveFilters }
}
