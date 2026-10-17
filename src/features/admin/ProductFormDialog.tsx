import { zodResolver } from '@hookform/resolvers/zod'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material'
import { useMemo, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import {
  useCreateProductMutation,
  useGetCategoriesQuery,
  useUpdateProductMutation,
} from '@/api/api'
import { errorMessage } from '@/api/errors'
import type { Product } from '@/api/types'
import { useAppDispatch } from '@/app/hooks'
import { toastShown } from '@/features/ui/uiSlice'
import {
  emptyProductForm,
  productFormSchema,
  toFormValues,
  toProductInput,
  type ProductFormValues,
} from './productSchema'

interface Props {
  /** Sin producto = alta nueva. */
  product?: Product
  onClose: () => void
}

export function ProductFormDialog({ product, onClose }: Props) {
  const editing = Boolean(product)
  const dispatch = useAppDispatch()
  const { data: categories = [] } = useGetCategoriesQuery()
  const [createProduct, { isLoading: creating }] = useCreateProductMutation()
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation()
  const [serverError, setServerError] = useState<string | null>(null)
  const schema = useMemo(() => productFormSchema(editing), [editing])

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: product ? toFormValues(product) : emptyProductForm,
  })
  const type = useWatch({ control, name: 'type' })

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null)
    try {
      if (product) {
        await updateProduct({
          id: product.id,
          data: toProductInput(values, product.version),
        }).unwrap()
        dispatch(toastShown(`«${values.name}» actualizado`, 'success'))
      } else {
        await createProduct(toProductInput(values)).unwrap()
        dispatch(toastShown(`«${values.name}» creado`, 'success'))
      }
      onClose()
    } catch (error) {
      setServerError(errorMessage(error, 'No pudimos guardar el producto.'))
    }
  })

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm" aria-labelledby="product-form-title">
      <form onSubmit={onSubmit} noValidate>
        <DialogTitle id="product-form-title">
          {editing ? 'Editar producto' : 'Nuevo producto'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            {serverError && <Alert severity="error">{serverError}</Alert>}
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label="Tipo"
                  {...field}
                  disabled={editing}
                  helperText={editing ? 'El tipo no se puede cambiar' : undefined}
                >
                  <MenuItem value="PHYSICAL">Físico (con stock y peso)</MenuItem>
                  <MenuItem value="DIGITAL">Digital (descargable)</MenuItem>
                </TextField>
              )}
            />
            <TextField
              label="Nombre"
              {...register('name')}
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
            />
            <TextField
              label="Descripción"
              multiline
              minRows={2}
              {...register('description')}
              error={Boolean(errors.description)}
              helperText={errors.description?.message}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Precio"
                type="number"
                fullWidth
                {...register('price')}
                error={Boolean(errors.price)}
                helperText={errors.price?.message}
                slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
              />
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <TextField
                    select
                    label="Categoría"
                    fullWidth
                    {...field}
                    error={Boolean(errors.categoryId)}
                    helperText={errors.categoryId?.message}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Stack>
            <TextField
              label="URL de la imagen"
              {...register('imageUrl')}
              error={Boolean(errors.imageUrl)}
              helperText={errors.imageUrl?.message}
            />

            {type === 'PHYSICAL' ? (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Stock"
                  type="number"
                  fullWidth
                  {...register('stock')}
                  error={Boolean(errors.stock)}
                  helperText={errors.stock?.message}
                  slotProps={{ htmlInput: { min: 0 } }}
                />
                <TextField
                  label="Peso (gramos)"
                  type="number"
                  fullWidth
                  {...register('weightGrams')}
                  error={Boolean(errors.weightGrams)}
                  helperText={errors.weightGrams?.message}
                  slotProps={{ htmlInput: { min: 0 } }}
                />
              </Stack>
            ) : (
              <>
                <TextField
                  label="URL de descarga"
                  {...register('downloadUrl')}
                  error={Boolean(errors.downloadUrl)}
                  helperText={
                    errors.downloadUrl?.message ??
                    (editing ? 'Déjala vacía para conservar la actual' : undefined)
                  }
                />
                <Controller
                  name="licenseType"
                  control={control}
                  render={({ field }) => (
                    <TextField select label="Licencia" {...field}>
                      <MenuItem value="PERSONAL">Personal</MenuItem>
                      <MenuItem value="COMMERCIAL">Comercial</MenuItem>
                    </TextField>
                  )}
                />
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={creating || updating}>
            {editing ? 'Guardar cambios' : 'Crear producto'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
