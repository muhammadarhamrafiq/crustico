import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

const dealItemSchema = z.object({
    productId: z.string().trim(),
    productVariantId: z.string().trim().nullable().default(null),
    quantity: z.number().int().positive().optional().default(1),
})

export const createDealSchema = z
    .object({
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
                const now = new Date().setHours(0, 0, 0, 0)
                const startDate = new Date(date).setHours(0, 0, 0, 0)
                return startDate >= now
            }, 'Start date must be a valid date int the future')
            .transform((date) => (date ? new Date(date).toISOString() : null))
            .optional()
            .default(() => new Date(Date.now()).toISOString()),
        endDate: z
            .string()
            .nullable()
            .refine((date) => {
                if (!date) return true
                if (!Date.parse(date)) return false
                const endDate = new Date(date).setHours(0, 0, 0, 0)
                const now = new Date().setHours(0, 0, 0, 0)
                return endDate > now
            }, 'End date must be a valid date in the future')
            .transform((date) => (date ? new Date(date).toISOString() : null))
            .default(null),
        priceModifier: z.number(),
        items: z.array(dealItemSchema).refine(
            (items) => {
                if (!items) return false
                return (
                    new Set(
                        items.map(
                            (item) => `${item.productId}-${item.productVariantId || 'default'}`
                        )
                    ).size === items.length
                )
            },
            {
                message: 'Deal should contain unique items',
            }
        ),
    })
    .refine(
        (data) => {
            if (data.endDate && data.startDate) {
                return new Date(data.endDate) > new Date(data.startDate)
            }
            return true
        },
        {
            message: 'End date must be after start date',
        }
    )

export type createDealInput = z.infer<typeof createDealSchema>
