import prisma from '../lib/prisma'

class DealsRepository {
    static async findByVariantId(variantId: string) {
        return await prisma.deal.findMany({
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
}

export default DealsRepository
