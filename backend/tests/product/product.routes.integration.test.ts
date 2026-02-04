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
            categoryIds: ['ba1d8479-e1b5-4944-87f8-c325f88d78cb'],
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

describe('PATCH /api/v1/product/:id/update', () => {
    it('should invalidate the empty request', async () => {
        const product = await prisma.product.create({
            data: {
                name: 'Product Alpha',
                sku: 'ALPHA-001',
                slug: 'product-alpha',
                description: 'A product for testing',
                basePrice: 100,
            },
        })
        const response = await request(app).patch(`/api/v1/product/${product.id}/update`).send({})

        expect(response.status).toBe(400)
        expect(response.body.message).toBe('Should contain atleast one field to update')
    })

    it('should return correct response for the unique constraint failure', async () => {
        await prisma.product.create({
            data: {
                name: 'Product Alpha',
                description: 'Alpha Description',
                sku: 'ALPH-001',
                slug: 'product-alpha',
                basePrice: 19.9,
            },
        })

        const product = await prisma.product.create({
            data: {
                name: 'Product Beta',
                description: 'Beta Description',
                sku: 'BETA-001',
                slug: 'product-beta',
                basePrice: 29.9,
            },
        })

        const response = await request(app).patch(`/api/v1/product/${product.id}/update`).send({
            name: 'Product Alpha',
        })

        expect(response.status).toBe(409)
        expect(response.body.message).toBe('name already exist in Product')
    })

    it('should invalidate non-existent product update attempts', async () => {
        const id = crypto.randomUUID()
        const response = await request(app).patch(`/api/v1/product/${id}/update`).send({
            name: 'Product Not Exit',
        })

        expect(response.status).toBe(404)
        expect(response.body.message).toBe('Product not found')
    })

    it('should update product and return correctly formatted data', async () => {
        const product = await prisma.product.create({
            data: {
                name: 'Product Gamma',
                description: 'Gamma Description',
                sku: 'GAMMA-001',
                slug: 'product-gamma',
                basePrice: 39.9,
            },
        })

        const updateData = {
            name: 'Product Gamma Updated',
            sku: 'GAMMA-002',
            slug: 'product-gamma-updated',
            basePrice: 49.9,
        }

        const response = await request(app)
            .patch(`/api/v1/product/${product.id}/update`)
            .send(updateData)

        expect(response.status).toBe(200)
        expect(response.body.data.id).toBe(product.id)
        expect(response.body.data.name).toBe(updateData.name)
        expect(response.body.data.sku).toBe(updateData.sku)
        expect(response.body.data.slug).toBe(updateData.slug)
        expect(response.body.data.basePrice).toBe('49.9')
    })
})

describe('PATCH /api/v1/product/:id/add-categories', () => {
    it('should return correct response for non-existent product', async () => {
        const id = crypto.randomUUID()
        const response = await request(app)
            .patch(`/api/v1/product/${id}/add-categories`)
            .send({
                categoryIds: [crypto.randomUUID()],
            })

        expect(response.status).toBe(404)
        expect(response.body.message).toBe('Product not found')
    })

    it('should return correct response for non-existent category', async () => {
        const product = await prisma.product.create({
            data: {
                name: 'Product Gamma',
                description: 'Gamma Description',
                slug: 'product-gamma',
                sku: 'GAMMA-001',
                basePrice: 39.9,
            },
        })

        const response = await request(app)
            .patch(`/api/v1/product/${product.id}/add-categories`)
            .send({
                categoryIds: [crypto.randomUUID()],
            })

        expect(response.status).toBe(422)
        expect(response.body.message).toBe('Referenced category not found')
    })

    it('should add categories to product and return correctly formatted data', async () => {
        const category1 = await prisma.category.create({
            data: { name: 'Books', slug: 'books' },
        })
        const category2 = await prisma.category.create({
            data: { name: 'Stationery', slug: 'stationery' },
        })

        const product = await prisma.product.create({
            data: {
                name: 'Product Gamma',
                description: 'Gamma Description',
                slug: 'product-gamma',
                sku: 'GAMMA-001',
                basePrice: 39.9,
            },
        })

        const response = await request(app)
            .patch(`/api/v1/product/${product.id}/add-categories`)
            .send({
                categoryIds: [category1.id, category2.id],
            })

        expect(response.status).toBe(200)
        expect(response.body.data?.productCategories).toHaveLength(2)
    })
})

describe('DELETE /api/v1/product/:id/remove-category/:categoryId', () => {
    it('should return correct response for non-existent product', async () => {
        const id = crypto.randomUUID()
        const categoryId = crypto.randomUUID()
        const response = await request(app).delete(
            `/api/v1/product/${id}/remove-category/${categoryId}`
        )
        expect(response.status).toBe(404)
        expect(response.body.message).toBe('Product not found')
    })

    it('should return correct response for non-existent category association', async () => {
        const product = await prisma.product.create({
            data: {
                name: 'Product Gamma',
                description: 'Gamma Description',
                slug: 'product-gamma',
                sku: 'GAMMA-001',
                basePrice: 39.9,
            },
        })

        const categoryId = crypto.randomUUID()
        const response = await request(app).delete(
            `/api/v1/product/${product.id}/remove-category/${categoryId}`
        )
        expect(response.status).toBe(404)
        expect(response.body.message).toBe('Relation not found')
    })

    it('should remove category from product and return correctly formatted data', async () => {
        const category = await prisma.category.create({
            data: { name: 'Books', slug: 'books' },
        })

        const product = await prisma.product.create({
            data: {
                name: 'Product Gamma',
                description: 'Gamma Description',
                slug: 'product-gamma',
                sku: 'GAMMA-001',
                basePrice: 39.9,
                productCategories: {
                    create: { categoryId: category.id },
                },
            },
        })

        const response = await request(app).delete(
            `/api/v1/product/${product.id}/remove-category/${category.id}`
        )

        expect(response.status).toBe(200)
        expect(response.body.data?.productCategories).toHaveLength(0)
    })
})

describe('PATCH /api/v1/product/:id/add-variants', () => {
    it('should return correct response of unique variant failure', async () => {
        const product = await prisma.product.create({
            data: {
                name: 'Product D',
                sku: 'PRD-001',
                slug: 'product-d',
                basePrice: 19.99,
                variants: {
                    create: {
                        label: 'L',
                        description: 'Large size',
                        priceModifier: '1.01',
                    },
                },
            },
        })

        const res = await request(app)
            .patch(`/api/v1/product/${product.id}/add-variants`)
            .send({
                variants: [
                    { label: 's', description: 'Small', priceModifier: 0 },
                    { label: 'l', description: 'Large', priceModifier: 0 },
                ],
            })

        expect(res.status).toBe(409)
        expect(res.body.message).toBe('Variant with this label already exits')
    })

    it('should invalidate the request with duplicate variants', async () => {
        const product = await prisma.product.create({
            data: {
                name: 'Product D',
                sku: 'PRD-001',
                slug: 'product-d',
                basePrice: 19.99,
                variants: {
                    create: {
                        label: 'L',
                        description: 'Large size',
                        priceModifier: '1.01',
                    },
                },
            },
        })

        const res = await request(app)
            .patch(`/api/v1/product/${product.id}/add-variants`)
            .send({
                variants: [
                    { label: 'm', description: 'Medium', priceModifier: 10 },
                    { label: 'm', description: 'Medium', priceModifier: 11 },
                ],
            })

        expect(res.status).toBe(400)
        expect(res.body.message).toBe('Variant labels must be unique')
    })

    it('should return correct response for invalid product id', async () => {
        const uuid = crypto.randomUUID()
        const res = await request(app)
            .patch(`/api/v1/product/${uuid}/add-variants`)
            .send({
                variants: [
                    { label: 'm', description: 'Medium', priceModifier: 10 },
                    { label: 'm', description: 'Medium', priceModifier: 11 },
                ],
            })

        expect(res.status).toBe(409)
        expect(res.body.message).toBe('Product Not found')
    })

    it('should be able to create the variants for the product and return correct result.', async () => {
        const product = await prisma.product.create({
            data: {
                name: 'Product D',
                sku: 'PRD-002',
                slug: 'product-d',
                basePrice: 19.9,
            },
        })

        const res = await request(app)
            .patch(`/api/v1/product/${product.id}/add-variants`)
            .send({
                variants: [
                    { label: 's', description: 'Small', priceModifier: 0 },
                    { label: 'm', description: 'Medium', priceModifier: 12.5 },
                    { label: 'l', description: 'Large', priceModifier: 20 },
                ],
            })

        expect(res.status).toBe(200)
        expect(res.body.id).toBe(product.id)
        expect(res.body.variants).toHaveLength(2)
    })
})
