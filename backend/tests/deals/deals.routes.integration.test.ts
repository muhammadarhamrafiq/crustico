import app from '../../src/app'
import { ProductGetPayload } from '../../src/generated/prisma/models'
import prisma from '../../src/lib/prisma'
import { resetDatabase } from '../db'
import request from 'supertest'
import { describe, it, expect, beforeAll } from 'vitest'

describe('POST /deals/add', () => {
    let product: ProductGetPayload<{
        include: {
            variants: true
        }
    }>
    let startDate: string, endDate: string
    beforeAll(async () => {
        await resetDatabase()
        await prisma.deal.create({
            data: {
                name: 'Test Deal',
                description: 'This is a test deal',
                priceModifier: -10,
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-12-31'),
                slug: 'test-deal',
            },
        })
        product = await prisma.product.create({
            data: {
                name: 'Test Product',
                description: 'This is a test product',
                basePrice: 100,
                sku: 'TP-001',
                slug: 'test-product',
                variants: {
                    create: [
                        {
                            label: 'Default Variant',
                            description: 'Default variant of the test product',
                            priceModifier: 10,
                        },
                    ],
                },
            },
            include: {
                variants: true,
            },
        })

        startDate = new Date(Date.now()).toISOString()
        endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    })

    it('should invalidate the request with invalid data', async () => {
        const res = await request(app)
            .post('/api/v1/deals/add')
            .send({
                name: '',
                slug: 'invalid-deal',
                priceModifier: -10,
                startDate: '2026-01-12',
                endDate: '2026-4-31',
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

        expect(res.status).toBe(400)
        expect(res.body.message).toBe('Name must contain at least 3 characters')
    })

    it('should return correct response for non-existing product', async () => {
        const res = await request(app)
            .post('/api/v1/deals/add')
            .send({
                name: 'Valid Deal',
                slug: 'valid-deal',
                priceModifier: -10,
                startDate: startDate,
                endDate: endDate,
                items: [
                    {
                        productId: crypto.randomUUID(),
                        quantity: 2,
                    },
                ],
            })

        expect(res.status).toBe(422)
        expect(res.body.message).toBe('Referenced product not found')
    })

    it('should return correct response for non-existing product variant', async () => {
        const res = await request(app)
            .post('/api/v1/deals/add')
            .send({
                name: 'Valid Deal',
                slug: 'valid-deal',
                priceModifier: -10,
                startDate: startDate,
                endDate: endDate,
                items: [
                    {
                        productId: product.id,
                        productVariantId: crypto.randomUUID(),
                        quantity: 2,
                    },
                ],
            })

        expect(res.status).toBe(422)
        expect(res.body.message).toBe('Referenced product variant not found')
    })

    it('should validate the unique constraints', async () => {
        const res = await request(app)
            .post('/api/v1/deals/add')
            .send({
                name: 'Test Deal',
                slug: 'test-deal-2',
                priceModifier: -10,
                startDate: startDate,
                endDate: endDate,
                items: [
                    {
                        productId: product.id,
                        productVariantId: product.variants[0].id,
                        quantity: 2,
                    },
                ],
            })

        expect(res.status).toBe(409)
        expect(res.body.message).toBe('name already exist in Deal')
    })

    it('should create a deal with valid data', async () => {
        const res = await request(app)
            .post('/api/v1/deals/add')
            .send({
                name: 'Valid Deal',
                slug: 'valid-deal',
                priceModifier: -10,
                startDate: startDate,
                endDate: endDate,
                items: [
                    {
                        productId: product.id,
                        productVariantId: product.variants[0].id,
                        quantity: 2,
                    },
                ],
            })

        expect(res.status).toBe(201)
        expect(res.body.data).toHaveProperty('id')
    })
})
