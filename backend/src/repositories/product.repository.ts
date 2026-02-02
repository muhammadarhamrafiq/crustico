import prisma from '../lib/prisma'
import type { createProductInput } from '../schemas/productValidation.schemas'

interface UpdateProductData {
    name?: string
    sku?: string
    slug?: string
    basePrice?: number
    description?: string
    image?: string
}

class ProductRepo {
    static async createProduct(data: createProductInput) {
        const product = await prisma.product.create({
            data: {
                name: data.name,
                sku: data.sku,
                slug: data.slug,
                basePrice: data.basePrice,
                description: data.description,
                image: data.image,
                variants: data.variants
                    ? {
                          create: data.variants,
                      }
                    : {},
                productCategories: data.categoryIds
                    ? {
                          create: data.categoryIds.map((categoryId) => ({
                              categoryId: categoryId,
                          })),
                      }
                    : {},
            },
            include: {
                variants: true,
                productCategories: true,
            },
        })
        return product
    }

    static async updateProduct(id: string, data: UpdateProductData) {
        const updatedProduct = await prisma.product.update({
            where: {
                id: id,
            },
            data,
        })

        return updatedProduct
    }

    static async validateUniqueConstraints(name: string, sku: string, slug: string) {
        const errors: string[] = []

        const productByName = await ProductRepo.findByName(name)
        const productBySku = await ProductRepo.findBySku(sku)
        const productBySlug = await ProductRepo.findBySlug(slug)

        if (productByName) errors.push('name')
        if (productBySku) errors.push('sku')
        if (productBySlug) errors.push('slug')

        return errors
    }

    static async findByName(name: string) {
        return await prisma.product.findUnique({
            where: { name },
        })
    }
    static async findBySku(sku: string) {
        return await prisma.product.findUnique({
            where: { sku },
        })
    }
    static async findBySlug(slug: string) {
        return await prisma.product.findUnique({
            where: { slug },
        })
    }
    static async findById(id: string) {
        return await prisma.product.findUnique({
            where: {
                id,
            },
        })
    }
}

export default ProductRepo
