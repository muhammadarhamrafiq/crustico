import * as z from 'zod'

export const createProductSchema = z.object({
    name: z.string().trim().min(3, 'Name must be at least 3 characters long'),
    basePrice: z.number().nonnegative('basePrice must be non-negative'),
    description: z.string().trim().optional().default('No Description.'),
    sku: z
        .string()
        .trim()
        .min(6, 'SKU must contain 6 characters')
        .toUpperCase()
        .regex(/^[A-Z0-9-]+$/, 'SKU can only contain uppercase letters, numbers, and hyphens'),
    slug: z
        .string()
        .trim()
        .min(3, 'Slug must be at least 3 characters long')
        .toLowerCase()
        .regex(/^[a-z0-9-]+$/, 'slug must only contain lowercase letters, numbers and hyphens'),
    image: z.url().optional().default(''),
    categoryIds: z
        .array(z.string())
        .transform((ids) => (ids ? Array.from(new Set(ids)) : undefined))
        .optional(),
    variants: z
        .array(
            z.object({
                label: z.string().trim().min(1, 'Variant label must contain at least 1 character'),
                priceModifier: z
                    .number()
                    .nonnegative('priceModifier of variant must be non-negative'),
                description: z.string().trim().optional().default('No Description.'),
            })
        )
        .refine((variants) => new Set(variants.map((v) => v.label)).size === variants.length, {
            message: 'Variant labels must be unique',
        })
        .optional(),
})

export type createProductInput = z.infer<typeof createProductSchema>
