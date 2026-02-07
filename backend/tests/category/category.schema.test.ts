import { describe, it, expect } from 'vitest'
import { categorySchema } from '../../src/schemas/categoryValidation.schema'

describe('Category Validation Schema', () => {
    it('invalidate the name with length less than 3', () => {
        const parse = categorySchema.safeParse({
            name: '',
            slug: 'category',
            description: 'Category Description',
        })

        expect(parse.success).toBe(false)
    })

    it('invalidate the slug with incorrect symbols', () => {
        const parse = categorySchema.safeParse({
            name: 'category',
            slug: 'category#$',
            description: 'category description',
        })

        expect(parse.success).toBe(false)
    })

    it('automatically convert the slug to the lowercase', () => {
        const parse = categorySchema.safeParse({
            name: 'category',
            slug: 'cateGORY-slug',
            description: 'Category Description',
        })

        expect(parse.success).toBe(true)
        expect(parse.data?.slug).toBe('category-slug')
    })

    it('automatically adds the description when not provided', () => {
        const parse = categorySchema.safeParse({
            name: 'category',
            slug: 'category',
        })

        expect(parse.success).toBe(true)
        expect(parse.data?.description).toBe('No Description')
    })
})
