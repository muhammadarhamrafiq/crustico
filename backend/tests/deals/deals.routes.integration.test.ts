import app from '../../src/app'
import { Deal } from '../../src/generated/prisma/client'
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
                slug: 'test-deal',
                description: 'This is a test deal',
                priceModifier: -10,
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

    it('should validate the priceModifier is not reducing the price below zero', async () => {
        const res = await request(app)
            .post('/api/v1/deals/add')
            .send({
                name: 'Invlid price modifier deal',
                slug: 'invalid-price-modifier-deal',
                priceModifier: -250,
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

        expect(res.status).toBe(400)
        expect(res.body.message).toBe('Price modifier cannot reduce the price below zero')
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

describe('PATCH /deal/:id/update', () => {
    const deals: Array<Deal> = []
    beforeAll(async () => {
        await resetDatabase()
        const product = await prisma.product.create({
            data: {
                name: 'Product A',
                description: 'Description for Product A',
                basePrice: 100,
                sku: 'PROD-A',
                slug: 'product-a',
                variants: {
                    create: [
                        {
                            label: 'Default Variant',
                            description: 'Default variant of Product A',
                            priceModifier: 110,
                        },
                    ],
                },
            },
            include: {
                variants: true,
            },
        })
        deals.push(
            await prisma.deal.create({
                data: {
                    name: 'Deal Alpha',
                    slug: 'deal-aplha',
                    description: 'deal aplha description',
                    priceModifier: -10,
                    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                    dealItems: {
                        create: [
                            {
                                productId: product.id,
                                productVariantId: product.variants[0].id,
                                quantity: 2,
                            },
                        ],
                    },
                },
            })
        )
        deals.push(
            await prisma.deal.create({
                data: {
                    name: 'Deal Beta',
                    slug: 'deal-beta',
                    description: 'deal beta description',
                    priceModifier: -5,
                    dealItems: {
                        create: [
                            {
                                product: {
                                    create: {
                                        name: 'Product B',
                                        description: 'Description for Product B',
                                        basePrice: 150,
                                        sku: 'PROD-B',
                                        slug: 'product-b',
                                    },
                                },
                            },
                        ],
                    },
                },
            })
        )
    })

    it('should return correct response for non-existing deal', async () => {
        const res = await request(app).patch(`/api/v1/deals/${crypto.randomUUID()}/update`).send({
            name: 'Non-existing Deal',
        })
        expect(res.status).toBe(404)
        expect(res.body.message).toBe('Deal not found')
    })

    it('should return correct response for invalid data', async () => {
        const res = await request(app).patch(`/api/v1/deals/${deals[0].id}/update`).send({
            name: 'De',
        })
        expect(res.status).toBe(400)
        expect(res.body.message).toBe('Name must contain at least 3 characters')
    })

    it('should return correct response on unique constraint voilation', async () => {
        const res = await request(app).patch(`/api/v1/deals/${deals[0].id}/update`).send({
            name: 'Deal Beta',
        })
        expect(res.status).toBe(409)
        expect(res.body.message).toBe('name already exist in Deal')
    })

    it('should validate the date fields if provided', async () => {
        const res = await request(app)
            .patch(`/api/v1/deals/${deals[0].id}/update`)
            .send({
                startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
            })

        expect(res.status).toBe(400)
        expect(res.body.message).toBe('Start date must be less than end date')
    })

    it('should validate the priceModifier is not reducing the price below zero', async () => {
        const resValid = await request(app).patch(`/api/v1/deals/${deals[0].id}/update`).send({
            priceModifier: -150,
        })
        expect(resValid.status).toBe(200)
        expect(resValid.body.data.priceModifier).toBe('-150')

        const res = await request(app).patch(`/api/v1/deals/${deals[0].id}/update`).send({
            priceModifier: -450,
        })
        expect(res.status).toBe(400)
        expect(res.body.message).toBe('Price modifier cannot reduce the price below zero')
    })

    it('should update the deal with valid data', async () => {
        const res = await request(app).patch(`/api/v1/deals/${deals[0].id}/update`).send({
            name: 'Deal Alpha Updated',
            description: 'Updated description for Deal Alpha',
            priceModifier: -15,
        })
        expect(res.status).toBe(200)
        expect(res.body.data.name).toBe('Deal Alpha Updated')
        expect(res.body.data.description).toBe('Updated description for Deal Alpha')
        expect(res.body.data.priceModifier).toBe('-15')
    })
})
