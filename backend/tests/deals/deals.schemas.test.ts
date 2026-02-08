import { describe, it, expect } from 'vitest'
import { createDealSchema } from '../../src/schemas/dealsValidation.schemas'

describe('Create Deal Schema', () => {
    it('name must be at least 3 characters long', () => {
        const res = createDealSchema.safeParse({
            name: 'A',
            slug: 'valid-slug',
            priceModifier: -10,
        })

        expect(res.success).toBe(false)
    })

    it('slug must be a valid slug', () => {
        const res = createDealSchema.safeParse({
            name: 'Valid Name',
            slug: 'Invalid Slug!',
            priceModifier: -10,
        })
        expect(res.success).toBe(false)
    })

    it('startDate must not be past Date', () => {
        const res = createDealSchema.safeParse({
            name: 'Valid Name',
            slug: 'valid-slug',
            priceModifier: -10,
            startDate: '2024-01-01',
        })

        expect(res.success).toBe(false)
    })

    it('endDate must be after startDate', () => {
        const res = createDealSchema.safeParse({
            name: 'Valid Name',
            slug: 'valid-slug',
            priceModifier: -10,
            startDate: new Date(Date.now() + 1000).toISOString(),
            endDate: new Date(Date.now() - 1000).toISOString(),
        })

        const validRes = createDealSchema.safeParse({
            name: 'Valid Name',
            slug: 'valid-slug',
            priceModifier: -10,
            startDate: new Date(Date.now() + 1000).toISOString(),
            endDate: new Date(Date.now() + 2000).toISOString(),
        })

        expect(res.success).toBe(false)
        expect(validRes.success).toBe(true)
    })

    it('items quantity must be greater than 0', () => {
        const res = createDealSchema.safeParse({
            name: 'Valid Name',
            slug: 'valid-slug',
            priceModifier: -10,
            items: [
                {
                    productId: crypto.randomUUID(),
                    quantity: 0,
                },
            ],
        })

        expect(res.success).toBe(false)
    })

    it('items must not contain duplicate productId and productVariantId combinations', () => {
        const productId = crypto.randomUUID()
        const productVariantId = crypto.randomUUID()
        const resWithDuplicates = createDealSchema.safeParse({
            name: 'Valid Name',
            slug: 'valid-slug',
            priceModifier: -10,
            items: [
                {
                    productId,
                    productVariantId,
                    quantity: 2,
                },
                {
                    productId,
                    productVariantId,
                    quantity: 2,
                },
            ],
        })
        expect(resWithDuplicates.success).toBe(false)

        const resWithDuplicateProductId = createDealSchema.safeParse({
            name: 'Valid Name',
            slug: 'valid-slug',
            priceModifier: -10,
            startDate: Date.now().toString(),
            endDate: '2025-4-31',
            items: [
                {
                    productId,
                },
                {
                    productId,
                    quantity: 2,
                },
            ],
        })
        expect(resWithDuplicateProductId.success).toBe(false)
    })

    it('should pass with valid data', () => {
        const res = createDealSchema.safeParse({
            name: 'Valid Name',
            slug: 'valid-slug',
            priceModifier: -10,
            items: [
                {
                    productId: crypto.randomUUID(),
                    productVariantId: crypto.randomUUID(),
                    quantity: 2,
                },
                {
                    productId: crypto.randomUUID(),
                    productVariantId: crypto.randomUUID(),
                    quantity: 2,
                },
            ],
        })
        expect(res.success).toBe(true)
    })
})
