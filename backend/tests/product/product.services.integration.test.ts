import { describe, it, expect, beforeEach } from 'vitest'
import ProductService from '../../src/services/products.services'
import { resetDatabase } from '../db'
import prisma from '../../src/lib/prisma'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client'

beforeEach(async () => {
    await resetDatabase()
})

describe('Create Product Service', () => {
    it('should validate the name field uniquess', async () => {
        await prisma.product.create({
            data: {
                name: 'Unique Product',
                description: 'A unique product description',
                basePrice: 200,
                sku: 'UNIQ-001',
                slug: 'unique-product',
            },
        })
        const productData = {
            name: 'Unique Product',
            description: 'Another product description',
            basePrice: 250,
            sku: 'UNIQ-002',
            slug: 'another-unique-product',
            image: '',
        }
        try {
            await ProductService.createProduct(productData)
            throw new Error('Expected error for duplicate name not thrown')
        } catch (error) {
            expect(error).toBeInstanceOf(PrismaClientKnownRequestError)
            expect((error as PrismaClientKnownRequestError).code).toBe('P2002')
        }
    })

    it('should validate the sku field uniqueness', async () => {
        await prisma.product.create({
            data: {
                name: 'Product One',
                description: 'First product description',
                basePrice: 150,
                sku: 'DUPL-001',
                slug: 'product-one',
            },
        })
        const productData = {
            name: 'Product Two',
            description: 'Second product description',
            basePrice: 180,
            sku: 'DUPL-001',
            slug: 'product-two',
            image: '',
        }
        try {
            await ProductService.createProduct(productData)
            throw new Error('Expected error for duplicate slug not thrown')
        } catch (error) {
            expect(error).toBeInstanceOf(PrismaClientKnownRequestError)
            expect((error as PrismaClientKnownRequestError).code).toBe('P2002')
        }
    })

    it('should validate the slug field uniqueness', async () => {
        await prisma.product.create({
            data: {
                name: 'Product Alpha',
                description: 'Alpha product description',
                basePrice: 300,
                sku: 'ALPH-001',
                slug: 'product-alpha',
            },
        })
        const productData = {
            name: 'Product Beta',
            description: 'Beta product description',
            basePrice: 320,
            sku: 'BETA-001',
            slug: 'product-alpha',
            image: '',
        }
        try {
            await ProductService.createProduct(productData)
            throw new Error('Expected error for duplicate slug not thrown')
        } catch (error) {
            expect(error).toBeInstanceOf(PrismaClientKnownRequestError)
            expect((error as PrismaClientKnownRequestError).code).toBe('P2002')
        }
    })

    it('should validate all the categories exist', async () => {
        const category = await prisma.category.create({
            data: { name: 'Electronics', slug: 'electronics' },
        })
        const productData = {
            name: 'Product Gamma',
            description: 'Gamma product description',
            basePrice: 400,
            sku: 'GAMM-001',
            slug: 'product-gamma',
            image: '',
            categoryIds: [category.id, 'non-existend-category-id'],
        }

        try {
            await ProductService.createProduct(productData)
            throw new Error('Expected error for duplicate name not thrown')
        } catch (error) {
            expect(error).toBeInstanceOf(PrismaClientKnownRequestError)
            expect((error as PrismaClientKnownRequestError).code).toBe('P2003')
        }
    })

    it('should create product successfully and return the created product', async () => {
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
            sku: 'DELT-001',
            slug: 'product-delta',
            image: '',
            categoryIds: [category1.id, category2.id],
            variants: [
                {
                    label: 'Hardcover',
                    priceModifier: 20,
                    description: 'Hardcover edition',
                },
                {
                    label: 'Paperback',
                    priceModifier: 0,
                    description: 'Paperback edition',
                },
            ],
        }
        const createdProduct = await ProductService.createProduct(productData)

        expect(createdProduct).toHaveProperty('id')
        expect(createdProduct.name).toBe(productData.name)
        expect(createdProduct.sku).toBe(productData.sku)
        expect(createdProduct.slug).toBe(productData.slug)
        expect(createdProduct.variants).toHaveLength(2)
        expect(createdProduct.productCategories).toHaveLength(2)
    })
})

describe('Update Product Service', () => {
    it('should validate uniqueness on update', async () => {
        const product = await prisma.product.create({
            data: {
                name: 'Product A',
                description: 'Description A',
                basePrice: 100,
                sku: 'PROD-A',
                slug: 'product-a',
            },
        })

        await prisma.product.create({
            data: {
                name: 'Product B',
                description: 'Description B',
                basePrice: 150,
                sku: 'PROD-B',
                slug: 'product-b',
            },
        })

        try {
            await ProductService.updateProduct(product.id, {
                name: 'Product B',
            })
            throw new Error('Expected error for duplicate name not thrown')
        } catch (error) {
            expect(error).toBeInstanceOf(PrismaClientKnownRequestError)
            expect((error as PrismaClientKnownRequestError).code).toBe('P2002')
        }
    })

    it('should capable of partial updates', async () => {
        const product = await prisma.product.create({
            data: {
                name: 'Product X',
                description: 'Product Description',
                sku: 'PROD-X',
                slug: 'product-x',
                basePrice: 300,
                image: 'uploads/tmp/random-uuid.jpg',
            },
        })

        const updatedProduct = await ProductService.updateProduct(product.id, {
            name: 'Product Y',
        })

        expect(updatedProduct.id).toBe(product.id)
        expect(updatedProduct.name).toBe('Product Y')
        expect(updatedProduct.image).toBe('uploads/tmp/random-uuid.jpg')
    })

    it('should update product successfully and return the updated product', async () => {
        const product = await prisma.product.create({
            data: {
                name: 'Product B',
                description: 'Product Description',
                sku: 'PRO-001-A',
                slug: 'product-b',
                basePrice: 190,
                image: ' ',
            },
        })

        const updatedProduct = await ProductService.updateProduct(product.id, {
            name: 'Updated Product',
            basePrice: 100,
            description: 'Updated Description',
            sku: 'UPD-001',
            slug: 'updated-slug',
        })

        expect(updatedProduct.id).toBe(product.id)
        expect(updatedProduct.name).toBe('Updated Product')
        expect(updatedProduct.slug).toBe('updated-slug')
        expect(updatedProduct.description).toBe('Updated Description')
        expect(updatedProduct.sku).toBe('UPD-001')
    })
})
