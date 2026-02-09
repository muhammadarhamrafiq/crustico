import { describe, it, expect } from 'vitest'
import { createDealSchema, updateDealSchema } from '../../src/schemas/dealsValidation.schemas'

describe('Create Deal Schema', () => {
    it('name must be at least 3 characters long', () => {
        const res = createDealSchema.safeParse({
            name: 'A',
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

        expect(res.success).toBe(false)
    })

    it('slug must be a valid slug', () => {
        const res = createDealSchema.safeParse({
            name: 'Valid Name',
            slug: 'Invalid Slug!',
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
        expect(res.success).toBe(false)
    })

    it('startDate must not be past Date', () => {
        const res = createDealSchema.safeParse({
            name: 'Valid Name',
            slug: 'valid-slug',
            priceModifier: -10,
            startDate: '2024-01-01',
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

        expect(res.success).toBe(false)
    })

    it('endDate must be after startDate', () => {
        const res = createDealSchema.safeParse({
            name: 'Valid Name',
            slug: 'valid-slug',
            priceModifier: -10,
            startDate: new Date(Date.now()).toISOString(),
            endDate: new Date(Date.now()).toISOString(),
        })

        const validRes = createDealSchema.safeParse({
            name: 'Valid Name',
            slug: 'valid-slug',
            priceModifier: -10,
            startDate: new Date(Date.now() + 1000).toISOString(),
            endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
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

describe('Update Deal Schema', () => {
    it('should invalidate the empty object', () => {
        const res = updateDealSchema.safeParse({})

        expect(res.success).toBe(false)
    })

    it('should be able to validate the start and end date', () => {
        const res = updateDealSchema.safeParse({
            name: 'Test Deal',
            slug: 'test-deal',
            description: 'Deal for testing',
            priceModifier: -90,
            startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now()),
        })

        expect(res.success).toBe(false)
    })

    it('should accept the partial data', () => {
        const res = updateDealSchema.safeParse({
            slug: 'test-deal',
        })

        expect(res.success).toBe(true)
    })
})
