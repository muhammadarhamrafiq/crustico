import request from 'supertest'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { resetDatabase } from '../db'
import app from '../../src/app'
import prisma from '../../src/lib/prisma'
import { Product, Category } from '../../src/generated/prisma/client'
import { ProductGetPayload } from '../../src/generated/prisma/models'

beforeAll(async () => {
    await resetDatabase()
})

afterAll(async () => {
    await prisma.$disconnect()
})

describe('POST /api/v1/product/add', () => {
    beforeAll(async () => {
        await resetDatabase()
    })

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
    const products: Array<Product> = []
    beforeAll(async () => {
        await resetDatabase()
        products.push(
            await prisma.product.create({
                data: {
                    name: 'Product Alpha',
                    description: 'Alpha Description',
                    sku: 'ALPH-001',
                    slug: 'product-alpha',
                    basePrice: 19.9,
                },
            })
        )
        products.push(
            await prisma.product.create({
                data: {
                    name: 'Product Beta',
                    description: 'Beta Description',
                    sku: 'BETA-001',
                    slug: 'product-beta',
                    basePrice: 29.9,
                },
            })
        )
    })

    it('should invalidate the empty request', async () => {
        const response = await request(app)
            .patch(`/api/v1/product/${products[0].id}/update`)
            .send({})

        expect(response.status).toBe(400)
        expect(response.body.message).toBe('Should contain atleast one field to update')
    })

    it('should return correct response for the unique constraint failure', async () => {
        const response = await request(app).patch(`/api/v1/product/${products[0].id}/update`).send({
            name: products[1].name,
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
        const updateData = {
            name: 'Product Gamma Updated',
            sku: 'GAMMA-002',
            slug: 'product-gamma-updated',
            basePrice: 49.9,
        }

        const response = await request(app)
            .patch(`/api/v1/product/${products[1].id}/update`)
            .send(updateData)

        expect(response.status).toBe(200)
        expect(response.body.data.id).toBe(products[1].id)
        expect(response.body.data.name).toBe(updateData.name)
        expect(response.body.data.sku).toBe(updateData.sku)
        expect(response.body.data.slug).toBe(updateData.slug)
        expect(response.body.data.basePrice).toBe(updateData.basePrice.toString())
    })
})

describe('PATCH /api/v1/product/:id/add-categories', () => {
    let product: Product
    const categories: Array<Category> = []
    beforeAll(async () => {
        await resetDatabase()
        product = await prisma.product.create({
            data: {
                name: 'Product',
                description: 'Product Description',
                slug: 'product',
                sku: 'TEST-CAT-001',
                basePrice: 39.9,
            },
        })
        categories.push(
            await prisma.category.create({
                data: { name: 'Pizzas', slug: 'pizzas' },
            })
        )
        categories.push(
            await prisma.category.create({
                data: { name: 'Drinks', slug: 'drinks' },
            })
        )
    })

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
        const response = await request(app)
            .patch(`/api/v1/product/${product.id}/add-categories`)
            .send({
                categoryIds: [crypto.randomUUID()],
            })

        expect(response.status).toBe(422)
        expect(response.body.message).toBe('Referenced category not found')
    })

    it('should add categories to product and return correctly formatted data', async () => {
        const response = await request(app)
            .patch(`/api/v1/product/${product.id}/add-categories`)
            .send({
                categoryIds: [categories[0].id, categories[1].id],
            })

        expect(response.status).toBe(200)
        expect(response.body.data?.productCategories).toHaveLength(2)
    })
})

describe('DELETE /api/v1/product/:id/remove-category/:categoryId', () => {
    let product: Product, category: Category
    beforeAll(async () => {
        await resetDatabase()
        category = await prisma.category.create({
            data: { name: 'Desserts', slug: 'desserts' },
        })
        product = await prisma.product.create({
            data: {
                name: 'Product',
                description: 'Product Description',
                slug: 'product',
                sku: 'TEST-REM-001',
                basePrice: 39.9,
                productCategories: {
                    create: {
                        categoryId: category.id,
                    },
                },
            },
        })
    })

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
        const categoryId = crypto.randomUUID()
        const response = await request(app).delete(
            `/api/v1/product/${product.id}/remove-category/${categoryId}`
        )
        expect(response.status).toBe(404)
        expect(response.body.message).toBe('Relation not found')
    })

    it('should remove category from product and return correctly formatted data', async () => {
        const response = await request(app).delete(
            `/api/v1/product/${product.id}/remove-category/${category.id}`
        )

        expect(response.status).toBe(200)
        expect(response.body.data?.productCategories).toHaveLength(0)
    })
})

describe('PATCH /api/v1/product/:id/add-variant', () => {
    let product: Product
    beforeAll(async () => {
        await resetDatabase()
        product = await prisma.product.create({
            data: {
                name: 'Product',
                description: 'Product Description',
                slug: 'product',
                sku: 'TEST-PRD-001',
                basePrice: 39.9,
                variants: {
                    create: {
                        label: 'l',
                        description: 'Large size',
                        priceModifier: '1.01',
                    },
                },
            },
        })
    })

    it('should return correct response of unique variant failure', async () => {
        const res = await request(app)
            .patch(`/api/v1/product/${product.id}/add-variants`)
            .send({ label: 'l', description: 'Large', priceModifier: 0 })

        expect(res.status).toBe(409)
        expect(res.body.message).toBe('Variant with this label already exits')
    })

    it('should return correct response for invalid product id', async () => {
        const uuid = crypto.randomUUID()
        const res = await request(app)
            .patch(`/api/v1/product/${uuid}/add-variants`)
            .send({ label: 'm', description: 'Medium', priceModifier: 10 })

        expect(res.status).toBe(404)
        expect(res.body.message).toBe('Product not found')
    })

    it('should be able to create the variants for the product and return correct result.', async () => {
        const res = await request(app)
            .patch(`/api/v1/product/${product.id}/add-variants`)
            .send({ label: 's', description: 'Small', priceModifier: 0 })

        expect(res.status).toBe(200)
        expect(res.body.data.id).toBe(product.id)
        expect(res.body.data.variants).toHaveLength(2)
    })
})

describe('PATCH /api/v1/product/update-variant/:variantId', () => {
    let product: ProductGetPayload<{
        include: {
            variants: true
        }
    }>
    let variantId: string
    beforeAll(async () => {
        await resetDatabase()
        product = await prisma.product.create({
            data: {
                name: 'Product',
                description: 'Product Description',
                slug: 'product',
                sku: 'TEST-PRD-001',
                basePrice: 39.9,
                variants: {
                    create: [
                        { label: 'l', description: 'Large size', priceModifier: '10.1' },
                        { label: 'm', description: 'Medium size', priceModifier: '5.1' },
                        { label: 'c', description: 'To Update', priceModifier: '2.1' },
                    ],
                },
            },
            include: {
                variants: true,
            },
        })

        variantId = product.variants.find((v) => v.label === 'c')?.id as string
    })

    it('should return correct response for non-existent variant', async () => {
        const variantId = crypto.randomUUID()
        const res = await request(app)
            .patch(`/api/v1/product/update-variant/${variantId}`)
            .send({ label: 'xl', description: 'Extra Large', priceModifier: 20 })
        expect(res.status).toBe(404)
        expect(res.body.message).toBe('Variant not found')
    })

    it('should return correct response for unique variant label violation', async () => {
        const res = await request(app)
            .patch(`/api/v1/product/update-variant/${variantId}`)
            .send({ label: 'm', description: 'Updated Medium', priceModifier: 12 })

        expect(res.status).toBe(409)
        expect(res.body.message).toBe('Variant with this label already exists')
    })

    it('should update variant and return correctly formatted data', async () => {
        const res = await request(app)
            .patch(`/api/v1/product/update-variant/${variantId}`)
            .send({ label: 'xl', description: 'Extra Large', priceModifier: 20 })

        expect(res.status).toBe(200)
        expect(res.body.data.id).toBe(variantId)
        expect(res.body.data.label).toBe('xl')
        expect(res.body.data.description).toBe('Extra Large')
        expect(res.body.data.priceModifier).toBe('20')
    })
})

describe('DELETE /api/v1/product/delete-variant/:variantId', () => {
    let product: ProductGetPayload<{
        include: {
            variants: true
        }
    }>
    let variantId1: string
    let variantId2: string
    beforeAll(async () => {
        await resetDatabase()
        product = await prisma.product.create({
            data: {
                name: 'Product',
                description: 'Product Description',
                slug: 'product',
                sku: 'TEST-PRD-001',
                basePrice: 39.9,
                variants: {
                    create: [
                        { label: 'l', description: 'Large size', priceModifier: '10.1' },
                        { label: 'm', description: 'Medium size', priceModifier: '5.1' },
                        { label: 'c', description: 'To Update', priceModifier: '2.1' },
                    ],
                },
            },
            include: {
                variants: true,
            },
        })

        variantId1 = product.variants.find((v) => v.label === 'c')?.id as string
        variantId2 = product.variants.find((v) => v.label === 'm')?.id as string

        await prisma.deal.create({
            data: {
                name: 'Deal One',
                slug: 'deal-one',
                priceModifier: -10,
                description: 'First Deal',
                dealItems: {
                    create: {
                        productId: product.id,
                        productVariantId: variantId1,
                    },
                },
            },
        })

        await prisma.deal.create({
            data: {
                name: 'Deal Two',
                slug: 'deal-two',
                priceModifier: -5,
                description: 'Second Deal',
                dealItems: {
                    create: {
                        productId: product.id,
                        productVariantId: variantId1,
                    },
                },
            },
        })
    })

    it('should return correct response for non-existent variant', async () => {
        const variantId = crypto.randomUUID()
        const res = await request(app).delete(`/api/v1/product/delete-variant/${variantId}`)

        expect(res.status).toBe(404)
        expect(res.body.message).toBe('Variant not found')
    })

    it('should warn if deleting variant is used in deals', async () => {
        const res = await request(app).delete(`/api/v1/product/delete-variant/${variantId1}`)

        expect(res.status).toBe(412)
        expect(res.body.message).toBe(
            'Deletion not confirmed. All associated deals will also be deactivated.'
        )
    })

    it('should delete variant if not used in deals', async () => {
        const res = await request(app).delete(`/api/v1/product/delete-variant/${variantId2}`)

        expect(res.status).toBe(200)
        expect(res.body.message).toBe('Variant deleted successfully')
    })

    it('should deactivate deal and variant when confirmed', async () => {
        const res = await request(app)
            .delete(`/api/v1/product/delete-variant/${variantId1}`)
            .query({ confirm: 'true' })

        expect(res.status).toBe(200)
        expect(res.body.message).toBe('Variant deleted successfully')
    })
})

describe('DELETE /api/v1/product/:id/delete', () => {
    let product1: Product, product2: Product
    beforeAll(async () => {
        await resetDatabase()
        product1 = await prisma.product.create({
            data: {
                name: 'Product Alpha',
                sku: 'PRD-ALP-001',
                slug: 'product-alpha',
                description: 'Alpha product description',
                basePrice: 100,
                productDeals: {
                    create: {
                        deal: {
                            create: {
                                name: 'Deal Alpha',
                                slug: 'deal-alpha',
                                priceModifier: -10,
                                description: 'Deal Alpha Description',
                            },
                        },
                    },
                },
            },
        })

        product2 = await prisma.product.create({
            data: {
                name: 'Product Beta',
                sku: 'PRD-BET-001',
                slug: 'product-beta',
                description: 'Beta product description',
                basePrice: 150,
            },
        })
    })

    it('should warn if deleting product is used in deals', async () => {
        const res = await request(app).delete(`/api/v1/product/${product1.id}/delete`)

        expect(res.status).toBe(412)
        expect(res.body.message).toBe(
            'Deletion not confirmed. All associated deals will also be deactivated.'
        )
    })

    it('should delete product if not used in deals', async () => {
        const res = await request(app).delete(`/api/v1/product/${product2.id}/delete`)

        expect(res.status).toBe(200)
        expect(res.body.message).toBe('Product deleted successfully')
    })

    it('should deactivate deal and product when confirmed', async () => {
        const res = await request(app)
            .delete(`/api/v1/product/${product2.id}/delete`)
            .query({ confirm: 'true' })

        expect(res.status).toBe(200)
        expect(res.body.message).toBe('Product deleted successfully')
    })
})

describe('GET /api/v1/product/:id', () => {
    let testProduct: Product

    beforeAll(async () => {
        await resetDatabase()

        testProduct = await prisma.product.create({
            data: {
                name: 'Product J',
                sku: 'PRJ-001',
                slug: 'product-j',
                description: 'Product J Description',
                basePrice: 109.9,
                image: ' ',
                variants: {
                    create: [
                        { label: 's', description: 'Small size', priceModifier: 0 },
                        { label: 'm', description: 'Medium size', priceModifier: 10 },
                        { label: 'l', description: 'Large size', priceModifier: 15 },
                    ],
                },
                productCategories: {
                    create: {
                        category: {
                            create: { name: 'Category J', slug: 'category-j' },
                        },
                    },
                },
            },
        })
    })

    it('should return correct response for non-existent product', async () => {
        const id = crypto.randomUUID()
        const res = await request(app).get(`/api/v1/product/${id}`)

        expect(res.status).toBe(404)
        expect(res.body.message).toBe('Product not found')
    })

    it('should return product with correctly formatted data', async () => {
        const res = await request(app).get(`/api/v1/product/${testProduct.id}`)

        expect(res.status).toBe(200)
        expect(res.body.data.id).toBe(testProduct.id)
        expect(res.body.data.name).toBe(testProduct.name)
        expect(res.body.data.sku).toBe(testProduct.sku)
        expect(res.body.data.slug).toBe(testProduct.slug)
        expect(res.body.data.description).toBe(testProduct.description)
        expect(res.body.data.basePrice).toBe('109.9')
        expect(res.body.data.image).toBeNull()
        expect(res.body.data.variants).toHaveLength(3)
        expect(res.body.data.categories).toHaveLength(1)
    })
})

describe('GET /api/v1/product', () => {
    const categories: Array<Category> = []
    beforeAll(async () => {
        await resetDatabase()
        categories.push(
            await prisma.category.create({
                data: { name: 'Pizzas', slug: 'pizzas' },
            })
        )
        categories.push(
            await prisma.category.create({
                data: { name: 'Drinks', slug: 'drinks' },
            })
        )
        categories.push(
            await prisma.category.create({
                data: { name: 'Burgers', slug: 'burgers' },
            })
        )

        for (let i = 1; i <= 30; i++) {
            await prisma.product.create({
                data: {
                    name: `Product ${i}`,
                    description: `Description for product ${i}`,
                    slug: `product-${i}`,
                    sku: `PRD-${i.toString().padStart(3, '0')}`,
                    basePrice: (i * 10).toString(),
                    productCategories: {
                        create: { categoryId: categories[i % 3].id },
                    },
                },
            })
        }
    })

    it('should return paginated products with default limit', async () => {
        const res = await request(app).get('/api/v1/product?page=1&limit=10')

        expect(res.status).toBe(200)
        expect(res.body.data.products).toHaveLength(10)
        expect(res.body.data.pagination).toBeDefined()
        expect(res.body.data.pagination.total).toBe(30)
        expect(res.body.data.pagination.page).toBe(1)
        expect(res.body.data.pagination.pages).toBe(3)
    })

    it('should return second page correctly', async () => {
        const res = await request(app).get('/api/v1/product?page=2&limit=10')

        expect(res.status).toBe(200)
        expect(res.body.data.products).toHaveLength(10)
        expect(res.body.data.pagination.page).toBe(2)
        expect(res.body.data.pagination.total).toBe(30)
    })

    it('should return last page with remaining products', async () => {
        const res = await request(app).get('/api/v1/product?page=3&limit=10')

        expect(res.status).toBe(200)
        expect(res.body.data.products).toHaveLength(10)
        expect(res.body.data.pagination.page).toBe(3)
    })

    it('should filter products by category', async () => {
        const res = await request(app).get(`/api/v1/product?category=${categories[0].id}`)

        expect(res.status).toBe(200)
        expect(res.body.data.products.length).toBe(10)
        expect(
            res.body.data.products.every((p: any) =>
                p.categories?.some((c: any) => c.name === categories[0].name)
            )
        ).toBe(true)
    })

    it('should search products by name', async () => {
        const res = await request(app).get('/api/v1/product?search=Product 1')

        expect(res.status).toBe(200)
        expect(res.body.data.products.length).toBeGreaterThan(0)
        expect(res.body.data.products.every((p: any) => p.name.includes('Product 1'))).toBe(true)
    })

    it('should combine search and category filter', async () => {
        const res = await request(app).get(
            `/api/v1/product?search=Product&category=${categories[1].name}`
        )

        expect(res.status).toBe(200)
        expect(
            res.body.data.products.every((p: any) => {
                return (
                    p.name.includes('Product') &&
                    p.categories?.some((c: any) => c.name === categories[1].name)
                )
            })
        ).toBe(true)
    })

    it('should handle custom page limit', async () => {
        const res = await request(app).get('/api/v1/product?page=1&limit=5')

        expect(res.status).toBe(200)
        expect(res.body.data.products).toHaveLength(5)
        expect(res.body.data.pagination.limit).toBe(5)
        expect(res.body.data.pagination.pages).toBe(6)
    })

    it('should return empty array for page beyond available data', async () => {
        const res = await request(app).get('/api/v1/product?page=100&limit=10')

        expect(res.status).toBe(200)
        expect(res.body.data.products).toHaveLength(0)
        expect(res.body.data.pagination.total).toBe(30)
        expect(res.body.data.pagination.page).toBe(100)
    })

    it('should return empty array when searching for non-existent products', async () => {
        const res = await request(app).get('/api/v1/product?search=NonExistentProduct123')

        expect(res.status).toBe(200)
        expect(res.body.data.products).toHaveLength(0)
    })

    it('should handle pagination with category filter', async () => {
        const res = await request(app).get(
            `/api/v1/product?category=${categories[2].id}&page=1&limit=5`
        )

        expect(res.status).toBe(200)
        expect(res.body.data.products).toHaveLength(5)
        expect(
            res.body.data.products.every((p: any) =>
                p.categories?.some((c: any) => c.name === categories[2].name)
            )
        ).toBe(true)
    })
})
