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
            throw new Error('Expected error for duplicate name not thrown')
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
            throw new Error('Expected error for duplicate name not thrown')
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
