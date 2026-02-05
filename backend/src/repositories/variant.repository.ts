import { Variant } from '../generated/prisma/client'
import prisma from '../lib/prisma'

interface updateVariantData {
    label?: string
    description?: string
    priceModifier?: number
}

class VariantRepository {
    static async updateVariant(id: string, variantData: updateVariantData) {
        return await prisma.variant.update({
            where: { id },
            data: variantData,
        })
    }

    static async findById(id: string) {
        return await prisma.variant.findUnique({
            where: { id },
        })
    }

    static async deleteVariant(id: string) {
        return await prisma.$transaction(async (tx) => {
            await tx.deal.updateMany({
                where: {
                    dealItems: {
                        some: {
                            productVariantId: id,
                        },
                    },
                },
                data: {
                    deletedAt: new Date(),
                },
            })

            return await tx.variant.update({
                where: { id },
                data: {
                    deletedAt: new Date(),
                },
            })
        })
    }
}

export default VariantRepository
