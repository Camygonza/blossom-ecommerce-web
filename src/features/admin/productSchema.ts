import { z } from 'zod'
import type { Product, ProductInput } from '@/api/types'

const wholeNumber = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `Ingresa ${label}`)
    .refine((v) => /^\d+$/.test(v), `${label} debe ser un número entero`)

/** Los campos numéricos viajan como texto en el formulario y se convierten al enviar. */
export const productFormSchema = (editing: boolean) =>
  z
    .object({
      type: z.enum(['PHYSICAL', 'DIGITAL']),
      name: z.string().trim().min(1, 'Ingresa el nombre').max(255, 'Máximo 255 caracteres'),
      description: z.string().max(2000, 'Máximo 2000 caracteres'),
      price: z
        .string()
        .trim()
        .min(1, 'Ingresa el precio')
        .refine((v) => Number.isFinite(Number(v)) && Number(v) >= 0, 'Precio no válido')
        .refine((v) => Number(v) <= 1_000_000, 'El máximo es 1 000 000')
        .refine((v) => /^\d+(\.\d{1,2})?$/.test(v), 'Usa hasta 2 decimales'),
      imageUrl: z.string().trim().max(500, 'Máximo 500 caracteres'),
      categoryId: z.string().min(1, 'Elige una categoría'),
      stock: z.string(),
      weightGrams: z.string(),
      downloadUrl: z.string().trim().max(500, 'Máximo 500 caracteres'),
      licenseType: z.enum(['PERSONAL', 'COMMERCIAL']),
    })
    .superRefine((value, ctx) => {
      if (value.type === 'PHYSICAL') {
        for (const [field, label] of [
          ['stock', 'el stock'],
          ['weightGrams', 'el peso en gramos'],
        ] as const) {
          const result = wholeNumber(label).safeParse(value[field])
          if (!result.success) {
            ctx.addIssue({ code: 'custom', path: [field], message: result.error.issues[0].message })
          }
        }
      } else if (!editing && !value.downloadUrl) {
        ctx.addIssue({
          code: 'custom',
          path: ['downloadUrl'],
          message: 'Ingresa la URL de descarga',
        })
      }
    })

export type ProductFormValues = z.infer<ReturnType<typeof productFormSchema>>

export const emptyProductForm: ProductFormValues = {
  type: 'PHYSICAL',
  name: '',
  description: '',
  price: '',
  imageUrl: '',
  categoryId: '',
  stock: '0',
  weightGrams: '0',
  downloadUrl: '',
  licenseType: 'PERSONAL',
}

export function toFormValues(product: Product): ProductFormValues {
  return {
    type: product.type,
    name: product.name,
    description: product.description ?? '',
    price: String(product.price),
    imageUrl: product.imageUrl ?? '',
    categoryId: String(product.category.id),
    stock: String(product.stock ?? 0),
    weightGrams: String(product.weightGrams ?? 0),
    // el api no expone la URL de descarga: vacío al editar significa «conservar la actual»
    downloadUrl: '',
    licenseType: product.licenseType ?? 'PERSONAL',
  }
}

export function toProductInput(values: ProductFormValues, version?: number): ProductInput {
  const base: ProductInput = {
    type: values.type,
    name: values.name,
    description: values.description || undefined,
    price: Number(values.price),
    imageUrl: values.imageUrl || undefined,
    categoryId: Number(values.categoryId),
    version,
  }
  return values.type === 'PHYSICAL'
    ? { ...base, stock: Number(values.stock), weightGrams: Number(values.weightGrams) }
    : { ...base, downloadUrl: values.downloadUrl || undefined, licenseType: values.licenseType }
}
