import prisma from '../lib/prisma'

class DealsRepository {
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
}

export default DealsRepository
