import AddIcon from '@mui/icons-material/Add'
import DeleteOutline from '@mui/icons-material/DeleteOutlined'
import EditOutlined from '@mui/icons-material/EditOutlined'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useDeleteProductMutation, useGetProductsQuery } from '@/api/api'
import { errorMessage } from '@/api/errors'
import type { Product } from '@/api/types'
import { useAppDispatch } from '@/app/hooks'
import { AppPagination } from '@/components/AppPagination'
import { EmptyState } from '@/components/EmptyState'
import { toastShown } from '@/features/ui/uiSlice'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useT } from '@/i18n/i18n'
import { formatMoney } from '@/lib/format'
import { ProductFormDialog } from './ProductFormDialog'

const PAGE_SIZE = 10

export function AdminProductsPage() {
  const t = useT()
  const dispatch = useAppDispatch()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const name = useDebouncedValue(search.trim())
  const { data, error, isLoading, refetch } = useGetProductsQuery({
    name: name || undefined,
    page: page - 1,
    size: PAGE_SIZE,
    sort: 'id,asc',
  })
  const [deleteProduct, { isLoading: deleting }] = useDeleteProductMutation()
  const [editing, setEditing] = useState<Product | 'new' | null>(null)
  const [toDelete, setToDelete] = useState<Product | null>(null)

  const confirmDelete = async () => {
    if (!toDelete) return
    try {
      await deleteProduct(toDelete.id).unwrap()
      dispatch(toastShown(t('«{name}» eliminado', { name: toDelete.name }), 'success'))
    } catch (err) {
      dispatch(toastShown(errorMessage(err, t('No pudimos eliminar el producto.'), t), 'error'))
    } finally {
      setToDelete(null)
    }
  }

  return (
    <Stack spacing={3}>
      <Stack
        direction="row"
        sx={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}
      >
        <Typography variant="h3" component="h1">
          {t('Productos')}
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setEditing('new')}>
          {t('Nuevo producto')}
        </Button>
      </Stack>

      <TextField
        label={t('Buscar producto')}
        type="search"
        size="small"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setPage(1)
        }}
        sx={{ maxWidth: 360 }}
      />

      {error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              {t('Reintentar')}
            </Button>
          }
        >
          {errorMessage(error, t('No pudimos cargar los productos.'), t)}
        </Alert>
      )}
      {isLoading && (
        <Skeleton variant="rounded" height={320} aria-label={t('Cargando productos')} />
      )}
      {data && data.content.length === 0 && (
        <EmptyState
          title={t('Sin resultados')}
          description={t('No hay productos con ese nombre.')}
        />
      )}

      {data && data.content.length > 0 && (
        <>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small" aria-label={t('Productos')}>
              <TableHead>
                <TableRow>
                  <TableCell>{t('Nombre')}</TableCell>
                  <TableCell>{t('Categoría')}</TableCell>
                  <TableCell>{t('Tipo')}</TableCell>
                  <TableCell align="right">{t('Precio')}</TableCell>
                  <TableCell align="right">{t('Stock')}</TableCell>
                  <TableCell align="right">{t('Acciones')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.content.map((product) => (
                  <TableRow key={product.id} hover>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category.name}</TableCell>
                    <TableCell>
                      {product.type === 'PHYSICAL' ? t('Físico') : t('Digital')}
                    </TableCell>
                    <TableCell align="right">{formatMoney(product.price)}</TableCell>
                    <TableCell align="right">
                      {product.type === 'PHYSICAL' ? product.stock : '—'}
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <IconButton
                        aria-label={t('Editar {name}', { name: product.name })}
                        onClick={() => setEditing(product)}
                      >
                        <EditOutlined />
                      </IconButton>
                      <IconButton
                        aria-label={t('Eliminar {name}', { name: product.name })}
                        onClick={() => setToDelete(product)}
                      >
                        <DeleteOutline />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {data.totalPages > 1 && (
            <AppPagination
              count={data.totalPages}
              page={page}
              onChange={(next) => setPage(next)}
              label={t('Paginación de productos')}
            />
          )}
        </>
      )}

      {editing && (
        <ProductFormDialog
          product={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
        />
      )}

      <Dialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        aria-labelledby="delete-title"
      >
        <DialogTitle id="delete-title">
          {t('¿Eliminar «{name}»?', { name: toDelete?.name ?? '' })}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t(
              'Si el producto ya figura en órdenes no se puede eliminar. Esta acción no se puede deshacer.',
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setToDelete(null)}>{t('Cancelar')}</Button>
          <Button color="error" onClick={confirmDelete} disabled={deleting}>
            {t('Eliminar')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
