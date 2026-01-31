import request from 'supertest'
import { describe, it, expect, beforeEach } from 'vitest'
import { resetDatabase } from '../db'
import app from '../../src/app'
import prisma from '../../src/lib/prisma'

beforeEach(async () => {
    await resetDatabase()
})

describe('POST /api/v1/product/add', () => {
    it('should reject request with duplicate variant labels', async () => {
        const product = {
            name: 'Product Alpha',
            description: 'A product for testing',
            sku: 'ALPHA-001',
            slug: 'product-alpha',
            basePrice: 100,
            variants: [
                { label: 'M', priceModifier: 10, description: 'Medium Size' },
                { label: 'M', priceModifier: 15, description: 'Medium Size Duplicate' },
            ],
        }

        const res = await request(app).post('/api/v1/product/add').send(product)

        expect(res.status).toBe(400)
        expect(res.body.message).toBe('Variant labels must be unique')
    })

    it('should return correct error for unique constraints violations', async () => {
        await prisma.product.create({
            data: {
                name: 'Product Beta',
                description: 'Beta product description',
                basePrice: 300,
                sku: 'UNIQ-123',
                slug: 'product-alpha',
            },
        })
        const productData = {
            name: 'Product Beta',
            description: 'Another beta product description',
            basePrice: 350,
            sku: 'UNIQ-123-KL',
            slug: 'product-beta',
            image: '',
        }

        const res = await request(app).post('/api/v1/product/add').send(productData)
        expect(res.status).toBe(409)
        expect(res.body.message).toBe('name already exist in Product')
    })

    it('should return correct error when assigning non-existent categories', async () => {
        const productData = {
            name: 'Product Gamma',
            description: 'Gamma product description',
            basePrice: 400,
            sku: 'GAMMA-001',
            slug: 'product-gamma',
            categoryIds: ['non-existent-category-id'],
            image: '',
        }

        const res = await request(app).post('/api/v1/product/add').send(productData)

        expect(res.status).toBe(422)
        expect(res.body.message).toBe('Referenced category not found')
    })

    it('should automatically remove duplicate category IDs', async () => {
        const category1 = await prisma.category.create({
            data: { name: 'Books', slug: 'books' },
        })
        const category2 = await prisma.category.create({
            data: { name: 'Stationery', slug: 'stationery' },
        })

        const productData = {
            name: 'Product Delta',
            description: 'Delta product description',
            basePrice: 220,
            sku: 'DELTA-001',
            slug: 'product-delta',
            categoryIds: [category1.id, category2.id, category1.id],
            image: '',
        }

        const res = await request(app).post('/api/v1/product/add').send(productData)

        expect(res.status).toBe(201)
    })

    it('should create product and return correctly formatted data', async () => {
        const category = await prisma.category.create({
            data: { name: 'Gadgets', slug: 'gadgets' },
        })

        const productData = {
            name: 'Product Epsilon',
            description: 'Epsilon product description',
            basePrice: 450,
            sku: 'ePs-001',
            slug: 'product-Epsilon',
            categoryIds: [category.id],
            image: '',
        }

        const res = await request(app).post('/api/v1/product/add').send(productData)

        expect(res.status).toBe(201)
        expect(res.body.data).toHaveProperty('id')
        expect(res.body.data.name).toBe(productData.name)
        expect(res.body.data.sku).toBe('EPS-001')
        expect(res.body.data.slug).toBe('product-epsilon')
    })
})
