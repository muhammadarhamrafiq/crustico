import prisma from '../lib/prisma'
import { categoryInput } from '../schemas/categoryValidation.schema'

class CategoryRepository {
    static async create(data: categoryInput) {
        return await prisma.category.create({
            data: {
                name: data.name,
                description: data.description,
                slug: data.slug,
            },
        })
    }

    static async getAll() {
        return await prisma.category.findMany({
            where: {
                deletedAt: null,
            },
        })
    }

    static async findById(id: string) {
        return await prisma.category.findUnique({
            where: {
                id,
                deletedAt: null,
            },
        })
    }

    static async update(id: string, data: categoryInput) {
        return await prisma.category.update({
            where: {
                id,
            },
            data: {
                name: data.name,
                slug: data.slug,
                description: data.description,
            },
        })
    }

    static async delete(id: string) {
        return await prisma.category.delete({
            where: {
                id,
            },
        })
    }
}

export default CategoryRepository
