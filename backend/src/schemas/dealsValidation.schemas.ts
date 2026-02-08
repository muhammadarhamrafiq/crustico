import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

const dealItemSchema = z.object({
    productId: z.string().trim(),
    productVariantId: z.string().trim().optional(),
    quantity: z.number().int().positive().optional().default(1),
})

export const createDealSchema = z.object({
    name: z.string().trim().min(3, 'Name must contain at least 3 characters'),
    slug: z
        .string()
        .trim()
        .toLowerCase()
        .regex(/^[a-z0-9-]+$/, 'slug must only contain lowercase letters, numbers and hyphens'),
    description: z
        .string()
        .trim()
        .min(10, 'Description must contain at least 10 characters')
        .optional()
        .default('No Description'),
    startDate: z
        .string()
        .refine((date) => {
            if (!date) return true
            if (!Date.parse(date)) return false
            const now = new Date()
            const startDate = new Date(date)
            return startDate >= now
        }, 'Start date must be a valid date int the future')
        .optional()
        .default(() => new Date(Date.now()).toISOString()),
    endDate: z
        .string()
        .nullable()
        .refine((date) => {
            if (!date) return true
            if (!Date.parse(date)) return false
            const endDate = new Date(date)
            const now = new Date()
            return endDate > now
        }, 'End date must be a valid date in the future')
        .default(null),
    priceModifier: z.number(),
    items: z
        .array(dealItemSchema)
        .refine((items) => {
            if (!items) return true
            return (
                new Set(
                    items.map((item) => `${item.productId}-${item.productVariantId || 'default'}`)
                ).size === items.length
            )
        })
        .optional(),
})
