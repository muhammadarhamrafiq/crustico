import { describe, it, expect } from 'vitest'
import {
    createProductSchema,
    addProductCategoriesSchema,
    productVariantSchema,
    updateProductSchema,
    updateVariantSchema,
} from '../../src/schemas/productValidation.schemas'

describe('createProductSchema', () => {
    it('accepts valid product input', () => {
        const uuid = crypto.randomUUID()
        const uuid2 = crypto.randomUUID()
        const validProduct = {
            name: 'Deluxe Pizza',
            basePrice: 19.99,
            description: 'A delicious deluxe pizza with extra toppings.',
            sku: 'DLX-PZ-001',
            slug: 'deluxe-pizza',
            image: '/uploads/tmp/1894012-1231-1233-122.jpeg',
            categoryIds: [uuid, uuid2],
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

    const badInputs: { reason: string; input: object }[] = [
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
        const uuid = crypto.randomUUID()
        const uuid2 = crypto.randomUUID()
        const input = {
            name: 'Product I',
            basePrice: 10,
            sku: 'SKU-009',
            slug: 'product-i',
            categoryIds: [uuid, uuid2, uuid],
        }

        const result = createProductSchema.parse(input)
        expect(result.categoryIds).toEqual([uuid, uuid2])
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

describe('Update Product Schema', () => {
    it('should not accept the empty object', () => {
        const result = updateProductSchema.safeParse({})
        expect(result.success).toBe(false)
    })

    it('should accept partial updates', () => {
        const result = updateProductSchema.safeParse({
            name: 'Updated Product Name',
            basePrice: 25.5,
        })

        expect(result.success).toBe(true)
    })

    it('should reject invalid updates', () => {
        const result = updateProductSchema.safeParse({
            name: 'A',
            basePrice: 15.67,
        })

        expect(result.success).toBe(false)
    })

    it('should reject the invalid fields', () => {
        const result = updateProductSchema.safeParse({
            name: 'Valid Name',
            invalidField: 'This should not be here',
        })

        expect(result.success).toBe(false)
    })
})

describe('Add Product Categories Schema', () => {
    it('should invalidate empty categoryIds array', () => {
        const result = addProductCategoriesSchema.safeParse({ categoryIds: [] })
        expect(result.success).toBe(false)
    })

    it('should invalidate the array with invalid UUIDs', () => {
        const result = addProductCategoriesSchema.safeParse({
            categoryIds: ['invalid-uuid', 'another-invalid-uuid'],
        })
        expect(result.success).toBe(false)
    })

    it('should validate the array with valid UUIDs', () => {
        const uuid1 = crypto.randomUUID()
        const uuid2 = crypto.randomUUID()
        const result = addProductCategoriesSchema.safeParse({
            categoryIds: [uuid1, uuid2],
        })
        expect(result.success).toBe(true)
    })

    it('should remove the duplicate categoryIds', () => {
        const uuid1 = crypto.randomUUID()
        const uuid2 = crypto.randomUUID()
        const result = addProductCategoriesSchema.parse({
            categoryIds: [uuid1, uuid2, uuid2, uuid1],
        })
        expect(result.categoryIds).toEqual([uuid1, uuid2])
    })
})

describe('Add Product Variants Schema', () => {
    it('should invalid empty variants array', () => {
        const result = productVariantSchema.safeParse({})
        expect(result.success).toBe(false)
    })

    it('should invalidate variants with negative priceModifier', () => {
        const result = productVariantSchema.safeParse({ label: 'Size M', priceModifier: -5 })
        expect(result.success).toBe(false)
    })

    it('should validate correct variants input', () => {
        const result = productVariantSchema.safeParse({ label: 'Size M', priceModifier: 5 })
        expect(result.success).toBe(true)
    })
})

describe('Update Variant Schema', () => {
    it('should contain atleast one field to update', () => {
        const result = updateVariantSchema.safeParse({})
        expect(result.success).toBe(false)
    })

    it('should accept partial updates', () => {
        const result = updateVariantSchema.safeParse({
            label: 'Updated Label',
            priceModifier: 7.5,
        })

        expect(result.success).toBe(true)
    })

    it('should reject invalid updates', () => {
        const result = updateVariantSchema.safeParse({
            label: 'Up',
            priceModifier: -3,
        })

        expect(result.success).toBe(false)
    })

    it('should reject invalid fields', () => {
        const result = updateVariantSchema.safeParse({
            invalidField: 'This should not be here',
        })

        expect(result.success).toBe(false)
    })
})
