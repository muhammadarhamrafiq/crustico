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
}

export default DealsRepository
