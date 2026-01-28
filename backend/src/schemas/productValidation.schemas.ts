import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const createProductSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(3, 'Name must be at least 3 characters long')
            .openapi({ description: 'Name of the product', example: 'Deluxe Pizza' }),
        basePrice: z
            .number()
            .nonnegative('basePrice must be non-negative')
            .openapi({ description: 'Base price of the product', example: 19.99 }),
        description: z.string().trim().optional().default('No Description.').openapi({
            description: 'Description of the product',
            example: 'A delicious deluxe pizza with extra toppings.',
        }),
        sku: z
            .string()
            .trim()
            .min(6, 'SKU must contain 6 characters')
            .toUpperCase()
            .regex(/^[A-Z0-9-]+$/, 'SKU can only contain uppercase letters, numbers, and hyphens')
            .openapi({ description: 'Stock Keeping Unit identifier', example: 'DLX-PZ-001' }),
        slug: z
            .string()
            .trim()
            .min(3, 'Slug must be at least 3 characters long')
            .toLowerCase()
            .regex(/^[a-z0-9-]+$/, 'slug must only contain lowercase letters, numbers and hyphens')
            .openapi({
                description: 'URL-friendly identifier for the product',
                example: 'deluxe-pizza',
            }),
        image: z.string().optional().default('').openapi({
            description: 'URL of the product image',
            example: '/uploads/tmp/1894012-1231-1233-122.jpeg',
        }),
        categoryIds: z
            .array(z.string())
            .transform((ids) => (ids ? Array.from(new Set(ids)) : undefined))
            .optional()
            .openapi({
                description: 'Array of category IDs the product belongs to',
                example: ['cat123', 'cat456'],
            }),
        variants: z
            .array(
                z.object({
                    label: z
                        .string()
                        .trim()
                        .min(1, 'Variant label must contain at least 1 character'),
                    priceModifier: z
                        .number()
                        .nonnegative('priceModifier of variant must be non-negative'),
                    description: z.string().trim().optional().default('No Description.'),
                })
            )
            .refine((variants) => new Set(variants.map((v) => v.label)).size === variants.length, {
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
    })
    .openapi('createProductSchema', {
        title: 'CreateProductInput',
        description: 'Schema for creating a new product',
    })

export const ProductSchema = createProductSchema.extend({
    id: z
        .uuid()
        .openapi({ description: 'Unique identifier for the product', example: 'prod_123456' }),
    createdAt: z.date().openapi({
        description: 'Timestamp when the product was created',
        example: '2023-10-05T14:48:00.000Z',
    }),
    updatedAt: z.date().openapi({
        description: 'Timestamp when the product was last updated',
        example: '2023-10-10T10:20:30.000Z',
    }),
})

export type createProductInput = z.infer<typeof createProductSchema>
export type Product = z.infer<typeof ProductSchema>
