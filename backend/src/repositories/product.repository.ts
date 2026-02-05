import { ProductWhereInput } from '../generated/prisma/models'
import prisma from '../lib/prisma'
import type {
    addProductVariantsInput,
    createProductInput,
} from '../schemas/productValidation.schemas'

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
            include: {
                variants: {
                    where: {
                        deletedAt: null,
                    },
                },
                productCategories: {
                    where: {
                        category: {
                            deletedAt: null,
                        },
                    },
                    include: {
                        category: true,
                    },
                },
            },
        })
    }

    static async addCategories(id: string, categoryIds: string[]) {
        return await prisma.product.update({
            where: { id },
            data: {
                productCategories: {
                    createMany: {
                        data: categoryIds.map((categoryId) => ({ categoryId })),
                    },
                },
            },
            include: {
                productCategories: true,
            },
        })
    }

    static async removeCategory(id: string, categoryId: string) {
        return await prisma.product.update({
            where: { id },
            data: {
                productCategories: {
                    delete: {
                        category_product_pkey: {
                            productId: id,
                            categoryId: categoryId,
                        },
                    },
                },
            },
            include: {
                productCategories: true,
            },
        })
    }
    static async findByProductAndCategory(productId: string, categoryId: string) {
        return await prisma.categoryProduct.findUnique({
            where: {
                category_product_pkey: {
                    productId,
                    categoryId,
                },
            },
        })
    }

    static async findVariantByLabel(productId: string, label: string) {
        return await prisma.variant.findUnique({
            where: {
                productId_label: {
                    productId,
                    label,
                },
            },
        })
    }
    static async addVariants(id: string, variants: addProductVariantsInput) {
        return await prisma.product.update({
            where: { id },
            data: {
                variants: {
                    createMany: {
                        data: variants,
                    },
                },
            },
            include: {
                variants: true,
            },
        })
    }

    static async deleteProduct(id: string) {
        return await prisma.$transaction(async (tx) => {
            const date = new Date()
            await tx.variant.updateMany({
                where: { productId: id },
                data: { deletedAt: date },
            })
            await tx.deal.updateMany({
                where: {
                    dealItems: {
                        some: {
                            productId: id,
                        },
                    },
                },
                data: { deletedAt: date },
            })
            return await tx.product.update({
                where: { id },
                data: {
                    deletedAt: date,
                },
            })
        })
    }

    static async findAll(where: ProductWhereInput, page: number, limit: number) {
        return await prisma.product.findMany({
            where: {
                ...where,
                deletedAt: null,
            },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                variants: {
                    where: {
                        deletedAt: null,
                    },
                },
                productCategories: {
                    where: {
                        category: {
                            deletedAt: null,
                        },
                    },
                    include: {
                        category: true,
                    },
                },
            },
            skip: (page - 1) * limit,
            take: limit,
        })
    }

    static async countAll(where: ProductWhereInput) {
        return await prisma.product.count({
            where: {
                ...where,
                deletedAt: null,
            },
        })
    }
}
export default ProductRepo
