import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

const productVariantSchema = z.object({
    label: z.string().trim().min(1, 'Variant label must contain at least 1 character'),
    priceModifier: z.number().nonnegative('priceModifier of variant must be non-negative'),
    description: z.string().trim().optional().default('No Description.'),
})

const nameSchema = z.string().trim().min(3, 'Name must be at least 3 characters long')

const skuSchema = z
    .string()
    .trim()
    .min(6, 'SKU must contain 6 characters')
    .toUpperCase()
    .regex(/^[A-Z0-9-]+$/, 'SKU can only contain uppercase letters, numbers, and hyphens')

const slugSchema = z
    .string()
    .trim()
    .min(3, 'Slug must be at least 3 characters long')
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')

const basePriceSchema = z.number().nonnegative('basePrice must be non-negative')
const descriptionSchema = z.string().trim().optional().default('No Description.')
const imageSchema = z.string().trim().optional().default('')
const categoryIdsSchema = z
    .array(z.uuid())
    .transform((ids) => (ids ? Array.from(new Set(ids)) : undefined))

const uniqueBy = <T>(items: T[], selector: (item: T) => string) =>
    new Set(items.map(selector)).size === items.length

const productSchema = z.object({
    id: z.uuid(),
    name: nameSchema.openapi({ description: 'Name of the product', example: 'Deluxe Pizza' }),
    basePrice: basePriceSchema.openapi({
        description: 'Base price of the product',
        example: 19.99,
    }),
    description: descriptionSchema.openapi({
        description: 'Description of the product',
        example: 'A delicious deluxe pizza with extra toppings.',
    }),
    sku: skuSchema.openapi({ description: 'Stock Keeping Unit identifier', example: 'DLX-PZ-001' }),
    slug: slugSchema.openapi({
        description: 'URL-friendly identifier for the product',
        example: 'deluxe-pizza',
    }),
    image: imageSchema.openapi({
        description: 'URL of the product image',
        example: '/uploads/tmp/1894012-1231-1233-122.jpeg',
    }),
    categoryIds: categoryIdsSchema.optional().openapi({
        description: 'Array of category IDs the product belongs to',
        example: ['123da32c1c1d-23s2-3a4f', '3f232cf21231d-22a2-33c1'],
    }),
    variants: z
        .array(productVariantSchema)
        .refine((variants) => uniqueBy(variants, (v) => v.label), {
            message: 'Variant labels must be unique',
        })
        .optional()
        .openapi({
            description: 'Array of product variants',
            example: [
                {
                    label: 'Large Size',
                    priceModifier: 5.0,
                    description: 'Large size with extra toppings',
                },
                {
                    label: 'Extra Cheese',
                    priceModifier: 2.0,
                    description: 'Add extra cheese to your pizza',
                },
            ],
        }),
    createdAt: z.date().openapi({
        description: 'Timestamp when the product was created',
        example: '2023-10-05T14:48:00.000Z',
    }),
    updatedAt: z.date().openapi({
        description: 'Timestamp when the product was last updated',
        example: '2023-10-10T10:20:30.000Z',
    }),
})

export const createProductSchema = productSchema
    .omit({ id: true, createdAt: true, updatedAt: true })
    .strict()
    .openapi('createProductSchema', {
        title: 'CreateProductInput',
        description: 'Schema for creating a new product',
    })

export const updateProductSchema = productSchema
    .partial()
    .pick({
        name: true,
        slug: true,
        sku: true,
        basePrice: true,
    })
    .extend({
        description: z.string().trim().optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
        message: 'Should contain atleast one field to update',
    })
    .openapi('updateProductSchema', {
        title: 'UpdateProductInput',
        description: 'Schema for updating an existing product data',
    })

export const addProductCategoriesSchema = z
    .object({
        categoryIds: categoryIdsSchema
            .refine((ids) => (ids?.length ?? 0) > 0, {
                message: 'categoryIds array must contain at least one category ID',
            })
            .openapi({
                description: 'Array of unique category IDs to add to the product',
                example: ['123da32c1c1d-23s2-3a4f', '3f232cf21231d-22a2-33c1'],
            }),
    })
    .openapi('addProductCategoriesSchema')

export const addProductVariantsSchema = z
    .object({
        variants: z
            .array(productVariantSchema)
            .refine((variants) => uniqueBy(variants, (v) => v.label), {
                message: 'Variant labels must be unique',
            })
            .refine((variants) => variants.length > 0, {
                message: 'variants array must contain at least one variant',
            })
            .openapi({
                description: 'Array of product variants to add',
                example: [
                    {
                        label: 'Medium Size',
                        priceModifier: 3.0,
                        description: 'Medium size with standard toppings',
                    },
                ],
            }),
    })
    .openapi('addProductVariantsSchema')

export const updateVariantSchema = z
    .object({
        label: z
            .string()
            .trim()
            .min(1, 'Variant label must contain at least 1 character')
            .optional(),
        priceModifier: z
            .number()
            .nonnegative('priceModifier of variant must be non-negative')
            .optional(),
        description: z.string().trim().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: 'Should contain atleast one field to update',
    })
    .openapi('updateVariantSchema')
export const removeCategoryFromProductSchema = z.object({
    id: z.uuid('Product Id must be valid UUID'),
    categoryId: z.uuid('Category Id must be valid UUID'),
})

export type addProductCategoriesSchemaInput = z.infer<typeof addProductCategoriesSchema>
export type createProductInput = z.infer<typeof createProductSchema>
export type updateProductInput = z.infer<typeof updateProductSchema>
export type Product = z.infer<typeof productSchema>

// Response Schemas
export const CreateProductResponseSchema = z.object({
    status: z.number().openapi({ example: 201 }),
    success: z.boolean().openapi({ example: true }),
    message: z.string().openapi({ example: 'Product created successfully' }),
    data: productSchema.omit({ categoryIds: true, variants: true }),
})
export const UpdateProductResponseSchema = z.object({
    status: z.number().openapi({ example: 200 }),
    success: z.boolean().openapi({ example: true }),
    message: z.string().openapi({ example: 'Product updated successfully' }),
    data: productSchema.omit({ categoryIds: true, variants: true }),
})
