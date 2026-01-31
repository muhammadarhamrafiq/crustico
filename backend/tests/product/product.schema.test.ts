import { describe, it, expect } from 'vitest'
import { createProductSchema } from '../../src/schemas/productValidation.schemas'

describe('createProductSchema', () => {
    // ✅ Happy path
    it('accepts valid product input', () => {
        const validProduct = {
            name: 'Deluxe Pizza',
            basePrice: 19.99,
            description: 'A delicious deluxe pizza with extra toppings.',
            sku: 'DLX-PZ-001',
            slug: 'deluxe-pizza',
            image: '/uploads/tmp/1894012-1231-1233-122.jpeg',
            categoryIds: ['cat123', 'cat456'],
            variants: [
                {
                    label: 'Large Size',
                    priceModifier: 5,
                    description: 'Large size with extra toppings',
                },
                {
                    label: 'Extra Cheese',
                    priceModifier: 2,
                    description: 'Add extra cheese to your pizza',
                },
            ],
        }

        const result = createProductSchema.safeParse(validProduct)
        expect(result.success).toBe(true)
    })

    const badInputs: { reason: string; input: any }[] = [
        {
            reason: 'name too short',
            input: { name: 'A', basePrice: 10, sku: 'SKU-001', slug: 'product-a' },
        },
        {
            reason: 'basePrice negative',
            input: { name: 'Product B', basePrice: -5, sku: 'SKU-002', slug: 'product-b' },
        },
        {
            reason: 'sku too short',
            input: { name: 'Product C', basePrice: 10, sku: 'ABC', slug: 'product-c' },
        },
        {
            reason: 'sku invalid characters',
            input: { name: 'Product D', basePrice: 10, sku: 'abc_123', slug: 'product-d' },
        },
        {
            reason: 'slug too short',
            input: { name: 'Product E', basePrice: 10, sku: 'SKU-005', slug: 'ab' },
        },
        {
            reason: 'slug invalid characters',
            input: { name: 'Product F', basePrice: 10, sku: 'SKU-006', slug: 'Invalid_Slug' },
        },
        {
            reason: 'duplicate variant labels',
            input: {
                name: 'Product G',
                basePrice: 10,
                sku: 'SKU-007',
                slug: 'product-g',
                variants: [
                    { label: 'M', priceModifier: 5 },
                    { label: 'M', priceModifier: 10 },
                ],
            },
        },
        {
            reason: 'variant priceModifier negative',
            input: {
                name: 'Product H',
                basePrice: 10,
                sku: 'SKU-008',
                slug: 'product-h',
                variants: [{ label: 'M', priceModifier: -5 }],
            },
        },
    ]

    badInputs.forEach(({ reason, input }) => {
        it(`should reject invalid input: ${reason}`, () => {
            const result = createProductSchema.safeParse(input)
            expect(result.success).toBe(false)
        })
    })

    it('should deduplicates categoryIds', () => {
        const input = {
            name: 'Product I',
            basePrice: 10,
            sku: 'SKU-009',
            slug: 'product-i',
            categoryIds: ['cat1', 'cat2', 'cat1', 'cat3'],
        }

        const result = createProductSchema.parse(input)
        expect(result.categoryIds).toEqual(['cat1', 'cat2', 'cat3'])
    })

    it('should apply default values for optional fields', () => {
        const input = { name: 'Product J', basePrice: 10, sku: 'SKU-010', slug: 'product-j' }
        const result = createProductSchema.parse(input)

        expect(result.description).toBe('No Description.')
        expect(result.image).toBe('')
        expect(result.variants).toBeUndefined()
        expect(result.categoryIds).toBeUndefined()
    })
})
