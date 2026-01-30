import { describe, it, expect, vi } from 'vitest'
import request from 'supertest'

vi.mock('../../src/repositories/product.repository', () => {
    return {
        default: class ProductRepo {
            static createProduct = vi.fn(async (data: any) => {
                return {
                    id: '619bb630-3211-4638-bbdf-aa74afd04a5a',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    ...data,
                }
            })
        },
    }
})

import app from '../../src/app'
import ProductRepo from '../../src/repositories/product.repository'

describe('POST /api/v1/product/add', () => {
    /**
     * It should reject the invalid data
     * It should accept the valid data
     * Return the created product with an id
     */
    const validProductData = {
        name: 'Test Product',
        description: 'A product for testing',
        basePrice: 100,
        slug: 'test-product',
        sku: 'TP-001-000',
        image: '',
    }

    it('should reject invalid data', async () => {
        const response = await request(app).post('/api/v1/product/add').send({
            name: '',
            description: 'A product for testing',
            basePrice: -50,
            slug: 'test-product',
            sku: 'TP-001',
        })

        expect(response.status).toBe(400)
    })

    it('should accept valid data and return created product with id', async () => {
        const response = await request(app).post('/api/v1/product/add').send(validProductData)

        expect(response.status).toBe(201)
        expect(response.body.data).toHaveProperty('id', '619bb630-3211-4638-bbdf-aa74afd04a5a')

        // Ensure the repository's createProduct method was called
        expect(ProductRepo.createProduct).toHaveBeenCalledOnce()
    })
})
