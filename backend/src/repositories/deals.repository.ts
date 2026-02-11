import type { DealUpdateInput } from '../generated/prisma/models'
import prisma from '../lib/prisma'
import { createDealInput } from '../schemas/dealsValidation.schemas'

class DealsRepository {
    static async create(data: createDealInput) {
        return await prisma.deal.create({
            data: {
                name: data.name,
                description: data.description,
                slug: data.slug,
                priceModifier: data.priceModifier,
                startDate: data.startDate,
                endDate: data.endDate,
                dealItems: data.items && {
                    createMany: {
                        data: data.items.map((item) => ({
                            productId: item.productId,
                            productVariantId: item.productVariantId,
                            quantity: item.quantity,
                        })),
                    },
                },
            },
        })
    }

    static async update(id: string, data: DealUpdateInput) {
        return await prisma.deal.update({
            where: { id },
            data,
        })
    }

    static async countDealsWithVariant(variantId: string) {
        return await prisma.deal.count({
            where: {
                AND: {
                    dealItems: {
                        some: {
                            productVariantId: variantId,
                        },
                    },
                    deletedAt: null,
                },
            },
        })
    }

    static async countDealsWithProduct(productId: string) {
        return await prisma.deal.count({
            where: {
                AND: {
                    dealItems: {
                        some: {
                            productId: productId,
                        },
                    },
                    deletedAt: null,
                },
            },
        })
    }

    static async findById(id: string) {
        return await prisma.deal.findUnique({
            where: { id, deletedAt: null },
            include: {
                dealItems: true,
            },
        })
    }

    static async addItems(
        id: string,
        items: { productId: string; productVariantId: string | null; quantity: number }[]
    ) {
        return await prisma.deal.update({
            where: { id },
            data: {
                dealItems: {
                    createMany: {
                        data: items,
                    },
                },
            },
            include: {
                dealItems: true,
            },
        })
    }

    static async removeItem(id: string, productId: string, productVariantId: string | null) {
        return await prisma.deal.update({
            where: { id },
            data: {
                dealItems: {
                    deleteMany: {
                        productId: productId,
                        productVariantId: productVariantId,
                    },
                },
            },
            include: {
                dealItems: true,
            },
        })
    }

    static async findAll() {
        return await prisma.deal.findMany({
            where: {
                deletedAt: null,
            },
        })
    }

    static async delete(id: string) {
        return await prisma.deal.update({
            where: { id },
            data: {
                deletedAt: new Date(),
            },
        })
    }
}

export default DealsRepository
