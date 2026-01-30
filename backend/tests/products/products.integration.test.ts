import request from 'supertest'
import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { resetDatabase } from '../db'
import app from '../../src/app'
import prisma from '../../src/lib/prisma'

beforeEach(async () => {
    await resetDatabase()
})

afterAll(async () => {
    await prisma.$disconnect()
})

describe('Product Module', () => {
    it('should create a new product', async () => {
        const cat1 = await prisma.category.create({
            data: { name: 'Category 1', description: 'First category', slug: 'category-1' },
        })
        const cat2 = await prisma.category.create({
            data: { name: 'Category 2', description: 'Second category', slug: 'category-2' },
        })

        const validProductData = {
            name: 'Test Product',
            description: 'A product for testing',
            basePrice: 100,
            slug: 'test-product',
            sku: 'TP-001-000',
            categoryIds: [cat1.id, cat2.id],
            variants: [
                {
                    label: 'Large',
                    description: 'Large size variant',
                    priceModifier: 20,
                },
                {
                    label: 'Small',
                    description: 'Small size variant',
                    priceModifier: 9,
                },
            ],
        }

        const response = await request(app).post('/api/v1/product/add').send(validProductData)
        expect(response.status).toBe(201)
        expect(response.body.data).toHaveProperty('id')
    })

    it('should not create producs with duplicate SKU', async () => {
        const validProductData = {
            name: 'Test Product',
            description: 'A product for testing',
            basePrice: 100,
            slug: 'test-product',
            sku: 'TP-001-000',
        }

        const response1 = await request(app).post('/api/v1/product/add').send(validProductData)
        const response2 = await request(app).post('/api/v1/product/add').send({
            name: 'Another Product',
            description: 'Another product for testing',
            basePrice: 150,
            slug: 'another-product',
            sku: 'TP-001-000',
        })

        expect(response1.status).toBe(201)
        expect(response2.status).toBe(409)
        expect(response2.body.message).toBe('sku already exist in Product')
    })

    it('should not create product with duplicate slug', async () => {
        const validProductData = {
            name: 'Test Product',
            description: 'A product for testing',
            basePrice: 100,
            slug: 'test-product',
            sku: 'TP-001-000',
        }

        const response1 = await request(app).post('/api/v1/product/add').send(validProductData)
        const response2 = await request(app).post('/api/v1/product/add').send({
            name: 'Another Product',
            description: 'Another product for testing',
            basePrice: 150,
            slug: 'test-product',
            sku: 'TP-002-000',
        })

        expect(response1.status).toBe(201)
        expect(response2.status).toBe(409)
        expect(response2.body.message).toBe('slug already exist in Product')
    })

    it('should not create a product with duplicate name', async () => {
        const validProductData = {
            name: 'Test Product',
            description: 'A product for testing',
            basePrice: 100,
            slug: 'test-product',
            sku: 'TP-001-000',
        }

        const response1 = await request(app).post('/api/v1/product/add').send(validProductData)
        const response2 = await request(app).post('/api/v1/product/add').send({
            name: 'Test Product',
            description: 'Another product for testing',
            basePrice: 150,
            slug: 'another-product',
            sku: 'TP-002-000',
        })

        expect(response1.status).toBe(201)
        expect(response2.status).toBe(409)
        expect(response2.body.message).toBe('name already exist in Product')
    })

    it('should not create a product with invalid category reference', async () => {
        const productDataWithInvalidCategory = {
            name: 'Test Product',
            description: 'A product for testing',
            basePrice: 100,
            slug: 'test-product',
            sku: 'TP-001-000',
            categoryIds: ['non-existent-category-id'],
        }

        const response = await request(app)
            .post('/api/v1/product/add')
            .send(productDataWithInvalidCategory)

        expect(response.status).toBe(404)
        expect(response.body.message).toBe('Referenced category not found')
    })
})
