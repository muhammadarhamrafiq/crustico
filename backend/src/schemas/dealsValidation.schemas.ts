import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

const dealItemSchema = z.object({
    productId: z.string().trim(),
    productVariantId: z.string().trim().nullable().default(null),
    quantity: z.number().int().positive().optional().default(1),
})

const nameSchema = z.string().trim().min(3, 'Name must contain at least 3 characters')
const slugSchema = z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, 'slug must only contain lowercase letters, numbers and hyphens')
const descriptionSchema = z
    .string()
    .trim()
    .min(10, 'Description must contain at least 10 characters')
    .optional()
const startDateSchema = z
    .string()
    .refine((date) => {
        if (!date) return true
        if (!Date.parse(date)) return false
        const now = new Date().setHours(0, 0, 0, 0)
        const startDate = new Date(date).setHours(0, 0, 0, 0)
        return startDate >= now
    }, 'Start date must be a valid date int the future')
    .transform((date) => (date ? new Date(date).toISOString() : null))

const endDateSchema = z
    .string()
    .refine((date) => {
        if (!date) return true
        if (!Date.parse(date)) return false
        const endDate = new Date(date).setHours(0, 0, 0, 0)
        const now = new Date().setHours(0, 0, 0, 0)
        return endDate > now
    }, 'End date must be a valid date in the future')
    .transform((date) => (date ? new Date(date).toISOString() : null))

const itemsSchema = z.array(dealItemSchema).refine(
    (items) => {
        if (!items) return false
        return (
            new Set(items.map((item) => `${item.productId}-${item.productVariantId || 'default'}`))
                .size === items.length
        )
    },
    {
        message: 'Deal should contain unique items',
    }
)

export const createDealSchema = z
    .object({
        name: nameSchema,
        slug: slugSchema,
        description: descriptionSchema.default('No Description'),
        startDate: startDateSchema.optional().default(() => new Date(Date.now()).toISOString()),
        endDate: endDateSchema.nullable().default(null),
        priceModifier: z.number(),
        items: itemsSchema,
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
    .openapi({
        example: {
            name: 'Big Mac Combo Deal',
            slug: 'big-mac-combo-deal',
            description:
                'Get a Big Mac, Medium Fries, and Medium Coke for just $7.99 - Save $2.50!',
            startDate: '2026-02-08',
            endDate: '2026-03-08',
            priceModifier: 0.25,
            items: [
                {
                    productId: 'prod_bigmac',
                    productVariantId: 'variant_regular',
                    quantity: 1,
                },
                {
                    productId: 'prod_fries',
                    productVariantId: 'variant_medium',
                    quantity: 1,
                },
                {
                    productId: 'prod_coke',
                    productVariantId: 'variant_medium',
                    quantity: 1,
                },
            ],
        },
    })

export const updateDealSchema = z
    .object({
        name: nameSchema,
        priceModifier: z.number(),
        description: descriptionSchema,
        slug: slugSchema,
        startDate: startDateSchema,
        endDate: endDateSchema,
    })
    .partial()
    .refine((data) => {
        if (Object.keys(data).length === 0) return false
        if (data.startDate && data.endDate) {
            return new Date(data.startDate) < new Date(data.endDate)
        }
        return true
    })

export type createDealInput = z.infer<typeof createDealSchema>
export type updateDealInput = z.infer<typeof updateDealSchema>

export const createDealResponseSchema = z.object({
    status: z.number().openapi({ example: 201 }),
    message: z.string().openapi({ example: 'Deal created successfully' }),
    data: z.object().openapi({
        example: {
            id: 'deal_12345',
            name: 'Big Mac Combo Deal',
            slug: 'big-mac-combo-deal',
            description:
                'Get a Big Mac, Medium Fries, and Medium Coke for just $7.99 - Save $2.50!',
            startDate: '2026-02-08T00:00:00.000Z',
            endDate: '2026-03-08T00:00:00.000Z',
            priceModifier: 0.25,
        },
    }),
})
export const updateDealResponseSchema = z.object({
    status: z.number().openapi({ example: 200 }),
    message: z.string().openapi({ example: 'Deal updated successfully' }),
    data: z.object().openapi({
        example: {
            id: 'deal_12345',
            name: 'Big Mac Combo Deal',
            slug: 'big-mac-combo-deal',
            description:
                'Get a Big Mac, Medium Fries, and Medium Coke for just $7.99 - Save $2.50!',
            startDate: '2026-02-08T00:00:00.000Z',
            endDate: '2026-03-08T00:00:00.000Z',
            priceModifier: 0.25,
        },
    }),
})
