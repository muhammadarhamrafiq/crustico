import app from '../../src/app'
import request from 'supertest'
import { resetDatabase } from '../db'
import prisma from '../../src/lib/prisma'
import { describe, beforeAll, it, expect } from 'vitest'

describe('POST /categories/add', () => {
    beforeAll(async () => {
        await resetDatabase()
        await prisma.category.create({
            data: {
                name: 'Existing Category',
                description: 'This category already exists',
                slug: 'existing-category',
            },
        })
    })

    it('should return correct response for invalid input', async () => {
        const response = await request(app).post('/categories/add').send({
            name: '',
            description: 'A category with an empty name',
            slug: 'empty-name-category',
        })

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('Name is required and must be a non-empty string.')
    })

    it('should return correct response for uniquess failure', async () => {
        const response = await request(app).post('/categories/add').send({
            name: 'Existing Category',
            description: 'Trying to create a category with a duplicate name',
            slug: 'existing-category-duplicate',
        })

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('name already exist in Category')
    })

    it('should create a new category successfully', async () => {
        const response = await request(app).post('/categories/add').send({
            name: 'New Category',
            description: 'A new category for testing',
            slug: 'new-category',
        })

        expect(response.status).toBe(201)
        expect(response.body).toHaveProperty('data')
        expect(response.body.data).toHaveProperty('id')
        expect(response.body.data.name).toBe('New Category')
        expect(response.body.data.description).toBe('A new category for testing')
        expect(response.body.data.slug).toBe('new-category')
    })
})

describe('GET /categories', () => {
    beforeAll(async () => {
        await resetDatabase()
        await prisma.category.createMany({
            data: [
                { name: 'Category 1', description: 'First category', slug: 'category-1' },
                { name: 'Category 2', description: 'Second category', slug: 'category-2' },
                { name: 'Category 3', description: 'Third category', slug: 'category-3' },
            ],
        })
    })

    it('should return a list of categories', async () => {
        const response = await request(app).get('/categories')
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('data')
        expect(Array.isArray(response.body.data)).toBe(true)
        expect(response.body.data.length).toBe(3)
        expect(response.body.data[0]).toHaveProperty('id')
        expect(response.body.data[0]).toHaveProperty('name')
        expect(response.body.data[0]).toHaveProperty('description')
        expect(response.body.data[0]).toHaveProperty('slug')
    })
})

describe('GET /categories/:id', () => {
    let categoryId: string

    beforeAll(async () => {
        await resetDatabase()
        const category = await prisma.category.create({
            data: {
                name: 'Test Category',
                description: 'A category for testing GET by ID',
                slug: 'test-category',
            },
        })
        categoryId = category.id
    })

    it('should return the category for a valid ID', async () => {
        const response = await request(app).get(`/categories/${categoryId}`)
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('data')
        expect(response.body.data).toHaveProperty('id', categoryId)
        expect(response.body.data).toHaveProperty('name', 'Test Category')
        expect(response.body.data).toHaveProperty('description', 'A category for testing GET by ID')
        expect(response.body.data).toHaveProperty('slug', 'test-category')
        expect(response.body.data).toHaveProperty('products')
    })

    it('should return 404 for a non-existent ID', async () => {
        const response = await request(app).get('/categories/9999')
        expect(response.status).toBe(404)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('Category not found')
    })
})

describe('PUT /categories/:id', () => {
    let categoryId: string

    beforeAll(async () => {
        await resetDatabase()
        await prisma.category.create({
            data: {
                name: 'Another Category',
                description: 'Another category for testing uniqueness',
                slug: 'another-category',
            },
        })
        const category = await prisma.category.create({
            data: {
                name: 'Update Test Category',
                description: 'A category for testing updates',
                slug: 'update-test-category',
            },
        })
        categoryId = category.id
    })

    it('should update the category successfully', async () => {
        const response = await request(app).put(`/categories/${categoryId}`).send({
            name: 'Updated Category Name',
            description: 'Updated description for the category',
            slug: 'updated-category-name',
        })
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('data')
        expect(response.body.data).toHaveProperty('id', categoryId)
        expect(response.body.data).toHaveProperty('name', 'Updated Category Name')
        expect(response.body.data).toHaveProperty(
            'description',
            'Updated description for the category'
        )
        expect(response.body.data).toHaveProperty('slug', 'updated-category-name')
    })

    it('should return 404 for a non-existent ID', async () => {
        const response = await request(app).put('/categories/9999').send({
            name: 'Non-existent Category',
            description: 'Trying to update a category that does not exist',
            slug: 'non-existent-category',
        })
        expect(response.status).toBe(404)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('Category not found')
    })

    it('should return 400 for invalid input', async () => {
        const response = await request(app).put(`/categories/${categoryId}`).send({
            name: '',
            description: 'Trying to update with an empty name',
            slug: 'invalid-update-category',
        })
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('Name is required and must be a non-empty string.')
    })

    it('should return 400 for uniqueness failure', async () => {
        const response = await request(app).put(`/categories/${categoryId}`).send({
            name: 'Another Category', // This name already exists
            description: 'Trying to update with a duplicate name',
            slug: 'duplicate-name-update',
        })
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('name already exist in Category')
    })
})

describe('DELETE /categories/:id', () => {
    let categoryId: string

    beforeAll(async () => {
        await resetDatabase()
        const category = await prisma.category.create({
            data: {
                name: 'Delete Test Category',
                description: 'A category for testing deletion',
                slug: 'delete-test-category',
            },
        })
        categoryId = category.id
    })
    it('should delete the category successfully', async () => {
        const response = await request(app).delete(`/categories/${categoryId}`)
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('data')
        expect(response.body.data).toHaveProperty('id', categoryId)
        expect(response.body.data).toHaveProperty('name', 'Delete Test Category')
        expect(response.body.data).toHaveProperty('description', 'A category for testing deletion')
        expect(response.body.data).toHaveProperty('slug', 'delete-test-category')
    })

    it('should return 404 for a non-existent ID', async () => {
        const response = await request(app).delete('/categories/9999')
        expect(response.status).toBe(404)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('Category not found')
    })
})
